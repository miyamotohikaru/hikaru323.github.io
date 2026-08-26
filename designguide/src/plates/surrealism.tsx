/**
 * シュールレアリズム。
 *
 * 1924年、ブルトンの宣言。夢の論理を、目が覚めているときの精密さで描く。
 * ダリ、マグリット、タンギー。ここで効いているのは「絵の巧さ」ではなく
 * 「巧く描かれてしまっていること」の気味悪さ。
 *
 * ■ この版でやっていること
 *   1. 果てのない地平。地面を水平線まで平らに引き伸ばし、
 *      ひび割れの間隔だけで距離を語らせる。80枚のなかで唯一、
 *      本物のグラデーションを使う版。他が平塗りなので、ここだけ空気が違う。
 *   2. 影を長くする。太陽は画面の外の低い位置にあり、
 *      すべての影が同じ角度で右へ300px 伸びる。影の平行が現実味を担保し、
 *      そのうえで異物が置かれるから不安になる。
 *   3. 影が本体と一致しない。宙に浮く球の影だけが立方体の影になっている。
 *      これがこの版の「あり得なさ」の核。1箇所だけにする。
 *      複数あると絵が冗談になり、精密さが効かなくなる。
 *   4. 尺度の破壊。人を13pxで置き、扉と球を巨大に見せる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "sr";

const PALE = "#dfe6ea";
const BLUE = "#2f5f8a";
const OCHRE = "#c2703d";
const SAND = "#f0d9a8";
const NIGHT = "#1a2028";
/* 5色から作った中間色 */
const SKY_HI = "#101820";
const GROUND_NEAR = "#8a4a26";
const SHADOW = "#3a2418";
const STONE_LIT = "#e6d0a6";
const STONE_DARK = "#4a4136";

const SEA = 470; // 地平
/** 影の傾き。すべての影がこの1つの角度に従う */
const SH = 0.42;

