/**
 * リキッド・デザイン。
 *
 * 有機的な流体。輪郭は硬いのに、形が数式でつながっている。
 * 近づいた2つの塊が首でつながり、離れると千切れて滴になる。
 *
 * ■ 隣のオーロラUIと同じ絵にしないために
 *   あちらは輪郭を持たない光。ぼかしっぱなしで、縁がどこにも無い。
 *   こちらは輪郭が硬い。ぼかしたあとに feColorMatrix でアルファの
 *   コントラストを立て直して、縁を切り直している（メタボール）。
 *   だから「溶けて混ざる」のに「輪郭がある」という、液体特有の
 *   矛盾した見え方になる。ぼかしただけで済ませると、ただの光の染みになる。
 *
 * ■ ここで作っている「らしさ」
 *   1. 首（ネック）。円を少しずつ離していくと、つながる → 首ができる →
 *      千切れる、の3段になる。下段にその3段を並べた。
 *      この首こそが表面張力の絵で、液体らしさの正体。
 *   2. グラデーションが塊ではなく「版面」に張ってあること
 *      （gradientUnits="userSpaceOnUse"）。だから何個の円で作っても
 *      1つの連続した body に見える。円ごとに塗ると継ぎ目が出る。
 *   3. 硬いハイライトが1点あること。艶のある液体には必ず鋭い写り込みが出る。
 *      柔らかい光だけだと、粘土（クレイ）になってしまう。
 */
import { ATLAS } from "@/lib/plate";

const P = "lq";
const DARK = "#0d0b1a";
const VIOLET = "#7a5cff";
const CYAN = "#00d4ff";
const PINK = "#ff5cae";
const LIGHT = "#f0eeff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', ui-monospace, monospace";

/** 流れの背骨。上から降りてきて溜まり、下で千切れる */
const FLOW: [number, number, number][] = [
  [402, 108, 24], [394, 148, 29], [380, 188, 34], [358, 226, 41],
  [328, 264, 51], [292, 300, 62], [252, 336, 73], [212, 374, 81],
  [180, 416, 78], [164, 458, 66], [170, 496, 51], [192, 528, 38],
  [222, 552, 28],
  // 脇の膨らみ。左右対称だと管に見える
  [272, 388, 46], [116, 436, 42], [246, 490, 38], [330, 250, 30],
];

