#!/usr/bin/env python3
"""公式ベクター（kosukuma.json）→ ドット絵スプライト。

こす.くま の既存のドット絵こすくまくん（fliplist/src/art/kosukuma.ts）と同じ作り方にする:
  - 楕円を重ねて似せない。公式データの面積を数えて1ドットずつ振り分ける。
  - 目・鼻・ほくろは面積が小さすぎて平均に埋もれるので、実測した割合の位置に打ち直す。
      目   = 左42% / 右58%、高さ42%
      鼻   = 50% / 46%（口は無い）
      ほくろ = 75% / 82%（黒ではなく濃い緑）
  - 輪郭は太い（実物で図幅の3.5%）。ここが痩せると別のくまになるので、
    面のドットが透明に接していたら必ず輪郭に変える＝閉じた1ドットの輪郭を保証する。

出力: mac/Assets/sprites.json
  {"palette":{...}, "sprites":{"<name>":{"w":..,"h":..,"rows":["..#oo#..",...]}}}
  記号は kosukuma.ts と揃える: '.'=透明 '#'=輪郭 'o'=面 'm'=ほくろ
"""
import json
import math
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC = os.path.join(PROJ, "mac", "Assets", "kosukuma.json")
OUT = os.path.join(PROJ, "mac", "Assets", "sprites.json")
DESIGN = os.path.expanduser("~/Desktop/こすくま/デザイン/ロゴ")

SS = 12                 # スーパーサンプリング倍率（面積を数えるため）
INK_TH = 0.30           # このぶん輪郭が掛かっていればそのドットは輪郭
FILL_TH = 0.40          # このぶん面が掛かっていればそのドットは面

# 実測した顔とほくろの位置（図の幅・高さに対する割合）。
# 目・鼻は数ドットしか無いので平均に埋もれる。公式データの画素を数えて出した位置に打ち直す。
#
# 正面: こす.くま の fliplist と同じ値（あちらの実測と私の実測が一致した）
EYE_Y = 0.42
EYE_LX, EYE_RX = 0.42, 0.58
NOSE_X, NOSE_Y = 0.50, 0.46
MOLE_X, MOLE_Y = 0.75, 0.82

# 寝そべり: こすくま.png（公式の寝そべり）から連結成分で実測した値。
# 顔は左端に寄っていて、ほくろは背中側＝右上にある。
# ここを正面と同じ割合で置くと、顔が体の真ん中に浮いて完全に別の生き物になる。
FACE = {
    "front": dict(eyes=[(EYE_LX, EYE_Y), (EYE_RX, EYE_Y)],
                  nose=(NOSE_X, NOSE_Y), mole=(MOLE_X, MOLE_Y)),
    # 実測では左目 73.0% / 右目 71.5% と高さが1.5%ちがう（顔がすこし傾いている）。
    # だが32ドットに落とすとその1.5%が「別の行」になってしまい、
    # 目が2つ並んで見えず、ただの散らばった点になる。**同じ行に揃える**。
    "lying": dict(eyes=[(0.188, 0.7225), (0.264, 0.7225)],
                  nose=(0.226, 0.779), mole=(0.864, 0.393), clear=True),
    # ふりむき（こすくま_ポーズ03.png から実測）。顔は左に寄っていて、少し傾いている。
    # 目の高さは 34.3% と 37.2% で差が大きいので、ここは傾きを残したまま置く。
    "turn": dict(eyes=[(0.161, 0.343), (0.273, 0.372)],
                 nose=(0.197, 0.385), mole=(0.432, 0.848)),
}

def CGF(v):
    return float(v)


# 記号
T, INK, FILL, MOLE = ".", "#", "o", "m"

PALETTE = {"line": "#141210", "fill": "#f7f7d8", "mole": "#28382c"}


# ── パスの平坦化 ────────────────────────────────────────────────

