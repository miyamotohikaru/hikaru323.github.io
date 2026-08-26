/**
 * フルーティガー・エアロ。
 *
 * ■ Y2K と分ける
 *   あちらは金属（クローム）と樹脂。こちらはガラスと水と葉。
 *   あちらの光は「金属の映り込み」、こちらの光は「透けて抜ける光」。
 *   Y2K に星のきらめきを置いたので、こちらには一切置かない。
 *
 * ■ この様式の芯は「清潔」
 *   だから汚しを入れない。紙の目もほとんど効かせない。
 *   版面の6割を空と白に使い、色は空色・緑・白の3つに絞る。
 *
 * ■ 水滴の描き方
 *   輪郭を白で描いても水にならない。
 *   （1）上の縁を暗く（2）下の縁を明るく（3）左上に小さな鏡面
 *   （4）真下に薄い影。この4つが揃うと、初めて「濡れている」。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "fa";

const SKY = "#dff2fb";
const BLUE = "#3aa7e0";
const GREEN = "#7ed957";
const WHITE = "#ffffff";
const DEEP = "#1d5f8a";

/** 水滴。4つの約束（上を暗く・下を明るく・鏡面・影）を全部入れる */
function Drop({ x, y, rx, ry, rot = 0 }: { x: number; y: number; rx: number; ry: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx="1.5" cy={ry * 0.42} rx={rx * 0.94} ry={ry * 0.62} fill={DEEP} opacity="0.13" />
      <ellipse rx={rx} ry={ry} fill={`url(#${P}-drop)`} />
      <path d={`M${-rx} 0 A${rx} ${ry} 0 0 1 ${rx} 0`} fill="none" stroke={DEEP} strokeWidth="1.1" opacity="0.3" />
      <path d={`M${-rx} 0 A${rx} ${ry} 0 0 0 ${rx} 0`} fill="none" stroke={WHITE} strokeWidth="1.6" opacity="0.95" />
      <ellipse cx={-rx * 0.34} cy={-ry * 0.36} rx={rx * 0.3} ry={ry * 0.2} fill={WHITE} opacity="0.95"
               transform={`rotate(-28 ${-rx * 0.34} ${-ry * 0.36})`} />
      <ellipse cx={rx * 0.2} cy={ry * 0.42} rx={rx * 0.44} ry={ry * 0.2} fill={WHITE} opacity="0.5" />
    </g>
  );
}

/** 葉。中央脈と側脈を必ず引く。無いとただの緑の楕円になる */
function Leaf({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C46 -50 128 -62 176 -30 C132 24 48 34 0 0 Z" fill={`url(#${P}-leaf)`} />
      <path d="M0 0 C46 -50 128 -62 176 -30 C132 24 48 34 0 0 Z" fill="none" stroke="#3f9c34" strokeWidth="1.3" opacity="0.55" />
      <path d="M0 0 C60 -12 128 -22 176 -30" fill="none" stroke="#2f8a2a" strokeWidth="2" opacity="0.55" />
      {Array.from({ length: 7 }, (_, i) => {
        const t = 0.1 + i * 0.115;
        const bx = 176 * t, by = -30 * t - Math.sin(t * Math.PI) * 6;
        return (
          <g key={i} stroke="#3f9c34" strokeWidth="1" opacity="0.42" fill="none">
            <path d={`M${bx} ${by} Q${bx + 16} ${by - 24} ${bx + 34} ${by - 30}`} />
            <path d={`M${bx} ${by} Q${bx + 18} ${by + 14} ${bx + 38} ${by + 14}`} />
          </g>
        );
      })}
      {/* 葉の艶 */}
      <path d="M22 -8 C60 -40 112 -50 150 -36 C110 -28 62 -18 22 -8 Z" fill={WHITE} opacity="0.32" />
    </g>
  );
}

