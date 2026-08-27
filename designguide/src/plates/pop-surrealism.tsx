/**
 * ポップ・シュールレアリズム（ロウブロウ）。
 *
 * 1990年代アメリカ。マーク・ライデン、マリオン・ペック。
 * 漫画・玩具・広告の甘い意匠を、古典絵画の技術で丁寧に描く。
 * 甘さと不気味さは対立せず、同じ一枚の中で同時に成立している。
 *
 * ■ この版でやっていること
 *   1. 塗りを完全に滑らかにする。筆跡もかすれも網点も出さない。
 *      周りの79枚が版の痕跡で「作られ方」を語るのに対し、この様式は
 *      「作られ方が見えないこと」自体が意匠になっている。だから
 *      放射グラデーションを惜しまず使い、紙目もほとんど乗せない。
 *   2. 目を異様に大きくする。虹彩が白目をほぼ埋める比率まで上げると、
 *      可愛さが一段越えて不安になる。この一線がロウブロウの居場所。
 *   3. 楕円のヴィネットと細い金の罫で「大切に額装された標本」に仕立てる。
 *      額があるから、中の異形が「展示物」として提示される。
 *   4. 小さな寓意物を散らす。蜂・星・兎。説明はしない。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "pss";

const CREAM = "#f2e2e8";
const PINK = "#d94f8a";
const BLUE = "#5b7fd6";
const GOLD = "#f2c14e";
const PLUM = "#2a1f2e";
/* 5色から作った濃淡 */
const SKIN = "#fbf1ee";
const SKIN_SH = "#eed3d6";
const PINK_L = "#f0a8c4";
const BLUE_L = "#a8c0ef";
const BLUE_D = "#3a568f";
const GOLD_D = "#b8862c";
const PLUM_L = "#5b4a5e";

/* 楕円の額 */
const OX = 300;
const OY = 398;
const ORX = 214;
const ORY = 288;

