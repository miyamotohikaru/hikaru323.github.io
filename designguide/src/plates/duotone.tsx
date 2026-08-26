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

        {/* 逆光。顔の前が白く、四隅へ落ちる。
            初稿は中間の灰色ばかりで、明部の色がほとんど出なかった。
            明るい所と暗い所をはっきり分けないと、2色にならない */}
        <radialGradient id={`${P}-bg`} cx="0.66" cy="0.33" r="0.56">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.17" stopColor="#efefef" />
          <stop offset="0.42" stopColor="#8e8e8e" />
          <stop offset="0.72" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#070707" />
        </radialGradient>
        {/* 影の側へわずかに回り込む光。真っ黒だと面が死ぬ */}
        <radialGradient id={`${P}-face`} cx="0.78" cy="0.34" r="0.7">
          <stop offset="0" stopColor="#5e5e5e" />
          <stop offset="0.45" stopColor="#1e1e1e" />
          <stop offset="1" stopColor="#070707" />
        </radialGradient>
        <filter id={`${P}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${P}-soft2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {/* 明部の版を締める。線形のままだと全面が明部の色に寄る */}
        <filter id={`${P}-boost`} x="0" y="0" width="100%" height="100%">
          <feComponentTransfer>
            <feFuncR type="gamma" exponent="2.2" />
            <feFuncG type="gamma" exponent="2.2" />
            <feFuncB type="gamma" exponent="2.2" />
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>

        {/* ── 明るさだけの絵。ここには灰色しか無い ─────────────── */}
        <g id={`${P}-art`}>
          <rect width="600" height="800" fill={`url(#${P}-bg)`} />
          {/* 顔の前の光源。ここがいちばん明るい */}
          <ellipse cx="430" cy="262" rx="120" ry="132" fill="#ffffff" opacity="0.85" filter={`url(#${P}-soft2)`} />

          {/* 逆光の人物。ほぼ黒の一塊。輪郭だけが絵になる */}
          <path
            fill="#0a0a0a"
            d="M 296,152
               C 330,154 356,174 368,204
               C 376,226 376,242 371,254
               C 369,260 367,264 369,270
               C 373,279 392,296 394,305
               C 396,314 387,316 378,313
               C 372,311 374,319 373,325
               C 372,332 379,334 381,338
               C 383,344 374,347 372,355
               C 370,365 377,373 379,380
               C 374,393 357,404 335,410
               C 321,414 310,416 300,418
               L 300,446
               C 300,466 316,478 340,486
               L 398,506
               C 440,522 460,562 466,628
               L 466,820 L 130,820 L 130,628
               C 136,564 156,526 194,508
               L 238,488
               C 252,480 258,466 258,448
               C 240,442 231,424 234,404
               C 220,390 216,362 226,342
               C 212,322 213,290 227,272
               C 216,248 221,214 236,194
               C 246,168 268,152 296,152 Z"
          />
          {/* 影の側の回り込み。頬骨と顎の稜線だけ */}
          <ellipse cx="316" cy="286" rx="62" ry="86" transform="rotate(6 316 286)" fill={`url(#${P}-face)`} opacity="0.9" />
          <ellipse cx="352" cy="300" rx="20" ry="34" transform="rotate(18 352 300)" fill="#6a6a6a" opacity="0.32" filter={`url(#${P}-soft)`} />
          {/* 目の窪み。ここが暗いと横顔になる */}
          <ellipse cx="344" cy="252" rx="15" ry="9" transform="rotate(-9 344 252)" fill="#000" opacity="0.6" filter={`url(#${P}-soft)`} />

          {/* マイクと腕。逆光の中に黒く立つ */}
          <path d="M 448,344 L 508,414" stroke="#080808" strokeWidth="17" strokeLinecap="round" />
          <circle cx="434" cy="330" r="25" fill="#080808" />
          <path d="M 470,560 C 512,530 528,472 508,420" fill="none" stroke="#080808" strokeWidth="44" strokeLinecap="round" />
          <ellipse cx="506" cy="410" rx="27" ry="23" transform="rotate(-32 506 410)" fill="#080808" />

          {/* ── 縁の光。逆光の主役はここ ───────────────────────── */}
          <g fill="none" stroke="#ffffff" strokeLinecap="round" filter={`url(#${P}-soft)`}>
            {/* 額から鼻・唇・顎まで。横顔はこの1本で決まる */}
            <path
              d="M 296,152 C 330,154 356,174 368,204 C 376,226 376,242 371,254
                 C 369,260 367,264 369,270 C 373,279 392,296 394,305
                 C 396,314 387,316 378,313 C 372,311 374,319 373,325
                 C 372,332 379,334 381,338 C 383,344 374,347 372,355
                 C 370,365 377,373 379,380 C 374,393 357,404 335,410"
              strokeWidth="7.5"
            />
            {/* 頭の天。髪の毛先が光る */}
            <path d="M 236,194 C 246,168 268,152 296,152" strokeWidth="4.5" opacity="0.62" />
            {/* 首から肩。光は右後ろから来る */}
            <path d="M 300,420 L 300,446 C 300,466 316,478 340,486 L 398,506 C 440,522 460,562 466,628 L 466,780" strokeWidth="6.5" opacity="0.9" />
            {/* マイクと腕の縁 */}
            <path d="M 452,312 C 462,322 462,340 452,350" strokeWidth="4" opacity="0.85" />
            <path d="M 508,420 C 528,472 512,530 472,558" strokeWidth="5" opacity="0.7" />
          </g>
          {/* 髪の房。数本だけ透ける */}
          <g fill="none" stroke="#dcdcdc" strokeLinecap="round" opacity="0.4" filter={`url(#${P}-soft)`}>
            <path d="M 244,246 C 248,214 262,186 284,170" strokeWidth="2.6" />
            <path d="M 232,320 C 230,290 234,262 244,238" strokeWidth="2.2" />
            <path d="M 240,404 C 234,382 232,358 236,336" strokeWidth="2" />
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
            <g transform="translate(498 146) scale(0.42) translate(-336 -300)">
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