/** 千切れて落ちる滴。間隔を広げるほど首が細くなり、やがて切れる */
const DROPS: [number, number, number][] = [
  [258, 578, 19], [300, 606, 13], [336, 628, 8.5], [364, 644, 5],
];

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="リキッド・デザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* メタボール。ぼかしてからアルファのコントラストを立て直す。
            これが無いと、ただのぼんやりした雲になる */}
        <filter id={`${P}-goo`} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" x="-120" y="-120" width="840" height="1040">
          <feGaussianBlur in="SourceGraphic" stdDeviation="17" result="b" />
          <feColorMatrix
            in="b" type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
          />
        </filter>
        <filter id={`${P}-goo-s`} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" x="-60" y="-60" width="720" height="920">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
        {/* 下段の3段見本用。小さいので半径も小さく */}
        <filter id={`${P}-goo-t`} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" x="0" y="640" width="600" height="140">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
        </filter>
        <filter id={`${P}-b50`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1200">
          <feGaussianBlur stdDeviation="50" />
        </filter>
        <filter id={`${P}-b8`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1200">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        <linearGradient id={`${P}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#050409" />
          <stop offset="0.6" stopColor="#0a0814" />
          <stop offset="1" stopColor={DARK} />
        </linearGradient>
        {/* 塊ではなく版面に張るグラデーション。継ぎ目を出さないための要 */}
        <linearGradient id={`${P}-body`} gradientUnits="userSpaceOnUse" x1="410" y1="90" x2="180" y2="640">
          <stop offset="0" stopColor={CYAN} />
          <stop offset="0.42" stopColor={VIOLET} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        <linearGradient id={`${P}-rim`} gradientUnits="userSpaceOnUse" x1="410" y1="90" x2="180" y2="640">
          <stop offset="0" stopColor={LIGHT} stopOpacity="0.9" />
          <stop offset="0.5" stopColor={LIGHT} stopOpacity="0.5" />
          <stop offset="1" stopColor={PINK} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${P}-ramp`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={CYAN} />
          <stop offset="0.5" stopColor={VIOLET} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-bg)`} />
        {/* 液体の裏の光。これが無いと黒地に貼った切り紙に見える */}
        <g filter={`url(#${P}-b50)`} opacity="0.28" style={{ mixBlendMode: "screen" }}>
          <ellipse cx="250" cy="400" rx="150" ry="190" fill={VIOLET} />
          <circle cx="392" cy="160" r="76" fill={CYAN} />
          <circle cx="210" cy="540" r="96" fill={PINK} />
        </g>

        {/* 縁の明かり。本体より一回り大きい同じ形を先に刷る */}
        <g filter={`url(#${P}-goo)`} opacity="0.85">
          {[...FLOW, ...DROPS].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r + 3.4} fill={`url(#${P}-rim)`} />
          ))}
        </g>
        {/* 本体 */}
        <g filter={`url(#${P}-goo)`}>
          {[...FLOW, ...DROPS].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={`url(#${P}-body)`} />
          ))}
        </g>
        {/* 上左の縁に沿う照り。
            ここは半径の取り方が難しかった。大きすぎると内側にもう1つ
            別の塊が浮いて見え、小さすぎると円が1個ずつ斑点として残る。
            隣の円と首がつながる大きさ（半径の 0.55 倍）が下限だった */}
        <g filter={`url(#${P}-goo-s)`} opacity="0.3" style={{ mixBlendMode: "screen" }}>
          {FLOW.map(([x, y, r], i) => (
            <circle key={i} cx={x - r * 0.3} cy={y - r * 0.36} r={r * 0.55} fill={LIGHT} />
          ))}
        </g>
        {/* 硬い写り込み。液体の艶はこの数点で決まる */}
        <g fill={LIGHT}>
          <ellipse cx="186" cy="382" rx="17" ry="11" transform="rotate(-28 186 382)" opacity="0.9" />
          <ellipse cx="146" cy="440" rx="9" ry="6" transform="rotate(-24 146 440)" opacity="0.62" />
          <ellipse cx="336" cy="248" rx="8" ry="5" transform="rotate(-34 336 248)" opacity="0.75" />
          <ellipse cx="386" cy="132" rx="6" ry="4" transform="rotate(-30 386 132)" opacity="0.7" />
          <circle cx="252" cy="571" r="4.4" opacity="0.8" />
          <circle cx="296" cy="601" r="3" opacity="0.7" />
        </g>

        {/* ── 題字。液体を避けて左上に置く ─────────────────────── */}
        <text x="46" y="112" fill={LIGHT} fontFamily={SANS} fontSize="58" fontWeight="200" letterSpacing="11">
          LIQUID
        </text>
        <text x="50" y="138" fill={LIGHT} opacity="0.56" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="5.6">
          DESIGN — SURFACE TENSION
        </text>

        {/* ── 下段。首ができて千切れるまでの3段 ─────────────────── */}
        <line x1="46" y1="656" x2="554" y2="656" stroke={LIGHT} strokeWidth="1" opacity="0.16" />
        <text x="46" y="682" fill={LIGHT} opacity="0.56" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2.8">
          HOW TWO BECOME ONE
        </text>

        {([
          [78, 26, "MERGED"],
          [214, 40, "NECKING"],
          [350, 56, "SPLIT"],
        ] as const).map(([x, gap, name]) => (
          <g key={name}>
            <g filter={`url(#${P}-goo-t)`}>
              <circle cx={x} cy="726" r="17" fill={`url(#${P}-ramp)`} />
              <circle cx={x + gap} cy="726" r="17" fill={`url(#${P}-ramp)`} />
            </g>
            <text
              x={x + gap / 2} y="768" textAnchor="middle" fill={LIGHT} opacity="0.5"
              fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.6"
            >
              {name}
            </text>
          </g>
        ))}

        {/* 刷り色。3色を版面いっぱいに引き伸ばして使っている */}
        <rect x="452" y="702" width="102" height="9" rx="4.5" fill={`url(#${P}-ramp)`} />
        <g fill={LIGHT} opacity="0.45" fontFamily={MONO} fontSize="7">
          <text x="452" y="724">#00D4FF</text>
          <text x="554" y="724" textAnchor="end">#FF5CAE</text>
          <text x="554" y="742" textAnchor="end">1 GRADIENT, 17 CIRCLES</text>
          <text x="554" y="760" textAnchor="end">blur → alpha contrast ×24</text>
        </g>

        {/* 粒。液体の版でも、刷り物としての地を1枚 */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.12"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
    </svg>
  );
}
