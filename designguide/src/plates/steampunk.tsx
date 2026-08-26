/**
 * スチームパンク。
 *
 * ■ ディーゼルパンクと分ける
 *   こちらは19世紀。真鍮・革・蒸気。冷たい鋼ではなく暖かい金。
 *   絵の性格も変える。こちらは「機械の設計図」＝細く精密な線。
 *   あちらは「プロパガンダの一枚絵」＝太く大きな面。
 *
 * ■ 図面の紙に描く
 *   歯車をただ並べても玩具にしかならない。
 *   枠・表題欄・寸法線・中心線（一点鎖線）・引出線の番号を乗せると、
 *   同じ絵が「設計された物」に変わる。ここがこの様式の芯だと考えた。
 *
 * ■ 歯車は手で置かない
 *   歯数と外径・歯底径から輪郭を作る。噛み合う位置は
 *   （半径の和）だけ離して置く。ここを目分量にすると必ず嘘になる。
 */
import { ATLAS, rand, rad } from "@/lib/plate";

const P = "sp";

const INK = "#241a12";
const BRASS = "#b08046";
const COPPER = "#7a4a20";
const PAPER = "#d9c9a3";
const SHADOW = "#3f2f22";

/** 歯車の輪郭。歯先径 R・歯底径 rt・歯数 n */
function gear(cx: number, cy: number, R: number, rt: number, n: number) {
  const pts: [number, number][] = [];
  const w = 360 / n;
  for (let i = 0; i < n; i++) {
    const a = i * w;
    [
      [rt, a],
      [R, a + w * 0.15],
      [R, a + w * 0.35],
      [rt, a + w * 0.5],
    ].forEach(([rr, aa]) => {
      const t = rad(aa);
      pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
    });
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L") + " Z";
}

/** リベット。頭の光と影の2つで、初めて盛り上がって見える */
const Rivet = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={COPPER} />
    <circle cx={x - r * 0.24} cy={y - r * 0.24} r={r * 0.62} fill="#e2c48c" />
    <circle cx={x + r * 0.2} cy={y + r * 0.24} r={r * 0.44} fill={SHADOW} opacity="0.45" />
  </g>
);

/** 歯車ひと組。輪郭・輪帯・輻（スポーク）・軸 */
function Wheel({ cx, cy, R, n, spokes, seed }: { cx: number; cy: number; R: number; n: number; spokes: number; seed: number }) {
  const rt = R * 0.87;
  const rim = R * 0.7;
  const hub = R * 0.22;
  const r = rand(seed);
  return (
    <g>
      <path d={gear(cx, cy, R, rt, n)} fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r={rim} fill={`url(#${P}-brass2)`} stroke={SHADOW} strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r={rim * 0.86} fill={PAPER} opacity="0.25" />
      {/* 輻。中ほどを細らせると鋳物になる */}
      {Array.from({ length: spokes }, (_, i) => {
        const a = rad((360 / spokes) * i + 10);
        const nx = Math.cos(a), ny = Math.sin(a);
        const px = -ny, py = nx;
        const w0 = R * 0.115, w1 = R * 0.07;
        return (
          <path key={i} fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1"
                d={`M${cx + px * w0} ${cy + py * w0} L${cx + nx * rim * 0.94 + px * w1} ${cy + ny * rim * 0.94 + py * w1}
                    L${cx + nx * rim * 0.94 - px * w1} ${cy + ny * rim * 0.94 - py * w1} L${cx - px * w0} ${cy - py * w0} Z`} />
        );
      })}
      <circle cx={cx} cy={cy} r={hub} fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r={hub * 0.42} fill={SHADOW} />
      {/* 輪帯のボルト */}
      {Array.from({ length: spokes * 2 }, (_, i) => {
        const a = rad((360 / (spokes * 2)) * i + 22);
        return <Rivet key={i} x={cx + Math.cos(a) * rim * 0.88} y={cy + Math.sin(a) * rim * 0.88} r={R * 0.026 + 1.2} />;
      })}
      {/* 擦れ。使い込まれた金属 */}
      <g stroke="#e6cd97" strokeWidth="0.8" opacity="0.35">
        {Array.from({ length: 8 }, (_, i) => {
          const a = rad(r(0, 360));
          const rr = r(hub + 6, rim - 4);
          return <line key={i} x1={cx + Math.cos(a) * rr} y1={cy + Math.sin(a) * rr}
                       x2={cx + Math.cos(a + 0.28) * rr} y2={cy + Math.sin(a + 0.28) * rr} />;
        })}
      </g>
    </g>
  );
}

