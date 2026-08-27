import AppKit

/// こすくまくんを手放した瞬間の判定を、そのままファイルに残す。
/// 画面を直接見られない状況で「なぜ中途半端な位置に乗ったのか」を突き止めるための記録。
/// 原因が分かったら消してよい。
enum DropLog {
    private static let url = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("kosukuma-drop.log")

    /// - Parameters:
    ///   - top: 上端の判定
    ///   - side: 左右の縁の判定
    ///   - landed: 結局どうなったか。**ここが無かったせいで、上端が無いだけの行を
    ///     「落ちた」と読み違えた。** 何が起きたかは、結果まで書いて初めて分かる。
    static func write(pos: CGPoint, speed: CGFloat, gentle: Bool,
                      top: WindowEdges.Edge?, side: WindowEdges.Edge?, landed: String,
                      height: CGFloat) {
        let flip = NSScreen.screens.first?.frame.maxY ?? 0
        var lines = ["--- 手放した \(Date()) ---",
                     "  足元 = (\(Int(pos.x)), \(Int(pos.y)))  初速 = \(Int(speed))  乗る条件=\(gentle)",
                     "  画面の高さ = \(Int(flip))  表示身長 = \(Int(height))",
                     "  上端 = " + (top.map { "Y=\(Int($0.y)) x=\(Int($0.x0))..\(Int($0.x1)) 窓#\($0.id)" } ?? "なし"),
                     "  左右 = " + (side.map { "\($0.kind) x=\(Int($0.x0))..\(Int($0.x1)) 窓#\($0.id)" } ?? "なし"),
                     "  結果 = \(landed)"]

        // その時点のウィンドウの重なりも一緒に残す
        let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        let list = (CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]]) ?? []
        var n = 0
        for w in list {
            guard (w[kCGWindowLayer as String] as? Int) == 0,
                  let b = w[kCGWindowBounds as String] as? [String: CGFloat],
                  let bw = b["Width"], let bh = b["Height"],
                  let bx = b["X"], let by = b["Y"], bw >= 120, bh >= 80 else { continue }
            let name = (w[kCGWindowOwnerName as String] as? String) ?? "?"
            n += 1
            lines.append("  窓\(n): \(name) 上端=\(Int(flip - by)) 下端=\(Int(flip - by - bh)) x=\(Int(bx))..\(Int(bx + bw))")
            if n >= 5 { break }
        }
        lines.append("")

        let text = lines.joined(separator: "\n")
        if let h = try? FileHandle(forWritingTo: url) {
            h.seekToEndOfFile()
            h.write(text.data(using: .utf8)!)
            try? h.close()
        } else {
            try? text.write(to: url, atomically: true, encoding: .utf8)
        }
    }
}
