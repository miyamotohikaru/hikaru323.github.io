/**
 * スカンジナビアン・モダン。
 *
 * 北欧の冬は日が低く短い。だからこの様式の主題は家具ではなく「光」で、
 * 白木も淡い中間色も、少ない光をできるだけ返すための選択になっている。
 * よって図版は「窓から落ちる雪明かりの床の四角」を主役に据えた。
 * 家具を並べただけでは、隣の mid-century-modern と同じ絵になる。
 *
 * ■ この様式を決めている4つ
 *   1. 床に落ちる窓の影。桟の格子がそのまま床に写る。北欧の写真は
 *      ほぼ必ずこれが写っている。図版の構図もこれで決めた。
 *   2. 影が長く、輪郭が甘いこと。硬い影を落とすと南欧の光になる。
 *      ぼかしは使わず、透明度の違う層を重ねて甘さを作っている。
 *   3. 白木の細い丸棒。背の細桟。削って細くするほど北欧に寄る。
 *   4. 余白。物を足したくなったら1つ引く。空けた床が「明るさ」になる。
 *
 * ■ 色
 *   spine の5色は彩度が低く、放っておくと絵が眠くなる。
 *   紙の白（#f4f1ea）と、光の当たった床の白を2段に分けて、
 *   いちばん明るい面をはっきり作ることで締めた。
 */
import { ATLAS, rand } from "@/lib/plate";

/* 北欧は淡い様式だが、**淡いことと薄いことは違う。**
   前の版は壁・床・木・布がすべて同じ明るさの帯に入っていて、
   185pxの一覧では白紙のカードに見えた。
   陽の当たる床だけを紙より明るく残し、それ以外の面を一段ずつ落とした。
   淡さは保ったまま、明暗の幅（レンジ）だけを広げてある */
const P = "scn";

const PAPER = "#f4f1ea";
const MINT = "#c9d6cd";
const PINK = "#d9a48f";
const SAGE = "#7f8a7a";
const INK = "#2e2b26";

/* 5色から作った中間色。白木は紙とピンクの間の低彩度 */
const WOOD = "#cfb193";
const WOOD_D = "#8b6f58";
const WOOD_L = "#ecdcc7";
const FLOOR = "#d7ccb6";
const WALL = "#e9e3d6";

const HORIZON = 526; // 壁と床の境
const WX0 = 296;
const WX1 = 556;
const WY0 = 56;
const WY1 = 430;

/* 床に落ちる光の四角。4隅を決め、双一次で内部の桟を割る */
const CA = [272, HORIZON + 2];
const CB = [468, HORIZON + 2];
const CC = [556, 800];
const CD = [54, 800];
const q = (u: number, v: number): [number, number] => [
  (1 - v) * ((1 - u) * CA[0] + u * CB[0]) + v * ((1 - u) * CD[0] + u * CC[0]),
  (1 - v) * ((1 - u) * CA[1] + u * CB[1]) + v * ((1 - u) * CD[1] + u * CC[1]),
];

