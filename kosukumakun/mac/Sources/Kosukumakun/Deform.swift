import CoreGraphics
import Foundation

/// こすくまくんの体の変形。
///
/// こすくまくんは関節のあるキャラではなく「もちもちの塊」なので、
/// 歩かせるのではなく **潰す・伸ばす・たわませる** で動きを作る。
/// 変形は身長1000・原点中心・Y上向きのローカル座標に対してかける。
struct Deform {
    var sx: CGFloat = 1          // 横の伸縮
    var sy: CGFloat = 1          // 縦の伸縮
    var lean: CGFloat = 0        // 上へ行くほど横にずれる（前傾/後傾）身長比
    var bend: CGFloat = 0        // 弓なり（真ん中がふくらむ）身長比
    var jelly: CGFloat = 0       // ぷるぷるの振幅 身長比
    var phase: CGFloat = 0       // ぷるぷるの位相
    var turn: CGFloat = 0        // -1(左向き) .. 0(正面) .. 1(右向き)
    var squish: CGFloat = 0      // なでられた時の上からの潰れ 0..1

    /// 面積をだいたい保ったまま縦に伸縮させる（アニメの基本、squash & stretch）
    static func stretch(_ amount: CGFloat) -> (CGFloat, CGFloat) {
        let sy = 1 + amount
        let sx = pow(max(sy, 0.05), -0.72)
        return (sx, sy)
    }

    func apply(_ p: CGPoint, unit: CGFloat = Asset.unit) -> CGPoint {
        let t = min(max((p.y + unit / 2) / unit, 0), 1)     // 0=足元 1=頭のてっぺん
        var x = p.x * sx * (1 - 0.42 * abs(turn))
        var y = p.y * sy

        // 上ほど効く前傾と、真ん中がふくらむたわみ
        x += lean * t * unit
        x += bend * sin(t * .pi) * unit

        // ぷるぷる（縦に波が走る）
        if jelly != 0 {
            let w = t * t                     // 足元は動かさない
            x += jelly * sin(t * 5.5 + phase) * w * unit
            y += jelly * 0.30 * cos(t * 4.2 + phase) * w * unit
        }

        // 上から押さえられた潰れ（頭ほど下がり、腹まわりが横に逃げる）
        if squish != 0 {
            y -= squish * t * t * unit * 0.14
            x += x * squish * 0.18 * sin(t * .pi)
        }
        return CGPoint(x: x, y: y)
    }
}

// MARK: - 補間まわり

@inline(__always) func lerp(_ a: CGFloat, _ b: CGFloat, _ t: CGFloat) -> CGFloat {
    a + (b - a) * min(max(t, 0), 1)
}

/// 指数で近づける（フレームレートに依らない追従）
@inline(__always) func approach(_ cur: CGFloat, _ target: CGFloat, rate: CGFloat, dt: CGFloat) -> CGFloat {
    cur + (target - cur) * (1 - exp(-rate * dt))
}

@inline(__always) func approach(_ cur: CGPoint, _ target: CGPoint, rate: CGFloat, dt: CGFloat) -> CGPoint {
    CGPoint(x: approach(cur.x, target.x, rate: rate, dt: dt),
            y: approach(cur.y, target.y, rate: rate, dt: dt))
}

/// 行き過ぎて戻る（着地のバウンド等）
@inline(__always) func easeOutBack(_ t: CGFloat, _ overshoot: CGFloat = 1.7) -> CGFloat {
    let c = overshoot + 1
    let u = t - 1
    return 1 + c * u * u * u + overshoot * u * u
}

@inline(__always) func easeOutCubic(_ t: CGFloat) -> CGFloat {
    let u = 1 - min(max(t, 0), 1)
    return 1 - u * u * u
}

@inline(__always) func easeInOutSine(_ t: CGFloat) -> CGFloat {
    -(cos(.pi * min(max(t, 0), 1)) - 1) / 2
}

/// 減衰する振動（ぷるぷるの余韻）
@inline(__always) func springDecay(_ t: CGFloat, freq: CGFloat = 7, decay: CGFloat = 5) -> CGFloat {
    exp(-decay * t) * sin(freq * .pi * t)
}
