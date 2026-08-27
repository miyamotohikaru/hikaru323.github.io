#!/usr/bin/env python3
"""こすくまくん アプリアイコン(.icns)を公式ベクターから焼く。

入力: kosukumakun/mac/Assets/kosukuma.json の "front" ポーズ
出力: kosukumakun/mac/Assets/AppIcon.icns

方針
  - 絵を描き直さない。JSON の d をそのまま SVG / PDF に流し込んで cairo に塗らせる。
    パーツを JSON の並び順に重ねるだけで、アプリ本体(PetView)と同じ見た目になる。
  - **余白ゼロ**。Dock や Finder では余白のぶんだけ他のアプリより小さく見えるので、
    こすくまくんの外形をキャンバスの長辺いっぱいまで詰める（FILL=1.0）。
    正面ポーズは縦長(759.6 x 1000)なので、縦100% / 横76% が詰め切った状態。
  - 16px では公式の黒輪郭が 0.4px まで痩せて「ただのクリーム色の塊」になる。
    小さいサイズだけ輪郭と目を最低限の太さまで太らせて踏みとどまらせる（形は変えない）。
  - 口は無い。目と鼻しか顔のパーツが無いので、小さいサイズで目が消えると顔が消える。

ラスタライズは cairosvg があればそれ、無ければ自前で組んだ PDF を pdftocairo に渡す。
どちらも cairo なので出力はほぼ同じ。ImageMagick / Inkscape は使わない（入っていない）。

  python3 tools/make_icon.py                 … 生成して検証まで
  python3 tools/make_icon.py --work /tmp/ic  … 中間ファイル(SVG/PNG/iconset)を残す
  python3 tools/make_icon.py --renderer pdftocairo
"""
import argparse
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC = os.path.join(PROJ, "mac", "Assets", "kosukuma.json")
OUT = os.path.join(PROJ, "mac", "Assets", "AppIcon.icns")

POSE = "front"

# ── 見た目の決め事 ──────────────────────────────────────────────
# 1.0 = 外形がキャンバスの縁にちょうど接する。依頼者はアイコンを詰め切るのを好むが、
# 1.0 だと輪郭のアンチエイリアスが1〜2px はみ出して **耳と足が切れる**（実測で確認）。
# 0.97 にすると上下に1.5%ずつだけ逃げるので、詰まって見えたまま欠けない。
FILL = 0.97

# 小さいサイズでの線の下限(px)。ここを割ると輪郭も目も見えなくなる。
MIN_RIM_PX = 1.00     # 黒輪郭の太さ
MIN_EYE_PX = 1.10     # 目の直径
# 鼻はあえて太らせない。目との距離が身長比4%しかなく、太らせると顔がにじむ。

# iconutil が要求する (論理pt, 倍率)。実ピクセルは pt*倍率 → 16/32/64/128/256/512/1024
ICONSET = [(16, 1), (16, 2), (32, 1), (32, 2), (128, 1),
           (128, 2), (256, 1), (256, 2), (512, 1), (512, 2)]

PATH_TOK = re.compile(r"[MLCZ]|-?\d+(?:\.\d+)?")
ARITY = {"M": 2, "L": 2, "C": 6, "Z": 0}
PDF_OP = {"M": "m", "L": "l", "C": "c", "Z": "h"}


# ── 素材 ────────────────────────────────────────────────────────

def load_pose():
    with open(SRC, encoding="utf-8") as f:
        doc = json.load(f)
    pose = doc["poses"].get(POSE)
    if not pose:
        raise SystemExit(f"{POSE} ポーズが無い: {SRC}")
    return pose


