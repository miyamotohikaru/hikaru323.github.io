/**
 * キッチュ。
 *
 * 俗っぽさを恥じない。安い光沢、多すぎる飾り、甘すぎる色。
 * 土産物屋の陶器の仔猫を、金の額に入れて、リボンを掛けて、
 * 隙間という隙間にハートと星を詰める——そのまま図版にする。
 *
 * ■ 隣の3枚と分けるための約束
 *   ・memphis はベタ塗りの幾何。だからこちらは全部グラデにして艶を出す。
 *     キッチュの実体は「安い光沢」で、平らな塗りでは絶対に出ない。
 *   ・maximalism は柄の重ね着。こちらは中央に1つの主役を据える。
 *     甘い物を1つ、額に入れて拝ませるのがキッチュの構図。
 *   ・anti-design は皮肉。こちらは本気で可愛いと思っている顔をする。
 *     皮肉が見えた瞬間にキッチュではなくなる。
 *
 * ■ 効いたもの
 *   1. 大きすぎる目。マーガレット・キーンの子ども絵から
 *      土産物の陶器までを貫く、感傷の記号。
 *   2. 金のロココ額と後光。安物に高級の衣装を着せる倒錯。
 *   3. 縁のレース。版面の端まで飾りで埋める。余白を残さない。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "ktc";

const BABY = "#ffd9e8";
const HOT = "#ff4f9a";
const YELLOW = "#ffd23f";
const CYAN = "#3ec1d3";
const INK = "#2b2b2b";

const CX = 300;
const CY = 372;
const RX = 214;
const RY = 246;

/** ハート */
const HEART = "M0 5 C -8 -6 -18 -2 -18 -8 C -18 -15 -10 -18 0 -8 C 10 -18 18 -15 18 -8 C 18 -2 8 -6 0 5 Z";
/** 4条の星 */
const SPARK = "M0 -13 C 1.6 -3.6 3.6 -1.6 13 0 C 3.6 1.6 1.6 3.6 0 13 C -1.6 3.6 -3.6 1.6 -13 0 C -3.6 -1.6 -1.6 -3.6 0 -13 Z";

