import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {

    private var window: PetWindow!
    private let brain = Brain()
    private let activity = Activity()
    private var statusItem: NSStatusItem!

    // ふるまいは作り直さず使い回す（設定変更のたびに状態が飛ばないように）
    private let konpeito = KonpeitoBehavior()
    private let thought = ThoughtBehavior()
    private let reminders = ReminderBehavior()
    private let keyboard = KeyboardBehavior()
    private let zzz = ZzzBehavior()
    private let rolling = RollingBehavior()

    private var timer: DispatchSourceTimer?
    private var lastTick = CACurrentMediaTime()
    private var currentFPS = 0
    private var dragging = false
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

        let screen = screenFor(brain.pos).visibleFrame
        brain.update(dt: dt, activity: activity, screen: screen)

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
        let busy = dragging || brain.state != .idle || activity.idle < 1.2
        // 静止していても、カーソルが近いときは操作を取りこぼさない速さを保つ
        setFPS(brain.isQuiet && !cursorNear ? 4 : (busy || cursorNear ? 60 : 30))
    }

    private func screenFor(_ p: CGPoint) -> NSScreen {
        NSScreen.screens.first { $0.frame.contains(p) } ?? NSScreen.main ?? NSScreen.screens[0]
    }

    // MARK: - カーソルが上にいるか

    private func updateHover() {
        let p = NSEvent.mouseLocation
        // のぞき見中は上の一部しか描かれていないので、当たり判定も見えている範囲に合わせる。
        // 全身ぶんで判定すると、見えていない所を掴もうとして空振りする。
        let f = brain.frame
        let visible = f.peekRows > 0 ? f.height : brain.displayHeight
        let h = brain.displayHeight
        let cx = brain.pos.x
        let cy = brain.pos.y + visible * 0.5
        let inside = abs(p.x - cx) < h * 0.42 && abs(p.y - cy) < visible * 0.62
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
        // 2回続けてタップされたら、その場で豆知識を出す
        let now = CACurrentMediaTime()
        if now - lastTapAt < 0.45 {
            lastTapAt = 0
            thought.showTipNow(brain)
        } else {
            lastTapAt = now
        }
        dragging = true
        brain.beginDrag(at: p)
    }

    private func mouseDragged(_ p: CGPoint) {
        brain.moveDrag(to: p)
    }

    private func mouseUp(_ p: CGPoint) {
        dragging = false
        brain.endDrag()
    }

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
    /// ふるまいのインスタンスは使い回す（作り直すと金平糖の途中経過やタイマーが飛ぶため）。
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

        // 金平糖はオン/オフの口を持たないので、配列から外すことで止める
        var list: [PetBehavior] = [thought, reminders, keyboard, zzz, rolling]
        if s.konpeitoEnabled { list.append(konpeito) }
        brain.behaviors = list
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
