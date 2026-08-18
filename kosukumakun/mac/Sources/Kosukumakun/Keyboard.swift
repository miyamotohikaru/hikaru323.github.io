import AppKit

/// タイピング中の演出。キーボードのキーを出して、その上で足踏みさせる。
/// 打ちすぎると頭から湯気が出る（Comnyang の「キーボードふみふみ」「オーバーヒート」相当）。
///
/// キーの中身は一切見ていない。Activity が返すのは「打っているか / どれくらい速いか」だけ。
/// それだけでこの演出は全部作れる。
final class KeyboardBehavior: PetBehavior {

    let priority = 50

    // MARK: - 見た目の決め事（単位はドット）

    // 参考にした見た目（Comnyang）に寄せて、キーは大きめの2個。
    // 小さいキーを3つ並べると「キーボード」ではなく「石畳」に見えた。
    private let keyW = 18
    private let keyH = FX.keyDots          // 本体の持ち上げ量と必ず揃える
    private let keyGap = 0
    private let keyCount = 2

    /// 何秒で1歩ぶん踏むか（速く打つほど短くなる）
    private let stepMin: CGFloat = 0.085
    private let stepMax: CGFloat = 0.34

    // MARK: - 状態

    private weak var attached: AnyObject?
    private var keyLayers: [CALayer] = []
    private var steamLayers: [CALayer] = []

    private var upImage: CGImage?
    private var downImage: CGImage?
    private var puffImages: [CGImage] = []
    private var builtScale = 0

    private var pressed = -1               // いま沈んでいるキー。-1 でどれも沈んでいない
    private var shown = false
    private var hitLayer: CALayer?
    private var hitImage: CGImage?

    private struct Puff {
        var x: CGFloat
        var y: CGFloat
        var t: CGFloat        // 0→1 で消える
        var speed: CGFloat
        var drift: CGFloat
        var size: Int
    }
    private var puffs: [Puff] = []
    private var puffTimer: CGFloat = 0

    /// 本体をどれだけ持ち上げればキーの上に立つか（pt）
    static func liftFor(scale: Int) -> CGFloat { CGFloat(FX.keyDots * scale) }

    // MARK: - 毎フレーム

    func update(dt: CGFloat, brain: Brain, activity: Activity) {
        guard let host = brain.host else { return }
        let scale = host.pixelScale
        if attached !== host || builtScale != scale { rebuild(host, scale: scale) }

        // 出す条件: 打っていて、起きていて、いじられていないとき
        // 縁に乗っている間は、打っても一切反応しない（そこはもう「見ている」場面なので）
        let active = activity.isTyping
            && !brain.isAsleep
            && brain.state != .drag
            && brain.state != .thrown
            && brain.state != .peek

        if active != shown {
            shown = active
            for l in keyLayers { l.isHidden = !active }
            if !active { pressed = -1; hitLayer?.isHidden = true }
        }

        if active {
            stepKeys(brain: brain, host: host, scale: scale)
        }
        updateSteam(dt: dt, brain: brain, activity: activity, host: host, scale: scale)
    }

    // MARK: - キーを踏む

    private func stepKeys(brain: Brain, host: EffectHost, scale: Int) {
        // どのキーが沈むかは **Brain の tapSide** に合わせる。
        // ここで自前に位相を持つと、体が寄る向きとキーの沈みが半コマずれて、
        // 「叩いている」ではなく「勝手にキーが動いている」に見える。
        let side = brain.tapSide
        pressed = side < 0 ? 0 : (side > 0 ? keyCount - 1 : -1)

        let totalW = keyCount * keyW + (keyCount - 1) * keyGap
        let originX = (host.footInStage.x - CGFloat(totalW * scale) / 2).rounded()
        let baseY = host.footInStage.y.rounded()

        for (i, l) in keyLayers.enumerated() {
            let x = originX + CGFloat(i * (keyW + keyGap) * scale)
            l.contents = (i == pressed) ? downImage : upImage
            l.bounds = CGRect(x: 0, y: 0, width: CGFloat(keyW * scale), height: CGFloat(keyH * scale))
            l.position = CGPoint(x: x, y: baseY)
        }

        // 叩かれたキーの上に衝撃の線を出す。これが無いと「沈んだ」だけで「叩いた」に見えない。
        if let hl = hitLayer, let img = hitImage {
            if pressed >= 0 {
                let w = CGFloat(img.width * scale), h = CGFloat(img.height * scale)
                // 真上に出すとこすくまくんの体に隠れて見えない。
                // 叩いたキーの **外側** の肩口に出す。
                let keyX = originX + CGFloat(pressed * (keyW + keyGap) * scale)
                let outward: CGFloat = (pressed == 0) ? -w * 0.7 : CGFloat(keyW * scale) - w * 0.3
                hl.isHidden = false
                hl.contents = img
                hl.bounds = CGRect(x: 0, y: 0, width: w, height: h)
                hl.position = CGPoint(x: (keyX + outward).rounded(),
                                      y: (baseY + CGFloat(keyH * scale) - h * 0.4).rounded())
            } else {
                hl.isHidden = true
            }
        }
    }

