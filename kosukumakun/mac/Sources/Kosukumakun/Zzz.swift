import AppKit

/// 寝ているときに頭の上へ出る「Z」。
///
/// こすくまくんに口は無いので、寝息の表現に口や吹き出しは使えない。
/// 昔のゲームと同じで、小さい Z がひとつずつ浮かんで消えるだけにする。
/// 同時に出るのは最大3つ。上へ上がりながら少しずつ大きくなって消える。
final class ZzzBehavior: PetBehavior {

    let priority = 20

    private weak var attached: AnyObject?
    private var layers: [CALayer] = []
    private var images: [CGImage] = []
    private var builtScale = 0

    private struct Z {
        var x: CGFloat
        var y: CGFloat
        var t: CGFloat
        var size: Int
    }
    private var zs: [Z] = []
    private var timer: CGFloat = 0.6

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let host = brain.host else { return }
        let scale = host.pixelScale
        if attached !== host || builtScale != scale { rebuild(host, scale: scale) }

        if brain.isAsleep {
            timer -= dt
            if timer <= 0, zs.count < layers.count {
                timer = CGFloat.random(in: 0.9...1.5)
                // 小さい方から出して、上がるにつれて大きくする
                zs.append(Z(x: CGFloat.random(in: 1...4), y: 0, t: 0, size: 0))
            }
        } else if !zs.isEmpty {
            zs.removeAll()
        }

        for i in zs.indices {
            zs[i].t += dt * 0.42          // ゆっくり。寝息なので急がない
            zs[i].y += 5.5 * dt
            zs[i].x += 2.2 * dt
            zs[i].size = min(images.count - 1, Int(zs[i].t * CGFloat(images.count)))
        }
        zs.removeAll { $0.t >= 1 }

        // 寝そべりは横に長いので、頭は左寄り。そこから出す。
        let f = host.currentFrame
        let headX = host.footInStage.x - (f.sprite == "lying" ? f.width * 0.30 : 0)
        let headY = host.footInStage.y + f.lift + host.petHeight

        for (i, l) in layers.enumerated() {
            guard i < zs.count, !images.isEmpty else { l.isHidden = true; continue }
            let z = zs[i]
            let img = images[min(z.size, images.count - 1)]
            let w = CGFloat(img.width * scale), h = CGFloat(img.height * scale)
            l.isHidden = false
            l.contents = img
            l.bounds = CGRect(x: 0, y: 0, width: w, height: h)
            l.position = CGPoint(
                x: ((headX + z.x * CGFloat(scale)) / CGFloat(scale)).rounded() * CGFloat(scale),
                y: ((headY + z.y * CGFloat(scale)) / CGFloat(scale)).rounded() * CGFloat(scale))
            l.opacity = Float(min(1, (1 - z.t) * 1.6) * 0.9)
        }
    }

    private func rebuild(_ host: EffectHost, scale: Int) {
        for l in layers { l.removeFromSuperlayer() }
        layers.removeAll()
        zs.removeAll()
        images = [zImage(small: true), zImage(small: false)].compactMap { $0 }
        for _ in 0..<3 {
            let l = CALayer()
            l.magnificationFilter = .nearest
            l.minificationFilter = .nearest
            l.contentsScale = 1
            l.anchorPoint = .zero
            l.isHidden = true
            l.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                         "hidden": NSNull(), "opacity": NSNull()]
            host.effectLayer.addSublayer(l)
            layers.append(l)
        }
        attached = host
        builtScale = scale
    }

    /// Z の字。小さい方は3x4、大きい方は4x5。
    /// これ以上大きくすると本体より目立って、こすくまくんが脇役になる。
    private func zImage(small: Bool) -> CGImage? {
        let rows = small
            ? ["###", "..#", ".#.", "###"]
            : ["####", "...#", "..#.", ".#..", "####"]
        var c = PixelCanvas(w: rows[0].count, h: rows.count)
        for (y, row) in rows.enumerated() {
            for (x, ch) in row.enumerated() where ch == "#" { c.set(x, y, 1) }
        }
        return c.image(palette: [[0, 0, 0, 0], [0x14, 0x12, 0x10, 255],
                                 [0, 0, 0, 0], [0, 0, 0, 0]])
    }
}