def line_boost(pose, px):
    """小さいアイコンで線が消えないための「太らせ量」。単位は JSON 座標(身長1000)。

    輪郭はパスを縁取るので外へ w/2 だけ膨らむ → 必要な増分の2倍が線幅。
    目は塗り潰しの丸なので直径がそのまま w だけ増える。
    """
    parts = {p["id"]: p for p in pose["parts"]}
    upx = 1000.0 / px                       # 1px が何 unit か

    sil, body = parts["silhouette"], parts["body"]
    # 公式の輪郭の太さ = 黒シルエットとクリーム本体の隙間。細い側で見る。
    rim = min((sil["s"][0] - body["s"][0]) / 2,
              sil["s"][1] / 2 - abs(body["c"][1]) - body["s"][1] / 2)
    eye = parts["eye_l"]["s"][0]

    out = {}
    if MIN_RIM_PX * upx > rim:
        out["silhouette"] = 2 * (MIN_RIM_PX * upx - rim)
    if MIN_EYE_PX * upx > eye:
        w = MIN_EYE_PX * upx - eye
        out["eye_l"] = w
        out["eye_r"] = w
    return out


# いま何pxのアイコンを作っているか（= 縮小後の最終サイズ）。
# ラスタライズはスーパーサンプリングした大きいサイズで走るので、
# geometry に渡ってくる px は最終サイズではない。余白は必ず最終サイズ基準で決めないと、
# 16/32px で余白が 0.5px しか残らず、縮小時のアンチエイリアスで耳と足が縁に噛む（実測）。
_FINAL_PX = 512

# 最終サイズで最低これだけ余白を残す（片側px）
MARGIN_PX = 1.5


def geometry(pose, px, boost):
    """キャンバス px 角に収めるための 拡大率 と 中心。太らせたぶんも勘定に入れる。"""
    grow = boost.get("silhouette", 0.0)     # 外形は上下左右へ w/2 ずつ膨らむ
    fill = min(FILL, 1.0 - 2.0 * MARGIN_PX / max(_FINAL_PX, 8))
    k = px * fill / max(pose["w"] + grow, pose["h"] + grow)
    return k, px / 2.0, px / 2.0


# ── SVG（cairosvg 用）───────────────────────────────────────────

def build_svg(pose, px, boost):
    """JSON はSVG準拠のY下向きなので、d はいじらずそのまま置ける。"""
    k, cx, cy = geometry(pose, px, boost)
    body = []
    for p in pose["parts"]:
        w = boost.get(p["id"], 0.0)
        line = ""
        if w:
            line = (f' stroke="{p["fill"]}" stroke-width="{w:.3f}"'
                    f' stroke-linejoin="round" stroke-linecap="round"')
        body.append(f'<path d="{p["d"]}" fill="{p["fill"]}" fill-rule="nonzero"{line}/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{px}" height="{px}" '
            f'viewBox="0 0 {px} {px}">'
            f'<g transform="translate({cx:.4f},{cy:.4f}) scale({k:.6f})">'
            + "".join(body) + "</g></svg>")


def raster_cairosvg(pose, px, boost, work):
    import cairosvg
    svg = build_svg(pose, px, boost)
    if work:
        with open(os.path.join(work, f"icon_{px}.svg"), "w", encoding="utf-8") as f:
            f.write(svg)
    png = cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                           output_width=px, output_height=px)
    return Image.open(io.BytesIO(png)).convert("RGBA")


# ── PDF（pdftocairo 用のフォールバック）─────────────────────────
# cairosvg が入っていない Mac でも焼けるように、PDF を自前で組む。
# PDF は Y上向きなので cm 行列で反転させる。命令は M/L/C/Z だけなので変換は素直。

def pdf_path(d):
    out, buf, op = [], [], "M"
    for t in PATH_TOK.findall(d):
        if t in ARITY:
            buf.clear()
            op = t
            if op == "Z":
                out.append("h")
            continue
        buf.append(t)
        if len(buf) == ARITY[op]:
            out.append(" ".join(buf) + " " + PDF_OP[op])
            buf.clear()
            if op == "M":
                op = "L"        # M のあとに座標が続いたら L 扱い（SVGの決まり）
    return "\n".join(out)


