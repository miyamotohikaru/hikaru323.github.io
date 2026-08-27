import AppKit
import ServiceManagement

extension Notification.Name {
    /// 設定が変わった合図。
    ///
    /// 値そのものは載せない（受け取った側が `Settings.shared` を読み直す）。
    /// どの項目が変わったかだけ見たい時は `userInfo[Settings.changedKey]` に保存キーが入っている。
    static let kosuSettingsChanged = Notification.Name("kosu.settingsChanged")
}

/// UserDefaults に置いておく設定。
///
/// 設計の芯:
///  - **値はメモリに持つ**。こすくまくんの update は毎フレーム走るので、
///    参照のたびに UserDefaults を叩かせない。UserDefaults に触るのは「変わった時」だけ。
///  - **OKボタンを作らない**。書いた瞬間に反映して通知を投げる。待たせない。
///  - 会社のMacに置くものなので、保存するのは見た目と間の取り方だけ。
///    個人に紐づくものは「呼びかけに使う名前」しかなく、それもこのMacから出ない。
final class Settings {

    static let shared = Settings()

    /// 通知の userInfo に入る、変わった項目の保存キー
    static let changedKey = "key"

    // MARK: - 取りうる範囲
    //
    // 設定画面もここを見る。上限下限を画面側と二重に書くと、いつかズレるので。

    static let heightRange: ClosedRange<CGFloat> = 80...240    // pt
    static let sleepRange:  ClosedRange<CGFloat> = 1...60      // 分
    static let focusRange:  ClosedRange<Int> = 5...90          // 分
    static let breakRange:  ClosedRange<Int> = 1...30          // 分
    static let roundsRange: ClosedRange<Int> = 1...12          // 回
    static let everyRange:  ClosedRange<Int> = 0...240         // 分（0でオフ）
    static let nameMax = 24                                    // 文字

    // MARK: - 保存キー

    private enum K {
        static let displayHeight   = "kosu.displayHeight"
        static let wanders         = "kosu.wanders"
        static let sleepAfter      = "kosu.sleepAfter"
        static let thoughtsEnabled = "kosu.thoughtsEnabled"
        static let autoScreenPeek  = "kosu.autoScreenPeek"
        static let pomodoroEnabled = "kosu.pomodoroEnabled"
        static let pomodoroFocus   = "kosu.pomodoroFocus"
        static let pomodoroBreak   = "kosu.pomodoroBreak"
        static let pomodoroRounds  = "kosu.pomodoroRounds"
        static let stretchEvery    = "kosu.stretchEvery"
        static let waterEvery      = "kosu.waterEvery"
        static let userName        = "kosu.userName"
        /// ログイン項目だけは UserDefaults に持たない（正は OS 側）。通知の名札としてだけ使う
        static let launchAtLogin   = "kosu.launchAtLogin"
    }

    private let store: UserDefaults
    /// 起動時の読み込み中は書き戻さない（読んだ値をそのまま保存し直すのは無駄なので）
    private var loading = true

    // MARK: - 見た目と動き

    /// こすくまくんの表示身長(pt)。Brain.displayHeight にそのまま入れる
    var displayHeight: CGFloat = 140 {
        didSet {
            displayHeight = Settings.clamp(displayHeight, Settings.heightRange).rounded()
            guard displayHeight != oldValue else { return }
            save(K.displayHeight, Double(displayHeight))
        }
    }

    /// 勝手に動き回るか。オフなら置いた場所から動かない
    var wanders = true {
        didSet {
            guard wanders != oldValue else { return }
            save(K.wanders, wanders)
        }
    }

    /// 何分ほうっておくと寝るか（**分**。Brain は秒なので sleepAfterSeconds を渡す）
    var sleepAfter: CGFloat = 3 {
        didSet {
            sleepAfter = Settings.clamp(sleepAfter, Settings.sleepRange)
            guard sleepAfter != oldValue else { return }
            save(K.sleepAfter, Double(sleepAfter))
        }
    }

    // MARK: - ふるまい

    /// 心の声（口がないので、しゃべらせず頭の上に浮かべる）を出すか
    var thoughtsEnabled = true {
        didSet {
            guard thoughtsEnabled != oldValue else { return }
            save(K.thoughtsEnabled, thoughtsEnabled)
        }
    }

