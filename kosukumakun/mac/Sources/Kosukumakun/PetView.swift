import AppKit

/// 目の見せ方。ドット絵では目は1ドットしか無いので、
/// 「開いている」か「閉じている（＝目の下に3ドットの横線）」の2通りしか作れない。
/// 昔のゲームと同じで、閉じた目はそのまま「うれしい目」としても読める。
enum EyeStyle {
    case dot        // ふつう（●）
    case happy      // うれしい＝閉じ目
    case sleepy     // ねむい＝閉じ目
    case wide       // びっくり（いまは ふつう と同じ絵）

    var closed: Bool { self == .happy || self == .sleepy }
}

/// 1フレーム分の見た目。Brain が作って PetView が描く。
///
/// Equatable にしてあるのは大事な理由がある。中身が前フレームと同じなら描画を丸ごと省くため。
/// 省かないと、寝ていて1ドットも変わっていない時でも CoreAnimation に毎フレーム
/// コミットが飛んで、CPUを数%食い続ける（実測で気づいた）。
struct PetFrame: Equatable {
    /// スプライト名（idle / blink / squash / stretch / back / side / lying / small）
    var sprite: String = "idle"
    /// 拡大率。**必ず整数**。半端な倍率で拡大するとドットがにじんで台無しになる。
    var pixelScale: Int = 4
    /// 足元中心（ステージ座標）
    var foot = CGPoint.zero
    var faceRight = true
    /// 目のドットを横にずらす量（-1 / 0 / 1）。1ドットでも驚くほど視線が出る。
    var look: Int = 0
    var alpha: CGFloat = 1
    var shadow: CGFloat = 0.10
    /// 足元からの持ち上げ(pt)。キーボードの上に立つときに使う。
    var lift: CGFloat = 0
    /// 横ずれ(pt)。キーを叩く側へ体を寄せるのに使う。
    var offsetX: CGFloat = 0
    /// 0 より大きいと、スプライトの **上から peekRows 行だけ** を描く。
    /// ウィンドウの上端に乗って顔だけ出すときに使う。
    var peekRows: Int = 0
    /// 0 より大きいと、スプライトの **横 peekCols 列だけ** を描く。
    /// ウィンドウの左右の縁からひょこっと顔を出すときに使う。
    /// peekSide が -1 なら左の縁（体は右に隠れる）、+1 なら右の縁。
    var peekCols: Int = 0
    var peekSide: Int = 0

    /// 表示身長(pt)
    var height: CGFloat {
        CGFloat(SpriteBank.sprite(sprite).h * pixelScale)
    }
    var width: CGFloat {
        CGFloat(SpriteBank.sprite(sprite).w * pixelScale)
    }
}

/// こすくまくん本体を描くビュー。
///
/// ドット絵なので、やることは「スプライトを整数倍で置く」だけ。
/// 拡大は CALayer の magnificationFilter = .nearest に任せる。
/// ここを .linear にすると一瞬でただのぼやけた絵になるので触らないこと。
final class PetView: NSView, EffectHost {

    private(set) var lastFrame = PetFrame()
    private var rendered = false
    private let spriteLayer = CALayer()
    private let shadowLayer = CAShapeLayer()

    /// 本体の他に載せたいもの（金平糖・湯気・吹き出し）を入れる場所
    let effectLayer = CALayer()

    // マウス操作（スクリーン座標で返す）
    var onMouseDown: ((CGPoint) -> Void)?
    var onMouseDragged: ((CGPoint) -> Void)?
    var onMouseUp: ((CGPoint) -> Void)?

    override func mouseDown(with e: NSEvent) { onMouseDown?(NSEvent.mouseLocation) }
    override func mouseDragged(with e: NSEvent) { onMouseDragged?(NSEvent.mouseLocation) }
    override func mouseUp(with e: NSEvent) { onMouseUp?(NSEvent.mouseLocation) }

    override init(frame: NSRect) {
        super.init(frame: frame)
        wantsLayer = true
        layer?.isOpaque = false
        layer?.backgroundColor = NSColor.clear.cgColor

        shadowLayer.fillColor = NSColor.black.cgColor
        shadowLayer.frame = bounds
        shadowLayer.actions = ["path": NSNull(), "opacity": NSNull(), "hidden": NSNull()]

        spriteLayer.magnificationFilter = .nearest
        spriteLayer.minificationFilter = .nearest
        spriteLayer.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                               "opacity": NSNull(), "hidden": NSNull()]
        spriteLayer.anchorPoint = .zero

