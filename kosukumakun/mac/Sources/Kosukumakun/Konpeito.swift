import AppKit

/// たまに空から金平糖がころんと降ってくる、小さな出来事。
///
/// こすくまくんには口がない。だから「食べる」画は作れないし、作ってもいけない。
/// 両手で抱えると体にじんわり染み込んで、ぽわっと光って星が飛ぶ ——
/// 口を描かずに「うれしい」を成立させるための筋書きがこれ。
/// 感情を運ぶのは目（.wide →少し間をおいて .happy）と、金平糖そのものの動きだけ。
///
/// 仕事の邪魔をしないための約束:
///  - 打鍵中・つままれている間・寝ている間は絶対に始めない
///  - 待っている間（＝ほぼ全部の時間）はレイヤを隠したまま、タイマーの引き算しかしない
///  - 星は8個を使い回す。演出中に確保は起きないし、同時に8個を超えられない
///
/// 座標はすべてステージ座標（Y上向き・左下原点）。こすくまくんは窓の中で動かず、
/// 窓のほうが動くので、ここに置いたものは自然と本体にくっついて回る。
/// 途中でぽてぽて跳ね始めても金平糖は本体との位置関係を保ったままなので、中断はしない。
final class KonpeitoBehavior: PetBehavior {

    // MARK: - 差し込み口

    /// めったに起きない出来事なので、常時動いているふるまいより先に手を挙げておく
    let priority = 60

    /// いま演出中か。他のふるまいが遠慮したい時に見る目印
    private(set) var isPerforming = false

    /// 次に降ってくるまでの間隔。KOSU_KONPEITO_FAST=1 で見た目の確認用に短くできる
    private let interval: ClosedRange<CGFloat>

    init() {
        let fast = ProcessInfo.processInfo.environment["KOSU_KONPEITO_FAST"] == "1"
        interval = fast ? 6...12 : 240...540      // ふだんは4〜9分に1回
        wait = CGFloat.random(in: interval)
    }

    // MARK: - 演出の段取り

    private enum Phase {
        case waiting        // 何もしていない。ここが時間のほぼ全部
        case falling        // 空から落ちてくる
        case notice         // こすくまくんが気づくまでの間
        case rising         // ふわっと顔の高さへ
        case hug            // 両手で抱えて胸元へ
        case soak           // 体に染み込んで消える
        case afterglow      // 余韻
        case fadeout        // 中断（つままれた・寝てしまった）
    }

    private static let fallGravity: CGFloat = 520     // ふわっと落ちてほしいので本体の重力より弱い
    private static let restitution: CGFloat = 0.32    // 「ぽん」と一度跳ねるくらいの弾み
    private static let settleSpeed: CGFloat = 140     // これ以下の勢いならもう跳ねない
    private static let noticeTime: CGFloat = 0.55     // 目を丸くしてから、ほころぶまでの間
    private static let riseTime: CGFloat = 0.95
    private static let hugTime: CGFloat = 0.45
    private static let soakTime: CGFloat = 0.75
    private static let afterTime: CGFloat = 1.8
    private static let fadeTime: CGFloat = 0.25
    private static let calmNeeded: CGFloat = 1.2      // 静かになってから、これだけ様子を見る
    private static let maxSparks = 8

    /// 金平糖の色。体色(#FAFAD3)と被らない淡い4色から選ぶ
    private static let palette: [CGColor] = [
        NSColor(srgbRed: 0xF5 / 255, green: 0xB8 / 255, blue: 0xC4 / 255, alpha: 1).cgColor,  // 薄いピンク
        NSColor(srgbRed: 0xAF / 255, green: 0xD3 / 255, blue: 0xE8 / 255, alpha: 1).cgColor,  // 淡い水色
        NSColor(srgbRed: 0xF6 / 255, green: 0xE7 / 255, blue: 0xA6 / 255, alpha: 1).cgColor,  // 淡い黄
        NSColor(srgbRed: 1, green: 1, blue: 1, alpha: 1).cgColor,                             // 白
    ]

    // MARK: - 状態

    private var phase: Phase = .waiting
    private var t: CGFloat = 0            // 今のフェーズの経過秒
    private var wait: CGFloat = 0         // 次に降ってくるまで
    private var calm: CGFloat = 0         // 静かな時間が続いている秒数