export default function Plate() {
  const r = rand(19540121);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="スカンジナビアン・モダン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-patch`}>
          <polygon points={`${CA} ${CB} ${CC} ${CD}`} />
        </clipPath>
        <clipPath id={`${P}-win`}><rect x={WX0 + 9} y={WY0 + 9} width={WX1 - WX0 - 18} height={WY1 - WY0 - 18} /></clipPath>

        {/* 窓の外。雪の日。空と雪原の境がほとんど無い */}
        <linearGradient id={`${P}-out`} x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0" stopColor="#dfe7e2" />
          <stop offset="0.62" stopColor="#eef2ee" />
          <stop offset="0.64" stopColor="#f8f7f2" />
          <stop offset="1" stopColor="#eceae2" />
        </linearGradient>
        {/* 床の光。窓に近い右上が明るく、左下へ抜ける */}
        <linearGradient id={`${P}-light`} x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
        {/* 甘い影。輪郭を持たせない */}
        <radialGradient id={`${P}-soft`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={INK} stopOpacity="0.2" />
          <stop offset="0.6" stopColor={INK} stopOpacity="0.08" />
          <stop offset="1" stopColor={INK} stopOpacity="0" />
        </radialGradient>
        {/* 壁の光。窓側が明るい */}
        <linearGradient id={`${P}-wall`} x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* 紙の提灯 */}
        <radialGradient id={`${P}-lamp`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.7" stopColor="#f0ebdd" />
          <stop offset="1" stopColor="#ddd5c3" />
        </radialGradient>
        {/* ペーパーコードの座。細い横の織り */}
        <pattern id={`${P}-cord`} width="6" height="5" patternUnits="userSpaceOnUse">
          <rect width="6" height="5" fill={WOOD_L} />
          <rect y="3.4" width="6" height="1.6" fill={WOOD_D} opacity="0.45" />
          <rect x="2.8" width="0.9" height="5" fill={WOOD_D} opacity="0.2" />
        </pattern>
        {/* 織物。粗い平織り */}
        <pattern id={`${P}-weave`} width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="none" />
          <rect y="2.4" width="5" height="1" fill="#ffffff" opacity="0.3" />
          <rect x="2.4" width="1" height="5" fill={INK} opacity="0.08" />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 壁と床 ─────────────────────────────────────── */}
        <rect width="600" height={HORIZON} fill={WALL} />
        <rect y={HORIZON} width="600" height={800 - HORIZON} fill={FLOOR} />
        <rect width="600" height={HORIZON} fill={`url(#${P}-wall)`} />
        {/* 幅木。細く、白木で */}
        <rect y={HORIZON - 9} width="600" height="9" fill={WOOD_L} />
        <rect y={HORIZON - 10} width="600" height="1.4" fill={WOOD_D} opacity="0.5" />
        {/* 床板。幅広の縦張り。北欧の床は幅が広い */}
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const x = i * 68 - 10;
            return (
              <g key={i}>
                <line x1={x} y1={HORIZON} x2={x - 22} y2="800" stroke={WOOD_D} strokeWidth="1.2" opacity="0.32" />
                {[0.25, 0.6].map((t, k) => (
                  <path
                    key={k}
                    d={`M${x + 14 + k * 22} ${HORIZON} C ${x + 8 + k * 22} 620 ${x + 4 + k * 22} 700 ${x - 8 + k * 22} 800`}
                    stroke={WOOD_D}
                    strokeWidth="0.8"
                    opacity="0.14"
                    fill="none"
                  />
                ))}
              </g>
            );
          })}
        </g>

        {/* ── 床に落ちる雪明かり。この図版の主役 ─────────────── */}
        <g clipPath={`url(#${P}-patch)`}>
          <polygon points={`${CA} ${CB} ${CC} ${CD}`} fill={`url(#${P}-light)`} />
          {/* 桟の影。窓の割りがそのまま床に写る */}
          <g stroke={FLOOR} strokeWidth="9" opacity="0.62">
            <line x1={q(0.5, 0)[0]} y1={q(0.5, 0)[1]} x2={q(0.5, 1)[0]} y2={q(0.5, 1)[1]} />
            {[0.33, 0.66].map((v, i) => (
              <line key={i} x1={q(0, v)[0]} y1={q(0, v)[1]} x2={q(1, v)[0]} y2={q(1, v)[1]} />
            ))}
          </g>
          {/* 枠の影 */}
          <g stroke={FLOOR} strokeWidth="13" opacity="0.5" fill="none">
            <polygon points={`${CA} ${CB} ${CC} ${CD}`} />
          </g>
        </g>

        {/* ── 窓 ─────────────────────────────────────────── */}
        <rect x={WX0} y={WY0} width={WX1 - WX0} height={WY1 - WY0} fill={WOOD_L} />
        <rect x={WX0} y={WY0} width={WX1 - WX0} height={WY1 - WY0} fill="none" stroke={WOOD_D} strokeWidth="1.2" opacity="0.55" />
        <rect x={WX0 + 9} y={WY0 + 9} width={WX1 - WX0 - 18} height={WY1 - WY0 - 18} fill={`url(#${P}-out)`} />
        <g clipPath={`url(#${P}-win)`}>
          {/* 遠い針葉樹の列。雪の日はほとんど影だけ */}
          {Array.from({ length: 16 }, (_, i) => {
            const x = WX0 + r(0, WX1 - WX0);
            const h = r(20, 46);
            const w = h * 0.34;
            return (
              <path
                key={i}
                d={`M${x} ${WY0 + 248 - h} L${x + w} ${WY0 + 250} L${x - w} ${WY0 + 250} Z`}
                fill={SAGE}
                opacity={r(0.16, 0.34)}
              />
            );
          })}
          {/* 白樺。窓のなかの一番濃い線。ここだけ輪郭が硬い */}
          <g stroke="#b9b6ac" fill="none" strokeLinecap="round">
            <path d="M470 430 C 464 340 476 260 468 150" strokeWidth="5.5" />
            <path d="M469 246 C 496 224 506 196 508 168" strokeWidth="2.6" />
            <path d="M470 300 C 442 286 428 262 424 236" strokeWidth="2.4" />
            <path d="M468 190 C 486 176 492 156 492 138" strokeWidth="1.8" />
            <path d="M469 214 C 450 200 444 184 442 168" strokeWidth="1.6" />
          </g>
          {/* 幹の横皺。白樺はこれで白樺になる */}
          <g stroke="#8f8c84" strokeWidth="1.4" opacity="0.6">
            {Array.from({ length: 12 }, (_, i) => {
              const y = 150 + i * 23;
              return <line key={i} x1={466 - r(0, 3)} y1={y} x2={472 + r(0, 3)} y2={y} />;
            })}
          </g>
          {/* 雪。粒は少なく、大きく */}
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={WX0 + r(0, WX1 - WX0)} cy={WY0 + r(0, WY1 - WY0)} r={r(1.2, 3)} fill="#ffffff" opacity={r(0.4, 0.9)} />
          ))}
        </g>
        {/* 桟。細く。太いと山小屋になる */}
        <g fill={WOOD_L}>
          <rect x={(WX0 + WX1) / 2 - 3} y={WY0 + 9} width="6" height={WY1 - WY0 - 18} />
          {[0.33, 0.66].map((v, i) => (
            <rect key={i} x={WX0 + 9} y={WY0 + 9 + (WY1 - WY0 - 18) * v} width={WX1 - WX0 - 18} height="6" />
          ))}
        </g>
        {/* 窓台。奥行きを一段 */}
        <rect x={WX0 - 12} y={WY1} width={WX1 - WX0 + 24} height="12" fill={WOOD_L} />
        <rect x={WX0 - 12} y={WY1 + 12} width={WX1 - WX0 + 24} height="4" fill={WOOD_D} opacity="0.45" />
        {/* 窓台の上の器。ここに小さな細部を1つ置く */}
        <g>
          <ellipse cx="330" cy={WY1 - 2} rx="15" ry="4" fill={INK} opacity="0.08" />
          <path d={`M320 ${WY1 - 2} C 316 ${WY1 - 26} 344 ${WY1 - 26} 340 ${WY1 - 2} Z`} fill={PINK} />
          <path d={`M320 ${WY1 - 2} C 318 ${WY1 - 16} 324 ${WY1 - 24} 328 ${WY1 - 26} C 322 ${WY1 - 20} 322 ${WY1 - 10} 324 ${WY1 - 2} Z`} fill="#e8bfae" />
          {[[-9, -46], [2, -52], [10, -42]].map(([dx, dy], i) => (
            <path key={i} d={`M330 ${WY1 - 24} C ${330 + dx * 0.5} ${WY1 - 34} ${330 + dx} ${WY1 + dy + 6} ${330 + dx} ${WY1 + dy}`} stroke={SAGE} strokeWidth="1.4" fill="none" opacity="0.8" />
          ))}
        </g>

        {/* ── 紙の提灯。天から切れて入る ────────────────────── */}
        <line x1="120" y1="0" x2="120" y2="34" stroke={INK} strokeWidth="1.4" opacity="0.5" />
        <ellipse cx="120" cy="94" rx="72" ry="62" fill={`url(#${P}-lamp)`} />
        <g stroke={WOOD_D} strokeWidth="0.9" opacity="0.35" fill="none">
          {[-46, -28, -8, 12, 32, 50].map((dy, i) => (
            <path key={i} d={`M${120 - Math.sqrt(Math.max(0, 1 - (dy / 62) ** 2)) * 72} ${94 + dy} L${120 + Math.sqrt(Math.max(0, 1 - (dy / 62) ** 2)) * 72} ${94 + dy}`} />
          ))}
        </g>
        <ellipse cx="120" cy="94" rx="72" ry="62" fill="none" stroke={WOOD_D} strokeWidth="1" opacity="0.4" />

        {/* ── 題字。壁の空きに小さく。光と喧嘩させない ────────── */}
        <text x="44" y="332" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="25" fontWeight="600" letterSpacing="2.6">
          SCANDINAVIAN
        </text>
        <text x="44" y="364" fill={SAGE} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="25" fontWeight="400" letterSpacing="6.5">
          MODERN
        </text>
        <line x1="44" y1="384" x2="152" y2="384" stroke={PINK} strokeWidth="2" />
        <text x="44" y="406" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="500" letterSpacing="3.6" opacity="0.6">
          LJUS · TRÄ · ENKELHET
        </text>

        {/* ── 椅子。細い丸棒と背の細桟。光の四角の中に立たせる ──── */}
        <g transform="translate(150 470)">
          {/* 長く甘い影。窓が右上なので左下へ伸びる */}
          <g opacity="0.9">
            <ellipse cx="16" cy="272" rx="164" ry="27" fill={`url(#${P}-soft)`} />
            <polygon points="26,266 142,260 40,306 -80,310" fill={INK} opacity="0.12" />
            <polygon points="34,268 126,264 56,294 -26,298" fill={INK} opacity="0.1" />
          </g>
          {/* 後脚（背束のまま床へ） */}
          <path d="M22 34 L6 270" stroke={WOOD} strokeWidth="7" strokeLinecap="round" />
          <path d="M158 34 L176 270" stroke={WOOD} strokeWidth="7" strokeLinecap="round" />
          <path d="M22 34 L6 270" stroke={WOOD_D} strokeWidth="2.4" opacity="0.5" transform="translate(2.6 0)" />
          <path d="M158 34 L176 270" stroke={WOOD_D} strokeWidth="2.4" opacity="0.5" transform="translate(2.6 0)" />
          {/* 背の細桟。7本 */}
          {Array.from({ length: 7 }, (_, i) => {
            const t = (i + 1) / 8;
            const xt = 26 + t * 128;
            const xb = 30 + t * 122;
            return (
              <g key={i}>
                <line x1={xt} y1="34" x2={xb} y2="146" stroke={WOOD} strokeWidth="3.4" strokeLinecap="round" />
                {/* 細桟の影側。1本ずつ暗い縁を添えないと、白木の丸棒が平らな棒に見える */}
                <line x1={xt + 1.2} y1="34" x2={xb + 1.2} y2="146" stroke={WOOD_D} strokeWidth="1" opacity="0.42" strokeLinecap="round" />
              </g>
            );
          })}
          {/* 笠木。ゆるく反る */}
          <path d="M16 36 C 62 14 116 14 164 36 C 116 30 62 30 16 36 Z" fill={WOOD} />
          <path d="M16 36 C 62 14 116 14 164 36 C 160 40 156 40 154 38 C 112 22 66 22 26 38 C 24 40 20 40 16 36 Z" fill={WOOD_L} />
          {/* 座。ペーパーコード */}
          <path d="M18 148 L162 148 L180 192 L0 192 Z" fill={`url(#${P}-cord)`} />
          <path d="M18 148 L162 148 L164 155 L16 155 Z" fill={WOOD_D} opacity="0.2" />
          <path d="M0 192 L180 192 L177 202 L3 202 Z" fill={WOOD} />
          {/* 前脚。細く、わずかに開く */}
          <path d="M14 198 L0 270" stroke={WOOD} strokeWidth="8" strokeLinecap="round" />
          <path d="M16 200 L2 270" stroke={WOOD_D} strokeWidth="2.4" opacity="0.4" strokeLinecap="round" />
          <path d="M166 198 L182 270" stroke={WOOD} strokeWidth="8" strokeLinecap="round" />
          <path d="M168 200 L184 270" stroke={WOOD_D} strokeWidth="2.4" opacity="0.4" strokeLinecap="round" />
          {/* 貫。1本だけ */}
          <path d="M4 240 L178 240" stroke={WOOD} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M4 242 L178 242" stroke={WOOD_D} strokeWidth="1.4" opacity="0.42" strokeLinecap="round" />
          {/* 掛けた布。桃と鼠青の縞。房まで描く */}
          <g>
            <path d="M100 28 L158 34 L166 130 C 146 138 126 136 112 128 Z" fill={MINT} />
            <path d="M100 28 L158 34 L166 130 C 146 138 126 136 112 128 Z" fill={`url(#${P}-weave)`} />
            {[46, 62, 78, 94, 110].map((y, i) => (
              <path key={i} d={`M${101 + y * 0.07} ${y - 10} L${160 + y * 0.07} ${y - 4}`} stroke={i % 2 ? PINK : SAGE} strokeWidth={i % 2 ? 7 : 4} opacity="0.85" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={113 + i * 6.4} y1={129 + i * 1.2} x2={112 + i * 6.4} y2={142 + i * 1.2} stroke={MINT} strokeWidth="1.6" />
            ))}
          </g>
        </g>

        {/* ── 石器の壺と枯枝。光の四角の縁に置いて、影を長く引かせる ── */}
        <g transform="translate(400 592)">
          <ellipse cx="26" cy="112" rx="72" ry="14" fill={`url(#${P}-soft)`} />
          <polygon points="10,110 44,108 -30,124 -66,122" fill={INK} opacity="0.11" />
          {/* 枝 */}
          <g stroke="#7d7468" fill="none" strokeLinecap="round">
            <path d="M24 44 C 20 6 34 -26 30 -68" strokeWidth="2.6" />
            <path d="M27 -12 C 46 -26 54 -44 56 -62" strokeWidth="1.7" />
            <path d="M26 14 C 8 2 0 -14 -2 -34" strokeWidth="1.6" />
            <path d="M29 -44 C 42 -54 46 -66 46 -78" strokeWidth="1.2" />
          </g>
          {[[30, -68], [56, -62], [-2, -34], [46, -78], [22, -30]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={r(2.2, 4)} fill={PINK} opacity="0.75" />
          ))}
          {/* 壺。轆轤の段と、釉のたまり */}
          <path d="M14 40 C -10 58 -8 96 12 108 L40 108 C 60 96 62 58 38 40 Z" fill={MINT} />
          <path d="M14 40 C -10 58 -8 96 12 108 L20 108 C 4 94 2 60 22 40 Z" fill="#dae4dd" />
          <path d="M-2 86 C 4 104 16 108 26 108 L12 108 C -2 100 -4 92 -2 86 Z" fill={SAGE} opacity="0.4" />
          <ellipse cx="26" cy="40" rx="13" ry="4" fill={SAGE} opacity="0.45" />
          <ellipse cx="26" cy="40" rx="9" ry="2.4" fill="#b7c3ba" />
          <g stroke={SAGE} strokeWidth="0.7" opacity="0.14" fill="none">
            {[62, 76, 90].map((y, i) => (
              <path key={i} d={`M${-6 + (y - 58) * 0.2} ${y} C 12 ${y + 3} 40 ${y + 3} ${58 - (y - 58) * 0.2} ${y}`} />
            ))}
          </g>
        </g>

        <text x="44" y="782" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="8" fontWeight="500" letterSpacing="3.4" opacity="0.45">
          PALE ASH · PAPER CORD · LOW WINTER SUN
        </text>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.15" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
