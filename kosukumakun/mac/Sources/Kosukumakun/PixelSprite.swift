import AppKit

/// ドット絵スプライト。tools/bake_pixels.py が焼いた sprites.json を読む。
///
/// 記号は こす.くま の既存のドット絵（fliplist/src/art/kosukuma.ts）と揃えてある:
///   '.' 透明 / '#' 輪郭 / 'o' 面 / 'm' ほくろ
struct PixelSprite {
    let w: Int
    let h: Int
    /// 左上原点・行優先。0=透明 1=輪郭 2=面 3=ほくろ
    let cells: [UInt8]
    /// 目のドット位置。1ドットしか無い目でも、横に1つずらすと見ている方向が出る。
    let eyes: [(x: Int, y: Int)]
    /// 鼻のドット位置。**目をずらす時に、鼻とくっつかせないため** に持っている。
    let nose: (x: Int, y: Int)?

    @inline(__always) func at(_ x: Int, _ y: Int) -> UInt8 {
        (x < 0 || y < 0 || x >= w || y >= h) ? 0 : cells[y * w + x]
    }
}

enum SpriteBank {

    private(set) static var sprites: [String: PixelSprite] = [:]
    /// RGBA。焼いた時の色（fliplist と同じ、ほんの少し温かい黒とクリーム）
    private static var rgba: [[UInt8]] = [
        [0, 0, 0, 0],           // 透明
        [0x14, 0x12, 0x10, 255],  // 輪郭
        [0xF7, 0xF7, 0xD8, 255],  // 面
        [0x28, 0x38, 0x2C, 255],  // ほくろ
    ]

    private static var cache: [String: CGImage] = [:]

    static func loadIfNeeded() {
        guard sprites.isEmpty else { return }
        guard let data = locate(),
              let root = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
              let raw = root["sprites"] as? [String: Any] else {
            fatalError("sprites.json が読めません")
        }
        if let pal = root["palette"] as? [String: String] {
            if let c = rgbaFrom(pal["line"]) { rgba[1] = c }
            if let c = rgbaFrom(pal["fill"]) { rgba[2] = c }
            if let c = rgbaFrom(pal["mole"]) { rgba[3] = c }
        }
        var out: [String: PixelSprite] = [:]
        for (name, v) in raw {
            guard let d = v as? [String: Any],
                  let rows = d["rows"] as? [String] else { continue }
            let h = rows.count
            let w = rows.first?.count ?? 0
            var cells = [UInt8](repeating: 0, count: w * h)
            for (y, row) in rows.enumerated() {
                for (x, ch) in row.enumerated() where x < w {
                    switch ch {
                    case "#": cells[y * w + x] = 1
                    case "o": cells[y * w + x] = 2
                    case "m": cells[y * w + x] = 3
                    default:  cells[y * w + x] = 0
                    }
                }
            }
            var eyes: [(x: Int, y: Int)] = []
            if let e = d["eyes"] as? [[Int]] {
                eyes = e.compactMap { $0.count == 2 ? (x: $0[0], y: $0[1]) : nil }
            }
            var nose: (x: Int, y: Int)?
            if let n = d["nose"] as? [Int], n.count == 2 { nose = (x: n[0], y: n[1]) }
            out[name] = PixelSprite(w: w, h: h, cells: cells, eyes: eyes, nose: nose)
        }
        sprites = out
    }

    static func sprite(_ name: String) -> PixelSprite {
        loadIfNeeded()
        return sprites[name] ?? sprites["idle"]!
    }