        effectLayer.frame = bounds

        layer?.addSublayer(shadowLayer)
        layer?.addSublayer(spriteLayer)
        layer?.addSublayer(effectLayer)
    }

    required init?(coder: NSCoder) { fatalError() }

    override var isFlipped: Bool { false }   // Y上向きで扱う

    override func viewDidChangeBackingProperties() {
        super.viewDidChangeBackingProperties()
        let s = window?.backingScaleFactor ?? 2
        layer?.contentsScale = s
        shadowLayer.contentsScale = s
        effectLayer.contentsScale = s
        // spriteLayer は等倍のドット画像を nearest で拡大するので contentsScale は 1 のまま。
        // ここを画面倍率に合わせると CoreAnimation が中間の解像度を作ってドットが濁る。
        spriteLayer.contentsScale = 1
    }

    // MARK: - 描画

    func render(_ f: PetFrame) {
        SpriteBank.loadIfNeeded()
        // 前フレームと1ドットも変わっていないなら何もしない。
        // 寝ている間はここで止まるので、CPUがほぼゼロになる。
        if f == lastFrame && rendered { return }
        lastFrame = f
        rendered = true

        let sp = SpriteBank.sprite(f.sprite)
        let scale = max(1, f.pixelScale)
        let rows = f.peekRows > 0 ? min(f.peekRows, sp.h) : sp.h
        let cols = f.peekCols > 0 ? min(f.peekCols, sp.w) : sp.w
        let w = CGFloat(cols * scale)
        let h = CGFloat(rows * scale)

        // ドットの目に合わせて位置も整数に丸める。半端な位置に置くと、
        // 静止しているのにドットの境目がちらついて安っぽく見える。
        let dx = (f.offsetX / CGFloat(scale)).rounded() * CGFloat(scale)
        // 横の縁に付いているときは、見えている端が縁にぴったり合うように置く。
        // 左の縁なら見えている右端が縁、右の縁なら見えている左端が縁。
        let x: CGFloat
        if f.peekSide < 0 {
            x = (f.foot.x + dx - w).rounded()
        } else if f.peekSide > 0 {
            x = (f.foot.x + dx).rounded()
        } else {
            x = (f.foot.x + dx - w / 2).rounded()
        }
        // 持ち上げもドットの粒に丸める。半端に持ち上げるとキーとの接地が1px浮いて見える。
        let lift = (f.lift / CGFloat(scale)).rounded() * CGFloat(scale)
        let y = (f.foot.y + lift).rounded()

        CATransaction.begin()
        CATransaction.setDisableActions(true)

        spriteLayer.contents = SpriteBank.image(
            f.sprite, look: f.look, flip: !f.faceRight,
            topRows: f.peekRows, cols: f.peekCols,
            // 右の縁に付くときは、スプライトを反転したうえで右端側を残す
            colsFromRight: f.peekSide > 0)
        spriteLayer.bounds = CGRect(x: 0, y: 0, width: w, height: h)
        spriteLayer.position = CGPoint(x: x, y: y)
        spriteLayer.opacity = Float(f.alpha)

        if f.shadow > 0 {
            // 影もドットの粒に合わせる（丸い影を置くと本体だけドット絵で浮くため）
            let sw = (w * 0.66 / CGFloat(scale)).rounded() * CGFloat(scale)
            let sh = CGFloat(scale)
            let r = CGRect(x: (f.foot.x - sw / 2).rounded(), y: y - sh, width: sw, height: sh)
            shadowLayer.path = CGPath(rect: r, transform: nil)
            shadowLayer.opacity = Float(f.shadow * f.alpha)
            shadowLayer.isHidden = false
        } else {
            shadowLayer.isHidden = true
        }

        CATransaction.commit()
    }

    // MARK: - 演出の置き場（EffectHost）

    var footInStage: CGPoint { lastFrame.foot }
    var petHeight: CGFloat { lastFrame.height }
    var stageSize: CGSize { bounds.size }
    var currentFrame: PetFrame { lastFrame }
    /// 演出もドットの粒に合わせたいので、本体の拡大率を渡す
    var pixelScale: Int { max(1, lastFrame.pixelScale) }
}