export default function Plate() {
  const r = rand(19241015);

  /* 地面のひび。地平に近いほど細かく、手前ほど大きい。
     格子を作り、右隣と下隣を結ぶ。これだけで乾いた泥の板ができる */
  const ROWS = 15;
  const COLS = 15;
  const pt = (i: number, j: number): [number, number] => {
    const t = (i / ROWS) ** 2.1;
    const y = SEA + 336 * t + r(-2, 2) * (0.4 + t * 5);
    const spread = 46 + t * 300;
    const x = 300 + (j - COLS / 2) * spread + r(-1, 1) * spread * 0.22;
    return [x, y];
  };
  const grid: [number, number][][] = Array.from({ length: ROWS + 1 }, (_, i) =>
    Array.from({ length: COLS + 1 }, (_, j) => pt(i, j)),
  );
  const cracks: { d: string; w: number }[] = [];
  for (let i = 1; i <= ROWS; i++) {
    for (let j = 0; j <= COLS; j++) {
      const t = i / ROWS;
      const w = 0.35 + t * 1.9;
      const a = grid[i][j];
      if (j < COLS) {
        const b = grid[i][j + 1];
        const mx = (a[0] + b[0]) / 2 + r(-6, 6) * (0.3 + t * 3);
        const my = (a[1] + b[1]) / 2 + r(-3, 3) * (0.3 + t * 3);
        cracks.push({ d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`, w });
      }
      if (i < ROWS && r() > 0.24) {
        const b = grid[i + 1][j];
        const mx = (a[0] + b[0]) / 2 + r(-8, 8) * (0.3 + t * 3);
        const my = (a[1] + b[1]) / 2 + r(-4, 4) * (0.3 + t * 3);
        cracks.push({ d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`, w: w * 0.8 });
      }
    }
  }

  /* 小石。手前に散らす。それぞれ同じ角度の短い影を持つ */
  const stones = Array.from({ length: 26 }, () => {
    const t = r() ** 1.6;
    const y = SEA + 30 + t * 300;
    const x = r(-30, 630);
    const s = 1.6 + t * 6;
    return { x, y, s };
  });

  /* 扉。石の枠だけが平原に立っている */
  const DX = 168;
  const DY = 232;
  const DW = 150;
  const DH = SEA - DY;
  const JAMB = 26;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="シュールレアリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY_HI} />
          <stop offset="0.34" stopColor={NIGHT} />
          <stop offset="0.62" stopColor={BLUE} />
          <stop offset="0.87" stopColor={PALE} />
          <stop offset="1" stopColor={SAND} />
        </linearGradient>
        {/* 扉の向こうだけ別の時刻。マグリットの不可能 */}
        <linearGradient id={`${P}-door`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc0d8" />
          <stop offset="0.7" stopColor="#d8ead0" />
          <stop offset="1" stopColor="#f2ecc8" />
        </linearGradient>
        <linearGradient id={`${P}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SAND} />
          <stop offset="0.18" stopColor="#dcae7c" />
          <stop offset="0.55" stopColor={OCHRE} />
          <stop offset="1" stopColor={GROUND_NEAR} />
        </linearGradient>
        <linearGradient id={`${P}-pier`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={STONE_LIT} />
          <stop offset="0.5" stopColor="#c2ab84" />
          <stop offset="1" stopColor={STONE_DARK} />
        </linearGradient>
        <radialGradient id={`${P}-orb`} cx="0.33" cy="0.28" r="0.82">
          <stop offset="0" stopColor="#f6f1e2" />
          <stop offset="0.28" stopColor="#cdd6dc" />
          <stop offset="0.66" stopColor={BLUE} />
          <stop offset="1" stopColor="#16232e" />
        </radialGradient>
        <radialGradient id={`${P}-egg`} cx="0.34" cy="0.26" r="0.85">
          <stop offset="0" stopColor="#fbf6e8" />
          <stop offset="0.55" stopColor={SAND} />
          <stop offset="1" stopColor="#a08350" />
        </radialGradient>
        <linearGradient id={`${P}-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHADOW} stopOpacity="0.62" />
          <stop offset="1" stopColor={SHADOW} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${P}-ground-clip`}>
          <rect x="-20" y={SEA} width="640" height="340" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 空 ─────────────────────────────────────────────────── */}
        <rect width="600" height={SEA} fill={`url(#${P}-sky)`} />
        {/* ダリの雲。細長い凸レンズ。ぼかさず、輪郭を持たせる */}
        <g fill={PALE}>
          {([[122, 176, 78, 7, 0.5], [86, 190, 46, 4.4, 0.34], [430, 132, 96, 8, 0.42],
             [470, 150, 54, 5, 0.3], [318, 96, 64, 5.6, 0.3], [520, 214, 40, 3.6, 0.24]] as number[][]).map(
            ([x, y, w, h, o], i) => (
              <ellipse key={`cl${i}`} cx={x} cy={y} rx={w} ry={h} opacity={o} />
            ),
          )}
        </g>
        {/* 星。夜の側にだけ */}
        <g fill={PALE}>
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={`st${i}`} cx={r(0, 600)} cy={r(4, 190)} r={r(0.5, 1.5)} opacity={r(0.3, 0.9)} />
          ))}
        </g>
        {/* 遠くの卓状台地。空気遠近で青く沈める */}
        <path d="M-20 470 L-20 448 L38 442 L54 424 L142 420 L158 440 L206 446 L214 470 Z" fill={BLUE} opacity="0.34" />
        <path d="M470 470 L482 452 L536 448 L552 434 L620 430 L620 470 Z" fill={BLUE} opacity="0.26" />

        {/* ── 地面 ───────────────────────────────────────────────── */}
        <rect x="-20" y={SEA} width="640" height="340" fill={`url(#${P}-ground)`} />

        <g clipPath={`url(#${P}-ground-clip)`}>
          {/* 影。すべて同じ角度で右へ。まず扉の影 */}
          <path
            d={`M${DX} ${SEA} L${DX + DH * SH * 1.9} ${SEA + 300} L${DX + JAMB + DH * SH * 1.9} ${SEA + 300} L${DX + JAMB} ${SEA} Z`}
            fill={`url(#${P}-fade)`}
          />
          <path
            d={`M${DX + DW - JAMB} ${SEA} L${DX + DW - JAMB + DH * SH * 1.9} ${SEA + 300} L${DX + DW + DH * SH * 1.9} ${SEA + 300} L${DX + DW} ${SEA} Z`}
            fill={`url(#${P}-fade)`}
          />
          {/* 球の影。ここだけ立方体の影が落ちている。この版の核。
             菱形に明暗をつけた初稿は「地面の穴」に見えたので、
             六角形（立方体を低い光で潰した形）を一様の濃さで置いた */}
          <path d="M382 604 L430 570 L524 578 L556 616 L508 650 L414 640 Z" fill={SHADOW} opacity="0.52" />
          {/* 影の縁のわずかな半影。硬すぎる影は切り紙に見える */}
          <path d="M382 604 L430 570 L524 578 L556 616 L508 650 L414 640 Z"
                fill="none" stroke={SHADOW} strokeWidth="6" opacity="0.16" />
          {/* 卵の影 */}
          <ellipse cx="536" cy="500" rx="34" ry="6" fill={SHADOW} opacity="0.42" transform="rotate(-2 536 500)" />
          {/* 人の影。異様に長い */}
          <path d="M352 478 L351 471 L446 468 L444 480 Z" fill={SHADOW} opacity="0.55" />

          {/* ひび割れ */}
          <g stroke={SHADOW} fill="none" opacity="0.5">
            {cracks.map((c, i) => (
              <path key={`ck${i}`} d={c.d} strokeWidth={c.w} />
            ))}
          </g>
          {/* ひびの陽の当たる縁。1px 下にずらした明るい線。乾いた土の厚み */}
          <g stroke={STONE_LIT} fill="none" opacity="0.2">
            {cracks.map((c, i) => (
              <path key={`ck2${i}`} d={c.d} strokeWidth={c.w * 0.7} transform="translate(0 1.4)" />
            ))}
          </g>

          {/* 小石とその影 */}
          {stones.map((s, i) => (
            <g key={`sn${i}`}>
              <ellipse cx={s.x + s.s * 2.4} cy={s.y + s.s * 0.4} rx={s.s * 2.6} ry={s.s * 0.5} fill={SHADOW} opacity="0.4" />
              <ellipse cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.72} fill={STONE_LIT} opacity="0.7" />
              <ellipse cx={s.x + s.s * 0.34} cy={s.y + s.s * 0.2} rx={s.s * 0.66} ry={s.s * 0.44} fill={STONE_DARK} opacity="0.26" />
            </g>
          ))}
        </g>

        {/* ── 扉。石の枠だけが立っている ───────────────────────────── */}
        {/* 枠の内側。別の時刻の空が見える */}
        <rect x={DX + JAMB} y={DY + 24} width={DW - JAMB * 2} height={DH - 24} fill={`url(#${P}-door)`} />
        {/* 向こう側の地平は、こちらより高い位置にある */}
        <rect x={DX + JAMB} y={DY + 24} width={DW - JAMB * 2} height="1.6" fill="#cfe0e8" opacity="0" />
        <rect x={DX + JAMB} y={392} width={DW - JAMB * 2} height={SEA - 392} fill="#b9c98e" />
        <rect x={DX + JAMB} y={392} width={DW - JAMB * 2} height="26" fill="#9db07a" />
        <rect x={DX + JAMB} y={390} width={DW - JAMB * 2} height="2.4" fill="#7f9166" opacity="0.8" />
        {/* 向こう側の丘と一本の木。こちらの平原には木が1本もない */}
        <path d={`M${DX + JAMB} 392 L${DX + 62} 380 L${DX + 92} 386 L${DX + DW - JAMB} 382 L${DX + DW - JAMB} 394 L${DX + JAMB} 394 Z`} fill="#8ea378" />
        <rect x={DX + 74} y={366} width="3" height="26" fill="#5d6b48" />
        <ellipse cx={DX + 75.5} cy={364} rx="11" ry="9" fill="#6f8452" />
        {/* 向こう側に小さな月 */}
        <circle cx={DX + 106} cy={DY + 78} r="13" fill="#fdf8e6" />
        <circle cx={DX + 110} cy={DY + 74} r="11" fill="#e8f0e2" opacity="0.55" />
        {/* 枠 */}
        <rect x={DX} y={DY} width={JAMB} height={DH} fill={`url(#${P}-pier)`} />
        <rect x={DX + DW - JAMB} y={DY} width={JAMB} height={DH} fill={`url(#${P}-pier)`} />
        <rect x={DX - 6} y={DY} width={DW + 12} height="26" fill={`url(#${P}-pier)`} />
        <rect x={DX - 6} y={DY} width={DW + 12} height="5" fill={STONE_LIT} opacity="0.8" />
        <rect x={DX + DW - JAMB} y={DY} width="5" height={DH} fill={STONE_LIT} opacity="0.35" />
        {/* 石の目地。近くで見る細部 */}
        <g stroke={STONE_DARK} strokeWidth="0.9" opacity="0.4">
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`jb${i}`} x1={DX} y1={DY + 34 + i * 26} x2={DX + JAMB} y2={DY + 34 + i * 26} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`jb2${i}`} x1={DX + DW - JAMB} y1={DY + 40 + i * 26} x2={DX + DW} y2={DY + 40 + i * 26} />
          ))}
        </g>
        {/* 楣に垂れた時計。柔らかいものは硬いものの上でだけ柔らかい。
            初稿は塊の輪郭だけで「？」に見えた。楣に乗った部分（潰れた楕円）と
            前へ垂れた文字盤（下半分の弧）に分け、目盛りと針を入れて時計に戻した。
            2稿では大きすぎて右の柱を覆い、壁掛け時計に見えたので6割に縮めた */}
        <g transform="translate(236 250) scale(0.62) translate(-310 -254)">
          {/* 垂れた文字盤。左右で垂れ方を変え、右をより長く伸ばす */}
          <path
            d="M266 254 C 260 292 268 330 292 344 C 316 356 344 340 352 306 C 358 282 356 266 354 254 Z"
            fill="#e2d4b0"
            stroke={STONE_DARK}
            strokeWidth="1.5"
          />
          {/* 文字盤の照り。垂れた面の丸みを出す */}
          <path d="M274 256 C 270 288 276 318 292 332" fill="none" stroke="#f8f2de" strokeWidth="4" opacity="0.65" />
          <path d="M344 256 C 348 280 346 302 336 320" fill="none" stroke={STONE_DARK} strokeWidth="3" opacity="0.2" />
          {/* 目盛り。垂れに沿って間隔が詰まる */}
          <g stroke={STONE_DARK} strokeWidth="1.5" opacity="0.75">
            {([[272, 300], [276, 322], [292, 338], [312, 340], [332, 328], [346, 306], [351, 282]] as number[][]).map(
              ([x, y], i) => {
                const a = Math.atan2(y - 268, x - 310);
                return (
                  <line key={`tk${i}`} x1={x} y1={y} x2={x - Math.cos(a) * 7} y2={y - Math.sin(a) * 7} />
                );
              },
            )}
          </g>
          {/* 針。中心は楣の陰にある */}
          <line x1="310" y1="266" x2="336" y2="316" stroke={NIGHT} strokeWidth="2.4" />
          <line x1="310" y1="266" x2="288" y2="296" stroke={NIGHT} strokeWidth="1.8" />
          <circle cx="310" cy="266" r="3" fill={NIGHT} />
          {/* 楣の上に乗った部分。潰れた楕円 */}
          <ellipse cx="310" cy="234" rx="46" ry="9" fill="#d6c8a4" stroke={STONE_DARK} strokeWidth="1.4" />
          <ellipse cx="304" cy="231" rx="30" ry="4.4" fill="#f4ecd6" opacity="0.7" />
          {/* 竜頭。小さいが、これがあると時計と読める */}
          <path d="M352 246 L364 240 L367 246 L355 252 Z" fill="#bfae86" stroke={STONE_DARK} strokeWidth="1.1" />
        </g>

        {/* ── 宙に浮く球。影だけが立方体 ───────────────────────────── */}
        <circle cx="470" cy="330" r="58" fill={`url(#${P}-orb)`} />
        {/* 地面からの照り返し。下端だけ暖かい */}
        <path d="M418 352 A58 58 0 0 0 522 352 A58 58 0 0 1 418 352 Z" fill={OCHRE} opacity="0.28" />
        <ellipse cx="450" cy="308" rx="14" ry="9" fill="#ffffff" opacity="0.7" transform="rotate(-28 450 308)" />
        <ellipse cx="443" cy="303" rx="5" ry="3.4" fill="#ffffff" transform="rotate(-28 443 303)" />

        {/* ── 卵と台座 ───────────────────────────────────────────── */}
        <path d="M506 500 C 506 478 512 458 524 458 C 536 458 542 478 542 500 C 542 514 534 522 524 522 C 514 522 506 514 506 500 Z" fill={`url(#${P}-egg)`} />
        <path d="M510 512 C 516 520 532 520 538 512 C 534 520 514 520 510 512 Z" fill={OCHRE} opacity="0.3" />
        <ellipse cx="516" cy="474" rx="5" ry="7" fill="#ffffff" opacity="0.55" transform="rotate(-14 516 474)" />

        {/* ── 人。13px。尺度をここで壊す ─────────────────────────── */}
        <g fill={NIGHT}>
          <circle cx="350" cy="459" r="2.1" />
          <path d="M347.6 462 L352.4 462 L353.4 470 L351 470 L350.6 466 L349.4 466 L349 470 L346.6 470 Z" />
        </g>

        {/* ── 題字。空の左上。細い古典的なセリフ ────────────────────── */}
        <text
          x="46" y="72"
          fill={PALE}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="27"
          letterSpacing="7.5"
          opacity="0.94"
        >
          SURRÉALISME
        </text>
        <rect x="48" y="84" width="238" height="0.9" fill={PALE} opacity="0.5" />
        <text
          x="48" y="102"
          fill={PALE}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="9.5"
          letterSpacing="3.6"
          opacity="0.62"
        >
          MANIFESTE — PARIS — MCMXXIV
        </text>

        {/* 平原に立つ小さな札。近くで見る細部 */}
        <g>
          <rect x="52" y="676" width="152" height="2.6" fill={STONE_DARK} opacity="0.5" />
          <rect x="60" y="620" width="4" height="58" fill={STONE_DARK} opacity="0.6" />
          <rect x="192" y="620" width="4" height="58" fill={STONE_DARK} opacity="0.6" />
          <rect x="48" y="592" width="160" height="34" fill={SAND} />
          <rect x="48" y="592" width="160" height="34" fill="none" stroke={STONE_DARK} strokeWidth="1.4" />
          <text
            x="128" y="613"
            fill={NIGHT}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="10.5"
            letterSpacing="0.6"
            textAnchor="middle"
          >
            ceci n&#39;est pas un paysage
          </text>
          {/* 札の影 */}
          <path d="M48 626 L208 626 L268 640 L104 640 Z" fill={SHADOW} opacity="0.3" />
        </g>

        {/* 紙の目。薄く。精密な描写を殺さない程度に */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.1"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
