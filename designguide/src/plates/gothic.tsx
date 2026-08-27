/**
 * ゴシック。
 *
 * 大聖堂の窓を1枚、正面から。尖頭アーチ・狭間飾り（トレサリー）・
 * 鉛桟（ケイム）で仕切られた色ガラス。
 *
 * ■ ここで作っている「らしさ」
 *   1. 尖頭アーチ。初稿でここを落とした。
 *      ベジエで「上をなだらかに閉じる」曲線を引いたら半円になり、
 *      ゴシックではなくロマネスクの窓になった。
 *      尖頭は近似では出ない。正三角形アーチ（equilateral arch）の作図——
 *      左の弧の中心を右の起拱点に、右の弧の中心を左の起拱点に置き、
 *      半径＝開口幅——で描くと、頂点で 120 度に交わって必ず尖る。
 *      pointed() がそれ。この一点でこの様式は決まる。
 *   2. 垂直。窓は幅より高さを勝たせ、両脇に控壁と小尖塔を立てる。
 *      横に広い窓を描いた瞬間に、様式が消える。
 *   3. 鉛桟。色面の境目には必ず太い暗い線が入る。
 *      ガラスは「塗り分け」ではなく「線で仕切られた破片の集合」。
 *   4. ブラックレター。平筆（ブロードニブ）を一定の角度で保ったまま
 *      引いた画だけで組んである。だから縦画は太く、右上がりの画は細い。
 *      nib() が「ペンを1回動かした跡」＝1画。文字はその集まり。
 *      書体を読み込めない以上、字は自分で引くしかない。
 */
import { ATLAS, rand, rad, onCircle, shift, alpha } from "@/lib/plate";

const P = "go";
const STONE = "#1a1420";
const WINE = "#6b1f3a";
const BLUE = "#2a4a7a";
const GOLD = "#c9a227";
const CREAM = "#e8e2d6";

/**
 * 正三角形アーチ。半径＝開口幅、中心は互いの起拱点。
 * 頂点で 120 度に交わるので、必ず尖る。これがゴシックの作図法。
 */
function pointed(x0: number, x1: number, yS: number) {
  const R = x1 - x0;
  const cx = (x0 + x1) / 2;
  const yA = yS - R * Math.sqrt(3) / 2;
  return { d: `M${x0} ${yS} A${R} ${R} 0 0 1 ${cx} ${yA.toFixed(1)} A${R} ${R} 0 0 1 ${x1} ${yS}`, yA, cx };
}

/* ── 平筆。角度を保ったまま A→B へ動かした跡が1画 ─────────────── */
const PEN = -38;
const NW = 11;
function nib(x1: number, y1: number, x2: number, y2: number, w = NW) {
  const dx = (Math.cos(rad(PEN)) * w) / 2;
  const dy = (Math.sin(rad(PEN)) * w) / 2;
  return `M${x1 - dx} ${y1 - dy} L${x2 - dx} ${y2 - dy} L${x2 + dx} ${y2 + dy} L${x1 + dx} ${y1 + dy} Z`;
}

