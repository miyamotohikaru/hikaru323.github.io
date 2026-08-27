#!/usr/bin/env python3
"""こすくまくん 公式Illustratorデータ → アプリ用ベクターアセット(JSON)。

入力: デザインフォルダの .ai（PDF互換）を pdftocairo で SVG 化したもの
出力: kosukumakun/mac/Assets/kosukuma.json

方針
  - 公式の線を1ミリも描き直さない。pdftocairo が出したベジエをそのまま使う。
  - 黒の複合パスを「外形シルエット + 内側の穴」に分解し、穴は捨てて
    クリーム塗りを上に重ねる（= 元と同じ見た目で、部位が独立して動かせる）。
  - 正面ポーズだけは目・鼻を独立パーツとして切り出す（表情の心臓部）。
    こすくまくんに口はないので、感情は目と体の変形が全部背負う。
  - 座標は「身長1000・原点=バウンディングボックス中心・Y下向き(SVG準拠)」に正規化。
"""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgparts import load  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
DESIGN = os.path.expanduser("~/Desktop/こすくま/デザイン/ロゴ")
WORK = os.path.join(HERE, ".work")
OUT = os.path.join(PROJ, "mac", "Assets", "kosukuma.json")

# .ai(PDF互換) → SVG に変換するソース
SOURCES = {
    "pose04": "こすくま_ポーズ04.ai",     # 正面 / 斜め後ろ / 真後ろ
    "back":   "こすくま_後ろ姿.ai",       # 寝そべり(横向き)
    "pose3":  "こすくま_ポーズ_3パターン.ai",  # 丸まって寝る
}

# ── パーツ定義 ────────────────────────────────────────────────
# (pose名, ソース, クラスタのx範囲, [(パーツid, [サブパスidx...]), ...])
# サブパスidx は survey.py で目視同定した値。穴（負の面積）は列挙しない＝捨てる。
POSES = {
    "front": dict(src="pose04", xrange=(400, 1050), parts=[
        ("silhouette", [5]),
        ("body",       [9]),
        ("ear_l",      [10]),
        ("ear_r",      [11]),
        ("foot_r",     [12]),
        ("foot_l",     [13]),
        ("mole",       [25]),
        ("eye_l",      [15]),
        ("eye_r",      [14]),
        ("nose",       [16]),
    ]),
    "side": dict(src="pose04", xrange=(1050, 1600), parts=[
        ("silhouette", [20]),
        ("body",       [21]),
        ("ear",        [22]),
        ("foot",       [23]),
        ("mole",       [24]),
    ]),
    "back": dict(src="pose04", xrange=(1600, 2200), parts=[
        ("silhouette", [31]),
        ("body",       [33]),
        ("ear_l",      [35]),
        ("ear_r",      [34]),
        ("foot_l",     [36]),
        ("foot_r",     [37]),
        ("mole",       [38]),
    ]),
    # 寝そべり・丸まりは重なりで出来ているので、ファイル順そのまま全部使う
    "lying":  dict(src="back",  xrange=None, parts="ALL"),
    "curled": dict(src="pose3", xrange=None, parts="ALL"),
}

CREAM = "#fafad3"   # 公式のクリーム色
INK = "#000000"     # 公式の黒
MOLE = "#1a251f"    # おしりのほくろ（黒ではなく深い緑。書き出しPNGから実測）

# ── パーツの微調整 ───────────────────────────────────────────
# {ポーズ: {パーツid: (dx, dy)}}  身長1000基準の平行移動。
#
# front/mole:
#   ポーズ04.ai ではほくろが黒い輪郭に食い込んでいて、腕の線と重なって見える。
#   同じ公式の こすくま_ポーズ02.png では、ほくろはお腹の内側（横75.3% / 縦82.2%）に
#   きれいに収まっている。依頼者が「こすくまくんはこちら」として提示したのも02の方なので、
#   ほくろだけ02の位置に合わせる。動かしているのはこの点1つだけで、形は一切変えていない。
ADJUST = {
    "front": {"mole": (-90.1, 9.0)},
}


def ensure_svgs():
    os.makedirs(WORK, exist_ok=True)
    for key, ai in SOURCES.items():
        dst = os.path.join(WORK, key + ".svg")
        if os.path.exists(dst):
            continue
        src = os.path.join(DESIGN, ai)
        if not os.path.exists(src):
            raise SystemExit(f"公式データが見つかりません: {src}")
        subprocess.run(["pdftocairo", "-svg", src, dst], check=True)
        print("  converted", ai)


