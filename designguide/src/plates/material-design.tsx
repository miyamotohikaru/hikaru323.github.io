/**
 * マテリアルデザイン。
 *
 * Google、2014。画面の中に「紙（material）」という物質を持ち込んだ。
 * 紙は厚みが 1dp あり、必ず高さ（elevation）を持ち、必ず影を落とす。
 * 高さは影の柔らかさでしか分からない。だからこの版は影が主役になる。
 *
 * ■ ここで作っている「らしさ」
 *   1. 紙が紙の上に影を落とすこと。3枚を階段状にずらして、
 *      上の紙の影が下の紙の面に落ちるところを見せている。
 *      地に落ちる影だけだと「浮いている」ことの証明にならない。
 *   2. 影が2枚あること。仕様では key light（真上からの指向光）が
 *      濃く近い影を、ambient light（環境光）が薄く広い影を落とす。
 *      1枚のぼかしで済ませると、とたんに「CSSのbox-shadow」に見える。
 *      下段にその2枚を分解して並べた。
 *   3. 影の広がりが物の大きさに比例しないこと。同じ大きさの札でも
 *      24dp なら札より大きい影が出る。下段の階段でそれを見せている。
 *
 * ■ 初稿から3稿目までの失敗
 *   ・大きな白い紙にアプリバーとリストとボタンを描いたら、ただのアプリの
 *     モックになった。この図鑑では隣の9枚も画面になるので、一番やっては
 *     いけない絵だった。部品を捨てて「紙・帯・円」と影だけにした。
 *   ・地を #fafafa にしたら白い紙が地に溶けて、影が全く見えなくなった。
 *     地をグレー300相当（#212121 を白へ 0.88 寄せた色）に落として、
 *     紙を #fafafa のままにしたら、はじめて高さが読めるようになった。
 *   ・FAB を紙の隅に小さく置くと、そこだけ「画面のスクショ」に見えた。
 *     版面から切り離して大きく1つだけ浮かせたら、円と影の絵になった。
 *
 * ■ 検分で足したこと
 *   ・185px まで縮めると、青い帯と白い面しか見えず「空っぽの紙」に見えた。
 *     地を grey300 相当まで落として紙との差を開き、
 *     2dp の紙にインクの波紋（ripple）を大きく1つ入れた。
 *     波紋は部品ではない。「material は紙で、その上をインクが広がる」という
 *     この様式の物理そのもので、しかもマテリアル以外では絶対に出てこない。
 *     色の塊が版面の左上に入るので、縮小しても何の絵か分かるようになる。
 */
import { ATLAS, shift } from "@/lib/plate";

const P = "md";
const PAPER = "#fafafa"; // 紙
const INDIGO = "#3f51b5";
const RED = "#ff5252";
const AMBER = "#ffc107";
const INK = "#212121";
const FIELD = shift(INK, 0.815); // 地。grey300 相当。ここを明るくすると紙が地に溶ける
const RULE = shift(INK, 0.72);
const WHITE = "#ffffff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** 高さ dp → 影2枚。値は Material の box-shadow 仕様をそのまま写した。
    ぼかし半径 = CSS の blur ÷ 2（stdDeviation に直す）。
    自分で見当をつけた数字を使うと、必ず濃すぎて円盤みたいな影になる */
const ELEV: [string, number, number, number, number][] = [
  // id, keyDy, keySd, ambDy, ambSd
  ["e1", 1, 0.8, 1, 1.6],
  ["e2", 2, 1.0, 1, 2.6],
  ["e4", 4, 2.6, 1, 5.0],
  ["e6", 6, 5.0, 1, 9.0],
  ["e8", 8, 5.0, 3, 7.0],
  ["e12", 12, 8.5, 5, 11.0],
  ["e24", 24, 19.0, 9, 23.0],
];

/* 3枚の紙。階段状にずらして、上の影が下の面に落ちるようにする */
const S1 = { x: 58, y: 140, w: 214, h: 150 };
const S2 = { x: 192, y: 222, w: 214, h: 150 };
const S3 = { x: 326, y: 304, w: 214, h: 150 };

