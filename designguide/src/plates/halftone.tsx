/**
 * ハーフトーン（網点）。
 *
 * 19世紀に写真を活版に載せるために発明された仕掛け。
 * インクは濃くも薄くもできない。出せるのは「有る」か「無い」かだけ。
 * だから階調を、点の「大きさ」に翻訳する。それが網点である。
 *
 * ■ ここで作っている「らしさ」
 *   1. 点は模様ではなく計算の結果である。
 *      だから <pattern> で一定の点を敷くのではなく、格子の各点で
 *      その場所の濃さを求め、面積が濃さに比例するよう半径を決めている。
 *      面積 ∝ 濃さ なので、半径は濃さの平方根。ここを線形にすると
 *      中間調が濃く出て、写真ではなく判子になる。
 *   2. 版ごとに網の角度を変える。C15° M75° Y0° K45°。
 *      同じ角度で4版重ねると縞（モアレ）が出て絵が壊れる。
 *      角度をずらすと、重なりが小さな花（ロゼット）になる。
 *      この図版はそれを見せるためにあるので、拡大鏡を1つ置いた。
 *   3. 版ズレ。4版は絶対に完全には合わない。
 *      版ごとに1〜2px ずらしてある。角のトンボを見ると分かる。
 *   4. 網点の上に ATLAS.rough は掛けない。点が崩れると全部が嘘になる。
 */
import { ATLAS, rad } from "@/lib/plate";

const P = "ht";
const PAPER = "#f4f1e8";
const K = "#111111";
const M = "#e0322a";
const C = "#2a5fd0";
const Y = "#f2b400";

/* 版ごとの網角。ここがこの様式の設計図 */
const ANG = { c: 15, m: 75, y: 0, k: 45 };
/* 版ズレ。完全に合う印刷機は無い */
const OFF = { c: [0, 0], m: [1.7, -1.3], y: [-1.5, 1.1], k: [0.9, 1.9] };

const PITCH = 13; // 網の目。粗いのは、点そのものを見せる図版だから

/** 版面の要所 */
const FX = 40, FR = 560, FT = 92, FB = 612;
const TABLE = 520;
const PX = 250, PY = 314; // 洋梨の中心

/**
 * 網を張る。角度で回した格子の各点で濃さを引き、
 * 面積が濃さに比例するように半径を決める（r ∝ √tone）
 */
function screen(
  deg: number, box: [number, number, number, number],
  tone: (x: number, y: number) => number, pitch = PITCH,
) {
  const [x0, y0, x1, y1] = box;
  const a = rad(deg);
  const ca = Math.cos(a), sa = Math.sin(a);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (2 * pitch)) + 1;
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const u = i * pitch, v = j * pitch;
      const x = cx + u * ca - v * sa;
      const y = cy + u * sa + v * ca;
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      const t = tone(x, y);
      if (t <= 0.02) continue;
      out.push({ x, y, r: Math.sqrt(Math.min(1, t)) * pitch * 0.62 });
    }
  }
  return out;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/* ── 描く対象 ──────────────────────────────────────────────── */

/**
 * 洋梨の半幅。
 * 初稿は2つの球のメタボールで作ったが、径が近いと融けて一個の卵になった。
 * 上下2つの円の半幅を「柔らかい最大値」で繋ぐと、
 * 継ぎ目にわずかな凹みが残る。この凹みが洋梨の首になる。
 */
function pearW(ly: number) {
  const wt = Math.sqrt(Math.max(0, 74 * 74 - (ly + 92) * (ly + 92)));
  const wb = Math.sqrt(Math.max(0, 126 * 126 - (ly - 80) * (ly - 80)));
  if (wt <= 0 && wb <= 0) return 0;
  return Math.pow(Math.pow(wt, 2.6) + Math.pow(wb, 2.6), 1 / 2.6);
}
const inPear = (lx: number, ly: number) => Math.abs(lx) <= pearW(ly);

