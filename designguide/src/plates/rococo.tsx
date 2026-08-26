/**
 * ロココ。
 *
 * メソニエ『Livre d'Ornemens』（1734）の系統。彫版で刷った装飾図案の一葉。
 *
 * ■ 前の版が駄目だった理由
 *   非対称にしたつもりで、実際には**左右対称の花環＋中央の蝶結び**になっていた。
 *   淡桃と淡緑だけで、輪郭も影も無い。結果、1730年代のパリではなく
 *   現代のウェディング招待状に見えた。185pxでは地の紙に溶けて消えた。
 *
 * ■ 直した4点
 *   1. **彫版として描く。** ロココ装飾は絵ではなく、まず**版画**として流通した。
 *      すべての形に焦茶の輪郭を回し、影側にビュランの平行線を入れる。
 *      これで淡い色のまま、縮小しても構造が残る。
 *      パステルの色面だけで作ると必ず消える。
 *   2. **重さの軸を対角にする。** 左上に大きな貝、右下に小さな貝と渦。
 *      右上は花の枝だけ、左下は岩組だけ。**鏡に映して重ならない。**
 *      中央の蝶結びは消した。あれ一つで対称に見えていた。
 *   3. **貝を貝にする。** 前の版は放射の直線＋平らな塗りで、団扇だった。
 *      本物の帆立は、**肋が湾曲し、縁が肋ごとに膨らみ、蝶番に耳がある。**
 *      肋を曲げ、根元に耳を付け、影を肋に沿わせた。
 *   4. **岩組（rocaille）を入れる。** 様式の名の由来は貝ではなく岩と貝の細工。
 *      不整形な塊と、そこから落ちる水の筋。左下に置いてある。
 *
 * ■ プレートの体裁
 *   彫版の紙は、図の下に余白（マージン）を取って銘を彫る。
 *   図そのものは非対称でも、**紙は左右対称**でいい。当時の版がそうなっている。
 */
import { ATLAS, rand, rad, shift, alpha, onCircle } from "@/lib/plate";

const P = "rc";
const PAPER = "#f5ece2";
const PINK = "#e8c4d0";
const MINT = "#c9d6c4";
const GOLD = "#d9b45a";
const BROWN = "#5a4a3a";

const SERIF = "Georgia, 'Times New Roman', serif";

/* 図の枠（プレートマーク）。下に銘のための余白を残す */
const PL = 40, PT = 34, PR = 560, PB = 690;

/**
 * 彫った面。塗り＋ビュランの平行線＋輪郭。
 * 平行線は片側だけ密にする。等密度で入れると布地の模様になる。
 */
function Carved({
  cid, d, fill, ang, cx, cy, span, gap = 4.6, from = 0.15, to = 0.95, edge = 1.4,
}: {
  cid: string; d: string; fill: string; ang: number; cx: number; cy: number;
  span: number; gap?: number; from?: number; to?: number; edge?: number;
}) {
  const n = Math.ceil((span * 2) / gap);
  return (
    <g>
      <clipPath id={cid}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${cid})`} stroke={BROWN} strokeWidth="0.75">
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          {Array.from({ length: n }, (_, i) => {
            const u = i / (n - 1);
            return (
              <line key={i}
                x1={cx - span} y1={cy - span + i * gap}
                x2={cx + span} y2={cy - span + i * gap}
                opacity={(from + (to - from) * u).toFixed(2)} />
            );
          })}
        </g>
      </g>
      <path d={d} fill="none" stroke={BROWN} strokeWidth={edge} strokeLinejoin="round" />
    </g>
  );
}

type Pt = [number, number];

/**
 * 渦（volute）。ロココの C 字・S 字は、**対数螺旋**そのもの。
 * r = r0·e^(-kθ) で巻きながら幅も細っていく。
 * 手で path を書いたら、前の版では平たいバナナになった。
 * 巻きは式で出さないと「彫った肉」にならない。
 */
function voluteSpine(r0: number, k: number, turns: number, dir: number, n = 60): Pt[] {
  const th1 = turns * Math.PI * 2;
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * th1;
    const rr = r0 * Math.exp(-k * th);
    out.push([rr * Math.cos(th) - r0, dir * rr * Math.sin(th)]);
  }
  return out;
}

/** 背骨に肉をつけて閉じた形にする。幅は端で細り、中ほどで膨らむ */
function ribbon(pts: Pt[], w0: number, w1: number, bulge = 0.35) {
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const t = i / (pts.length - 1);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m, ny = dx / m;
    // 起点も細らせる。等幅で始めると、鋸で切った管の断面に見える。
    // ロココの渦は必ず尖った先から生えて、途中で肉がつく
    const taper = Math.min(1, (t / 0.1) ** 0.7);
    const w = (w0 + (w1 - w0) * t) * taper * (1 + bulge * Math.sin(Math.PI * t));
    L.push(`${(pts[i][0] + (nx * w) / 2).toFixed(1)},${(pts[i][1] + (ny * w) / 2).toFixed(1)}`);
    R.push(`${(pts[i][0] - (nx * w) / 2).toFixed(1)},${(pts[i][1] - (ny * w) / 2).toFixed(1)}`);
  }
  return `M${L.join("L")}L${R.reverse().join("L")}Z`;
}

/** 渦ひとつ。塗り・彫りの平行線・稜の金線・巻き終わりの目 */
function Volute({ x, y, rot, r0, k = 0.19, turns = 1.7, dir = 1, w0 = 34, w1 = 5, fill, cid }: {
  x: number; y: number; rot: number; r0: number; k?: number; turns?: number;
  dir?: number; w0?: number; w1?: number; fill: string; cid: string;
}) {
  const spine = voluteSpine(r0, k, turns, dir);
  const d = ribbon(spine, w0, w1);
  const mid = spine[Math.floor(spine.length * 0.45)];
  const eye = spine[spine.length - 1];
  const ridge = `M${spine.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Carved cid={cid} d={d} fill={fill} ang={-rot + 66}
              cx={mid[0]} cy={mid[1]} span={r0 * 1.3} gap={r0 * 0.035} from={0.08} to={0.66} edge={1.8} />
      {/* 稜。彫りの頂点だけが光る */}
      <path d={ridge} fill="none" stroke={shift(GOLD, 0.3)} strokeWidth="1.3" opacity="0.85"
            transform={`translate(${(-w0 * 0.16).toFixed(1)} ${(-w0 * 0.16).toFixed(1)})`} />
      <circle cx={eye[0]} cy={eye[1]} r={Math.max(2.2, w1 * 0.6)} fill={BROWN} />
    </g>
  );
}

