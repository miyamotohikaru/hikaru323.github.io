import AppKit

/// 会議モードで出す言葉。
///
/// 画面を共有しているあいだ、こすくまくんがカーソルのそばに来て、
/// **指す** と **short い言葉を見せる** の2つだけをする。
/// 口が無いので しゃべらせない。ここも「心の声」と同じ枠で出す。
///
/// 長い文は入れない。会議の画面に出すものなので、
/// 読むのに時間がかかると、そちらに気を取られて話が止まる。
enum MeetingLines {

    static let all: [String] = [
        "はじめまして",
        "よろしく おねがいします",
        "ここ です",
        "なるほど",
        "いいですね",
        "ちょっと 休憩しませんか",
        "ありがとうございました",
        "こす.くま です",
    ]

    static func line(_ i: Int) -> String {
        all[((i % all.count) + all.count) % all.count]
    }
}

/// 会議モードのとき、こすくまくんとカーソルのあいだに出る矢印。
///
/// **こすくまくんに腕は生えない。** 公式の絵に指さしの姿は無いので、
/// 体を描き足すのではなく、昔のゲームの「ここを見て」の矢印を別に置く。
/// キーボードや金平糖と同じ、こすくまくんの持ち物という扱い。
final class PointingBehavior: PetBehavior {

    let priority = 60

    private weak var attached: AnyObject?
    private var layer: CALayer?
    private var builtScale = 0
    private var cache: [Int: CGImage] = [:]
    private var lastKey = -1

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let host = brain.host else { return }
        let scale = host.pixelScale
        if attached !== host || builtScale != scale { rebuild(host, scale: scale) }
        guard let l = layer else { return }

        guard brain.isMeeting else {
            if !l.isHidden { l.isHidden = true; lastKey = -1 }
            return
        }

        // こすくまくんの顔からカーソルへ。矢印はその途中に置く。
        let from = host.facePoint
        let to = brain.pointerInStage
        let dx = to.x - from.x, dy = to.y - from.y
        let dist = hypot(dx, dy)
        guard dist > CGFloat(scale) * 8 else { l.isHidden = true; return }
        let ang = atan2(dy, dx)

        // 角度は24段階に丸める。連続で作り直すとドットが毎コマ違って
        // ちらちらするし、絵を作る回数も無駄に増える。
        let step = Int((ang / (.pi * 2) * 24).rounded()) % 24
        let dots = 13
        if step != lastKey {
            lastKey = step
            l.contents = image(step: step, dots: dots, scale: scale)
        }
        let w = CGFloat(dots * scale)
        // **指す先のすぐ手前** に置く。体のそばに置くと耳や腕に重なって
        // 矢に見えないし、どこを指しているのかも読めない。
        let back = min(dist * 0.5, host.petHeight * 0.36)
        let cx = to.x - dx / dist * back, cy = to.y - dy / dist * back
        l.isHidden = false
        l.bounds = CGRect(x: 0, y: 0, width: w, height: w)
        l.position = CGPoint(x: ((cx - w / 2) / CGFloat(scale)).rounded() * CGFloat(scale),
                             y: ((cy - w / 2) / CGFloat(scale)).rounded() * CGFloat(scale))
    }

    /// 右向きの矢を作って angle だけ回し、ドットに落とす。
    /// 角度ごとに絵を持つより、頂点を回してから塗る方が どの向きでも形がそろう。
    private func image(step: Int, dots: Int, scale: Int) -> CGImage? {
        if let c = cache[step * 100 + dots] { return c }
        let ang = CGFloat(step) / 24 * .pi * 2
        let c0 = CGFloat(dots - 1) / 2
        // 局所座標（右向き）。頭の三角と、後ろへ伸びる軸。
        let head: [CGPoint] = [CGPoint(x: c0, y: 0), CGPoint(x: -c0 * 0.15, y: c0 * 0.72),
                               CGPoint(x: -c0 * 0.15, y: -c0 * 0.72)]
        let tail: [CGPoint] = [CGPoint(x: -c0 * 0.15, y: c0 * 0.26),
                               CGPoint(x: -c0, y: c0 * 0.26),
                               CGPoint(x: -c0, y: -c0 * 0.26),
                               CGPoint(x: -c0 * 0.15, y: -c0 * 0.26)]
        func turnPts(_ p: [CGPoint]) -> [CGPoint] {
            p.map { CGPoint(x: c0 + $0.x * cos(ang) - $0.y * sin(ang),
                            y: c0 + $0.x * sin(ang) + $0.y * cos(ang)) }
        }
        let polys = [turnPts(head), turnPts(tail)]

        var cv = PixelCanvas(w: dots, h: dots)
        for y in 0..<dots {
            for x in 0..<dots where polys.contains(where: { inside(CGPoint(x: CGFloat(x),
                                                                          y: CGFloat(y)), $0) }) {
                cv.set(x, y, 2)
            }
        }
        // 面が透明に接していたら輪郭にする（本体のドット絵と同じ作り）。
        // これが無いと、暗い壁紙の上で矢が消える。
        var out = cv
        for y in 0..<dots {
            for x in 0..<dots where cv.get(x, y) == 2 {
                for (ox, oy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] where cv.get(x + ox, y + oy) == 0 {
                    out.set(x, y, 1)
                }
            }
        }
        let img = out.image(palette: [[0, 0, 0, 0], [0x14, 0x12, 0x10, 255],
                                      [0xF7, 0xF7, 0xD8, 255], [0, 0, 0, 0]])
        cache[step * 100 + dots] = img
        return img
    }

    private func inside(_ p: CGPoint, _ poly: [CGPoint]) -> Bool {
        var hit = false
        var j = poly.count - 1
        for i in 0..<poly.count {
            let a = poly[i], b = poly[j]
            if (a.y > p.y) != (b.y > p.y),
               p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x { hit.toggle() }
            j = i
        }
        return hit
    }

    private func rebuild(_ host: EffectHost, scale: Int) {
        layer?.removeFromSuperlayer()
        cache.removeAll()
        lastKey = -1
        let l = CALayer()
        l.magnificationFilter = .nearest
        l.minificationFilter = .nearest
        l.contentsScale = 1
        l.anchorPoint = .zero
        l.isHidden = true
        l.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                     "hidden": NSNull()]
        host.effectLayer.addSublayer(l)
        layer = l
        attached = host
        builtScale = scale
    }
}