export default function Plate() {
  const r = rand(18890512);

  /* 噛み合う3枚。中心距離は半径の和で決める */
  const G1 = { cx: 214, cy: 396, R: 138, n: 30 };
  const G2 = { cx: 214 + Math.cos(rad(-52)) * 216, cy: 396 + Math.sin(rad(-52)) * 216, R: 78, n: 17 };
  const G3 = { cx: 214 + Math.cos(rad(14)) * 190, cy: 396 + Math.sin(rad(14)) * 190, R: 52, n: 12 };

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="スチームパンク様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        <linearGradient id={`${P}-paper`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#e6d8b6" />
          <stop offset="0.5" stopColor={PAPER} />
          <stop offset="1" stopColor="#c2ae86" />
        </linearGradient>
        {/* 真鍮。光は左上から。中ほどに一本、明るい帯を通すと金属になる */}
        <linearGradient id={`${P}-brass`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f0d69e" />
          <stop offset="0.22" stopColor="#dcb872" />
          <stop offset="0.48" stopColor={BRASS} />
          <stop offset="0.72" stopColor={COPPER} />
          <stop offset="1" stopColor="#5c3517" />
        </linearGradient>
        <linearGradient id={`${P}-brass2`} x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#e8caa0" />
          <stop offset="0.5" stopColor={BRASS} />
          <stop offset="1" stopColor="#6b3f1c" />
        </linearGradient>
        <linearGradient id={`${P}-pipe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5b2a" />
          <stop offset="0.24" stopColor="#e8c894" />
          <stop offset="0.5" stopColor={BRASS} />
          <stop offset="0.82" stopColor="#5f381a" />
          <stop offset="1" stopColor="#3a2010" />
        </linearGradient>
        <linearGradient id={`${P}-leather`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4423" />
          <stop offset="0.35" stopColor="#8a5a2e" />
          <stop offset="1" stopColor="#402413" />
        </linearGradient>
        <radialGradient id={`${P}-glass`} cx="0.34" cy="0.28">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor={SHADOW} stopOpacity="0.14" />
        </radialGradient>
        <radialGradient id={`${P}-vig`} cx="0.45" cy="0.45">
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#4a3418" stopOpacity="0.4" />
        </radialGradient>
        <filter id={`${P}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-paper)`} />

        {/* 方眼。図面の紙には必ず下敷きがある */}
        <g stroke={COPPER} strokeWidth="0.5" opacity="0.16">
          {Array.from({ length: 31 }, (_, i) => <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="800" />)}
          {Array.from({ length: 41 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="600" y2={i * 20} />)}
        </g>

        {/* ── 蒸気管。歯車の後ろを通す ─────────────────────────── */}
        <g>
          <path d="M-10 706 L150 706 C206 706 214 668 214 620 L214 500" fill="none" stroke={SHADOW} strokeWidth="42" strokeLinecap="butt" opacity="0.25" />
          <path d="M-10 700 L150 700 C200 700 208 664 208 616 L208 500" fill="none" stroke={`url(#${P}-pipe)`} strokeWidth="36" />
          <path d="M-10 690 L150 690 C192 690 198 660 198 612 L198 500" fill="none" stroke="#f0d8a6" strokeWidth="3" opacity="0.5" />
          {/* フランジ */}
          {[[60, 700, 0], [178, 664, 40], [208, 546, 90]].map(([x, y, rot], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <rect x="-9" y="-27" width="18" height="54" rx="3" fill={`url(#${P}-brass2)`} stroke={SHADOW} strokeWidth="1.2" />
              <Rivet x={0} y={-19} r={3.4} /><Rivet x={0} y={19} r={3.4} />
            </g>
          ))}
          {/* 弁へ上がる枝管。歯車の裏を通して、弁に根を付ける */}
          <path d="M330 238 L454 238 L454 208" fill="none" stroke={SHADOW} strokeWidth="26" opacity="0.22" transform="translate(3 5)" />
          <path d="M330 238 L454 238 L454 208" fill="none" stroke={`url(#${P}-pipe)`} strokeWidth="22" strokeLinejoin="round" />
          {/* 逃し弁と蒸気 */}
          <g transform="translate(454 168)">
            <rect x="-13" y="0" width="26" height="34" rx="3" fill={`url(#${P}-brass2)`} stroke={SHADOW} strokeWidth="1.2" />
            <rect x="-20" y="30" width="40" height="10" rx="2" fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1.2" />
            <circle cx="0" cy="-8" r="9" fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1.2" />
            <Rivet x={-13} y={35} r={3} /><Rivet x={13} y={35} r={3} />
          </g>
          <g filter={`url(#${P}-soft)`} opacity="0.78" fill="#f8f2e2">
            <ellipse cx="470" cy="132" rx="46" ry="24" />
            <ellipse cx="512" cy="98" rx="34" ry="19" />
            <ellipse cx="540" cy="64" rx="24" ry="13" />
          </g>
        </g>

        {/* ── 歯車。大→小の順に置く ───────────────────────────── */}
        <Wheel cx={G2.cx} cy={G2.cy} R={G2.R} n={G2.n} spokes={5} seed={31} />
        <Wheel cx={G3.cx} cy={G3.cy} R={G3.R} n={G3.n} spokes={4} seed={57} />
        <Wheel cx={G1.cx} cy={G1.cy} R={G1.R} n={G1.n} spokes={6} seed={11} />

        {/* ── 革帯。金属だけだと硬いので、1本だけ有機物を渡す ─────── */}
        <g>
          <path d="M-20 168 C120 132 250 176 350 268 C400 314 452 336 620 330" fill="none"
                stroke={SHADOW} strokeWidth="34" opacity="0.2" transform="translate(4 8)" />
          <path d="M-20 160 C120 124 250 168 350 260 C400 306 452 328 620 322" fill="none"
                stroke={`url(#${P}-leather)`} strokeWidth="28" />
          <path d="M-20 160 C120 124 250 168 350 260 C400 306 452 328 620 322" fill="none"
                stroke="#c08a4e" strokeWidth="1.4" strokeDasharray="7 6" opacity="0.65" transform="translate(0 -8)" />
          <path d="M-20 160 C120 124 250 168 350 260 C400 306 452 328 620 322" fill="none"
                stroke="#c08a4e" strokeWidth="1.4" strokeDasharray="7 6" opacity="0.65" transform="translate(0 8)" />
          {/* 尾錠 */}
          <g transform="translate(468 330) rotate(-4)">
            <rect x="-26" y="-22" width="52" height="44" rx="5" fill="none" stroke={`url(#${P}-brass2)`} strokeWidth="8" />
            <rect x="-26" y="-22" width="52" height="44" rx="5" fill="none" stroke={SHADOW} strokeWidth="1" />
            <rect x="-2" y="-30" width="5" height="60" rx="2" fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="0.8" />
          </g>
        </g>

        {/* ── 圧力計。版面の焦点。目盛りは必ず数える ───────────────── */}
        <g transform="translate(462 566)">
          <circle r="92" fill={`url(#${P}-brass2)`} stroke={SHADOW} strokeWidth="2" />
          <circle r="80" fill="#e8dcbe" stroke={SHADOW} strokeWidth="1.2" />
          {Array.from({ length: 33 }, (_, i) => {
            const a = rad(-210 + i * (240 / 32));
            const big = i % 4 === 0;
            return (
              <line key={i}
                    x1={Math.cos(a) * 72} y1={Math.sin(a) * 72}
                    x2={Math.cos(a) * (big ? 58 : 65)} y2={Math.sin(a) * (big ? 58 : 65)}
                    stroke={INK} strokeWidth={big ? 2 : 0.9} />
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const a = rad(-210 + i * 30);
            return (
              <text key={i} x={Math.cos(a) * 50} y={Math.sin(a) * 50 + 4} textAnchor="middle"
                    fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5">
                {i * 20}
              </text>
            );
          })}
          {/* 危険域 */}
          <path d={`M${Math.cos(rad(-30)) * 76} ${Math.sin(rad(-30)) * 76} A76 76 0 0 1 ${Math.cos(rad(30)) * 76} ${Math.sin(rad(30)) * 76}`}
                fill="none" stroke="#9c3520" strokeWidth="6" opacity="0.85" />
          <text y="40" textAnchor="middle" fill={COPPER} fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="10" letterSpacing="2.4">LBS / IN²</text>
          {/* 針。実際の値を指させる */}
          <g transform={`rotate(${-210 + (118 / 160) * 240})`}>
            <path d="M-6 0 L-3 -5 L70 -1.6 L70 1.6 L-3 5 Z" fill="#8c2f1c" stroke={SHADOW} strokeWidth="0.6" />
          </g>
          <circle r="9" fill={`url(#${P}-brass)`} stroke={SHADOW} strokeWidth="1.2" />
          <circle r="80" fill={`url(#${P}-glass)`} />
          {Array.from({ length: 10 }, (_, i) => {
            const a = rad(i * 36);
            return <Rivet key={i} x={Math.cos(a) * 86} y={Math.sin(a) * 86} r={4} />;
          })}
        </g>

        {/* ── 図面の線。ここで「設計された物」になる ──────────────── */}
        <g stroke={INK} opacity="0.6" fill="none">
          {/* 中心線（一点鎖線） */}
          <g strokeWidth="0.9" strokeDasharray="16 4 3 4">
            <line x1={G1.cx - 176} y1={G1.cy} x2={G1.cx + 176} y2={G1.cy} />
            <line x1={G1.cx} y1={G1.cy - 176} x2={G1.cx} y2={G1.cy + 176} />
            <line x1={G2.cx - 104} y1={G2.cy} x2={G2.cx + 104} y2={G2.cy} />
            <line x1={G2.cx} y1={G2.cy - 104} x2={G2.cx} y2={G2.cy + 104} />
          </g>
          {/* 寸法線 */}
          <g strokeWidth="0.9">
            <line x1={G1.cx - 138} y1="612" x2={G1.cx + 138} y2="612" />
            <line x1={G1.cx - 138} y1="600" x2={G1.cx - 138} y2="624" />
            <line x1={G1.cx + 138} y1="600" x2={G1.cx + 138} y2="624" />
            <path d={`M${G1.cx - 138} 612 l10 -4 v8 z`} fill={INK} />
            <path d={`M${G1.cx + 138} 612 l-10 -4 v8 z`} fill={INK} />
          </g>
        </g>
        <text x={G1.cx} y="606" textAnchor="middle" fill={INK} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="12" opacity="0.8">Ø 276</text>

        {/* 引出線と番号 */}
        {[
          { x: 300, y: 250, tx: 352, ty: 196, n: "1" },
          { x: 176, y: 470, tx: 96, ty: 540, n: "2" },
          { x: 462, y: 566, tx: 556, ty: 470, n: "3" },
        ].map((c, i) => (
          <g key={i} stroke={INK} opacity="0.75">
            <line x1={c.x} y1={c.y} x2={c.tx} y2={c.ty} strokeWidth="0.9" />
            <circle cx={c.tx} cy={c.ty} r="11" fill={PAPER} strokeWidth="1.1" />
            <text x={c.tx} y={c.ty + 4} textAnchor="middle" fill={INK} stroke="none"
                  fontFamily="Georgia, 'Times New Roman', serif" fontSize="12">{c.n}</text>
          </g>
        ))}

        {/* ── 枠と表題欄 ─────────────────────────────────────── */}
        <g stroke={INK} fill="none" opacity="0.8">
          <rect x="22" y="22" width="556" height="756" strokeWidth="2.4" />
          <rect x="30" y="30" width="540" height="740" strokeWidth="0.9" />
        </g>
        <g>
          <rect x="318" y="672" width="252" height="98" fill={PAPER} stroke={INK} strokeWidth="1.6" opacity="0.96" />
          <g stroke={INK} strokeWidth="0.9" opacity="0.8">
            <line x1="318" y1="704" x2="570" y2="704" />
            <line x1="318" y1="738" x2="570" y2="738" />
            <line x1="452" y1="704" x2="452" y2="770" />
          </g>
          <text x="328" y="694" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="14" letterSpacing="2.6">
            PRESSURE GOVERNOR
          </text>
          <text x="328" y="726" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="1.6" opacity="0.85">
            SCALE 1 : 2
          </text>
          <text x="462" y="726" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="1.6" opacity="0.85">
            SHEET IV / IX
          </text>
          <text x="328" y="760" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="1.6" opacity="0.85">
            BRASS &amp; LEATHER
          </text>
          <text x="462" y="760" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="1.6" opacity="0.85">
            ANNO 1889
          </text>
        </g>

        {/* 題字。ヴィクトリアの版面らしく、細い罫で挟む */}
        <g>
          <text x="48" y="82" fill={INK} fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="38" letterSpacing="5.5">
            STEAMPUNK
          </text>
          <line x1="48" y1="94" x2="330" y2="94" stroke={INK} strokeWidth="2" opacity="0.85" />
          <line x1="48" y1="99" x2="330" y2="99" stroke={INK} strokeWidth="0.8" opacity="0.6" />
          <text x="48" y="118" fill={COPPER} fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="11" letterSpacing="4.4">
            FIG. IV — GEAR TRAIN &amp; GAUGE
          </text>
        </g>

        {/* 隅のリベット。紙を板に留めている、という嘘 */}
        {[[40, 40], [560, 40], [40, 760], [560, 760]].map(([x, y], i) => <Rivet key={i} x={x} y={y} r={6} />)}

        {/* 古びた紙。粒と四隅の焼け */}
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.14" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