/** 葉形飾り。円を n 個の弧で刻む。三葉・四葉・六葉 */
function foil(cx: number, cy: number, r: number, n: number, rot = 0) {
  const rc = r * 0.46;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i * 360) / n - 180 / n;
    const a1 = rot + (i * 360) / n + 180 / n;
    const [x0, y0] = onCircle(cx, cy, rc, a0);
    const [x1, y1] = onCircle(cx, cy, rc, a1);
    const [c0x, c0y] = onCircle(cx, cy, r * 1.2, a0 + (180 / n) * 0.4);
    const [c1x, c1y] = onCircle(cx, cy, r * 1.2, a1 - (180 / n) * 0.4);
    d += (i === 0 ? `M${x0.toFixed(1)} ${y0.toFixed(1)}` : "") +
      ` C ${c0x.toFixed(1)} ${c0y.toFixed(1)} ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d + " Z";
}

/* 窓。幅より高さを勝たせる。横長にした瞬間に様式が消える */
const WIN = pointed(150, 450, 360); // 頂点 y ≈ 100
const SILL = 664;
const LAN = [pointed(162, 294, 424), pointed(306, 438, 424)]; // 頂点 y ≈ 310

/** ガラスの円形図。中身は幾何だけで作る */
function Medallion({ cx, cy, r, kind, seed }: { cx: number; cy: number; r: number; kind: 0 | 1 | 2; seed: number }) {
  const rr = rand(seed);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={shift(BLUE, -0.2)} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={shift(STONE, 0.1)} strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={GOLD} strokeWidth="2.6" />
      {kind === 0 && (
        <>
          {[0, 90, 180, 270].map((a, i) => {
            const [x1, y1] = onCircle(cx, cy, r * 0.2, a);
            const [x2, y2] = onCircle(cx, cy, r * 0.82, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WINE} strokeWidth={r * 0.3} />;
          })}
          <circle cx={cx} cy={cy} r={r * 0.24} fill={GOLD} />
          <circle cx={cx} cy={cy} r={r * 0.1} fill={WINE} />
        </>
      )}
      {kind === 1 && (
        <>
          <path d={foil(cx, cy, r * 0.76, 4, 45)} fill={WINE} stroke={GOLD} strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r * 0.2} fill={CREAM} />
          <circle cx={cx} cy={cy} r={r * 0.09} fill={BLUE} />
        </>
      )}
      {kind === 2 && (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const [x1, y1] = onCircle(cx, cy, r * 0.16, i * 45);
            const [x2, y2] = onCircle(cx, cy, r * 0.84, i * 45);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 === 0 ? GOLD : CREAM} strokeWidth={r * 0.17} opacity={rr(0.82, 1)} />;
          })}
          <circle cx={cx} cy={cy} r={r * 0.2} fill={WINE} stroke={GOLD} strokeWidth="2" />
        </>
      )}
    </g>
  );
}

/** 控壁と小尖塔。垂直を支える。葉飾り（クロケット）を稜に並べる */
function Buttress({ x, flip }: { x: number; flip: number }) {
  return (
    <g transform={`translate(${x} 0) scale(${flip} 1)`}>
      {/* 段のある本体。上へ行くほど細い */}
      <path d="M-38 720 L-38 540 L-32 528 L-32 400 L-26 388 L-26 268 L-20 256 L-20 200 L20 200 L20 256 L26 268 L26 388 L32 400 L32 528 L38 540 L38 720 Z" fill={shift(STONE, 0.22)} />
      <path d="M-38 720 L-38 540 L-32 528 L-32 400 L-26 388 L-26 268 L-20 256 L-20 200 L0 200 L0 720 Z" fill={shift(STONE, 0.36)} />
      {/* 段の水切り */}
      {[540, 400, 268].map((y, i) => (
        <rect key={i} x={-40 + i * 6} y={y - 5} width={80 - i * 12} height="7" fill={shift(STONE, 0.5)} />
      ))}
      {/* 目地 */}
      <g stroke={shift(STONE, 0.06)} strokeWidth="1.2" opacity="0.8">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-36} y1={216 + i * 36} x2={36} y2={216 + i * 36} />
        ))}
      </g>
      {/* 小尖塔 */}
      <polygon points="0,64 -20,200 20,200" fill={shift(STONE, 0.3)} />
      <polygon points="0,64 0,200 20,200" fill={shift(STONE, 0.12)} />
      {/* 稜のクロケット。近くで見たときの細部その1 */}
      {[100, 126, 152, 178].map((y, i) => (
        <g key={i}>
          <path d={`M${-((y - 64) * 0.147)} ${y} c -9 -1 -12 -9 -6 -13 c 5 -4 10 1 6 5 c -2 2 -5 1 -4 -1`} fill={shift(STONE, 0.46)} />
          <path d={`M${(y - 64) * 0.147} ${y} c 9 -1 12 -9 6 -13 c -5 -4 -10 1 -6 5 c 2 2 5 1 4 -1`} fill={shift(STONE, 0.46)} />
        </g>
      ))}
      <circle cx="0" cy="60" r="7" fill={GOLD} />
      <polygon points="0,40 -4,60 4,60" fill={shift(STONE, 0.5)} />
    </g>
  );
}

export default function Plate() {
  const r = rand(1240);

  /* ブラックレター。1文字＝ニブの画の集まり */
  const CW = 30;
  const XH = 32;
  const AS = 46;
  const glyph = (kind: string, x: number): string[] => {
    const s: string[] = [];
    const L = x;
    const R = x + 18;
    const M = x + 9;
    const dia = (px: number, py: number) => nib(px - 5.5, py + 5.5, px + 5.5, py - 5.5);
    switch (kind) {
      case "g":
        s.push(nib(L, -XH + 4, L, -4), nib(R, -XH + 4, R, -4));
        s.push(nib(L, -XH + 4, M, -XH - 4), nib(M, -XH - 4, R, -XH + 4));
        s.push(nib(L, -4, M, 4), nib(M, 4, R, -4));
        s.push(nib(R, -4, R - 2, 10), nib(R - 2, 10, L - 5, 15));
        break;
      case "o":
        s.push(nib(L, -XH + 4, L, -4), nib(R, -XH + 4, R, -4));
        s.push(nib(L, -XH + 4, M, -XH - 4), nib(M, -XH - 4, R, -XH + 4));
        s.push(nib(L, -4, M, 4), nib(M, 4, R, -4));
        break;
      case "t":
        s.push(nib(L + 7, -XH - 12, L + 7, 0), dia(L + 7, 0));
        s.push(nib(L - 3, -XH + 2, L + 18, -XH + 2, 6.5));
        break;
      case "h":
        s.push(nib(L, -AS, L, 0), dia(L, -AS + 2), dia(L, 0));
        s.push(nib(R, -XH + 6, R, 0), dia(R, 0));
        s.push(nib(L, -XH + 2, R, -XH + 8));
        break;
      case "i":
        s.push(nib(L + 6, -XH, L + 6, 0), dia(L + 6, -XH), dia(L + 6, 0));
        break;
      case "c":
        s.push(nib(L, -XH + 4, L, -4));
        s.push(nib(L, -XH + 4, M, -XH - 4), nib(M, -XH - 4, R, -XH + 2));
        s.push(nib(L, -4, M, 4), nib(M, 4, R, 0));
        break;
    }
    return s;
  };
  const WORD = "gothic".split("");
  const STROKES = WORD.flatMap((ch, i) => glyph(ch, i * CW));
  const WORD_X = 300 - (WORD.length * CW - 14) / 2;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ゴシック様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 白ガラス（グリザイユ）。菱形の割り付けと細い鉛桟 */}
        <pattern id={`${P}-quarry`} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="24" height="24" fill={shift(CREAM, -0.24)} />
          <rect width="24" height="24" fill="none" stroke={shift(STONE, 0.12)} strokeWidth="2.2" />
          <circle cx="12" cy="12" r="3" fill={shift(CREAM, -0.44)} />
        </pattern>
        <pattern id={`${P}-quarryBlue`} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="24" height="24" fill="#2f63b8" />
          <rect width="24" height="24" fill="none" stroke={shift(STONE, 0.12)} strokeWidth="2.2" />
          <circle cx="12" cy="12" r="3" fill="#79a6e0" />
        </pattern>
        {/* ステンドグラスの技法は「色を塗る」ことではなく「光を通す」こと。
            前の版は色板を並べただけで、**裏から光が来ていなかった。**
            ガラスの上に光を起こし、その光を周りの石まで零す。
            この零れ（spill）が入って初めて、窓が窓に見える */}
        <radialGradient id={`${P}-glow`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={alpha(CREAM, 0.6)} />
          <stop offset="34%" stopColor={alpha(CREAM, 0.3)} />
          <stop offset="72%" stopColor={alpha(CREAM, 0.1)} />
          <stop offset="100%" stopColor={alpha(CREAM, 0)} />
        </radialGradient>
        {/* 石に零れる光。窓より一回り大きく、青みを帯びる */}
        <radialGradient id={`${P}-spill`} cx="50%" cy="48%" r="58%">
          <stop offset="0%" stopColor={alpha("#7fa8d8", 0.34)} />
          <stop offset="46%" stopColor={alpha("#7fa8d8", 0.13)} />
          <stop offset="100%" stopColor={alpha("#7fa8d8", 0)} />
        </radialGradient>
        <clipPath id={`${P}-outer`}>
          <path d={`${pointed(126, 474, 380).d} L474 ${SILL + 20} L126 ${SILL + 20} Z`} />
        </clipPath>
        <clipPath id={`${P}-win`}>
          <path d={`${WIN.d} L450 ${SILL} L150 ${SILL} Z`} />
        </clipPath>
        {LAN.map((l, i) => (
          <clipPath key={i} id={`${P}-l${i}`}>
            <path d={`${l.d} L${i === 0 ? 294 : 438} ${SILL - 8} L${i === 0 ? 162 : 306} ${SILL - 8} Z`} />
          </clipPath>
        ))}
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={STONE} />
        {/* 石積み。横目地だけ。縦線を足すと壁が主役になる */}
        <g stroke={shift(STONE, 0.1)} strokeWidth="1.4" opacity="0.7">
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1="0" y1={24 + i * 36} x2="600" y2={24 + i * 36} />
          ))}
        </g>

        <Buttress x={92} flip={1} />
        <Buttress x={508} flip={-1} />

        {/* ── 窓枠。尖頭アーチの迫石と水切り ─────────────────── */}
        <path d={`${pointed(126, 474, 380).d} L474 ${SILL + 20} L126 ${SILL + 20} Z`} fill={shift(STONE, 0.24)} />
        <path d={`${pointed(138, 462, 370).d} L462 ${SILL + 10} L138 ${SILL + 10} Z`} fill={shift(STONE, 0.4)} />
        <path d={`${WIN.d} L450 ${SILL} L150 ${SILL} Z`} fill={shift(STONE, -0.5)} />
        {/* 迫石の目地。アーチの二つの中心から放射させる。近くで見たときの細部その2 */}
        <g stroke={shift(STONE, 0.5)} strokeWidth="1.2" opacity="0.75" clipPath={`url(#${P}-outer)`}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = -60 + i * 7.5;
            const [x1, y1] = onCircle(450, 360, 300, a);
            const [x2, y2] = onCircle(450, 360, 348, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const a = 60 - i * 7.5;
            const [x1, y1] = onCircle(150, 360, 300, a);
            const [x2, y2] = onCircle(150, 360, 348, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <line x1="126" y1={392 + i * 40} x2="150" y2={392 + i * 40} />
              <line x1="450" y1={392 + i * 40} x2="474" y2={392 + i * 40} />
            </g>
          ))}
        </g>

        {/* ── 狭間飾り。アーチの頭。窓の中と地続きにする ────────── */}
        <g clipPath={`url(#${P}-win)`}>
          {/* 地は狭間の頭の少し下まで。ここを深く塗ると狭間のガラスを潰す
              （初稿で 424 まで塗って、狭間の上半分が青一色になった） */}
          <path
            d="M150 430 L150 360 A300 300 0 0 1 300 100 A300 300 0 0 1 450 360 L450 430 Z"
            fill={shift(BLUE, -0.42)}
          />
          <path d={foil(300, 214, 62, 6, 0)} fill={WINE} stroke={shift(STONE, 0.12)} strokeWidth="5" />
          <path d={foil(300, 214, 38, 6, 30)} fill={BLUE} stroke={GOLD} strokeWidth="2.4" />
          <circle cx="300" cy="214" r="16" fill={GOLD} stroke={shift(STONE, 0.12)} strokeWidth="3.4" />
          <circle cx="300" cy="214" r="7" fill={WINE} />
          <circle cx="300" cy="214" r="66" fill="none" stroke={shift(STONE, 0.34)} strokeWidth="8" />
          {/* 頂の小さな四葉と、脇の三葉 */}
          <path d={foil(300, 128, 20, 4, 45)} fill={CREAM} stroke={shift(STONE, 0.12)} strokeWidth="3.4" />
          <circle cx="300" cy="128" r="5.5" fill={BLUE} />
          {[204, 396].map((x, i) => (
            <g key={i}>
              <path d={foil(x, 286, 27, 3, 0)} fill={GOLD} stroke={shift(STONE, 0.12)} strokeWidth="3.6" />
              <circle cx={x} cy="286" r="8" fill={WINE} />
            </g>
          ))}
        </g>

        {/* ── 狭間のガラス ───────────────────────────────── */}
        {LAN.map((l, i) => {
          const x0 = i === 0 ? 162 : 306;
          const x1 = i === 0 ? 294 : 438;
          return (
            <g key={i} clipPath={`url(#${P}-l${i})`}>
              <rect x={x0} y={l.yA - 10} width={x1 - x0} height={700} fill={`url(#${P}-quarry)`} />
              {/* 色帯。白ガラスの中に色を差すのが13世紀の割り付け */}
              <rect x={x0} y={l.yA + 26} width={x1 - x0} height="24" fill={i === 0 ? "#2f63b8" : "#9c2440"} />
              <rect x={x0} y={l.yA + 26} width={x1 - x0} height="24" fill="none" stroke={shift(STONE, 0.1)} strokeWidth="4" />
              <rect x={x0} y="600" width={x1 - x0} height="30" fill={`url(#${P}-quarryBlue)`} />
              <rect x={x0} y="600" width={x1 - x0} height="30" fill="none" stroke={shift(STONE, 0.1)} strokeWidth="4" />
              <Medallion cx={(x0 + x1) / 2} cy={452} r={54} kind={i === 0 ? 0 : 1} seed={i * 7 + 1} />
              <Medallion cx={(x0 + x1) / 2} cy={556} r={30} kind={2} seed={i * 13 + 5} />
              {/* ガラスの気泡・むら */}
              {Array.from({ length: 26 }, (_, j) => (
                <circle key={j} cx={r(x0, x1)} cy={r(l.yA, SILL)} r={r(0.8, 2.6)} fill={CREAM} opacity={r(0.05, 0.16)} />
              ))}
            </g>
          );
        })}

        {/* ── 鉛桟・方立・狭間の縁石 ───────────────────────── */}
        <g fill="none" stroke={shift(STONE, 0.3)} strokeLinecap="butt">
          {LAN.map((l, i) => (
            <path key={i} d={`${l.d} L${i === 0 ? 294 : 438} ${SILL - 8} L${i === 0 ? 162 : 306} ${SILL - 8} Z`} strokeWidth="11" />
          ))}
          <line x1="300" y1={SILL} x2="300" y2="286" strokeWidth="15" />
        </g>
        <line x1="300" y1={SILL} x2="300" y2="286" stroke={shift(STONE, 0.46)} strokeWidth="8" />
        {/* 横桟。ガラスを支える鉄棒。実物には必ずある */}
        <g stroke={shift(STONE, 0.02)} strokeWidth="3" opacity="0.9">
          {[386, 512, 592, 640].map((y, i) => (
            <line key={i} x1="152" y1={y} x2="448" y2={y} />
          ))}
        </g>

        {/* 窓の光。ガラスの上から中心を起こし、石まで零す */}
        <ellipse cx="300" cy="418" rx="190" ry="300" fill={`url(#${P}-glow)`} style={{ mixBlendMode: "screen" }} />
        {/* 零れは窓の外周までに留める。控壁まで届かせたら、
            石が明るくなって夜の聖堂ではなく昼の建物に見えた */}
        <g clipPath={`url(#${P}-outer)`}>
          <ellipse cx="300" cy="414" rx="260" ry="360" fill={`url(#${P}-spill)`} style={{ mixBlendMode: "screen" }} />
        </g>

        {/* ── 窓台。控壁の間に渡す ───────────────────────── */}
        <path d={`M118 ${SILL + 12} L482 ${SILL + 12} L494 ${SILL + 32} L106 ${SILL + 32} Z`} fill={shift(STONE, 0.34)} />
        <rect x="106" y={SILL + 32} width="388" height="5" fill={shift(STONE, 0.52)} />
        {/* 窓台の石に彫った銘。ブラックレターと段を分けて重ならないようにする */}
        <rect x="106" y={SILL + 37} width="388" height="17" fill={shift(STONE, -0.3)} />
        <text
          x="300" y={SILL + 49} textAnchor="middle" fill={GOLD}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.4" letterSpacing="4.2" opacity="0.92"
        >
          OPVS FRANCIGENVM · XII—XVI SÆC.
        </text>
        {/* 犬歯飾り */}
        {Array.from({ length: 25 }, (_, i) => (
          <polygon key={i} points={`${108 + i * 15.5},${SILL + 54} ${115.7 + i * 15.5},${SILL + 66} ${123.5 + i * 15.5},${SILL + 54}`} fill={shift(STONE, 0.26)} />
        ))}
        <line x1="60" y1="744" x2="540" y2="744" stroke={GOLD} strokeWidth="1.2" opacity="0.7" />

        {/* ── ブラックレター。平筆の画だけで組む ───────────────── */}
        <g transform={`translate(${WORD_X - 2} 782)`} fill={GOLD} opacity="0.5">
          {STROKES.map((d, i) => <path key={i} d={d} />)}
        </g>
        <g transform={`translate(${WORD_X} 784)`} fill={CREAM}>
          {STROKES.map((d, i) => <path key={i} d={d} />)}
        </g>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.24" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
