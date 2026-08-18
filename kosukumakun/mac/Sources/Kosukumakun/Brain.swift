import AppKit

/// 追加のふるまい（金平糖・つぶやき・通知など）を差し込む口。
protocol PetBehavior: AnyObject {
    var priority: Int { get }              // 大きいほど強い。演出の取り合いを決める
    func update(dt: CGFloat, brain: Brain, activity: Activity)
}

/// こすくまくんの頭の中。
///
/// 設計の芯:
///  - こすくまくんは関節で歩くキャラではないので「ぽてぽて跳ねる」で移動する
///  - **口がない** ので、感情は「目」と「体の変形」だけで出す。しゃべらせない
///  - 何もない時はほぼ動かない（＝再描画も止まる）。仕事の邪魔をしないことが最優先
final class Brain {

    enum State: Equatable {
        case idle          // 座ってふわふわ
        case hop           // ぽてぽて移動中
        case drag          // つままれてもちもち
        case thrown        // 投げられて落下中
        case pet           // なでられている
        case dozing        // うとうと
        case sleep         // 丸まって寝ている
        case peek          // ウィンドウの縁に乗って顔だけ出している
    }

    // MARK: 出力
    private(set) var frame = PetFrame()
    /// 足元のスクリーン座標
    private(set) var pos = CGPoint(x: 400, y: 200)

    // MARK: 状態
    private(set) var state: State = .idle
    private var stateTime: CGFloat = 0
    private var vel = CGVector.zero
    private var ground: CGFloat = 0

    // 見た目のパラメータ
    private var breath: CGFloat = 0
    private var blinkTimer: CGFloat = 2
    private var blink: CGFloat = 0
    private var look = CGPoint.zero
    private var lookTarget = CGPoint.zero
    private var lookIdleTimer: CGFloat = 0
    private var jellyT: CGFloat = 10        // 着地からの経過（ぷるぷるの余韻）
    private var facingRight = true
    private var emotionHold: CGFloat = 0
    private var emotion: EyeStyle = .dot
    private var squish: CGFloat = 0
    private var nextHop: CGFloat = 6
    // キーボードふみふみ用
    private var typing = false
    private var lastStrokes = -1
    // スクロールへの反応
    private var scrollT: CGFloat = 0        // 反応が続く残り時間
    private var scrollDir = 0
    private var scrollBob: CGFloat = 0
    /// 金平糖を転がしている向き（-1 左 / +1 右 / 0 転がしていない）と、転がりの位相
    private(set) var rollDir = 0
    private(set) var rollPhase: CGFloat = 0
    private var tapHold: CGFloat = 0       // 叩いて沈んでいる残り時間
    private var tapDir = 1                 // 次にどちらを叩くか
    private var lift: CGFloat = 0          // キーボードの上に立つときの持ち上げ(pt)
    // ウィンドウの縁からのぞくとき
    private var peekY: CGFloat = 0
    private var peekCheck: CGFloat = 0
    private var peekWindow: CGWindowID = 0
    private var peekOffsetX: CGFloat = 0     // 窓の左端からの相対位置。窓が動いても保つ
    private var peekOffsetY: CGFloat = 0     // 横の縁のときの、窓の下端からの相対位置
    private var peekKind: WindowEdges.Kind = .top
    /// 横の縁で、体のどれだけを外に出すか
    private let peekColsRatio: CGFloat = 0.70
    /// 顔出しのとき、上から何行ぶん見せるか（頭＋耳＋前足まで）
    private let peekRows = 24
    /// 画面の上に余裕が無い窓では、入るぶんだけに減らす
    private var peekRowsNow = 24
    /// これより少ないと 頭にならないので、その窓の上端には付かない
    private let peekRowsMin = 13
    // つままれて伸びる量。カーソルに体が追いつけていない距離＝もちもちの伸び。
    private var dragPull: CGFloat = 0