/* 断面図。地からの高さを 1dp = 2.6px で測る */
const BASE = 500;
const K = 2.6;

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="マテリアルデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-s3`}>
          <rect x={S3.x} y={S3.y} width={S3.w} height={S3.h} rx="4" />
        </clipPath>
        <clipPath id={`${P}-s2`}>
          <rect x={S2.x} y={S2.y} width={S2.w} height={S2.h} rx="4" />
        </clipPath>
        <clipPath id={`${P}-s1`}>
          <rect x={S1.x} y={S1.y} width={S1.w} height={S1.h} rx="4" />
        </clipPath>

        {/* 高さごとの影。key と ambient を別々に作って重ねる。
            feDropShadow を2つ直列につなぐと、2枚目が1枚目の影まで
            ぼかし直して、輪郭のある円盤みたいな偽の影が出た（3稿目の失敗）。
            SourceAlpha から2本並列に作って feMerge で合流させるのが正しい */}
        {ELEV.map(([id, kd, kb, ad, ab]) => (
          <filter key={id} id={`${P}-${id}`} x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={kb} result="kb" />
            <feOffset in="kb" dy={kd} result="ko" />
            <feFlood floodColor={INK} floodOpacity="0.24" result="kc" />
            <feComposite in="kc" in2="ko" operator="in" result="key" />
            <feGaussianBlur in="SourceAlpha" stdDeviation={ab} result="ab" />
            <feOffset in="ab" dy={ad} result="ao" />
            <feFlood floodColor={INK} floodOpacity="0.15" result="ac" />
            <feComposite in="ac" in2="ao" operator="in" result="amb" />
            <feMerge>
              <feMergeNode in="amb" />
              <feMergeNode in="key" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}

        {/* 分解図用。key だけ／ambient だけ */}
        <filter id={`${P}-key`} x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feOffset in="b" dy="5" result="o" />
          <feFlood floodColor={INK} floodOpacity="0.42" result="c" />
          <feComposite in="c" in2="o" operator="in" result="s" />
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${P}-amb`} x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="b" />
          <feOffset in="b" dy="10" result="o" />
          <feFlood floodColor={INK} floodOpacity="0.34" result="c" />
          <feComposite in="c" in2="o" operator="in" result="s" />
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={FIELD} />

        {/* ── 天の色帯。これも 4dp の紙なので、地に影を落とす ─────── */}
        <rect x="-40" y="-60" width="680" height="152" fill={INDIGO} filter={`url(#${P}-e4)`} />
        <text x="44" y="60" fill={WHITE} fontFamily={SANS} fontSize="27" fontWeight="500" letterSpacing="4.5">
          MATERIAL DESIGN
        </text>
        <text
          x="556" y="60" textAnchor="end" fill={WHITE} opacity="0.7"
          fontFamily={SANS} fontSize="9" fontWeight="600" letterSpacing="2.4"
        >
          GOOGLE · 2014
        </text>
        <g stroke={AMBER} strokeWidth="1.4">
          <line x1="556" y1="92" x2="556" y2="116" />
          <line x1="550" y1="92" x2="562" y2="92" />
        </g>
        <text x="546" y="116" textAnchor="end" fill={INK} opacity="0.62" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6">
          4 dp
        </text>

        {/* ── 紙の階段。低い順に刷る ─────────────────────────── */}

        {/* 2dp。地にほとんど貼りついた紙 */}
        <rect x={S1.x} y={S1.y} width={S1.w} height={S1.h} rx="4" fill={PAPER} filter={`url(#${P}-e2)`} />
        {/* インクの波紋。触れた点から紙の上をインクが広がる。
            紙の縁で必ず切れる（紙の外へは出ない）のが要で、
            だから clipPath で紙の内側に閉じ込めてある。
            この物理はマテリアル以外のどの様式にも無い */}
        <g clipPath={`url(#${P}-s1)`}>
          <circle cx="98" cy="258" r="104" fill={INDIGO} opacity="0.92" />
          <circle cx="98" cy="258" r="126" fill="none" stroke={INDIGO} strokeWidth="1.6" opacity="0.34" />
          <circle cx="98" cy="258" r="148" fill="none" stroke={INDIGO} strokeWidth="1.2" opacity="0.18" />
          {/* 触れた点。ここが波紋の中心 */}
          <circle cx="98" cy="258" r="9" fill="none" stroke={WHITE} strokeWidth="2" opacity="0.85" />
          <circle cx="98" cy="258" r="2.6" fill={WHITE} opacity="0.9" />
          {/* 註は波紋の外（紙の白い側）へ右詰めで逃がす。
              左詰めにすると青い面と白い面を跨いで、字が半分消えた */}
          <text
            x={S1.x + S1.w - 12} y={S1.y + 24} textAnchor="end" fill={INK} opacity="0.5"
            fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.8"
          >
            RIPPLE
          </text>
          <text
            x={S1.x + S1.w - 12} y={S1.y + 37} textAnchor="end" fill={INK} opacity="0.32"
            fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.2"
          >
            INK STOPS
          </text>
          <text
            x={S1.x + S1.w - 12} y={S1.y + 49} textAnchor="end" fill={INK} opacity="0.32"
            fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.2"
          >
            AT THE EDGE
          </text>
        </g>
        <text
          x={S1.x + 16} y={S1.y + S1.h - 18} fill={WHITE} opacity="0.6"
          fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2"
        >
          1 dp THICK
        </text>
        <g stroke={AMBER} strokeWidth="1.4">
          <line x1={S1.x + 30} y1={S1.y} x2={S1.x + 30} y2={S1.y - 26} />
          <line x1={S1.x + 24} y1={S1.y} x2={S1.x + 36} y2={S1.y} />
        </g>
        <text x={S1.x + 42} y={S1.y - 16} fill={INK} opacity="0.62" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6">
          2 dp
        </text>

        {/* 8dp。版下の 8dp グリッドとキーラインはこの紙に載せる */}
        <rect x={S2.x} y={S2.y} width={S2.w} height={S2.h} rx="4" fill={PAPER} filter={`url(#${P}-e8)`} />
        <g clipPath={`url(#${P}-s2)`}>
          <g stroke={INDIGO} strokeWidth="0.6" opacity="0.16">
            {Array.from({ length: 14 }, (_, i) => (
              <line key={`v${i}`} x1={S2.x + i * 16} y1={S2.y} x2={S2.x + i * 16} y2={S2.y + S2.h} />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`h${i}`} x1={S2.x} y1={S2.y + i * 16} x2={S2.x + S2.w} y2={S2.y + i * 16} />
            ))}
          </g>
          {/* キーライン。紙の左端から 16dp。マテリアルの版面はここで揃う */}
          <line x1={S2.x + 32} y1={S2.y} x2={S2.x + 32} y2={S2.y + S2.h} stroke={AMBER} strokeWidth="1.6" />
          <g stroke={AMBER} strokeWidth="1.3">
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`t${i}`} x1={S2.x + i * 16} y1={S2.y} x2={S2.x + i * 16} y2={S2.y + (i % 2 ? 5 : 9)} />
            ))}
          </g>
          {/* キーラインを跨がないよう、註は必ず右側に出す */}
          <text
            x={S2.x + 42} y={S2.y + 126} fill={INK} opacity="0.42"
            fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.6"
          >
            8 dp GRID
          </text>
        </g>
        <g stroke={AMBER} strokeWidth="1.4">
          <line x1={S2.x + S2.w} y1={S2.y + 24} x2={S2.x + S2.w + 26} y2={S2.y + 24} />
          <line x1={S2.x + S2.w} y1={S2.y + 18} x2={S2.x + S2.w} y2={S2.y + 30} />
        </g>
        <text x={S2.x + S2.w + 32} y={S2.y + 28} fill={INK} opacity="0.62" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6">
          8 dp
        </text>

        {/* 24dp。一番高い紙。太い色帯はここに載せる */}
        <rect x={S3.x} y={S3.y} width={S3.w} height={S3.h} rx="4" fill={PAPER} filter={`url(#${P}-e24)`} />
        <g clipPath={`url(#${P}-s3)`}>
          <rect x={S3.x} y={S3.y} width={S3.w} height="34" fill={INDIGO} />
          {/* 24dp は仕様上いちばん高い紙＝ダイアログ。
              白い面が何なのか分からないと、ただの空白に見えたので註を入れた */}
          <text
            x={S3.x + 14} y={S3.y + 22} fill={WHITE} opacity="0.9"
            fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="2.2"
          >
            DIALOG
          </text>
          <text
            x={S3.x + 14} y={S3.y + 62} fill={INK} opacity="0.38"
            fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.6"
          >
            THE HIGHEST SHEET
          </text>
          <text
            x={S3.x + 14} y={S3.y + 78} fill={INK} opacity="0.26"
            fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4"
          >
            NOTHING SITS ABOVE 24 dp
          </text>
          <rect x={S3.x + 14} y={S3.y + 100} width={S3.w - 28} height="1" fill={INK} opacity="0.12" />
          <text
            x={S3.x + S3.w - 14} y={S3.y + 126} textAnchor="end" fill={INDIGO} opacity="0.85"
            fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="1.8"
          >
            OK
          </text>
        </g>
        <g stroke={AMBER} strokeWidth="1.4">
          <line x1={S3.x + 150} y1={S3.y + S3.h} x2={S3.x + 150} y2={S3.y + S3.h + 26} />
          <line x1={S3.x + 144} y1={S3.y + S3.h} x2={S3.x + 156} y2={S3.y + S3.h} />
        </g>
        <text
          x={S3.x + 162} y={S3.y + S3.h + 30} fill={INK} opacity="0.62"
          fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6"
        >
          24 dp
        </text>

        {/* ── 円を1つだけ、版面から切り離して大きく浮かせる ───────── */}
        <circle cx="486" cy="180" r="46" fill={RED} filter={`url(#${P}-e12)`} />
        <g fill={WHITE}>
          <rect x="468" y="177.5" width="36" height="5" rx="2.5" />
          <rect x="483.5" y="162" width="5" height="36" rx="2.5" />
        </g>
        <g stroke={AMBER} strokeWidth="1.4">
          <line x1="440" y1="180" x2="410" y2="180" />
          <line x1="440" y1="174" x2="440" y2="186" />
        </g>
        <text x="402" y="184" textAnchor="end" fill={INK} opacity="0.62" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6">
          12 dp
        </text>

        {/* ── 断面。上の階段が実際には何 dp 浮いているかを横から測る ── */}
        <text x="48" y="416" fill={INK} opacity="0.45" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2.2">
          SECTION — HEIGHT ABOVE THE SURFACE
        </text>
        <line x1="52" y1={BASE} x2="308" y2={BASE} stroke={INK} strokeWidth="1.1" opacity="0.42" />
        {/* 地の断面。45度のハッチは製図の約束ごと */}
        <g stroke={INK} strokeWidth="0.7" opacity="0.24">
          {Array.from({ length: 33 }, (_, i) => (
            <line key={i} x1={52 + i * 8} y1={BASE + 7} x2={58 + i * 8} y2={BASE + 1} />
          ))}
        </g>
        {([[56, 2], [140, 8], [224, 24]] as const).map(([x, dp]) => {
          const top = BASE - dp * K - 4;
          return (
            <g key={dp}>
              <rect x={x} y={top} width="72" height="4" fill={PAPER} stroke={INK} strokeOpacity="0.3" strokeWidth="0.7" />
              <line x1={x + 8} y1={BASE} x2={x + 8} y2={top + 4} stroke={AMBER} strokeWidth="1.3" />
              <text
                x={x + 15} y={top + 1} fill={INK} opacity="0.55"
                fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1"
              >
                {dp} dp
              </text>
            </g>
          );
        })}

        {/* ── 下段。ここから技術の註 ───────────────────────────── */}
        <line x1="0" y1="530" x2="600" y2="530" stroke={RULE} strokeWidth="1" />

        {/* 高さの階段。札は同じ大きさなのに影だけが広がる */}
        <text x="44" y="560" fill={INK} opacity="0.55" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2.6">
          SAME PAPER, DIFFERENT LIGHT
        </text>
        {([["e1", "1"], ["e6", "6"], ["e12", "12"], ["e24", "24"]] as const).map(([f, dp], i) => {
          const x = 46 + i * 72;
          return (
            <g key={f}>
              <rect x={x} y="584" width="46" height="46" rx="3" fill={PAPER} filter={`url(#${P}-${f})`} />
              <text
                x={x + 23} y="662" textAnchor="middle" fill={INK} opacity="0.55"
                fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="1"
              >
                {dp} dp
              </text>
            </g>
          );
        })}

        {/* 影の分解。key だけ／ambient だけ／両方 */}
        <line x1="352" y1="546" x2="352" y2="672" stroke={RULE} strokeWidth="1" />
        <text x="382" y="560" fill={INK} opacity="0.55" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2.6">
          ONE SHADOW = TWO LIGHTS
        </text>
        {([[`${P}-key`, "KEY"], [`${P}-amb`, "AMBIENT"], [`${P}-e8`, "SUM"]] as const).map(([f, name], i) => {
          const x = 382 + i * 62;
          return (
            <g key={name}>
              <rect x={x} y="584" width="42" height="42" rx="3" fill={PAPER} filter={`url(#${f})`} />
              <text
                x={x + 21} y="662" textAnchor="middle" fill={INK} opacity="0.55"
                fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* 締めの1行。左に信条、右に刷り色 */}
        <line x1="44" y1="702" x2="556" y2="702" stroke={RULE} strokeWidth="1" />
        <text x="44" y="730" fill={INK} opacity="0.8" fontFamily={SANS} fontSize="11" fontWeight="500" letterSpacing="1.4">
          Paper has thickness. Light is what proves it.
        </text>
        <g transform="translate(44 752)">
          {[INDIGO, RED, AMBER, INK, PAPER].map((c, i) => (
            <rect key={i} x={i * 30} y="0" width="22" height="10" fill={c} />
          ))}
        </g>
        <text
          x="556" y="762" textAnchor="end" fill={INK} opacity="0.42"
          fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="2"
        >
          INDIGO 500 · RED A200 · AMBER 500
        </text>

        {/* 紙の目。ごく薄く。影の柔らかさを濁らせない */}
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