def norm_color(c):
    """わずかな色ゆれ（#000304 等）を公式2色に丸める。"""
    r = int(c[1:3], 16); g = int(c[3:5], 16); b = int(c[5:7], 16)
    if r > 200 and g > 200 and b > 150:
        return CREAM
    if r < 40 and g < 40 and b < 40:
        return INK
    return c


def xform_d(d, sx, sy, tx, ty, nd=2):
    """d 文字列の全座標を scale+translate。x' = x*sx + tx"""
    toks = re.findall(r"[MLCZ]|-?\d+(?:\.\d+)?", d)
    out = []
    i = 0
    while i < len(toks):
        t = toks[i]
        if t in "MLCZ":
            out.append(t)
            i += 1
            continue
        x = float(toks[i]) * sx + tx
        y = float(toks[i + 1]) * sy + ty
        out.append(f"{round(x, nd):g}")
        out.append(f"{round(y, nd):g}")
        i += 2
    return " ".join(out)


def build():
    print("[1/3] .ai → SVG")
    ensure_svgs()

    print("[2/3] サブパス抽出")
    cache = {}
    for key in SOURCES:
        _, subs = load(os.path.join(WORK, key + ".svg"))
        cache[key] = subs
        print(f"  {key}: {len(subs)} subpaths")

    print("[3/3] パーツ組み立て")
    doc = {"unit": 1000, "cream": CREAM, "ink": INK, "poses": {}}
    for pose, spec in POSES.items():
        subs = cache[spec["src"]]
        if spec["parts"] == "ALL":
            # 重なりで出来ているポーズは「元の複合パス単位」でまとめる。
            # サブパスをバラすと穴（＝横顔の目など）が潰れるため。
            xr = spec["xrange"]
            chosen = [s for s in subs if xr is None or xr[0] <= s.centroid[0] < xr[1]]
            order, byparent = [], {}
            for s in chosen:
                if s.parent not in byparent:
                    byparent[s.parent] = []
                    order.append(s.parent)
                byparent[s.parent].append(s)
            groups = [(f"p{i}", byparent[p]) for i, p in enumerate(order)]
        else:
            by_idx = {s.idx: s for s in subs}
            groups = []
            for pid, idxs in spec["parts"]:
                missing = [i for i in idxs if i not in by_idx]
                if missing:
                    raise SystemExit(f"{pose}: サブパス {missing} が無い（ソース変更？）")
                groups.append((pid, [by_idx[i] for i in idxs]))

        allsubs = [s for _, ss in groups for s in ss]
        x0 = min(s.bbox[0] for s in allsubs)
        y0 = min(s.bbox[1] for s in allsubs)
        x1 = max(s.bbox[2] for s in allsubs)
        y1 = max(s.bbox[3] for s in allsubs)
        w, h = x1 - x0, y1 - y0
        k = 1000.0 / h                       # 身長1000に正規化
        tx = -(x0 + x1) / 2 * k              # 原点 = bbox中心
        ty = -(y0 + y1) / 2 * k

        parts = []
        adjust = ADJUST.get(pose, {})
        for pid, ss in groups:
            adx, ady = adjust.get(pid, (0.0, 0.0))
            d = " ".join(xform_d(s.d, k, k, tx + adx, ty + ady) for s in ss)
            col = MOLE if pid == "mole" else norm_color(ss[0].color)
            cx = (min(s.bbox[0] for s in ss) + max(s.bbox[2] for s in ss)) / 2 * k + tx + adx
            cy = (min(s.bbox[1] for s in ss) + max(s.bbox[3] for s in ss)) / 2 * k + ty + ady
            pw = (max(s.bbox[2] for s in ss) - min(s.bbox[0] for s in ss)) * k
            ph = (max(s.bbox[3] for s in ss) - min(s.bbox[1] for s in ss)) * k
            parts.append({"id": pid, "fill": col, "d": d,
                          "c": [round(cx, 1), round(cy, 1)],
                          "s": [round(pw, 1), round(ph, 1)]})
        doc["poses"][pose] = {
            "w": round(w * k, 1), "h": 1000.0,
            "parts": parts,
        }
        print(f"  {pose}: {len(parts)} parts, {round(w*k)}x1000, "
              f"{sum(len(p['d']) for p in parts)//1024}KB")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, separators=(",", ":"), ensure_ascii=False)
    print(f"\n→ {OUT}  ({os.path.getsize(OUT)/1024:.1f} KB)")


if __name__ == "__main__":
    build()