    // ドラッグ
    private var dragOffset = CGVector.zero
    private var dragPointer = CGPoint.zero
    private var dragPrev: [(CGPoint, Double)] = []

    /// 差し込まれたふるまい
    var behaviors: [PetBehavior] = []
    /// 演出を載せる先（PetView）
    weak var host: EffectHost?

    /// つぶやき（口がないので「心の声」。表示は ThoughtLayer が担当）
    private(set) var thought: String?
    private(set) var thoughtLeft: CGFloat = 0
    /// 豆知識のように漢字が入るものは大きい字で出す（小さいと漢字が潰れて読めない）
    private(set) var thoughtBig = false

    // 設定
    var displayHeight: CGFloat = 140
    var sleepAfter: CGFloat = 180           // 放置何秒で寝るか
    var wanders = true                      // 勝手に動き回るか

    // MARK: - 外から呼ぶ操作

    /// 心の声をしばらく出す
    func think(_ text: String, seconds: CGFloat = 3.4, big: Bool = false) {
        thought = text
        thoughtLeft = seconds
        thoughtBig = big
    }

    /// 表情をしばらく固定する
    func express(_ e: EyeStyle, seconds: CGFloat = 1.6) {
        emotion = e
        emotionHold = max(emotionHold, seconds)
    }

    /// その場でぴょんと跳ねる
    func bounce(_ power: CGFloat = 1) {
        guard state == .idle || state == .hop else { return }
        vel.dy = 430 * power
        state = .hop
        stateTime = 0
    }

    /// 行き先を決めて跳ねていく
    func hop(towards x: CGFloat) {
        guard state == .idle || state == .hop else { return }
        let dx = x - pos.x
        facingRight = dx >= 0
        vel.dx = max(-260, min(260, dx * 1.4))
        vel.dy = 380
        state = .hop
        stateTime = 0
    }

    /// 起動時の立ち位置
    func setStart(_ p: CGPoint) {
        pos = p
        ground = p.y
    }

    /// 画面の外に出てしまった時に呼び戻す。
    /// 縁に乗っている・つままれている・飛んでいる、どの途中でも解除して足元に戻す。
    func recall(to p: CGPoint) {
        state = .idle
        stateTime = 0
        vel = .zero
        pos = p
        ground = p.y
        peekWindow = 0
        rollDir = 0
        scrollT = 0
        dragPull = 0
        lift = 0
        jellyT = 0
        express(.wide, seconds: 0.8)
    }

    /// いま画面の中にちゃんと居るか。半分でも見えていれば居るとみなす。
    func isVisible(on screens: [NSScreen]) -> Bool {
        let m = displayHeight * 0.35
        return screens.contains { s in
            let f = s.visibleFrame
            return pos.x > f.minX - m && pos.x < f.maxX + m
                && pos.y > f.minY - m && pos.y < f.maxY + displayHeight
        }
    }

    /// メニューから寝かせる
    func forceSleep() {
        state = .sleep
        stateTime = 0
        vel = .zero
    }

    func wake() {
        if state == .sleep || state == .dozing {
            state = .idle
            stateTime = 0
            express(.wide, seconds: 0.7)
            jellyT = 0
        }
    }

    /// キーボードを叩いているとき、いまどちら側を叩いているか（-1 左 / +1 右 / 0 叩いていない）。
    /// キーの沈みと体の動きがずれると「叩いている」に見えないので、
    /// **どちらもこの1つの値を見る**。
    var tapSide: Int {
        guard typing, state == .idle, tapHold > 0 else { return 0 }
        return tapDir
    }

    var isAsleep: Bool { state == .sleep || state == .dozing }
    /// 何も動いていない＝描画をほぼ止めてよい。
    /// 寝ているときだけでなく、**ただ座っていて何も起きていないとき** も含める。
    /// ここを狭くすると、置いてあるだけでCPUを食い続ける。
    var isQuiet: Bool {
        guard thought == nil, abs(vel.dx) < 1, abs(vel.dy) < 1 else { return false }
        // .peek をここに入れてはいけない。フレームレートが落ちると
        // マウス判定の更新も遅くなり、つかもうとしたクリックが素通りする（実際にそうなった）。
        if state == .sleep { return true }
        return state == .idle && !typing && jellyT > 1.0
    }

