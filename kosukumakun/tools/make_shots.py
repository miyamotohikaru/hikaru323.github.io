#!/usr/bin/env python3
"""説明サイトに載せる「実際の動き」の絵を作る。

サイトの図はイラストではなく **アプリ自身が描いた絵** を使う。
このターミナルには画面収録の許可が無いのでデスクトップのスクショは撮れないが、
アプリには CALayer をそのまま焼く隠しオプションがあるので、そこから取る:

    こすくまくん --snapshot     <dir>   … 立ち姿・寝そべり・縁のぞきなど
    こすくまくん --snapshot-fx  <dir>   … 湯気・伸び・金平糖・吹き出しなど
    こすくまくん --frames       <dir>   … 動いているところをコマ送りで（GIF用）

そのうえで、画面の中にいる感じを出すために、絵に無いものだけを足す:
  - カーソルの矢印（tools/shot_cursor.png。macOS の矢印を1度だけ写し取ったもの）
  - ウィンドウの枠（縁に乗っているのを見せるため）
  - Z の字（寝息。アプリの Zzz.swift と同じドット並び）

**貼り付けは必ず等倍。** 0.9倍などで縮めると、ドット絵の1ドットが割れて
輪郭がガタつく（前の版がそうなっていた）。大きさは元の絵のまま置く。

出力:
  public/shots/*.gif   … 「できること」に出す動く絵
  public/shots/*.png   … GIFが動かない環境むけの1枚目／豆知識の絵
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
APP = os.path.join(PROJ, "mac", "build", "こすくまくん.app", "Contents", "MacOS", "Kosukumakun")
OUT = os.path.join(PROJ, "public", "shots")
CURSOR = os.path.join(HERE, "shot_cursor.png")

BG = (250, 248, 234)          # サイトの紙の色（globals.css の --paper）
INK = (20, 18, 15)            # サイトの文字の色
W = 760                       # カードの表示幅は約364pt。Retina で 728px なので等倍で足りる
H = 460

# 金平糖の色（Rolling.swift と同じ3色）。アプリは転がすたびに選び直すので、
# 焼くたびに絵の色が変わってしまう。**ここで塗り直して固定する。**
KON = {"桃": (0xF7, 0xC3, 0xCE), "だいだい": (0xF7, 0xD2, 0x92), "みずいろ": (0xBF, 0xDC, 0xE8)}


def card(h=H):
    return Image.new("RGBA", (W, h), BG + (255,))


def cursor():
    return Image.open(CURSOR).convert("RGBA")


def recolor_kon(im, to):
    """金平糖の面を to の色に塗り直す。3色のどれで焼かれても同じ絵になる。"""
    px = im.load()
    known = set(KON.values())
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 0 and (r, g, b) in known:
                px[x, y] = to + (a,)
    return im


def display(dst, box=(144, 34, 616, 426)):
    """画面そのものの見立て。はしからのぞいているのを見せるための外枠。

    のぞきの絵は **コマの四角がそのまま画面** なので、
    枠は絵の外側にぴったり回す（内側に描くと、はしに立っているのがずれて見える）。
    """
    ImageDraw.Draw(dst).rounded_rectangle(box, radius=10, outline=INK, width=3)


def window(dst, box=(90, 245, 671, 431)):
    """ふつうのウィンドウの見立て。縁に乗っているのを見せるためだけの枠。"""
    d = ImageDraw.Draw(dst)
    d.rounded_rectangle(box, radius=14, fill=(255, 255, 255, 255), outline=INK, width=3)
    d.line([box[0] + 2, 296, box[2] - 2, 296], fill=INK, width=3)
    for i in range(3):
        x = box[0] + 23 + i * 28
        d.ellipse([x, 266, x + 14, 280], outline=INK, width=2)


def build_tips(fx):
    """豆知識の絵。ここだけは3種を読ませたいので、動かさず1枚に並べる。"""
    def img(n):
        return Image.open(os.path.join(fx, n + ".png")).convert("RGBA")

    os.makedirs(OUT, exist_ok=True)
    # 金平糖は3色ずつ塗り分ける。アプリが色を選び直すのが、絵からも読める。
    tips = [recolor_kon(img("fx3_tip%d" % i), c3)
            for i, c3 in zip((1, 2, 3), (KON["だいだい"], KON["桃"], KON["みずいろ"]))]
    boxes = [t.getbbox() for t in tips]
    th = max(b[3] - b[1] for b in boxes)
    gap, pad = 26, 30
    c = card(pad * 2 + th * 3 + gap * 2)
    # 3枚とも同じ位置で描かれているので、切り出しは同じ横幅にして並びを揃える
    x0 = min(b[0] for b in boxes)
    x1 = max(b[2] for b in boxes)
    for i, t in enumerate(tips):
        crop = t.crop((x0, boxes[i][1], x1, boxes[i][3]))
        c.alpha_composite(crop, ((W - crop.width) // 2, pad + i * (th + gap)))
    p = os.path.join(OUT, "tips.png")
    c.convert("RGB").save(p, optimize=True)
    print("  %-8s %dx%d  %.1f KB" % ("tips", c.width, c.height, os.path.getsize(p) / 1024))


# --------------------------------------------------------------------------
# 動く絵（GIF）
# --------------------------------------------------------------------------

FRAME_W, FRAME_H = 460, 380     # --frames が出すコマの大きさ
KON_SCENES = {"roll", "think", "stretch"}


def gif_scene(mo, name, marks):
    """1つの場面のコマを、カードの紙の上に並べて返す。

    切り出す位置は **全コマ共通** にする。コマごとに中身で切ると、
    動いているものが真ん中に固定されて、まったく動かない絵になる。
    """
    d = os.path.join(mo, name)
    files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    raw = [Image.open(os.path.join(d, f)).convert("RGBA") for f in files]
    if name in KON_SCENES:
        raw = [recolor_kon(im, KON["だいだい"]) for im in raw]

    over = [Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0)) for _ in raw]
    if marks and marks[0].get("cursor"):
        cur = cursor()
        for i, m in enumerate(marks[:len(raw)]):
            x, y = m["cursor"]
            # アプリの座標は下が原点。絵は上が原点なので裏返す
            over[i].alpha_composite(cur, (int(x) - 6, FRAME_H - int(y) - 4))

    # 縁のぞきだけは窓の枠が主役なので、置き場所を決め打ちする。
    # 足元の線（コマの下から56px）が窓の上端に重なると「縁に立っている」に見える。
    if name == "edge":
        off = (150, 245 - (FRAME_H - 56))
    elif name == "edgepeek":
        # コマの四角がそのまま画面。紙の真ん中に置いて、その外に画面の枠を回す。
        off = ((W - FRAME_W) // 2, (H - FRAME_H) // 2)
    else:
        box = None
        for a, b in zip(raw, over):
            m = Image.alpha_composite(a, b).getbbox()
            if m is None:
                continue
            box = m if box is None else (min(box[0], m[0]), min(box[1], m[1]),
                                         max(box[2], m[2]), max(box[3], m[3]))
        bw, bh = box[2] - box[0], box[3] - box[1]
        off = ((W - bw) // 2 - box[0], (H - bh) // 2 - box[1])

    out = []
    for a, b in zip(raw, over):
        c = card()
        c.alpha_composite(a, off)
        c.alpha_composite(b, off)
        if name == "edge":
            window(c)           # 枠は **こすくまくんより手前**。縁から出てくるように見える
        if name == "edgepeek":
            display(c)
        out.append(c.convert("RGB"))
    return out


def save_gif(path, frames, fps):
    """1枚目で作った色表を全コマで使い回して、差分だけのGIFにする。

    コマごとに色を選ばせると、コマ間で色が1つずつずれて、
    全コマがまるごと保存されてしまう（＝10倍近く重くなる）。
    """
    master = frames[0].quantize(colors=64, method=Image.MEDIANCUT)
    seq = [f.quantize(palette=master, dither=Image.NONE) for f in frames]
    seq[0].save(path, save_all=True, append_images=seq[1:], loop=0,
                duration=int(round(1000 / fps)), optimize=True, disposal=1)


def build_gifs(mo):
    manifest = json.load(open(os.path.join(mo, "manifest.json"), encoding="utf-8"))
    for name in sorted(manifest):
        info = manifest[name]
        frames = gif_scene(mo, name, info.get("marks") or [])
        p = os.path.join(OUT, name + ".gif")
        save_gif(p, frames, info.get("fps", 15))
        print("  %-8s %d枚 %dfps  %.0f KB" % (name, len(frames), info.get("fps", 15),
                                              os.path.getsize(p) / 1024))


def main():
    if not os.path.exists(APP):
        sys.exit("先に mac/build.sh を走らせてください: %s が無い" % APP)
    if not os.path.exists(CURSOR):
        sys.exit("カーソルの絵がありません: %s" % CURSOR)
    fx = tempfile.mkdtemp(prefix="kosukuma-shots-")
    try:
        subprocess.run([APP, "--snapshot", fx], check=True, capture_output=True)
        subprocess.run([APP, "--snapshot-fx", fx], check=True, capture_output=True)
        subprocess.run([APP, "--frames", fx], check=True, capture_output=True)
        build_tips(fx)
        build_gifs(fx)
    finally:
        shutil.rmtree(fx, ignore_errors=True)
    print("\n→ %s" % OUT)


if __name__ == "__main__":
    main()
