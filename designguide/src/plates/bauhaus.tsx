/**
 * バウハウス。
 *
 * 1923年の展覧会ポスター（ヨースト・シュミット）と、バイヤーの
 * ユニバーサル・アルファベットを軸に組む。円・正方形・三角形の
 * 三原型に赤青黄＋黒。文字は小文字だけ、縦に倒す。
 *
 * 版面は縦に3本の柱で持つ。左＝文字と黄、中＝三原型、右＝縦組みの語。
 * 黒帯は中の柱で止める。右の柱に食い込ませると、文字を切って
 * 事故に見える（初稿でそうなった）。
 */
import { ATLAS } from "@/lib/plate";

const P = "bh";
const PAPER = "#f0ede3";
const INK = "#111111";
const RED = "#d8262a";
const BLUE = "#1a49c4";
const YELLOW = "#f2c200";

/** 版面の柱。左端・中の切れ目・右の柱・天地 */
const L = 52;
const R = 548;
const COL = 466; // ここから右が縦組みの語の領域

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="バウハウス様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 版下のグリッド。バウハウスの製図は必ずこれが下にある */}
        <g stroke={INK} strokeWidth="1" opacity="0.22">
          <line x1={L} y1="0" x2={L} y2="800" />
          <line x1={COL} y1="0" x2={COL} y2="800" />
          <line x1={R} y1="0" x2={R} y2="800" />
          <line x1="0" y1="96" x2="600" y2="96" />
          <line x1="0" y1="596" x2="600" y2="596" />
          <line x1="0" y1="704" x2="600" y2="704" />
        </g>

        {/* 黄の三角。左下の角から版面を押し上げる */}
        <polygon points={`${L},704 300,704 ${L},404`} fill={YELLOW} />

        {/* 青の正方形。45度。中の柱の内で完結させる */}
        <rect
          x="0" y="0" width="230" height="230"
          transform="translate(352 300) rotate(45) translate(-115 -115)"
          fill={BLUE}
        />

        {/* 赤の円。青と掛け合わせ、重なりに濃い紫の月を作る */}
        <circle cx="248" cy="300" r="146" fill={RED} style={{ mixBlendMode: "multiply" }} />

        {/* 黒帯。中の柱で止める。三原型と黄を1本で束ねる */}
        <rect x="-20" y="556" width={COL - 40 + 20} height="22" fill={INK} />
        {/* 帯の先を細い線で受け、右の柱まで視線だけ渡す */}
        <line x1={COL - 40} y1="567" x2={R} y2="567" stroke={INK} strokeWidth="1.5" />

        {/* 縦組みの語。小文字のみ。バイヤーの版面の癖 */}
        <text
          transform={`translate(${R - 6} 690) rotate(-90)`}
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="66"
          fontWeight="700"
          letterSpacing="-2.5"
        >
          bauhaus
        </text>

        {/* 年号と地名。左の柱の頭 */}
        <text
          x={L + 20} y="152"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="21"
          fontWeight="700"
          letterSpacing="7"
        >
          1919
        </text>
        <text
          x={L + 20} y="178"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10.5"
          fontWeight="500"
          letterSpacing="3.6"
          opacity="0.72"
        >
          WEIMAR—DESSAU
        </text>

        {/* 小さな正方形の列。地の余白を刻んで重心を下げる */}
        <g fill={INK}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={L + 20 + i * 26} y={744} width="11" height="11" />
          ))}
        </g>
        <circle cx={L + 20 + 8 * 26 + 5.5} cy={749.5} r="5.5" fill={RED} />

        {/* 紙の目 */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.16"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
