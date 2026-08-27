#!/usr/bin/env python3
"""抽出アセットと公式データの一致を目視＋差分ブレンドで検証するHTMLを吐く。

左=公式そのまま / 中=抽出アセット / 右=difference合成（真っ黒なら完全一致）
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgparts import load  # noqa: E402
from extract_kosukuma import POSES, SOURCES, WORK, OUT  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DST = os.path.join(HERE, ".work", "verify.html")

doc = json.load(open(OUT, encoding="utf-8"))

# 公式そのまま（全サブパスをファイル順に描く＝元の見た目）
orig_svg = {}
for pose, spec in POSES.items():
    subs = load(os.path.join(WORK, spec["src"] + ".svg"))[1]
    if spec["parts"] == "ALL":
        g = subs
    else:
        want = {i for _, idxs in spec["parts"] for i in idxs}
        # 元の見た目には穴も要る → クラスタ全部を使う
        xr = spec["xrange"]
        anchor = [s for s in subs if s.idx in want]
        x0 = min(s.bbox[0] for s in anchor) - 30
        x1 = max(s.bbox[2] for s in anchor) + 30
        g = [s for s in subs if x0 <= s.centroid[0] <= x1]
    x0 = min(s.bbox[0] for s in g); y0 = min(s.bbox[1] for s in g)
    x1 = max(s.bbox[2] for s in g); y1 = max(s.bbox[3] for s in g)
    body = "".join(f"<path d='{s.d}' fill='{s.color}'/>" for s in g)
    orig_svg[pose] = (f"<svg viewBox='{x0} {y0} {x1-x0} {y1-y0}' width='300' "
                      f"height='{300*(y1-y0)/(x1-x0):.0f}'>{body}</svg>")

rows = []
for pose, pd in doc["poses"].items():
    w, h = pd["w"], pd["h"]
    vb = f"{-w/2} {-h/2} {w} {h}"
    mine = (f"<svg viewBox='{vb}' width='300' height='{300*h/w:.0f}'>"
            + "".join(f"<path d='{p['d']}' fill='{p['fill']}'/>" for p in pd["parts"])
            + "</svg>")
    rows.append(f"""
<section>
  <h2>{pose} — {len(pd['parts'])} parts</h2>
  <div class=grid>
    <figure><figcaption>公式（元データ）</figcaption><div class=box>{orig_svg[pose]}</div></figure>
    <figure><figcaption>抽出アセット</figcaption><div class=box>{mine}</div></figure>
    <figure><figcaption>difference（黒=一致）</figcaption>
      <div class="box diff">{orig_svg[pose]}<div class=ov>{mine}</div></div></figure>
  </div>
</section>""")

html = f"""<!doctype html><meta charset=utf-8><title>asset verify</title>
<style>
 body{{background:#fff;font:12px ui-monospace,monospace;margin:0;padding:12px;color:#111}}
 h2{{font-size:13px;background:#111;color:#fff;padding:3px 8px;margin:14px 0 6px}}
 .grid{{display:flex;gap:14px;flex-wrap:wrap}}
 figcaption{{margin-bottom:4px;color:#555}}
 .box{{position:relative;background:#fff;border:1px solid #ddd;display:inline-block;line-height:0}}
 .diff{{background:#000}}
 .diff .ov{{position:absolute;inset:0;mix-blend-mode:difference}}
 figure{{margin:0}}
</style>
{"".join(rows)}
"""
os.makedirs(os.path.dirname(DST), exist_ok=True)
open(DST, "w", encoding="utf-8").write(html)
print("wrote", DST)
