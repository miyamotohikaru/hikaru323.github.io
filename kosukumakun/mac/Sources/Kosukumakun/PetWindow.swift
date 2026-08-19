import AppKit

/// こすくまくんが住む窓。
///
/// 仕事の邪魔をしないための3点セット:
///  1. `.nonactivatingPanel` … クリックしてもアプリが前面に来ない（入力フォーカスを奪わない）
///  2. `ignoresMouseEvents`  … こすくまくんの上にカーソルが無い間はクリックを完全に素通し
///  3. `.canJoinAllSpaces`   … デスクトップを切り替えてもついてくる（全画面アプリの上にも出せる）
final class PetWindow: NSPanel {

    /// もちのように伸びた姿（身長の2倍）と、頭の上の吹き出しが収まる大きさ。
    /// 透明なので見た目には影響しない。触れるのはこすくまくんの上だけ。
    ///
    /// 足元より **下と横にも** 場所がいる。画面の縁を伝って壁や天井に立つと、
    /// 体は足元から横へ／下へ伸びるため（身長は最大240pt）。
    static let stage = CGSize(width: 560, height: 720)
    /// ステージ内で「足元」に当たる点
    static let anchor = CGPoint(x: stage.width / 2, y: 240)

    let petView: PetView

    init() {
        petView = PetView(frame: NSRect(origin: .zero, size: PetWindow.stage))
        super.init(contentRect: NSRect(origin: .zero, size: PetWindow.stage),
                   styleMask: [.borderless, .nonactivatingPanel],
                   backing: .buffered,
                   defer: false)
        isOpaque = false
        backgroundColor = .clear
        hasShadow = false
        level = .floating
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        isMovableByWindowBackground = false
        ignoresMouseEvents = true
        hidesOnDeactivate = false
        isReleasedWhenClosed = false
        contentView = petView
        // 画面収録・スクショに写ってもいいが、ミッションコントロールでは目立たせない
        animationBehavior = .none
    }

    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }

    /// **窓を画面の中に押し戻させない。**
    ///
    /// この窓は こすくまくんより ずっと大きい透明な板で、足元は板の真ん中あたりにある。
    /// 天井や画面のはしに立たせると、板の上や横が画面からはみ出す。
    /// 既定のふるまいだと macOS がそれを画面内へ押し戻すので、
    /// **こすくまくんだけが指定した場所からずれて、画面の半分あたりに現れる**
    /// （天井を伝わせたとき、実際にそうなった）。板の位置は言ったとおりに置かせる。
    override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect {
        frameRect
    }

    /// 足元のスクリーン座標を指定して窓を置く
    func place(footScreen p: CGPoint) {
        let o = NSPoint(x: p.x - PetWindow.anchor.x, y: p.y - PetWindow.anchor.y)
        if abs(frame.origin.x - o.x) > 0.01 || abs(frame.origin.y - o.y) > 0.01 {
            setFrameOrigin(o)
        }
    }

    /// ステージ座標 → スクリーン座標
    func toScreen(_ p: CGPoint) -> CGPoint {
        CGPoint(x: frame.origin.x + p.x, y: frame.origin.y + p.y)
    }

    /// スクリーン座標 → ステージ座標
    func toStage(_ p: CGPoint) -> CGPoint {
        CGPoint(x: p.x - frame.origin.x, y: p.y - frame.origin.y)
    }
}
