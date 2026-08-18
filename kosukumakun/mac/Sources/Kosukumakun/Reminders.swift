import AppKit

/// 働きすぎ防止まわり（ポモドーロ / ストレッチ / 水分）。
///
/// 設計の芯は「**割り込まない**」こと。会社で使う道具なので、
///  - 通知センターは使わない（あとで通知が積み上がって邪魔になる）
///  - 音も出さない
///  - 打鍵の途中では絶対に知らせない。手が止まるまで黙って待つ
///  - 席を外していた形跡があればタイマーは仕切り直す（戻ってきた瞬間に責められないように）
/// 伝達手段はこすくまくん自身の動きと心の声だけ。こすくまくんに口は無いので、
/// 「言う」のではなく「思っているのが漏れる」形にしている。
final class ReminderBehavior: PetBehavior {

    let priority = 40

    // MARK: - 設定（AppDelegate から Settings を流し込む）

    var pomodoroEnabled = false
    var focusSeconds: CGFloat = 25 * 60
    var breakSeconds: CGFloat = 5 * 60
    var rounds = 4
    /// 0 でオフ
    var stretchEverySeconds: CGFloat = 60 * 60
    var waterEverySeconds: CGFloat = 90 * 60
    /// 呼びかけに使う名前（"みやもとさん" など。nil なら呼ばない）
    var callName: String?

    // MARK: - 状態

    enum Phase: Equatable {
        case off
        case focus
        case rest
        case done
    }

    private(set) var phase: Phase = .off
    private(set) var remaining: CGFloat = 0
    private(set) var round = 0

    var isRunning: Bool { phase == .focus || phase == .rest }

    var phaseLabel: String {
        switch phase {
        case .off:   return "とまっている"
        case .focus: return "しゅうちゅう \(round)/\(rounds)"
        case .rest:  return "きゅうけい"
        case .done:  return "おわり"
        }
    }

    // 経過時間
    private var sinceStretch: CGFloat = 0
    private var sinceWater: CGFloat = 0

    /// 手が止まるのを待っている用件。溜め込まず、常に1件だけ持つ。
    private enum Pending { case stretch, water, focusEnd, breakEnd, allDone }
    private var pending: Pending?
    private var pendingAge: CGFloat = 0

    // 目盛りの描画
    private weak var attached: AnyObject?
    private var barBack: CAShapeLayer?
    private var barFill: CAShapeLayer?
    private var barShown = false

    // MARK: - 外から呼ぶ

    func start() {
        phase = .focus
        round = 1
        remaining = focusSeconds
        pending = nil
    }

    func stop() {
        phase = .off
        remaining = 0
        round = 0
        pending = nil
    }

    func reset() {
        stop()
        sinceStretch = 0
        sinceWater = 0
    }

    // MARK: - 毎フレーム

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        // 30分以上離席していたら全部仕切り直す。戻った瞬間に「休憩の時間です」と
        // 言われるのが一番うっとうしいので。
        if activity.idle > 30 * 60 {
            reset()
            return
        }

        if !pomodoroEnabled && phase != .off { stop() }

        // --- 時間を進める（寝ている間は数えない）---------------------
        if !brain.isAsleep {
            if stretchEverySeconds > 0 { sinceStretch += dt }
            if waterEverySeconds > 0 { sinceWater += dt }
        }

        if isRunning {
            remaining -= dt
            if remaining <= 0 {
                remaining = 0
                switch phase {
                case .focus:
                    queue(round >= rounds ? .allDone : .focusEnd)
                case .rest:
                    queue(.breakEnd)
                default:
                    break
                }
            }
        }

        // --- 用件が溜まったか ----------------------------------------
        if stretchEverySeconds > 0, sinceStretch >= stretchEverySeconds {
            sinceStretch = 0
            queue(.stretch)
        }
        if waterEverySeconds > 0, sinceWater >= waterEverySeconds {
            sinceWater = 0
            queue(.water)
        }