    private var pos = CGPoint.zero        // 金平糖の中心
    private var vel = CGVector.zero
    private var rot: CGFloat = 0
    private var spin: CGFloat = 0
    private var scale: CGFloat = 1
    private var alpha: CGFloat = 1
    private var from = CGPoint.zero       // 補間の始点
    private var side: CGFloat = 1         // 落ちてくる側（+1=右）
    private var rootAlpha: CGFloat = 1
    private var colorIndex = 0
    private var sparksLeft = 0            // これから出す星の数
    private var sparkDelay: CGFloat = 0

    // MARK: - レイヤ

    private weak var host: EffectHost?
    private var root: CALayer?
    private var candyLayer: CAShapeLayer?
    private var haloLayer: CAShapeLayer?
    private var sparkLayers: [CAShapeLayer] = []
    private var sparks: [Spark] = []
    private var builtHeight: CGFloat = -1

    /// きらきら1粒ぶん。8個の配列を使い回すので、演出中に確保は起きない
    private struct Spark {
        var life: CGFloat = 0             // 残り寿命
        var span: CGFloat = 1             // 全寿命
        var p = CGPoint.zero
        var v = CGVector.zero
        var rot: CGFloat = 0
        var spin: CGFloat = 0
        var size: CGFloat = 1
        var alive: Bool { life > 0 }
    }

    // MARK: - 毎フレーム

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        // 外部モニタの抜き差し等でビューが作り直されたら、前のレイヤは捨てる
        if let h = brain.host, h !== host {
            teardown()
            host = h
        }
        guard let host = host else { return }

        // 待っている間はレイヤに一切さわらない。ここが軽いことが何より大事
        if phase == .waiting {
            updateWaiting(dt, brain, activity)
            return
        }

        if phase != .fadeout, shouldAbort(brain) { beginFadeout() }