/** 葉。首から右へ伸ばす */
function inLeaf(lx: number, ly: number) {
  const t = rad(-32);
  const u = (lx - 74) * Math.cos(t) + (ly + 214) * Math.sin(t);
  const v = -(lx - 74) * Math.sin(t) + (ly + 214) * Math.cos(t);
  return (u / 58) ** 2 + (v / 21) ** 2 <= 1;
}
/** 軸 */
function inStem(lx: number, ly: number) {
  if (ly > -158 || ly < -240) return false;
  const t = (ly + 240) / 82;
  return Math.abs(lx - (15 - 21 * t * t)) < 7 - t * 1.9;
}
/** 光は左上から。右下には台からの照り返しを少し戻す */
function lum(lx: number, ly: number) {
  const d = Math.hypot(lx + 58, (ly - 20) * 0.84) / 214;
  const rim = Math.max(0, 1 - Math.hypot((lx - 106) * 1.1, (ly - 146) * 0.9) / 124) * 0.32;
  /* 艶。ここだけ点が消えて紙が出る。これが無いと果物が石に見える */
  const spec = Math.max(0, 1 - Math.hypot((lx + 64) * 1.15, (ly - 4) * 0.95) / 36) * 0.9;
  return clamp((1 - d) * 1.12 + rim + spec);
}