    /// 視線と左右反転を反映した CGImage。等倍のドット数そのままで作り、
    /// 拡大は CALayer 側の nearest に任せる（にじませないため）。
    /// - Parameter topRows: 0 より大きいと **上から topRows 行だけ** を返す。
    ///   ウィンドウの縁からちょこんと顔を出すときに使う（下half は縁に隠れている想定）。
    /// - Parameter cols: 0 より大きいと **横に cols 列だけ** を返す。
    ///   ウィンドウの左右の縁からひょこっと顔を出すときに使う。
    ///   `colsFromRight` が true なら右端側を残す。
    /// - Parameter tint: 面の色を差し替える。
    /// - Parameter tintLine: 輪郭の色を差し替える。**こすくまくん本体には使わない。**
    ///   世界の線の色はひとつに保ちたいので、持ち物（梅干し）だけの例外にする。
    /// - Parameter tintMark: 4色目（`m`）の色を差し替える。梅干しの しわ に使う。
    /// - Parameter turn: 反時計回りに90度ずつ回す回数（0〜3）。画面の縁を伝って
    ///   壁や天井を歩くときに使う。**CALayer の回転ではなくドットごと回す。**
    ///   レイヤを回すと、90度でも縁に半端な画素ができてドットが濁る。
    static func image(_ name: String, look: Int = 0, flip: Bool = false,
                      topRows: Int = 0, cols: Int = 0,
                      colsFromRight: Bool = false, tint: [UInt8]? = nil,
                      tintLine: [UInt8]? = nil, tintMark: [UInt8]? = nil,
                      turn: Int = 0) -> CGImage? {
        loadIfNeeded()
        func hex(_ c: [UInt8]?) -> String { c.map { "\($0[0]),\($0[1]),\($0[2])" } ?? "-" }
        let tk = "\(hex(tint))/\(hex(tintLine))/\(hex(tintMark))"
        let tn = ((turn % 4) + 4) % 4
        let key = "\(name)|\(look)|\(flip ? 1 : 0)|\(topRows)|\(cols)|\(colsFromRight ? 1 : 0)|\(tk)|\(tn)"
        if let c = cache[key] { return c }
        guard let sp = sprites[name] else { return nil }

        var cells = sp.cells
        // 目のドットを横へずらす。元の位置は面の色に戻す。
        if look != 0, !sp.eyes.isEmpty {
            for e in sp.eyes {
                let nx = e.x + look
                guard nx >= 0, nx < sp.w else { continue }
                // ずらした先が面でなければ（＝顔からはみ出すなら）動かさない
                guard sp.at(nx, e.y) == 2 else { continue }
                // **鼻の真上・真横に来る動きはしない。** ふりむきの顔は目と鼻が
                // 斜めに並んでいて、1ドットずらすと目が鼻の真上に重なり、
                // 縦2ドットの棒＝潰れた目になる。くっつくくらいなら動かさない。
                if let n = sp.nose, nx == n.x, abs(e.y - n.y) <= 1 { continue }
                cells[e.y * sp.w + e.x] = 2
                cells[e.y * sp.w + nx] = 1
            }
        }

        let rows = topRows > 0 ? min(topRows, sp.h) : sp.h
        let cw = cols > 0 ? min(cols, sp.w) : sp.w
        let x0 = (cols > 0 && colsFromRight) ? sp.w - cw : 0
        var buf = [UInt8](repeating: 0, count: cw * rows * 4)
        for y in 0..<rows {
            for x in 0..<cw {
                let sx = x0 + x
                let src = cells[y * sp.w + (flip ? (sp.w - 1 - sx) : sx)]
                var c = rgba[Int(src)]
                if src == 1, let t = tintLine { c = t }
                if src == 2, let t = tint { c = t }
                if src == 3, let t = tintMark { c = t }
                let o = (y * cw + x) * 4
                buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; buf[o + 3] = c[3]
            }
        }
        // 90度ずつ回す。dst(R,C) がどの src を指すかだけの話。
        //   反時計回り … 下の辺が右の辺に来る（右の壁に立たせるのに使う）
        //   180度      … 下の辺が上に来る（天井にぶら下がる）
        //   時計回り   … 下の辺が左の辺に来る（左の壁）
        var ow = cw, oh = rows
        if tn != 0 {
            let sw = cw, sh = rows
            (ow, oh) = (tn % 2 == 1) ? (sh, sw) : (sw, sh)
            var rot = [UInt8](repeating: 0, count: ow * oh * 4)
            for r in 0..<oh {
                for c in 0..<ow {
                    let sr: Int, sc: Int
                    switch tn {
                    case 1:  sr = c;          sc = sw - 1 - r
                    case 2:  sr = sh - 1 - r; sc = sw - 1 - c
                    default: sr = sh - 1 - c; sc = r
                    }
                    let s = (sr * sw + sc) * 4, d = (r * ow + c) * 4
                    rot[d] = buf[s]; rot[d + 1] = buf[s + 1]
                    rot[d + 2] = buf[s + 2]; rot[d + 3] = buf[s + 3]
                }
            }
            buf = rot
        }

        guard let provider = CGDataProvider(data: Data(buf) as CFData) else { return nil }
        let img = CGImage(width: ow, height: oh,
                          bitsPerComponent: 8, bitsPerPixel: 32,
                          bytesPerRow: ow * 4,
                          space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
                          provider: provider, decode: nil,
                          shouldInterpolate: false, intent: .defaultIntent)
        if let img { cache[key] = img }
        return img
    }

    /// 面の色（吹き出しの下地などで使う）
    static var fillColor: CGColor {
        loadIfNeeded()
        let c = rgba[2]
        return NSColor(srgbRed: CGFloat(c[0]) / 255, green: CGFloat(c[1]) / 255,
                       blue: CGFloat(c[2]) / 255, alpha: 1).cgColor
    }

    static var inkColor: CGColor {
        loadIfNeeded()
        let c = rgba[1]
        return NSColor(srgbRed: CGFloat(c[0]) / 255, green: CGFloat(c[1]) / 255,
                       blue: CGFloat(c[2]) / 255, alpha: 1).cgColor
    }

    // MARK: - 読み込み場所

    private static func rgbaFrom(_ hex: String?) -> [UInt8]? {
        guard var s = hex else { return nil }
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6, let v = UInt32(s, radix: 16) else { return nil }
        return [UInt8((v >> 16) & 0xFF), UInt8((v >> 8) & 0xFF), UInt8(v & 0xFF), 255]
    }

    private static func locate() -> Data? {
        if let u = Bundle.main.url(forResource: "sprites", withExtension: "json"),
           let d = try? Data(contentsOf: u) { return d }
        let exe = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
        for rel in ["sprites.json", "../Resources/sprites.json",
                    "../../Assets/sprites.json", "Assets/sprites.json"] {
            let u = exe.appendingPathComponent(rel).standardized
            if let d = try? Data(contentsOf: u) { return d }
        }
        return nil
    }
}
