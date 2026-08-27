import AppKit

/// ビルドのたびに走る自己点検。`こすくまくん --selftest`
///
/// **なぜ要るのか。**
/// このアプリのバグは、どれも「見えているのに気づけない」形で出た。
///   - 「定位置にもどす」を押しても、次のフレームで自動のぞきが即また上書きしていた
///   - 画面の壁に貼り付いている姿は、ウィンドウの縁に乗っている姿と **同じ絵** なのに、
///     触ったときの扱いだけ違っていて、タップすると剥がれて落ちた
/// どちらも画面を見ているだけでは「そういうものかな」で流れてしまう。
/// だから **人の目に頼らず、決まりごとを毎回ここで確かめる**。
///
/// ここに書くのは「こう動くはず」ではなく、**実際に壊れたことがある決まりごと** だけにする。
/// 網羅しようとすると誰も直さなくなるので、再発したら1つ足す、くらいの育て方をする。
///
/// ウィンドウの並びに依存する判定（縁に乗れるか）はここでは試さない。
/// 走らせる環境で結果が変わってしまい、「たまに落ちる試験」は無いのと同じになる。
enum SelfTest {

    private static var failures: [String] = []

    private static func check(_ name: String, _ ok: Bool, _ detail: @autoclosure () -> String = "") {
        if ok {
            FileHandle.standardOutput.write("  ✓ \(name)\n".data(using: .utf8)!)
        } else {
            let d = detail()
            failures.append(name + (d.isEmpty ? "" : "  … " + d))
            FileHandle.standardOutput.write("  ✗ \(name)  \(d)\n".data(using: .utf8)!)
        }
    }

    /// 試験用のこすくまくん。画面は固定の大きさにして、環境で変わらないようにする。
    private static func make() -> (Brain, Activity, NSRect) {
        let screen = NSRect(x: 0, y: 0, width: 1600, height: 1000)
        let view = PetView(frame: NSRect(origin: .zero, size: CGSize(width: 560, height: 720)))
        let brain = Brain()
        brain.host = view
        brain.displayHeight = 140
        brain.setStart(CGPoint(x: screen.midX, y: screen.minY + 6))
        return (brain, Activity(), screen)
    }

    private static func run(_ brain: Brain, _ act: Activity, _ screen: NSRect, _ n: Int) {
        for _ in 0..<n { brain.update(dt: 1.0 / 30, activity: act, screen: screen, full: screen) }
    }

    static func handle(_ args: [String]) -> Bool {
        guard args.contains("--selftest") else { return false }
        SpriteBank.loadIfNeeded()
        FileHandle.standardOutput.write("こすくまくん 自己点検\n".data(using: .utf8)!)

        // --- 「定位置にもどす」は、自動のぞきに上書きされない -------------------
        // 放置45秒を過ぎている間は、降ろした次のフレームで また はしへ登っていた。
        do {
            let (b, a, s) = make()
            let home = CGPoint(x: s.maxX - 186, y: s.minY + 6)
            a.debugOverride(typingRate: 0, idle: 60)
            b.enterScreenPeek(.top)
            run(b, a, s, 5)
            check("のぞきに入れる", b.state == .screenPeek, "state=\(b.state)")
            b.recall(to: home)
            run(b, a, s, 90)                       // 3秒ぶん
            check("定位置にもどしたら、そのまま居る", b.state != .screenPeek, "state=\(b.state)")
            check("定位置の高さに居る", abs(b.pos.y - home.y) < 1, "y=\(b.pos.y)")
        }

        // --- また打ち始めたら、自動のぞきは戻る -------------------------------
        // 上を直したときに、こちらを殺していないことを確かめる。
        do {
            let (b, a, s) = make()
            let home = CGPoint(x: s.maxX - 186, y: s.minY + 6)
            a.debugOverride(typingRate: 0, idle: 60)
            b.enterScreenPeek(.top); run(b, a, s, 5)
            b.recall(to: home); run(b, a, s, 30)
            a.debugOverride(typingRate: 3, idle: 0); run(b, a, s, 30)   // 打っている
            a.debugOverride(typingRate: 0, idle: 60); run(b, a, s, 30)  // また手が止まった
            check("打ち直したら、自動のぞきが戻る", b.state == .screenPeek, "state=\(b.state)")
        }

        // --- 「のぞくのをやめる」も、そのまま降りたきり ------------------------
        do {
            let (b, a, s) = make()
            a.debugOverride(typingRate: 0, idle: 60)
            b.enterScreenPeek(.top); run(b, a, s, 5)
            b.leaveScreenPeek(); run(b, a, s, 150)   // 5秒ぶん（落ちて着地するまで含む）
            check("のぞくのをやめたら、登り直さない", b.state != .screenPeek, "state=\(b.state)")
        }

        // --- 貼り付いている姿は、触っても剥がれない扱いになっている -------------
        // **今回のバグの本体。** 画面の壁を伝っている姿は、ウィンドウの縁に乗った姿と
        // 同じ絵で描かれる。見た目が同じなら、触ったときの扱いも同じでないといけない。
        do {
            let (b, a, s) = make()
            a.debugOverride(typingRate: 0, idle: 3)
            run(b, a, s, 5)
            check("床に立っている時は、つまみ上げられる", !b.isPerched, "isPerched=\(b.isPerched)")

            // スクロールで梅干しを転がして、壁まで登らせる
            for _ in 0..<400 {
                a.debugOverride(typingRate: 0, idle: 1, scrolling: true, scrollDir: -1)
                b.update(dt: 1.0 / 30, activity: a, screen: s, full: s)
            }
            a.debugOverride(typingRate: 0, idle: 3)
            run(b, a, s, 20)                        // 手を止める
            check("壁まで登れた", b.rollSide != 0, "rollSide=\(b.rollSide)")
            check("壁に貼り付いている間は、タップで剥がさない", b.isPerched,
                  "rollSide=\(b.rollSide) state=\(b.state) isPerched=\(b.isPerched)")
        }

        // --- 画面の外へ出したら、呼び戻せる -----------------------------------
        do {
            let (b, _, s) = make()
            let home = CGPoint(x: s.maxX - 186, y: s.minY + 6)
            b.setStart(CGPoint(x: s.maxX + 4000, y: s.midY))
            check("画面の外に出たと分かる", !b.isVisible(on: NSScreen.screens))
            b.recall(to: home)
            check("呼び戻すと定位置に立つ", abs(b.pos.x - home.x) < 1 && abs(b.pos.y - home.y) < 1,
                  "pos=\(b.pos)")
        }

        // --- 会議モードは無くした（残骸で状態が増えていないか） -----------------
        do {
            let (b, a, s) = make()
            run(b, a, s, 5)
            check("状態は idle から始まる", b.state == .idle, "state=\(b.state)")
        }

        if failures.isEmpty {
            FileHandle.standardOutput.write("\n自己点検 すべて通りました\n".data(using: .utf8)!)
            exit(0)
        }
        FileHandle.standardError.write(
            "\n自己点検 \(failures.count)件 落ちました:\n  - \(failures.joined(separator: "\n  - "))\n"
                .data(using: .utf8)!)
        exit(1)
    }
}
