"""pdftocairo が吐いた SVG の <path d="..."> を解析するユーティリティ。

pdftocairo の出力は M / C / L / Z だけ（絶対座標）なので、そこだけ扱えばよい。
サブパス（M ごとの塊）に分解し、bbox・面積・重心を出して部位判定に使う。
"""
import re
from dataclasses import dataclass, field

NUM = re.compile(r"-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?")
CMD = re.compile(r"([MmCcLlZzHhVv])([^MmCcLlZzHhVv]*)")


@dataclass
class SubPath:
    idx: int
    parent: int
    color: str
    d: str
    pts: list = field(default_factory=list)   # サンプリングした点（bbox/面積用）

    @property
    def bbox(self):
        xs = [p[0] for p in self.pts]
        ys = [p[1] for p in self.pts]
        return min(xs), min(ys), max(xs), max(ys)

    @property
    def size(self):
        x0, y0, x1, y1 = self.bbox
        return x1 - x0, y1 - y0

    @property
    def area(self):
        """符号付き面積（シューレース）。負なら逆巻き＝穴の可能性。"""
        a = 0.0
        n = len(self.pts)
        for i in range(n):
            x0, y0 = self.pts[i]
            x1, y1 = self.pts[(i + 1) % n]
            a += x0 * y1 - x1 * y0
        return a / 2.0

    @property
    def centroid(self):
        x0, y0, x1, y1 = self.bbox
        return (x0 + x1) / 2, (y0 + y1) / 2


def _bez(p0, p1, p2, p3, n=12):
    out = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


def split_subpaths(d, parent=0, color="#000"):
    """d 属性を M 単位のサブパスに割る。各サブパスは自己完結した d 文字列を持つ。"""
    subs = []
    cur_cmds = []
    cur_pts = []
    cursor = (0.0, 0.0)
    start = (0.0, 0.0)

    def flush():
        if cur_cmds and len(cur_pts) > 1:
            subs.append(SubPath(len(subs), parent, color, " ".join(cur_cmds), list(cur_pts)))

    for m in CMD.finditer(d):
        op, args = m.group(1), m.group(2)
        nums = [float(x) for x in NUM.findall(args)]
        if op == "M":
            flush()
            cur_cmds = []
            cur_pts = []
            # M は複数座標が続くと以降は L 扱い
            for i in range(0, len(nums), 2):
                pt = (nums[i], nums[i + 1])
                cur_cmds.append(("M" if i == 0 else "L") + f" {pt[0]:.4f} {pt[1]:.4f}")
                cur_pts.append(pt)
                cursor = pt
                if i == 0:
                    start = pt
        elif op == "C":
            for i in range(0, len(nums), 6):
                p1 = (nums[i], nums[i + 1])
                p2 = (nums[i + 2], nums[i + 3])
                p3 = (nums[i + 4], nums[i + 5])
                cur_cmds.append(f"C {p1[0]:.4f} {p1[1]:.4f} {p2[0]:.4f} {p2[1]:.4f} {p3[0]:.4f} {p3[1]:.4f}")
                cur_pts.extend(_bez(cursor, p1, p2, p3))
                cursor = p3
        elif op == "L":
            for i in range(0, len(nums), 2):
                pt = (nums[i], nums[i + 1])
                cur_cmds.append(f"L {pt[0]:.4f} {pt[1]:.4f}")
                cur_pts.append(pt)
                cursor = pt
        elif op in ("Z", "z"):
            cur_cmds.append("Z")
            cursor = start
    flush()
    return subs


def load(path):
    """SVG を読んで全 <path> をサブパスに分解して返す。"""
    s = open(path, encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    out = []
    for pi, m in enumerate(re.finditer(r'<path[^>]*?fill="rgb\(([^)]+)\)"[^>]*?d="([^"]+)"', s, re.S)):
        rgb = [float(x.strip().rstrip("%")) for x in m.group(1).split(",")]
        col = "#%02x%02x%02x" % tuple(min(255, round(c * 255 / 100)) for c in rgb)
        out.extend(split_subpaths(m.group(2), parent=pi, color=col))
    for i, sp in enumerate(out):
        sp.idx = i
    return vb, out
