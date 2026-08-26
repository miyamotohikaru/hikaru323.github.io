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
 *
 * ■ 前稿の失敗（検分でここを組み直した）
 *   前稿は円を17個、一本の背骨に沿って並べていた。
 *   メタボールとしては正しく融合するのだが、細長い管になってしまい、
 *   出来上がった絵はアメーバか彗星にしか見えなかった。
 *   液体らしさは「太い塊どうしが噛み合ったときに出る凹んだ隅（フィレット）」
 *   にある。だから大きな葉を5枚、互いに 15〜40 だけ食い込ませて配置し、
 *   境目ごとに凹みが立つようにした。そこから滴が首を細めて落ちる。
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

/**
 * 塊。大きな葉を5枚、中心の1枚に 15〜40 だけ食い込ませる。
 * 食い込ませる量がここより浅いと離れ、深いと1個の丸になる。
 * この幅のときだけ、境目に液体特有の凹んだ隅が立つ。
 */
const FLOW: [number, number, number][] = [
  [252, 330, 104], // 中心の主塊
  [372, 254, 66], // 右上
  [386, 420, 72], // 右下
  [148, 402, 62], // 左下
  [172, 246, 48], // 左上
  [300, 470, 58], // 下。ここから滴が落ちる
];

/**
 * 千切れて落ちる滴。上から順に
 *   つながっている → 首が細る → 切れた、の3段になるよう間隔を開けてある。
 */
const DROPS: [number, number, number][] = [
  [318, 552, 34], [340, 612, 19], [358, 656, 10], [372, 688, 5.5],
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
        <linearGradient id={`${P}-body`} gradientUnits="userSpaceOnUse" x1="392" y1="196" x2="168" y2="600">
          <stop offset="0" stopColor={CYAN} />
          <stop offset="0.42" stopColor={VIOLET} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        <linearGradient id={`${P}-rim`} gradientUnits="userSpaceOnUse" x1="392" y1="196" x2="168" y2="600">
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
          <ellipse cx="262" cy="352" rx="190" ry="170" fill={VIOLET} />
          <circle cx="368" cy="238" r="92" fill={CYAN} />
          <circle cx="322" cy="536" r="96" fill={PINK} />
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
            円ごとに小さい光を置くと、塊の中に丸い斑点が浮いて、
            何個の円で出来ているか数えられてしまった（検分で指摘）。
            そこで「本体と同じ輪郭を 0.88 倍に縮めて左上へずらした一枚」に替えた。
            外周と内側の差がそのまま光の帯になるので、continuous body のまま照る */}
        <g transform="translate(18.6 25.6) scale(0.88)">
          <g filter={`url(#${P}-goo)`} opacity="0.2" style={{ mixBlendMode: "screen" }}>
            {[...FLOW, ...DROPS].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={LIGHT} />
            ))}
          </g>
        </g>
        {/* 硬い写り込み。液体の艶はこの数点で決まる */}
        <g fill={LIGHT}>
          <ellipse cx="206" cy="284" rx="21" ry="13" transform="rotate(-28 206 284)" opacity="0.92" />
          <ellipse cx="150" cy="226" rx="10" ry="6" transform="rotate(-26 150 226)" opacity="0.7" />
          <ellipse cx="348" cy="222" rx="12" ry="7.5" transform="rotate(-32 348 222)" opacity="0.8" />
          <ellipse cx="362" cy="390" rx="10" ry="6.5" transform="rotate(-30 362 390)" opacity="0.72" />
          <ellipse cx="128" cy="378" rx="8" ry="5" transform="rotate(-24 128 378)" opacity="0.6" />
          <circle cx="308" cy="536" r="5" opacity="0.85" />
          <circle cx="332" cy="600" r="3.2" opacity="0.72" />
        </g>

        {/* 首を指す註。右上が空くので、ここで版面を締める。
            液体の「らしさ」は首の細さで決まる、という一番大事な数字 */}
        <g stroke={LIGHT} strokeWidth="0.8" opacity="0.45" fill="none">
          <path d="M 344 296 L 452 236 L 542 236" />
          <circle cx="344" cy="296" r="2.6" fill={LIGHT} stroke="none" />
        </g>
        <text x="542" y="228" textAnchor="end" fill={LIGHT} opacity="0.72" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="2.2">
          NECK
        </text>
        <text x="542" y="252" textAnchor="end" fill={LIGHT} opacity="0.45" fontFamily={MONO} fontSize="7.5">
          fillet r ≈ 0.18 R
        </text>

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
          <text x="554" y="742" textAnchor="end">1 GRADIENT, 10 CIRCLES</text>
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
