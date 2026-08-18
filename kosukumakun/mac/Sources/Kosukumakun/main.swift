import AppKit

let app = NSApplication.shared

// 見た目の検証用モード（画面に出さずPNGを書き出して終了）
if Snapshot.handle(CommandLine.arguments) {
    exit(0)
}

// 通常起動: メニューバー常駐（Dockには出さない）
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
