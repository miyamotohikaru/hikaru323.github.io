/**
 * ロココ。
 *
 * 18世紀フランスの室内装飾板（boiserie）。壁に嵌める一枚。
 *
 * ■ 隣のバロックと何を変えたか。ここが全部
 *   1. 非対称。バロックは傾けても左右は釣り合う。ロココは釣り合わない。
 *      枠そのものが左右で違う形をしている。左上に大きな貝、右下に小さな渦。
 *      鏡に映して重ならないことを確かめながら描いた。
 *   2. 明るい地。バロックは闇が地で光が図。ロココは全部が図。影を作らない。
 *      いちばん濃い色でも #5a4a3a（焦茶）で、面積は数パーセント。
 *   3. 細い線。金は「面」ではなく「糸」。線幅は最大でも 3。
 *   4. 貝（rocaille）。この様式の名の由来。扇状の襞と、縁の刻み。
 *      左右対称の扇にすると貝ではなく団扇になるので、
 *      襞の長さを rand で揺らし、片側だけ長く垂らしている。
 *   5. 格子（treillage）。庭の蔓棚を室内の壁に描くのがこの時代の趣向。
 */
import { ATLAS, rand, rad, lerp, shift, alpha } from "@/lib/plate";

const P = "rc";
const PAPER = "#f5ece2";
const PINK = "#e8c4d0";
const MINT = "#c9d6c4";
const GOLD = "#d9b45a";
const BROWN = "#5a4a3a";

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

const bez = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
const dbez = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
};

/** 曲線上に等間隔で置く。花綱はこれで作る */
function along(c: Cubic, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const x = bez(t, c[0][0], c[1][0], c[2][0], c[3][0]);
    const y = bez(t, c[0][1], c[1][1], c[2][1], c[3][1]);
    const dx = dbez(t, c[0][0], c[1][0], c[2][0], c[3][0]);
    const dy = dbez(t, c[0][1], c[1][1], c[2][1], c[3][1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI, t };
  });
}

const cubicD = (c: Cubic) => `M${c[0][0]} ${c[0][1]} C ${c[1][0]} ${c[1][1]} ${c[2][0]} ${c[2][1]} ${c[3][0]} ${c[3][1]}`;

/**
 * 貝（rocaille）。扇状の襞＋縁の刻み。
 * 襞の長さを揺らして片側を長くしないと、貝ではなく団扇になる。
 */
