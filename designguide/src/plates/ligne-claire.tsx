/**
 * リーニュ・クレール（明晰な線）。
 *
 * エルジェのタンタン、そこから出たベルギー＝オランダの流儀。
 * 名前のとおり「線」の様式なので、絵の作り方そのものが規約になっている。
 *
 * ■ ここで作っている「らしさ」
 *   1. 線の太さが1種類しかない。近くの車も遠くの家も同じ太さで描く。
 *      だからこの図版では stroke-width を親の <g> に一度だけ置き、
 *      以下すべてに継承させている。車を scale で拡大すると線まで太るので、
 *      拡大縮小は使わず、最初から実寸で描いた。ここが技法の核心。
 *   2. 影が無い。落ち影も、陰影も、グラデーションも一切置かない。
 *      立体感は「輪郭」と「色面の切り分け」だけで作る。
 *      車体に一段暗い面を1枚でも足した瞬間に、これは別の様式になる。
 *   3. 遠景も近景も等しく克明。空気遠近を使わない。
 *      遠くの家の窓も、手前の車の把手も、同じだけ描き込む。
 *   4. 色は平面で、彩度は中くらい。原色でベタ塗りすると絵本になる。
 *
 * ■ 紙目もほとんど掛けない
 *   この様式はオフセットの均一な面が身上なので、質感で誤魔化さない。
 */
import { ATLAS } from "@/lib/plate";

const P = "lc";
const PAPER = "#f2ece0";
const INK = "#1a1a1a";
const RED = "#d94f2b";
const BLUE = "#2f7fc4";
const YELLOW = "#f2c14e";

/* 5色から作った面の色。別の色相は足さない */
const SKY = "#8fbfe4";
const FAR = "#6b9fcd";
const HILL = "#d9b464";
const FIELD = "#e2cd91";
const ROAD = "#b3aca0";
const GLASS = "#bcdcf2";

/** 唯一の線の太さ。ここを変えると絵の全部が同時に変わる */
const LW = 2.8;

/* 額（コマ）の内側 */
const L = 44;
const R = 556;
const T = 64;
const B = 636;

