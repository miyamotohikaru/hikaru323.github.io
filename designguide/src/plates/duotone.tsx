/**
 * デュオトーン。
 *
 * 写真を「明るさ」1本に潰し、その1本を2色の間に割り振る。
 * Spotify が2015年に全面採用して一般名詞になった手つき。
 *
 * ■ ここで作っている「らしさ」
 *   1. 写真を持ち込めないので、まず「明るさだけの絵」を描いた。
 *      逆光の人物。地は白から黒へ落ちる放射、人物はほぼ黒、
 *      輪郭にだけ光の縁が乗る。ここまでは灰色しか使っていない。
 *   2. その灰色の絵を <mask> にして、2色を敷く。
 *      いちばん下に暗部の色、その上に輝度で抜いた明部の色。
 *      つまりこの図版は「写真に色を塗った」のではなく、
 *      本当に輝度1本を2色へ写している。だから中間調が
 *      2色の混じり（紫）になる。ここが本物との分かれ目で、
 *      暗部と明部に別々の絵を描いて重ねると、絶対にこの紫は出ない。
 *   3. 明部の版だけ、ガンマを掛けて締める。
 *      線形のまま重ねると全面が明部の色に寄って、2色に見えない。
 *   4. 右上に元の灰色を小さく出した。何を写しているかが分かる。
 */
import { ATLAS, shift } from "@/lib/plate";