    // MARK: - ドラッグ

    func beginDrag(at p: CGPoint) {
        // 縁に乗っていてもつかめる。つかんだ瞬間に縁から手を離して、
        // いつも通り「つままれて伸びる → 放すと落ちる」に戻る。
        peekWindow = 0
        state = .drag
        stateTime = 0
        dragPull = 0
        dragOffset = CGVector(dx: pos.x - p.x, dy: pos.y - p.y)
        dragPointer = p
        dragPrev = [(p, CACurrentMediaTime())]
        express(.wide, seconds: 0.5)
    }

    func moveDrag(to p: CGPoint) {
        guard state == .drag else { return }
        dragPointer = p
        dragPrev.append((p, CACurrentMediaTime()))
        if dragPrev.count > 6 { dragPrev.removeFirst() }
    }

    func endDrag() {
        guard state == .drag else { return }
        // 直近の動きから投げの初速を作る
        var v = CGVector.zero
        if let first = dragPrev.first, let last = dragPrev.last, last.1 > first.1 {
            let dt = CGFloat(last.1 - first.1)
            v = CGVector(dx: (last.0.x - first.0.x) / dt, dy: (last.0.y - first.0.y) / dt)
        }
        // 放した場所の近くにウィンドウの上端があれば、そこにちょこんと乗る。
        // ここの条件は最初きつすぎて（初速380以下・許容0.5身長）ほとんど乗らなかった。
        // ふつうにドラッグするだけで初速はすぐ380を超える。思い切りゆるめる。
        let gentle = hypot(v.dx, v.dy) < 1400
        // 乗せるのが難しいと言われたので、捕まる範囲をさらに広げる。
        // 窓の上の方に持っていけば吸い付く、くらいでちょうどよい。
        // 捕まる範囲を身長だけで決めると、小さく設定している人ほど乗せにくくなる。
        // （実測: 身長90に設定されていて、範囲が144ptしか無かった）
        // 画面の大きさは身長と関係ないので、下限を絶対値で入れる。
        let catchRange = max(displayHeight * 1.6, 200)
        let edgeFound = WindowEdges.topEdgeNear(pos, tolerance: catchRange)
        // 手放した瞬間の判定を必ず記録する。画面を見られないので、
        // ここに残っている事実だけが頼りになる（~/kosukuma-drop.log）
        DropLog.write(pos: pos, speed: hypot(v.dx, v.dy), gentle: gentle, edge: edgeFound,
                      height: displayHeight)
        // 上端に乗ると、こすくまくんは縁より上に出る。
        // ターミナルのように画面いっぱいの窓だと、そこに出せる高さが残っていない。
        // **乗せないのではなく、入るぶんだけ顔を出す**（少しだけひょこっと覗く形になる）。
        var topOK = edgeFound
        peekRowsNow = peekRows
        if let e = edgeFound {
            let screenTop = (NSScreen.screens.first { $0.frame.contains(pos) }
                             ?? NSScreen.main ?? NSScreen.screens[0]).visibleFrame.maxY
            let room = screenTop - e.rect.maxY
            let fit = Int(room / CGFloat(pixelScale))
            if fit < peekRows {
                // 頭の形にならないほど狭ければ、上端はあきらめて横の縁を探す
                if fit < peekRowsMin { topOK = nil } else { peekRowsNow = fit }
            }
        }
        // 上端で拾えなければ、左右の縁も見る
        let sideFound = topOK == nil ? WindowEdges.sideEdgeNear(pos, tolerance: catchRange * 0.7) : nil

        if gentle, let edge = topOK ?? sideFound {
            peekKind = edge.kind
            peekWindow = edge.id
            switch edge.kind {
            case .top:
                pos.y = edge.rect.maxY
                pos.x = max(edge.rect.minX + displayHeight * 0.2,
                            min(edge.rect.maxX - displayHeight * 0.2, pos.x))
                peekOffsetX = pos.x - edge.rect.minX
            case .left:
                pos.x = edge.rect.minX
                pos.y = max(edge.rect.minY + displayHeight * 0.3,
                            min(edge.rect.maxY - displayHeight * 0.3, pos.y))
                peekOffsetY = pos.y - edge.rect.minY
            case .right:
                pos.x = edge.rect.maxX
                pos.y = max(edge.rect.minY + displayHeight * 0.3,
                            min(edge.rect.maxY - displayHeight * 0.3, pos.y))
                peekOffsetY = pos.y - edge.rect.minY
            }
            peekY = pos.y
            peekCheck = 0.25
            vel = .zero
            state = .peek
            stateTime = 0
            express(.happy, seconds: 1.0)
            return
        }

        vel = CGVector(dx: max(-900, min(900, v.dx)), dy: max(-900, min(1100, v.dy)))
        state = .thrown
        stateTime = 0
    }

