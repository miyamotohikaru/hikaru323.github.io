import AppKit

/// スクロールしている間、こすくまくんが押していく大きい梅干し。
///
/// ドット絵なので絵を回せない。角度ちがいのコマ（ume0..ume5）を順に出して転がして見せる。
/// 左へ転がすときはコマを逆順に出す。ここを揃えないと、進む向きと回る向きが
/// 食い違って「滑っている」ように見える。
final class RollingBehavior: PetBehavior {

    let priority = 45

    private weak var attached: AnyObject?
    private var layer: CALayer?
    private var images: [CGImage] = []
    /// 梅干しの色。**転がすたびに選び直さない。** 金平糖は淡い3色から選んでいたが、
    /// 梅干しは赤いものなので、色が変わると別のものに見える。
    /// 輪郭も黒ではなく濃い赤茶にする（黒だと ただの赤い玉に見えた）。
    private static let skin:  [UInt8] = [0xC2, 0x63, 0x5B, 255]   // 面
    private static let line:  [UInt8] = [0x4A, 0x1F, 0x1A, 255]   // 輪郭
    private static let crease: [UInt8] = [0x97, 0x44, 0x3E, 255]  // しわ
    private var builtScale = 0
    private var shown = false

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let host = brain.host else { return }
        let scale = host.pixelScale
        if attached !== host || builtScale != scale { rebuild(host, scale: scale) }
        guard let l = layer, !images.isEmpty else { return }

        let rolling = brain.rollDir != 0
        if rolling != shown {
            shown = rolling
            l.isHidden = !rolling
        }
        guard rolling else { return }

        // コマ送り。左へ進むなら逆回り
        let n = images.count
        var idx = Int(brain.rollPhase) % n
        if brain.rollDir < 0 { idx = (n - 1 - idx + n) % n }
        let img = images[idx]

        let w = CGFloat(img.width * scale)
        let h = CGFloat(img.height * scale)
        // こすくまくんの進む先に置く。体に少し重ねると「押している」に見える。
        // 壁や天井を伝っているときも「進む先・接している面の上」は同じ意味なので、
        // 体を基準にした (前へ, 面から離れる) で決めて、そこから画面の向きに直す。
        let ahead = CGFloat(brain.rollDir) * (host.petHeight * 0.46)
        let o = PetView.toScreen(ahead, h / 2, host.currentFrame.turn)
        let c = CGPoint(x: host.footInStage.x + o.x, y: host.footInStage.y + o.y)
        let x = ((c.x - w / 2) / CGFloat(scale)).rounded() * CGFloat(scale)
        let y = ((c.y - h / 2) / CGFloat(scale)).rounded() * CGFloat(scale)

        l.contents = img
        l.bounds = CGRect(x: 0, y: 0, width: w, height: h)
        l.position = CGPoint(x: x, y: y)
    }

    private func rebuild(_ host: EffectHost, scale: Int) {
        layer?.removeFromSuperlayer()
        images = RollingBehavior.frames()

        let l = CALayer()
        l.magnificationFilter = .nearest
        l.minificationFilter = .nearest
        l.contentsScale = 1
        l.anchorPoint = .zero
        l.isHidden = true
        l.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                     "hidden": NSNull()]
        // 本体より手前に出す（押している手の先にある、という見え方）
        host.effectLayer.addSublayer(l)
        layer = l
        attached = host
        builtScale = scale
        shown = false
    }

    private static func frames() -> [CGImage] {
        (0..<6).compactMap {
            SpriteBank.image("ume\($0)", tint: skin, tintLine: line, tintMark: crease)
        }
    }
}
