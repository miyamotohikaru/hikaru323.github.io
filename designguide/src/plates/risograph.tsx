/**
 * リゾグラフ。
 *
 * 理想科学の孔版印刷。1版1色。版ごとに紙を通し直すので必ずズレる。
 * インクは乾きが遅く、擦れて紙に伸びる。
 *
 * ■ ここで作っている「らしさ」
 *   1. 版が別の絵を持つこと。同じ絵を2色でずらすと、ただの影に見える。
 *      孔版の版下は「色分解」であって「複製」ではない。初稿でここを
 *      間違えて、山の輪郭にピンクの縁が付いただけの絵になった。
 *   2. 重なりが濃い紫に沈むこと（multiply）。蛍光ピンク×青の定番。
 *   3. 網の粗さが場所で変わること。孔版はベタが出ない代わり、
 *      ベタに近い密な網と、薄いアミとを刷り分けて濃淡を作る。
 *
 * ■ 歪みフィルタ（ATLAS.rough）はここでは使わない
 *   網を敷いたあとに変位をかけると、点が崩れて落書きになる（2稿目でそうなった）。
 *   孔版らしさは「点」と「紙」と「版ズレ」で出る。輪郭を揺らす必要はない。
 */
import { ATLAS } from "@/lib/plate";

const P = "riso";
const PAPER = "#f4f1e4";
const PINK = "#ff48b0";
const BLUE = "#0a5fd8";
const INK = "#1a1a1a";

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="リゾグラフ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>

        {/* ベタに近い網。9割方うまる */}
        <pattern id={`${P}-solid`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <rect width="5" height="5" fill="#000" />
          <circle cx="2.5" cy="2.5" r="1.15" fill="#fff" />
        </pattern>
        {/* 中間のアミ */}
        <pattern id={`${P}-mid`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <rect width="6" height="6" fill="#fff" />
          <circle cx="3" cy="3" r="2.25" fill="#000" />
        </pattern>
        {/* 薄いアミ */}
        <pattern id={`${P}-tint`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <rect width="7" height="7" fill="#fff" />
          <circle cx="3.5" cy="3.5" r="1.5" fill="#000" />
        </pattern>

        <mask id={`${P}-m-solid`}><rect width="600" height="800" fill={`url(#${P}-solid)`} /></mask>
        <mask id={`${P}-m-mid`}><rect width="600" height="800" fill={`url(#${P}-mid)`} /></mask>
        <mask id={`${P}-m-tint`}><rect width="600" height="800" fill={`url(#${P}-tint)`} /></mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── ピンク版。左上へ3px。先に刷る ─────────────────────── */}
        <g transform="translate(-3 -3)" fill={PINK} style={{ mixBlendMode: "multiply" }}>
          {/* 大きな陽 */}
          <circle cx="348" cy="376" r="182" mask={`url(#${P}-m-mid)`} opacity="0.95" />
          {/* 陽の芯。網を密にして濃く */}
          <circle cx="348" cy="376" r="96" mask={`url(#${P}-m-solid)`} opacity="0.85" />
          {/* 散らした点。孔版のゴミ・インクの飛び */}
          {[[92, 262, 9], [128, 318, 5], [536, 214, 7], [500, 168, 4], [72, 470, 5], [548, 520, 4]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity="0.8" />
          ))}
        </g>

        {/* ── 青版。右下へ3px。陽に食い込ませて紫を作る ───────────── */}
        <g transform="translate(3 3)" fill={BLUE} style={{ mixBlendMode: "multiply" }}>
          {/* 手前のなだらかな丘。陽の下半分と重なる */}
          <path
            d="M-20 742 L-20 512 Q 140 430 318 486 Q 476 536 620 470 L620 742 Z"
            mask={`url(#${P}-m-solid)`}
            opacity="0.9"
          />
          {/* 丘の上に薄いアミをもう1枚。奥行きが出る */}
          <path
            d="M-20 742 L-20 560 Q 160 500 330 546 Q 480 588 620 540 L620 742 Z"
            mask={`url(#${P}-m-tint)`}
            opacity="0.8"
          />
          {/* 左上の輪。線だけの円 */}
          <circle cx="152" cy="252" r="74" fill="none" stroke={BLUE} strokeWidth="16" mask={`url(#${P}-m-mid)`} opacity="0.9" />
          {/* 右へ抜ける細い帯 */}
          <rect x="392" y="212" width="228" height="12" mask={`url(#${P}-m-solid)`} opacity="0.9" />
        </g>

        {/* ── 文字。青版→ピンク版の順で2度刷る ───────────────────── */}
        <g style={{ mixBlendMode: "multiply" }}>
          <text
            x="55" y="120" fill={BLUE}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="86" fontWeight="800" letterSpacing="-4"
            opacity="0.92" transform="translate(4 3)"
          >
            RISO
          </text>
          <text
            x="55" y="120" fill={PINK}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="86" fontWeight="800" letterSpacing="-4"
            opacity="0.9"
          >
            RISO
          </text>
        </g>
        <text
          x="57" y="146" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10" fontWeight="600" letterSpacing="3.6" opacity="0.6"
        >
          2 COLOUR — FLUORESCENT PINK / BLUE
        </text>
        {/* 版面の地。丘は742で止め、下に紙を残して文字を置く */}
        <text
          x="55" y="778" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10" fontWeight="600" letterSpacing="3.6" opacity="0.6"
        >
          MISREGISTERED BY 3PX — ON PURPOSE
        </text>

        {/* ざら紙。孔版は上質紙には刷らない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.28"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
