import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {

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
    private let pointing = PointingBehavior()

    private var timer: DispatchSourceTimer?
    private var lastTick = CACurrentMediaTime()
    private var currentFPS = 0
    private var dragging = false
    /// はしからのぞいている時に押し始めた場所。動かさずに離したらタップとみなす。
    private var peekTapFrom: CGPoint?
    /// のぞいたまま縁に沿って動かしたか（動かしていたら、離しても場所は変えない）
    private var peekMoved = false
    /// 会議モードで押し始めた場所。動かさずに離したら次の言葉へ。
    private var meetTapFrom: CGPoint?
    private weak var meetingItem: NSMenuItem?
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

        let vf = (NSScreen.main ?? NSScreen.screens[0]).visibleFrame
        brain.setStart(CGPoint(x: vf.midX, y: vf.minY + 6))

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
        // **はしからのぞいている間は、押しても何も起きない。**
        // ただ のぞいているだけの時間なので、豆知識も場所替えも出さない。
        // 動かしたいときだけ つかんで、その縁の上をすべらせる。
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
        // 会議モードも同じで、タップは「次の言葉へ」
        if brain.isMeeting {
            meetTapFrom = p
            dragging = true
            return
        }
        peekTapFrom = nil
        meetTapFrom = nil
        dragging = true
        brain.beginDrag(at: p)
    }

    private func mouseDragged(_ p: CGPoint) {
        // のぞいている最中は、縁から剥がさずに **その縁に沿って動かす**。
        // つかんで放り出したいときは、右クリックの「のぞくのをやめる」から。
        if peekTapFrom != nil, brain.state == .screenPeek {
            if let from = peekTapFrom, hypot(p.x - from.x, p.y - from.y) > 6 { peekMoved = true }
            if peekMoved { brain.moveScreenPeek(to: p) }
            return
        }
        if let from = meetTapFrom {
            guard hypot(p.x - from.x, p.y - from.y) > 6 else { return }
            meetTapFrom = nil
            brain.beginDrag(at: from)
        }
        brain.moveDrag(to: p)
    }

    private func mouseUp(_ p: CGPoint) {
        dragging = false
        if peekTapFrom != nil {
            peekTapFrom = nil
            peekMoved = false
            brain.endScreenPeekMove()
            return                   // 押しただけでは何も起きない
        }
        if meetTapFrom != nil {
            meetTapFrom = nil
            brain.nextMeetingLine()
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
        let meet = NSMenuItem(title: "会議モード", action: #selector(toggleMeeting), keyEquivalent: "")
        meet.target = self
        meet.state = brain.isMeeting ? .on : .off
        m.addItem(meet)
        let back = NSMenuItem(title: "呼び戻す", action: #selector(recall), keyEquivalent: "")
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
        let hide = NSMenuItem(title: "そっとしておく", action: #selector(togglePause), keyEquivalent: "")
        hide.target = self
        m.addItem(hide)
        let back = NSMenuItem(title: "呼び戻す", action: #selector(recall), keyEquivalent: "r")
        back.target = self
        m.addItem(back)
        let peek = NSMenuItem(title: "画面のはしからのぞく", action: #selector(toggleScreenPeek),
                              keyEquivalent: "")
        peek.target = self
        m.addItem(peek)
        let meet = NSMenuItem(title: "会議モード", action: #selector(toggleMeeting), keyEquivalent: "m")
        meet.target = self
        m.addItem(meet)
        meetingItem = meet
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
        statusItem.menu = m
    }

    @objc private func togglePause(_ sender: NSMenuItem) {
        paused.toggle()
        sender.title = paused ? "出てきてもらう" : "そっとしておく"
        window.setIsVisible(!paused)
        setFPS(paused ? 0 : 30)
    }

    @objc private func forceSleep() { brain.forceSleep() }

    @objc private func toggleScreenPeek() { brain.toggleScreenPeek() }

    @objc private func toggleMeeting() {
        brain.toggleMeeting()
        meetingItem?.state = brain.isMeeting ? .on : .off
    }

    /// いつもの立ち位置（メインの画面の下・まんなか）
    private func homePoint() -> CGPoint {
        let vf = (NSScreen.main ?? NSScreen.screens[0]).visibleFrame
        return CGPoint(x: vf.midX, y: vf.minY + 6)
    }

    @objc private func recall() {
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

        brain.behaviors = [thought, reminders, keyboard, zzz, rolling, pointing]
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

    /// メニューバー用のアイコン。**寝そべりの姿**のドット絵から作る。
    ///
    /// 正面の姿だと、メニューバーの高さ(18pt)では ただの縦長の塊にしか見えなかった。
    /// 寝そべりは横長なので、この細長い場所に置いたときいちばん形が読める。
    /// テンプレート画像なので色は system 側で決まる。ここでは形だけ渡す。
    private func menuBarIcon() -> NSImage {
        SpriteBank.loadIfNeeded()
        let sp = SpriteBank.sprite("lying")
        let h: CGFloat = 15
        let scale = h / CGFloat(sp.h)
        let w = (CGFloat(sp.w) * scale).rounded()
        let img = NSImage(size: NSSize(width: w, height: h), flipped: false) { rect in
            guard let ctx = NSGraphicsContext.current?.cgContext else { return true }
            ctx.setFillColor(NSColor.black.cgColor)
            let cw = rect.width / CGFloat(sp.w)
            let ch = rect.height / CGFloat(sp.h)
            for y in 0..<sp.h {
                for x in 0..<sp.w where sp.at(x, y) != 0 {
                    // ドット絵の行は上から。描画は下からなので反転する
                    ctx.fill(CGRect(x: CGFloat(x) * cw,
                                    y: rect.height - CGFloat(y + 1) * ch,
                                    width: cw + 0.5, height: ch + 0.5))
                }
            }
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