/** 家。屋根・壁・窓・煙突。遠くても手を抜かない */
const House = ({ x, y, w, h, roof }: { x: number; y: number; w: number; h: number; roof: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={PAPER} />
    <path d={`M ${x - 5},${y} L ${x + w / 2},${y - h * 0.55} L ${x + w + 5},${y} Z`} fill={roof} />
    <rect x={x + w * 0.18} y={y + h * 0.22} width={w * 0.24} height={h * 0.3} fill={GLASS} />
    <rect x={x + w * 0.58} y={y + h * 0.22} width={w * 0.24} height={h * 0.3} fill={GLASS} />
    <rect x={x + w * 0.38} y={y + h * 0.6} width={w * 0.24} height={h * 0.4} fill={INK} />
    <rect x={x + w * 0.62} y={y - h * 0.34} width={w * 0.14} height={h * 0.3} fill={PAPER} />
  </g>
);

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="リーニュ・クレール様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-panel`}><rect x={L} y={T} width={R - L} height={B - T} /></clipPath>
        <clipPath id={`${P}-win`}><path d="M 6,-44 L 6,-78 L 44,-77 C 70,-72 88,-58 100,-44 Z" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 線の太さはここで一度だけ決める。以下すべてが継承する */}
        <g stroke={INK} strokeWidth={LW} strokeLinejoin="round" strokeLinecap="round">
          <g clipPath={`url(#${P}-panel)`}>
            {/* 空。単色。雲にも影は無い */}
            <rect x={L - 4} y={T - 4} width={R - L + 8} height={470 - T + 4} fill={SKY} stroke="none" />
            <circle cx="474" cy="136" r="44" fill={YELLOW} />
            <g fill={PAPER}>
              <path d="M 96,158 C 96,140 112,128 130,132 C 138,116 164,114 174,128 C 192,124 206,138 202,154 C 198,166 184,170 168,168 L 112,168 C 102,168 96,164 96,158 Z" />
              <path d="M 306,106 C 306,92 320,84 332,88 C 340,76 360,76 366,88 C 380,86 390,98 386,110 C 382,120 370,122 358,120 L 320,120 C 312,120 306,114 306,106 Z" />
              <path d="M 402,232 C 402,220 414,212 426,216 C 434,206 450,208 454,218 C 466,218 472,228 468,238 L 412,240 C 404,240 402,236 402,232 Z" />
            </g>

            {/* 遠い山。空気遠近を使わないので、線は手前と同じ太さ */}
            <path d={`M ${L - 6},404 L 122,330 L 176,372 L 250,300 L 322,368 L 384,326 L 452,382 L ${R + 6},344 L ${R + 6},478 L ${L - 6},478 Z`} fill={FAR} />
            <g fill={PAPER}>
              <path d="M 250,300 L 274,322 L 260,326 L 246,318 L 236,324 Z" />
              <path d="M 122,330 L 142,348 L 130,350 L 120,344 L 110,348 Z" />
            </g>
            {/* 手前の丘 */}
            <path d={`M ${L - 6},450 C 130,404 210,432 300,420 C 384,410 470,432 ${R + 6},408 L ${R + 6},524 L ${L - 6},524 Z`} fill={HILL} />
            {/* 丘の上の町 */}
            <House x={96} y={396} w={44} h={38} roof={RED} />
            <House x={150} y={404} w={34} h={30} roof={BLUE} />
            <House x={392} y={396} w={40} h={34} roof={RED} />
            <House x={442} y={404} w={30} h={28} roof={YELLOW} />
            {/* 糸杉。丘に3本 */}
            {[228, 258, 470].map((x, i) => (
              <g key={i}>
                <path d={`M ${x},${430 - i * 4} C ${x - 13},${430 - i * 4} ${x - 11},${386 - i * 6} ${x},${374 - i * 8} C ${x + 11},${386 - i * 6} ${x + 13},${430 - i * 4} ${x},${430 - i * 4} Z`} fill="#7f9a55" />
                <line x1={x} y1={430 - i * 4} x2={x} y2={442 - i * 4} />
              </g>
            ))}

            {/* 畑 */}
            <rect x={L - 6} y="500" width={R - L + 12} height="26" fill={FIELD} />
            {/* 道 */}
            <rect x={L - 6} y="524" width={R - L + 12} height={B - 524 + 6} fill={ROAD} />
            <line x1={L - 6} y1="524" x2={R + 6} y2="524" />
            {/* 中央線。白の破線 */}
            <g stroke={PAPER} strokeWidth={LW * 1.6}>
              {[60, 130, 200, 270, 340, 410, 480, 550].map((x) => (
                <line key={x} x1={x} y1="548" x2={x + 34} y2="548" />
              ))}
            </g>
            {/* 路肩の柵。遠近は付けるが、線は細くしない */}
            <g>
              {[70, 150, 230, 310, 390, 470, 546].map((x) => (
                <line key={x} x1={x} y1="500" x2={x} y2="518" />
              ))}
              <line x1={L - 6} y1="504" x2={R + 6} y2="504" />
            </g>

            {/* ── 車。拡大せず実寸で描く。線を太らせないため ─────── */}
            <g transform="translate(300 556)">
              {/* 車体 */}
              <path
                d="M -186,-2 C -186,-22 -176,-34 -156,-36 L -102,-40 C -82,-70 -58,-84 -16,-86 L 44,-86 C 76,-84 96,-66 112,-40 L 158,-34 C 178,-32 188,-20 188,-2 L 188,14 L -186,14 Z"
                fill={RED}
              />
              {/* 窓。硝子は一段明るい青。ここに影は置かない */}
              <path d="M -90,-44 L -64,-74 L -6,-77 L -6,-44 Z" fill={GLASS} />
              <path d="M 6,-44 L 6,-78 L 44,-77 C 70,-72 88,-58 100,-44 Z" fill={GLASS} />
              {/* 運転手。硝子の内側に収める */}
              <g clipPath={`url(#${P}-win)`}>
                <circle cx="42" cy="-60" r="15" fill={PAPER} />
                <path d="M 30,-66 C 32,-78 52,-80 55,-68 C 50,-72 36,-72 30,-66 Z" fill={INK} />
                <path d="M 24,-46 C 26,-56 34,-60 42,-60 C 50,-60 58,-56 60,-46 Z" fill={BLUE} />
                <circle cx="47" cy="-60" r="1.8" fill={INK} stroke="none" />
                <path d="M 52,-56 C 55,-54 58,-54 60,-56" />
              </g>
              {/* 扉の切れ目と把手 */}
              <path d="M -6,-44 L -6,10" />
              <path d="M -96,-40 C -92,-14 -92,-2 -94,10" />
              <rect x="-40" y="-32" width="24" height="6" rx="3" fill={PAPER} />
              {/* 前照灯・格子・緩衝器 */}
              <circle cx="162" cy="-26" r="13" fill={YELLOW} />
              <path d="M 172,-8 L 186,-8 M 172,0 L 186,0 M 172,8 L 184,8" />
              <rect x="176" y="-2" width="20" height="10" rx="5" fill={PAPER} />
              <rect x="-196" y="-4" width="18" height="10" rx="5" fill={PAPER} />
              <circle cx="-166" cy="-22" r="8" fill={YELLOW} />
              {/* 反射鏡と昇降板 */}
              <path d="M 106,-44 L 118,-54" />
              <circle cx="121" cy="-58" r="6" fill={PAPER} />
              <rect x="-100" y="6" width="96" height="8" fill={INK} />
              {/* 車輪。輪心はきちんと描く。遠近で省略しない */}
              {[-112, 108].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="14" r="34" fill={INK} />
                  <circle cx={x} cy="14" r="16" fill={PAPER} />
                  <circle cx={x} cy="14" r="4.4" fill={INK} />
                  <g strokeWidth={LW * 0.7}>
                    {[0, 60, 120].map((a) => (
                      <line
                        key={a}
                        x1={x + Math.cos((a * Math.PI) / 180) * 14}
                        y1={14 + Math.sin((a * Math.PI) / 180) * 14}
                        x2={x - Math.cos((a * Math.PI) / 180) * 14}
                        y2={14 - Math.sin((a * Math.PI) / 180) * 14}
                      />
                    ))}
                  </g>
                </g>
              ))}
              {/* 泥除けの弧 */}
              <path d="M -152,4 C -150,-24 -132,-40 -112,-40 C -92,-40 -74,-24 -72,4" fill="none" />
              <path d="M 68,4 C 70,-24 88,-40 108,-40 C 128,-40 146,-24 148,4" fill="none" />
            </g>

            {/* 吹き出し。しっぽは運転手へ向ける */}
            <path
              d="M 322,352 C 322,332 342,318 372,318 L 470,318 C 500,318 518,332 518,352 C 518,374 500,390 470,390 L 372,390 C 342,390 322,374 322,352 Z"
              fill={PAPER}
            />
            <path d="M 352,382 L 344,466 L 390,382 Z" fill={PAPER} stroke="none" />
            <path d="M 352,382 L 344,466 L 390,382" fill="none" />
            <text
              x="420" y="348" textAnchor="middle" fill={INK} stroke="none"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="17" fontWeight="700" letterSpacing="0.6"
            >
              TOUT EST NET,
            </text>
            <text
              x="420" y="370" textAnchor="middle" fill={INK} stroke="none"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="17" fontWeight="700" letterSpacing="0.6"
            >
              MÊME LE FOND !
            </text>

            {/* 遠くの飛行機。遠いからといって線を細くしない。
                空気遠近を使わないのがこの様式の約束 */}
            <g transform="translate(196 250) rotate(-7)">
              <path d="M 4,-2 L -34,-34 L -20,-34 L 22,-4 Z" fill={RED} />
              <path d="M -52,-2 L -66,-28 L -56,-28 L -42,-4 Z" fill={RED} />
              <path d="M -52,2 L -76,8 L -60,13 L -44,6 Z" fill={RED} />
              <path d="M -52,0 C -52,-8 -38,-13 -6,-13 L 34,-13 C 50,-13 58,-7 60,0 C 58,6 50,11 34,11 L -6,11 C -38,11 -52,8 -52,0 Z" fill={PAPER} />
              <g fill={GLASS} strokeWidth={LW * 0.6}>
                {[-30, -18, -6, 6, 18].map((x) => <circle key={x} cx={x} cy="-2" r="3" />)}
              </g>
              <rect x="-14" y="10" width="20" height="9" rx="4.5" fill={BLUE} />
            </g>

            {/* 説明の箱。BD の作法 */}
            <rect x="58" y="78" width="186" height="50" fill={PAPER} />
            <text x="70" y="99" fill={INK} stroke="none"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="12.5" fontWeight="700" letterSpacing="1.4">
              CHAPITRE III —
            </text>
            <text x="70" y="118" fill={INK} stroke="none"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="12.5" fontWeight="700" letterSpacing="1.4">
              LA ROUTE DU SUD
            </text>
          </g>

          {/* コマの枠。中の線と同じ太さで引く */}
          <rect x={L} y={T} width={R - L} height={B - T} fill="none" />

          {/* 色見本。平らな面が5つあるだけ、という宣言 */}
          <g>
            {[PAPER, INK, RED, BLUE, YELLOW].map((c, i) => (
              <rect key={i} x={44 + i * 46} y={716} width="38" height="26" fill={c} />
            ))}
          </g>
        </g>

        <text
          x="44" y="694" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="47" fontWeight="700" letterSpacing="2"
        >
          LIGNE CLAIRE
        </text>
        <text
          x="286" y="736" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="11" fontWeight="600" letterSpacing="2.6" opacity="0.8"
        >
          UNE SEULE ÉPAISSEUR DE TRAIT
        </text>
        <text
          x="286" y="754" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="11" fontWeight="600" letterSpacing="2.6" opacity="0.8"
        >
          AUCUNE OMBRE — COULEURS PLATES
        </text>
        <text
          x="556" y="778" textAnchor="end" fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10" fontWeight="600" letterSpacing="3.4" opacity="0.55"
        >
          BRUXELLES
        </text>

        {/* 紙目はごく薄く。均一な面が身上なので質感で誤魔化さない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
