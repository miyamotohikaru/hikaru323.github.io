/**
 * フラットデザイン。
 *
 * iOS 7（2013）の割り切り。奥行きの比喩を全部捨てた。
 * 影・面取り・光沢・グラデーション・質感のどれも使わず、
 * 純色の面と、円・矩形・三角という単純な図形だけで絵を作る。
 *
 * ■ ここで作っている「らしさ」
 *   1. 階調がゼロであること。色は一段しかない。遠くの丘と手前の丘は
 *      「暗くした同じ緑」ではなく、別々に決めた2つの純色として置く。
 *      絵の中では opacity も使わない。波の白も海の白も別々の実色。
 *   2. 重なりが「重ね順」だけで表されること。半透明も影も使わない。
 *      雲は太陽の上に白ベタで乗るだけ。それで前後が分かる。
 *   3. 形が単純な原型に還元されること。雲＝円3つ＋角丸矩形、
 *      波＝角丸矩形、帆＝三角形。だから下の凡例に原型を並べた。
 *
 * ■ 初稿・2稿目の失敗
 *   ・海に太陽の映り込みをグラデーションで入れたら、その一箇所だけが
 *     フラットでなくなって全体が嘘になった。段を3つに割った矩形に直した。
 *     影ゼロは「影を薄くする」ではなく「1つも置かない」という意味。
 *   ・丘を同じ高さの三角で3つ並べたら、版面が左右対称になって
 *     絵が止まった。左に大きな塊、中央を低く落とし、右で受ける形に組み直した。
 *   ・下の帯で題字の副題と色票がぶつかった。左右2列に分けて縦位置をずらした。
 */
import { ATLAS, shift } from "@/lib/plate";

const P = "fd";
const PAPER = "#f5f6f8";
const BLUE = "#2d9cdb";
const RED = "#eb5757";
const YELLOW = "#f2c94c";
const GREEN = "#27ae60";

/* 派生色。5色から作った純色で、階調ではなく「別の色」として置く */
const SKY = shift(BLUE, 0.8);
const SEA = shift(BLUE, -0.14);
const FOAM = shift(SEA, 0.66); // 波。海に白を透かすのではなく、実色を1つ足す
const HILL_FAR = shift(GREEN, 0.34);
const HILL_NEAR = GREEN;
const HILL_DARK = shift(GREEN, -0.32);
const DARK = shift(BLUE, -0.7); // 文字と船体。青の家族から外れない濃色
const WHITE = "#ffffff";
const RULE = "#dfe3e8";

const HORIZON = 462; // 水平線
const BAND = 636; // ここから下が凡例の帯