    // MARK: - 湯気

    private func updateSteam(dt: CGFloat, brain: Brain, activity: Activity,
                             host: EffectHost, scale: Int) {
        // 打ちすぎているときだけ。ふつうの速さでは出さない（出しっぱなしだと鬱陶しい）
        if activity.isHammering && !brain.isAsleep {
            puffTimer -= dt
            if puffTimer <= 0 {
                puffTimer = CGFloat.random(in: 0.10...0.20)
                if puffs.count < steamLayers.count {
                    // 頭のすぐ上から、ほぼ真上へ。横に散らすと湯気ではなく
                    // 「何かが飛び散っている」ように見える。
                    puffs.append(Puff(x: CGFloat.random(in: -2.5...2.5),
                                      y: 1,
                                      t: 0,
                                      speed: CGFloat.random(in: 7...10),
                                      drift: CGFloat.random(in: -1.6...1.6),
                                      size: 0))
                }
            }
        }

        let head = CGPoint(x: host.footInStage.x,
                           y: host.footInStage.y + host.currentFrame.lift + host.petHeight)

        for i in puffs.indices {
            puffs[i].t += dt * 0.85
            puffs[i].y += puffs[i].speed * dt
            puffs[i].x += puffs[i].drift * dt
        }
        puffs.removeAll { $0.t >= 1 }

        for (i, l) in steamLayers.enumerated() {
            guard i < puffs.count else { l.isHidden = true; continue }
            let p = puffs[i]
            guard !puffImages.isEmpty else { continue }
            // 上がるほど大きくなる。ひとかたまりのまま上がると煙の粒に見えない。
            let grow = min(puffImages.count - 1, Int(p.t * CGFloat(puffImages.count)))
            let img = puffImages[grow]
            let w = CGFloat(img.width * scale), h = CGFloat(img.height * scale)
            l.isHidden = false
            l.contents = img
            l.bounds = CGRect(x: 0, y: 0, width: w, height: h)
            // 位置もドットに丸める。湯気だけ滑らかに動くと本体から浮く。
            let px = (head.x + p.x * CGFloat(scale) - w / 2 / CGFloat(scale) * CGFloat(scale))
            l.position = CGPoint(x: (px / CGFloat(scale)).rounded() * CGFloat(scale),
                                 y: ((head.y + p.y * CGFloat(scale)) / CGFloat(scale)).rounded() * CGFloat(scale))
            // 出てすぐ濃く、上へ行くほど薄く
            l.opacity = Float(max(0, min(1, (1 - p.t) * 1.3)) * 0.85)
        }
    }

    // MARK: - 絵を作る

    private func rebuild(_ host: EffectHost, scale: Int) {
        for l in keyLayers { l.removeFromSuperlayer() }
        for l in steamLayers { l.removeFromSuperlayer() }
        keyLayers.removeAll()
        steamLayers.removeAll()
        puffs.removeAll()

        upImage = keyImage(pressedDown: false)
        downImage = keyImage(pressedDown: true)
        hitImage = hitMarkImage()
        hitLayer?.removeFromSuperlayer()
        puffImages = [puffImage(0), puffImage(1), puffImage(2)].compactMap { $0 }

        for _ in 0..<keyCount {
            let l = pixelLayer()
            l.isHidden = true
            // キーは本体の後ろに敷く（足がキーの上に乗って見えるように）
            host.effectLayer.insertSublayer(l, at: 0)
            keyLayers.append(l)
        }
        let hl = pixelLayer()
        hl.isHidden = true
        host.effectLayer.addSublayer(hl)
        hitLayer = hl

        for _ in 0..<6 {
            let l = pixelLayer()
            l.isHidden = true
            host.effectLayer.addSublayer(l)
            steamLayers.append(l)
        }
        attached = host
        builtScale = scale
        shown = false
    }

    private func pixelLayer() -> CALayer {
        let l = CALayer()
        l.magnificationFilter = .nearest
        l.minificationFilter = .nearest
        l.contentsScale = 1
        l.anchorPoint = .zero
        l.actions = ["contents": NSNull(), "position": NSNull(), "bounds": NSNull(),
                     "hidden": NSNull(), "opacity": NSNull()]
        return l
    }