        deliverIfCalm(dt: dt, brain: brain, activity: activity)
        drawBar(brain)
    }

    /// 用件は1件だけ持つ。古いものは捨てる（溜めて連発すると鬱陶しい）
    private func queue(_ p: Pending) {
        pending = p
        pendingAge = 0
    }

    /// 手が空いた瞬間にだけ伝える
    private func deliverIfCalm(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let p = pending else { return }
        pendingAge += dt

        // 5分待っても手が空かないなら、その回は黙って諦める（追いかけない）
        if pendingAge > 5 * 60 { pending = nil; return }

        let calm = !activity.isTyping
            && !activity.scrolledRecently
            && activity.idle > 0.9
            && brain.state != .drag
            && brain.state != .thrown
            && brain.thought == nil
        guard calm else { return }

        if brain.isAsleep { brain.wake() }
        pending = nil

        switch p {
        case .stretch:
            brain.express(.happy, seconds: 3.0)
            brain.bounce(0.9)
            brain.think(withName("のび〜 ……しよ"), seconds: 4.2)

        case .water:
            brain.express(.dot, seconds: 0.1)
            brain.think(withName("おみず のむ？"), seconds: 4.0)

        case .focusEnd:
            phase = .rest
            remaining = breakSeconds
            brain.express(.happy, seconds: 3.0)
            brain.bounce(1.0)
            brain.think("ひとやすみ", seconds: 3.6)

        case .breakEnd:
            round += 1
            phase = .focus
            remaining = focusSeconds
            brain.express(.dot, seconds: 0.1)
            brain.think("そろそろ もどる？", seconds: 3.6)

        case .allDone:
            phase = .done
            brain.express(.happy, seconds: 4.0)
            brain.bounce(1.15)
            brain.think(withName("ぜんぶ おわった"), seconds: 4.6)
        }
    }

    private func withName(_ s: String) -> String {
        guard let n = callName, !n.isEmpty else { return s }
        return "\(n) \(s)"
    }

    // MARK: - こすくまくんの横に立てる目盛り

    /// 数字を出さない。数字は見ると焦るので、減っていく棒だけにしている。
    private func drawBar(_ brain: Brain) {
        guard let host = brain.host else { return }

        if attached !== host {
            barBack?.removeFromSuperlayer()
            barFill?.removeFromSuperlayer()
            let back = FX.shape(host)
            back.fillColor = NSColor.white.withAlphaComponent(0.92).cgColor
            back.strokeColor = Asset.ink
            back.lineJoin = .round
            let fill = FX.shape(host)
            fill.fillColor = Asset.ink
            fill.strokeColor = nil
            host.effectLayer.addSublayer(back)
            host.effectLayer.addSublayer(fill)
            barBack = back
            barFill = fill
            attached = host
        }
        guard let back = barBack, let fill = barFill else { return }

        let show = isRunning && pomodoroEnabled
        if show != barShown {
            barShown = show
            back.isHidden = !show
            fill.isHidden = !show
        }
        guard show else { return }

        let h = host.petHeight
        let w = h * 0.085
        let barH = h * 0.86
        let foot = host.footInStage
        // 顔の向きと反対側に置く。見ている方向を塞がないため。
        let side: CGFloat = host.currentFrame.faceRight ? -1 : 1
        let x = foot.x + side * (h * 0.46 + w * 0.5) - w / 2
        let y = foot.y + h * 0.06
        let r = w * 0.42

        let total = phase == .rest ? breakSeconds : focusSeconds
        let ratio = total > 0 ? max(0, min(1, remaining / total)) : 0

        back.lineWidth = max(1, h * 0.016)
        back.path = CGPath(roundedRect: CGRect(x: x, y: y, width: w, height: barH),
                           cornerWidth: r, cornerHeight: r, transform: nil)

        // 中身は下から減る。休憩中は少しだけ細くして「ゆるい時間」に見せる
        let inset = w * (phase == .rest ? 0.34 : 0.24)
        let fh = (barH - inset * 2) * ratio
        if fh > 0.5 {
            let rect = CGRect(x: x + inset, y: y + inset, width: w - inset * 2, height: fh)
            let rr = min(r, (w - inset * 2) / 2)
            fill.path = CGPath(roundedRect: rect, cornerWidth: rr, cornerHeight: rr, transform: nil)
            fill.isHidden = false
        } else {
            fill.isHidden = true
        }
    }
}