    /// 手が止まったら自分で画面のはしへどくか。
    /// **一度のぞく形になったら、やめると言うまで そのまま。** ここは「自分から行くか」だけ。
    var autoScreenPeek = true {
        didSet {
            guard autoScreenPeek != oldValue else { return }
            save(K.autoScreenPeek, autoScreenPeek)
        }
    }

    /// 呼びかけに使う名前。空でよい（空なら呼びかけない）
    var userName = "" {
        didSet {
            var n = userName.trimmingCharacters(in: .whitespacesAndNewlines)
            if n.count > Settings.nameMax { n = String(n.prefix(Settings.nameMax)) }
            userName = n
            guard userName != oldValue else { return }
            save(K.userName, userName)
        }
    }

    // MARK: - ポモドーロ

    /// ポモドーロを使うか。仕事の邪魔をしないよう、既定はオフ（自分で入れてもらう）
    var pomodoroEnabled = false {
        didSet {
            guard pomodoroEnabled != oldValue else { return }
            save(K.pomodoroEnabled, pomodoroEnabled)
        }
    }

    /// 集中の長さ（分）
    var pomodoroFocus = 25 {
        didSet {
            pomodoroFocus = Settings.clamp(pomodoroFocus, Settings.focusRange)
            guard pomodoroFocus != oldValue else { return }
            save(K.pomodoroFocus, pomodoroFocus)
        }
    }

    /// 休憩の長さ（分）
    var pomodoroBreak = 5 {
        didSet {
            pomodoroBreak = Settings.clamp(pomodoroBreak, Settings.breakRange)
            guard pomodoroBreak != oldValue else { return }
            save(K.pomodoroBreak, pomodoroBreak)
        }
    }

    /// 1セットで何回くり返すか
    var pomodoroRounds = 4 {
        didSet {
            pomodoroRounds = Settings.clamp(pomodoroRounds, Settings.roundsRange)
            guard pomodoroRounds != oldValue else { return }
            save(K.pomodoroRounds, pomodoroRounds)
        }
    }

    // MARK: - そっと知らせるもの（0でオフ）

    /// のびをする合図の間隔（分。0でオフ）
    var stretchEvery = 60 {
        didSet {
            stretchEvery = Settings.clamp(stretchEvery, Settings.everyRange)
            guard stretchEvery != oldValue else { return }
            save(K.stretchEvery, stretchEvery)
        }
    }

    /// 水分をとる合図の間隔（分。0でオフ。口がないので「飲む」ではなくコップを抱える）
    var waterEvery = 90 {
        didSet {
            waterEvery = Settings.clamp(waterEvery, Settings.everyRange)
            guard waterEvery != oldValue else { return }
            save(K.waterEvery, waterEvery)
        }
    }

    // MARK: - ログイン時に起動
    //
    // ここだけ UserDefaults を正にしない。ユーザーはシステム設定側でも切り替えられるので、
    // 二か所に真実があると必ず食い違う。毎回 OS に聞いて、OS に書く。

    /// 登録に失敗した時の理由（設定画面が小さく出す。ダイアログは出さない）
    private(set) var lastLoginItemError: String?

    /// .app として起動している時だけ触れる（開発中に実行ファイルを直接叩いた時は不可）
    static var loginItemAvailable: Bool {
        Bundle.main.bundleIdentifier != nil && Bundle.main.bundleURL.pathExtension == "app"
    }

    var launchAtLogin: Bool {
        get {
            guard Settings.loginItemAvailable else { return false }
            return SMAppService.mainApp.status == .enabled
        }
        set {
            guard Settings.loginItemAvailable, newValue != launchAtLogin else { return }
            do {
                if newValue {
                    try SMAppService.mainApp.register()
                } else {
                    try SMAppService.mainApp.unregister()
                }
                lastLoginItemError = nil
                announce(K.launchAtLogin)
            } catch {
                // 未署名や、システム設定でブロックされている時はここに来る。
                // 常駐アプリが勝手にダイアログを出すのは邪魔なので、画面に小さく出すだけにする
                lastLoginItemError = error.localizedDescription
            }
        }
    }

    /// 「システム設定で許可待ち」の状態か（macOS がユーザーの確認を待っている）
    var loginItemNeedsApproval: Bool {
        guard Settings.loginItemAvailable else { return false }
        return SMAppService.mainApp.status == .requiresApproval
    }

