#!/usr/bin/env python3
"""説明サイトに載せる「実際の動き」の絵を作る。

サイトの図はイラストではなく **アプリ自身が描いた絵** を使う。
このターミナルには画面収録の許可が無いのでデスクトップのスクショは撮れないが、
アプリには CALayer をそのまま焼く隠しオプションがあるので、そこから取る:

    こすくまくん --snapshot     <dir>   … 立ち姿・寝そべり・縁のぞきなど
    こすくまくん --snapshot-fx  <dir>   … 湯気・伸び・梅干し・吹き出しなど
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



def card(h=H):
    return Image.new("RGBA", (W, h), BG + (255,))


def cursor():
    return Image.open(CURSOR).convert("RGBA")


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
    # 転がすものは梅干し1色になったので、ここで塗り直す必要はもう無い。
    tips = [img("fx3_tip%d" % i) for i in (1, 2, 3)]
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
# 「こんなときは」の3枚
# --------------------------------------------------------------------------

SCREEN = (144, 34, 616, 426)      # 画面の見立て。display() と同じ枠


def _bear(mo, scene, n):
    """場面のコマから、こすくまくんだけを切り出す。

    **新しく描き起こさない。** ここもアプリ自身が描いた絵から借りる。
    そうしないと、サイトの中でこの3枚だけ絵柄が浮く。
    """
    im = Image.open(os.path.join(mo, scene, "%03d.png" % n)).convert("RGBA")
    box = im.getbbox()
    return im.crop(box) if box else im


def _fade(im, amount):
    """うすくする。姿を消しているところを「居ない」と読ませるために使う。"""
    out = im.copy()
    out.putalpha(out.getchannel("A").point(lambda v: int(v * amount)))
    return out


def build_when(mo):
    os.makedirs(OUT, exist_ok=True)
    x0, y0, x1, y1 = SCREEN

    # ① じゃまなとき … 窓の前に立たず、画面の右のはしへどいている
    c = card()
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((x0 + 26, y0 + 52, x1 - 96, y1 - 18), radius=10,
                        fill=(255, 255, 255, 255), outline=INK, width=3)
    d.line([x0 + 28, y0 + 92, x1 - 98, y0 + 92], fill=INK, width=3)
    for i in range(3):
        bx = x0 + 46 + i * 26
        d.ellipse([bx, y0 + 64, bx + 13, y0 + 77], outline=INK, width=2)
    for i in range(4):                      # 書きかけの本文
        ly = y0 + 122 + i * 30
        d.line([x0 + 50, ly, x1 - 130 - (i % 2) * 60, ly], fill=(190, 186, 170, 255), width=7)
    b = _bear(mo, "edgepeek", 50)           # 右のはしからのぞいている姿
    c.alpha_composite(b, (x1 - b.width, (y0 + y1) // 2 - b.height // 2))
    display(c)
    _save_when(c, "when_peek")

    # ② 見失ったとき … 呼ぶと画面のいちばん下・右のほうへ帰ってくる
    c = card()
    d = ImageDraw.Draw(c)
    b = _bear(mo, "eyes", 0)
    bx, by = x1 - b.width - 38, y1 - b.height - 6
    for k in range(16):                     # 帰ってくる道すじ（点線）
        t = k / 15
        px = x0 + 40 + (bx + b.width // 2 - x0 - 40) * t
        py = y0 + 70 + (by + b.height - y0 - 70) * (t * t)
        d.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(190, 186, 170, 255))
    c.alpha_composite(b, (bx, by))
    display(c)
    _save_when(c, "when_home")

    # ③ 集中したいとき … 姿も動きも消える
    c = card()
    b = _fade(_bear(mo, "eyes", 0), 0.16)
    c.alpha_composite(b, ((x0 + x1) // 2 - b.width // 2, y1 - b.height - 6))
    display(c)
    _save_when(c, "when_hidden")


def _save_when(c, name):
    p = os.path.join(OUT, name + ".png")
    c.convert("RGB").save(p, optimize=True)
    print("  %-10s %dx%d  %.1f KB" % (name, c.width, c.height, os.path.getsize(p) / 1024))


# --------------------------------------------------------------------------
# 動く絵（GIF）
# --------------------------------------------------------------------------

FRAME_W, FRAME_H = 460, 380     # --frames が出すコマの大きさ


def gif_scene(mo, name, marks):
    """1つの場面のコマを、カードの紙の上に並べて返す。

    切り出す位置は **全コマ共通** にする。コマごとに中身で切ると、
    動いているものが真ん中に固定されて、まったく動かない絵になる。
    """
    d = os.path.join(mo, name)
    files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    raw = [Image.open(os.path.join(d, f)).convert("RGBA") for f in files]
    over = [Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0)) for _ in raw]
    if marks and marks[0].get("cursor"):
        cur = cursor()
        for i, m in enumerate(marks[:len(raw)]):
            x, y = m["cursor"]
            # アプリの座標は下が原点。絵は上が原点なので裏返す
            cx_, cy_ = int(x), FRAME_H - int(y)
            # 押した合図。カーソルの先から輪がひろがる。
            # **カーソルより先に描く。** あとに描くと矢印の上に線が乗って汚れる。
            tap = m.get("tap") or 0
            if tap:
                d = ImageDraw.Draw(over[i])
                r = 5 + 4 * (tap - 1)
                a = max(40, 235 - 45 * (tap - 1))
                d.ellipse([cx_ - r, cy_ - r, cx_ + r, cy_ + r],
                          outline=INK + (a,), width=2)
            over[i].alpha_composite(cur, (cx_ - 6, cy_ - 4))

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
        build_when(fx)
    finally:
        shutil.rmtree(fx, ignore_errors=True)
    print("\n→ %s" % OUT)


if __name__ == "__main__":
    main()
