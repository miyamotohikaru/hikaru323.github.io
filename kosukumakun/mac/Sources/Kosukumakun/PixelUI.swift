import AppKit

/// ドット絵のUI部品。こすくまくん本体と同じ「粒」で描くための道具立て。
///
/// 本体は 26x34 のスプライトを整数倍で拡大している。演出やUIをなめらかな図形で描くと、
/// そこだけ解像度が違って見えて一気に安っぽくなるので、**UIも必ずドットの格子に乗せる**。
/// ここでは「1ドット単位の白黒の格子」を組み立てて、最後に一度だけ CGImage にする。

/// 1ドット単位のキャンバス。0=透明 1=輪郭(黒) 2=地(クリーム) 3=強調
struct PixelCanvas {
    private(set) var w: Int
    private(set) var h: Int
    private(set) var cells: [UInt8]

    init(w: Int, h: Int) {
        self.w = max(1, w)
        self.h = max(1, h)
        cells = [UInt8](repeating: 0, count: self.w * self.h)
    }

    @inline(__always) mutating func set(_ x: Int, _ y: Int, _ v: UInt8) {
        guard x >= 0, y >= 0, x < w, y < h else { return }
        cells[y * w + x] = v
    }

    @inline(__always) func get(_ x: Int, _ y: Int) -> UInt8 {
        guard x >= 0, y >= 0, x < w, y < h else { return 0 }
        return cells[y * w + x]
    }

    mutating func fill(_ r: (x: Int, y: Int, w: Int, h: Int), _ v: UInt8) {
        for y in r.y..<(r.y + r.h) {
            for x in r.x..<(r.x + r.w) { set(x, y, v) }
        }
    }

    mutating func rect(_ r: (x: Int, y: Int, w: Int, h: Int), _ v: UInt8) {
        for x in r.x..<(r.x + r.w) { set(x, r.y, v); set(x, r.y + r.h - 1, v) }
        for y in r.y..<(r.y + r.h) { set(r.x, y, v); set(r.x + r.w - 1, y, v) }
    }

    /// 昔のRPGのメッセージ枠。外周1ドット＋1ドットあけて内枠、という二重枠。
    /// 角の4点を抜くと、角が丸く見えて画面になじむ（実機のUIがだいたいこれ）。
    mutating func window(_ r: (x: Int, y: Int, w: Int, h: Int), ink: UInt8 = 1, paper: UInt8 = 2) {
        fill(r, paper)
        rect(r, ink)
        set(r.x, r.y, 0)
        set(r.x + r.w - 1, r.y, 0)
        set(r.x, r.y + r.h - 1, 0)
        set(r.x + r.w - 1, r.y + r.h - 1, 0)
        if r.w > 6 && r.h > 6 {
            rect((r.x + 2, r.y + 2, r.w - 4, r.h - 4), ink)
        }
    }

    /// 格子をそのまま CGImage にする（拡大は CALayer の nearest に任せる）
    func image(palette: [[UInt8]]) -> CGImage? {
        var buf = [UInt8](repeating: 0, count: w * h * 4)
        for i in 0..<(w * h) {
            let c = palette[min(Int(cells[i]), palette.count - 1)]
            buf[i * 4] = c[0]; buf[i * 4 + 1] = c[1]
            buf[i * 4 + 2] = c[2]; buf[i * 4 + 3] = c[3]
        }
        guard let provider = CGDataProvider(data: Data(buf) as CFData) else { return nil }
        return CGImage(width: w, height: h, bitsPerComponent: 8, bitsPerPixel: 32,
                       bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(),
                       bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
                       provider: provider, decode: nil,
                       shouldInterpolate: false, intent: .defaultIntent)
    }
}

/// 文字をドットに落とす。
///
/// ビットマップフォントを持たず、**システムフォントを目的の級数で描いて2値化する**。
/// こす.くま の fliplist でも同じやり方をしている（`PixelGfx.textJP()`）。
/// ただしあちらの教訓として「**和文は12ドットまで落とすと漢字が別字に化ける**」ので、
/// こすくまくんの心の声はひらがな中心にしてあり、級数も10ドットを下限にしている。
enum PixelText {