    func petting(at p: CGPoint) {
        guard state == .idle || state == .hop || state == .pet else { return }
        state = .pet
        stateTime = 0
        express(.happy, seconds: 1.2)
    }

    // MARK: - 毎フレーム

    func update(dt: CGFloat, activity: Activity, screen: NSRect) {
        stateTime += dt
        ground = screen.minY + 6

        // 打鍵に合わせて足踏みする。速く打つほど速く踏む（Comnyang の「ふみふみ」相当）。
        // キーの中身は見ていない。打っているかどうかしか分からないので、それで十分。
        // **打鍵1回につき1回だけ叩く。** 以前は自前の振動で動かしていたので、
        // 実際の打鍵と無関係に速く動いてしまっていた。
        typing = activity.isTyping
        if lastStrokes < 0 { lastStrokes = activity.strokes }
        if activity.strokes != lastStrokes {
            lastStrokes = activity.strokes
            tapDir = -tapDir
            tapHold = 0.26               // 沈んでから戻るまで。速いとカチカチが忙しなく見える
        }
        tapHold = max(0, tapHold - dt)
        if !typing { tapHold = 0 }

        // キーボードの上に立つぶんの持ち上げ。急に上がると跳ねたように見えるのでゆっくり。
        let wantLift: CGFloat = (typing && state == .idle) ? KeyboardBehavior.liftFor(scale: pixelScale) : 0
        lift = approach(lift, wantLift, rate: 9, dt: dt)

        // スクロールしている間だけ、大きい金平糖を糞転がしのように押していく。
        //   下へスクロール → 右へ転がす / 上へ → 左へ
        // **動いた距離のぶんだけ転がす。** 一定の速さで動かすと、
        // ちょっとスクロールしただけで遠くまで行ってしまう。
        let moved = activity.consumeScroll()
        if activity.scrolledRecently, !isAsleep, state == .idle {
            scrollT = 0.10                       // 手を止めたらすぐ終わる
            if activity.scrollDir != 0 {
                rollDir = activity.scrollDir == -1 ? 1 : -1
            } else if rollDir == 0 {
                rollDir = -1
            }
        }
        if scrollT > 0 {
            scrollT -= dt
            var step: CGFloat
            if abs(moved) > 0.01 {
                // スクロール量そのものを移動距離にする（1:1だと速すぎるので少し抑える）
                step = abs(moved) * 0.55
                rollDir = moved > 0 ? -1 : 1
            } else {
                // 量が取れない環境。ゆっくり一定で転がす
                step = displayHeight * 0.5 * dt
            }
            step = min(step, displayHeight * 0.9)      // 一気に飛ばない上限
            scrollBob += step / max(1, displayHeight) * 9
            rollPhase += step / max(1, displayHeight) * 7
            pos.x += CGFloat(rollDir) * step
            let halfW = displayHeight * 0.38
            pos.x = max(screen.minX + halfW, min(screen.maxX - halfW, pos.x))
            if scrollT <= 0 { rollDir = 0; scrollBob = 0 }
        }

        // 放置で寝る / 触られて起きる
        if activity.idle < 0.4 { wake() }
        if state == .idle, activity.idle > sleepAfter { state = .dozing; stateTime = 0 }

        switch state {
        case .idle:    updateIdle(dt, activity)
        case .hop:     updatePhysics(dt, screen: screen, restitution: 0.42)
        case .thrown:  updatePhysics(dt, screen: screen, restitution: 0.52)
        case .drag:    updateDrag(dt)
        case .pet:     if stateTime > 0.45 { state = .idle; stateTime = 0 }
        case .dozing:  if stateTime > 2.2 { state = .sleep; stateTime = 0 }
        case .sleep:   break
        case .peek:    updatePeek(dt)
        }

        for b in behaviors.sorted(by: { $0.priority > $1.priority }) {
            b.update(dt: dt, brain: self, activity: activity)
        }

        updateFace(dt, activity)
        if thoughtLeft > 0 {
            thoughtLeft -= dt
            if thoughtLeft <= 0 { thought = nil }
        }
        buildFrame(dt)
    }

