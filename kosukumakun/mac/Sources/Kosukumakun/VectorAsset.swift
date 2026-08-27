import AppKit

/// 公式Illustratorデータから抽出したベクターパーツ。
/// tools/extract_kosukuma.py が吐いた kosukuma.json を読む。
///
/// 座標系: 身長1000 / 原点=バウンディングボックス中心 / **Y上向き**
/// （JSONはSVG準拠のY下向きなので、読み込み時に反転する）

enum PathSeg {
    case move(CGPoint)
    case line(CGPoint)
    case curve(c1: CGPoint, c2: CGPoint, to: CGPoint)
    case close
}

struct VectorPart {
    let id: String
    let fill: CGColor
    let segs: [PathSeg]
    let center: CGPoint     // パーツ中心（変形後の位置算出に使う）
    let size: CGSize
}

struct VectorPose {
    let width: CGFloat
    let height: CGFloat
    let parts: [VectorPart]

    func part(_ id: String) -> VectorPart? { parts.first { $0.id == id } }
}

enum Asset {

    static let unit: CGFloat = 1000     // 身長

    // 公式の色（書き出しPNGから実測）
    static let cream = NSColor(srgbRed: 0xFA / 255, green: 0xFA / 255, blue: 0xD3 / 255, alpha: 1).cgColor
    static let ink   = NSColor(srgbRed: 0, green: 0, blue: 0, alpha: 1).cgColor
    static let mole  = NSColor(srgbRed: 0x1A / 255, green: 0x25 / 255, blue: 0x1F / 255, alpha: 1).cgColor

    private(set) static var poses: [String: VectorPose] = [:]

    static func loadIfNeeded() {
        guard poses.isEmpty else { return }
        guard let data = locate() else {
            fatalError("kosukuma.json が見つかりません")
        }
        guard let root = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
              let raw = root["poses"] as? [String: Any] else {
            fatalError("kosukuma.json の形式が違います")
        }
        var out: [String: VectorPose] = [:]
        for (name, value) in raw {
            guard let pd = value as? [String: Any],
                  let list = pd["parts"] as? [[String: Any]] else { continue }
            let w = num(pd["w"]) ?? unit
            let h = num(pd["h"]) ?? unit
            var parts: [VectorPart] = []
            for p in list {
                guard let id = p["id"] as? String,
                      let d = p["d"] as? String,
                      let hex = p["fill"] as? String else { continue }
                let c = (p["c"] as? [Double]) ?? [0, 0]
                let s = (p["s"] as? [Double]) ?? [0, 0]
                parts.append(VectorPart(
                    id: id,
                    fill: color(hex: hex),
                    segs: parse(d),
                    center: CGPoint(x: c[0], y: -c[1]),      // Y反転
                    size: CGSize(width: s[0], height: s[1])))
            }
            out[name] = VectorPose(width: w, height: h, parts: parts)
        }
        poses = out
    }

    static func pose(_ name: String) -> VectorPose {
        loadIfNeeded()
        return poses[name] ?? poses["front"]!
    }

    // MARK: - 読み込み場所（.app内 → 実行ファイル隣 → 開発時のAssets）

    private static func locate() -> Data? {
        if let u = Bundle.main.url(forResource: "kosukuma", withExtension: "json"),
           let d = try? Data(contentsOf: u) { return d }
        let exe = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
        for rel in ["kosukuma.json",
                    "../Resources/kosukuma.json",
                    "../../Assets/kosukuma.json",
                    "Assets/kosukuma.json"] {
            let u = exe.appendingPathComponent(rel).standardized
            if let d = try? Data(contentsOf: u) { return d }
        }
        return nil
    }

    private static func num(_ v: Any?) -> CGFloat? {
        if let n = v as? NSNumber { return CGFloat(n.doubleValue) }
        return nil
    }

    private static func color(hex: String) -> CGColor {
        var s = hex
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6, let v = UInt32(s, radix: 16) else { return ink }
        return NSColor(srgbRed: CGFloat((v >> 16) & 0xFF) / 255,
                       green: CGFloat((v >> 8) & 0xFF) / 255,
                       blue: CGFloat(v & 0xFF) / 255,
                       alpha: 1).cgColor
    }

    /// "M x y C x y x y x y L x y Z" を読む。公式データはこの4命令しか使っていない。
    private static func parse(_ d: String) -> [PathSeg] {
        var segs: [PathSeg] = []
        var it = d.split(separator: " ").makeIterator()
        var pending: [CGFloat] = []
        var op: Character = "M"

        func nextNum(_ t: Substring) -> CGFloat? { CGFloat(Double(t) ?? .nan).isNaN ? nil : CGFloat(Double(t)!) }

        func flush() {
            switch op {
            case "M":
                var i = 0
                while i + 1 < pending.count {
                    let p = CGPoint(x: pending[i], y: -pending[i + 1])
                    segs.append(i == 0 ? .move(p) : .line(p))
                    i += 2
                }
            case "L":
                var i = 0
                while i + 1 < pending.count {
                    segs.append(.line(CGPoint(x: pending[i], y: -pending[i + 1])))
                    i += 2
                }
            case "C":
                var i = 0
                while i + 5 < pending.count {
                    segs.append(.curve(c1: CGPoint(x: pending[i], y: -pending[i + 1]),
                                       c2: CGPoint(x: pending[i + 2], y: -pending[i + 3]),
                                       to: CGPoint(x: pending[i + 4], y: -pending[i + 5])))
                    i += 6
                }
            default: break
            }
            pending.removeAll(keepingCapacity: true)
        }

        while let tok = it.next() {
            if tok.count == 1, let ch = tok.first, "MLCZ".contains(ch) {
                flush()
                op = ch
                if ch == "Z" { segs.append(.close) }
            } else if let v = nextNum(tok) {
                pending.append(v)
            }
        }
        flush()
        return segs
    }
}
