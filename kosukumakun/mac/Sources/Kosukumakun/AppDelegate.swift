import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {

    private var window: PetWindow!
    private let brain = Brain()
    private let activity = Activity()
    private var statusItem: NSStatusItem!

    // ふるまいは作り直さず使い回す（設定変更のたびに状態が飛ばないように）
    private let thought = ThoughtBehavior()
    private let reminders = ReminderBehavior()
    private let keyboard = KeyboardBehavior()
    private let zzz = ZzzBehavior()
    private let rolling = RollingBehavior()

    private var timer: DispatchSourceTimer?
    private var lastTick = CACurrentMediaTime()
    private var currentFPS = 0
    private var dragging = false
    /// はしからのぞいている時に押し始めた場所。動かさずに離したらタップとみなす。
    private var peekTapFrom: CGPoint?
    /// のぞいたまま縁に沿って動かしたか（動かしていたら、離しても場所は変えない）
    private var peekMoved = false
    /// ウィンドウの縁に乗っている時に押し始めた場所。
    /// **動かすまで つまみ上げない。** 押しただけで持ち上げると、離したときに
    /// 乗り直せず落ちてしまう（タップのつもりが「つまんで落とす」になっていた）。
    private var perchFrom: CGPoint?
    private weak var peekItem: NSMenuItem?
    private weak var pauseItem: NSMenuItem?
    private var lastPointer = CGPoint.zero
    private var hoverTime: CGFloat = 0
    private var cursorNear = false
    private var offscreen: CGFloat = 0
    private var lastTapAt: CFTimeInterval = 0
    private var paused = false

    func applicationDidFinishLaunching(_ n: Notification) {
        Asset.loadIfNeeded()

        window = PetWindow()
        window.petView.onMouseDown = { [weak self] p in self?.mouseDown(p) }
        window.petView.onMouseDragged = { [weak self] p in self?.mouseDragged(p) }
        window.petView.onMouseUp = { [weak self] p in self?.mouseUp(p) }
        window.petView.onRightMouseDown = { [weak self] e in self?.showPetMenu(e) }
        brain.host = window.petView

        applySettings()
        NotificationCenter.default.addObserver(
            self, selector: #selector(settingsChanged), name: .kosuSettingsChanged, object: nil)

        brain.setStart(homePoint())

        window.orderFrontRegardless()
        buildStatusItem()
        setFPS(30)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in self?.debugDump() }
    }

    func applicationWillTerminate(_ n: Notification) { timer?.cancel() }

    // MARK: - ループ

    private func setFPS(_ fps: Int) {
        guard fps != currentFPS else { return }
        currentFPS = fps
        timer?.cancel()
        guard fps > 0 else { timer = nil; return }
        let t = DispatchSource.makeTimerSource(queue: .main)
        t.schedule(deadline: .now(), repeating: 1.0 / Double(fps), leeway: .milliseconds(3))
        t.setEventHandler { [weak self] in self?.tick() }
        t.resume()
        timer = t
    }

    private func tick() {
        let now = CACurrentMediaTime()
        let dt = CGFloat(min(0.05, max(0.001, now - lastTick)))
        lastTick = now

        activity.update(dt: dt, now: now)

        let sc = screenFor(brain.pos)
        brain.update(dt: dt, activity: activity, screen: sc.visibleFrame, full: sc.frame)

        // 画面の外へ出てしまったら黙って呼び戻す。
        // 転がりすぎ・投げすぎ・乗っていた窓が画面外へ移動、どれでも見失わないように。
        offscreen = brain.isVisible(on: NSScreen.screens) ? 0 : offscreen + dt
        if offscreen > 0.6 {
            offscreen = 0
            brain.recall(to: homePoint())
        }

        window.place(footScreen: brain.pos)
        window.petView.render(brain.frame)

        updateHover()

        // 動きの必要がない時はフレームレートを落とす（＝仕事の邪魔をしない）
        let busy = dragging || (brain.state != .idle && brain.state != .screenPeek)
            || activity.idle < 1.2
        // 静止していても、カーソルが近いときは操作を取りこぼさない速さを保つ
        setFPS(brain.isQuiet && !cursorNear ? 4 : (busy || cursorNear ? 60 : 30))
    }

    private func screenFor(_ p: CGPoint) -> NSScreen {
        NSScreen.screens.first { $0.frame.contains(p) } ?? NSScreen.main ?? NSScreen.screens[0]
    }

    // MARK: - カーソルが上にいるか

    private func updateHover() {
        let p = NSEvent.mouseLocation
        // 当たり判定は **実際に描かれている絵** に合わせる。
        // のぞき見中は一部しか描かれていないし、画面の縁を伝うと縦横が入れ替わるので、
        // 身長だけで判定すると、見えていない所を掴もうとして空振りする。
        // ここは PetView の置き方と同じ計算をする（片方だけ直すとまたずれる）。
        let f = brain.frame
        let sp = SpriteBank.sprite(f.sprite)
        let turn = ((f.turn % 4) + 4) % 4
        let rows = f.peekRows > 0 ? min(f.peekRows, sp.h) : sp.h
        let cols = f.peekCols > 0 ? min(f.peekCols, sp.w) : sp.w
        let w = CGFloat((turn % 2 == 1 ? rows : cols) * f.pixelScale)
        let hgt = CGFloat((turn % 2 == 1 ? cols : rows) * f.pixelScale)
        var cx = brain.pos.x, cy = brain.pos.y
        switch turn {
        case 1:  cx -= w / 2
        case 2:  cy -= hgt / 2
        case 3:  cx += w / 2
        default: cy += hgt / 2
        }
        if turn == 0 {
            if f.peekSide < 0 { cx = brain.pos.x - w / 2 }
            else if f.peekSide > 0 { cx = brain.pos.x + w / 2 }
        }
        let h = brain.displayHeight
        let inside = abs(p.x - cx) < w * 0.55 && abs(p.y - cy) < hgt * 0.55
        if !dragging { window.ignoresMouseEvents = !inside }
        // カーソルが近いかどうかは、当たり判定より広めに見ておく。
        // ここが狭いと、近づいた瞬間はまだ低フレームのままで反応が鈍い。
        cursorNear = abs(p.x - cx) < h * 1.1 && abs(p.y - cy) < h * 1.2

        // クリックしなくても、上でカーソルを動かせば「なでる」
        if inside && !dragging {
            let moved = hypot(p.x - lastPointer.x, p.y - lastPointer.y)
            hoverTime += moved
            if hoverTime > 60 {
                hoverTime = 0
                brain.petting(at: p)
            }
        } else {
            hoverTime = 0
        }
        lastPointer = p
    }

    // MARK: - マウス

    private func mouseDown(_ p: CGPoint) {
        // はしからのぞいている間は、タップで **次ののぞき場所へ**（上→右→左→下）。
        // 豆知識はここでは出さない。のぞいている時間は、そっとしておく時間なので。
        // 動かしたいときは つかんで、その縁の上をすべらせる。
        if brain.state == .screenPeek {
            peekTapFrom = p
            peekMoved = false
            dragging = true
            brain.beginScreenPeekMove(at: p)
            return
        }
        // 2回続けてタップされたら、その場で豆知識を出す
        let now = CACurrentMediaTime()
        if now - lastTapAt < 0.45 {
            lastTapAt = 0
            thought.showTipNow(brain)
        } else {
            lastTapAt = now
        }
        peekTapFrom = nil
        dragging = true
        // 貼り付いている間は、まだ つまみ上げない。動かしたら つまみ上げる。
        // **窓の縁だけでなく、画面の壁も同じ扱いにする。**
        // 見た目が同じなので、片方だけ剥がれると挙動が読めない
        // （実際、壁に貼り付いている子をタップして落ちていた）。
        if brain.isPerched {
            perchFrom = p
            return
        }
        brain.beginDrag(at: p)
    }

    private func mouseDragged(_ p: CGPoint) {
        // 縁に乗ったまま押していた指が動いた。ここで初めて つまみ上げる。
        if let from = perchFrom {
            guard hypot(p.x - from.x, p.y - from.y) > 6 else { return }
            perchFrom = nil
            brain.beginDrag(at: from)
        }
        // のぞいている最中は、縁から剥がさずに **その縁に沿って動かす**。
        // つかんで放り出したいときは、右クリックの「のぞくのをやめる」から。
        if peekTapFrom != nil, brain.state == .screenPeek {
            if let from = peekTapFrom, hypot(p.x - from.x, p.y - from.y) > 6 { peekMoved = true }
            if peekMoved { brain.moveScreenPeek(to: p) }
            return
        }
        brain.moveDrag(to: p)
    }

    private func mouseUp(_ p: CGPoint) {
        dragging = false
        // 動かさずに離した＝ただのタップ。乗ったままにする。
        if perchFrom != nil {
            perchFrom = nil
            return
        }
        if peekTapFrom != nil {
            peekTapFrom = nil
            brain.endScreenPeekMove()
            // 動かさずに離した＝次ののぞき場所へ。動かしたなら、その場所のまま。
            if !peekMoved { brain.cycleScreenPeek() }
            peekMoved = false
            return
        }
        brain.endDrag()
    }

    // MARK: - こすくまくんを右クリック

    /// こすくまくんの上で右クリックしたときのメニュー。
    ///
    /// のぞく場所はここから選ぶのが分かりやすい。
    /// タップで順ぐりに回すやり方だけだと、4つあること自体が伝わらない。
    private func showPetMenu(_ e: NSEvent) {
        let m = NSMenu()
        m.addItem(withTitle: "のぞきモード", action: nil, keyEquivalent: "")
        for (kind, title) in [(Brain.ScreenPeek.top, "　上から さかさま"),
                              (.right, "　右のはしから"),
                              (.left, "　左のはしから"),
                              (.bottom, "　下から ひょこっと")] {
            let it = NSMenuItem(title: title, action: #selector(pickPeek(_:)), keyEquivalent: "")
            it.target = self
            it.tag = kind.rawValue
            it.state = (brain.state == .screenPeek && brain.screenPeek == kind) ? .on : .off
            m.addItem(it)
        }
        let off = NSMenuItem(title: "　のぞくのをやめる", action: #selector(stopPeek),
                             keyEquivalent: "")
        off.target = self
        off.isEnabled = brain.state == .screenPeek
        m.addItem(off)

        m.addItem(.separator())
        let back = NSMenuItem(title: "定位置にもどす", action: #selector(recall), keyEquivalent: "")
        back.target = self
        m.addItem(back)
        let sleep = NSMenuItem(title: "おやすみ", action: #selector(forceSleep), keyEquivalent: "")
        sleep.target = self
        m.addItem(sleep)
        m.addItem(.separator())
        let prefs = NSMenuItem(title: "設定…", action: #selector(openSettings), keyEquivalent: "")
        prefs.target = self
        m.addItem(prefs)

        NSMenu.popUpContextMenu(m, with: e, for: window.petView)
    }

    @objc private func pickPeek(_ sender: NSMenuItem) {
        guard let k = Brain.ScreenPeek(rawValue: sender.tag) else { return }
        brain.enterScreenPeek(k)
    }

    @objc private func stopPeek() { brain.leaveScreenPeek() }

    // MARK: - メニューバー

    private func buildStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        statusItem.button?.image = menuBarIcon()
        statusItem.button?.image?.isTemplate = true

        let m = NSMenu()
        m.addItem(withTitle: "こすくまくん", action: nil, keyEquivalent: "")
        m.addItem(.separator())
        let hide = NSMenuItem(title: "かくれてもらう", action: #selector(togglePause), keyEquivalent: "")
        hide.target = self
        m.addItem(hide)
        pauseItem = hide
        let back = NSMenuItem(title: "定位置にもどす", action: #selector(recall), keyEquivalent: "r")
        back.target = self
        m.addItem(back)
        let peek = NSMenuItem(title: "画面のはしからのぞく", action: #selector(toggleScreenPeek),
                              keyEquivalent: "")
        peek.target = self
        m.addItem(peek)
        peekItem = peek
        let sleep = NSMenuItem(title: "おやすみ", action: #selector(forceSleep), keyEquivalent: "")
        sleep.target = self
        m.addItem(sleep)
        m.addItem(.separator())
        let pomo = NSMenuItem(title: "ポモドーロをはじめる", action: #selector(togglePomodoro), keyEquivalent: "")
        pomo.target = self
        m.addItem(pomo)
        m.addItem(.separator())
        let prefs = NSMenuItem(title: "設定…", action: #selector(openSettings), keyEquivalent: ",")
        prefs.target = self
        m.addItem(prefs)
        m.addItem(.separator())
        let quit = NSMenuItem(title: "終了", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        m.addItem(quit)
        m.delegate = self
        statusItem.menu = m
    }

    /// メニューを開くたびに、いまの状態に合わせて言い方を変える。
    /// 「のぞく」のままだと、**いま のぞいているのかどうかが分からない**。
    func menuNeedsUpdate(_ menu: NSMenu) {
        let peeking = brain.state == .screenPeek
        peekItem?.title = peeking ? "画面のはしからのぞくのを やめる" : "画面のはしからのぞく"
        peekItem?.state = peeking ? .on : .off
    }

    @objc private func togglePause(_ sender: NSMenuItem) {
        setPaused(!paused)
    }

    /// かくれてもらう／出てきてもらう。
    /// **窓の出し入れと時計の止め方を必ず一緒に動かす。** 片方だけ動かすと、
    /// 「窓は出ているのに時計が止まっている＝出てきたのに固まっている」状態が作れてしまう。
    private func setPaused(_ p: Bool) {
        paused = p
        pauseItem?.title = paused ? "出てきてもらう" : "かくれてもらう"
        window.setIsVisible(!paused)
        setFPS(paused ? 0 : 30)
    }

    @objc private func forceSleep() { brain.forceSleep() }

    @objc private func toggleScreenPeek() { brain.toggleScreenPeek() }

    /// いつもの立ち位置（メインの画面の下・右のほう）。
    ///
    /// まんなかは、作業している窓のちょうど前に立つことになって邪魔だった。
    /// **右のはしからの距離で決める。** 画面の幅で割った比率にすると、
    /// 画面が広い時ほど右へ寄って、いつもの見え方が変わってしまう。
    private static let homeInsetFromRight: CGFloat = 186

    private func homePoint() -> CGPoint {
        let vf = (NSScreen.main ?? NSScreen.screens[0]).visibleFrame
        // 狭い画面でも画面の外へ出ないように、左半分より左には行かせない
        let x = max(vf.midX, vf.maxX - AppDelegate.homeInsetFromRight)
        return CGPoint(x: x, y: vf.minY + 6)
    }

    @objc private func recall() {
        // かくれてもらっている最中に呼ばれたら、隠したままにしない。
        // 窓だけ出して時計を止めたままだと、出てきたのに動かないように見える。
        if paused { setPaused(false) }
        brain.recall(to: homePoint())
        window.orderFrontRegardless()
    }

    @objc private func openSettings() {
        // 設定を触っている間だけはアプリを前に出す（普段は絶対に前面を奪わない）
        NSApp.activate(ignoringOtherApps: true)
        SettingsWindowController.shared.showWindow(nil)
        SettingsWindowController.shared.window?.makeKeyAndOrderFront(nil)
    }

    @objc private func settingsChanged() { applySettings() }

    /// 設定をこすくまくんと各ふるまいへ流し込む。
    /// ふるまいのインスタンスは使い回す（作り直すと途中経過やタイマーが飛ぶため）。
    private func applySettings() {
        let s = Settings.shared
        s.apply(to: brain)

        thought.enabled = s.thoughtsEnabled

        reminders.pomodoroEnabled = s.pomodoroEnabled
        reminders.focusSeconds = s.pomodoroFocusSeconds
        reminders.breakSeconds = s.pomodoroBreakSeconds
        reminders.rounds = s.pomodoroRounds
        reminders.stretchEverySeconds = s.stretchEverySeconds
        reminders.waterEverySeconds = s.waterEverySeconds
        reminders.callName = s.callName
        brain.autoScreenPeek = s.autoScreenPeek
        // 設定で切ったら、いまのぞいている子も降ろす（これが「解除」になる）
        if !s.autoScreenPeek, brain.state == .screenPeek { brain.leaveScreenPeek() }

        brain.behaviors = [thought, reminders, keyboard, zzz, rolling]
    }

    @objc private func togglePomodoro(_ sender: NSMenuItem) {
        if reminders.isRunning {
            reminders.stop()
        } else {
            Settings.shared.pomodoroEnabled = true
            reminders.pomodoroEnabled = true
            reminders.start()
        }
        sender.title = reminders.isRunning ? "ポモドーロをやめる" : "ポモドーロをはじめる"
    }

    /// メニューバーのアイコン。**正面のこすくまくんのシルエット**を、
    /// ベクターのパスからそのまま描く。
    ///
    /// 前は寝そべりのドット絵だった。横長なのでメニューバーの細い場所に
    /// 収まりは良かったが、何の絵なのか読めなかった。
    /// 正面にして、**目と鼻を穴として抜く**。それだけで急にこすくまくんになる。
    ///
    /// ただし目は身長の5.1%・鼻は2.2%しかなく、この大きさだと1pt未満で消える。
    /// サイトのアイコンと同じだけ穴を大きくする（目×1.85 / 鼻×2.6）。
    /// **ドット絵ではなくベクターを使う。** ドットに落とすと、目のドットが
    /// 1ドット未満になって そもそも置けない。
    /// テンプレート画像なので色は system 側で決まる。ここでは形だけ渡す。
    private func menuBarIcon() -> NSImage {
        Asset.loadIfNeeded()
        let pose = Asset.pose("front")
        let h: CGFloat = 17
        let w = (h * pose.width / pose.height).rounded()

        /// パーツをCGPathにする。grow を渡すと、そのパーツ自身の中心のまわりに広げる。
        func path(_ part: VectorPart, grow: CGFloat = 1) -> CGPath {
            let p = CGMutablePath()
            for seg in part.segs {
                switch seg {
                case .move(let a):  p.move(to: a)
                case .line(let a):  p.addLine(to: a)
                case .curve(let c1, let c2, let a):
                    p.addCurve(to: a, control1: c1, control2: c2)
                case .close:        p.closeSubpath()
                }
            }
            guard grow != 1 else { return p }
            let b = p.boundingBoxOfPath
            var t = CGAffineTransform(translationX: b.midX, y: b.midY)
                .scaledBy(x: grow, y: grow)
                .translatedBy(x: -b.midX, y: -b.midY)
            return p.copy(using: &t) ?? p
        }

        // 外形と、穴にする目・鼻を **1本のパス** にまとめる。
        // 塗るときに evenOdd を使うと、内側の輪が穴になって地の色が出る。
        let whole = CGMutablePath()
        if let sil = pose.part("silhouette") { whole.addPath(path(sil)) }
        for id in ["eye_l", "eye_r"] {
            if let e = pose.part(id) { whole.addPath(path(e, grow: 1.85)) }
        }
        if let n = pose.part("nose") { whole.addPath(path(n, grow: 2.6)) }

        let img = NSImage(size: NSSize(width: w, height: h), flipped: false) { rect in
            guard let ctx = NSGraphicsContext.current?.cgContext else { return true }
            // 素材の座標は「身長1000・原点は絵の中心・Y上向き」。枠の真ん中へ合わせる。
            let s = rect.height / pose.height
            ctx.translateBy(x: rect.midX, y: rect.midY)
            ctx.scaleBy(x: s, y: s)
            ctx.setFillColor(NSColor.black.cgColor)
            ctx.addPath(whole)
            ctx.fillPath(using: .evenOdd)
            return true
        }
        img.isTemplate = true
        return img
    }

}

// MARK: - デバッグ（KOSU_DEBUG=1 で状態を吐く）
extension AppDelegate {
    func debugDump() {
        guard ProcessInfo.processInfo.environment["KOSU_DEBUG"] == "1" else { return }
        let scr = NSScreen.screens.map { "\($0.frame) visible=\($0.visibleFrame)" }.joined(separator: " | ")
        FileHandle.standardError.write("""
        screens: \(scr)
        window: frame=\(window.frame) visible=\(window.isVisible) level=\(window.level.rawValue) alpha=\(window.alphaValue)
        view: \(window.petView.frame) layers=\(window.petView.layer?.sublayers?.count ?? -1)
        brain: pos=\(brain.pos) state=\(brain.state) poses=\(Asset.poses.keys.sorted())
        sprites: \(SpriteBank.sprites.keys.sorted().map { "\($0)(\(SpriteBank.sprite($0).w)x\(SpriteBank.sprite($0).h))" }.joined(separator: " "))
        frame: sprite=\(brain.frame.sprite) foot=\(brain.frame.foot) scale=x\(brain.frame.pixelScale) h=\(brain.frame.height)pt look=\(brain.frame.look)

        """.data(using: .utf8)!)
    }
}