    // MARK: - 各状態

    private func updateIdle(_ dt: CGFloat, _ a: Activity) {
        // 呼吸
        breath += dt * (a.isTyping ? 1.9 : 1.05)

        // タイピング中は端に寄って邪魔しない
        guard wanders, !a.isTyping else { return }
        nextHop -= dt
        if nextHop <= 0 {
            nextHop = CGFloat.random(in: 7...16)
            if Bool.random() {
                bounce(CGFloat.random(in: 0.7...1.0))
            } else {
                hop(towards: pos.x + CGFloat.random(in: -150...150))
            }
        }
    }

    private func updatePhysics(_ dt: CGFloat, screen: NSRect, restitution: CGFloat) {
        vel.dy -= 2000 * dt
        pos.x += vel.dx * dt
        pos.y += vel.dy * dt

        let halfW = displayHeight * 0.38
        if pos.x < screen.minX + halfW { pos.x = screen.minX + halfW; vel.dx = abs(vel.dx) * 0.5 }
        if pos.x > screen.maxX - halfW { pos.x = screen.maxX - halfW; vel.dx = -abs(vel.dx) * 0.5 }

        if pos.y <= ground {
            pos.y = ground
            if vel.dy < -140 {
                vel.dy = -vel.dy * restitution
                vel.dx *= 0.62
                jellyT = 0                       // 着地でぷるん
            } else {
                vel = .zero
                state = .idle
                stateTime = 0
                nextHop = CGFloat.random(in: 5...12)
            }
        }
        if abs(vel.dx) > 4 { facingRight = vel.dx > 0 }
    }

    /// 縁に乗っている間。
    /// **乗った窓を番号で覚えているので、窓を動かすとこすくまくんもついていく。**
    /// 窓が閉じたら（見つからなくなったら）落ちる。
    private func updatePeek(_ dt: CGFloat) {
        peekCheck -= dt
        if peekCheck <= 0 {
            peekCheck = 0.1        // 1つの窓を見るだけなので軽い
            if let e = WindowEdges.edge(ofWindow: peekWindow) {
                switch peekKind {
                case .top:
                    peekY = e.rect.maxY
                    pos.x = min(max(e.rect.minX + peekOffsetX, e.rect.minX + displayHeight * 0.15),
                                e.rect.maxX - displayHeight * 0.15)
                case .left:
                    pos.x = e.rect.minX
                    peekY = min(max(e.rect.minY + peekOffsetY, e.rect.minY + displayHeight * 0.25),
                                e.rect.maxY - displayHeight * 0.25)
                case .right:
                    pos.x = e.rect.maxX
                    peekY = min(max(e.rect.minY + peekOffsetY, e.rect.minY + displayHeight * 0.25),
                                e.rect.maxY - displayHeight * 0.25)
                }
            } else {
                state = .thrown
                vel = CGVector(dx: 0, dy: -30)
                express(.wide, seconds: 0.6)
                peekWindow = 0
                return
            }
        }
        pos.y = peekY
    }

