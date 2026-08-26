/**
 * フォービズム。
 *
 * 1905年のサロン・ドートンヌで「野獣（les fauves）」と呼ばれた一群。
 * マティス、ドラン、ヴラマンク。コリウールやレスタックの入江を、
 * 見えた色ではなく感じた色で塗った。木は朱、影は紫、水は青緑。
 *
 * ■ 4稿かけて分かったこと
 *   1稿 先の尖った紡錘形を一面に撒いた → 全部「木の葉」に見えた。
 *   2稿 台形の帯にした → 角が立って「切り紙のコラージュ」になった。
 *   3稿 縁をうねらせて端を丸めた → 筆に見えたが、豆粒が並んだ。
 *   4稿 筆を大きくした → 刷毛が家屋用になり、絵が大味になった。
 *   決定稿は3つを同時に守っている。
 *   ・筆の輪郭を段で作る。入り＝短い立ち上がり、腹＝一定、抜き＝細る。
 *     正弦1本だと両端が等しく丸まって豆になる。
 *   ・筆の寸法は版面の 1/6〜1/8。それ以上は刷毛、それ以下は点描になる。
 *   ・下地はベタで潰す。生成りは「塗り残し」として要所に数本だけ覗かせる。
 *     一面に覗かせると描きかけに見える。
 *
 * ■ フォーヴでなければ成立しない所
 *   補色の直付け。朱の葉のとなりが青緑、黄の空のとなりが紫の丘。
 *   輪郭線は1本も引いていない。形は色の境目だけで立ち上げる。
 */
import { ATLAS, rand, rad, shift } from "@/lib/plate";

const P = "fv";

/* spine.ts の5色 */
const CANVAS = "#f2e6c8";
const RED = "#e8402a";
const TEAL = "#1f7a8c";
const YELLOW = "#f2b100";
const PURPLE = "#7a2f8a";

/* 5色から作った中間色・濃淡。別の色相は足さない */
const ORANGE = "#ef7a1e"; // 朱と黄の中間
const RED_D = shift(RED, -0.34);
const TEAL_L = shift(TEAL, 0.34);
const TEAL_P = shift(TEAL, 0.62); // 空に差す青緑
const TEAL_D = shift(TEAL, -0.38);
const PURPLE_L = shift(PURPLE, 0.24);
const PURPLE_D = shift(PURPLE, -0.52);
const CREAM = shift(CANVAS, 0.46);
const YELLOW_L = shift(YELLOW, 0.4);

type Rnd = ReturnType<typeof rand>;
type S = { d: string; c: string; o: number };

