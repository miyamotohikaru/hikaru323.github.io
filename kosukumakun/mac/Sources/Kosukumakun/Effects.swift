import AppKit

/// 演出（金平糖・湯気・吹き出しなど）を載せる先。PetView が実装する。
///
/// 座標は **ステージ座標**（PetWindow の contentView 内、Y上向き、左下原点）で扱う。
/// こすくまくんの足元は `footInStage`、身長は `petHeight` で取れるので、
/// 演出はそれを基準に置けば表示サイズが変わってもズレない。
protocol EffectHost: AnyObject {
    var effectLayer: CALayer { get }
    var footInStage: CGPoint { get }
    var petHeight: CGFloat { get }
    var stageSize: CGSize { get }
    /// 現在の見た目（向き・ポーズなど演出の左右合わせに使う）
    var currentFrame: PetFrame { get }
    /// 本体スプライトの拡大率。演出もこの粒に合わせないと、本体だけドット絵で浮く。
    var pixelScale: Int { get }
}

extension EffectHost {
    /// 頭のてっぺん（吹き出しの足の位置に使う）
    var headTop: CGPoint {
        CGPoint(x: footInStage.x, y: footInStage.y + petHeight)
    }
    /// 顔の高さ（金平糖を持っていく先）
    var facePoint: CGPoint {
        CGPoint(x: footInStage.x, y: footInStage.y + petHeight * 0.62)
    }
}

/// 演出レイヤを作るときの共通設定（Retina対応とアニメーション無効化）
enum FX {
    /// キーボードのキーの高さ（ドット）。こすくまくんを持ち上げる量と、
    /// キーを描く高さが食い違うと足が浮くので、両方ここを見る。
    static let keyDots = 11

    static func shape(_ host: EffectHost) -> CAShapeLayer {
        let l = CAShapeLayer()
        l.frame = CGRect(origin: .zero, size: host.stageSize)
        l.contentsScale = host.effectLayer.contentsScale
        l.actions = ["path": NSNull(), "opacity": NSNull(), "hidden": NSNull(),
                     "transform": NSNull(), "position": NSNull(), "bounds": NSNull()]
        return l
    }

    static func text(_ host: EffectHost) -> CATextLayer {
        let l = CATextLayer()
        l.contentsScale = host.effectLayer.contentsScale
        l.actions = ["contents": NSNull(), "opacity": NSNull(), "hidden": NSNull(),
                     "position": NSNull(), "bounds": NSNull(), "string": NSNull()]
        l.alignmentMode = .center
        l.truncationMode = .none
        l.isWrapped = true
        return l
    }

    /// 星（金平糖のきらきら等）
    static func star(center c: CGPoint, radius r: CGFloat, points n: Int = 4,
                     inner: CGFloat = 0.34, rotation: CGFloat = 0) -> CGPath {
        let p = CGMutablePath()
        for i in 0..<(n * 2) {
            let a = rotation + CGFloat(i) * .pi / CGFloat(n)
            let rr = i % 2 == 0 ? r : r * inner
            let pt = CGPoint(x: c.x + cos(a) * rr, y: c.y + sin(a) * rr)
            i == 0 ? p.move(to: pt) : p.addLine(to: pt)
        }
        p.closeSubpath()
        return p
    }
}
