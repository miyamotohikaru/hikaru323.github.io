# 壁紙の別シリーズ（ミント／ふじ色／もも色）を、会社HPの bg.gif から起こす。
#
#   python3 tools/make-bg.py [色みの強さ]     既定 0.5（クリームの半分）
#   python3 tools/make-bg.py 0.5 --試し       public/hp は触らず shots/ に見本だけ出す
#
# bg.gif は16色のGIFで、150pxのタイルにこすくまが薄く入っている。
# 画素の番号（どの色を使うか）はいっさい触らず、**パレットの16色だけ**を作り替える。
# 絵柄が1pxもずれず、16色のGIFのまま残る。
#
# ── なぜ HSV をやめて Lab で作るのか
# はじめは HSV で色相を回して作っていた。それだと「ふじ色」がクリームより
# 明るさ L* で11.2も暗くなり（84.7 対 95.9）、壁紙だけが濃く沈んで目立った。
# HSV の V は「青は同じVでも黄より暗く見える」ことを知らないため。
# CIE Lab なら明るさと色みを別々に扱えるので、
#   ・16色それぞれの L* の差（＝こすくまの模様の見えやすさ）をそのまま残す
#   ・色みの強さ（a*b*の長さ）だけを狙った値に落とす
# ができる。
#
# ── なぜ3色で明るさが同じにならないのか
# sRGB で出せる色みの強さは、明るさと色相で上限が決まっている。
# クリームと同じ明るさ95.9では、青紫は6.5、赤橙は5.5しか乗らない
# （青みの緑は20.7まで乗る）。そこまで薄いと「ふじ色」「もも色」と呼べなくなる。
# なので3色は**色みの強さでそろえ**、明るさは入るところまでしか下げない。
# 結果、クリームとの明るさの差は 0.1 / 2.6 / 3.4 になる（もとは 0.5 / 11.2 / 6.2）。
import math
import sys

from PIL import Image

SRC = "public/hp/bg.gif"

# Lab の色相角（度）。もとのミント／ふじ色／もも色から測った向き。色そのものは変えない。
# クリームの地色 #fff3cb は 96.0 度（黄）。
HUE = {
    "mint": 191.6,  # 青みの緑
    "sky": 288.6,  # ふじ色（青紫）
    "peach": 32.4,  # もも色（赤橙）
}

WHITE = (0.95047, 1.0, 1.08883)
M_TO_LIN = ((3.2406, -1.5372, -0.4986), (-0.9689, 1.8758, 0.0415), (0.0557, -0.2040, 1.0570))


def _to_lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _to_srgb(c: float) -> int:
    c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return min(255, max(0, round(c * 255)))


def to_lab(rgb) -> tuple[float, float, float]:
    r, g, b = (_to_lin(v) for v in rgb)
    xyz = (
        (r * 0.4124 + g * 0.3576 + b * 0.1805) / WHITE[0],
        (r * 0.2126 + g * 0.7152 + b * 0.0722) / WHITE[1],
        (r * 0.0193 + g * 0.1192 + b * 0.9505) / WHITE[2],
    )
    fx, fy, fz = (t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116 for t in xyz)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lab_to_linear(L: float, a: float, b: float) -> tuple[float, float, float]:
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200

    def inv(t: float) -> float:
        return t**3 if t**3 > 0.008856 else (t - 16 / 116) / 7.787

    xyz = (inv(fx) * WHITE[0], inv(fy) * WHITE[1], inv(fz) * WHITE[2])
    return tuple(sum(m * v for m, v in zip(row, xyz)) for row in M_TO_LIN)


def to_rgb(lab) -> tuple[int, int, int]:
    return tuple(_to_srgb(v) for v in lab_to_linear(*lab))


def in_gamut(L: float, c: float, hue_deg: float) -> bool:
    h = math.radians(hue_deg)
    return all(-0.0005 <= v <= 1.0005 for v in lab_to_linear(L, math.cos(h) * c, math.sin(h) * c))


def highest_L(target_c: float, hue_deg: float, top: float) -> float:
    """狙った色みの強さが sRGB に入る、いちばん明るい L*。top より上げはしない。"""
    if in_gamut(top, target_c, hue_deg):
        return top
    lo, hi = 0.0, top
    for _ in range(40):
        mid = (lo + hi) / 2
        if in_gamut(mid, target_c, hue_deg):
            lo = mid
        else:
            hi = mid
    return lo


def repalette(src: Image.Image, hue_deg: float, k: float) -> tuple[Image.Image, dict]:
    pal = src.getpalette()
    base = to_lab(pal[45:48])  # 15番＝地色。いちばん面積が大きい
    base_c = math.hypot(base[1], base[2])
    base_h = math.degrees(math.atan2(base[2], base[1]))

    target_c = base_c * k
    L_new = highest_L(target_c, hue_deg, base[0])
    dL = L_new - base[0]  # 全16色を同じだけ動かす。差は変えないので模様の濃さは残る

    out: list[int] = []
    for i in range(0, len(pal), 3):
        L, a, b = to_lab(pal[i : i + 3])
        c = math.hypot(a, b) * k
        h = math.radians(hue_deg + (math.degrees(math.atan2(b, a)) - base_h))
        out += list(to_rgb((L + dL, math.cos(h) * c, math.sin(h) * c)))
    im = src.copy()
    im.putpalette(out)
    return im, {"L": L_new, "dL": dL, "C": target_c}


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    k = float(args[0]) if args else 0.5
    dry = "--試し" in sys.argv or "--dry" in sys.argv
    src = Image.open(SRC)
    cl, ca, cb = to_lab(src.getpalette()[45:48])
    cc = math.hypot(ca, cb)
    print(f"クリーム  地色 明るさ{cl:.1f}  色みの強さ{cc:.1f}  色相{math.degrees(math.atan2(cb, ca)):.1f}度")
    for name, hue in HUE.items():
        im, info = repalette(src, hue, k)
        path = f"shots/bg_{name}.gif" if dry else f"public/hp/bg_{name}.gif"
        im.save(path)
        p = im.getpalette()[45:48]
        L, a, b = to_lab(p)
        c = math.hypot(a, b)
        print(
            f"{name:6}  地色 #{p[0]:02x}{p[1]:02x}{p[2]:02x}"
            f"  明るさ{L:.1f}（クリーム比{L - cl:+.1f}）"
            f"  色みの強さ{c:.1f}（クリームの{c / cc:.2f}倍）  → {path}"
        )


if __name__ == "__main__":
    main()