function Rocaille({ x, y, r, rot, n = 11, spread = 176, seed, tone = 0 }: {
  x: number; y: number; r: number; rot: number; n?: number; spread?: number; seed: number; tone?: number;
}) {
  const rr = rand(seed);
  const tips: Pt[] = [];
  const lens: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = -spread / 2 + spread * u;
    // 片側を長く。u に対して非対称な重み
    const len = r * (0.62 + 0.42 * Math.cos(rad(a * 0.9)) + 0.16 * u) * rr(0.94, 1.06);
    lens.push(len);
    tips.push([Math.sin(rad(a)) * len, -Math.cos(rad(a)) * len]);
  }
  // 縁の刻み。隣り合う襞先の間を外へふくらませる
  let edge = `M0 0 L${tips[0][0].toFixed(1)} ${tips[0][1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const c = Math.hypot(tips[i][0] - tips[i - 1][0], tips[i][1] - tips[i - 1][1]);
    edge += ` A${(c * 0.62).toFixed(1)} ${(c * 0.62).toFixed(1)} 0 0 1 ${tips[i][0].toFixed(1)} ${tips[i][1].toFixed(1)}`;
  }
  edge += " Z";

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={edge} fill={shift(PINK, 0.44 - tone)} stroke={GOLD} strokeWidth="1.8" />
      {/* 襞。中心から放射。金の細線だけで彫りを見せる */}
      {tips.map((p, i) => (
        <line key={i} x1="0" y1="0" x2={p[0] * 0.97} y2={p[1] * 0.97} stroke={GOLD} strokeWidth={i % 2 === 0 ? 1.5 : 0.8} opacity="0.9" />
      ))}
      {/* 襞の谷。薄桃で1本おきに落とす */}
      {tips.slice(0, -1).map((p, i) => {
        const q = tips[i + 1];
        return i % 2 === 0 ? (
          <path key={i} d={`M0 0 L${p[0] * 0.96} ${p[1] * 0.96} L${q[0] * 0.96} ${q[1] * 0.96} Z`} fill={alpha(PINK, 0.55)} />
        ) : null;
      })}
      {/* 貝の根元。渦を1つ巻いて止める */}
      <path
        d={`M${-r * 0.2} ${r * 0.06} C ${-r * 0.44} ${r * 0.3} ${-r * 0.2} ${r * 0.56} ${r * 0.04} ${r * 0.44}
            C ${r * 0.2} ${r * 0.35} ${r * 0.1} ${r * 0.16} ${-r * 0.04} ${r * 0.24}`}
        fill="none"
        stroke={GOLD}
        strokeWidth="2.4"
      />
      <circle cx={-r * 0.02} cy={r * 0.3} r={r * 0.05} fill={GOLD} />
    </g>
  );
}

/** 小花。5弁。金の芯と点まで描くと近くで持つ */
function Flower({ x, y, r, rot, c, seed }: { x: number; y: number; r: number; rot: number; c: string; seed: number }) {
  const rr = rand(seed);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={i}
          transform={`rotate(${72 * i + rr(-12, 12)}) translate(0 ${-r * 0.62})`}
          rx={r * 0.42}
          ry={r * 0.6}
          fill={c}
          stroke={shift(BROWN, 0.34)}
          strokeWidth="0.7"
        />
      ))}
      <circle r={r * 0.26} fill={GOLD} />
      <circle r={r * 0.1} fill={shift(BROWN, 0.2)} />
    </g>
  );
}

/* 枠。左上と右下で形が違う。鏡に映して重ならないのがロココの条件 */
const FRAME =
  `M 152 92
   C 206 58 300 48 368 66
   C 448 88 522 118 528 196
   C 536 300 530 424 520 536
   C 510 636 466 706 380 726
   C 296 746 190 738 138 704
   C 88 672 64 600 68 496
   C 72 378 72 236 84 178
   C 92 136 116 114 152 92 Z`;

export default function Plate() {
  const r = rand(1730);

  /* 花綱。左上の貝から右下の渦へ。対称にしない */
  const GARLAND: Cubic = [[188, 150], [82, 296], [86, 512], [196, 622]];
  const GARLAND2: Cubic = [[196, 622], [252, 668], [318, 678], [372, 656]];
  const SPRAY: Cubic = [[430, 190], [502, 252], [508, 336], [470, 396]];
  const SPRAY2: Cubic = [[470, 396], [468, 456], [486, 528], [516, 578]];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ロココ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <radialGradient id={`${P}-wash`} cx="34%" cy="26%" r="86%">
          <stop offset="0%" stopColor={shift(PAPER, 0.5)} />
          <stop offset="60%" stopColor={PAPER} />
          <stop offset="100%" stopColor={shift(PINK, 0.42)} />
        </radialGradient>
        {/* 蔓棚。庭の格子を室内の壁に描くのがこの時代の趣向 */}
        <pattern id={`${P}-lattice`} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="34" stroke={MINT} strokeWidth="1.6" />
          <line x1="0" y1="0" x2="34" y2="0" stroke={MINT} strokeWidth="1.6" />
          <circle cx="0" cy="0" r="2" fill={MINT} />
        </pattern>
        <clipPath id={`${P}-panel`}>
          <path d={FRAME} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-wash)`} />

        {/* ── 板の中。格子を薄く敷く ─────────────────────────── */}
        <g clipPath={`url(#${P}-panel)`}>
          <path d={FRAME} fill={shift(PAPER, 0.34)} />
          <rect x="40" y="40" width="520" height="720" fill={`url(#${P}-lattice)`} opacity="0.3" />
          {/* 格子の上に淡い薄荷の帯。中央だけ明るく残して文字の場所を作る */}
          <ellipse cx="300" cy="424" rx="196" ry="120" fill={shift(PAPER, 0.8)} opacity="0.86" />
          <ellipse cx="300" cy="424" rx="196" ry="120" fill={PAPER} opacity="0.5" />
        </g>

        {/* ── 枠。金の細い二重線。線幅は最大でも3 ────────────────── */}
        <path d={FRAME} fill="none" stroke={shift(GOLD, -0.28)} strokeWidth="3" />
        <path d={FRAME} fill="none" stroke={shift(GOLD, 0.5)} strokeWidth="1" />
        <path
          d={FRAME}
          fill="none"
          stroke={GOLD}
          strokeWidth="0.9"
          transform="translate(0 0) scale(0.964) translate(11 15)"
          opacity="0.8"
        />

        {/* ── 花綱。左上から右下へ流す ───────────────────────── */}
        <path d={cubicD(GARLAND)} fill="none" stroke={shift(MINT, -0.34)} strokeWidth="2.6" />
        <path d={cubicD(GARLAND2)} fill="none" stroke={shift(MINT, -0.34)} strokeWidth="2.2" />
        <path d={cubicD(SPRAY)} fill="none" stroke={shift(MINT, -0.34)} strokeWidth="2" />
        <path d={cubicD(SPRAY2)} fill="none" stroke={shift(MINT, -0.34)} strokeWidth="1.6" />
        {along(GARLAND, 13).map((p, i) => (
          <g key={i}>
            {/* 葉。茎の左右へ交互に */}
            <ellipse
              cx={p.x}
              cy={p.y}
              rx="13"
              ry="5"
              transform={`rotate(${p.a + (i % 2 === 0 ? 44 : -44)} ${p.x} ${p.y})`}
              fill={MINT}
              stroke={shift(BROWN, 0.4)}
              strokeWidth="0.6"
            />
          </g>
        ))}
        {[GARLAND2, SPRAY, SPRAY2].flatMap((c, k) =>
          along(c, k === 0 ? 8 : 6).map((p, i) => (
            <ellipse
              key={`${k}-${i}`}
              cx={p.x}
              cy={p.y}
              rx={k === 0 ? 12 : 10}
              ry={k === 0 ? 5 : 4}
              transform={`rotate(${p.a + (i % 2 === 0 ? 46 : -46)} ${p.x} ${p.y})`}
              fill={MINT}
              stroke={shift(BROWN, 0.4)}
              strokeWidth="0.6"
            />
          )),
        )}
        {along(GARLAND, 8).map((p, i) => (
          <Flower
            key={i}
            x={p.x + (i % 2 === 0 ? 9 : -9)}
            y={p.y + (i % 3 === 0 ? -7 : 6)}
            r={i % 3 === 0 ? 15 : 11}
            rot={r(0, 72)}
            c={i % 3 === 1 ? shift(PINK, 0.3) : i % 3 === 2 ? PAPER : PINK}
            seed={100 + i}
          />
        ))}
        {[GARLAND2, SPRAY, SPRAY2].flatMap((c, k) =>
          along(c, k === 0 ? 5 : 4).map((p, i) => (
            <Flower
              key={`${k}-${i}`}
              x={p.x + (i % 2 === 0 ? 8 : -8)}
              y={p.y + (i % 2 === 0 ? -6 : 6)}
              r={i === 1 ? 14 : 10}
              rot={r(0, 72)}
              c={i % 3 === 0 ? PINK : i % 3 === 1 ? PAPER : shift(MINT, 0.3)}
              seed={200 + k * 10 + i}
            />
          )),
        )}

        {/* ── 貝。左上に大きく、右下に小さく。ここで非対称を決める ─── */}
        <Rocaille x={188} y={126} r={104} rot={-34} n={12} spread={186} seed={7} />
        <Rocaille x={410} y={674} r={62} rot={158} n={9} spread={168} seed={19} tone={0.12} />
        {/* 右上に極小の三つ目。二つだけだと対角線が強すぎる */}
        <Rocaille x={492} y={158} r={34} rot={62} n={7} spread={150} seed={31} tone={0.2} />

        {/* ── 渦。貝の付け根から伸ばす。細い金の糸 ─────────────── */}
        <g fill="none" stroke={GOLD} strokeLinecap="round">
          <path d="M262 176 C 322 190 352 154 336 124 C 322 98 288 106 294 132 C 298 148 320 146 320 132" strokeWidth="2.4" />
          <path d="M356 700 C 300 716 262 690 272 662 C 280 640 312 644 308 666 C 305 680 288 680 288 668" strokeWidth="2" />
          <path d="M100 560 C 76 600 96 646 136 650 C 166 653 178 626 158 614 C 144 606 130 620 142 628" strokeWidth="1.8" />
          <path d="M520 420 C 546 460 530 508 494 514" strokeWidth="1.4" opacity="0.8" />
        </g>

        {/* ── 蝶結び。垂れを左右で違う長さに ─────────────────── */}
        <g transform="translate(322 208) rotate(4)">
          <path d="M-6 0 C -34 -26 -70 -22 -72 2 C -74 24 -38 30 -6 8 Z" fill={PINK} stroke={shift(BROWN, 0.36)} strokeWidth="1" />
          <path d="M6 0 C 32 -24 64 -20 66 2 C 68 22 34 28 6 8 Z" fill={shift(PINK, 0.24)} stroke={shift(BROWN, 0.36)} strokeWidth="1" />
          <path d="M-6 6 C -22 44 -30 82 -22 118 L-6 112 C -10 78 -4 42 2 12 Z" fill={PINK} stroke={shift(BROWN, 0.36)} strokeWidth="1" />
          <path d="M6 6 C 24 36 34 60 30 84 L16 80 C 18 58 10 36 0 12 Z" fill={shift(PINK, 0.24)} stroke={shift(BROWN, 0.36)} strokeWidth="1" />
          <ellipse rx="9" ry="7" fill={GOLD} stroke={shift(BROWN, 0.3)} strokeWidth="0.8" />
        </g>

        {/* ── 題字。小さく、細く、広く ───────────────────────── */}
        <g>
          {/* 薄荷の座。桃と金だけだと甘さに寄りすぎたので、
              いちばん静かな中心にだけ緑を敷いて味を締める */}
          <ellipse cx="300" cy="440" rx="152" ry="86" fill={alpha(MINT, 0.3)} />
          <ellipse cx="300" cy="440" rx="152" ry="86" fill="none" stroke={shift(MINT, -0.3)} strokeWidth="0.8" opacity="0.7" />
          <line x1="196" y1="378" x2="404" y2="378" stroke={GOLD} strokeWidth="0.9" />
          <path d="M300 372 L306 378 L300 384 L294 378 Z" fill={GOLD} />
          <text
            x="300" y="424" textAnchor="middle" fill={BROWN}
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" letterSpacing="13"
          >
            ROCOCO
          </text>
          <text x="300" y="452" textAnchor="middle" fill={shift(BROWN, 0.24)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="16" fontStyle="italic">
            à la manière de Meissonnier
          </text>
          <text x="300" y="474" textAnchor="middle" fill={shift(BROWN, 0.34)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.4" letterSpacing="3">
            COQUILLE · ROCAILLE · ASYMÉTRIE
          </text>
          <line x1="226" y1="490" x2="374" y2="490" stroke={GOLD} strokeWidth="0.9" />
          <text x="300" y="512" textAnchor="middle" fill={shift(BROWN, 0.4)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" letterSpacing="3.4">
            PARIS · MDCCXXX
          </text>
        </g>

        {/* ── 枠の玉。等間隔に打つ。近くで見たときの細部 ──────────── */}
        {Array.from({ length: 46 }, (_, i) => {
          const a = (i / 46) * Math.PI * 2;
          const x = 300 + Math.sin(a) * (232 + Math.cos(a * 3) * 8);
          const y = 404 - Math.cos(a) * (334 + Math.sin(a * 2) * 10);
          return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.6 : 1.5} fill={GOLD} opacity="0.75" />;
        })}

        {/* 顔料のむら。パステルは必ず粒が残る */}
        <g fill={BROWN} opacity="0.07">
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={r(40, 560)} cy={r(40, 760)} r={r(0.6, 2)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.18" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
