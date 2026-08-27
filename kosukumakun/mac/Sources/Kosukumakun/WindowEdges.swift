import AppKit

/// 画面上のウィンドウの「上端」を探す。
///
/// こすくまくんをウィンドウやフォルダの縁に置くと、そこにちょこんと乗って顔だけ出す。
/// そのために、いま開いているウィンドウの矩形が要る。
///
/// **権限は要らない。** `CGWindowListCopyWindowInfo` で取れるのは位置と大きさだけで、
/// 中身（画面の絵）は取っていない。画面収録の許可ダイアログは出ない。
/// ウィンドウの名前も読んでいない（読むと権限が要る場合がある）。
enum WindowEdges {

    /// どの縁に付いたか
    enum Kind { case top, left, right }

    /// 付ける縁。id を覚えておくと、あとで窓が動いても追いかけられる。
    struct Edge {
        let kind: Kind
        /// 窓そのものの矩形（AppKit座標）
        let rect: CGRect
        let id: CGWindowID

        var y: CGFloat { rect.maxY }
        var x0: CGFloat { rect.minX }
        var x1: CGFloat { rect.maxX }
    }

    /// AppKit座標（左下原点）へ直すための、主ディスプレイの高さ
    private static var flipHeight: CGFloat {
        NSScreen.screens.first?.frame.maxY ?? 0
    }

    /// 点 p の下方向 tolerance 以内にあるウィンドウ上端のうち、いちばん近いものを返す。
    /// 返すのは (上端のY, その縁の左右の範囲)。
    static func topEdgeNear(_ p: CGPoint, tolerance: CGFloat) -> Edge? {
        let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        guard let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] else {
            return nil
        }
        let flip = flipHeight
        let myPid = Int(ProcessInfo.processInfo.processIdentifier)

