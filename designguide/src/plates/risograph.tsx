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
 *   4. **重なりそのものを主役にすること。** 検分で「青い丘の上のピンクの丸」
 *      ＝図柄として凡庸、と指摘された。孔版の楽しさは2版が交差した所に
 *      third colour が生まれる点にあるので、大きな2円を深く重ね、
 *      その交わり（紫のレンズ）を版面の中心に据えた。
 *      一度、羽状の葉を何枚も交差させる案を試したが、小葉が潰れて
 *      藪に見え、縮小するとただの染みになったので捨てた。
 *      孔版は形が単純なほど強い。
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
          {/* 左の大円。中間のアミ。芯だけ密にして厚みを出す */}
          <circle cx="238" cy="352" r="176" mask={`url(#${P}-m-mid)`} opacity="0.95" />
          <circle cx="238" cy="352" r="92" mask={`url(#${P}-m-solid)`} opacity="0.72" />
          {/* 版面の下側にもう一度ピンクを効かせる細い帯 */}
          <rect x="-20" y="712" width="640" height="22" mask={`url(#${P}-m-tint)`} opacity="0.75" />
          {/* 散らした点。孔版のゴミ・インクの飛び */}
          {[[496, 186, 9], [538, 232, 5], [86, 610, 6], [58, 208, 5], [418, 736, 4]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity="0.8" />
          ))}
        </g>

        {/* ── 青版。右下へ3px。ピンクの円に深く食い込ませ、
               交わりを紫のレンズにする。ここが版面の主役 ─────────── */}
        <g transform="translate(3 3)" fill={BLUE} style={{ mixBlendMode: "multiply" }}>
          {/* 奥の丘。2円を地面に着地させる */}
          <path
            d="M-20 800 L-20 664 Q 160 614 340 650 Q 490 680 620 632 L620 800 Z"
            mask={`url(#${P}-m-tint)`}
            opacity="0.85"
          />
          {/* 右の大円。半径はピンクと同じ。中心距離は半径の1.1倍まで寄せる */}
          <circle cx="400" cy="404" r="176" mask={`url(#${P}-m-mid)`} opacity="0.92" />
          <circle cx="400" cy="404" r="92" mask={`url(#${P}-m-solid)`} opacity="0.7" />
          {/* 右へ抜ける細い帯。版面の上を横に締める */}
          <rect x="404" y="176" width="216" height="11" mask={`url(#${P}-m-solid)`} opacity="0.9" />
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
        {/* 註は丘（青ベタ）の上に乗る。孔版は白を刷れないので、
            紙の色で抜いたように見せる */}
        <text
          x="55" y="768" fill={PAPER}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10.5" fontWeight="700" letterSpacing="3.4" opacity="0.92"
        >
          MISREGISTERED BY 3PX — OVERPRINT MAKES THE THIRD COLOUR
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
