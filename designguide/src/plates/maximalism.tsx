/**
 * マキシマリズム。
 *
 * more is more。余白を残さない。柄の上に柄を重ね、そのまた上に物を置く。
 * 一枚の図版で「多い」を語るには、種類の違う層を最低5枚積む必要がある。
 * 同じ種類の柄を並べても、ただの賑やかな壁紙にしかならない。
 *
 * ■ 積んだ層（下から）
 *   1. ダマスク（唐草）。地。宝石色の紫に金。
 *   2. 縦縞の柱。左右を締めて版面を分割する。
 *   3. 豹柄の帯。有機的な斑点。幾何の柄と喧嘩させるために斜めに通す。
 *   4. 市松。硬い幾何。豹と正面からぶつける。
 *   5. 植物と花。輪郭を持つ物。柄の上に「立体」を載せる。
 *   6. 額と鳥と房飾り。最後に人工物を散らして、隙間を潰す。
 *
 * ■ 隣の3枚と分けるために
 *   ・memphis は余白を残す。こちらは1平方センチも残さない。
 *   ・kitsch は甘い1つの主役。こちらに主役はない。目が止まる場所を作らない。
 *   ・anti-design は皮肉。こちらは本気で全部が好き、という態度。
 *
 * ■ 読めなくならない工夫
 *   全部を同じ密度にすると、遠目にただの砂嵐になる（初稿でそうなった）。
 *   金の帯を1本だけ横に通し、そこだけ柄を止めて題字を置いた。
 *   密度の中に1本の休符があると、かえって密度が伝わる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "mxm";

const PLUM = "#1f1030";
const RED = "#e8402a";
const GOLD = "#f2b100";
const JADE = "#1f8a7a";
const ROSE = "#e86ab0";

const PLUM_L = "#3a1e56";
const GOLD_D = "#b17c00";
const JADE_D = "#125a4e";

/** 八重の花。輪を3段。外ほど大きく、内ほど濃い */
function Bloom({ cx, cy, r, a, b, c }: { cx: number; cy: number; r: number; a: string; b: string; c: string }) {
  const ring = (n: number, rr: number, pr: number, fill: string, rot: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2 + rot;
      return <ellipse key={`${fill}${i}`} cx={cx + Math.cos(t) * rr} cy={cy + Math.sin(t) * rr} rx={pr} ry={pr * 0.74} fill={fill} transform={`rotate(${((t * 180) / Math.PI).toFixed(0)} ${(cx + Math.cos(t) * rr).toFixed(1)} ${(cy + Math.sin(t) * rr).toFixed(1)})`} />;
    });
  return (
    <g>
      {ring(9, r * 0.66, r * 0.42, a, 0)}
      {ring(7, r * 0.4, r * 0.32, b, 0.4)}
      {ring(5, r * 0.18, r * 0.24, c, 0.9)}
      <circle cx={cx} cy={cy} r={r * 0.14} fill={GOLD} />
    </g>
  );
}