        t += dt
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        advance(dt: dt, host: host, brain: brain)
        updateSparks(dt)
        applyLayers(host)
        CATransaction.commit()
    }

    // MARK: - 待つ

    private func updateWaiting(_ dt: CGFloat, _ brain: Brain, _ a: Activity) {
        if wait > 0 { wait -= dt; return }
        // 時間が来ても、手が動いている最中なら降らせない。
        // 落ち着いた状態がしばらく続いて、はじめて1粒落とす
        if canStart(brain, a) {
            calm += dt
            if calm >= Self.calmNeeded { begin() }
        } else {
            calm = 0
        }
    }

    private func canStart(_ brain: Brain, _ a: Activity) -> Bool {
        guard let h = host else { return false }
        guard brain.state == .idle, !brain.isAsleep else { return false }   // 跳ねている最中も落とさない
        guard !a.isTyping, !a.scrolledRecently else { return false }        // 作業中に割り込まない
        guard brain.thought == nil else { return false }                    // 別のふるまいが心の声を出していたら譲る
        return h.petHeight > 1 && h.footInStage.y > 1                       // 初回描画前は座標がまだ入っていない
    }

    private func shouldAbort(_ brain: Brain) -> Bool {
        brain.state == .drag || brain.state == .thrown || brain.isAsleep
    }

    // MARK: - 始める / 終わる

    /// メニューやデバッグから「いま1粒落とす」。条件を満たしていなければ何もしない
    @discardableResult
    func drop(_ brain: Brain) -> Bool {
        guard phase == .waiting, !shouldAbort(brain),
              let h = brain.host, h.petHeight > 1 else { return false }
        if h !== host { teardown(); host = h }
        begin()
        return true
    }

    private func begin() {
        guard let host = host else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        build(host)

        let h = host.petHeight
        let r = candyRadius(h)
        // 顔が向いている側に落とす。真後ろや真正面だと体で隠れて気づけない
        side = host.currentFrame.faceRight ? 1 : -1
        let landX = host.footInStage.x + side * h * 0.34

        vel = CGVector(dx: CGFloat.random(in: -14...14), dy: 0)
        // 落ちるのに約1秒かかるので、横流れのぶんだけ手前から落とすと足元に着く
        pos = CGPoint(x: landX - vel.dx, y: host.stageSize.height + r * 2)
        rot = CGFloat.random(in: 0...CGFloat.pi)
        spin = CGFloat.random(in: -2.2...2.2)
        scale = 1
        alpha = 1
        rootAlpha = 1
        sparksLeft = 0
        colorIndex = pickColor()
        paint()

        phase = .falling
        t = 0
        calm = 0
        isPerforming = true
        root?.isHidden = false
        applyLayers(host)                 // 出した瞬間から正しい位置にいるように
        CATransaction.commit()
    }

    private func finish(retry: Bool) {
        phase = .waiting
        t = 0
        calm = 0
        alpha = 0
        scale = 1
        rootAlpha = 1
        isPerforming = false
        for i in sparks.indices { sparks[i].life = 0 }
        root?.isHidden = true             // ここから先はレイヤに触らない
        // 中断した時は仕切り直し。次の1粒までを短めにして、また機会をうかがう
        wait = retry
            ? CGFloat.random(in: (interval.lowerBound * 0.25)...(interval.lowerBound * 0.6))
            : CGFloat.random(in: interval)
    }

    private func beginFadeout() {
        phase = .fadeout
        t = 0
        sparksLeft = 0
    }

    private func notice(_ brain: Brain) {
        phase = .notice
        t = 0
        brain.express(.wide, seconds: 0.5)     // 「あっ」。口がないので驚きは目が全部背負う
    }

    // MARK: - 筋書きを進める

    private func advance(dt: CGFloat, host: EffectHost, brain: Brain) {
        let h = host.petHeight
        let foot = host.footInStage
        let r = candyRadius(h)

        switch phase {
        case .waiting:
            break

        case .falling:
            vel.dy -= Self.fallGravity * dt
            pos.x += vel.dx * dt
            pos.y += vel.dy * dt
            rot += spin * dt

            let gy = foot.y + r * 0.85          // 影の高さに座らせる（地面にめり込ませない）
            if pos.y <= gy {
                pos.y = gy
                if vel.dy < -Self.settleSpeed {
                    vel.dy = -vel.dy * Self.restitution   // ぽん、と跳ねる
                    vel.dx *= 0.5
                    spin *= 0.45
                } else {
                    vel = .zero
                    spin *= 0.25
                    notice(brain)
                }
            }
            // 何かの拍子に落ち切らなくても、待たせっぱなしにはしない
            if phase == .falling, t > 3.2 { pos.y = gy; notice(brain) }

        case .notice:
            spin = approach(spin, 0, rate: 6, dt: dt)     // 転がりの余韻だけ残して止まる
            rot += spin * dt
            if t >= Self.noticeTime {
                brain.express(.happy, seconds: 1.8)       // ここでようやく目がほころぶ
                from = pos
                phase = .rising
                t = 0
            }

        case .rising:
            // ふわっと浮いて顔の高さへ。顔の真ん前だと目が隠れるので、少し横に置く
            let k = easeOutCubic(t / Self.riseTime)
            let target = CGPoint(x: foot.x + side * h * 0.27, y: host.facePoint.y)
            pos.x = lerp(from.x, target.x, k) + sin(t * 5.4) * r * 0.45 * (1 - k)
            pos.y = lerp(from.y, target.y, k)
            spin = approach(spin, 0, rate: 4, dt: dt)
            rot += spin * dt
            if t >= Self.riseTime {
                from = pos
                phase = .hug
                t = 0
            }

        case .hug:
            // 両手で抱えるように胸元へ。口には運ばない（無いので）
            let k = easeInOutSine(t / Self.hugTime)
            let target = CGPoint(x: foot.x, y: foot.y + h * 0.42)
            pos = CGPoint(x: lerp(from.x, target.x, k), y: lerp(from.y, target.y, k))
            if t >= Self.hugTime {
                phase = .soak
                t = 0
                sparksLeft = Int.random(in: 3...5)
                sparkDelay = 0
                brain.express(.happy, seconds: Self.soakTime + Self.afterTime)
            }

        case .soak:
            // じんわり染み込む。縮みが先、消えるのが少し後だと「吸い込まれた」ように見える
            let k = min(1, t / Self.soakTime)
            scale = 1 - easeOutCubic(k) * 0.86
            alpha = 1 - k * k
            pos.y -= h * 0.02 * dt / Self.soakTime        // ほんの少しだけ沈む

            sparkDelay -= dt
            if sparksLeft > 0, sparkDelay <= 0 {
                spawnSpark(host)
                sparksLeft -= 1
                sparkDelay = CGFloat.random(in: 0.05...0.12)   // ぜんぶ同時に出すと機械っぽい
            }
            if t >= Self.soakTime {
                alpha = 0
                phase = .afterglow
                t = 0
            }

        case .afterglow:
            if t >= Self.afterTime { finish(retry: false) }

        case .fadeout:
            rootAlpha = max(0, 1 - t / Self.fadeTime)
            if rootAlpha <= 0 { finish(retry: true) }
        }
    }

    // MARK: - きらきら

    private func spawnSpark(_ host: EffectHost) {
        guard let i = sparks.firstIndex(where: { !$0.alive }) else { return }   // 8個を超えない
        let h = host.petHeight
        let foot = host.footInStage
        let a = CGFloat.random(in: 0...(CGFloat.pi * 2))
        let rad = h * CGFloat.random(in: 0.20...0.34)
        var s = Spark()
        s.span = CGFloat.random(in: 0.85...1.25)
        s.life = s.span
        // 体のまわりに散らす。横は広く、縦は控えめにすると胸元から湧いたように見える
        s.p = CGPoint(x: foot.x + cos(a) * rad * 0.9,
                      y: foot.y + h * 0.44 + sin(a) * rad * 0.55)
        s.v = CGVector(dx: cos(a) * h * 0.06, dy: h * CGFloat.random(in: 0.16...0.28))
        s.rot = CGFloat.random(in: 0...(CGFloat.pi / 2))
        s.spin = CGFloat.random(in: -1.2...1.2)
        s.size = CGFloat.random(in: 0.7...1.15)
        sparks[i] = s
    }

    private func updateSparks(_ dt: CGFloat) {
        for i in sparks.indices where sparks[i].alive {
            sparks[i].life -= dt
            sparks[i].p.x += sparks[i].v.dx * dt
            sparks[i].p.y += sparks[i].v.dy * dt
            sparks[i].v.dy *= 1 - 0.9 * dt        // 上がるほどゆっくりになって、消える
            sparks[i].rot += sparks[i].spin * dt
        }
    }

    // MARK: - レイヤに反映

    private func applyLayers(_ host: EffectHost) {
        guard let root = root, let candy = candyLayer, let halo = haloLayer else { return }
        rebuildPaths(host)
        let h = host.petHeight

        root.opacity = Float(rootAlpha)

        candy.isHidden = alpha <= 0.01
        if !candy.isHidden {
            candy.position = pos
            candy.opacity = Float(alpha)
            candy.setAffineTransform(CGAffineTransform(rotationAngle: rot)
                                        .scaledBy(x: scale, y: scale))
        }

        // ぽわっと光る輪。染み込んでいる0.7秒だけなので、パスを毎フレーム作っても安い
        if phase == .soak {
            let k = min(1, t / Self.soakTime)
            let rr = lerp(h * 0.20, h * 0.50, easeOutCubic(k))
            let c = CGPoint(x: host.footInStage.x, y: host.footInStage.y + h * 0.44)
            halo.path = CGPath(ellipseIn: CGRect(x: c.x - rr, y: c.y - rr * 0.92,
                                                 width: rr * 2, height: rr * 1.84),
                               transform: nil)
            halo.lineWidth = h * 0.012
            halo.opacity = Float(0.5 * (1 - k) * (1 - k))
            halo.isHidden = false
        } else if !halo.isHidden {
            halo.isHidden = true
        }

        for (i, l) in sparkLayers.enumerated() {
            let s = sparks[i]
            guard s.alive else {
                if !l.isHidden { l.isHidden = true }
                continue
            }
            let k = 1 - s.life / s.span                  // 0=生まれたて 1=消える
            let pop = k < 0.25 ? easeOutCubic(k / 0.25) : 1 - (k - 0.25) * 0.45
            l.isHidden = false
            l.position = s.p
            l.opacity = Float(min(1, (1 - k) * 1.6))
            l.setAffineTransform(CGAffineTransform(rotationAngle: s.rot)
                                    .scaledBy(x: s.size * pop, y: s.size * pop))
        }
    }

    // MARK: - かたち

    private func candyRadius(_ h: CGFloat) -> CGFloat { h * 0.035 }   // 直径で身長の7%
    private func inkWidth(_ h: CGFloat) -> CGFloat { max(1, h * 0.015) }

    /// パスは表示サイズが変わった時だけ作り直す（ふだんは変わらないので実質1回）
    private func rebuildPaths(_ host: EffectHost) {
        let h = host.petHeight
        guard abs(h - builtHeight) > 0.5 else { return }
        builtHeight = h

        // 角10個・へこみ浅めで「ごつごつしているのに丸い」。
        // とがりを落としているのは lineJoin = .round のほう（黒の輪郭が角を丸めてくれる）
        let r = candyRadius(h)
        let box = r * 3                       // 回しても縮めても切れないよう広めに取る
        if let candy = candyLayer {
            candy.bounds = CGRect(x: 0, y: 0, width: box, height: box)
            candy.path = FX.star(center: CGPoint(x: box / 2, y: box / 2),
                                 radius: r, points: 10, inner: 0.72)
            candy.lineWidth = inkWidth(h)
        }

        let sr = h * 0.030                    // きらきらは4方向のシンプルな形
        let sbox = sr * 3
        for l in sparkLayers {
            l.bounds = CGRect(x: 0, y: 0, width: sbox, height: sbox)
            l.path = FX.star(center: CGPoint(x: sbox / 2, y: sbox / 2),
                             radius: sr, points: 4, inner: 0.28)
        }
    }

    private func pickColor() -> Int {
        var i = Int.random(in: 0..<Self.palette.count)
        if i == colorIndex { i = (i + 1) % Self.palette.count }   // 前回と同じ色は続けない
        return i
    }

    private func paint() {
        let c = Self.palette[colorIndex]
        candyLayer?.fillColor = c
        candyLayer?.strokeColor = Asset.ink       // 黒の輪郭。同じ絵に見えるための一番の要
        haloLayer?.strokeColor = c
        for l in sparkLayers { l.fillColor = c }
    }

    // MARK: - レイヤの用意と後片付け

    private func build(_ host: EffectHost) {
        if root == nil {
            let r = CALayer()
            r.frame = CGRect(origin: .zero, size: host.stageSize)
            r.actions = ["hidden": NSNull(), "opacity": NSNull(),
                         "position": NSNull(), "bounds": NSNull(), "sublayers": NSNull()]
            r.isHidden = true
            host.effectLayer.addSublayer(r)
            root = r

            // 奥から: 光の輪 → 金平糖 → きらきら
            let halo = FX.shape(host)
            halo.fillColor = nil
            halo.lineCap = .round
            halo.isHidden = true
            r.addSublayer(halo)
            haloLayer = halo

            let candy = FX.shape(host)
            candy.fillRule = .nonZero
            candy.lineJoin = .round
            candy.lineCap = .round
            candy.isHidden = true
            r.addSublayer(candy)
            candyLayer = candy

            for _ in 0..<Self.maxSparks {
                let s = FX.shape(host)
                s.strokeColor = nil
                s.isHidden = true
                r.addSublayer(s)
                sparkLayers.append(s)
            }
            sparks = Array(repeating: Spark(), count: Self.maxSparks)
            builtHeight = -1
        }

        // 出すたびに解像度と大きさを合わせ直す（外部モニタに移した後でもにじまない）
        let scale = host.effectLayer.contentsScale
        root?.frame = CGRect(origin: .zero, size: host.stageSize)
        root?.contentsScale = scale
        candyLayer?.contentsScale = scale
        haloLayer?.contentsScale = scale
        for l in sparkLayers { l.contentsScale = scale }
    }

    private func teardown() {
        if phase != .waiting { finish(retry: true) }
        root?.removeFromSuperlayer()
        root = nil
        candyLayer = nil
        haloLayer = nil
        sparkLayers.removeAll()
        sparks.removeAll()
        builtHeight = -1
        isPerforming = false
    }
}