    /// 数字だけは字形を手で持つ。スコアやタイマーは1ドットの狂いも許されないし、
    /// システムフォントの数字を小さく2値化すると 6 と 8 が潰れて見分けられなくなる。
    private static let digits: [[String]] = [
        ["###", "#.#", "#.#", "#.#", "###"],   // 0
        [".#.", "##.", ".#.", ".#.", "###"],   // 1
        ["###", "..#", "###", "#..", "###"],   // 2
        ["###", "..#", "###", "..#", "###"],   // 3
        ["#.#", "#.#", "###", "..#", "..#"],   // 4
        ["###", "#..", "###", "..#", "###"],   // 5
        ["###", "#..", "###", "#.#", "###"],   // 6
        ["###", "..#", "..#", "..#", "..#"],   // 7
        ["###", "#.#", "###", "#.#", "###"],   // 8
        ["###", "#.#", "###", "..#", "###"],   // 9
    ]

    /// 3x5 の数字を書く。幅は 桁数*4-1。
    static func drawNumber(_ n: Int, into c: inout PixelCanvas, x: Int, y: Int, ink: UInt8 = 1) {
        let s = String(max(0, n))
        for (i, ch) in s.enumerated() {
            guard let d = ch.wholeNumberValue, d >= 0, d < 10 else { continue }
            let g = digits[d]
            for (ry, row) in g.enumerated() {
                for (rx, p) in row.enumerated() where p == "#" {
                    c.set(x + i * 4 + rx, y + ry, ink)
                }
            }
        }
    }

    static func numberWidth(_ n: Int) -> Int { String(max(0, n)).count * 4 - 1 }

    /// 文字列を size ドットの高さで2値化する。返り値は (幅, 高さ, 立っているドット)。
    /// 一度作ったら使い回すこと（毎フレーム呼ぶ想定ではない）。
    static func rasterize(_ text: String, size: Int, bold: Bool = false) -> (w: Int, h: Int, on: [Bool]) {
        let fontSize = CGFloat(size)
        let font = NSFont.systemFont(ofSize: fontSize, weight: bold ? .bold : .medium)
        let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor.white]
        let str = NSAttributedString(string: text, attributes: attrs)
        var box = str.size()
        box.width = ceil(box.width) + 2
        box.height = ceil(box.height) + 2
        let w = max(1, Int(box.width)), h = max(1, Int(box.height))

        guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                                  bytesPerRow: w, space: CGColorSpaceCreateDeviceGray(),
                                  bitmapInfo: CGImageAlphaInfo.none.rawValue) else {
            return (1, 1, [false])
        }
        ctx.setFillColor(gray: 0, alpha: 1)
        ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
        // アンチエイリアスは切らない。切ると細い画がまるごと消える。
        // 濃淡で受けてから閾値で落とす方が、画の形が残る。
        ctx.setAllowsAntialiasing(true)
        ctx.setShouldAntialias(true)

        let nsctx = NSGraphicsContext(cgContext: ctx, flipped: false)
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = nsctx
        str.draw(at: NSPoint(x: 1, y: 1))
        NSGraphicsContext.restoreGraphicsState()

        guard let data = ctx.data else { return (1, 1, [false]) }
        let p = data.bindMemory(to: UInt8.self, capacity: w * h)
        var on = [Bool](repeating: false, count: w * h)
        // 閾値は低め。fliplist で 190 は WebKit のアンチエイリアスに強すぎて画が欠けた、
        // という記録があるので、こちらも欠ける側ではなく太る側に倒す。
        let th: UInt8 = 118
        // CGBitmapContext のバッファは「先頭行＝画像の上端」。
        // 描画座標が下原点なのにつられて上下を入れ替えると、文字が逆さまになる（実際にやった）。
        for i in 0..<(w * h) {
            on[i] = p[i] > th
        }
        return (w, h, on)
    }

    /// 2値化した文字をキャンバスに置く
    static func blit(_ t: (w: Int, h: Int, on: [Bool]), into c: inout PixelCanvas,
                     x: Int, y: Int, ink: UInt8 = 1) {
        for ty in 0..<t.h {
            for tx in 0..<t.w where t.on[ty * t.w + tx] {
                c.set(x + tx, y + ty, ink)
            }
        }
    }
}
