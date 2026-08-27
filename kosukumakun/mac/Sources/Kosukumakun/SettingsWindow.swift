import AppKit

/// 設定画面。Storyboard も xib も使わず、全部コードで組む。
///
/// 方針:
///  - **OKボタンを作らない**。触ったその場で Settings.shared に入って、こすくまくんに届く。
///    「設定したのに変わらない」という迷いを最初から無くす。
///  - 項目ごとに小さい説明を必ず添える。会社で配るので、初見の人が読んで判断できること。
///  - 一番下に「何を見ていないか」を書く。常駐アプリはそこが一番不安になるところなので、
///    聞かれる前に書いておく。
///  - 閉じてもアプリは終了しない（メニューバーに残る）。使い回すので破棄もしない。
final class SettingsWindowController: NSWindowController, NSWindowDelegate, NSTextFieldDelegate {

    /// メニューから何度でも開くので、1枚だけ作って使い回す
    static let shared = SettingsWindowController()

    private static let winWidth: CGFloat = 420
    private static let pad: CGFloat = 22
    /// 中身1行ぶんの幅（折り返し計算に使うので定数で持つ）
    private static let rowWidth: CGFloat = winWidth - pad * 2

    private let settings = Settings.shared
    private let stack = NSStackView()

    /// target/action の受け皿。NSControl.target は weak なので、こちらで持っておかないと消える
    private var relays: [Relay] = []
    /// 開き直した時に値を拾い直す小さな仕事たち（コントロールごとに1つ積む）
    private var syncers: [() -> Void] = []

    // 個別に触るもの
    private var nameField: NSTextField?
    private var pomodoroDetails: [NSControl] = []
    private var loginSwitch: NSSwitch?
    private var loginNote: NSTextField?

    // MARK: - 組み立て

    init() {
        let w = NSWindow(contentRect: NSRect(x: 0, y: 0,
                                             width: SettingsWindowController.winWidth, height: 560),
                         styleMask: [.titled, .closable],
                         backing: .buffered,
                         defer: false)
        w.title = "こすくまくんの設定"
        w.isReleasedWhenClosed = false      // 閉じても捨てない（次に開く時そのまま使う）
        w.hidesOnDeactivate = false
        super.init(window: w)
        w.delegate = self
        build()
    }

    required init?(coder: NSCoder) { fatalError() }

    private func build() {
        guard let window else { return }

        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = 15
        stack.edgeInsets = NSEdgeInsets(top: 18, left: SettingsWindowController.pad,
                                        bottom: 26, right: SettingsWindowController.pad)
        stack.translatesAutoresizingMaskIntoConstraints = false

        buildRows()

        // 画面の低いMacでも収まるように、中身はスクロールに逃がす
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.hasHorizontalScroller = false
        scroll.autohidesScrollers = true
        scroll.drawsBackground = false
        scroll.scrollerStyle = .overlay     // スクロールバーに幅を取られると折り返しがズレる
        scroll.documentView = stack
        scroll.translatesAutoresizingMaskIntoConstraints = false

        let content = NSView(frame: NSRect(x: 0, y: 0,
                                           width: SettingsWindowController.winWidth, height: 2000))
        content.addSubview(scroll)
        NSLayoutConstraint.activate([
            scroll.topAnchor.constraint(equalTo: content.topAnchor),
            scroll.bottomAnchor.constraint(equalTo: content.bottomAnchor),
            scroll.leadingAnchor.constraint(equalTo: content.leadingAnchor),
            scroll.trailingAnchor.constraint(equalTo: content.trailingAnchor),
            stack.topAnchor.constraint(equalTo: scroll.contentView.topAnchor),
            stack.leadingAnchor.constraint(equalTo: scroll.contentView.leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: scroll.contentView.trailingAnchor),
        ])
        window.contentView = content

        // 中身の高さに合わせて窓を決める。入りきらない時だけスクロールさせる
        content.layoutSubtreeIfNeeded()
        let need = stack.frame.height > 1 ? stack.frame.height : 620
        let room = (window.screen ?? NSScreen.main)?.visibleFrame.height ?? 800
        window.setContentSize(NSSize(width: SettingsWindowController.winWidth,
                                     height: min(need, room - 120)))
        window.center()
    }