/** フラットな雲。円3つと角丸矩形の合成。輪郭線も影もない */
const Cloud = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={WHITE}>
    <rect x="-52" y="-14" width="104" height="28" rx="14" />
    <circle cx="-24" cy="-16" r="24" />
    <circle cx="14" cy="-23" r="33" />
    <circle cx="45" cy="-6" r="20" />
  </g>
);

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="フラットデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 海の内側だけを切る。波が水平線と帯をはみ出さないように */}
        <clipPath id={`${P}-sea`}>
          <rect x="0" y={HORIZON} width="600" height={BAND - HORIZON} />
        </clipPath>
        <clipPath id={`${P}-sky`}>
          <rect x="0" y="0" width="600" height={HORIZON} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 空。純色1枚 ────────────────────────────────────── */}
        <g clipPath={`url(#${P}-sky)`}>
          <rect x="0" y="0" width="600" height={HORIZON} fill={SKY} />

          {/* 太陽。右上の角で断ち切る。版面の重心を対角に振る */}
          <circle cx="512" cy="112" r="176" fill={YELLOW} />

          {/* 雲。太陽の上に白ベタで乗せる。前後は重ね順だけで示す */}
          <Cloud x={404} y={236} s={1.18} />
          <Cloud x={104} y={104} s={0.7} />

          {/* 遠い丘。左に大きな塊、中央を低く落として空を抜く */}
          <polygon points={`-40,${HORIZON} 128,236 300,${HORIZON}`} fill={HILL_FAR} />
          <polygon points={`232,${HORIZON} 346,368 452,${HORIZON}`} fill={HILL_FAR} />

          {/* 手前の丘。別の純色。暗くした遠景ではない */}
          <polygon points={`-40,${HORIZON} 74,318 190,${HORIZON}`} fill={HILL_NEAR} />
          <polygon points={`386,${HORIZON} 528,300 660,${HORIZON}`} fill={HILL_NEAR} />
          {/* 稜線の陰にあたる面も、階調ではなく3つ目の純色で置く */}
          <polygon points={`74,318 190,${HORIZON} 132,${HORIZON}`} fill={HILL_DARK} />
          <polygon points={`528,300 660,${HORIZON} 596,${HORIZON}`} fill={HILL_DARK} />
        </g>

        {/* ── 海 ────────────────────────────────────────────── */}
        <rect x="0" y={HORIZON} width="600" height={BAND - HORIZON} fill={SEA} />

        <g clipPath={`url(#${P}-sea)`}>
          {/* 波。角丸矩形の列。太陽の映り込みが立つ右側は空けておく */}
          <g fill={FOAM}>
            {[
              [36, 486, 46], [116, 500, 26], [214, 520, 38], [300, 546, 22],
              [58, 552, 58], [162, 568, 30], [352, 494, 30], [22, 600, 36],
              [116, 612, 50], [252, 594, 28], [340, 618, 44], [438, 592, 26],
              [512, 610, 40], [196, 622, 34], [396, 560, 20], [512, 550, 30],
            ].map(([x, y, w], i) => (
              <rect key={i} x={x} y={y} width={w} height="7" rx="3.5" />
            ))}
          </g>

          {/* 太陽の映り込み。グラデーションが使えないので3段の矩形で表す。
              太陽の真下に軸を合わせないと、無関係な棒に見える */}
          <g fill={YELLOW}>
            <rect x="470" y={HORIZON + 16} width="86" height="11" rx="5.5" />
            <rect x="484" y={HORIZON + 44} width="58" height="11" rx="5.5" />
            <rect x="496" y={HORIZON + 74} width="34" height="11" rx="5.5" />
          </g>

          {/* 船。赤はこの一点だけ。左三分の一に置いて太陽と対角で釣り合わせる */}
          <g transform="translate(186 546) scale(1.34)">
            <rect x="-1.6" y="-62" width="3.2" height="64" fill={DARK} />
            <polygon points="5,-60 50,-4 5,-4" fill={RED} />
            <polygon points="-7,-48 -37,-4 -7,-4" fill={WHITE} />
            <path d="M-50 0 H54 L38 26 H-34 Z" fill={DARK} />
          </g>
        </g>

        {/* ── 凡例の帯。ここだけ地の紙にもどす ───────────────── */}
        <rect x="0" y={BAND} width="600" height={800 - BAND} fill={PAPER} />

        {/* 左の列。題字は iOS 7 の極細ウェイトを大きく組む */}
        <text
          x="44" y={BAND + 84}
          fill={DARK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="72" fontWeight="200" letterSpacing="9"
        >
          FLAT
        </text>
        <text
          x="46" y={BAND + 116}
          fill={DARK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="8.5" fontWeight="600" letterSpacing="2.5" opacity="0.6"
        >
          NO SHADOW · NO GRADIENT · 2013
        </text>

        {/* 右の列。上に原型、下に刷り色。縦位置を左とずらして衝突を避ける */}
        <line x1="340" y1={BAND + 16} x2="340" y2={BAND + 140} stroke={RULE} strokeWidth="1" />

        <g transform={`translate(370 ${BAND + 22})`}>
          {/* 絵に使った図形はこの4つだけ、という註 */}
          <circle cx="16" cy="16" r="16" fill={BLUE} />
          <rect x="52" y="0" width="32" height="32" rx="9" fill={RED} />
          <polygon points="120,0 136,32 104,32" fill={YELLOW} />
          <rect x="156" y="0" width="32" height="32" fill={GREEN} />
          <g
            fill={DARK} opacity="0.5"
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="7" fontWeight="600" letterSpacing="1.2"
          >
            <text x="16" y="46" textAnchor="middle">CIRCLE</text>
            <text x="68" y="46" textAnchor="middle">ROUND</text>
            <text x="120" y="46" textAnchor="middle">TRIANGLE</text>
            <text x="172" y="46" textAnchor="middle">SQUARE</text>
          </g>
        </g>

        {/* 色票。刷り色をそのまま並べる。混色も網も使っていない証拠 */}
        <g transform={`translate(370 ${BAND + 96})`}>
          {[PAPER, SKY, SEA, GREEN, YELLOW, RED].map((c, i) => (
            <rect
              key={i} x={i * 32} y="0" width="24" height="11" fill={c}
              stroke={c === PAPER ? RULE : "none"}
            />
          ))}
          <text
            x="0" y="26"
            fill={DARK} opacity="0.5"
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="7" fontWeight="600" letterSpacing="1.3"
          >
            SOLID FILLS ONLY — 0 TINTS, 0 ALPHA
          </text>
        </g>

        {/* 紙の目。刷り物としての最低限。絵の平坦さは壊さない薄さで */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.09"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
