/**
 * コテージコア。
 *
 * 静かな系の隣に並ぶが、これだけは**あたたかい**。
 * わびさび・ジャパンディが「引く」様式なのに対し、コテージコアは「集める」様式。
 * 摘んで、焼いて、繕う。だから版面も引き算ではなく、**手仕事を並べた見本帖**にした。
 *
 * ■ この絵の骨
 *   1. 色でまず分ける。セージ（#a8bd8a）と薔薇（#c26b6b）を必ず面で使う。
 *      ここをベージュだけで納めると、隣の8枚と見分けがつかなくなる。
 *   2. 版面をぐるりと**running stitch（並縫い）**で囲う。刺し子の縁は
 *      「手で作った紙」の合図になり、近くで見たときに持つ。
 *   3. 中央は上から見た格子パイ。帯を本当に**互い違いに編む**。
 *      交点で上下を入れ替えないと、ただの井桁になる。
 *   4. 線は定規で引かない。輪郭を rand で少し振り、素朴な線画にする。
 *      ただし文字だけは真っ直ぐに置く（読めなくなるので）。
 *
 * ■ 失敗して直したところ
 *   初稿はパイだけを大きく置いて「食べ物のイラスト」になった。
 *   摘んだ草・瓶・束を周りに並べ、一つずつに手書きの札を付けた瞬間に、
 *   「暮らしの記録」になった。コテージコアは物ではなく営みの様式。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "cc";
const PAPER = "#f3ecdd";
const SAGE = "#a8bd8a";
const SAGE_D = "#82995f";
const HONEY = "#d9a566";
const HONEY_D = "#b8823f";
const ROSE = "#c26b6b";
const ROSE_D = "#9e4f4f";
const OLIVE = "#4a4636";

const CX = 300;
const PIE_Y = 456;

/** 手で引いた線。点をわずかに振り、中点でつなぐ */
function hand(pts: [number, number][], amp: number, seed: number) {
  const r = rand(seed);
  const p = pts.map(([x, y]): [number, number] => [x + (r() - 0.5) * amp, y + (r() - 0.5) * amp]);
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i];
    const b = p[i + 1];
    d += ` Q ${a[0].toFixed(1)} ${a[1].toFixed(1)} ${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  }
  const e = p[p.length - 1];
  return `${d} L ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
}