    private func updateDrag(_ dt: CGFloat) {
        let target = CGPoint(x: dragPointer.x + dragOffset.dx, y: dragPointer.y + dragOffset.dy)
        // わざと少し遅れて追いかける。この「遅れ」がそのまま伸びの量になる。
        // 遅れなく追従させると、持ち上げてもぜんぜん伸びない置き物になる。
        // 追従をさらに遅らせる。この「遅れ」がそのまま伸びになるので、
        // 速く振り回すほど大きく伸びる。
        pos = approach(pos, target, rate: 9, dt: dt)
        let lag = hypot(target.x - pos.x, target.y - pos.y)
        dragPull = approach(dragPull, lag, rate: 18, dt: dt)
    }

    // MARK: - 顔

    private func updateFace(_ dt: CGFloat, _ a: Activity) {
        // まばたき
        if state != .sleep {
            blinkTimer -= dt
            if blinkTimer <= 0 {
                blinkTimer = CGFloat.random(in: 2.4...6.5)
                blink = 1
            }
            blink = max(0, blink - dt * 9)
        } else {
            blink = 1
        }

        // 視線: カーソルが近ければ追う。遠ければたまにきょろっとする
        let d = hypot(a.pointer.x - pos.x, a.pointer.y - (pos.y + displayHeight * 0.62))
        if d < 520 && !isAsleep {
            let dx = (a.pointer.x - pos.x) / 260
            let dy = (a.pointer.y - (pos.y + displayHeight * 0.62)) / 260
            lookTarget = CGPoint(x: max(-1, min(1, dx)), y: max(-1, min(1, dy)))
            lookIdleTimer = 0
        } else {
            lookIdleTimer -= dt
            if lookIdleTimer <= 0 {
                lookIdleTimer = CGFloat.random(in: 2.0...5.5)
                lookTarget = CGPoint(x: CGFloat.random(in: -0.55...0.55),
                                     y: CGFloat.random(in: -0.25...0.35))
            }
        }
        look = approach(look, lookTarget, rate: 7, dt: dt)

        if emotionHold > 0 {
            emotionHold -= dt
            if emotionHold <= 0 { emotion = .dot }
        }
        squish = approach(squish, state == .pet ? 0.55 : 0, rate: 12, dt: dt)
        jellyT += dt
    }

    // MARK: - 見た目を組み立てる