    // MARK: - 中身

    private func buildRows() {
        // ── 見た目 ────────────────────────────────
        addHeading("見た目", first: true)
        addHeightRow()
        addSwitchRow("勝手に動き回る",
                     note: "オフにすると、置いた場所でじっとしています。どちらでも、キーボードを打っている間は動きません。",
                     get: { Settings.shared.wanders },
                     set: { Settings.shared.wanders = $0 })

        // ── ふるまい ──────────────────────────────
        addHeading("ふるまい")
        addSwitchRow("心の声",
                     note: "こすくまくんに口はありません。ときどき、頭の上に思っていることが浮かびます。",
                     get: { Settings.shared.thoughtsEnabled },
                     set: { Settings.shared.thoughtsEnabled = $0 })
        addSwitchRow("画面のはしからのぞく",
                     note: "手が止まってしばらくすると、画面のはしへどいて顔だけ出します。"
                         + "一度その形になったら、やめると言うまで そのまま。"
                         + "タップで4か所（上・右・左・下）を順に、つかむと その縁に沿って動かせます。"
                         + "やめるときは、こすくまくんを右クリック →「のぞくのをやめる」。",
                     get: { Settings.shared.autoScreenPeek },
                     set: { Settings.shared.autoScreenPeek = $0 })
        addNameRow()

        // ── 休み方 ────────────────────────────────
        addHeading("休み方")
        addPopupRow("寝るまでの時間",
                    note: "これだけ操作がないと、丸まって寝ます。寝ている間は描き直しもほぼ止まるので、Macが静かになります。",
                    options: [("1分", 1), ("3分", 3), ("5分", 5), ("10分", 10), ("15分", 15), ("30分", 30)],
                    get: { Int(Settings.shared.sleepAfter.rounded()) },
                    set: { Settings.shared.sleepAfter = CGFloat($0) })
        addPopupRow("のびをする合図",
                    note: "この間隔で、こすくまくんがひとりで背伸びをします。音は鳴りません。",
                    options: [("なし", 0), ("30分ごと", 30), ("45分ごと", 45), ("60分ごと", 60), ("90分ごと", 90)],
                    get: { Settings.shared.stretchEvery },
                    set: { Settings.shared.stretchEvery = $0 })
        addPopupRow("水分をとる合図",
                    note: "この間隔で、こすくまくんがコップを抱えて待っています。気が向いたらどうぞ、くらいの合図です。",
                    options: [("なし", 0), ("45分ごと", 45), ("60分ごと", 60), ("90分ごと", 90), ("120分ごと", 120)],
                    get: { Settings.shared.waterEvery },
                    set: { Settings.shared.waterEvery = $0 })

        // ── ポモドーロ ────────────────────────────
        addHeading("ポモドーロ")
        addSwitchRow("ポモドーロを使う",
                     note: "集中と休憩をくり返します。切り替わっても音は鳴らさず、こすくまくんの様子だけで知らせます。",
                     get: { Settings.shared.pomodoroEnabled },
                     set: { [weak self] on in
                         Settings.shared.pomodoroEnabled = on
                         self?.updatePomodoroEnabled()
                     })
        pomodoroDetails = [
            addPopupRow("集中する時間",
                        note: "この間は、こすくまくんも静かに座って待っています。",
                        options: [("15分", 15), ("20分", 20), ("25分", 25), ("30分", 30), ("45分", 45), ("50分", 50)],
                        get: { Settings.shared.pomodoroFocus },
                        set: { Settings.shared.pomodoroFocus = $0 }),
            addPopupRow("休憩の時間",
                        note: "休憩に入ると、こすくまくんも一緒にひと休みします。",
                        options: [("3分", 3), ("5分", 5), ("10分", 10), ("15分", 15)],
                        get: { Settings.shared.pomodoroBreak },
                        set: { Settings.shared.pomodoroBreak = $0 }),
            addPopupRow("くり返す回数",
                        note: "この回数で1セット。終わったら長めに休みましょう、という区切りです。",
                        options: [("2回", 2), ("3回", 3), ("4回", 4), ("5回", 5), ("6回", 6)],
                        get: { Settings.shared.pomodoroRounds },
                        set: { Settings.shared.pomodoroRounds = $0 }),
        ]
        updatePomodoroEnabled()

        // ── 起動 ──────────────────────────────────
        addHeading("起動")
        loginSwitch = addSwitchRow("ログイン時に起動",
                                   note: "Macにログインすると、こすくまくんがそっと出てきます。",
                                   get: { Settings.shared.launchAtLogin },
                                   set: { [weak self] on in
                                       Settings.shared.launchAtLogin = on
                                       // 登録は失敗することがあるので、必ず実際の状態に戻す
                                       self?.syncFromSettings()
                                   })
        loginSwitch?.isEnabled = Settings.loginItemAvailable
        let ln = makeNote("")
        ln.isHidden = true
        loginNote = ln
        add(ln)
        updateLoginNote()

        // ── こすくまくんについて ──────────────────
        addHeading("こすくまくんについて")
        add(makeParagraph("キーボードの中身は一切読んでいません。見ているのは「いま打っているかどうか」と「どれくらい手が止まっているか」だけです。押されたキーや文字を受け取るしくみそのものを使っていないので、記録することもできません。"))
        add(makeNote("インターネットにもつながりません。ここでの設定は、このMacの中だけに保存されます。画面の中身も見ていないので、アクセシビリティや入力監視の許可も要りません。"))
    }

