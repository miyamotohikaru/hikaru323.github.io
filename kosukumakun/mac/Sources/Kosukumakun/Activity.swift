import AppKit
import CoreGraphics
import Foundation

/// 権限を一切要求しない入力センサ。
///
/// `CGEventSource.secondsSinceLastEventType` は「その種類のイベントが最後に起きてから何秒か」
/// しか返さない。**キーの中身は取得できない**ので、キーロガーには原理的になり得ないし、
/// アクセシビリティ権限も入力監視権限も要らない（＝会社のMacで許可ダイアログが出ない）。
///
/// ここから作れるのは「打っているか / どれくらい速いか / 放置しているか」だけ。
/// こすくまくんが反応するのに必要なのはそれで十分。
final class Activity {

    /// だいたいの打鍵数/秒（直近2秒の移動平均）
    private(set) var typingRate: CGFloat = 0
    /// 起動してからの打鍵回数。**1文字打つごとに1増える。**
    /// 足踏みをこれに合わせると「自分の打つ速さでカチカチする」ようになる。
    private(set) var strokes: Int = 0
    /// 何も操作していない秒数
    private(set) var idle: CGFloat = 0
    /// 直近にスクロールしたか
    private(set) var scrolledRecently = false
    /// スクロールの向き（+1 上 / -1 下 / 0 不明）。
    /// 向きは権限なしで取れるとは限らないので、**取れたら使う** という扱いにする。
    /// 取れない環境では 0 のままで、こすくまくんは向き無しの反応をする。
    private(set) var scrollDir = 0
    /// まだ使っていないスクロール量。動いた距離のぶんだけ梅干しを転がすのに使う。
    /// 取れない環境では 0 のままなので、そのときは一定の速さで転がす。
    private var scrollAccum: CGFloat = 0
    private var scrollMonitor: Any?

    /// たまっているスクロール量を受け取って空にする
    func consumeScroll() -> CGFloat {
        let v = scrollAccum
        scrollAccum = 0
        return v
    }
    /// カーソル速度 pt/s
    private(set) var pointerSpeed: CGFloat = 0
    private(set) var pointer: CGPoint = .zero

    private var lastKeyStamp: Double = -1
    private var lastScrollStamp: Double = -1
    private var keyEvents: [Double] = []
    private var prevPointer: CGPoint?
    private var idleScan: CGFloat = 0

    private static let watched: [CGEventType] = [
        .keyDown, .flagsChanged, .mouseMoved, .leftMouseDown, .rightMouseDown, .scrollWheel,
    ]

    init() {
        // スクロールの向きを拾えるなら拾う。キーボードと違い、
        // ホイールの監視はアクセシビリティの許可を求めない（取れない環境なら黙って諦める）。
        scrollMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.scrollWheel]) { [weak self] e in
            let dy = e.hasPreciseScrollingDeltas ? e.scrollingDeltaY : e.deltaY
            guard abs(dy) > 0.5 else { return }
            self?.scrollDir = dy > 0 ? 1 : -1
            self?.scrollDirAt = CACurrentMediaTime()
            // ホイールは1行あたりの値が環境で違うので、細かい指スクロールと
            // カチカチのホイールが同じくらいになるよう桁を揃える
            let step = e.hasPreciseScrollingDeltas ? dy : dy * 10
            self?.scrollAccum += step
        }
    }

    private var scrollDirAt: Double = 0

    func update(dt: CGFloat, now: Double) {
        // 向きは 0.4秒で忘れる（押しっぱなしに見えないように）
        if now - scrollDirAt > 0.4 { scrollDir = 0 }

        // --- 打鍵 -------------------------------------------------------
        let sinceKey = Double(CGEventSource.secondsSinceLastEventType(.combinedSessionState,
                                                                     eventType: .keyDown))
        let keyStamp = now - sinceKey
        if lastKeyStamp < 0 { lastKeyStamp = keyStamp }
        if keyStamp > lastKeyStamp + 0.004 {          // 新しい打鍵があった
            keyEvents.append(keyStamp)
            lastKeyStamp = keyStamp
            strokes += 1
        }
        keyEvents.removeAll { now - $0 > 2.0 }
        let rate = CGFloat(keyEvents.count) / 2.0
        typingRate = approach(typingRate, rate, rate: 6, dt: dt)

        // --- スクロール -------------------------------------------------
        if idleScan >= 0.11 {      // 上の間引きに相乗り
            let sinceScroll = Double(CGEventSource.secondsSinceLastEventType(
                .combinedSessionState, eventType: .scrollWheel))
            scrolledRecently = sinceScroll < 0.12
            lastScrollStamp = now - sinceScroll
        }

        // --- 放置時間 ---------------------------------------------------
        // 6種類ぶん問い合わせるので、毎フレームやると（60fpsで毎秒360回）
        // これだけでCPUを数%食う。放置時間は0.1秒の精度も要らないので間引く。
        idleScan -= dt
        if idleScan <= 0 {
            idleScan = 0.12
            var minSince = Double.greatestFiniteMagnitude
            for t in Activity.watched {
                minSince = min(minSince, Double(CGEventSource.secondsSinceLastEventType(
                    .combinedSessionState, eventType: t)))
            }
            idle = CGFloat(minSince)
        } else {
            idle += dt
        }

        // --- カーソル ---------------------------------------------------
        let p = NSEvent.mouseLocation
        if let prev = prevPointer, dt > 0 {
            let d = hypot(p.x - prev.x, p.y - prev.y)
            pointerSpeed = approach(pointerSpeed, d / dt, rate: 10, dt: dt)
        }
        prevPointer = p
        pointer = p
    }

    /// 検証用。実際の入力の代わりに値を差し込む（--snapshot-fx でしか使わない）。
    func debugOverride(typingRate: CGFloat, idle: CGFloat = 0, pointer: CGPoint = .zero,
                       stroke: Bool = false, scrolling: Bool = false, scrollDir: Int = 0) {
        self.typingRate = typingRate
        self.idle = idle
        self.pointer = pointer
        if stroke { strokes += 1 }
        self.scrolledRecently = scrolling
        self.scrollDir = scrollDir
    }

    /// 打ちすぎ判定（オーバーヒート）
    var isHammering: Bool { typingRate > 6.5 }
    var isTyping: Bool { typingRate > 0.7 }
}