export default function Plate() {
  /**
   * 版ごとの濃さ。壁も台も影も1つの関数に畳む。
   * 版ごとに網を1回張れば済むし、地と物とで網目がずれない
   */
  const ink = (which: "c" | "m" | "y" | "k") => (x: number, y: number) => {
    const lx = x - PX, ly = y - PY;

    if (inStem(lx, ly)) return { c: 0.24, m: 0.5, y: 0.62, k: 0.7 }[which];
    if (inLeaf(lx, ly)) {
      const s = clamp(0.5 + (lx - 44) / 130);
      return { c: 0.44 + s * 0.3, m: 0.06, y: 0.82, k: 0.04 + s * 0.22 }[which];
    }
    if (inPear(lx, ly)) {
      const dark = 1 - lum(lx, ly);
      /* 頬の紅。光の当たる肩に薄く差す */
      const blush = Math.max(0, 1 - Math.hypot(lx + 20, (ly - 6) * 1.05) / 104) * 0.34;
      return {
        c: Math.pow(dark, 1.6) * 0.52,
        m: 0.12 + dark * 0.46 + blush,
        y: 0.6 + dark * 0.2,
        k: Math.pow(dark, 2.1) * 0.98,
      }[which];
    }

    /* 台。手前ほど濃い。落ちる影を足す */
    if (y >= TABLE) {
      const t = (y - TABLE) / (FB - TABLE);
      const sh = Math.pow(clamp(1 - Math.hypot((x - 272) / 172, (y - 546) / 30)), 1.3);
      return {
        c: sh * 0.3,
        m: 0.06 + t * 0.05 + sh * 0.14,
        y: 0.2 + t * 0.12 + sh * 0.08,
        k: 0.02 + t * 0.05 + sh * 0.52,
      }[which];
    }

    /* 壁。上が明るく下へ落ちる。左右の端も落として、面を平らにしない */
    const t = (y - FT) / (TABLE - FT);
    const vig = Math.max(0, Math.abs(x - 300) / 260 - 0.5) * 0.2;
    return { c: 0.04 + t * 0.13 + vig * 0.8, m: 0, y: 0, k: t * t * 0.05 }[which];
  };

  const FRAME: [number, number, number, number] = [FX, FT, FR, FB];

  /* 拡大鏡。網の重なり（ロゼット）を見せるためだけに置く */
  const LX = 476, LY = 202, LR = 74, ZOOM = 4.2;
  const SRCX = PX + 82, SRCY = PY + 52; // 洋梨の陰の縁を覗く
  const loupe = (which: "c" | "m" | "y" | "k") => (x: number, y: number) =>
    Math.hypot(x - LX, y - LY) > LR - 2 ? 0 : ink(which)(SRCX + (x - LX) / ZOOM, SRCY + (y - LY) / ZOOM);

  /* 濃度の階段。刷り屋が版面の端に必ず入れる控え */
  const strip = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return {
      x: 60 + i * 40,
      dots: screen(ANG.k, [60 + i * 40, 706, 60 + i * 40 + 36, 734], () => t, 7),
      label: i * 10,
    };
  });

  const PLATES = [
    { id: "c", col: C, deg: ANG.c, off: OFF.c },
    { id: "m", col: M, deg: ANG.m, off: OFF.m },
    { id: "y", col: Y, deg: ANG.y, off: OFF.y },
    { id: "k", col: K, deg: ANG.k, off: OFF.k },
  ] as const;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ハーフトーン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-loupe`}><circle cx={LX} cy={LY} r={LR} /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 4版。角度をずらして重ねる ─────────────────────────── */}
        {PLATES.map((pl) => (
          <g key={pl.id} style={{ mixBlendMode: "multiply" }} transform={`translate(${pl.off[0]} ${pl.off[1]})`} fill={pl.col}>
            {/* 壁・台・影・洋梨。全部まとめて1枚の網に載せる */}
            {screen(pl.deg, FRAME, ink(pl.id)).map((d, i) => (
              <circle key={`p${i}`} cx={d.x} cy={d.y} r={d.r} />
            ))}
            {/* 拡大鏡の中。同じ絵を4.2倍の網で刷り直す */}
            <g clipPath={`url(#${P}-loupe)`}>
              {screen(pl.deg, [LX - LR, LY - LR, LX + LR, LY + LR], loupe(pl.id), 26).map((d, i) => (
                <circle key={`l${i}`} cx={d.x} cy={d.y} r={d.r} />
              ))}
            </g>
          </g>
        ))}

        {/* 台の稜線。ここで壁と台が切り替わる */}
        <line x1={FX} y1={TABLE} x2={FR} y2={TABLE} stroke={K} strokeWidth="1.2" opacity="0.45" />

        {/* 拡大鏡の枠。覗いている場所を線で結ぶ */}
        <g fill="none" stroke={K}>
          <circle cx={LX} cy={LY} r={LR} strokeWidth="5" />
          <circle cx={LX} cy={LY} r={LR + 6} strokeWidth="1.2" opacity="0.5" />
          <circle cx={SRCX} cy={SRCY} r={LR / ZOOM} strokeWidth="1.4" opacity="0.75" />
          <line x1={SRCX + 12} y1={SRCY - 12} x2={LX - 54} y2={LY + 44} strokeWidth="1" opacity="0.55" strokeDasharray="4 4" />
        </g>
        <rect x={LX - 66} y={LY + LR + 10} width="132" height="20" fill={PAPER} />
        <text
          x={LX} y={LY + LR + 24} textAnchor="middle" fill={K}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="10" fontWeight="700" letterSpacing="2.2" opacity="0.75"
        >
          ×4.2 ROSETTE
        </text>

        {/* ── トンボ。4版のズレがここで見える ────────────────────── */}
        {[[FX - 8, FT - 32], [FR + 8, FT - 32], [FX - 8, FB + 34], [FR + 8, FB + 34]].map(([x, y], i) => (
          <g key={i} style={{ mixBlendMode: "multiply" }}>
            {PLATES.map((pl) => (
              <g key={pl.id} transform={`translate(${x + pl.off[0]} ${y + pl.off[1]})`} stroke={pl.col} strokeWidth="1.3" fill="none">
                <line x1="-13" y1="0" x2="13" y2="0" />
                <line x1="0" y1="-13" x2="0" y2="13" />
                <circle r="7.5" />
              </g>
            ))}
          </g>
        ))}

        {/* 断ちの印。校正刷りの版面はここまで、という指示 */}
        <g stroke={K} strokeWidth="1" opacity="0.5" fill="none">
          {[[FX, FT, 1, 1], [FR, FT, -1, 1], [FX, FB, 1, -1], [FR, FB, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M ${x} ${y + sy * 18} L ${x} ${y} L ${x + sx * 18} ${y}`} />
          ))}
        </g>

        {/* ── 文字と控え ──────────────────────────────────────── */}
        <text
          x={FX} y="676" fill={K}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="56" fontWeight="800" letterSpacing="-1.5"
        >
          HALFTONE
        </text>
        <text
          x={FR} y="676" textAnchor="end" fill={K}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="12" fontWeight="700" letterSpacing="2.2" opacity="0.8"
        >
          C15° M75° Y0° K45°
        </text>

        {/* 濃度の階段。5%刻みの控えは刷り屋の常識 */}
        <g style={{ mixBlendMode: "multiply" }} fill={K}>
          {strip.map((p, i) => p.dots.map((d, j) => <circle key={`${i}-${j}`} cx={d.x} cy={d.y} r={d.r} />))}
        </g>
        <g stroke={K} strokeWidth="0.8" fill="none" opacity="0.45">
          {strip.map((p, i) => <rect key={i} x={p.x} y="706" width="36" height="28" />)}
        </g>
        <g fill={K} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8" fontWeight="700" opacity="0.7">
          {strip.map((p, i) => (
            <text key={i} x={p.x + 18} y="746" textAnchor="middle">{p.label}</text>
          ))}
        </g>

        <text
          x={FX} y="770" fill={K}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="10.5" fontWeight="700" letterSpacing="2.6" opacity="0.72"
        >
          AREA ∝ TONE — RADIUS ∝ √TONE — 4 PLATES, MISREGISTERED
        </text>

        {/* 紙。網点の上に歪みは掛けない。点が崩れると全部が嘘になる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.14" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