    // MARK: - 開く・閉じる

    override func showWindow(_ sender: Any?) {
        syncFromSettings()
        // メニューバー常駐（LSUIElement）なので、自分で前に出ないと後ろに隠れる
        if #available(macOS 14.0, *) {
            NSApp.activate()
        } else {
            NSApp.activate(ignoringOtherApps: true)
        }
        super.showWindow(sender)
        window?.makeKeyAndOrderFront(nil)
    }

    /// システム設定側でログイン項目を変えられていることがあるので、戻ってきたら拾い直す
    func windowDidBecomeKey(_ notification: Notification) {
        syncFromSettings()
    }

    // MARK: - 値の行き来

    /// 画面 → 設定 はコントロールごとのクロージャが即やる。こちらは 設定 → 画面 の一方通行。
    /// 反映は代入だけなので、action は飛ばない（＝ここから書き戻しが起きない）
    private func syncFromSettings() {
        for s in syncers { s() }
        loginSwitch?.isEnabled = Settings.loginItemAvailable
        updateLoginNote()
        updatePomodoroEnabled()
    }

    private func updatePomodoroEnabled() {
        let on = settings.pomodoroEnabled
        for c in pomodoroDetails { c.isEnabled = on }
    }

    private func updateLoginNote() {
        guard let note = loginNote else { return }
        let text: String
        if !Settings.loginItemAvailable {
            text = "アプリケーションフォルダに入れた「こすくまくん.app」から起動すると設定できます。"
        } else if settings.loginItemNeedsApproval {
            text = "システム設定 ＞ 一般 ＞ ログイン項目 で許可すると有効になります。"
        } else if let e = settings.lastLoginItemError {
            text = "設定できませんでした（\(e)）"
        } else {
            text = ""
        }
        note.stringValue = text
        note.isHidden = text.isEmpty     // 空の行を残さない（NSStackView は隠すと詰まる）
    }

    // MARK: - 名前欄

    func controlTextDidChange(_ obj: Notification) {
        guard let f = obj.object as? NSTextField, f === nameField else { return }
        // 打っている途中で書き戻すとカーソルが飛ぶので、こちらから値は返さない
        Settings.shared.userName = f.stringValue
    }

    // MARK: - 部品づくり
    //
    // コードだけで組むぶん、行の形をここで1つに決めておく。
    // どの行も「タイトル ……… コントロール」＋その下に小さい説明、で揃える。

    private func add(_ v: NSView) {
        stack.addArrangedSubview(v)
        v.widthAnchor.constraint(equalTo: stack.widthAnchor,
                                 constant: -SettingsWindowController.pad * 2).isActive = true
    }

    private func addHeading(_ text: String, first: Bool = false) {
        let box = NSStackView()
        box.orientation = .vertical
        box.alignment = .leading
        box.spacing = 10
        box.edgeInsets = NSEdgeInsets(top: first ? 0 : 14, left: 0, bottom: 0, right: 0)
        if !first {
            let line = NSBox()
            line.boxType = .separator
            box.addArrangedSubview(line)
            line.widthAnchor.constraint(equalTo: box.widthAnchor).isActive = true
        }
        let label = NSTextField(labelWithString: text)
        label.font = .systemFont(ofSize: 13, weight: .semibold)
        box.addArrangedSubview(label)
        add(box)
    }

    @discardableResult
    private func addSwitchRow(_ title: String, note: String,
                              get: @escaping () -> Bool,
                              set: @escaping (Bool) -> Void) -> NSSwitch {
        let sw = NSSwitch()
        sw.state = get() ? .on : .off
        bind(sw) { c in
            guard let s = c as? NSSwitch else { return }
            set(s.state == .on)
        }
        syncers.append { [weak sw] in sw?.state = get() ? .on : .off }
        add(rowView(title, note: note, control: sw))
        return sw
    }

    @discardableResult
    private func addPopupRow(_ title: String, note: String,
                             options: [(title: String, value: Int)],
                             get: @escaping () -> Int,
                             set: @escaping (Int) -> Void) -> NSPopUpButton {
        let pop = NSPopUpButton(frame: .zero, pullsDown: false)
        for o in options { pop.addItem(withTitle: o.title) }
        pop.selectItem(at: SettingsWindowController.nearest(options, get()))
        bind(pop) { c in
            guard let p = c as? NSPopUpButton else { return }
            let i = max(0, min(options.count - 1, p.indexOfSelectedItem))
            set(options[i].value)
        }
        syncers.append { [weak pop] in
            pop?.selectItem(at: SettingsWindowController.nearest(options, get()))
        }
        add(rowView(title, note: note, control: pop))
        return pop
    }

    private func addNameRow() {
        let f = NSTextField(string: settings.userName)
        f.placeholderString = "（なくてもよい）"
        f.delegate = self
        f.widthAnchor.constraint(equalToConstant: 168).isActive = true
        nameField = f
        syncers.append { [weak f] in
            // 編集中は触らない（カーソルが飛ぶ）
            guard let f, f.currentEditor() == nil,
                  f.stringValue != Settings.shared.userName else { return }
            f.stringValue = Settings.shared.userName
        }
        add(rowView("呼びかけに使う名前", note: "心の声にときどき出てきます。空のままでもかまいません。", control: f))
    }

    /// 大きさだけはスライダを1行使って、動かしながら実物で確かめられるようにする
    private func addHeightRow() {
        let value = NSTextField(labelWithString: "")
        value.alignment = .right
        value.textColor = .secondaryLabelColor
        value.font = .monospacedDigitSystemFont(ofSize: NSFont.systemFontSize, weight: .regular)
        value.widthAnchor.constraint(equalToConstant: 58).isActive = true
        value.stringValue = SettingsWindowController.ptText(settings.displayHeight)

        let r = Settings.heightRange
        let slider = NSSlider(value: Double(settings.displayHeight),
                              minValue: Double(r.lowerBound),
                              maxValue: Double(r.upperBound),
                              target: nil, action: nil)
        slider.isContinuous = true      // つまみを動かしている間に、その場で大きさが変わる
        bind(slider) { [weak value] c in
            Settings.shared.displayHeight = CGFloat(c.doubleValue)
            value?.stringValue = SettingsWindowController.ptText(Settings.shared.displayHeight)
        }
        syncers.append { [weak slider, weak value] in
            slider?.doubleValue = Double(Settings.shared.displayHeight)
            value?.stringValue = SettingsWindowController.ptText(Settings.shared.displayHeight)
        }

        let title = NSTextField(labelWithString: "大きさ")
        title.setContentHuggingPriority(.defaultLow, for: .horizontal)
        title.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        let head = NSStackView(views: [title, value])
        head.orientation = .horizontal
        head.alignment = .centerY
        head.spacing = 8

        let note = makeNote("画面のすみに置いても邪魔にならない大きさに。位置はドラッグで変えられます。")
        let box = NSStackView()
        box.orientation = .vertical
        box.alignment = .leading
        box.spacing = 6
        for v in [head as NSView, slider as NSView, note as NSView] {
            box.addArrangedSubview(v)
            v.widthAnchor.constraint(equalTo: box.widthAnchor).isActive = true
        }
        add(box)
    }

    private func rowView(_ title: String, note: String, control: NSView) -> NSView {
        let label = NSTextField(labelWithString: title)
        label.setContentHuggingPriority(.defaultLow, for: .horizontal)
        label.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        control.setContentHuggingPriority(.required, for: .horizontal)
        control.setContentCompressionResistancePriority(.required, for: .horizontal)

        let head = NSStackView(views: [label, control])
        head.orientation = .horizontal
        head.alignment = .centerY
        head.spacing = 10
        head.distribution = .fill

        let noteLabel = makeNote(note)
        let box = NSStackView()
        box.orientation = .vertical
        box.alignment = .leading
        box.spacing = 3
        for v in [head as NSView, noteLabel as NSView] {
            box.addArrangedSubview(v)
            v.widthAnchor.constraint(equalTo: box.widthAnchor).isActive = true
        }
        return box
    }

    /// 項目に添える小さい説明
    private func makeNote(_ text: String) -> NSTextField {
        let l = NSTextField(wrappingLabelWithString: text)
        l.font = .systemFont(ofSize: NSFont.smallSystemFontSize)
        l.textColor = .secondaryLabelColor
        l.isSelectable = false
        l.preferredMaxLayoutWidth = SettingsWindowController.rowWidth
        l.setContentCompressionResistancePriority(.required, for: .vertical)
        return l
    }

    /// 読んでほしい説明（添え書きより一段はっきり出す）
    private func makeParagraph(_ text: String) -> NSTextField {
        let l = makeNote(text)
        l.font = .systemFont(ofSize: NSFont.systemFontSize - 1)
        l.textColor = .labelColor
        l.isSelectable = true       // 社内で共有したい人がコピーできるように
        return l
    }

    private func bind(_ control: NSControl, _ handler: @escaping (NSControl) -> Void) {
        let relay = Relay(handler)
        relays.append(relay)
        control.target = relay
        control.action = #selector(Relay.fire(_:))
    }

    private static func ptText(_ v: CGFloat) -> String { "\(Int(v.rounded())) pt" }

    /// 保存値に一番近い選択肢を選ぶ。あとで選択肢を足しても、前の値が消えない
    private static func nearest(_ options: [(title: String, value: Int)], _ value: Int) -> Int {
        guard !options.isEmpty else { return 0 }
        var best = 0
        for (i, o) in options.enumerated() {
            if abs(o.value - value) < abs(options[best].value - value) { best = i }
        }
        return best
    }
}

/// target/action をクロージャで受けるための中継。
/// コードだけでUIを組むと受け皿が要るが、NSControl.target は weak なので画面側が持ち続ける。
private final class Relay: NSObject {
    private let handler: (NSControl) -> Void
    init(_ handler: @escaping (NSControl) -> Void) { self.handler = handler }
    @objc func fire(_ sender: NSControl) { handler(sender) }
}
