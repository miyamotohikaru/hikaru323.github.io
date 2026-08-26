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
        // 画面の縁を伝うときの4つの向き。足がどの面に着いているかを見る。
        Scene(name: "30_side0_bottom", label: "下の縁（ふつう）") { f in
            f.sprite = "turn"; f.turn = 0; f.faceRight = false
        },
        Scene(name: "31_side1_right", label: "右の壁（上へ）") { f in
            f.sprite = "turn"; f.turn = 1; f.faceRight = false
        },
        Scene(name: "32_side2_top", label: "天井（左へ）") { f in
            f.sprite = "turn"; f.turn = 2; f.faceRight = false
        },
        Scene(name: "33_side3_left", label: "左の壁（下へ）") { f in
            f.sprite = "turn"; f.turn = 3; f.faceRight = false
        },
        // 画面のはしからのぞく4通り（動画を見ているときの姿）
        Scene(name: "40_sp_top", label: "画面の上から さかさま") { f in
            f.sprite = "idle"; f.turn = 2; f.peekRows = 24; f.shadow = 0
        },
        Scene(name: "41_sp_right", label: "画面の右のはしから") { f in
            f.sprite = "turn"; f.shadow = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = -1; f.faceRight = true
        },
        Scene(name: "42_sp_left", label: "画面の左のはしから") { f in
            f.sprite = "turn"; f.shadow = 0
            f.peekCols = Int(CGFloat(SpriteBank.sprite("turn").w) * 0.70)
            f.peekSide = 1; f.faceRight = false
        },
        Scene(name: "43_sp_bottom", label: "下から ひょこっと") { f in
            f.sprite = "idle"; f.peekRows = 24; f.shadow = 0
        },
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
        if let i = args.firstIndex(of: "--frames"), i + 1 < args.count {
            return motion(URL(fileURLWithPath: args[i + 1]))
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

        // 梅干しを転がすところ
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

    // MARK: - 動いているところ（説明サイトのGIF用）

    /// `--frames <出力先>` … 「できること」を **コマ送り** で書き出す。
    ///
    /// 静止画1枚では伝わらないもの（湯気が上がる・梅干しが回る・もちのように伸びる）を
    /// 見せるため。ここで出したPNGの束を tools/make_shots.py がGIFにまとめる。
    ///
    /// 30コマ/秒で回して2コマに1枚だけ書き出す（＝15コマ/秒のGIF）。
    /// 中身の動きは本物のまま、枚数だけ半分にするやり方。
    ///
    /// カーソルはアプリが描くものではないので、**どこに居たか** を manifest.json に残し、
    /// 絵の合成側で描き足す。両側で同じ式を書くと、いつか必ずずれる。
    private static func motion(_ dir: URL) -> Bool {
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        SpriteBank.loadIfNeeded()

        let size = CGSize(width: 460, height: 380)
        let view = PetView(frame: NSRect(origin: .zero, size: size))
        view.layoutSubtreeIfNeeded()
        let screen = NSRect(origin: .zero, size: size)
        let dt: CGFloat = 1.0 / 30
        let every = 2
        let scale = 4
        let footY: CGFloat = 56
        let cx = size.width / 2

        var manifest: [String: Any] = [:]

        func save(_ scene: String, _ index: Int) {
            let sub = dir.appendingPathComponent(scene)
            try? FileManager.default.createDirectory(at: sub, withIntermediateDirectories: true)
            if let png = image(of: view, size: size) {
                try? png.write(to: sub.appendingPathComponent(String(format: "%03d.png", index)))
            }
        }

        /// 前の場面の演出（キーボード・梅干し・湯気・Z）を消す。
        /// ふるまいは自分のレイヤを足すだけで片付けないので、
        /// 消さないと次の場面に全部写り込む（実際にそうなった）。
        func clearEffects() {
            view.effectLayer.sublayers?.forEach { $0.removeFromSuperlayer() }
        }

        /// Brain を回して撮る。behaviors は brain には積まず、
        /// **描画のあとに手で1回だけ** 進める（brain 経由だと1コマに2回動いて倍速になる）。
        func run(_ scene: String, caps: Int, behaviors: [PetBehavior], startX: CGFloat? = nil,
                 setup: (Brain, Activity) -> Void,
                 step: (Brain, Activity, Int) -> Void,
                 footAt: ((Brain) -> CGPoint)? = nil,
                 mark: ((Brain, Int) -> [String: Any])? = nil) {
            clearEffects()
            let brain = Brain()
            brain.host = view
            brain.wanders = false          // 勝手に跳ねて画面から出ないように
            brain.setStart(CGPoint(x: startX ?? cx, y: 6))
            let activity = Activity()
            setup(brain, activity)
            var marks: [[String: Any]] = []
            for i in 0..<(caps * every) {
                step(brain, activity, i)
                brain.update(dt: dt, activity: activity, screen: screen)
                var f = brain.frame
                f.pixelScale = scale
                f.foot = footAt?(brain) ?? CGPoint(x: cx, y: footY)
                view.render(f)
                for b in behaviors { b.update(dt: dt, brain: brain, activity: activity) }
                if i % every == 0 {
                    let n = i / every
                    save(scene, n)
                    marks.append(mark?(brain, n) ?? [:])
                }
            }
            manifest[scene] = ["frames": caps, "fps": 30 / every, "marks": marks]
            FileHandle.standardOutput.write("  \(scene): \(caps)枚\n".data(using: .utf8)!)
        }

        // --- 目でカーソルを追う -------------------------------------------
        // カーソルを左右に往復させる。視線は遅れて付いてくるので、
        // 1周ぶん空回ししてから撮ると、最初と最後がつながる。
        let orbit: (Int) -> CGPoint = { i in
            let t = CGFloat(i) / 60.0 * 2 * .pi
            // 高さは頭より上。胸の高さで往復させると、真ん中でカーソルが
            // こすくまくんに重なって「追っている」どころか隠れてしまう。
            return CGPoint(x: cx + 200 * sin(t), y: 250)
        }
        run("eyes", caps: 60, behaviors: [], setup: { brain, activity in
            for i in 0..<60 {
                activity.debugOverride(typingRate: 0, idle: 3, pointer: orbit(i))
                brain.update(dt: dt, activity: activity, screen: screen)
            }
        }, step: { _, activity, i in
            activity.debugOverride(typingRate: 0, idle: 3, pointer: orbit(i))
        }, mark: { _, n in
            let p = orbit(n * every)
            return ["cursor": [p.x, p.y]]
        })

        // --- 打つと キーボードを踏む ---------------------------------------
        let keyboard = KeyboardBehavior()
        run("keys", caps: 60, behaviors: [keyboard], setup: { brain, activity in
            // 湯気が出るまで打ち続けたところから撮り始める
            for i in 0..<150 {
                activity.debugOverride(typingRate: 9, idle: 0, stroke: i % 3 == 0)
                brain.update(dt: dt, activity: activity, screen: screen)
                keyboard.update(dt: dt, brain: brain, activity: activity)
            }
        }, step: { _, activity, i in
            activity.debugOverride(typingRate: 9, idle: 0, stroke: i % 3 == 0)
        })

        // --- スクロールで 梅干しを転がす -------------------------------------
        // 前半は下スクロール（右へ）、後半は上スクロール（左へ）。
        // 1本で両方向を見せられるし、元の位置に戻るので繰り返しがつながる。
        // 角を曲がるところを見せたいので、右下の角のすこし手前から始める。
        // 前へ48コマ進むと角を越えて右の壁を登り、戻り48コマで元に帰る。
        let rolling = RollingBehavior()
        run("roll", caps: 48, behaviors: [rolling], startX: 313, setup: { brain, activity in
            // 梅干しが出るところまで空回しし、**位置だけ戻す**。
            // 空回しのぶん進んだままだと、行って戻ったとき元の場所に帰らず、
            // 繰り返しの継ぎ目で絵が飛ぶ。
            activity.debugOverride(typingRate: 0, idle: 3, scrolling: true, scrollDir: -1)
            for _ in 0..<10 { brain.update(dt: dt, activity: activity, screen: screen) }
            brain.setStart(CGPoint(x: 313, y: 6))
        }, step: { _, activity, i in
            activity.debugOverride(typingRate: 0, idle: 3, scrolling: true,
                                   scrollDir: i < 48 ? -1 : 1)
        }, footAt: { brain in
            // 縁を伝うので、位置も姿勢も Brain の言うとおりに置く
            CGPoint(x: brain.pos.x, y: brain.pos.y + footY - 6)
        })

        // --- ときどき 心の声がもれる ----------------------------------------
        let thought = ThoughtBehavior()
        run("think", caps: 60, behaviors: [thought], setup: { brain, _ in
            brain.think("⌘⇧4 のあと スペースで まどだけ 撮れる", seconds: 3.0, big: true)
        }, step: { _, activity, _ in
            activity.debugOverride(typingRate: 0, idle: 3)
        }, footAt: { _ in CGPoint(x: cx, y: 34) })

        // --- 画面のはしからのぞく（4か所を順に）--------------------------------
        // ここだけは絵の四角を **画面そのもの** として使う。
        // 足元をそのまま置くので、上端・左右端・左下がコマの縁に一致する。
        // 1か所につき72コマ（＝2.4秒）居させる。前は0.8秒で、読む前に次へ行っていた。
        // **カーソルも一緒に写す。** 勝手に移っているのではなく
        // 「タップするたびに移る」ことが、絵だけで伝わらないといけない。
        let peekHold = 72
        run("edgepeek", caps: 144, behaviors: [], setup: { brain, activity in
            activity.debugOverride(typingRate: 0, idle: 60)
            brain.update(dt: dt, activity: activity, screen: screen)   // 画面の大きさを覚えさせる
            brain.enterScreenPeek(.top)
        }, step: { brain, activity, i in
            activity.debugOverride(typingRate: 0, idle: 60, pointer: CGPoint(x: cx, y: 170))
            let want = Brain.ScreenPeek(rawValue: (i / peekHold) % 4) ?? .top
            if brain.screenPeek != want { brain.enterScreenPeek(want) }
        }, footAt: { brain in brain.pos }, mark: { brain, n in
            // カーソルは、いま見えている体のまんなかへ置く。
            // 足元(brain.pos)はふちの上にあるので、そこに置くと画面の外を指す。
            let h = CGFloat(SpriteBank.sprite("idle").h * scale)
            var p = brain.pos
            switch brain.screenPeek {
            case .top:    p.y -= h * 0.42
            case .bottom: p.y += h * 0.42
            case .left:   p.x += h * 0.32; p.y += h * 0.42
            case .right:  p.x -= h * 0.32; p.y += h * 0.42
            }
            // 押した合図は、次の場所へ移る **直前** の4コマだけ。
            // 移ったあとに出すと「移ったから押した」に見えて、順序が逆になる。
            let k = n % (peekHold / every)
            let last = peekHold / every - 1
            let tap = k >= last - 3 ? k - (last - 4) : 0
            return ["cursor": [p.x, p.y], "tap": tap]
        })

        // --- 放っておくと 寝る ----------------------------------------------
        let zzz = ZzzBehavior()
        run("sleep", caps: 75, behaviors: [zzz], setup: { brain, activity in
            activity.debugOverride(typingRate: 0, idle: 999)
            brain.forceSleep()
            for _ in 0..<30 {
                brain.update(dt: dt, activity: activity, screen: screen)
                zzz.update(dt: dt, brain: brain, activity: activity)
            }
        }, step: { _, activity, _ in
            activity.debugOverride(typingRate: 0, idle: 999)
        })

        // --- つまむと もちのように伸びる --------------------------------------
        // ここだけ Brain を使わず手でコマを並べる。endDrag は
        // 「放した場所に窓の縁があるか」を **本物の画面に** 問い合わせるので、
        // 絵を焼くだけのときに呼ぶと、その時たまたま開いている窓に結果が左右される。
        do {
            clearEffects()
            let seq: [(String, CGFloat)] = [
                ("idle", 0), ("idle", 0), ("idle", 0), ("idle", 0),
                ("pull1", 8), ("pull1", 12), ("pull2", 24), ("pull2", 32),
                ("pull3", 48), ("pull3", 58), ("pull4", 74), ("pull4", 84),
                ("pull4", 88), ("pull4", 90), ("pull4", 89), ("pull4", 90),
                ("pull4", 88), ("pull4", 90), ("pull4", 89), ("pull4", 90),
                ("pull3", 62), ("pull2", 34), ("pull1", 14),
                ("squash", 0), ("stretch", 14), ("idle", 6), ("squash", 0),
                ("stretch", 5), ("idle", 0),
                ("idle", 0), ("idle", 0), ("idle", 0), ("idle", 0), ("idle", 0),
            ]
            var marks: [[String: Any]] = []
            for (n, s) in seq.enumerated() {
                // いちばん伸びた姿は 67ドット＝268pt ある。ふだんの足元(56)のままだと
                // 持ち上げたぶんが画面の上をはみ出して頭が切れるので、低い所に立たせる。
                var f = PetFrame()
                f.pixelScale = scale
                f.foot = CGPoint(x: cx, y: 16 + s.1)
                f.sprite = s.0
                f.shadow = max(0.02, 0.13 - s.1 / 900)
                view.render(f)
                save("stretch", n)
                // カーソルは頭のてっぺんをつまんでいる
                let top = 16 + s.1 + CGFloat(SpriteBank.sprite(s.0).h * scale)
                marks.append(["cursor": [cx + 2, min(size.height - 8, top + 6)]])
            }
            manifest["stretch"] = ["frames": seq.count, "fps": 30 / every, "marks": marks]
            FileHandle.standardOutput.write("  stretch: \(seq.count)枚\n".data(using: .utf8)!)
        }

        // --- ウィンドウの縁に乗る ---------------------------------------------
        // ひょこっと出て、しばらく居て、またひっこむ。窓の枠は絵の合成側で描く。
        do {
            clearEffects()
            let full = 24
            var rows: [Int] = []
            for v in [0, 3, 7, 12, 17, 21, 24] { rows.append(v) }
            rows += Array(repeating: full, count: 26)
            for v in [21, 16, 10, 5, 0] { rows.append(v) }
            rows += Array(repeating: 0, count: 6)
            for (n, r) in rows.enumerated() {
                var f = PetFrame()
                f.pixelScale = scale
                f.foot = CGPoint(x: cx, y: footY)
                f.sprite = (n % 34 == 20 || n % 34 == 21) ? "blink" : "idle"
                f.peekRows = max(1, r)
                f.shadow = 0
                if r == 0 { f.alpha = 0 }
                view.render(f)
                save("edge", n)
            }
            manifest["edge"] = ["frames": rows.count, "fps": 30 / every, "marks": []]
            FileHandle.standardOutput.write("  edge: \(rows.count)枚\n".data(using: .utf8)!)
        }

        if let data = try? JSONSerialization.data(withJSONObject: manifest,
                                                  options: [.prettyPrinted, .sortedKeys]) {
            try? data.write(to: dir.appendingPathComponent("manifest.json"))
        }
        FileHandle.standardOutput.write("frames → \(dir.path)\n".data(using: .utf8)!)
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