export default function Plate() {
  const r = rand(20061130);

  const bubbles = Array.from({ length: 13 }, () => ({
    x: r(30, 580), y: r(120, 700), R: r(6, 27),
  }));

  /* 草。下端から生やす。3層で奥行きを作る */
  const blades = Array.from({ length: 46 }, () => ({
    x: r(-20, 620), h: r(52, 168), lean: r(-46, 46), w: r(4, 11), layer: Math.floor(r(0, 3)),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="フルーティガー・エアロ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        <linearGradient id={`${P}-sky`} x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#59bdec" />
          <stop offset="0.4" stopColor="#9ed9f4" />
          <stop offset="0.74" stopColor={SKY} />
          <stop offset="1" stopColor="#f2fbff" />
        </linearGradient>
        <radialGradient id={`${P}-sun`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}-drop`} cx="0.36" cy="0.3">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#bfe6fa" stopOpacity="0.42" />
          <stop offset="0.86" stopColor="#7cc7ea" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id={`${P}-bub`} cx="0.34" cy="0.3">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.62" stopColor="#cdeafb" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id={`${P}-leaf`} x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0" stopColor="#4aa838" />
          <stop offset="0.55" stopColor={GREEN} />
          <stop offset="1" stopColor="#b6ee88" />
        </linearGradient>
        <linearGradient id={`${P}-grass`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2f8a2a" />
          <stop offset="1" stopColor="#9ee86a" />
        </linearGradient>
        {/* 硝子の玉。空の色を透かしつつ、下の縁で光を集める */}
        <radialGradient id={`${P}-orb`} cx="0.36" cy="0.28">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="0.34" stopColor="#bfe8fa" stopOpacity="0.72" />
          <stop offset="0.78" stopColor={BLUE} stopOpacity="0.62" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id={`${P}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${P}-swoosh`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#bfeaff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${P}-type`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.46" stopColor="#bfe6fa" />
          <stop offset="0.54" stopColor={BLUE} />
          <stop offset="1" stopColor={DEEP} />
        </linearGradient>

        <filter id={`${P}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`${P}-soft2`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={`${P}-drop2`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="11" floodColor="#12557f" floodOpacity="0.3" />
        </filter>
        <clipPath id={`${P}-orbclip`}><circle cx="390" cy="352" r="138" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="520" cy="70" r="230" fill={`url(#${P}-sun)`} />

        {/* 雲。輪郭を出さず、白い塊をぼかして置く。空は「抜け」であってほしい */}
        <g filter={`url(#${P}-soft)`} fill={WHITE}>
          {[[130, 210, 150, 34], [420, 168, 128, 26], [268, 300, 190, 30], [70, 380, 110, 22], [500, 340, 130, 26]].map(
            ([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} opacity={0.55 + i * 0.06} />,
          )}
        </g>

        {/* 帯（スウッシュ）。Vista の壁紙にあった、あの半透明のリボン */}
        <g>
          <path d="M-40 604 C120 552 190 402 350 344 C452 306 540 320 640 268 L640 356 C540 402 460 386 372 424 C232 484 168 610 -40 668 Z"
                fill={`url(#${P}-swoosh)`} />
          <path d="M-40 604 C120 552 190 402 350 344 C452 306 540 320 640 268"
                fill="none" stroke={WHITE} strokeWidth="2.4" opacity="0.85" />
          <path d="M-40 636 C130 580 200 428 356 372 C450 338 546 348 640 300"
                fill="none" stroke={WHITE} strokeWidth="1.2" opacity="0.5" />
        </g>

        {/* ── 硝子の玉。版面の主 ─────────────────────────────── */}
        <g filter={`url(#${P}-drop2)`}>
          <circle cx="390" cy="352" r="138" fill={`url(#${P}-orb)`} />
          <g clipPath={`url(#${P}-orbclip)`}>
            {/* 中に映るもの。空の白と、下の草の緑。境目は作らない */}
            <ellipse cx="386" cy="244" rx="176" ry="90" fill="#d8f2ff" opacity="0.75" filter={`url(#${P}-soft2)`} />
            <ellipse cx="394" cy="486" rx="152" ry="76" fill="#a8e88a" opacity="0.5" filter={`url(#${P}-soft)`} />
            {/* 下の縁に集まる光 */}
            <ellipse cx="392" cy="452" rx="104" ry="40" fill={WHITE} opacity="0.6" filter={`url(#${P}-soft2)`} />
            {/* 上半分の艶 */}
            <ellipse cx="382" cy="272" rx="112" ry="72" fill={`url(#${P}-gloss)`} />
          </g>
          <circle cx="390" cy="352" r="138" fill="none" stroke={WHITE} strokeWidth="2.4" opacity="0.9" />
          <circle cx="390" cy="352" r="138" fill="none" stroke={BLUE} strokeWidth="1" opacity="0.4" />
          <ellipse cx="344" cy="286" rx="42" ry="24" fill={WHITE} opacity="0.9" transform="rotate(-26 344 286)" />
          <circle cx="308" cy="322" r="8" fill={WHITE} opacity="0.85" />
        </g>

        {/* 玉に乗る水滴。硝子の上に水がある、という二重の透明 */}
        <Drop x={338} y={420} rx={19} ry={14} rot={-14} />
        <Drop x={432} y={262} rx={13} ry={10} rot={22} />
        <Drop x={470} y={392} rx={9} ry={7} rot={-6} />

        {/* ── 草と葉。清潔な自然。版面の下を緑で締める ───────────── */}
        <g>
          {blades
            .filter((b) => b.layer === 0)
            .map((b, i) => (
              <path key={i} opacity="0.55"
                    d={`M${b.x} 810 C${b.x + b.lean * 0.3} ${810 - b.h * 0.6} ${b.x + b.lean * 0.8} ${810 - b.h * 0.85} ${b.x + b.lean} ${810 - b.h}
                        C${b.x + b.lean * 0.7 + b.w} ${810 - b.h * 0.8} ${b.x + b.lean * 0.2 + b.w} ${810 - b.h * 0.5} ${b.x + b.w} 810 Z`}
                    fill="#5cbf46" />
            ))}
          <Leaf x={-30} y={730} s={0.98} rot={-16} />
          <Leaf x={470} y={790} s={0.86} rot={-152} />
          {blades
            .filter((b) => b.layer > 0)
            .map((b, i) => (
              <path key={i} opacity={b.layer === 1 ? 0.85 : 1}
                    d={`M${b.x} 810 C${b.x + b.lean * 0.3} ${810 - b.h * 0.6} ${b.x + b.lean * 0.8} ${810 - b.h * 0.85} ${b.x + b.lean} ${810 - b.h}
                        C${b.x + b.lean * 0.7 + b.w} ${810 - b.h * 0.8} ${b.x + b.lean * 0.2 + b.w} ${810 - b.h * 0.5} ${b.x + b.w} 810 Z`}
                    fill={`url(#${P}-grass)`} />
            ))}
        </g>
        {/* 葉の上の露 */}
        <Drop x={122} y={694} rx={16} ry={12} rot={-10} />
        <Drop x={186} y={716} rx={10} ry={7.5} rot={8} />

        {/* 泡。上へ抜ける */}
        {bubbles.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.R} fill={`url(#${P}-bub)`} />
            <circle cx={b.x} cy={b.y} r={b.R} fill="none" stroke={WHITE} strokeWidth="1.1" opacity="0.75" />
            <ellipse cx={b.x - b.R * 0.3} cy={b.y - b.R * 0.38} rx={b.R * 0.28} ry={b.R * 0.17} fill={WHITE} opacity="0.9" />
            <ellipse cx={b.x + b.R * 0.24} cy={b.y + b.R * 0.44} rx={b.R * 0.3} ry={b.R * 0.14} fill={WHITE} opacity="0.4" />
          </g>
        ))}

        {/* ── 文字。ヒューマニストの気配を出すため、細めで字間を開ける ── */}
        <g>
          <text x="46" y="118" fill={`url(#${P}-type`.concat(")")}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="92" fontWeight="300" letterSpacing="2">
            aero
          </text>
        </g>
        <text x="50" y="146" fill={DEEP} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10.5" fontWeight="500" letterSpacing="5.6" opacity="0.85">
          GLASS · WATER · LEAF · SKY
        </text>
        <line x1="50" y1="160" x2="330" y2="160" stroke={WHITE} strokeWidth="1.6" opacity="0.8" />

        {/* 小さな目盛りと注記。近くで見たときの細部 */}
        <g stroke={DEEP} strokeWidth="1" opacity="0.35">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1={50 + i * 12} y1="172" x2={50 + i * 12} y2={i % 4 === 0 ? 182 : 177} />
          ))}
        </g>
        <text x="50" y="200" fill={DEEP} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="9" letterSpacing="2.4" opacity="0.5">
          GLOSS 100% — CLEAN
        </text>

        <text x="556" y="778" textAnchor="end" fill={DEEP} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10" fontWeight="500" letterSpacing="3.4" opacity="0.6">
          2004—2013
        </text>

        {/* 汚しはほとんど掛けない。清潔がこの様式の主題なので */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.05" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