def flatten(d, steps=10):
    """"M x y C x y x y x y L x y Z" を折れ線の集合にする。"""
    toks = d.split()
    polys, cur, pos, start = [], [], (0.0, 0.0), (0.0, 0.0)
    i = 0
    op = "M"
    while i < len(toks):
        t = toks[i]
        if t in ("M", "L", "C", "Z"):
            op = t
            i += 1
            if op == "Z":
                if len(cur) > 2:
                    polys.append(cur)
                cur = []
                pos = start
            continue
        if op == "M":
            pos = (float(toks[i]), float(toks[i + 1])); i += 2
            if len(cur) > 2:
                polys.append(cur)
            cur = [pos]
            start = pos
        elif op == "L":
            pos = (float(toks[i]), float(toks[i + 1])); i += 2
            cur.append(pos)
        elif op == "C":
            p1 = (float(toks[i]), float(toks[i + 1]))
            p2 = (float(toks[i + 2]), float(toks[i + 3]))
            p3 = (float(toks[i + 4]), float(toks[i + 5])); i += 6
            p0 = pos
            for s in range(1, steps + 1):
                u = s / steps
                m = 1 - u
                cur.append((
                    m**3 * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u**3 * p3[0],
                    m**3 * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u**3 * p3[1]))
            pos = p3
        else:
            i += 2
    if len(cur) > 2:
        polys.append(cur)
    return polys


# ── ラスタライズ ────────────────────────────────────────────────

def rasterize(pose, w, h, warp=None):
    """スーパーサンプリングした 0=透明 / 1=面 / 2=輪郭 のインデックス画像を返す。

    公式データは「黒いシルエットを1枚敷いて、その上にクリームの面を乗せて
    穴を埋める」構造なので、**z順どおりに1枚へ描く**のが唯一の正解。
    黒とクリームを別マスクに描いて後で引き算すると、上に載っている黒
    （寝そべりポーズのパーツなど）まで消えるし、そもそもシルエットは
    塗り潰しなので内側が全部「輪郭」になって真っ黒になる（実際にやった）。
    """
    W, H = w * SS, h * SS
    img = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(img)

    px, py = pose["w"], pose["h"]
    k = min(W / px, H / py)
    ox, oy = W / 2, H / 2      # JSON は原点=中心・Y下向き

    for part in pose["parts"]:
        # 目・鼻・ほくろはこの段では描かない。
        # ベクターのまま焼くと、あとで実測位置に打ち直した点と1ドットずれて隣り合い、
        # 目が「●●」の2ドットになってしまう（実際にそうなって、視線ずらしも壊れた）。
        if part["id"] in ("eye_l", "eye_r", "nose", "mole"):
            continue
        c = part["fill"].lower()
        idx = 1 if c in ("#fafad3", "#f7f7d8", "#f8fac1") else 2
        for poly in flatten(part["d"]):
            if warp is None:
                pts = [(x * k + ox, y * k + oy) for (x, y) in poly]
            else:
                pts = [warp(x, y, k, ox, oy) for (x, y) in poly]
            if len(pts) > 2:
                dr.polygon(pts, fill=idx)
    return img


