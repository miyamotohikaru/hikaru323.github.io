import AppKit

/// こすくまくんの「心の声」。
///
/// **こすくまくんに口は無い。** だからこれは喋っているのではなく、思っているのが漏れている。
/// 昔のゲームのメッセージ枠に見せつつ、しっぽは三角ではなく **小さい四角を2つ**
/// 頭から枠へ並べる（＝吹き出しではなく思考の雲、という記号）。
///
/// 描画はすべて本体スプライトと同じドットの格子に乗せる。
/// なめらかな図形を1つでも混ぜると、そこだけ解像度が違って見えて台無しになる。
final class ThoughtBehavior: PetBehavior {

    var priority: Int { 10 }
    var enabled = true

    // MARK: - 見た目の決め事（単位はすべて「ドット」）

    /// 文字は **ドットに落とさず、ふつうのフォントで描く**。
    /// 枠だけドット絵にして、中の字は読みやすさを優先する。
    /// （ドットに落とすと漢字が潰れて、豆知識のような情報が読めなくなる）
    private let textPt: CGFloat = 10
    private let tipPt: CGFloat = 11
    /// 吹き出しだけ本体より細かい粒で描く。
    /// 本体と同じ粒（x4）だと文字が36ptにもなって、画面の主役が吹き出しになってしまう。
    /// **字形はそのまま**で、粒だけ細かくして全体を小さく見せる。
    private let scaleDiv = 2
    private let pad = 4               // 枠の内側の余白（文字を小さくしたぶん、ここは広く）
    private let border = 2            // 二重枠のぶん
    private let lineGap = 1
    private let tailGap = 1           // 頭と丸のすきま（ドット）

    private let holdDefault: CGFloat = 3.4
    private let openFrames = 3        // 枠が開くコマ数（昔のゲームの窓の開き方）

    // MARK: - 状態

    private let layer = CALayer()          // 枠（ドット絵のまま）
    private let textLayer = CATextLayer()  // 文字（ふつうのフォント）
    private weak var attached: AnyObject?

    private var shown = false
    private var openT: CGFloat = 0
    private var builtText = ""
    private var builtScale = 0
    private var built: (img: CGImage, w: Int, h: Int, tailH: Int)?

    private var nextChat: CGFloat = CGFloat.random(in: 150...420)
    private var recent: [String] = []
    // 豆知識。独り言より間隔をあける（毎回出ると講義になってしまう）
    private var nextTip: CGFloat = CGFloat.random(in: 240...600)
    private var recentTips: [String] = []
    private var bigTurn = -1
    private var builtBig = false
    private var textInset = CGSize.zero
    private var textSizePt = CGSize.zero

    // MARK: - 毎フレーム

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let host = brain.host else { return }
        if attached !== host { attach(host) }

        chatter(dt: dt, brain: brain, activity: activity)

        guard enabled, let text = brain.thought, !text.isEmpty else {
            if shown {
                shown = false
                openT = 0
                layer.isHidden = true
                textLayer.isHidden = true
            }
            return
        }

        let scale = max(1, host.pixelScale / scaleDiv)
        if !shown || text != builtText || scale != builtScale || brain.thoughtBig != builtBig {
            build(text: text, host: host, big: brain.thoughtBig)
            shown = true
            openT = 0
        }
        guard let b = built else { return }

        layer.isHidden = false

        // 窓が開くところ。補間はしない。コマで開く方が昔のゲームに見える。
        openT += dt
        let step = min(openFrames, Int(openT / 0.045) + 1)
        let ratio = CGFloat(step) / CGFloat(openFrames)

        let w = CGFloat(b.w * scale)
        let h = CGFloat(b.h * scale)
        let visibleH = (h * ratio / CGFloat(scale)).rounded() * CGFloat(scale)

        // 頭の上に置く。ステージからはみ出さないよう左右に逃がす。
        let head = host.headTop
        var x = (head.x - w / 2).rounded()
        x = max(2, min(host.stageSize.width - w - 2, x))
        let y = min(head.y + CGFloat(tailGap * scale),
                    host.stageSize.height - visibleH - 2)

        layer.contents = b.img
        layer.bounds = CGRect(x: 0, y: 0, width: w, height: h)
        layer.position = CGPoint(x: x, y: y)
        // 開いている途中は下から出てくるように、見えている高さだけ切り取る
        layer.contentsRect = CGRect(x: 0, y: 1 - ratio, width: 1, height: ratio)
        layer.bounds = CGRect(x: 0, y: 0, width: w, height: visibleH)