    /// 見た目を組み立てる。
    ///
    /// ドット絵なので「なめらかに変形させる」のではなく **コマを選ぶ**。
    /// 潰れ・伸びは squash / stretch のスプライトに焼いてあるので、
    /// あとはどの瞬間にどれを出すかを決めるだけ。昔のゲームと同じ作り方。
    private func buildFrame(_ dt: CGFloat) {
        var f = PetFrame()
        f.foot = PetWindow.anchor
        // **左右反転はしない。** 依頼で「移動しても そのまま」と決めた。
        // こすくまくんは正面から見た絵が正であり、鏡像にするとほくろが反対側に来て
        // 別のくまになってしまう。移動方向は体の傾きではなく動きだけで見せる。
        f.faceRight = true
        f.pixelScale = pixelScale

        // 視線: 1ドットしか動かせないので、はっきり横を向いた時だけずらす
        f.look = look.x > 0.34 ? 1 : (look.x < -0.34 ? -1 : 0)

        let closed = blink > 0.35 || (emotionHold > 0 && emotion.closed)

        switch state {
        case .sleep:
            f.sprite = "lying"
            f.look = 0

        case .dozing:
            f.sprite = "blink"
            f.look = 0

        case .peek:
            f.shadow = 0
            switch peekKind {
            case .top:
                // 上端から顔だけ出す。下半分は縁に隠れている、という見立て。
                f.sprite = closed ? "blink" : "idle"
                f.peekRows = peekRowsNow
            case .left, .right:
                // 横の縁からひょこっと。**専用の「ふりむき」の姿**を使う。
                // 寝そべりだと寝ている時と同じ絵になり、正面だとただ半分隠れただけに見えた。
                // ふりむきは元から顔が左に寄っているので、縁から覗くのにそのまま合う。
                f.sprite = "turn"
                let sp = SpriteBank.sprite("turn")
                f.peekCols = max(6, Int(CGFloat(sp.w) * peekColsRatio))
                f.peekSide = (peekKind == .left) ? -1 : 1
                f.faceRight = (peekKind == .left)
            }

        case .drag:
            // 引っぱった距離でコマを選ぶ。ドット絵は連続変形できないので、
            // 段階を用意して切り替えることで「もちもち伸びる」を作る。
            let h = displayHeight
            switch dragPull {
            case ..<(h * 0.08): f.sprite = "pull1"
            case ..<(h * 0.20): f.sprite = "pull2"
            case ..<(h * 0.38): f.sprite = "pull3"
            default:            f.sprite = "pull4"
            }

        case .pet:
            // なでられたら少し潰れる
            f.sprite = "squash"

        case .hop, .thrown:
            // 上がっている間は伸び、落ちて着く直前は潰れる
            if vel.dy > 60 {
                f.sprite = "stretch"
            } else if vel.dy < -60 && pos.y - ground < displayHeight * 0.35 {
                f.sprite = "squash"
            } else {
                f.sprite = closed ? "blink" : "idle"
            }

        case .idle:
            // 着地の余韻でひと潰れ。これがあるだけで急に生きて見える
            if jellyT < 0.13 {
                f.sprite = "squash"
            } else if jellyT < 0.24 {
                f.sprite = "stretch"
            } else if scrollT > 0 {
                // 押している最中は **横向き（ふりむき）の姿**。
                // 正面のまま横へ動くと「滑っている」ように見えるので、
                // 進む方へ体を向ける。ふりむきは元から顔が左寄りなので、
                // 右へ進むときだけ反転する。
                f.sprite = "turn"
                f.faceRight = rollDir < 0
                f.offsetX = CGFloat(-rollDir * pixelScale)   // 少しのけぞって押す
                f.lift = (Int(scrollBob) % 2 == 0) ? 0 : CGFloat(pixelScale)
            } else if typing {
                // キーを叩く。tap(33ドット) は idle より1ドット低いので、
                // 叩く瞬間だけ沈む。さらに叩く側へ1ドット寄せると、
                // 腕を動かさなくても「そっちを叩いた」ように読める。
                // 叩いている瞬間だけ沈む。押していない間はふつうに立っている。
                let side = tapSide
                f.sprite = side == 0 ? "idle" : "tap"
                f.offsetX = CGFloat(side * pixelScale)
            } else {
                f.sprite = closed ? "blink" : "idle"
            }
        }

        // 呼吸。ドット絵で縦に伸縮させるとガタつくので、
        // 「ごくたまに1コマだけ潰れる」だけにしてある。
        if f.sprite == "idle", sin(breath) > 0.985 {
            f.sprite = "squash"
        }

        f.lift = lift

        // 浮いている間は影を薄く
        let air = max(0, pos.y - ground)
        f.shadow = (state == .drag || air > 1) ? max(0.0, 0.13 - air / 900) : 0.13
        if state == .sleep { f.shadow = 0.10 }

        frame = f
    }

    /// 表示身長(pt) から整数倍の拡大率を決める。
    /// 半端な倍率で拡大するとドットがにじむので、必ず整数に丸める。
    private var pixelScale: Int {
        let base = SpriteBank.sprite("idle").h
        return max(2, Int((displayHeight / CGFloat(base)).rounded()))
    }
}