const P = "duo";
const NAVY = "#1a1a2e";
const PINK = "#ff4d6d";
const CYAN = "#4cc9f0";
const WHITE = "#f2f2f2";
const DEEP = shift(PINK, -0.62); // 輝度0の色。暗部の色をそのまま暗くする

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="デュオトーン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-inset`}><rect x="440" y="88" width="116" height="116" /></clipPath>

        {/* 逆光。頭の後ろが白く、四隅へ落ちる */}
        <radialGradient id={`${P}-bg`} cx="0.5" cy="0.34" r="0.66">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.26" stopColor="#c8c8c8" />
          <stop offset="0.58" stopColor="#5a5a5a" />
          <stop offset="1" stopColor="#080808" />
        </radialGradient>
        {/* 顔に回り込む弱い光。真っ黒だと面が死ぬ */}
        <radialGradient id={`${P}-face`} cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#8a8a8a" />
          <stop offset="0.55" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#0e0e0e" />
        </radialGradient>
        {/* 胸元へ向かって落ちる */}
        <linearGradient id={`${P}-body`} x1="0" y1="0.32" x2="0.2" y2="1">
          <stop offset="0" stopColor="#2e2e2e" />
          <stop offset="0.5" stopColor="#141414" />
          <stop offset="1" stopColor="#060606" />
        </linearGradient>
        {/* 縁の光。芯が白く、外へぼける */}
        <filter id={`${P}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${P}-soft2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        {/* 明部の版を締める。線形のままだと全面が明部の色に寄る */}
        <filter id={`${P}-boost`} x="0" y="0" width="100%" height="100%">
          <feComponentTransfer>
            <feFuncR type="gamma" exponent="2.9" />
            <feFuncG type="gamma" exponent="2.9" />
            <feFuncB type="gamma" exponent="2.9" />
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>

        {/* ── 明るさだけの絵。ここには灰色しか無い ─────────────── */}
        <g id={`${P}-art`}>
          <rect width="600" height="800" fill={`url(#${P}-bg)`} />
          {/* 後光。頭のすぐ後ろが強い */}
          <ellipse cx="300" cy="248" rx="176" ry="196" fill="#ffffff" opacity="0.5" filter={`url(#${P}-soft2)`} />

          {/* 髪と頭。人物は塊としてほぼ黒 */}
          <path
            d="M 300,112 C 376,112 428,170 428,246 C 428,292 416,330 398,358
               L 402,430 C 404,452 386,466 356,470 L 244,470 C 214,466 196,452 198,430
               L 202,358 C 184,330 172,292 172,246 C 172,170 224,112 300,112 Z"
            fill="#101010"
          />
          {/* 顔。回り込む光 */}
          <ellipse cx="316" cy="268" rx="62" ry="79" transform="rotate(4 316 268)" fill={`url(#${P}-face)`} />
          {/* 目・鼻・口。明るさの段差だけで置く */}
          <g fill="#000000" opacity="0.72">
            <ellipse cx="292" cy="256" rx="13" ry="6" transform="rotate(-7 292 256)" />
            <ellipse cx="344" cy="252" rx="12" ry="6" transform="rotate(-7 344 252)" />
          </g>
          <path d="M 318,266 C 316,286 312,296 306,300 C 312,304 320,304 326,300" fill="none" stroke="#000" strokeWidth="3" opacity="0.5" />
          <path d="M 298,318 C 310,313 330,313 342,318 C 330,328 310,328 298,318 Z" fill="#000" opacity="0.55" />
          <path d="M 300,314 C 312,310 330,310 340,314" fill="none" stroke="#9a9a9a" strokeWidth="2" opacity="0.5" />
          {/* 頬骨の照り。逆光でも頬の稜線には光が乗る */}
          <ellipse cx="356" cy="272" rx="18" ry="30" transform="rotate(16 356 272)" fill="#8a8a8a" opacity="0.5" filter={`url(#${P}-soft)`} />

          {/* 首と胴 */}
          <path d="M 272,336 L 350,336 L 350,412 L 272,412 Z" fill="#0a0a0a" />
          <path
            d="M 300,396 C 254,402 212,424 182,456 C 150,488 136,542 132,612 L 132,820 L 470,820 L 470,612 C 466,542 450,488 418,456 C 388,424 346,402 300,396 Z"
            fill={`url(#${P}-body)`}
          />
          {/* 上げた腕。太い線を1本引いて腕にする */}
          <path d="M 434,510 C 476,478 492,428 472,394 C 452,360 414,344 386,340"
            fill="none" stroke="#0d0d0d" strokeWidth="46" strokeLinecap="round" />
          <ellipse cx="382" cy="336" rx="26" ry="22" transform="rotate(-24 382 336)" fill="#0d0d0d" />
          {/* マイク。玉と柄 */}
          <path d="M 392,352 L 352,312" stroke="#0d0d0d" strokeWidth="17" strokeLinecap="round" />
          <circle cx="342" cy="302" r="25" fill="#121212" />
          <circle cx="334" cy="294" r="9" fill="#8e8e8e" opacity="0.55" filter={`url(#${P}-soft)`} />

          {/* ── 縁の光。逆光の主役はここ ───────────────────────── */}
          <g fill="none" stroke="#ffffff" strokeLinecap="round" filter={`url(#${P}-soft)`}>
            <path d="M 202,352 C 182,322 172,286 172,246 C 172,178 214,124 278,114" strokeWidth="11" opacity="0.95" />
            <path d="M 278,114 C 296,111 314,111 332,114" strokeWidth="7" opacity="0.6" />
            <path d="M 198,432 L 194,466" strokeWidth="8" opacity="0.7" />
            <path d="M 182,456 C 150,488 136,542 132,612 L 132,780" strokeWidth="9" opacity="0.85" />
            <path d="M 472,394 C 492,430 476,478 436,508" strokeWidth="7" opacity="0.55" />
            <path d="M 256,232 C 248,268 254,304 272,328" strokeWidth="4" opacity="0.7" />
          </g>
          {/* 髪の房。逆光で数本だけ透ける */}
          <g fill="none" stroke="#e8e8e8" strokeLinecap="round" opacity="0.5" filter={`url(#${P}-soft)`}>
            <path d="M 214,206 C 226,168 258,140 296,132" strokeWidth="3" />
            <path d="M 206,268 C 204,232 214,196 234,170" strokeWidth="2.6" />
            <path d="M 396,214 C 396,178 374,146 344,130" strokeWidth="2.6" opacity="0.6" />
            <path d="M 204,330 C 198,306 196,286 198,264" strokeWidth="2.4" />
          </g>
        </g>

        {/* 輝度そのもの＝暗部→明部の割り振り */}
        <mask id={`${P}-lum`}><use href={`#${P}-art`} /></mask>
        {/* 明部の版。ガンマで締めてから使う */}
        <mask id={`${P}-hi`}>
          <g filter={`url(#${P}-boost)`}><use href={`#${P}-art`} /></g>
        </mask>

        {/* 版面の下を締める帳。文字を読ませるため */}
        <linearGradient id={`${P}-scrim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={NAVY} stopOpacity="0" />
          <stop offset="0.55" stopColor={NAVY} stopOpacity="0.72" />
          <stop offset="1" stopColor={NAVY} stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id={`${P}-ramp`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={DEEP} />
          <stop offset="0.42" stopColor={PINK} />
          <stop offset="1" stopColor={CYAN} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── ここが技法そのもの。3行で写真が2色になる ───────────── */}
        <rect width="600" height="800" fill={DEEP} />
        <rect width="600" height="800" fill={PINK} mask={`url(#${P}-lum)`} />
        <rect width="600" height="800" fill={CYAN} mask={`url(#${P}-hi)`} />

        {/* 写真の粒。2色に潰しても粒だけは残る */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.16" style={{ mixBlendMode: "overlay" }} />

        {/* 元の灰色。何を写しているかを小さく出す */}
        <g>
          <rect x="436" y="84" width="124" height="124" fill={NAVY} />
          <g clipPath={`url(#${P}-inset)`}>
            <g transform="translate(498 146) scale(0.42) translate(-300 -272)">
              <use href={`#${P}-art`} />
            </g>
          </g>
          <rect x="440" y="88" width="116" height="116" fill="none" stroke={WHITE} strokeWidth="1" opacity="0.5" />
          <text x="440" y="224" fill={WHITE}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="9.5" fontWeight="700" letterSpacing="2.4" opacity="0.75">
            SOURCE — 1 CHANNEL
          </text>
        </g>

        {/* 帳と文字 */}
        <rect x="0" y="520" width="600" height="280" fill={`url(#${P}-scrim)`} />
        <text
          x="44" y="700" fill={WHITE}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="62" fontWeight="800" letterSpacing="-2"
        >
          DUOTONE
        </text>
        <text
          x="47" y="726" fill={CYAN}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="11" fontWeight="700" letterSpacing="4.6"
        >
          ONE CHANNEL — TWO INKS
        </text>

        {/* 割り振りの帯。左が暗部、右が明部 */}
        <g>
          <rect x="44" y="748" width="330" height="16" fill={`url(#${P}-ramp)`} />
          <g stroke={WHITE} strokeWidth="1" opacity="0.65">
            {Array.from({ length: 11 }, (_, i) => (
              <line key={i} x1={44 + i * 33} y1="764" x2={44 + i * 33} y2={i % 5 === 0 ? 774 : 769} />
            ))}
          </g>
          <text x="44" y="788" fill={WHITE}
            fontFamily="'Courier New', ui-monospace, monospace"
            fontSize="9" fontWeight="700" letterSpacing="2" opacity="0.8">
            L=0 SHADOW
          </text>
          <text x="374" y="788" textAnchor="end" fill={WHITE}
            fontFamily="'Courier New', ui-monospace, monospace"
            fontSize="9" fontWeight="700" letterSpacing="2" opacity="0.8">
            L=1 HIGHLIGHT
          </text>
        </g>
        {/* 2つのインクの見本 */}
        <g>
          {[
            { c: PINK, t: "SHADOW INK" },
            { c: CYAN, t: "HIGHLIGHT INK" },
          ].map((s, i) => (
            <g key={i} transform={`translate(410 ${706 + i * 34})`}>
              <rect width="26" height="26" fill={s.c} />
              <text x="36" y="18" fill={WHITE}
                fontFamily="'Courier New', ui-monospace, monospace"
                fontSize="10" fontWeight="700" letterSpacing="1.6" opacity="0.85">
                {s.t}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