/**
 * 帆立（coquille）。肋は湾曲させ、縁は肋ごとに膨らませ、蝶番に耳を付ける。
 * 放射の直線＋平らな縁にすると団扇になる（前の版がそうだった）。
 */
function Shell({ x, y, r, rot, n = 11, spread = 172, seed, cid }: {
  x: number; y: number; r: number; rot: number; n?: number; spread?: number; seed: number; cid: string;
}) {
  const rr = rand(seed);
  const tips: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = -spread / 2 + spread * u;
    // 片側を長く。左右対称の扇にしない
    const len = r * (0.66 + 0.36 * Math.cos(rad(a * 0.85)) + 0.18 * u) * rr(0.95, 1.05);
    tips.push(onCircle(0, 0, len, a));
  }
  // 縁。隣り合う肋先のあいだを外へふくらませる
  let edge = `M0 0 L${tips[0][0].toFixed(1)} ${tips[0][1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const c = Math.hypot(tips[i][0] - tips[i - 1][0], tips[i][1] - tips[i - 1][1]);
    edge += ` A${(c * 0.6).toFixed(1)} ${(c * 0.6).toFixed(1)} 0 0 1 ${tips[i][0].toFixed(1)} ${tips[i][1].toFixed(1)}`;
  }
  edge += " Z";

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* 蝶番の耳。帆立を帆立にしているのはここ */}
      <path d={`M${-r * 0.34} ${r * 0.1} L${-r * 0.5} ${-r * 0.02} L${-r * 0.2} ${-r * 0.1} Z`}
            fill={shift(PINK, 0.3)} stroke={BROWN} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={`M${r * 0.3} ${r * 0.1} L${r * 0.48} ${-r * 0.04} L${r * 0.16} ${-r * 0.12} Z`}
            fill={shift(PINK, 0.42)} stroke={BROWN} strokeWidth="1.1" strokeLinejoin="round" />

      <Carved cid={cid} d={edge} fill={shift(PINK, 0.4)} ang={rot * -1 + 62}
              cx={0} cy={-r * 0.4} span={r * 1.1} gap={r * 0.09} from={0.08} to={0.62} edge={1.8} />

      {/* 肋。まっすぐ引かない。中ほどで外へ膨らませる */}
      {tips.map((p, i) => {
        const mx = p[0] * 0.5 + p[1] * 0.06;
        const my = p[1] * 0.5 - p[0] * 0.06;
        return (
          <g key={i}>
            <path d={`M0 0 Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(p[0] * 0.96).toFixed(1)} ${(p[1] * 0.96).toFixed(1)}`}
                  fill="none" stroke={BROWN} strokeWidth={i % 2 === 0 ? 1.3 : 0.7} opacity="0.85" />
            {i % 2 === 0 && (
              <path d={`M2 1 Q ${(mx + 2).toFixed(1)} ${(my + 1).toFixed(1)} ${(p[0] * 0.94 + 2).toFixed(1)} ${(p[1] * 0.94 + 1).toFixed(1)}`}
                    fill="none" stroke={shift(GOLD, 0.42)} strokeWidth="0.8" opacity="0.75" />
            )}
          </g>
        );
      })}

      {/* 根元の渦。貝から巻き出る */}
      <path d={`M${-r * 0.2} ${r * 0.1} C ${-r * 0.46} ${r * 0.34} ${-r * 0.2} ${r * 0.6} ${r * 0.04} ${r * 0.48}
                C ${r * 0.22} ${r * 0.38} ${r * 0.1} ${r * 0.18} ${-r * 0.04} ${r * 0.26}`}
            fill="none" stroke={BROWN} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={-r * 0.02} cy={r * 0.32} r={r * 0.045} fill={BROWN} />
    </g>
  );
}

/** 小花。5弁。彫版なので輪郭は必ず入る */
function Flower({ x, y, r, rot, c, seed }: { x: number; y: number; r: number; rot: number; c: string; seed: number }) {
  const rr = rand(seed);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i}
          transform={`rotate(${72 * i + rr(-12, 12)}) translate(0 ${-r * 0.62})`}
          rx={r * 0.42} ry={r * 0.6} fill={c} stroke={BROWN} strokeWidth="0.75" />
      ))}
      <circle r={r * 0.24} fill={GOLD} stroke={BROWN} strokeWidth="0.6" />
    </g>
  );
}

/* 中央の窪み（カルトゥーシュ）。左へ寄せ、少し傾ける。
   真円・真楕円にすると18世紀に見えない。輪郭そのものが波打っている */
const RESERVE =
  `M 208 288 C 220 244 262 216 316 214
   C 372 212 420 232 434 272 C 446 306 448 348 442 386
   C 434 432 410 466 366 480 C 320 494 262 490 226 462
   C 194 438 182 396 186 352 C 189 318 198 300 208 288 Z`;

export default function Plate() {
  const r = rand(1730);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ロココ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <radialGradient id={`${P}-wash`} cx="34%" cy="24%" r="88%">
          <stop offset="0%" stopColor={shift(PAPER, 0.55)} />
          <stop offset="58%" stopColor={PAPER} />
          <stop offset="100%" stopColor={shift(PINK, 0.46)} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-wash)`} />

        {/* プレートマーク。銅版が紙に残す圧痕。図の外枠になる */}
        <rect x={PL} y={PT} width={PR - PL} height={PB - PT} fill="none"
              stroke={alpha(BROWN, 0.45)} strokeWidth="1.1" />
        <rect x={PL + 5} y={PT + 5} width={PR - PL - 10} height={PB - PT - 10} fill="none"
              stroke={alpha(BROWN, 0.16)} strokeWidth="0.6" />

        {/* ── 右上。花の枝だけ。ここは軽くする ──────────────────── */}
        <g fill="none" stroke={BROWN} strokeLinecap="round">
          <path d="M452 112 C 506 136 536 190 538 250 C 540 306 524 348 500 374" strokeWidth="1.9" />
          <path d="M488 144 C 518 154 528 176 524 198" strokeWidth="1.1" />
          <path d="M530 264 C 544 290 542 320 528 338" strokeWidth="1.1" />
        </g>
        {[[466, 122, 13], [516, 172, 10], [536, 250, 15], [524, 322, 10], [500, 370, 12]].map(([x, y, s], i) => (
          <Flower key={`fr${i}`} x={x} y={y} r={s}
                  rot={r(0, 72)} c={i % 3 === 0 ? PINK : i % 3 === 1 ? shift(PAPER, 0.3) : shift(PINK, 0.34)}
                  seed={210 + i} />
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const t = 0.1 + i * 0.13;
          const x = 452 + 88 * t + 22 * Math.sin(t * 3);
          const y = 112 + 262 * t;
          return (
            <ellipse key={`lr${i}`} cx={x} cy={y} rx="11" ry="4.4"
                     transform={`rotate(${i % 2 === 0 ? 52 : -40} ${x} ${y})`}
                     fill={MINT} stroke={BROWN} strokeWidth="0.7" />
          );
        })}

        {/* ── 左下。ここは**空けておく**。重さの軸は左上→右下の対角で、
               四隅を埋めた時点でロココではなく19世紀の額縁になる。
               角を認めるだけの細い蔓を1本だけ通す */}
        <g fill="none" stroke={BROWN} strokeLinecap="round">
          <path d="M196 552 C 156 592 140 634 148 664 C 154 686 178 690 186 674
                   C 192 662 180 652 172 660" strokeWidth="1.5" opacity="0.8" />
        </g>
        {[[176, 588], [156, 624], [160, 660]].map(([x, y], i) => (
          <ellipse key={`ll${i}`} cx={x} cy={y} rx="10" ry="4"
                   transform={`rotate(${i % 2 === 0 ? 58 : -34} ${x} ${y})`}
                   fill={MINT} stroke={BROWN} strokeWidth="0.7" />
        ))}

        {/* ── 渦。すべて対数螺旋。窪みの縁に沿わせて一巡させる ───
               置き方の規則：θ=0 の点が (x,y)。そこから接線方向へ掃き出して巻く。
               外側の掃きが窪みの縁に接するよう rot を決めてある。
               4つを離して置くと、ただのアンモナイトが4匹になる（前の版）。
               ロココの装飾は**ひと続き**で、端と端が必ず触れている */}
        <Volute cid={`${P}-v1`} x={268} y={230} rot={30} r0={132} k={0.2} turns={1.7}
                dir={1} w0={32} w1={5} fill={shift(PINK, 0.5)} />
        <Volute cid={`${P}-v2`} x={214} y={470} rot={100} r0={112} k={0.21} turns={1.6}
                dir={1} w0={25} w1={4} fill={shift(PINK, 0.58)} />
        <Volute cid={`${P}-v3`} x={438} y={448} rot={-108} r0={104} k={0.22} turns={1.5}
                dir={-1} w0={21} w1={4} fill={shift(MINT, 0.42)} />
        <Volute cid={`${P}-v4`} x={444} y={262} rot={200} r0={58} k={0.24} turns={1.3}
                dir={-1} w0={12} w1={3} fill={shift(MINT, 0.5)} />

        {/* ── 中央の窪み。ここに銘を彫る ─────────────────────── */}
        <g transform="translate(-6 0) rotate(-7 312 348)">
          <Carved cid={`${P}-res`} d={RESERVE} fill={shift(PAPER, 0.66)} ang={18}
                  cx={312} cy={348} span={168} gap={7.5} from={0.02} to={0.16} edge={1.6} />
          <path d={RESERVE} fill="none" stroke={GOLD} strokeWidth="0.9"
                transform="translate(312 348) scale(0.94) translate(-312 -348)" opacity="0.85" />
          <text x="312" y="330" textAnchor="middle" fill={BROWN} fontFamily={SERIF}
                fontSize="40" letterSpacing="9">
            ROCOCO
          </text>
          <line x1="228" y1="348" x2="396" y2="348" stroke={GOLD} strokeWidth="0.9" />
          <path d="M312 342 L318 348 L312 354 L306 348 Z" fill={GOLD} />
          <text x="312" y="378" textAnchor="middle" fill={shift(BROWN, 0.2)} fontFamily={SERIF}
                fontSize="16" fontStyle="italic">
            à la manière de Meissonnier
          </text>
          <text x="312" y="404" textAnchor="middle" fill={shift(BROWN, 0.3)} fontFamily={SERIF}
                fontSize="8.6" letterSpacing="3">
            COQUILLE · ROCAILLE · ASYMÉTRIE
          </text>
        </g>

        {/* ── 貝。左上に大きく、右下に小さく。重さの軸はこの対角 ──── */}
        <Shell x={202} y={188} r={94} rot={-40} n={12} spread={188} seed={7} cid={`${P}-sh1`} />
        <Shell x={438} y={572} r={52} rot={152} n={9} spread={164} seed={19} cid={`${P}-sh2`} />

        {/* 渦の巻き終わり。細い焦茶の糸で、貝の付け根から伸ばす */}
        <g fill="none" stroke={BROWN} strokeLinecap="round">
          <path d="M286 216 C 344 226 374 190 356 160 C 340 134 306 144 314 170 C 319 186 342 182 340 168"
                strokeWidth="1.9" />
          <path d="M420 616 C 380 638 342 626 338 600" strokeWidth="1.3" opacity="0.85" />
        </g>

        {/* ── 銘。彫版の紙は、図の下の余白に彫り師の名を入れる ───── */}
        <g textAnchor="middle" fill={shift(BROWN, 0.16)} fontFamily={SERIF}>
          <text x="300" y="726" fontSize="9.4" letterSpacing="3.2">
            J. A. MEISSONNIER INV. ET SCULP.
          </text>
          <text x="300" y="748" fontSize="9" fontStyle="italic" opacity="0.86">
            Livre d&apos;Ornemens — Planche VII
          </text>
          <text x="300" y="770" fontSize="8.6" letterSpacing="3.4" opacity="0.8">
            À PARIS · MDCCXXXIV · AVEC PRIVILÈGE DU ROY
          </text>
        </g>

        {/* 顔料と紙のむら */}
        <g fill={BROWN} opacity="0.07">
          {Array.from({ length: 28 }, (_, i) => (
            <circle key={i} cx={r(44, 556)} cy={r(40, 700)} r={r(0.6, 2)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.18"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