/** 手で描いた丸。パイも瓶の口も、これで少し歪ませる */
function handRing(cx: number, cy: number, rx: number, ry: number, amp: number, seed: number, n = 30) {
  const r = rand(seed);
  const pts = Array.from({ length: n }, (_, i): [number, number] => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * amp;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  const mid = (a: [number, number], b: [number, number]) =>
    `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  let d = `M ${mid(pts[n - 1], pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mid(p, pts[(i + 1) % n])}`;
  }
  return `${d} Z`;
}

/** 小さな野の花。花びら5枚。中心は蜜色 */
function Bloom({ x, y, s = 1, petal = "#f2e6d4", seed = 1 }: {
  x: number; y: number; s?: number; petal?: string; seed?: number;
}) {
  const r = rand(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * 360 + r(-14, 14);
        return (
          <ellipse key={i} cx="0" cy="-9" rx="4.6" ry="8.4" fill={petal} stroke={OLIVE}
                   strokeWidth="0.9" transform={`rotate(${a})`} />
        );
      })}
      <circle cx="0" cy="0" r="4.2" fill={HONEY} stroke={OLIVE} strokeWidth="0.9" />
    </g>
  );
}

export default function Plate() {
  /* 格子パイ。帯を互い違いに編む。交点の上下を入れ替えないと井桁になる */
  const N = 5;
  const GAP = 42;
  const BW = 24;
  const stripX = (i: number) => CX - ((N - 1) * GAP) / 2 + i * GAP;      // 縦帯の中心
  const stripY = (i: number) => PIE_Y - ((N - 1) * GAP) / 2 + i * GAP;   // 横帯の中心

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="コテージコア様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* ギンガム。縦帯と横帯を同じ濃さで重ね、交点だけ濃くする */}
        <pattern id={`${P}-gingham`} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#f0e9d6" />
          <rect width="13" height="26" fill={SAGE} opacity="0.42" />
          <rect width="26" height="13" fill={SAGE} opacity="0.42" />
        </pattern>
        {/* 瓶の蓋の小格子。薔薇色。布は場所で目の大きさを変える */}
        <pattern id={`${P}-check`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#f0e0da" />
          <rect width="5" height="10" fill={ROSE} opacity="0.5" />
          <rect width="10" height="5" fill={ROSE} opacity="0.5" />
        </pattern>
        <clipPath id={`${P}-pie`}><circle cx={CX} cy={PIE_Y} r="98" /></clipPath>
        <clipPath id={`${P}-jar`}><path d="M120 664 h60 v76 q0 8 -8 8 h-44 q-8 0 -8 -8 Z" /></clipPath>
        {/* 題字の弧 */}
        <path id={`${P}-arc`} d="M 92 158 Q 300 100 508 158" fill="none" />
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 並縫いの縁。手で作った紙の合図 ─────────────────── */}
        <g stroke={ROSE} strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
          <path d={hand([[26, 24], [200, 22], [400, 26], [574, 24]], 2.4, 11)}
                strokeDasharray="11 7" fill="none" />
          <path d={hand([[26, 776], [200, 778], [400, 774], [574, 776]], 2.4, 12)}
                strokeDasharray="11 7" fill="none" />
          <path d={hand([[26, 24], [24, 260], [28, 540], [26, 776]], 2.4, 13)}
                strokeDasharray="11 7" fill="none" />
          <path d={hand([[574, 24], [576, 260], [572, 540], [574, 776]], 2.4, 14)}
                strokeDasharray="11 7" fill="none" />
        </g>
        {/* 角の十字。刺し子の留め */}
        <g stroke={SAGE_D} strokeWidth="2" strokeLinecap="round">
          {[[26, 24], [574, 24], [26, 776], [574, 776]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
              <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
            </g>
          ))}
        </g>

        {/* ── 題字。弧に載せる ───────────────────────────────── */}
        <text fill={OLIVE} fontFamily="Georgia, 'Times New Roman', serif" fontSize="35"
              letterSpacing="4.5">
          <textPath href={`#${P}-arc`} startOffset="50%" textAnchor="middle">COTTAGECORE</textPath>
        </text>
        <text x={CX} y="196" textAnchor="middle" fill={SAGE_D}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="11.5"
              fontStyle="italic" letterSpacing="4.6">
          gathered · baked · mended
        </text>
        <path d={hand([[196, 212], [300, 214], [404, 212]], 1.6, 21)} stroke={ROSE}
              strokeWidth="1.6" fill="none" opacity="0.75" />

        {/* ── 布。少し傾けて置く。真っ直ぐだと硬い ───────────── */}
        <g transform="rotate(-2.4 300 470)">
          <rect x="72" y="298" width="456" height="344" fill={`url(#${P}-gingham)`} />
          {/* 縁のほつれ。房を短く出す */}
          <g stroke={SAGE_D} strokeWidth="1.3" opacity="0.75">
            {Array.from({ length: 30 }, (_, i) => (
              <line key={`b${i}`} x1={78 + i * 15} y1="642" x2={78 + i * 15} y2="651" />
            ))}
            {Array.from({ length: 30 }, (_, i) => (
              <line key={`t${i}`} x1={78 + i * 15} y1="298" x2={78 + i * 15} y2="289" />
            ))}
          </g>
          <path d={hand([[72, 298], [300, 296], [528, 298]], 2, 31)} stroke={SAGE_D}
                strokeWidth="1.6" fill="none" opacity="0.7" />
          <path d={hand([[72, 642], [300, 644], [528, 642]], 2, 32)} stroke={SAGE_D}
                strokeWidth="1.6" fill="none" opacity="0.7" />
        </g>

        {/* ── 格子パイ。上から見る ───────────────────────────── */}
        {/* 皿 */}
        <path d={handRing(CX, PIE_Y, 128, 128, 0.022, 41)} fill="#e8dfc9" stroke={OLIVE}
              strokeWidth="1.5" opacity="0.55" />
        {/* 中身。木苺 */}
        <path d={handRing(CX, PIE_Y, 100, 100, 0.03, 42)} fill={ROSE_D} />
        <g clipPath={`url(#${P}-pie)`}>
          {Array.from({ length: 26 }, (_, i) => {
            const r = rand(500 + i);
            return <circle key={i} cx={r(CX - 92, CX + 92)} cy={r(PIE_Y - 92, PIE_Y + 92)}
                           r={r(3.4, 7)} fill={ROSE} opacity={r(0.5, 0.95)} />;
          })}
          {/* 帯を編む。まず横、次に縦、最後に (i+j) が偶数の交点だけ横を上に戻す */}
          {/* 横帯 */}
          {Array.from({ length: N }, (_, i) => (
            <rect key={`h${i}`} x={CX - 104} y={stripY(i) - BW / 2} width="208" height={BW}
                  fill={HONEY} stroke={HONEY_D} strokeWidth="1.2" />
          ))}
          {/* 縦帯。ここまでだと縦が全部上に来て、ただの井桁になる */}
          {Array.from({ length: N }, (_, j) => (
            <rect key={`v${j}`} x={stripX(j) - BW / 2} y={PIE_Y - 104} width={BW} height="208"
                  fill={HONEY} stroke={HONEY_D} strokeWidth="1.2" />
          ))}
          {/* 市松に選んだ交点だけ、横帯をもう一度上に置く。これで本当に編める */}
          {Array.from({ length: N }, (_, i) =>
            Array.from({ length: N }, (_, j) =>
              (i + j) % 2 === 0 ? (
                <g key={`x${i}-${j}`}>
                  <rect x={stripX(j) - BW / 2 - 1.5} y={stripY(i) - BW / 2}
                        width={BW + 3} height={BW} fill={HONEY} />
                  <line x1={stripX(j) - BW / 2 - 1.5} y1={stripY(i) - BW / 2}
                        x2={stripX(j) + BW / 2 + 1.5} y2={stripY(i) - BW / 2}
                        stroke={HONEY_D} strokeWidth="1.2" />
                  <line x1={stripX(j) - BW / 2 - 1.5} y1={stripY(i) + BW / 2}
                        x2={stripX(j) + BW / 2 + 1.5} y2={stripY(i) + BW / 2}
                        stroke={HONEY_D} strokeWidth="1.2" />
                </g>
              ) : null,
            ),
          )}
        </g>
        {/* 縁の波。丸を並べただけだと数珠に見えたので、内側を輪で覆って
            ひとつながりのフルート（指で摘まんだ縁）にする */}
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2;
          return (
            <circle key={i} cx={CX + Math.cos(a) * 104} cy={PIE_Y + Math.sin(a) * 104} r="14"
                    fill={HONEY} stroke={HONEY_D} strokeWidth="1.2" />
          );
        })}
        <path
          d={`M ${CX - 106} ${PIE_Y} a 106 106 0 1 0 212 0 a 106 106 0 1 0 -212 0 ` +
             `M ${CX - 92} ${PIE_Y} a 92 92 0 1 0 184 0 a 92 92 0 1 0 -184 0`}
          fillRule="evenodd" fill={HONEY} />
        <path d={handRing(CX, PIE_Y, 92, 92, 0.016, 43)} fill="none" stroke={HONEY_D}
              strokeWidth="1.4" opacity="0.55" />
        {/* 湯気。3本 */}
        <g stroke={OLIVE} strokeWidth="1.6" fill="none" opacity="0.28" strokeLinecap="round">
          <path d="M 262 318 q -12 -20 2 -34 q 14 -14 2 -32" />
          <path d="M 300 306 q -12 -22 2 -36 q 14 -14 2 -34" />
          <path d="M 338 318 q -12 -20 2 -34 q 14 -14 2 -32" />
        </g>

        {/* ── 摘んだ草。左右に1本ずつ。押し花のように紙留めで貼る ── */}
        {/* 左：カミツレ */}
        <g>
          <path d={hand([[112, 574], [118, 500], [110, 428], [116, 366]], 3, 51)} stroke={SAGE_D}
                strokeWidth="2.2" fill="none" />
          <path d={hand([[114, 520], [88, 496], [78, 468]], 2.4, 52)} stroke={SAGE_D} strokeWidth="1.6" fill="none" />
          <path d={hand([[115, 466], [142, 446], [150, 420]], 2.4, 53)} stroke={SAGE_D} strokeWidth="1.6" fill="none" />
          <Bloom x={115} y={358} s={1.15} seed={61} />
          <Bloom x={78} y={462} s={0.85} seed={62} />
          <Bloom x={151} y={414} s={0.8} seed={63} />
          {/* 紙留め */}
          <rect x="82" y="532" width="66" height="20" fill={ROSE} opacity="0.35"
                transform="rotate(-8 115 542)" />
          <rect x="82" y="532" width="66" height="20" fill="none" stroke={ROSE} strokeWidth="1"
                opacity="0.65" transform="rotate(-8 115 542)" />
        </g>
        {/* 右：小麦 */}
        <g>
          <path d={hand([[486, 578], [480, 500], [488, 424], [482, 372]], 3, 54)} stroke={HONEY_D}
                strokeWidth="2.2" fill="none" />
          {Array.from({ length: 9 }, (_, i) => {
            const y = 380 + i * 15;
            const w = 13 - i * 0.5;
            return (
              <g key={i}>
                <ellipse cx={484 - w} cy={y} rx="7" ry="4.4" fill={HONEY} stroke={HONEY_D}
                         strokeWidth="0.9" transform={`rotate(-32 ${484 - w} ${y})`} />
                <ellipse cx={484 + w} cy={y} rx="7" ry="4.4" fill={HONEY} stroke={HONEY_D}
                         strokeWidth="0.9" transform={`rotate(32 ${484 + w} ${y})`} />
              </g>
            );
          })}
          <path d={hand([[484, 372], [480, 348]], 1.6, 55)} stroke={HONEY_D} strokeWidth="1.6" fill="none" />
          <rect x="453" y="536" width="66" height="20" fill={SAGE} opacity="0.4"
                transform="rotate(7 486 546)" />
          <rect x="453" y="536" width="66" height="20" fill="none" stroke={SAGE_D} strokeWidth="1"
                opacity="0.7" transform="rotate(7 486 546)" />
        </g>

        {/* ── 棚。摘んだもの・煮たもの・干したもの ───────────── */}
        <path d={hand([[64, 752], [300, 754], [536, 752]], 2, 71)} stroke={OLIVE}
              strokeWidth="1.8" fill="none" opacity="0.55" />

        {/* 瓶 */}
        <g>
          <path d="M120 664 h60 v76 q0 8 -8 8 h-44 q-8 0 -8 -8 Z" fill="#e9ddc4" />
          <g clipPath={`url(#${P}-jar)`}>
            <rect x="118" y="686" width="64" height="64" fill={ROSE_D} />
            <rect x="118" y="686" width="64" height="5" fill={ROSE} opacity="0.6" />
            {Array.from({ length: 9 }, (_, i) => {
              const r = rand(800 + i);
              return <circle key={i} cx={r(124, 176)} cy={r(694, 742)} r={r(2.6, 5)} fill={ROSE} opacity="0.7" />;
            })}
          </g>
          <path d="M120 664 h60 v76 q0 8 -8 8 h-44 q-8 0 -8 -8 Z" fill="none" stroke={OLIVE} strokeWidth="1.7" />
          {/* 布の蓋と紐 */}
          <path d="M112 664 q38 -14 76 0 l-4 12 q-34 -10 -68 0 Z" fill={`url(#${P}-check)`}
                stroke={OLIVE} strokeWidth="1.5" />
          <path d={hand([[114, 674], [150, 680], [186, 674]], 1.4, 72)} stroke={OLIVE}
                strokeWidth="1.8" fill="none" />
        </g>

        {/* 木の匙 */}
        <g transform="rotate(-9 300 706)">
          <ellipse cx="300" cy="676" rx="19" ry="25" fill={HONEY} stroke={OLIVE} strokeWidth="1.7" />
          <ellipse cx="300" cy="678" rx="11" ry="15" fill={HONEY_D} opacity="0.45" />
          <path d="M294 700 h12 v48 h-12 Z" fill={HONEY} stroke={OLIVE} strokeWidth="1.7" />
        </g>

        {/* 干した束。紐で結ぶ */}
        <g>
          {[-16, -6, 4, 14].map((dx, i) => (
            <g key={i}>
              <path d={hand([[452 + dx, 748], [450 + dx * 1.5, 706], [448 + dx * 2.1, 668]], 2.6, 90 + i)}
                    stroke={SAGE_D} strokeWidth="1.7" fill="none" />
              {Array.from({ length: 9 }, (_, k) => (
                <ellipse key={k} cx={449 + dx * (1.15 + k * 0.11)} cy={702 - k * 5.2}
                         rx="3.4" ry="2.2" fill={ROSE} opacity={0.55 + k * 0.045}
                         transform={`rotate(${dx * 1.6} ${449 + dx * (1.15 + k * 0.11)} ${702 - k * 5.2})`} />
              ))}
            </g>
          ))}
          <path d="M428 726 q24 8 48 0" stroke={ROSE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M452 730 l-7 14 M452 730 l7 12" stroke={ROSE} strokeWidth="1.7" fill="none" strokeLinecap="round" />
        </g>

        {/* 手書きの札 */}
        <g fill={OLIVE} fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="12">
          <text x="150" y="770" textAnchor="middle" opacity="0.8">damson</text>
          <text x="300" y="770" textAnchor="middle" opacity="0.8">elderflower</text>
          <text x="452" y="770" textAnchor="middle" opacity="0.8">lavender</text>
        </g>
        <text x="115" y="600" textAnchor="middle" fill={SAGE_D}
              fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="11">
          Matricaria
        </text>
        <text x="486" y="604" textAnchor="middle" fill={HONEY_D}
              fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="11">
          Triticum
        </text>

        {/* 紙の粒。再生紙にする。上質紙だと台所の紙に見えない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.2"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