        // CGWindowListCopyWindowInfo は **手前から奥の順**。
        //
        // 「近い縁を全部から探す」とやると、奥のウィンドウの縁にも乗ってしまう。
        // こすくまくんの窓は最前面なので、奥のウィンドウに乗ると
        // 手前のウィンドウの真ん中に浮いているようにしか見えない（＝“間に乗る”）。
        //
        // なので **落とした場所にある、いちばん手前のウィンドウ** を1つだけ選び、
        // そのウィンドウの上端が近いときだけ乗る。近くなければ乗らずに落ちる。
        for w in list {
            guard (w[kCGWindowLayer as String] as? Int) == 0,
                  (w[kCGWindowOwnerPID as String] as? Int) != myPid,
                  let b = w[kCGWindowBounds as String] as? [String: CGFloat],
                  let bw = b["Width"], let bh = b["Height"],
                  let bx = b["X"], let by = b["Y"],
                  bw >= 120, bh >= 80 else { continue }

            let top = flip - by                 // Quartz(上原点) → AppKit(下原点)
            let bottom = top - bh
            guard p.x >= bx - 8, p.x <= bx + bw + 8 else { continue }

            // **下から持ち上げてくる方が自然な動き** なので、下側の猶予を広く取る。
            // 以前は上から tolerance、下から tolerance*0.4 と非対称で、
            // わざわざ窓の上まで回り込まないと乗れなかった。
            let fromBelow = tolerance * 1.7      // 窓の中から上端へ近づいてくる場合
            let fromAbove = tolerance            // 窓の外（上）から降りてくる場合

            // この窓の「守備範囲」に居るか（居ないなら奥の窓を見に行く）
            guard p.y <= top + fromAbove, p.y >= bottom - 4 else { continue }

            // ここがいちばん手前の窓。
            //
            // **Finder や Chrome は、ひとつの見た目のウィンドウを複数のCGWindowに分けている。**
            // ツールバー・中身・外枠がそれぞれ別の窓として返ってくるので、
            // そのうちの1枚（たいてい「中身」）の上端に乗ると、
            // ツールバーの中に埋まったように見えてしまう。
            //
            // 同じアプリの窓のうち、**この窓と少しでも重なっているものを全部まとめて**、
            // その一番上を「本当の上端」とする。重なり率で絞ると、細いツールバーを取り逃す。
            let pid = (w[kCGWindowOwnerPID as String] as? Int) ?? -1
            let base = CGRect(x: bx, y: bottom, width: bw, height: bh)
            var union = base
            for o in list {
                guard (o[kCGWindowOwnerPID as String] as? Int) == pid,
                      (o[kCGWindowLayer as String] as? Int) == 0,
                      let ob = o[kCGWindowBounds as String] as? [String: CGFloat],
                      let obw = ob["Width"], let obh = ob["Height"],
                      let obx = ob["X"], let oby = ob["Y"],
                      obw >= 60, obh >= 16 else { continue }
                let r = CGRect(x: obx, y: flip - oby - obh, width: obw, height: obh)
                // 少しでも重なっていれば同じ見た目のウィンドウの一部とみなす
                guard r.intersects(base.insetBy(dx: -8, dy: -8)) else { continue }
                union = union.union(r)
            }
            let realTop = union.maxY
            let realX0 = union.minX
            let realX1 = union.maxX

            let d = p.y - realTop
            if d >= -fromBelow && d <= fromAbove {
                let id = (w[kCGWindowNumber as String] as? Int).map { CGWindowID($0) } ?? 0
                return Edge(kind: .top,
                            rect: CGRect(x: realX0, y: bottom, width: realX1 - realX0,
                                         height: realTop - bottom),
                            id: id)
            }
            return nil
        }
        return nil
    }

    /// 一度乗った窓を、あとから番号だけで追いかける。
    /// 窓を動かしたらこすくまくんもついていくために要る。
    static func edge(ofWindow id: CGWindowID) -> Edge? {
        guard id != 0,
              let list = CGWindowListCopyWindowInfo([.optionIncludingWindow], id) as? [[String: Any]],
              let w = list.first,
              let b = w[kCGWindowBounds as String] as? [String: CGFloat],
              let bw = b["Width"], let bh = b["Height"],
              let bx = b["X"], let by = b["Y"], bw >= 60, bh >= 40 else { return nil }
        return Edge(kind: .top,
                    rect: CGRect(x: bx, y: flipHeight - by - bh, width: bw, height: bh),
                    id: id)
    }

    /// 左右の縁。点 p の近くに、いちばん手前の窓の左端／右端があればそれを返す。
    /// 上端の判定で拾えなかったときに使う。
    static func sideEdgeNear(_ p: CGPoint, tolerance: CGFloat) -> Edge? {
        let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        guard let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] else {
            return nil
        }
        let flip = flipHeight
        let myPid = Int(ProcessInfo.processInfo.processIdentifier)

        for w in list {
            guard (w[kCGWindowLayer as String] as? Int) == 0,
                  (w[kCGWindowOwnerPID as String] as? Int) != myPid,
                  let b = w[kCGWindowBounds as String] as? [String: CGFloat],
                  let bw = b["Width"], let bh = b["Height"],
                  let bx = b["X"], let by = b["Y"],
                  bw >= 120, bh >= 80 else { continue }

            let top = flip - by
            let bottom = top - bh
            // 縦は窓の範囲に入っていること（上下に少しだけはみ出しは許す）
            guard p.y <= top + tolerance * 0.5, p.y >= bottom - tolerance * 0.5 else { continue }

            let id = (w[kCGWindowNumber as String] as? Int).map { CGWindowID($0) } ?? 0
            let rect = CGRect(x: bx, y: bottom, width: bw, height: bh)
            let dl = p.x - bx              // 左端との差
            let dr = p.x - (bx + bw)       // 右端との差
            if abs(dl) <= tolerance && abs(dl) <= abs(dr) {
                return Edge(kind: .left, rect: rect, id: id)
            }
            if abs(dr) <= tolerance {
                return Edge(kind: .right, rect: rect, id: id)
            }
            // いちばん手前の窓の中にいて、左右どちらの縁にも遠い → 付かない
            if p.x > bx && p.x < bx + bw { return nil }
        }
        return nil
    }

}