export default function Plate() {
  const r = rand(19720214);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="キッチュ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-oval`}><ellipse cx={CX} cy={CY} rx={RX - 16} ry={RY - 16} /></clipPath>

        {/* 金。安物に着せる高級の衣装。4段で照らせば金に見える */}
        <linearGradient id={`${P}-gold`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fff6cd" />
          <stop offset="0.3" stopColor={YELLOW} />
          <stop offset="0.55" stopColor="#b8801a" />
          <stop offset="0.75" stopColor="#ffe57a" />
          <stop offset="1" stopColor="#c9950f" />
        </linearGradient>
        {/* 地。エアブラシの後光 */}
        <radialGradient id={`${P}-bg`} cx="0.5" cy="0.42" r="0.72">
          <stop offset="0" stopColor="#fff3f8" />
          <stop offset="0.55" stopColor={BABY} />
          <stop offset="1" stopColor="#ffb4d4" />
        </radialGradient>
        {/* 額の中の空。水色から白へ */}
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#8ee2ea" />
          <stop offset="0.5" stopColor="#d5f4f6" />
          <stop offset="1" stopColor="#fff0f6" />
        </linearGradient>
        {/* 陶器の肌。左上に照り */}
        <radialGradient id={`${P}-porc`} cx="0.34" cy="0.26" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#fff0f6" />
          <stop offset="0.82" stopColor={BABY} />
          <stop offset="1" stopColor="#f2a8c8" />
        </radialGradient>
        {/* リボンの繻子 */}
        <linearGradient id={`${P}-satin`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ff9dc4" />
          <stop offset="0.35" stopColor={HOT} />
          <stop offset="0.7" stopColor="#d61f70" />
          <stop offset="1" stopColor="#ff7ab0" />
        </linearGradient>
        {/* 眼。上が濃く下が明るいと潤む */}
        <radialGradient id={`${P}-eye`} cx="0.5" cy="0.66" r="0.6">
          <stop offset="0" stopColor="#6fd8e6" />
          <stop offset="0.55" stopColor={CYAN} />
          <stop offset="1" stopColor="#14606e" />
        </radialGradient>
        {/* レースの縁 */}
        <pattern id={`${P}-lace`} width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#fff6fa" />
          <circle cx="15" cy="15" r="7" fill="none" stroke="#f3b9d3" strokeWidth="2" />
          <circle cx="0" cy="0" r="5" fill="none" stroke="#f3b9d3" strokeWidth="2" />
          <circle cx="30" cy="30" r="5" fill="none" stroke="#f3b9d3" strokeWidth="2" />
          <circle cx="15" cy="15" r="1.8" fill="#f3b9d3" />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-bg)`} />

        {/* 後光。額の裏から放射 */}
        <g opacity="0.5">
          {Array.from({ length: 36 }, (_, i) => {
            const a0 = (i * 10 - 90) * (Math.PI / 180);
            const a1 = ((i + 0.5) * 10 - 90) * (Math.PI / 180);
            return (
              <polygon
                key={i}
                points={`${CX},${CY} ${CX + Math.cos(a0) * 700},${CY + Math.sin(a0) * 700} ${CX + Math.cos(a1) * 700},${CY + Math.sin(a1) * 700}`}
                fill={i % 2 ? "#ffffff" : "#ffbcd8"}
                opacity={i % 2 ? 0.5 : 0.35}
              />
            );
          })}
        </g>

        {/* 縁のレース。版面の端まで飾りで埋める */}
        <rect width="600" height="30" fill={`url(#${P}-lace)`} />
        <rect y="770" width="600" height="30" fill={`url(#${P}-lace)`} />
        <rect width="30" height="800" fill={`url(#${P}-lace)`} />
        <rect x="570" width="30" height="800" fill={`url(#${P}-lace)`} />
        {/* レースの帆立の縁取り */}
        <g fill="#fff6fa">
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={`t${i}`} cx={15 + i * 30} cy="30" r="13" />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={`b${i}`} cx={15 + i * 30} cy="770" r="13" />
          ))}
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={`l${i}`} cx="30" cy={15 + i * 30} r="13" />
          ))}
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={`rr${i}`} cx="570" cy={15 + i * 30} r="13" />
          ))}
        </g>

        {/* ── 額。金のロココ ─────────────────────────────── */}
        {/* 渦の飾り。額より先に、はみ出させて置く */}
        <g fill={`url(#${P}-gold)`} stroke="#8a6207" strokeWidth="1.4">
          {[[300, 108, 0], [300, 640, 180], [78, 372, -90], [522, 372, 90]].map(([x, y, rot], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <path d="M0 -34 C 26 -34 44 -16 44 4 C 44 20 30 30 18 26 C 8 22 6 10 14 6 C 20 3 26 8 24 13" />
              <path d="M0 -34 C -26 -34 -44 -16 -44 4 C -44 20 -30 30 -18 26 C -8 22 -6 10 -14 6 C -20 3 -26 8 -24 13" />
              <path d="M0 -40 C 10 -26 10 -12 0 -2 C -10 -12 -10 -26 0 -40 Z" />
            </g>
          ))}
        </g>
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={`url(#${P}-gold)`} />
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#8a6207" strokeWidth="2" />
        <ellipse cx={CX} cy={CY} rx={RX - 8} ry={RY - 8} fill="none" stroke="#fff6cd" strokeWidth="2.4" opacity="0.85" />
        {/* 額の玉縁。近くで見る細部 */}
        {Array.from({ length: 56 }, (_, i) => {
          const a = (i / 56) * Math.PI * 2;
          return <circle key={i} cx={CX + Math.cos(a) * (RX - 4)} cy={CY + Math.sin(a) * (RY - 4)} r="4.4" fill={`url(#${P}-gold)`} stroke="#8a6207" strokeWidth="0.8" />;
        })}

        {/* ── 額の中 ─────────────────────────────────────── */}
        <g clipPath={`url(#${P}-oval)`}>
          <ellipse cx={CX} cy={CY} rx={RX - 16} ry={RY - 16} fill={`url(#${P}-sky)`} />
          {/* 背後の小さな虹と雲。甘さを足せるだけ足す */}
          <g fill="none" strokeWidth="9" opacity="0.5">
            <path d={`M${CX - 152} 336 A 152 152 0 0 1 ${CX + 152} 336`} stroke={HOT} />
            <path d={`M${CX - 139} 336 A 139 139 0 0 1 ${CX + 139} 336`} stroke={YELLOW} />
            <path d={`M${CX - 126} 336 A 126 126 0 0 1 ${CX + 126} 336`} stroke={CYAN} />
          </g>
          {Array.from({ length: 5 }, (_, i) => {
            const x = r(110, 500);
            const y = r(200, 300);
            return (
              <g key={i} fill="#ffffff" opacity="0.85">
                <ellipse cx={x} cy={y} rx="30" ry="16" />
                <ellipse cx={x - 20} cy={y + 5} rx="20" ry="12" />
                <ellipse cx={x + 22} cy={y + 5} rx="22" ry="12" />
              </g>
            );
          })}

          {/* 敷きレース */}
          <ellipse cx={CX} cy="546" rx="150" ry="34" fill="#fff6fa" />
          <ellipse cx={CX} cy="546" rx="150" ry="34" fill={`url(#${P}-lace)`} opacity="0.9" />
          <g fill="none" stroke="#f3b9d3" strokeWidth="2.4">
            {Array.from({ length: 26 }, (_, i) => {
              const a = (i / 26) * Math.PI * 2;
              return <circle key={i} cx={CX + Math.cos(a) * 150} cy={546 + Math.sin(a) * 34} r="9" />;
            })}
          </g>

          {/* ── 陶器の仔猫 ─────────────────────────────── */}
          {/* 尻尾 */}
          <path d="M368 520 C 424 520 440 470 420 436 C 410 420 388 424 392 442 C 396 458 414 456 412 442"
                stroke="#ffd0e4" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M368 520 C 424 520 440 470 420 436" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* 胴 */}
          <path d="M300 388 C 356 388 392 452 392 500 C 392 532 352 550 300 550 C 248 550 208 532 208 500 C 208 452 244 388 300 388 Z" fill={`url(#${P}-porc)`} />
          {/* 前足 */}
          <ellipse cx="262" cy="538" rx="30" ry="16" fill={`url(#${P}-porc)`} />
          <ellipse cx="338" cy="538" rx="30" ry="16" fill={`url(#${P}-porc)`} />
          <g stroke="#f2a8c8" strokeWidth="1.6" fill="none">
            {[-9, 0, 9].map((dx, i) => (
              <line key={i} x1={262 + dx} y1="532" x2={262 + dx} y2="546" />
            ))}
            {[-9, 0, 9].map((dx, i) => (
              <line key={`b${i}`} x1={338 + dx} y1="532" x2={338 + dx} y2="546" />
            ))}
          </g>
          {/* 耳 */}
          <path d="M244 320 L232 254 L292 296 Z" fill={`url(#${P}-porc)`} />
          <path d="M356 320 L368 254 L308 296 Z" fill={`url(#${P}-porc)`} />
          <path d="M250 314 L243 274 L280 297 Z" fill={HOT} opacity="0.75" />
          <path d="M350 314 L357 274 L320 297 Z" fill={HOT} opacity="0.75" />
          {/* 頭 */}
          <circle cx={CX} cy={CY - 4} r="80" fill={`url(#${P}-porc)`} />
          {/* 顎の影。頭と胴が繋がって雪だるまに見えるのを切る */}
          <path d="M232 428 C 258 456 342 456 368 428 C 350 470 250 470 232 428 Z" fill="#f2a8c8" opacity="0.45" />
          {/* 頬 */}
          <ellipse cx="248" cy="392" rx="20" ry="13" fill="#ff9dc4" opacity="0.65" />
          <ellipse cx="352" cy="392" rx="20" ry="13" fill="#ff9dc4" opacity="0.65" />
          {/* 目。大きすぎる目が感傷の記号 */}
          {[268, 332].map((ex, i) => (
            <g key={i}>
              <ellipse cx={ex} cy="362" rx="27" ry="31" fill={INK} />
              <ellipse cx={ex} cy="366" rx="22" ry="25" fill={`url(#${P}-eye)`} />
              <ellipse cx={ex} cy="372" rx="14" ry="16" fill={INK} />
              <circle cx={ex - 8} cy="352" r="9" fill="#ffffff" />
              <circle cx={ex + 8} cy="376" r="4.6" fill="#ffffff" opacity="0.9" />
              <circle cx={ex - 13} cy="368" r="3" fill="#ffffff" opacity="0.75" />
              {/* 睫毛 */}
              {/* 睫毛。真上に立てると触角に見えた（初稿）。外へ払う */}
              <path
                d={i === 0
                  ? `M${ex - 24} 346 C ${ex - 34} 340 ${ex - 40} 336 ${ex - 44} 330 M${ex - 14} 335 C ${ex - 20} 328 ${ex - 24} 322 ${ex - 26} 316`
                  : `M${ex + 24} 346 C ${ex + 34} 340 ${ex + 40} 336 ${ex + 44} 330 M${ex + 14} 335 C ${ex + 20} 328 ${ex + 24} 322 ${ex + 26} 316`}
                stroke={INK} strokeWidth="3.4" strokeLinecap="round" fill="none"
              />
            </g>
          ))}
          {/* 鼻と口 */}
          <path d="M292 400 L308 400 L300 410 Z" fill={HOT} />
          <path d="M300 410 C 300 420 288 422 284 414 M300 410 C 300 420 312 422 316 414" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {/* 髭 */}
          <g stroke={INK} strokeWidth="1.8" opacity="0.55" strokeLinecap="round">
            {[-8, 0, 8].map((dy, i) => (
              <line key={i} x1="252" y1={400 + dy} x2="196" y2={392 + dy * 2} />
            ))}
            {[-8, 0, 8].map((dy, i) => (
              <line key={`r${i}`} x1="348" y1={400 + dy} x2="404" y2={392 + dy * 2} />
            ))}
          </g>
          {/* 首輪と鈴 */}
          <path d="M246 424 C 268 448 332 448 354 424 C 336 460 264 460 246 424 Z" fill={`url(#${P}-gold)`} stroke="#8a6207" strokeWidth="1.4" />
          <circle cx="300" cy="452" r="14" fill={`url(#${P}-gold)`} stroke="#8a6207" strokeWidth="1.4" />
          <path d="M288 452 L312 452" stroke="#8a6207" strokeWidth="2" />
          <circle cx="294" cy="446" r="4" fill="#fff6cd" />
          {/* 頭のリボン。繻子の照り */}
          <g transform="translate(360 292) rotate(16)">
            <path d="M0 0 C -20 -26 -54 -22 -52 2 C -50 24 -18 24 0 0 Z" fill={`url(#${P}-satin)`} />
            <path d="M0 0 C 20 -26 54 -22 52 2 C 50 24 18 24 0 0 Z" fill={`url(#${P}-satin)`} />
            <path d="M-46 -12 C -34 -14 -18 -8 -8 -2" stroke="#ffd0e4" strokeWidth="4" fill="none" opacity="0.85" />
            <path d="M46 -12 C 34 -14 18 -8 8 -2" stroke="#ffd0e4" strokeWidth="4" fill="none" opacity="0.85" />
            <circle cx="0" cy="0" r="11" fill={`url(#${P}-satin)`} />
            <circle cx="-4" cy="-4" r="3.6" fill="#ffd0e4" opacity="0.9" />
          </g>
          {/* 胴の照り。安い光沢はここで決まる */}
          <path d="M246 424 C 240 466 250 506 272 528 C 240 512 226 468 246 424 Z" fill="#ffffff" opacity="0.75" />
          <ellipse cx="268" cy="312" rx="30" ry="13" fill="#ffffff" opacity="0.6" transform="rotate(-22 268 312)" />

          {/* 額の中の煌めき */}
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={SPARK} transform={`translate(${r(110, 496)} ${r(180, 570)}) scale(${r(0.4, 1.1).toFixed(2)})`} fill="#ffffff" opacity={r(0.5, 0.95)} />
          ))}
        </g>

        {/* ── 額の下。リボンの垂れ幕 ────────────────────────── */}
        <g>
          <path d="M92 662 L508 662 L508 726 L92 726 Z" fill={`url(#${P}-satin)`} />
          <path d="M92 662 L48 640 L48 748 L92 726 Z" fill="#c41a65" />
          <path d="M508 662 L552 640 L552 748 L508 726 Z" fill="#c41a65" />
          <path d="M92 668 L508 668" stroke="#ffd0e4" strokeWidth="3.4" opacity="0.7" />
          <path d="M92 720 L508 720" stroke="#c41a65" strokeWidth="3" opacity="0.6" />
          <text
            x="300" y="710" textAnchor="middle"
            fill="#fff6fa"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="46" fontWeight="700" fontStyle="italic"
            stroke="#c41a65" strokeWidth="1.2"
          >
            Kitsch
          </text>
        </g>
        <text x="300" y="762" textAnchor="middle" fill="#c41a65" fontFamily="Georgia, 'Times New Roman', serif" fontSize="12" fontStyle="italic" letterSpacing="3.4">
          A Souvenir · Made in Taiwan · No.7
        </text>

        {/* ── 隙間を埋める飾り。余白を残さない ────────────────── */}
        {[[62, 128, 1.1], [538, 128, 0.95], [58, 610, 1], [544, 604, 1.15], [300, 66, 0.85], [128, 62, 0.7], [472, 62, 0.7]].map(([x, y, sc], i) => (
          <g key={i}>
            <path d={HEART} transform={`translate(${x} ${y}) scale(${sc})`} fill={HOT} />
            <path d={HEART} transform={`translate(${x - 2 * sc} ${y - 3 * sc}) scale(${sc * 0.42})`} fill="#ffd0e4" />
          </g>
        ))}
        {Array.from({ length: 22 }, (_, i) => {
          const x = r(0, 600);
          const y = r(0, 800);
          const d = Math.hypot((x - CX) / RX, (y - CY) / RY);
          if (d < 1.06) return null;
          return <path key={i} d={SPARK} transform={`translate(${x} ${y}) scale(${r(0.35, 0.95).toFixed(2)})`} fill={i % 3 === 0 ? YELLOW : "#ffffff"} opacity={r(0.6, 1)} />;
        })}
        {/* 小さな造花 */}
        {[[74, 300], [526, 300], [74, 470], [526, 470]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {Array.from({ length: 5 }, (_, k) => {
              const a = (k / 5) * Math.PI * 2;
              return <ellipse key={k} cx={Math.cos(a) * 9} cy={Math.sin(a) * 9} rx="8" ry="6" fill={k % 2 ? "#ffffff" : HOT} transform={`rotate(${(k * 72).toFixed(0)} ${(Math.cos(a) * 9).toFixed(1)} ${(Math.sin(a) * 9).toFixed(1)})`} />;
            })}
            <circle cx="0" cy="0" r="6" fill={YELLOW} stroke="#c9950f" strokeWidth="1" />
          </g>
        ))}

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