/** 棕櫚の葉。中肋から細片を扇に */
function Frond({ x, y, len, rot, c, cd, n = 13 }: { x: number; y: number; len: number; rot: number; c: string; cd: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const spread = (t - 0.5) * 150;
        const l = len * (1 - Math.abs(t - 0.5) * 0.9);
        return (
          <path
            key={i}
            d={`M0 0 Q ${Math.sin((spread * Math.PI) / 180) * l * 0.6} ${-Math.cos((spread * Math.PI) / 180) * l * 0.6} ${Math.sin((spread * Math.PI) / 180) * l} ${-Math.cos((spread * Math.PI) / 180) * l}`}
            stroke={i % 2 ? c : cd}
            strokeWidth={len * 0.13}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </g>
  );
}

export default function Plate() {
  const r = rand(20180909);

  /* 豹柄。割れた輪 */
  const spots = Array.from({ length: 16 }, () => ({
    x: r(0, 90),
    y: r(0, 90),
    s: r(0.55, 1.2),
    a: r(0, 180),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="マキシマリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-frame`}><ellipse cx="300" cy="212" rx="88" ry="106" /></clipPath>

        {/* 1. ダマスク。地 */}
        <pattern id={`${P}-damask`} width="100" height="140" patternUnits="userSpaceOnUse">
          <rect width="100" height="140" fill={PLUM} />
          <g stroke={GOLD_D} strokeWidth="2.2" fill="none" opacity="0.85">
            <path d="M50 8 C 22 30 22 62 50 82 C 78 62 78 30 50 8 Z" />
            <path d="M50 24 C 36 38 36 58 50 70 C 64 58 64 38 50 24 Z" />
            <path d="M50 82 C 40 100 20 104 8 96 M50 82 C 60 100 80 104 92 96" />
            <path d="M0 118 C 14 106 30 112 34 128 M100 118 C 86 106 70 112 66 128" />
            <path d="M50 96 L50 140" />
          </g>
          <circle cx="50" cy="46" r="5" fill={GOLD} opacity="0.8" />
          <circle cx="0" cy="130" r="4" fill={ROSE} opacity="0.7" />
          <circle cx="100" cy="130" r="4" fill={ROSE} opacity="0.7" />
        </pattern>

        {/* 2. 縦縞 */}
        <pattern id={`${P}-stripe`} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill={RED} />
          <rect width="13" height="26" fill={ROSE} />
          <rect x="12" width="2" height="26" fill={GOLD} />
        </pattern>

        {/* 3. 豹柄 */}
        <pattern id={`${P}-leo`} width="90" height="90" patternUnits="userSpaceOnUse">
          <rect width="90" height="90" fill={GOLD} />
          {spots.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.s.toFixed(2)})`}>
              <path d="M-13 -4 C -14 -14 -4 -18 4 -14 C 10 -11 12 -4 9 2" stroke={PLUM} strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M-8 10 C -2 15 6 13 10 7" stroke={PLUM} strokeWidth="6" fill="none" strokeLinecap="round" />
              <ellipse cx="-1" cy="-2" rx="5" ry="4" fill="#7a3a12" />
            </g>
          ))}
        </pattern>

        {/* 4. 市松 */}
        <pattern id={`${P}-check`} width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill={JADE} />
          <rect width="18" height="18" fill={PLUM_L} />
          <rect x="18" y="18" width="18" height="18" fill={PLUM_L} />
        </pattern>

        {/* 金の帯。密度の中の休符 */}
        <linearGradient id={`${P}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffdd6e" />
          <stop offset="0.3" stopColor={GOLD} />
          <stop offset="0.55" stopColor="#d79600" />
          <stop offset="0.8" stopColor={GOLD} />
          <stop offset="1" stopColor="#e0a200" />
        </linearGradient>
        <radialGradient id={`${P}-orb`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.6" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_D} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 層1。ダマスクの地 ────────────────────────────── */}
        <rect width="600" height="800" fill={`url(#${P}-damask)`} />

        {/* ── 層2。左右の縞の柱 ───────────────────────────── */}
        <rect x="0" width="84" height="800" fill={`url(#${P}-stripe)`} />
        <rect x="516" width="84" height="800" fill={`url(#${P}-stripe)`} />
        <rect x="80" width="6" height="800" fill={GOLD} />
        <rect x="514" width="6" height="800" fill={GOLD} />

        {/* ── 層3。豹柄の帯。斜めに通して幾何と喧嘩させる ───── */}
        <g transform="rotate(-9 300 246)">
          <rect x="-40" y="188" width="680" height="116" fill={`url(#${P}-leo)`} />
          <rect x="-40" y="188" width="680" height="5" fill={PLUM} />
          <rect x="-40" y="299" width="680" height="5" fill={PLUM} />
        </g>

        {/* ── 層4。市松。豹と正面からぶつける ───────────────── */}
        <rect x="84" y="612" width="432" height="96" fill={`url(#${P}-check)`} />
        <rect x="84" y="608" width="432" height="6" fill={GOLD} />
        <rect x="84" y="706" width="432" height="6" fill={GOLD} />

        {/* ── 層5。植物。柄の上に輪郭のある物を載せる ────────── */}
        <Frond x={120} y={200} len={190} rot={-38} c={JADE} cd={JADE_D} />
        <Frond x={500} y={168} len={168} rot={44} c={JADE} cd={JADE_D} />
        <Frond x={104} y={800} len={210} rot={-16} c={JADE} cd={JADE_D} />
        <Frond x={520} y={812} len={196} rot={18} c={JADE} cd={JADE_D} />
        <Frond x={300} y={812} len={150} rot={2} c={JADE_D} cd={JADE} n={11} />

        {/* 花。下段に房で、上段に散らして */}
        <Bloom cx={168} cy={742} r={62} a={ROSE} b={RED} c={GOLD} />
        <Bloom cx={264} cy={776} r={50} a={RED} b={ROSE} c={GOLD} />
        <Bloom cx={396} cy={754} r={58} a={ROSE} b={PLUM_L} c={GOLD} />
        <Bloom cx={470} cy={790} r={44} a={RED} b={ROSE} c={GOLD} />
        <Bloom cx={132} cy={352} r={44} a={RED} b={ROSE} c={GOLD} />
        <Bloom cx={478} cy={370} r={40} a={ROSE} b={RED} c={GOLD} />
        <Bloom cx={300} cy={578} r={38} a={RED} b={GOLD} c={ROSE} />

        {/* ── 層6。額と鳥。人工物で隙間を潰す ──────────────── */}
        <g>
          {/* 楕円の額 */}
          <ellipse cx="300" cy="212" rx="104" ry="122" fill={`url(#${P}-band)`} />
          <ellipse cx="300" cy="212" rx="104" ry="122" fill="none" stroke="#6b4a00" strokeWidth="2" />
          <ellipse cx="300" cy="212" rx="88" ry="106" fill={PLUM_L} />
          <ellipse cx="300" cy="212" rx="88" ry="106" fill="none" stroke="#6b4a00" strokeWidth="2" />
          {/* 額の中も柄で埋める */}
          <g clipPath="none">
            <ellipse cx="300" cy="212" rx="88" ry="106" fill={`url(#${P}-damask)`} opacity="0.85" />
          </g>
          {/* 玉縁 */}
          {Array.from({ length: 40 }, (_, i) => {
            const a = (i / 40) * Math.PI * 2;
            return <circle key={i} cx={300 + Math.cos(a) * 96} cy={212 + Math.sin(a) * 114} r="4" fill={`url(#${P}-orb)`} />;
          })}
          {/* 鳥。額の中の主。だが目を止めさせすぎない。
              初稿は尾が額の外へ跳ね出して、虫のように見えた。
              額の内側で切り抜いて収める */}
          <g clipPath={`url(#${P}-frame)`}>
            {/* 止まり木 */}
            <path d="M212 286 C 258 274 330 276 392 268" stroke={GOLD_D} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M300 278 C 322 268 336 252 342 236" stroke={GOLD_D} strokeWidth="4" fill="none" strokeLinecap="round" />
            <g transform="translate(292 216)">
              {/* 尾。長く垂らす。額の中で完結させる */}
              <path d="M-4 34 C -22 52 -34 74 -38 96 C -24 78 -8 60 10 46 Z" fill={RED} />
              <path d="M2 34 C -10 54 -18 76 -20 98 C -8 78 6 58 20 44 Z" fill={ROSE} />
              {/* 胴 */}
              <path d="M-8 40 C -38 30 -48 -4 -30 -28 C -14 -48 20 -50 34 -30 C 48 -10 38 28 6 40 Z" fill={JADE} />
              <path d="M-8 40 C -34 28 -42 0 -26 -22 C -14 -38 4 -42 14 -36 C -10 -24 -20 8 -8 40 Z" fill={JADE_D} />
              {/* 翼 */}
              <path d="M-2 -14 C 18 -12 32 4 30 24 C 18 14 4 4 -8 0 Z" fill="#2aa791" />
              <g stroke={GOLD} strokeWidth="2.2" opacity="0.85" fill="none">
                <path d="M0 -8 C 14 -4 24 6 26 18" />
                <path d="M-4 2 C 8 6 18 14 20 24" />
              </g>
              {/* 頭と嘴 */}
              <circle cx="26" cy="-40" r="17" fill={JADE} />
              <path d="M40 -44 L60 -38 L40 -32 Z" fill={GOLD} />
              <circle cx="31" cy="-44" r="4" fill={PLUM} />
              <circle cx="32.6" cy="-45.4" r="1.4" fill="#fff" />
              {/* 冠羽 */}
              <path d="M22 -56 C 20 -72 30 -82 42 -84 C 32 -74 28 -64 30 -56 Z" fill={GOLD} />
              <path d="M16 -54 C 12 -68 18 -78 28 -82 C 20 -72 18 -62 20 -54 Z" fill={ROSE} />
            </g>
          </g>
        </g>

        {/* 中段の緩みを潰す。額の裾に花綱を回す */}
        <Bloom cx={214} cy={330} r={40} a={RED} b={ROSE} c={GOLD} />
        <Bloom cx={386} cy={334} r={38} a={ROSE} b={RED} c={GOLD} />
        <Frond x={188} y={368} len={92} rot={-58} c={JADE} cd={JADE_D} n={9} />
        <Frond x={412} y={370} len={92} rot={58} c={JADE} cd={JADE_D} n={9} />
        <Bloom cx={300} cy={382} r={34} a={ROSE} b={GOLD} c={RED} />

        {/* 房飾り。天から下げる */}
        <g>
          {Array.from({ length: 13 }, (_, i) => {
            const x = 96 + i * 34;
            const len = 26 + (i % 3) * 14;
            return (
              <g key={i}>
                <path d={`M${x} 0 L${x} 22`} stroke={GOLD} strokeWidth="3" />
                <circle cx={x} cy={26} r="8" fill={`url(#${P}-orb)`} />
                <path d={`M${x - 8} 32 L${x + 8} 32 L${x + 5} ${34 + len} L${x - 5} ${34 + len} Z`} fill={i % 2 ? RED : ROSE} />
                {Array.from({ length: 5 }, (_, k) => (
                  <line key={k} x1={x - 6 + k * 3} y1="34" x2={x - 5 + k * 2.4} y2={34 + len} stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
                ))}
              </g>
            );
          })}
          <rect x="84" y="0" width="432" height="10" fill={`url(#${P}-band)`} />
        </g>

        {/* ── 金の帯と題字。密度の中の唯一の休符 ─────────────── */}
        <g>
          <rect x="-10" y="428" width="620" height="88" fill={`url(#${P}-band)`} transform="rotate(-2.5 300 472)" />
          <g transform="rotate(-2.5 300 472)">
            <rect x="-10" y="428" width="620" height="4" fill="#6b4a00" opacity="0.75" />
            <rect x="-10" y="512" width="620" height="4" fill="#6b4a00" opacity="0.75" />
            {/* 帯の飾り罫。金無地だと管に見える */}
            {Array.from({ length: 32 }, (_, i) => (
              <g key={i}>
                <path d={`M${-6 + i * 20} 436 l6 6 l-6 6 l-6 -6 Z`} fill="#6b4a00" opacity="0.5" />
                <path d={`M${-6 + i * 20} 502 l6 6 l-6 6 l-6 -6 Z`} fill="#6b4a00" opacity="0.5" />
              </g>
            ))}
            <text x="300" y="486" textAnchor="middle" fill={PLUM} fontFamily="Georgia, 'Times New Roman', serif" fontSize="47" fontWeight="700" letterSpacing="1.4">
              MAXIMALISM
            </text>
          </g>
        </g>
        <text x="300" y="546" textAnchor="middle" fill={GOLD} fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" fontStyle="italic" letterSpacing="5.4">
          MORE IS MORE · 2010s—
        </text>

        {/* 最後の隙間潰し。宝石と星 */}
        {Array.from({ length: 34 }, (_, i) => {
          const x = r(0, 600);
          const y = r(0, 800);
          const c = [GOLD, ROSE, JADE, RED][Math.floor(r(0, 4))];
          if (y > 424 && y < 556) return null; // 帯の上には置かない
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r(0, 90)}) scale(${r(0.5, 1.2).toFixed(2)})`}>
              <path d="M0 -11 L4 0 L0 11 L-4 0 Z" fill={c} />
              <path d="M-11 0 L0 -4 L11 0 L0 4 Z" fill={c} />
            </g>
          );
        })}

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.14" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