    /// キーキャップ。**上から斜めに見た形**。
    ///
    /// 左右対称の台形にすると、キーではなく「表彰台」や「石」に見える（実際に言われた）。
    /// 奥へ行くほど右へずらした **平行四辺形の天面** にすると、
    /// 一気に「上から見たキーボード」になる。手前に前面を2ドット付けて厚みを出す。
    ///
    ///   ....##########      奥（右へずれている）
    ///   ...#oooooooo#.
    ///   ..#oooooooo#..
    ///   .#oooooooo#...
    ///   #oooooooo#....      手前
    ///   ##########....
    ///   #ssssssss#....      前面（濃い）
    ///   .########.....
    private func keyImage(pressedDown: Bool) -> CGImage? {
        var c = PixelCanvas(w: keyW, h: keyH)
        let skew = 4                          // 奥へ行くほど右へずれる量
        let topH = 5                          // 天面の段数
        let faceW = keyW - skew               // 天面の横幅
        let drop = pressedDown ? 3 : 0
        let frontH = pressedDown ? 1 : 2

        // 天面（平行四辺形）
        for r in 0..<topH {
            let y = drop + r
            let x0 = skew - (skew * r) / (topH - 1)
            guard y < keyH else { break }
            c.fill((x0, y, faceW, 1), 2)
            c.set(x0, y, 1)
            c.set(x0 + faceW - 1, y, 1)
            if r == 0 { c.fill((x0, y, faceW, 1), 1) }        // 奥の縁
        }
        // 右の側面。**ここを描かないと、天面だけが宙に浮いた板に見える。**
        // 天面を右へずらした以上、ずらしたぶんの壁が必ず見えるはず。
        // 各段の右端から真下へ、前面と同じ高さぶん降ろすと斜めの壁になる。
        for r in 0..<topH {
            let x0 = skew - (skew * r) / (topH - 1)
            let xr = x0 + faceW - 1
            for k in 1...(frontH + 1) {
                let y = drop + r + k
                guard y < keyH, xr < keyW else { continue }
                // いちばん外側（奥側）だけ輪郭、内側は側面の色
                c.set(xr, y, (r == 0 || k == frontH + 1) ? 1 : 3)
            }
        }

        // 天面の手前の縁
        let edgeY = drop + topH
        if edgeY < keyH { c.fill((0, edgeY, faceW, 1), 1) }
        // 前面
        for r in 0..<frontH {
            let y = edgeY + 1 + r
            guard y < keyH else { break }
            c.fill((0, y, faceW, 1), 3)
            c.set(0, y, 1)
            c.set(faceW - 1, y, 1)
        }
        // 底
        let bottomY = min(keyH - 1, edgeY + 1 + frontH)
        c.fill((1, bottomY, faceW - 2, 1), 1)

        return c.image(palette: [[0, 0, 0, 0],
                                 [0x14, 0x12, 0x10, 255],
                                 [0xE4, 0xE4, 0xDC, 255],
                                 [0x8E, 0x8E, 0x84, 255]])
    }

    /// 叩いた瞬間の衝撃。短い線を2本、外へ跳ねさせる。
    private func hitMarkImage() -> CGImage? {
        let rows = ["#.....#", ".#...#.", "..#.#..", "......."]
        var c = PixelCanvas(w: rows[0].count, h: rows.count)
        for (y, row) in rows.enumerated() {
            for (x, ch) in row.enumerated() where ch == "#" { c.set(x, y, 1) }
        }
        return c.image(palette: [[0, 0, 0, 0], [0x14, 0x12, 0x10, 255],
                                 [0, 0, 0, 0], [0, 0, 0, 0]])
    }

    /// 湯気のひとかたまり。大きさ違いを3つ作って使い回す。
    ///
    /// **黒い輪郭を付けてはいけない。** 本体と同じ太さの黒で囲むと、湯気ではなく
    /// 「固い小さな物体（きらきら）」に見える。ふちは薄い灰色にして、湯気は湯気に見せる。
    private func puffImage(_ kind: Int) -> CGImage? {
        let rows: [String]
        switch kind {
        case 0: rows = [".###.", "#ooo#", "#ooo#", ".###."]
        case 1: rows = ["..###..", ".#ooo#.", "#ooooo#", "#ooooo#", ".#ooo#.", "..###.."]
        default: rows = ["..####..", ".#oooo#.", "#oooooo#", "#oooooo#", "#oooooo#",
                         ".#oooo#.", "..####.."]
        }
        let w = rows[0].count, h = rows.count
        var c = PixelCanvas(w: w, h: h)
        for (y, row) in rows.enumerated() {
            for (x, ch) in row.enumerated() {
                c.set(x, y, ch == "#" ? 1 : (ch == "o" ? 2 : 0))
            }
        }
        return c.image(palette: [[0, 0, 0, 0],
                                 [0xC4, 0xC4, 0xBC, 255],   // ふち＝薄い灰色
                                 [0xFF, 0xFF, 0xFF, 255],   // 中＝白
                                 [0, 0, 0, 0]])
    }
}