def hex_rgb(h):
    v = h.lstrip("#")
    return tuple(int(v[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def build_pdf(pose, pt, boost):
    k, cx, cy = geometry(pose, pt, boost)
    ops = ["q", f"{k:.6f} 0 0 {-k:.6f} {cx:.4f} {cy:.4f} cm", "1 J", "1 j"]
    for p in pose["parts"]:
        r, g, b = hex_rgb(p["fill"])
        ops.append(f"{r:.4f} {g:.4f} {b:.4f} rg")
        w = boost.get(p["id"], 0.0)
        if w:
            ops.append(f"{r:.4f} {g:.4f} {b:.4f} RG")
            ops.append(f"{w:.4f} w")
        ops.append(pdf_path(p["d"]))
        ops.append("B" if w else "f")        # どちらも nonzero
    ops.append("Q")
    stream = "\n".join(ops).encode("ascii")

    objs = [b"<</Type/Catalog/Pages 2 0 R>>",
            b"<</Type/Pages/Kids[3 0 R]/Count 1>>",
            (f"<</Type/Page/Parent 2 0 R/MediaBox[0 0 {pt} {pt}]"
             f"/Contents 4 0 R/Resources<<>>>>").encode("ascii"),
            b"<</Length %d>>\nstream\n" % len(stream) + stream + b"\nendstream"]

    buf = bytearray(b"%PDF-1.4\n")
    offs = []
    for i, o in enumerate(objs, 1):
        offs.append(len(buf))
        buf += b"%d 0 obj\n" % i + o + b"\nendobj\n"
    xref = len(buf)
    buf += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    for o in offs:
        buf += b"%010d 00000 n \n" % o
    buf += (b"trailer\n<</Size %d/Root 1 0 R>>\nstartxref\n%d\n%%%%EOF\n"
            % (len(objs) + 1, xref))
    return bytes(buf)


def raster_pdftocairo(pose, px, boost, work):
    tmp = work or tempfile.mkdtemp(prefix="kosuicon")
    pdf = os.path.join(tmp, f"icon_{px}.pdf")
    with open(pdf, "wb") as f:
        f.write(build_pdf(pose, px, boost))
    base = os.path.join(tmp, f"icon_{px}")
    subprocess.run(["pdftocairo", "-png", "-transp", "-singlefile",
                    "-scale-to", str(px), pdf, base], check=True)
    img = Image.open(base + ".png").convert("RGBA")
    if not work:
        shutil.rmtree(tmp, ignore_errors=True)
    return img


def pick_renderer(name):
    if name in ("auto", "cairosvg"):
        try:
            import cairosvg  # noqa: F401
            return "cairosvg", raster_cairosvg
        except Exception as e:
            if name == "cairosvg":
                raise SystemExit(f"cairosvg が使えない: {e}")
    if shutil.which("pdftocairo") is None:
        raise SystemExit("cairosvg も pdftocairo も無いのでラスタライズできない")
    return "pdftocairo", raster_pdftocairo


# ── ラスタライズ ────────────────────────────────────────────────

def supersample(px):
    """小さいアイコンほど多めに描いてから縮める。cairo任せだと点や線が痩せる。"""
    if px <= 64:
        return 4
    if px <= 256:
        return 3
    return 2


def shrink(img, px):
    """透明部分の黒がにじみ出ないよう、乗算済みアルファにしてから縮める。"""
    if img.size == (px, px):
        return img
    a = np.asarray(img, dtype=np.float32).copy()
    a[..., :3] *= a[..., 3:4] / 255.0
    small = Image.fromarray(a.round().clip(0, 255).astype(np.uint8), "RGBA") \
                 .resize((px, px), Image.LANCZOS)
    b = np.asarray(small, dtype=np.float32).copy()
    al = b[..., 3:4] / 255.0
    b[..., :3] = np.where(al > 0, b[..., :3] / np.maximum(al, 1e-6), 0)
    return Image.fromarray(b.round().clip(0, 255).astype(np.uint8), "RGBA")


def render(pose, px, raster, work):
    global _FINAL_PX
    _FINAL_PX = px                          # 余白の判断も「最終サイズ」で行う
    boost = line_boost(pose, px)            # 太らせ量は「最終サイズ」で決める
    ss = supersample(px)
    return shrink(raster(pose, px * ss, boost, work), px), boost


# ── 検証 ────────────────────────────────────────────────────────

def occupancy(img):
    """絵が入っている範囲（アルファのbbox）がキャンバスの何割かを返す。"""
    a = np.asarray(img)[..., 3]
    ys, xs = np.nonzero(a > 8)
    if len(xs) == 0:
        return 0.0, 0.0, 255
    w = (xs.max() - xs.min() + 1) / img.width
    h = (ys.max() - ys.min() + 1) / img.height
    corners = max(int(a[0, 0]), int(a[0, -1]), int(a[-1, 0]), int(a[-1, -1]))
    return w, h, corners


def verify(icns, work):
    print("\n[検証]")
    size = os.path.getsize(icns)
    print(f"  {icns}  {size/1024:.1f} KB")

    back = os.path.join(work, "check.iconset")
    shutil.rmtree(back, ignore_errors=True)
    subprocess.run(["iconutil", "-c", "iconset", icns, "-o", back], check=True)

    names = sorted(os.listdir(back), key=lambda n: os.path.getsize(os.path.join(back, n)))
    for n in names:
        img = Image.open(os.path.join(back, n)).convert("RGBA")
        w, h, corner = occupancy(img)
        ok = "OK" if corner == 0 else f"角のalpha={corner}"
        print(f"  {n:<24} {img.width:>4}x{img.height:<4} "
              f"占有 横{w*100:.0f}% 縦{h*100:.0f}%  背景透明={ok}")
    print(f"  {len(names)} 枚入り（iconutil で .iconset に戻して確認）")


# ── 本体 ────────────────────────────────────────────────────────

def build(renderer="auto", workdir=None):
    pose = load_pose()
    name, raster = pick_renderer(renderer)
    print(f"[1/3] 下描き: {POSE} {pose['w']}x{pose['h']} / renderer={name} / 詰め{FILL*100:.0f}%")

    tmp = tempfile.mkdtemp(prefix="kosuicon")
    work = workdir or tmp
    os.makedirs(work, exist_ok=True)
    iconset = os.path.join(work, "AppIcon.iconset")
    shutil.rmtree(iconset, ignore_errors=True)
    os.makedirs(iconset)

    try:
        print("[2/3] 各サイズを描く")
        cache = {}
        for pt, scale in ICONSET:
            px = pt * scale
            if px not in cache:
                img, boost = render(pose, px, raster, workdir)
                cache[px] = img
                note = ""
                if boost:
                    note = "  ← 輪郭/目を太らせ " + " ".join(
                        f"{k}+{v:.0f}u" for k, v in boost.items())
                w, h, _ = occupancy(img)
                print(f"  {px:>4}px  x{supersample(px)}で描画  "
                      f"占有 横{w*100:.0f}% 縦{h*100:.0f}%{note}")
            suffix = "@2x" if scale == 2 else ""
            cache[px].save(os.path.join(iconset, f"icon_{pt}x{pt}{suffix}.png"),
                           "PNG", optimize=True)

        print("[3/3] iconutil でまとめる")
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        subprocess.run(["iconutil", "-c", "icns", iconset, "-o", OUT], check=True)
        verify(OUT, work)
        if workdir:
            print(f"\n  中間ファイル: {work}")
        print(f"\n→ {OUT}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="こすくまくんの .icns を焼く")
    ap.add_argument("--renderer", default="auto",
                    choices=["auto", "cairosvg", "pdftocairo"])
    ap.add_argument("--work", default=None, help="中間ファイルを残す場所")
    a = ap.parse_args()
    build(a.renderer, a.work)