/** 両端の太さが違う帯。幹と枝の輪郭に使う */
function limb(x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bend = 0) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const mx = (x0 + x1) / 2 + nx * bend;
  const my = (y0 + y1) / 2 + ny * bend;
  const k = (w0 + w1) / 3;
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(x0 + (nx * w0) / 2)} ${f(y0 + (ny * w0) / 2)}` +
    `Q${f(mx + nx * k)} ${f(my + ny * k)} ${f(x1 + (nx * w1) / 2)} ${f(y1 + (ny * w1) / 2)}` +
    `L${f(x1 - (nx * w1) / 2)} ${f(y1 - (ny * w1) / 2)}` +
    `Q${f(mx - nx * k)} ${f(my - ny * k)} ${f(x0 - (nx * w0) / 2)} ${f(y0 - (ny * w0) / 2)}Z`
  );
}

/** 点列を滑らかな閉曲線に。角が丸まるので筆の端が硬くならない */
function smoothClosed(p: [number, number][]) {
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const m0 = mid(p[n - 1], p[0]);
  let d = `M${f(m0[0])} ${f(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const q = p[i];
    const m = mid(p[i], p[(i + 1) % n]);
    d += `Q${f(q[0])} ${f(q[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}Z`;
}

/** 絵具の一撫で。軸を6点に刻み、幅の輪郭を掛け、左右の縁を別々にゆらす */
function stroke(r: Rnd, cx: number, cy: number, len: number, deg: number, w: number, bend = 0, wob = 1) {
  const a = rad(deg);
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const K = 6;
  const ph = r(0, 6.28);
  const ph2 = r(0, 6.28);
  const L: [number, number][] = [];
  const R: [number, number][] = [];
  for (let i = 0; i <= K; i++) {
    const t = i / K;
    const lat = bend * Math.sin(Math.PI * t) + Math.sin(t * 4.6 + ph) * w * 0.06 * wob;
    const s = (t - 0.5) * len;
    const ax = cx + dx * s + nx * lat;
    const ay = cy + dy * s + ny * lat;
    const ent = 0.72 + 0.28 * Math.min(1, t / 0.05);
    const rise = 0.74 + 0.26 * Math.min(1, t / 0.12);
    const fall = 1 - 0.3 * Math.max(0, (t - 0.5) / 0.5) ** 1.2;
    const tip = 0.58 + 0.42 * Math.min(1, (1 - t) / 0.1);
    const hw = (w / 2) * ent * rise * fall * tip;
    const jl = 1 + Math.sin(t * 7.3 + ph) * 0.14 * wob;
    const jr = 1 + Math.sin(t * 5.9 + ph2) * 0.14 * wob;
    L.push([ax + nx * hw * jl, ay + ny * hw * jl]);
    R.push([ax - nx * hw * jr, ay - ny * hw * jr]);
  }
  return smoothClosed([...L, ...R.reverse()]);
}

type FieldOpt = {
  cols: number;
  rows: number;
  len: number;
  wid: number;
  deg: number;
  degJit: number;
  colors: string[];
  bend?: number;
  jit?: number;
  impasto?: number;
};

/** 格子をゆらして一面を筆で埋める。一部にインパスト（絵具の山の照り）を重ねる */
function field(r: Rnd, box: [number, number, number, number], o: FieldOpt): S[] {
  const [bx, by, bw, bh] = box;
  const out: S[] = [];
  const gx = bw / o.cols;
  const gy = bh / o.rows;
  const j = o.jit ?? 0.5;
  for (let row = 0; row < o.rows; row++) {
    for (let col = 0; col < o.cols; col++) {
      const x = bx + gx * (col + 0.5) + r(-gx * j, gx * j);
      const y = by + gy * (row + 0.5) + r(-gy * j, gy * j);
      const len = o.len * r(0.72, 1.32);
      const deg = o.deg + r(-o.degJit, o.degJit);
      const w = o.wid * r(0.7, 1.3);
      const bend = (o.bend ?? 0) * r(-1, 1);
      const c = o.colors[Math.floor(r(0, o.colors.length)) % o.colors.length];
      out.push({ d: stroke(r, x, y, len, deg, w, bend), c, o: r(0.9, 1) });
      if (r() < (o.impasto ?? 0.2)) {
        out.push({ d: stroke(r, x, y, len * 0.58, deg, w * 0.24, bend, 0.4), c: shift(c, 0.4), o: r(0.4, 0.72) });
      }
    }
  }
  return out;
}

/** 葉むらの房。房ごとに色を絞る。全房を混ぜると斑点の散らかりになる */
type Lobe = { x: number; y: number; rx: number; ry: number; colors: string[] };

function foliage(r: Rnd, box: [number, number, number, number], lobes: Lobe[], o: FieldOpt): S[] {
  const [bx, by, bw, bh] = box;
  const out: S[] = [];
  const gx = bw / o.cols;
  const gy = bh / o.rows;
  for (let row = 0; row < o.rows; row++) {
    for (let col = 0; col < o.cols; col++) {
      const x = bx + gx * (col + 0.5) + r(-gx * 0.62, gx * 0.62);
      const y = by + gy * (row + 0.5) + r(-gy * 0.62, gy * 0.62);
      let dens = 0;
      let lobe = lobes[0];
      for (const l of lobes) {
        const v = 1 - ((x - l.x) / l.rx) ** 2 - ((y - l.y) / l.ry) ** 2;
        if (v > dens) {
          dens = v;
          lobe = l;
        }
      }
      if (dens <= 0 || r() > Math.min(1, dens * 3.4)) continue;
      // 房の内側ほど筆を大きく、縁ほど小さく。塊と縁ができる
      const scale = 0.6 + dens * 0.75;
      const len = o.len * scale * r(0.78, 1.26);
      const deg = o.deg + r(-o.degJit, o.degJit);
      const w = o.wid * scale * r(0.78, 1.22);
      const c = lobe.colors[Math.floor(r(0, lobe.colors.length)) % lobe.colors.length];
      out.push({ d: stroke(r, x, y, len, deg, w, (o.bend ?? 0) * r(-1, 1)), c, o: r(0.9, 1) });
      if (r() < (o.impasto ?? 0.15)) {
        out.push({ d: stroke(r, x, y, len * 0.5, deg, w * 0.24, 0, 0.4), c: shift(c, 0.44), o: r(0.4, 0.7) });
      }
    }
  }
  return out;
}

const Paint = ({ s, k }: { s: S[]; k: string }) => (
  <>
    {s.map((v, i) => (
      <path key={`${k}${i}`} d={v.d} fill={v.c} opacity={v.o} />
    ))}
  </>
);

export default function Plate() {
  const r = rand(19051022);

  const SEA = 470; // 水平線
  const BANK = 672; // 手前の土手の頂
  const RIDGE = `M-20 ${SEA} L-20 452 Q 80 392 176 420 Q 258 444 336 404 Q 424 362 512 400 Q 566 422 620 404 L620 ${SEA} Z`;
  const SHORE = `M-20 ${SEA} L620 ${SEA} L620 ${BANK + 36} Q 460 ${BANK - 20} 296 ${BANK + 8} Q 136 ${BANK + 34} -20 ${BANK - 6} Z`;

  /* 空。上は生成りに近い黄、下は橙に寄せる */
  const skyHi = field(r, [-40, -34, 680, 250], {
    cols: 9, rows: 6, len: 98, wid: 20, deg: -8, degJit: 20, bend: 8,
    colors: [CREAM, YELLOW_L, YELLOW, TEAL_P, YELLOW_L, CREAM],
  });
  const skyLo = field(r, [-40, 214, 680, 268], {
    cols: 9, rows: 6, len: 96, wid: 20, deg: -4, degJit: 17, bend: 7,
    colors: [YELLOW, ORANGE, YELLOW_L, RED, YELLOW, YELLOW_L],
  });

  const hills = field(r, [-34, 386, 668, 100], {
    cols: 9, rows: 3, len: 86, wid: 22, deg: 3, degJit: 13, bend: 6,
    colors: [PURPLE, PURPLE_D, TEAL_D, PURPLE_L, PURPLE],
  });

  /* 水は3段。上ほど明るく、下ほど紫に沈める */
  const waterA = field(r, [-34, SEA + 4, 668, 64], {
    cols: 8, rows: 2, len: 104, wid: 17, deg: 0, degJit: 6, bend: 4,
    colors: [TEAL_L, TEAL, shift(TEAL_L, 0.28), TEAL],
  });
  const waterB = field(r, [-34, SEA + 62, 668, 88], {
    cols: 8, rows: 3, len: 100, wid: 18, deg: 0, degJit: 7, bend: 5,
    colors: [TEAL, TEAL_D, TEAL_L, PURPLE, TEAL],
  });
  const waterC = field(r, [-34, SEA + 142, 668, 86], {
    cols: 8, rows: 3, len: 98, wid: 19, deg: 1, degJit: 8, bend: 5,
    colors: [TEAL_D, PURPLE, TEAL, PURPLE_D, TEAL_D],
  });

  const bank = field(r, [-34, BANK - 12, 668, 158], {
    cols: 7, rows: 4, len: 116, wid: 30, deg: -3, degJit: 16, bend: 9,
    colors: [PURPLE_D, RED_D, PURPLE, TEAL_D, ORANGE, RED_D, PURPLE_D],
    impasto: 0.3,
  });

  /* 幹。幹の傾き（垂直から約12度）ぶん剪断した座標に2本の帯を置き、
     重ねて明暗の境目をぼかす。切り抜きで割るとマスクの直線が出る */
  const trunkDark = field(r, [156, 176, 72, 660], {
    cols: 3, rows: 15, len: 72, wid: 20, deg: 88, degJit: 8, bend: 5,
    colors: [PURPLE_D, RED_D, PURPLE_D, PURPLE],
    impasto: 0.16,
  });
  const trunkLit = field(r, [206, 176, 64, 660], {
    cols: 3, rows: 15, len: 70, wid: 18, deg: 88, degJit: 8, bend: 5,
    colors: [RED_D, ORANGE, RED, PURPLE, ORANGE, YELLOW],
    impasto: 0.42,
  });

  /* 葉むら。房ごとに色を絞る。左＝朱、中＝橙と黄、右＝紫と青緑 */
  const canopy = foliage(
    r,
    [-40, -50, 690, 320],
    [
      { x: 88, y: 58, rx: 158, ry: 116, colors: [RED, RED_D, ORANGE, RED, RED_D] },
      { x: 238, y: 30, rx: 134, ry: 94, colors: [ORANGE, YELLOW, RED, ORANGE] },
      { x: 44, y: 194, rx: 106, ry: 76, colors: [RED_D, PURPLE, RED, PURPLE_D] },
      { x: 214, y: 172, rx: 96, ry: 60, colors: [RED, ORANGE, PURPLE, RED_D] },
      { x: 396, y: 66, rx: 126, ry: 90, colors: [PURPLE, TEAL_D, RED_D, PURPLE_L] },
      { x: 550, y: 36, rx: 106, ry: 76, colors: [TEAL_D, PURPLE, RED_D, TEAL] },
      { x: 374, y: 172, rx: 76, ry: 50, colors: [PURPLE_D, RED, PURPLE] },
    ],
    { cols: 30, rows: 17, len: 32, wid: 15, deg: 30, degJit: 82, bend: 5, impasto: 0.18, colors: [RED] },
  );

  /* 水面の照り返し。家と舟の真下に縦に切る */
  const refl = Array.from({ length: 20 }, (_, i) => {
    const x = r(268, 590);
    const y = r(SEA + 6, SEA + 126);
    const c = [ORANGE, RED, CREAM, YELLOW][i % 4];
    return { d: stroke(r, x, y, r(12, 30), 90 + r(-6, 6), r(4, 8), r(-2, 2)), c, o: r(0.6, 0.92) };
  });

  const houses = [
    { x: 300, y: 434, w: 50, h: 38 },
    { x: 352, y: 442, w: 36, h: 30 },
    { x: 468, y: 438, w: 44, h: 34 },
    { x: 512, y: 446, w: 30, h: 26 },
  ];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="フォービズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-sky`}>
          <rect x="-24" y="-24" width="648" height={SEA + 24} />
        </clipPath>
        <clipPath id={`${P}-hill`}>
          <path d={RIDGE} />
        </clipPath>
        <clipPath id={`${P}-water`}>
          <path d={SHORE} />
        </clipPath>
        <clipPath id={`${P}-bank`}>
          <path d={`M-20 820 L-20 ${BANK - 6} Q 136 ${BANK + 34} 296 ${BANK + 8} Q 460 ${BANK - 20} 620 ${BANK + 36} L620 820 Z`} />
        </clipPath>
        {/* 幹と枝。1本の木で左三分の一を押さえ、右へ枝を渡す */}
        <clipPath id={`${P}-tree`}>
          <path d={limb(48, 820, 176, 214, 112, 44, 26)} />
          <path d={limb(166, 288, 424, 168, 28, 8, 34)} />
          <path d={limb(158, 320, 46, 168, 24, 7, -20)} />
          <path d={limb(174, 250, 320, 82, 26, 8, 24)} />
          <path d={limb(170, 236, 152, 78, 22, 7, -14)} />
        </clipPath>
        {/* カンヴァスの織り。薄く。強いと方眼紙になる */}
        <pattern id={`${P}-weave`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="1.3" fill="#3a2a12" opacity="0.034" />
          <rect width="1.3" height="7" fill="#3a2a12" opacity="0.026" />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 生成りの地。塗り残しとして要所に覗く */}
        <rect width="600" height="800" fill={CANVAS} />

        <g clipPath={`url(#${P}-sky)`}>
          <rect x="-24" y="-24" width="648" height={SEA + 24} fill={YELLOW} opacity="0.9" />
          <Paint s={skyHi} k="sh" />
          <Paint s={skyLo} k="sl" />
        </g>

        <g clipPath={`url(#${P}-hill)`}>
          <rect x="-20" y="352" width="640" height="130" fill={PURPLE_D} />
          <Paint s={hills} k="hl" />
        </g>
        {/* 稜線に沿った塗り残し。丘と空の絵具が出合いきらない所 */}
        <path d={RIDGE} fill="none" stroke={CANVAS} strokeWidth="2.2" opacity="0.5" strokeDasharray="34 26 12 58" />

        {/* 岸の家。屋根の朱が入江の青緑とぶつかる */}
        {houses.map((h, i) => (
          <g key={`h${i}`}>
            <path d={stroke(r, h.x + h.w / 2, h.y + h.h * 0.68, h.w, 0, h.h * 0.62, 0, 0.5)} fill={CREAM} opacity="0.96" />
            <path d={stroke(r, h.x + h.w / 2, h.y + h.h * 0.2, h.w * 0.98, 0, h.h * 0.38, 0, 0.5)} fill={RED} />
            <path d={stroke(r, h.x + h.w * 0.22, h.y + h.h * 0.74, h.h * 0.46, 90, 6)} fill={PURPLE_D} opacity="0.85" />
          </g>
        ))}
        {/* 岸の人影。2つだけ。大きさの物差しになる */}
        <path d={stroke(r, 400, 458, 18, 88, 5)} fill={PURPLE_D} opacity="0.9" />
        <path d={stroke(r, 411, 460, 16, 84, 4)} fill={RED_D} opacity="0.9" />

        <g clipPath={`url(#${P}-water)`}>
          <rect x="-20" y={SEA} width="640" height="260" fill={TEAL} />
          <Paint s={waterA} k="wa" />
          <Paint s={waterB} k="wc" />
          <Paint s={waterC} k="wd" />
          {/* 舟。ここだけ形が決まっていて、絵に一点の焦点を作る */}
          <path d="M322 578 Q 362 596 404 576 Q 364 590 322 578 Z" fill={RED_D} />
          <path d={stroke(r, 358, 552, 46, 92, 4.5)} fill={PURPLE_D} opacity="0.95" />
          <path d="M362 528 Q 386 552 392 575 L362 575 Z" fill={CREAM} opacity="0.97" />
          <path d="M353 534 Q 340 556 331 575 L353 575 Z" fill={YELLOW_L} opacity="0.95" />
          <Paint s={refl} k="rf" />
        </g>

        <g clipPath={`url(#${P}-bank)`}>
          <rect x="-20" y={BANK - 30} width="640" height="200" fill={PURPLE_D} />
          <Paint s={bank} k="bk" />
        </g>

        {/* 幹。傾きに合わせて剪断した座標で塗る */}
        <g clipPath={`url(#${P}-tree)`}>
          <rect x="0" y="40" width="600" height="780" fill={PURPLE_D} />
          <g transform="skewX(-11.9)">
            <Paint s={trunkDark} k="td" />
            <Paint s={trunkLit} k="tl" />
          </g>
          {/* 太い枝の上面に西日。枝が板に見えないよう縁だけ拾う */}
          <path d={stroke(r, 292, 224, 232, -25, 9, 12)} fill={ORANGE} opacity="0.9" />
          <path d={stroke(r, 250, 168, 168, -49, 7, -9)} fill={RED} opacity="0.75" />
          <path d={stroke(r, 104, 246, 128, -128, 6, 7)} fill={RED_D} opacity="0.8" />
        </g>

        <Paint s={canopy} k="cy" />

        {/* 題字。葉むらと丘のあいだに空けた空の帯に置く */}
        <text
          x="330" y="318"
          fill={PURPLE_D}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="43"
          fontStyle="italic"
          fontWeight="700"
        >
          les fauves
        </text>
        <path d={stroke(r, 430, 330, 196, 0, 3.4, 0, 0.5)} fill={RED_D} opacity="0.8" />
        <text
          x="334" y="352"
          fill={RED_D}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="10.5"
          letterSpacing="3.2"
        >
          SALON D&#39;AUTOMNE — PARIS 1905
        </text>

        {/* 署名。画家は絵の中に書く */}
        <text
          x="466" y="762"
          fill={ORANGE}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="20"
          fontStyle="italic"
          opacity="0.95"
          transform="rotate(-3 466 762)"
        >
          Derain
        </text>

        {/* カンヴァスの織り目と紙の粒 */}
        <rect width="600" height="800" fill={`url(#${P}-weave)`} style={{ mixBlendMode: "multiply" }} />
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.14"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