export default function Plate() {
  const r = rand(19960712);

  /* 頭上の小さな星の環 */
  const stars = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI + (i / 12) * Math.PI;
    return { x: OX + Math.cos(a) * 156, y: 372 + Math.sin(a) * 150, s: 3.2 + (i % 3) * 1.6 };
  });

  const star = (x: number, y: number, s: number) =>
    `M${x} ${y - s} Q${x + s * 0.22} ${y - s * 0.22} ${x + s} ${y} Q${x + s * 0.22} ${y + s * 0.22} ${x} ${y + s} Q${x - s * 0.22} ${y + s * 0.22} ${x - s} ${y} Q${x - s * 0.22} ${y - s * 0.22} ${x} ${y - s}Z`;

  /* 蜂の飛跡。点線で描く。近くで見る細部 */
  const trail = Array.from({ length: 26 }, (_, i) => {
    const t = i / 25;
    const x = 132 + t * 300 + Math.sin(t * 9) * 26;
    const y = 250 - Math.sin(t * 3.4) * 58 + t * 30;
    return { x, y, r: 1.5 + Math.sin(t * 4) * 0.5 };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ポップ・シュールレアリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-oval`}>
          <ellipse cx={OX} cy={OY} rx={ORX} ry={ORY} />
        </clipPath>
        <radialGradient id={`${P}-sky`} cx="0.5" cy="0.34" r="0.78">
          <stop offset="0" stopColor="#fdf4f6" />
          <stop offset="0.45" stopColor={CREAM} />
          <stop offset="1" stopColor="#dcc4d4" />
        </radialGradient>
        <linearGradient id={`${P}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd9f2" />
          <stop offset="1" stopColor="#b6c6e8" />
        </linearGradient>
        <radialGradient id={`${P}-face`} cx="0.42" cy="0.34" r="0.76">
          <stop offset="0" stopColor="#fffaf8" />
          <stop offset="0.6" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SH} />
        </radialGradient>
        <radialGradient id={`${P}-blush`}>
          <stop offset="0" stopColor={PINK} stopOpacity="0.44" />
          <stop offset="1" stopColor={PINK} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-iris`} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#7fa2e8" />
          <stop offset="0.62" stopColor={BLUE} />
          <stop offset="1" stopColor={BLUE_D} />
        </radialGradient>
        <radialGradient id={`${P}-sclera`} cx="0.42" cy="0.36" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.72" stopColor="#f6eef2" />
          <stop offset="1" stopColor="#dcc8d2" />
        </radialGradient>
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.46" r="0.62">
          <stop offset="0.62" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor={PLUM} stopOpacity="0.34" />
        </radialGradient>
        <linearGradient id={`${P}-dress`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe4ee" />
          <stop offset="1" stopColor={PINK_L} />
        </linearGradient>
        {/* 額の外の地紋。細かい菱。近くで見ないと分からない程度に */}
        <pattern id={`${P}-lattice`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="none" />
          <circle cx="8" cy="8" r="1.1" fill={PINK} opacity="0.24" />
          <rect x="0" y="0" width="16" height="0.6" fill={PINK} opacity="0.1" />
          <rect x="0" y="0" width="0.6" height="16" fill={PINK} opacity="0.1" />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />
        <rect width="600" height="800" fill={`url(#${P}-lattice)`} />

        {/* ── 楕円の中。空と遠景 ─────────────────────────────────── */}
        <g clipPath={`url(#${P}-oval)`}>
          <rect x="80" y="100" width="440" height="600" fill={`url(#${P}-sky)`} />
          {/* 遠くの丘。ふたつだけ。甘い絵の奥はいつも空虚 */}
          <path d="M80 560 C 170 500 236 512 300 542 C 372 576 448 552 520 500 L520 700 L80 700 Z" fill={`url(#${P}-far)`} />
          <path d="M80 606 C 180 566 260 586 330 610 C 404 636 470 624 520 596 L520 700 L80 700 Z" fill="#9fb2dc" />
          {/* 雲。airbrush の柔らかい塊 */}
          <g fill="#ffffff" opacity="0.72">
            <ellipse cx="180" cy="216" rx="54" ry="20" />
            <ellipse cx="212" cy="206" rx="36" ry="16" />
            <ellipse cx="430" cy="266" rx="46" ry="17" />
            <ellipse cx="404" cy="258" rx="28" ry="12" />
          </g>

          {/* ── 少女 ──────────────────────────────────────────────── */}
          {/* 髪。頭の外側を包む塊。顔より先に置く */}
          <path
            d="M300 216 C 386 216 434 288 436 372 C 438 452 424 546 410 700 L372 700 C 386 566 396 470 392 400 C 388 330 356 292 300 292 C 244 292 212 330 208 400 C 204 470 214 566 228 700 L190 700 C 176 546 162 452 164 372 C 166 288 214 216 300 216 Z"
            fill={PLUM}
          />
          {/* 髪の艶。1本の柔らかい帯 */}
          <path d="M214 340 C 224 296 250 266 286 252 C 254 274 236 306 230 348 Z" fill={PLUM_L} opacity="0.55" />
          <path d="M386 344 C 378 300 356 270 322 254 C 352 278 368 308 372 350 Z" fill={PLUM_L} opacity="0.4" />
          <path d="M262 300 C 254 322 252 340 256 356 L246 356 C 242 338 244 318 252 298 Z" fill={PLUM} />
          <path d="M344 300 C 352 320 354 336 351 350 L360 350 C 364 334 362 316 354 298 Z" fill={PLUM} />

          {/* 首。ここを描かないと頭が胴に直接乗る */}
          <path d="M272 476 L328 476 L332 536 L268 536 Z" fill={SKIN} />
          <path d="M272 476 L328 476 L328 496 C 314 508 286 508 272 496 Z" fill={SKIN_SH} opacity="0.85" />
          {/* 胴。裾は肩幅の1.6倍まで。それ以上は卵になる */}
          <path d="M300 528 C 348 528 378 556 390 616 C 398 656 402 680 404 704 L196 704 C 198 680 202 656 210 616 C 222 556 252 528 300 528 Z" fill={`url(#${P}-dress)`} />
          <path d="M300 528 C 268 528 244 542 230 566 C 250 548 274 540 300 540 C 326 540 350 548 370 566 C 356 542 332 528 300 528 Z" fill="#ffffff" opacity="0.5" />
          {/* レースの襟。近くで見る細部 */}
          <g fill="#ffffff" opacity="0.95">
            <path d="M254 534 C 272 556 328 556 346 534 C 338 568 262 568 254 534 Z" />
            {Array.from({ length: 13 }, (_, i) => {
              const a = Math.PI * (0.1 + (i / 12) * 0.8);
              return <circle key={`lc${i}`} cx={300 - Math.cos(a) * 52} cy={546 + Math.sin(a) * 20} r="5.4" />;
            })}
          </g>
          <g stroke={PINK_L} strokeWidth="1" fill="none" opacity="0.8">
            {Array.from({ length: 5 }, (_, i) => (
              <path key={`fd${i}`} d={`M${244 + i * 28} 604 C ${240 + i * 32} 646 ${238 + i * 34} 674 ${234 + i * 36} 704`} />
            ))}
          </g>

          {/* 顔 */}
          <ellipse cx="300" cy="382" rx="118" ry="128" fill={`url(#${P}-face)`} />
          {/* 前髪。額を丸く覆う */}
          <path
            d="M300 248 C 378 248 402 300 398 352 C 388 318 350 298 300 298 C 250 298 212 318 202 352 C 198 300 222 248 300 248 Z"
            fill={PLUM}
          />
          {/* 頬の紅。airbrush */}
          <ellipse cx="234" cy="412" rx="34" ry="24" fill={`url(#${P}-blush)`} />
          <ellipse cx="366" cy="412" rx="34" ry="24" fill={`url(#${P}-blush)`} />

          {/* 目。虹彩が白目をほぼ埋める。ここが甘さと不安の分かれ目 */}
          {[252, 348].map((ex, i) => (
            <g key={`ey${i}`}>
              <ellipse cx={ex} cy="392" rx="36" ry="38" fill={`url(#${P}-sclera)`} />
              <circle cx={ex} cy="394" r="30" fill={`url(#${P}-iris)`} />
              {/* 虹彩の放射。近くで見ると筋が見える */}
              <g stroke={BLUE_D} strokeWidth="1" opacity="0.5">
                {Array.from({ length: 26 }, (_, k) => {
                  const a = (k / 26) * Math.PI * 2;
                  return (
                    <line key={`ir${k}`}
                          x1={ex + Math.cos(a) * 13} y1={394 + Math.sin(a) * 13}
                          x2={ex + Math.cos(a) * (26 + r(-3, 3))} y2={394 + Math.sin(a) * (26 + r(-3, 3))} />
                  );
                })}
              </g>
              <circle cx={ex} cy="394" r="30" fill="none" stroke={PLUM} strokeWidth="2.4" opacity="0.7" />
              <circle cx={ex} cy="394" r="13" fill={PLUM} />
              {/* ハイライト。大小2つ。これで生気が出る */}
              <circle cx={ex - 11} cy="382" r="8.5" fill="#ffffff" />
              <circle cx={ex + 10} cy="404" r="4" fill="#ffffff" opacity="0.85" />
              {/* 上瞼と睫毛 */}
              <path d={`M${ex - 38} 384 C ${ex - 26} 350 ${ex + 26} 350 ${ex + 38} 384 C ${ex + 24} 364 ${ex - 24} 364 ${ex - 38} 384 Z`} fill={PLUM} />
              <g stroke={PLUM} strokeWidth="2.4" strokeLinecap="round">
                <line x1={ex - 34} y1={372} x2={ex - 46} y2={358} />
                <line x1={ex - 20} y1={362} x2={ex - 27} y2={344} />
                <line x1={ex + 2} y1={358} x2={ex + 1} y2={338} />
                <line x1={ex + 22} y1={362} x2={ex + 30} y2={345} />
              </g>
              {/* 下瞼の影 */}
              <path d={`M${ex - 32} 410 C ${ex - 20} 430 ${ex + 20} 430 ${ex + 32} 410`} fill="none" stroke={SKIN_SH} strokeWidth="2.6" />
              {/* 眉。細く高く */}
              <path d={`M${ex - 28} 334 C ${ex - 12} 320 ${ex + 14} 320 ${ex + 28} 332`} fill="none" stroke={PLUM} strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
            </g>
          ))}

          {/* 鼻。点2つだけ */}
          <ellipse cx="292" cy="440" rx="3" ry="2.2" fill={SKIN_SH} />
          <ellipse cx="308" cy="440" rx="3" ry="2.2" fill={SKIN_SH} />
          {/* 口。小さな薔薇 */}
          <path d="M286 466 C 293 461 300 464 300 466 C 300 464 307 461 314 466 C 310 478 302 482 300 482 C 298 482 290 478 286 466 Z" fill={PINK} />
          <path d="M290 468 C 296 471 304 471 310 468" fill="none" stroke="#9c2f5e" strokeWidth="1.2" />

          {/* 頭上の光輪と星 */}
          <ellipse cx={OX} cy="238" rx="112" ry="26" fill="none" stroke={GOLD} strokeWidth="3" opacity="0.9" />
          <ellipse cx={OX} cy="238" rx="112" ry="26" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          <g fill={GOLD}>
            {stars.map((s, i) => (
              <path key={`sr${i}`} d={star(s.x, s.y, s.s)} opacity={0.7 + (i % 3) * 0.1} />
            ))}
          </g>

          {/* 蜂の飛跡と蜂。寓意は説明しない */}
          <g fill={PLUM} opacity="0.5">
            {trail.map((t, i) => (
              <circle key={`tr${i}`} cx={t.x} cy={t.y} r={t.r} />
            ))}
          </g>
          <g transform="translate(432 278) rotate(-16)">
            <ellipse cx="0" cy="0" rx="11" ry="7.5" fill={GOLD} />
            <path d="M-11 0 A11 7.5 0 0 1 11 0 Z" fill="#fff" opacity="0.25" />
            <rect x="-4" y="-7.5" width="4" height="15" fill={PLUM} />
            <rect x="4" y="-6.6" width="3.4" height="13.2" fill={PLUM} />
            <ellipse cx="-12" cy="-1" rx="4" ry="4.4" fill={PLUM} />
            <ellipse cx="-1" cy="-9" rx="9" ry="4.4" fill="#ffffff" opacity="0.72" transform="rotate(-24 -1 -9)" />
            <ellipse cx="4" cy="-9" rx="7" ry="3.6" fill="#ffffff" opacity="0.6" transform="rotate(18 4 -9)" />
          </g>


          {/* 兎。胴より手前に、右下からのぞかせる */}
          <g transform="translate(214 650) scale(0.82)">
            <ellipse cx="0" cy="26" rx="34" ry="26" fill="#fdf6f8" />
            <ellipse cx="24" cy="2" rx="19" ry="17" fill="#fdf6f8" />
            <ellipse cx="18" cy="-24" rx="5.4" ry="20" fill="#fdf6f8" transform="rotate(-10 18 -24)" />
            <ellipse cx="31" cy="-24" rx="5" ry="19" fill="#fdf6f8" transform="rotate(9 31 -24)" />
            <ellipse cx="18" cy="-24" rx="2.6" ry="14" fill={PINK_L} transform="rotate(-10 18 -24)" />
            <ellipse cx="31" cy="-24" rx="2.4" ry="13" fill={PINK_L} transform="rotate(9 31 -24)" />
            <circle cx="30" cy="-2" r="3.4" fill={PLUM} />
            <circle cx="31" cy="-3" r="1.2" fill="#ffffff" />
            <ellipse cx="41" cy="6" rx="3" ry="2.2" fill={PINK} />
          </g>

          {/* ヴィネット。縁を落として「額装された」感じにする */}
          <rect x="80" y="100" width="440" height="600" fill={`url(#${P}-vig)`} />
        </g>

        {/* ── 額。細い金の二重罫と四隅の飾り ─────────────────────── */}
        <ellipse cx={OX} cy={OY} rx={ORX} ry={ORY} fill="none" stroke={GOLD_D} strokeWidth="7" />
        <ellipse cx={OX} cy={OY} rx={ORX} ry={ORY} fill="none" stroke={GOLD} strokeWidth="3.4" />
        <ellipse cx={OX} cy={OY} rx={ORX - 9} ry={ORY - 9} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.7" />
        <g fill={GOLD} opacity="0.9">
          {([[300, 110, 0], [300, 686, 180], [86, 398, -90], [514, 398, 90]] as number[][]).map(([x, y, rot], i) => (
            <g key={`or${i}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <path d="M0 -14 C 16 -14 22 -4 14 4 C 8 10 -8 10 -14 4 C -22 -4 -16 -14 0 -14 Z" />
              <path d="M-30 2 C -18 -6 -8 -6 0 0 C 8 -6 18 -6 30 2 C 18 -1 8 2 0 6 C -8 2 -18 -1 -30 2 Z" />
              <circle cx="0" cy="-2" r="4" fill={CREAM} />
            </g>
          ))}
        </g>

        {/* ── 題字と札 ───────────────────────────────────────────── */}
        <text
          x="300" y="62"
          fill={PLUM}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="21"
          letterSpacing="9"
        >
          POP SURREALISM
        </text>
        <rect x="196" y="72" width="208" height="0.9" fill={GOLD_D} opacity="0.8" />
        <text
          x="300" y="90"
          fill={PLUM_L}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="9.5"
          letterSpacing="3.4"
        >
          LOWBROW — CALIFORNIA — MCMXCIV
        </text>

        {/* 標本札。甘い絵に事務的な札を添えると不穏になる */}
        <g>
          <path d="M148 720 L452 720 L440 762 L160 762 Z" fill="#fdf6f8" stroke={GOLD_D} strokeWidth="1.4" />
          <path d="M148 720 L452 720 L450 726 L150 726 Z" fill={GOLD} opacity="0.5" />
          <text
            x="300" y="742"
            fill={PLUM}
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="15"
            fontStyle="italic"
          >
            The Little Empress of Bees
          </text>
          <text
            x="300" y="756"
            fill={PLUM_L}
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="8.5"
            letterSpacing="2.4"
          >
            SPECIMEN No. VII — OIL ON PANEL — 21 × 28 IN.
          </text>
        </g>

        {/* 紙の目はごく薄く。滑らかさを壊さない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.07"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