    // MARK: - 秒で欲しい人向け
    //
    // 画面には分で出す（人が読む単位）が、ふるまい側は秒で回っているので両方用意する。

    var sleepAfterSeconds: CGFloat { sleepAfter * 60 }
    var pomodoroFocusSeconds: CGFloat { CGFloat(pomodoroFocus) * 60 }
    var pomodoroBreakSeconds: CGFloat { CGFloat(pomodoroBreak) * 60 }
    /// 0 ならオフ
    var stretchEverySeconds: CGFloat { CGFloat(stretchEvery) * 60 }
    /// 0 ならオフ
    var waterEverySeconds: CGFloat { CGFloat(waterEvery) * 60 }

    /// 心の声で呼びかける時の「○○さん」。名前が空なら nil（＝呼びかけない）
    var callName: String? {
        guard !userName.isEmpty else { return nil }
        // 自分で敬称まで書いた人に、さらに「さん」を足さない
        let already = ["さん", "くん", "君", "ちゃん", "様", "さま", "氏", "先生"]
        return already.contains(where: { userName.hasSuffix($0) }) ? userName : userName + "さん"
    }

    // MARK: - 読み込み

    private init(store: UserDefaults = .standard) {
        self.store = store
        // 既定値は register で先に入れておく。以降 double/bool/integer が 0 や false を返さない
        store.register(defaults: [
            K.displayHeight: 140.0,
            K.wanders: true,
            K.sleepAfter: 3.0,
            K.thoughtsEnabled: true,
            K.autoScreenPeek: true,
            K.pomodoroEnabled: false,
            K.pomodoroFocus: 25,
            K.pomodoroBreak: 5,
            K.pomodoroRounds: 4,
            K.stretchEvery: 60,
            K.waterEvery: 90,
            K.userName: "",
        ])

        // 保存が壊れていても落ちないよう、読んだ値はここで範囲に押し込む
        displayHeight   = Settings.clamp(CGFloat(store.double(forKey: K.displayHeight)),
                                         Settings.heightRange).rounded()
        wanders         = store.bool(forKey: K.wanders)
        sleepAfter      = Settings.clamp(CGFloat(store.double(forKey: K.sleepAfter)),
                                         Settings.sleepRange)
        thoughtsEnabled = store.bool(forKey: K.thoughtsEnabled)
        autoScreenPeek  = store.bool(forKey: K.autoScreenPeek)
        pomodoroEnabled = store.bool(forKey: K.pomodoroEnabled)
        pomodoroFocus   = Settings.clamp(store.integer(forKey: K.pomodoroFocus), Settings.focusRange)
        pomodoroBreak   = Settings.clamp(store.integer(forKey: K.pomodoroBreak), Settings.breakRange)
        pomodoroRounds  = Settings.clamp(store.integer(forKey: K.pomodoroRounds), Settings.roundsRange)
        stretchEvery    = Settings.clamp(store.integer(forKey: K.stretchEvery), Settings.everyRange)
        waterEvery      = Settings.clamp(store.integer(forKey: K.waterEvery), Settings.everyRange)
        userName        = store.string(forKey: K.userName) ?? ""

        loading = false
    }

    // MARK: - 書き込みと通知

    private func save(_ key: String, _ value: Any) {
        guard !loading else { return }
        store.set(value, forKey: key)
        announce(key)
    }

    private func announce(_ key: String) {
        NotificationCenter.default.post(name: .kosuSettingsChanged, object: self,
                                        userInfo: [Settings.changedKey: key])
    }

    private static func clamp(_ v: CGFloat, _ r: ClosedRange<CGFloat>) -> CGFloat {
        v.isFinite ? min(max(v, r.lowerBound), r.upperBound) : r.lowerBound
    }

    private static func clamp(_ v: Int, _ r: ClosedRange<Int>) -> Int {
        min(max(v, r.lowerBound), r.upperBound)
    }
}

// MARK: - Brain へ流し込む

extension Settings {
    /// 起動時と `.kosuSettingsChanged` のたびに呼ぶと、設定がこすくまくんに届く。
    /// 見た目の反映は次のフレームで勝手に起きる（Brain が毎フレーム frame を作り直すので）。
    func apply(to brain: Brain) {
        brain.displayHeight = displayHeight
        brain.wanders = wanders
        brain.sleepAfter = sleepAfterSeconds
    }
}