        // 文字は枠が開き切ってから出す（途中で出ると枠からはみ出して見える）
        let open = ratio >= 1
        textLayer.isHidden = !open
        if open {
            textLayer.bounds = CGRect(origin: .zero, size: textSizePt)
            // 枠の中身の左上に合わせる（ステージはY上向きなので下から積む）
            textLayer.position = CGPoint(
                x: (x + textInset.width).rounded(),
                y: (y + CGFloat(b.tailH * scale) + textInset.height).rounded())
        }
    }

    private func attach(_ host: EffectHost) {
        layer.removeFromSuperlayer()
        layer.magnificationFilter = .nearest
        layer.minificationFilter = .nearest
        layer.contentsScale = 1
        layer.anchorPoint = .zero
        layer.isHidden = true
        layer.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                         "hidden": NSNull(), "contentsRect": NSNull(), "opacity": NSNull()]
        host.effectLayer.addSublayer(layer)

        textLayer.removeFromSuperlayer()
        textLayer.alignmentMode = .center
        textLayer.isWrapped = false
        textLayer.truncationMode = .none
        textLayer.foregroundColor = NSColor.black.cgColor
        textLayer.contentsScale = NSScreen.main?.backingScaleFactor ?? 2
        textLayer.anchorPoint = .zero
        textLayer.isHidden = true
        textLayer.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                             "hidden": NSNull(), "opacity": NSNull(), "string": NSNull()]
        host.effectLayer.addSublayer(textLayer)

        attached = host
        built = nil
        builtText = ""
    }

    // MARK: - 枠を組み立てる

    private func build(text: String, host: EffectHost, big: Bool) {
        let scale = max(1, host.pixelScale / scaleDiv)   // 1ドットあたりのpt
        let dot = CGFloat(scale)
        builtBig = big

        let size = big ? tipPt : textPt
        let font = NSFont.systemFont(ofSize: size, weight: .medium)
        let attrs: [NSAttributedString.Key: Any] = [.font: font]

        // 枠が画面をふさがない最大の文字幅
        let maxTextPt = max(120, host.stageSize.width - CGFloat((border + pad) * 2) * dot - 24)
        let lines = wrap(text, maxPt: maxTextPt, attrs: attrs)

        var textW: CGFloat = 0
        for l in lines {
            textW = max(textW, (l as NSString).size(withAttributes: attrs).width)
        }
        let lineH = ceil(font.ascender - font.descender + font.leading) + 2
        let textH = lineH * CGFloat(lines.count)

        // 文字の大きさから枠のドット数を決める（枠はドット絵のまま）
        let innerW = Int(ceil(textW / dot))
        let innerH = Int(ceil(textH / dot))
        let boxW = innerW + (border + pad) * 2
        let boxH = innerH + (border + pad) * 2
        let tailH = 8
        var c = PixelCanvas(w: boxW, h: boxH + tailH)

        c.window((0, 0, boxW, boxH))

        // 思考の丸（口が無いので「喋る」記号にしない）。
        // 三角のしっぽにすると「喋っている」ことになってしまうので絶対にやらない。
        let cx = boxW / 2
        c.fill((cx - 1, boxH + 1, 3, 3), 1)
        c.fill((cx - 2, boxH + 5, 2, 2), 1)

        let pal: [[UInt8]] = [[0, 0, 0, 0],
                              [0x14, 0x12, 0x10, 255],
                              [0xFF, 0xFF, 0xFF, 255],
                              [0x28, 0x38, 0x2C, 255]]
        if let img = c.image(palette: pal) {
            built = (img, c.w, c.h, tailH)
        }

        // 文字はふつうのフォントで、枠の内側に置く
        textLayer.string = NSAttributedString(
            string: lines.joined(separator: "\n"),
            attributes: [.font: font, .foregroundColor: NSColor.black,
                         .paragraphStyle: {
                             let ps = NSMutableParagraphStyle()
                             ps.alignment = .center
                             ps.lineSpacing = 0
                             return ps
                         }()])
        textLayer.isWrapped = true
        textInset = CGSize(width: CGFloat(border + pad) * dot,
                           height: CGFloat(border + pad) * dot)
        textSizePt = CGSize(width: CGFloat(innerW) * dot, height: CGFloat(innerH) * dot)

        builtText = text
        builtScale = scale
    }

    /// 空白で折る。1語で入りきらない時はそのまま出す（欠けさせない）。
    private func wrap(_ s: String, maxPt: CGFloat, attrs: [NSAttributedString.Key: Any]) -> [String] {
        let words = s.split(separator: " ", omittingEmptySubsequences: true).map(String.init)
        guard words.count > 1 else { return [s] }
        var lines: [String] = []
        var cur = ""
        for w in words {
            let cand = cur.isEmpty ? w : cur + " " + w
            if (cand as NSString).size(withAttributes: attrs).width <= maxPt || cur.isEmpty {
                cur = cand
            } else {
                lines.append(cur)
                cur = w
            }
        }
        if !cur.isEmpty { lines.append(cur) }
        return lines.isEmpty ? [s] : lines
    }

    // MARK: - いつ独り言を言うか

    private func chatter(dt: CGFloat, brain: Brain, activity: Activity) {
        guard enabled else { return }
        nextTip -= dt
        nextChat -= dt
        guard nextChat <= 0 else { return }

        // 手が動いている間・つままれている間・寝ている間は言わない。
        // 仕事の邪魔をしないことが最優先なので、条件を満たさなければ黙って待ち直す。
        let calm = !activity.isTyping
            && !activity.scrolledRecently
            && !brain.isAsleep
            && brain.state != .drag
            && brain.state != .thrown
            && brain.thought == nil
        guard calm else {
            nextChat = 12
            return
        }
        // 大きい枠で出すもの（豆知識・ひとこと）の番。
        // 4種類を順番に回す。同じ種類が続くと「講義」や「応援だけ」に偏ってしまう。
        if nextTip <= 0 {
            nextTip = CGFloat.random(in: 720...1500)     // 12〜25分に1回
            nextChat = CGFloat.random(in: 300...720)
            speakBig(brain)
            return
        }
        nextChat = CGFloat.random(in: 300...720)
        brain.think(pick(), seconds: holdDefault)
    }

    /// 2回タップされたときに、その場で出す。種類は順番に回る。
    func showTipNow(_ brain: Brain) {
        brain.express(.wide, seconds: 0.6)
        speakBig(brain)
        nextTip = CGFloat.random(in: 720...1500)     // 手動で出したぶん、次は先送り
    }

    /// 大きい枠で ひとつ出す。パソコン → ひとこと → 世界 → あそび の順で回る。
    private func speakBig(_ brain: Brain) {
        bigTurn = (bigTurn + 1) % 4
        let text: String
        switch bigTurn {
        case 0:
            text = MacTips.pick(avoiding: recentTips)
            brain.think(text, seconds: MacTips.seconds, big: true)
        case 1:
            text = Cheers.pick(avoiding: recentTips)
            brain.express(.happy, seconds: Cheers.seconds)
            brain.think(text, seconds: Cheers.seconds, big: true)
        case 2:
            text = WorldTips.pick(avoiding: recentTips)
            brain.think(text, seconds: WorldTips.seconds, big: true)
        default:
            text = PlayTips.pick(avoiding: recentTips)
            brain.think(text, seconds: PlayTips.seconds, big: true)
        }
        recentTips.append(text)
        if recentTips.count > 12 { recentTips.removeFirst() }
    }

    private func pick() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        var pool = ThoughtBehavior.common
        switch hour {
        case 5..<11:  pool += ThoughtBehavior.morning
        case 11..<15: pool += ThoughtBehavior.noon
        case 15..<19: pool += ThoughtBehavior.evening
        default:      pool += ThoughtBehavior.night
        }
        let fresh = pool.filter { !recent.contains($0) }
        let line = (fresh.isEmpty ? pool : fresh).randomElement() ?? "……"
        recent.append(line)
        if recent.count > 6 { recent.removeFirst() }
        return line
    }

    // MARK: - 文言
    //
    // 会社で画面を覗かれても平気なものだけ。急かさない・評価しない・指示しない。
    // 漢字はドットに落とすと画が潰れるので、ひらがな中心にしてある。

    private static let common = [
        "……",
        "きょうも いる",
        "こんぺいとう たべたい",
        "ここ すわりごこち いい",
        "みてないよ",
        "そろそろ かたが かたい",
        "ふわ……",
        "おちゃ",
        "なんにも かんがえてない",
        "まばたき わすれてた",
        "ちょっと のびを した",
        "そこに いるの しってる",
        "ゆっくりで いいと おもう",
        "まる",
        "ほし ひとつ",
        "かぜ ふいてるかな",
        "うしろ ちょっと かゆい",
        "ぽけっと してた",
        "なにも おきてない",
        "しずか",
        "そのままで だいじょうぶ",
        "ふぅ",
        "なんだっけ",
        "そっと いる",
        "いる だけ",
        "きょうは いい ひ",
        "まどの そと みてた",
        "こんぺいとう ひとつぶ",
        "ここ あったかい",
        "ちいさい おと きこえた",
    ]

    private static let morning = [
        "おはよう……",
        "まだ ねむい",
        "ひかりが あかるい",
        "きょうも はじまった",
        "あさの くうき すき",
        "ゆっくり おきよう",
    ]

    private static let noon = [
        "おひるだ",
        "ひなたが あたたかい",
        "ひるさがり",
        "そとは あかるいらしい",
        "こんぺいとう ひとつぶ ほしい",
        "おひるね したい",
    ]

    private static let evening = [
        "そとが おれんじ",
        "かげが ながい",
        "ゆうがた の いろ",
        "そろそろ ひが おちる",
        "きょうも おつかれさま",
        "まどが きらきら",
    ]

    private static let night = [
        "よるだ",
        "ちょっと くらい",
        "ほし みえるかな",
        "あかりが やさしい",
        "ねむく なってきた",
        "むりしないで いいと おもう",
        "よるの おとは しずか",
    ]
}
