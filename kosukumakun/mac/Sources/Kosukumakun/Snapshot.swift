import AppKit

/// `Kosukumakun --snapshot <出力先>` で、こすくまくんの各コマをPNGに書き出す。
///
/// 画面収録の権限が要らず、毎回まったく同じ絵が出るので、
/// 見た目の検証（と、あとから機械的にレビューさせるとき）に使う。
enum Snapshot {

    struct Scene {
        let name: String
        let label: String
        let make: (inout PetFrame) -> Void
    }

    static let scenes: [Scene] = [
        Scene(name: "01_idle",    label: "ふつう") { _ in },
        Scene(name: "02_blink",   label: "まばたき／うれしい") { f in f.sprite = "blink" },
        Scene(name: "03_squash",  label: "潰れる（着地・なでられる）") { f in f.sprite = "squash" },
        Scene(name: "04_stretch", label: "伸びる（跳ぶ・つままれる）") { f in f.sprite = "stretch" },
        Scene(name: "05_look_l",  label: "左を見る") { f in f.look = -1 },
        Scene(name: "06_look_r",  label: "右を見る") { f in f.look = 1 },
        Scene(name: "07_flip",    label: "左向き") { f in f.faceRight = false; f.look = 1 },
        Scene(name: "08_back",    label: "後ろ姿") { f in f.sprite = "back" },
        Scene(name: "09_side",    label: "ふりむき") { f in f.sprite = "side" },
        Scene(name: "10_lying",   label: "寝そべり（おやすみ）") { f in f.sprite = "lying" },
        Scene(name: "11_small",   label: "小さいこすくまくん") { f in f.sprite = "small" },
        Scene(name: "12_air",     label: "跳んでいる（影が薄い）") { f in
            f.sprite = "stretch"; f.shadow = 0.03
        },
        Scene(name: "13_peek",    label: "上端からのぞく") { f in
            f.peekRows = 24; f.shadow = 0
        },
        Scene(name: "20_turn_L_look-1", label: "左の縁 目-1") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = -1
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = -1; f.faceRight = true
        },
        Scene(name: "21_turn_L_look0", label: "左の縁 目0") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = -1; f.faceRight = true
        },
        Scene(name: "22_turn_L_look1", label: "左の縁 目+1") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = 1
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = -1; f.faceRight = true
        },
        Scene(name: "23_turn_R_look-1", label: "右の縁 目-1") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = -1
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = 1; f.faceRight = false
        },
        Scene(name: "24_turn_R_look0", label: "右の縁 目0") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = 1; f.faceRight = false
        },
        Scene(name: "25_turn_R_look1", label: "右の縁 目+1") { f in
            f.sprite = "turn"; f.shadow = 0; f.look = 1
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = 1; f.faceRight = false
        },
        Scene(name: "26_turn_full", label: "ふりむき全身") { f in f.sprite = "turn" },
        Scene(name: "14_peek_l",  label: "左の縁からひょこっと") { f in
            f.sprite = "lying"; f.shadow = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("lying").w) * 0.55)
            f.peekSide = -1; f.faceRight = true
        },
        Scene(name: "15_peek_r",  label: "右の縁からひょこっと") { f in
            f.sprite = "lying"; f.shadow = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("lying").w) * 0.55)
            f.peekSide = 1; f.faceRight = false
        },
    ]

    /// 引数を処理した場合 true
    static func handle(_ args: [String]) -> Bool {
        if let i = args.firstIndex(of: "--textcheck"), i + 1 < args.count {
            return textCheck(URL(fileURLWithPath: args[i + 1]))
        }
        if let i = args.firstIndex(of: "--snapshot-fx"), i + 1 < args.count {
            return effects(URL(fileURLWithPath: args[i + 1]))
        }
        guard let i = args.firstIndex(of: "--snapshot"), i + 1 < args.count else { return false }
        let dir = URL(fileURLWithPath: args[i + 1])
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)

        SpriteBank.loadIfNeeded()
        let scale = 5
        let size = CGSize(width: 240, height: 240)
        let view = PetView(frame: NSRect(origin: .zero, size: size))
        view.layoutSubtreeIfNeeded()

        var written: [(String, String)] = []
        for sc in scenes {
            var f = PetFrame()
            f.pixelScale = scale
            f.foot = CGPoint(x: size.width / 2, y: 40)
            sc.make(&f)
            view.render(f)
            if let png = image(of: view, size: size) {
                try? png.write(to: dir.appendingPathComponent(sc.name + ".png"))
                written.append((sc.name, sc.label))
            }
        }
        writeContactSheet(dir: dir, items: written)
        FileHandle.standardOutput.write("snapshot: \(written.count) files → \(dir.path)\n"
            .data(using: .utf8)!)
        return true
    }

    /// 演出（心の声のメッセージ枠など）を画面に出さずに描き出す。
    ///
    /// ふるまいは Brain 経由でしか動かないので、ここでは本物の Brain と
    /// ふるまいを組み立てて、時間だけ手で進めてから焼く。
    private static func effects(_ dir: URL) -> Bool {
        func dir_(_ n: String) -> URL { dir.appendingPathComponent(n + ".png") }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        SpriteBank.loadIfNeeded()

        let size = CGSize(width: 460, height: 380)
        let view = PetView(frame: NSRect(origin: .zero, size: size))
        view.layoutSubtreeIfNeeded()

        let brain = Brain()
        brain.host = view
        let activity = Activity()
        let thought = ThoughtBehavior()

        let samples = [
            ("fx01_short",  "しずか"),
            ("fx02_mid",    "きょうも いる"),
            ("fx03_long",   "こんぺいとう たべたい"),
            ("fx04_wrap",   "そのままで だいじょうぶ"),
            ("fx05_longest", "こんぺいとう ひとつぶ ほしい"),
        ]

        // --- キーボード / 湯気 / 伸び -------------------------------------
        let keyboard = KeyboardBehavior()
        brain.behaviors = [keyboard]
        let screen = NSRect(x: 0, y: 0, width: size.width, height: size.height)

        /// Brain を実際に回してから焼く。手作りの PetFrame を渡すと
        /// tapSide などが動かず、「押されていないキー」しか撮れない（実際にそれで見落とした）。
        func shoot(_ name: String, rate: CGFloat, frames: Int) {
            brain.setStart(CGPoint(x: size.width / 2, y: 60))
            // 打鍵を模擬する。rate だけ上げても strokes が増えないと
            // 「押されていないキー」しか撮れない（実際にそれで押し込みを見落とした）。
            for i in 0..<frames {
                activity.debugOverride(typingRate: rate, stroke: i % 9 == 0)
                brain.update(dt: 1.0 / 30, activity: activity, screen: screen)
            }
            var f = brain.frame
            f.pixelScale = 4
            f.foot = CGPoint(x: size.width / 2, y: 60)
            view.render(f)
            for _ in 0..<2 { keyboard.update(dt: 1.0 / 30, brain: brain, activity: activity) }
            if let png = image(of: view, size: size) {
                try? png.write(to: dir.appendingPathComponent(name + ".png"))
            }
            FileHandle.standardOutput.write("  \(name) sprite=\(f.sprite) side=\(brain.tapSide)\n"
                .data(using: .utf8)!)
        }
        shoot("fx10_keys_L", rate: 3, frames: 28)
        shoot("fx11_keys_R", rate: 3, frames: 37)
        shoot("fx12_steam",  rate: 9, frames: 90)
        activity.debugOverride(typingRate: 0)
        for _ in 0..<40 { brain.update(dt: 1.0 / 30, activity: activity, screen: screen) }
        brain.behaviors = []

        // 金平糖を転がすところ
        let rolling = RollingBehavior()
        brain.behaviors = [rolling]
        for (name, dir, frames) in [("fx4_roll_L", -1, 14), ("fx4_roll_R", 1, 20)] {
            brain.setStart(CGPoint(x: size.width / 2, y: 60))
            for _ in 0..<frames {
                activity.debugOverride(typingRate: 0, scrolling: true, scrollDir: dir)
                brain.update(dt: 1.0 / 30, activity: activity, screen: screen)
            }
            var f = brain.frame
            f.pixelScale = 4
            f.foot = CGPoint(x: size.width / 2, y: 60)
            view.render(f)
            rolling.update(dt: 1.0 / 30, brain: brain, activity: activity)
            if let png = image(of: view, size: size) {
                try? png.write(to: dir_(name))
            }
            FileHandle.standardOutput.write("  \(name) rollDir=\(brain.rollDir)\n".data(using: .utf8)!)
        }
        activity.debugOverride(typingRate: 0)
        brain.behaviors = []

        for name in ["pull1", "pull2", "pull3", "pull4"] {
            var f = PetFrame()
            f.pixelScale = 4
            f.foot = CGPoint(x: size.width / 2, y: 60)
            f.sprite = name
            view.render(f)
            if let png = image(of: view, size: size) {
                try? png.write(to: dir.appendingPathComponent("fx2_" + name + ".png"))
            }
        }
        FileHandle.standardOutput.write("  fx2_pull1..4\n".data(using: .utf8)!)

        // 豆知識（大きい字）も焼いてみる
        for (i, tip) in ["⌘⇧4 のあと スペースで まどだけ 撮れる",
                         "Finderで ⌘C のあと ⌘⌥V なら 移動になる",
                         "⌃⌘スペース で 絵文字と 記号が 出る"].enumerated() {
            var f = PetFrame()
            f.pixelScale = 4
            f.foot = CGPoint(x: size.width / 2, y: 34)
            view.render(f)
            brain.think(tip, seconds: 60, big: true)
            for _ in 0..<24 { thought.update(dt: 1.0 / 30, brain: brain, activity: activity) }
            view.render(f)
            if let png = image(of: view, size: size) {
                try? png.write(to: dir.appendingPathComponent("fx3_tip\(i + 1).png"))
            }
        }
        FileHandle.standardOutput.write("  fx3_tip1..3\n".data(using: .utf8)!)

        for (name, text) in samples {
            var f = PetFrame()
            f.pixelScale = 4
            f.foot = CGPoint(x: size.width / 2, y: 34)
            view.render(f)

            brain.think(text, seconds: 60)
            // 窓が開き切るまでコマを進める
            for _ in 0..<24 { thought.update(dt: 1.0 / 30, brain: brain, activity: activity) }
            view.render(f)

            if let png = image(of: view, size: size) {
                try? png.write(to: dir.appendingPathComponent(name + ".png"))
            }
            FileHandle.standardOutput.write("  \(name): 「\(text)」\n".data(using: .utf8)!)
        }
        return true
    }

    /// 和文をドットに落としたときの読めるかどうかを確かめる。
    ///
    /// こす.くま の fliplist で「和文は12ドットまで落とすと漢字が別字に化ける」という
    /// 記録があるので、こすくまくんの心の声で実際に使う文言を、級数を変えて並べて見る。
    private static func textCheck(_ dir: URL) -> Bool {
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let samples = ["⌘⇧4 のあと スペースで まどだけ撮れる",
                       "⌥ドラッグ で ファイルを コピー",
                       "⌃⌘スペース で 絵文字が 出る",
                       "⌘⌥H で いま以外の まどを 全部かくす",
                       "Finderで スペース おすと 中身が 見える"]
        let sizes = [9, 10, 11, 12, 13, 14]
        let scale = 4

        for size in sizes {
            var lines: [(w: Int, h: Int, on: [Bool])] = []
            for s in samples { lines.append(PixelText.rasterize(s, size: size)) }
            let w = (lines.map(\.w).max() ?? 10) + 8
            let h = lines.reduce(4) { $0 + $1.h + 2 }
            var c = PixelCanvas(w: w, h: h)
            c.fill((0, 0, w, h), 2)
            var y = 2
            for t in lines {
                PixelText.blit(t, into: &c, x: 4, y: y)
                y += t.h + 2
            }
            guard let img = c.image(palette: [[0, 0, 0, 0], [0x14, 0x12, 0x10, 255],
                                              [0xF7, 0xF7, 0xD8, 255], [0x28, 0x38, 0x2C, 255]]),
                  let ctx = CGContext(data: nil, width: w * scale, height: h * scale,
                                      bitsPerComponent: 8, bytesPerRow: 0,
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
            else { continue }
            ctx.interpolationQuality = .none
            ctx.draw(img, in: CGRect(x: 0, y: 0, width: w * scale, height: h * scale))
            if let out = ctx.makeImage(),
               let png = NSBitmapImageRep(cgImage: out).representation(using: .png, properties: [:]) {
                try? png.write(to: dir.appendingPathComponent("text_\(size)dot.png"))
            }
            FileHandle.standardOutput.write("  \(size)ドット → \(w)x\(h)\n".data(using: .utf8)!)
        }
        return true
    }

    /// レイヤツリーをそのままビットマップに焼く。
    /// ドットをにじませないよう等倍で焼く（拡大はスプライト側の整数倍で済んでいる）。
    private static func image(of view: PetView, size: CGSize) -> Data? {
        let w = Int(size.width), h = Int(size.height)
        guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                                  bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
        ctx.interpolationQuality = .none
        view.layer?.render(in: ctx)
        guard let cg = ctx.makeImage() else { return nil }
        return NSBitmapImageRep(cgImage: cg).representation(using: .png, properties: [:])
    }

    private static func writeContactSheet(dir: URL, items: [(String, String)]) {
        var cells = ""
        for (name, label) in items {
            cells += """
            <figure><img src="\(name).png"><figcaption>\(name)<br><b>\(label)</b></figcaption></figure>
            """
        }
        let html = """
        <!doctype html><meta charset=utf-8><title>こすくまくん コマ一覧</title>
        <style>
        body{background:#c8c8c2;font:12px -apple-system,sans-serif;margin:0;padding:16px;color:#222}
        h1{font-size:15px;margin:0 0 12px}
        .g{display:flex;flex-wrap:wrap;gap:10px}
        figure{margin:0;background:#efeee7;border:2px solid #141210;padding:6px;text-align:center}
        figcaption{margin-top:4px;color:#555;font-size:10px;line-height:1.5}
        img{display:block;image-rendering:pixelated}
        </style>
        <h1>こすくまくん コマ一覧（アプリのレンダラ出力そのまま）</h1>
        <div class=g>\(cells)</div>
        """
        try? html.write(to: dir.appendingPathComponent("index.html"), atomically: true, encoding: .utf8)
    }
}