def downsample(img, w, h):
    """各ドットに掛かっている面積の比で '.'/'#'/'o' を決める。"""
    import numpy as np
    a = np.array(img, dtype=np.uint8).reshape(h, SS, w, SS)
    ink = (a == 2).mean(axis=(1, 3))
    fil = (a == 1).mean(axis=(1, 3))
    grid = [[T] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if ink[y][x] >= INK_TH:
                grid[y][x] = INK
            elif fil[y][x] >= FILL_TH:
                grid[y][x] = FILL
            elif ink[y][x] + fil[y][x] >= FILL_TH:
                # 輪郭と面が半分ずつ掛かっている縁のドット。輪郭を優先して痩せさせない。
                grid[y][x] = INK if ink[y][x] >= fil[y][x] * 0.6 else FILL
    return grid


def close_outline(grid):
    """面が透明に接していたら輪郭にする。これで輪郭が必ず1ドットで閉じる。"""
    h, w = len(grid), len(grid[0])
    out = [row[:] for row in grid]
    for y in range(h):
        for x in range(w):
            if grid[y][x] != FILL:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or grid[ny][nx] == T:
                    out[y][x] = INK
                    break
    return out


def drop_specks(grid, min_size=2):
    """1ドットだけ浮いた粒を消す（面積計算のノイズ）。"""
    h, w = len(grid), len(grid[0])
    seen = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if grid[y][x] == T or seen[y][x]:
                continue
            stack, comp = [(x, y)], []
            seen[y][x] = True
            while stack:
                cx, cy = stack.pop()
                comp.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and grid[ny][nx] != T:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if len(comp) < min_size:
                for cx, cy in comp:
                    grid[cy][cx] = T
    return grid


def drop_inner_specks(grid, max_size=5):
    """**面に完全に囲まれた小さな黒の塊** を消して面に戻す。

    面積で振り分けると、太い輪郭の内側のふちが拾われて、体の中に short な
    黒い棒が浮かぶことがある（寝そべりのほくろの右に出て「点が2つ」に見えた）。
    お腹の線のような本物の内側の線は長いので、小さいものだけを消せば残る。
    透明に接している＝シルエットの一部は絶対に消さない。
    """
    h, w = len(grid), len(grid[0])
    seen = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if grid[y][x] != INK or seen[y][x]:
                continue
            stack, comp, touches_void = [(x, y)], [], False
            seen[y][x] = True
            while stack:
                cx, cy = stack.pop()
                comp.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h or grid[ny][nx] == T:
                        touches_void = True
                        continue
                    if grid[ny][nx] == INK and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if not touches_void and len(comp) <= max_size:
                for cx, cy in comp:
                    grid[cy][cx] = FILL
    return grid


def clear_face_area(grid, w, h, plan, ymap=None):
    """顔を置く場所にある「内側の線」だけ消して、顔の居場所を作る。

    寝そべりの顔は前足のすぐ上にあり、そのままだと閉じた目が前足の線とくっついて
    「線の一部」に見える（実際にそうなって、実表示サイズで顔が読めなかった）。
    ただしシルエットまで消すと形が壊れるので、**透明に接している画素＝外周は残す**。
    消すのは内側の線だけ。
    """
    xs = [p[0] for p in plan["eyes"]] + [plan["nose"][0]]
    ys = [p[1] for p in plan["eyes"]] + [plan["nose"][1]]
    if ymap is not None:
        ys = [ymap(v) for v in ys]
    x0, x1 = int(min(xs) * w) - 1, int(max(xs) * w) + 3
    y0, y1 = int(min(ys) * h) - 1, int(max(ys) * h) + 2

    def is_outline(x, y):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= w or ny >= h or grid[ny][nx] == T:
                return True
        return False

    for y in range(max(0, y0), min(h, y1)):
        for x in range(max(0, x0), min(w, x1)):
            if grid[y][x] == INK and not is_outline(x, y):
                grid[y][x] = FILL


def put_face(grid, w, h, face=True, mole=True, blink=False, mole_x=None,
             spec="front", ymap=None, base_h=None):
    """目・鼻・ほくろを実測位置に打つ。こすくまくんに口は無いので口は打たない。"""
    def put(fx, fy, ch):
        # 「割合がどのドットに入るか」なので floor(割合 × ドット数)。
        # (w-1) を掛けたり round() を使うと、こす.くま の既存スプライト
        # （fliplist の BIG=26x34 で目が x=10 と 15、SMALL=20x26 で x=8 と 11）と
        # 1ドットずれる。顔の点は1ドットしか無いので、この1ドットで表情が変わる。
        # 1e-9 は 0.58*26 が 15.079999… のように下振れするのを防ぐため。
        if ymap is not None:
            fy = ymap(fy)
        x, y = int(fx * w + 1e-9), int(fy * h + 1e-9)
        if not (0 <= x < w and 0 <= y < h):
            return None
        if grid[y][x] == FILL:
            grid[y][x] = ch
            return (x, y)
        if grid[y][x] == INK:
            # ラスタライズの時点でもう輪郭になっている画素。打ち直す必要は無いが、
            # 「そこが目である」ことはアプリ側の視線ずらしに要るので座標は返す。
            return (x, y)
        return None

    plan = FACE.get(spec, FACE["front"])

    if face and plan.get("clear"):
        clear_face_area(grid, w, h, plan, ymap)

    eyes, nose = [], None
    if face:
        for (fx, fy) in plan["eyes"]:
            p = put(fx, fy, INK)
            if p:
                eyes.append(p)
        # 鼻の横位置は割合から独立に丸めない。**実際に描かれた目の中心**に合わせる。
        # 割合で決めると、閉じた目(2ドット幅)のときに視覚的な中心とずれて、
        # 鼻が片方の目の真下に付いてしまう（実際にそうなって顔が歪んだ）。
        #
        # 縦位置は **必ず ymap を通す**。ここを通し忘れると、伸ばした時に
        # 鼻だけ下へ流れ、やがて頭から外れて消える（実際にそうなった）。
        if eyes:
            # 鼻は **実際に描かれた目からの相対位置** で置く。
            # 割合から独立に丸めると、絵の高さによって目との間隔が0行や2行になり、
            # 顔がくっついたり離れたりして「こすくまくんではない何か」になる（実測で確認）。
            span_lo = min(e[0] for e in eyes)
            span_hi = max(e[0] for e in eyes) + (1 if blink and spec != "front" else 0)
            nx = (span_lo + span_hi) // 2
            eye_row = max(e[1] for e in eyes)
            eye_fy = max(fy for (_, fy) in plan["eyes"])
            # 間隔は **そのポーズ本来の高さ** で決める。
            # 伸びたコマの高さで計算すると鼻が離れ（pull4/stretchで2行）、
            # かといって全ポーズを34固定にすると寝そべり(24)がずれる。
            gap = int(round((plan["nose"][1] - eye_fy) * CGF(base_h or h)))
            ny = eye_row + max(1, min(2, gap))
            if 0 <= nx < w and 0 <= ny < h and grid[ny][nx] in (FILL, INK):
                grid[ny][nx] = INK
                nose = (nx, ny)
        else:
            nose = put(plan["nose"][0], plan["nose"][1], INK)
    if mole:
        mx = mole_x if mole_x is not None else plan["mole"][0]
        p = put(mx, plan["mole"][1], MOLE)
        if p is None:
            # 指定の1点がちょうど輪郭に当たることがある（ふりむきの腰がそうだった）。
            # 近くの面を探して、そこに置く。数ドットずれても点1つなので破綻しない。
            tx = int(mx * w + 1e-9)
            ty = int(plan["mole"][1] * h + 1e-9)
            best = None
            for r in (1, 2):
                for dy in range(-r, r + 1):
                    for dx in range(-r, r + 1):
                        x, y = tx + dx, ty + dy
                        if 0 <= x < w and 0 <= y < h and grid[y][x] == FILL:
                            d2 = dx * dx + dy * dy
                            if best is None or d2 < best[0]:
                                best = (d2, x, y)
                if best:
                    break
            if best:
                _, x, y = best
                grid[y][x] = MOLE
                p = (x, y)
        # ほくろは公式では丸くはっきり見える。大きい絵で1ドットだとただの汚れに見えるので、
        # 絵が大きいときだけ2x2にする。
        if p and w >= 40:
            x, y = p
            for dx, dy in ((1, 0), (0, 1), (1, 1)):
                if x + dx < w and y + dy < h and grid[y + dy][x + dx] == FILL:
                    grid[y + dy][x + dx] = MOLE

    if blink:
        # 閉じた目。昔のゲームでは これが「まばたき」「うれしい」「寝ている」を全部兼ねる。
        #
        # 立ちポーズ（目のまわりが面で囲まれている）は こす.くま の作法どおり
        # 「目を面に戻して、すぐ下に横線」。
        # 寝そべりは目が輪郭のすぐ近くにあるので、下に線を引くと輪郭とくっついて
        # 腕の線に見えてしまう。そこで **目の位置そのものを横線にする**。
        near_edge = spec != "front"
        for (x, y) in eyes:
            if near_edge:
                # 2ドットの横線。3ドットにすると左右の目がつながって
                # 「一本の線」になってしまう（目の間隔が4ドットしかない）。
                for dx in (0, 1):
                    if 0 <= x + dx < w and grid[y][x + dx] in (FILL, INK):
                        grid[y][x + dx] = INK
            else:
                grid[y][x] = FILL
                for dx in (-1, 0, 1):
                    if 0 <= x + dx < w and y + 1 < h and grid[y + 1][x + dx] == FILL:
                        grid[y + 1][x + dx] = INK
    return grid, eyes, nose


# 上からこの割合までを「頭」として一切伸ばさない。
# 44% にしていたら、顔（目42% / 鼻46%）の鼻から下が伸びて顔が歪んだ。
# 頭と体の境目＝腕の線は約59%なので、そこまで丸ごと守る。
HEAD_KEEP = 0.59


def bake_png(path, h, spec="turn", blink=False):
    """公式PNGから直接ドット絵にする。

    ベクターに無いポーズ（ふりむきなど）はこちらで焼く。
    やり方はベクターの時と同じで、面積を数えて1ドットずつ振り分け、
    顔とほくろだけ実測位置に打ち直す。
    """
    import numpy as np
    im = Image.open(path).convert("RGBA")
    a = np.array(im).astype(int)
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    solid = (al > 60) & ~((r > 250) & (g > 250) & (b > 250))
    ys, xs = np.where(solid)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    src_w, src_h = x1 - x0 + 1, y1 - y0 + 1

    hh = max(4, h)
    ww = max(4, int(round(h * src_w / src_h)))

    dark = solid & (r < 110) & (g < 110) & (b < 110)
    grid = [[T] * ww for _ in range(hh)]
    for gy in range(hh):
        sy0 = y0 + int(gy * src_h / hh)
        sy1 = max(sy0 + 1, y0 + int((gy + 1) * src_h / hh))
        for gx in range(ww):
            sx0 = x0 + int(gx * src_w / ww)
            sx1 = max(sx0 + 1, x0 + int((gx + 1) * src_w / ww))
            cell_solid = solid[sy0:sy1, sx0:sx1]
            cell_dark = dark[sy0:sy1, sx0:sx1]
            n = cell_solid.size
            if n == 0:
                continue
            fs = cell_solid.sum() / n
            fd = cell_dark.sum() / n
            if fd >= INK_TH:
                grid[gy][gx] = INK
            elif fs >= FILL_TH:
                grid[gy][gx] = FILL

    grid = close_outline(grid)
    grid = drop_specks(grid)
    grid = drop_inner_specks(grid)
    grid, eyes, nose = put_face(grid, ww, hh, face=True, mole=True, blink=blink,
                                spec=spec, base_h=h)
    return ["".join(row) for row in grid], eyes, nose


def bake(pose, h, face=True, mole=True, blink=False, squash=1.0, mole_x=None,
         spec="front", mirror=False, pull=1.0):
    """身長 h ドットでポーズを焼く。

    squash<1 で全体が潰れる（着地など）。
    pull>1 は **もちの伸び**。ここは全体を引き延ばさない。
    全体を等しく伸ばすと、5倍あたりで顔が消えてただの細い棒になる（実際にそうなった）。
    もちを引っぱった時に見えるのは「頭は残って、下だけ伸びる」形なので、
    上から HEAD_KEEP ぶんは元の縮尺のまま、その下だけを縦に伸ばす。
    """
    aspect = pose["w"] / pose["h"]

    if pull > 1.0:
        # 伸びた後の全高（元の高さ基準）
        total = HEAD_KEEP + (1 - HEAD_KEEP) * pull
        hh = max(4, int(round(h * total)))
        # 幅は「頭は元のまま、下へ行くほど細く」。
        # 全体を一律に細くすると頭まで痩せて、顔が潰れて別のものになる。
        ww = max(8, int(round(h * aspect)))
        narrow = 1.0 / (pull ** 0.30)     # 体の下端での細さ。控えめにするともち感が残る

        base_h = h            # 変形前の縦のドット数（＝元の身長）
        py = pose["h"]

        def warp(x, y, k, ox, oy):
            # y は原点中心・Y下向き。上端からの割合 t を出す
            t = (y + py / 2) / py
            if t <= HEAD_KEEP:
                ty = t
            else:
                ty = HEAD_KEEP + (t - HEAD_KEEP) * pull
            # 伸びた座標系（全高 total）へ写して、キャンバス中央に合わせる
            return (x * k + ox, (ty - total / 2) * py * k)

        # 横方向の縮尺は ww/元幅 で決まるので、k を横縦で分ける
        kx = ww / pose["w"] * SS
        ky = hh / (py * total / py) / py * SS * 0  # 使わない（warp内で総高に合わせる）

        W, H = ww * SS, hh * SS
        img = Image.new("L", (W, H), 0)
        dr = ImageDraw.Draw(img)
        kk = H / (py * total)          # 伸びた全高が H に収まる縮尺
        for part in pose["parts"]:
            if part["id"] in ("eye_l", "eye_r", "nose", "mole"):
                continue
            c = part["fill"].lower()
            idx = 1 if c in ("#fafad3", "#f7f7d8", "#f8fac1") else 2
            for poly in flatten(part["d"]):
                pts = []
                for (x, y) in poly:
                    t = (y + py / 2) / py
                    if t <= HEAD_KEEP:
                        ty = t
                        sx = 1.0
                    else:
                        u = (t - HEAD_KEEP) / (1 - HEAD_KEEP)     # 体の中での位置 0..1
                        ty = HEAD_KEEP + (t - HEAD_KEEP) * pull
                        sx = 1.0 + (narrow - 1.0) * (u ** 0.7)    # 下へ行くほど細く
                    pts.append((x * kx * sx + W / 2, ty * py * kk))
                if len(pts) > 2:
                    dr.polygon(pts, fill=idx)
        grid = downsample(img, ww, hh)
    else:
        hh = max(4, int(round(h * squash)))
        ww = max(4, int(round(h * aspect / math.sqrt(squash))))
        grid = downsample(rasterize(pose, ww, hh), ww, hh)

    grid = close_outline(grid)
    grid = drop_specks(grid)
    grid = drop_inner_specks(grid)
    if mirror:
        # 形だけ左右を返す。顔とほくろはこの **あと** に実測位置へ打つので、
        # 反転しても位置は正しいまま残る。
        grid = [row[::-1] for row in grid]
    ww2, hh2 = len(grid[0]), len(grid)

    # 伸ばした時は、顔も一緒に下へ流してはいけない。
    # 頭は伸ばしていないので、顔は **頭の中の同じ場所** に残る。
    # 元の割合を、伸びた後の全高に対する割合へ写し直す。
    ymap = None
    if pull > 1.0:
        total = HEAD_KEEP + (1 - HEAD_KEEP) * pull

        def ymap(t, _total=total, _pull=pull):
            ty = t if t <= HEAD_KEEP else HEAD_KEEP + (t - HEAD_KEEP) * _pull
            return ty / _total

    grid, eyes, nose = put_face(grid, ww2, hh2, face=face, mole=mole, blink=blink,
                                mole_x=mole_x, spec=spec, ymap=ymap, base_h=h)
    return ["".join(r) for r in grid], eyes, nose


def bake_umeboshi(h, frames=6):
    """転がる梅干しのコマを作る。

    **もとは金平糖だった。** こすくまくんの好きな食べ物が梅干しに変わったので
    差し替えた。金平糖のときの「丸に粒を並べて とげとげを作る」やり方は捨てて、
    実物の梅干しの見え方＝**ゆるく波打つ丸＋内側の しわ** で組み立てる。

    しわは黒い線で描かない。黒で引くと切れ込みに見えて、金平糖のくびれに逆戻りする。
    実物のしわは「面より少し濃い赤のくぼみ」なので、**4色目（`m`）** を借りて
    少し濃い赤で置く。色はアプリ側（RollingBehavior）が3色まとめて差し替える。

    しわの形は三日月にする。まっすぐな線だと引っかき傷に見えた。
    大きい三日月をまんなかに1つ、細いのをまわりに3つ。全部いっしょに回るので、
    転がると しわも回って、同じ球が回っているように読める。
    """
    import math as _m
    import numpy as np

    def crescent(dr, cx, cy, r_out, off, r_in, ang):
        """三日月＝大きい円から、少しずらした円を抜いたもの。ang の向きに開く。"""
        dr.ellipse([cx - r_out, cy - r_out, cx + r_out, cy + r_out], fill=1)
        ix, iy = cx + _m.cos(ang) * off, cy + _m.sin(ang) * off
        dr.ellipse([ix - r_in, iy - r_in, ix + r_in, iy + r_in], fill=0)

    # 輪郭のうねり。振幅はごく小さくする。大きくすると、また金平糖に寄る。
    WOB, WOB2, LOBES = 0.055, 0.03, 3
    # まんなかの大きい三日月
    BIG, BIG_OFF, BIG_IN = 0.46, 0.30, 0.465
    # まわりの細い三日月 (中心からの距離, 向き, 大きさ)
    SMALLS = ((0.62, 0.9, 0.21), (0.60, 2.5, 0.18), (0.58, 4.4, 0.17))
    FILL_TH, WRINKLE_TH = 0.42, 0.44

    out = []
    R = h / 2.0 * SS
    for f in range(frames):
        rot = 2 * _m.pi * f / frames
        W = H = h
        cx = cy = W * SS / 2

        body = Image.new("L", (W * SS, H * SS), 0)
        pts = []
        for i in range(360):
            a = 2 * _m.pi * i / 360
            rr = R * 0.97 * (1 + WOB * _m.sin(LOBES * a + rot * LOBES)
                             + WOB2 * _m.sin(5 * a - rot * 2))
            pts.append((cx + _m.cos(a) * rr, cy + _m.sin(a) * rr))
        ImageDraw.Draw(body).polygon(pts, fill=1)

        wr = Image.new("L", (W * SS, H * SS), 0)
        d2 = ImageDraw.Draw(wr)
        crescent(d2, cx, cy, R * BIG, R * BIG_OFF, R * BIG_IN, rot + 2.2)
        for (dist, ang0, size) in SMALLS:
            a = ang0 + rot
            px, py = cx + _m.cos(a) * R * dist, cy + _m.sin(a) * R * dist
            crescent(d2, px, py, R * size, R * size * 0.78, R * size * 0.92, a + 1.9)

        bcov = (np.array(body, dtype=np.uint8).reshape(H, SS, W, SS) == 1).mean(axis=(1, 3))
        wcov = (np.array(wr, dtype=np.uint8).reshape(H, SS, W, SS) == 1).mean(axis=(1, 3))
        grid = [[T] * W for _ in range(H)]
        for y in range(H):
            for x in range(W):
                if bcov[y][x] >= FILL_TH:
                    grid[y][x] = FILL
        grid = close_outline(grid)
        grid = drop_specks(grid)
        # しわは面の上だけに置く。輪郭に食い込ませると、ふちが欠けて見える。
        for y in range(H):
            for x in range(W):
                if grid[y][x] == FILL and wcov[y][x] >= WRINKLE_TH:
                    grid[y][x] = MOLE
        out.append(["".join(r) for r in grid])
    return out


def main():
    doc = json.load(open(SRC, encoding="utf-8"))
    poses = doc["poses"]
    out = {"palette": PALETTE, "sprites": {}}

    # 主役サイズ。既存の fliplist は 26x34 なので、それを含む数段を用意する。
    plan = [
        ("idle",    "front",  34, dict()),
        # まばたき＝目の下に3ドットの横線。これは「うれしい目(^^)」としても読めるので、
        # 昔のゲームの流儀どおり1枚で兼ねる。
        ("blink",   "front",  34, dict(blink=True)),
        ("squash",  "front",  34, dict(squash=0.88)),
        # キーボードふみふみ用。ほんの少しだけ縮めたコマ。
        # idle と交互に出すと1ドットだけ上下して「小さく足踏みしている」ように見える。
        # squash(0.88) と交互にすると振れ幅が大きすぎて、地団駄を踏んでいるように見えた。
        ("tap",     "front",  34, dict(squash=0.965)),
        ("stretch", "front",  34, dict(squash=1.14)),
        # つままれて伸びるところ。ドット絵は連続変形できないので、
        # 引っぱった距離で切り替える段階を用意する。1枚だけだと「持ち上げても伸びない」
        # ように見えて、もちもち感が完全に消える。
        # つままれて伸びるところ。ドット絵は連続変形できないので段階を用意する。
        # もちのようにうんと伸びてほしい、とのことで最大5倍まで。
        # 幅は面積が保たれるように 1/√倍率 で細くなる（もちを引っぱった時の見え方）。
        # つままれて伸びるところ。頭を残して体だけ伸ばす（もちの引っぱり）。
        # 全高で最大2倍。5.5倍まで伸ばしたら、もちを通り越して麺になった。
        #   total = HEAD_KEEP + (1-HEAD_KEEP)*pull なので pull=3.38 で全高2倍。
        ("pull1",   "front",  34, dict(pull=1.36)),
        ("pull2",   "front",  34, dict(pull=1.85)),
        ("pull3",   "front",  34, dict(pull=2.55)),
        ("pull4",   "front",  34, dict(pull=3.38)),
        # 後ろ姿はほくろが反対側に来る（背中側から見ているので）
        ("back",    "back",   34, dict(face=False, mole_x=1 - MOLE_X)),
        ("side",    "side",   34, dict(face=False, mole_x=0.62)),
        # 寝そべりは顔つき。目は閉じる（＝寝ている）。位置は こすくま.png から実測した値。
        # 大きさは立ち姿(26x34)との釣り合いで決める。32ドットまで上げたら
        # 「寝ると体が大きくなる」ように見えたので戻した。顔は clear_face_area で居場所を作る。
        # 「丸まって寝る」ポーズ(curled)はドット絵にしない。
        # 元データが52枚の重なりで出来ていて、26でも34ドットでも内側の線が団子になり、
        # 何のかたちか読めなかった（両方焼いて確認済み）。寝るときは lying を使う。
        ("small",   "front",  26, dict()),
    ]
    for name, pose, h, kw in plan:
        rows, eyes, nose = bake(poses[pose], h, **kw)
        sp = {"w": len(rows[0]), "h": len(rows), "rows": rows}
        # 目の座標を持たせておくと、アプリ側で目のドットだけ1つ横へずらして
        # 視線を作れる（1ドットしかない目でも、ずらすと驚くほど見ている方向が出る）
        if eyes:
            sp["eyes"] = [[x, y] for (x, y) in eyes]
        if nose:
            sp["nose"] = [nose[0], nose[1]]
        out["sprites"][name] = sp
        print(f"  {name:9s} {sp['w']:>3}x{sp['h']:<3} ({pose})"
              + (f"  目{sp['eyes']}" if eyes else ""))

    # 公式PNGから直接焼くポーズ。
    #  - ふりむき: ベクターに無い
    #  - 寝そべり: 後ろ姿.ai は こすくま.png の鏡像で、しかも顔が入っていない。
    #    元絵から直接焼いたほうが シルエットも顔もそのまま出る。
    png_plan = [
        ("turn",  "こすくま_ポーズ03.png", 34, "turn",  False),
        ("lying", "こすくま.png",          24, "lying", True),
    ]
    for name, fn, h, spec, blink in png_plan:
        path = os.path.join(DESIGN, fn)
        if not os.path.exists(path):
            print(f"  ! {fn} が無い")
            continue
        rows, eyes, nose = bake_png(path, h, spec=spec, blink=blink)
        sp = {"w": len(rows[0]), "h": len(rows), "rows": rows}
        if eyes:
            sp["eyes"] = [[x, y] for (x, y) in eyes]
        if nose:
            sp["nose"] = [nose[0], nose[1]]
        out["sprites"][name] = sp
        print(f"  {name:9s} {sp['w']:>3}x{sp['h']:<3} ({fn})"
              + (f"  目{sp['eyes']}" if eyes else ""))

    # 転がる梅干し（こすくまくんの約半分）
    for i, rows in enumerate(bake_umeboshi(19)):
        out["sprites"][f"ume{i}"] = {"w": len(rows[0]), "h": len(rows), "rows": rows}
    print(f"  {'ume0..5':9s} {len(out['sprites']['ume0']['rows'][0]):>3}x"
          f"{len(out['sprites']['ume0']['rows']):<3} (転がる梅干し)")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"\n→ {OUT}  ({os.path.getsize(OUT)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
