/**
 * スキューモーフィズム。
 *
 * 2007–2013。画面の中に本物の素材を持ち込んだ時代。革を張り、金属を削り、
 * 布を貼り、木を敷く。ボタンには面取りと落ち影があり、ガラスには照りがある。
 *
 * ■ ここで作っている「らしさ」
 *   1. 素材が「塗り」ではなく「作り」であること。革は粗い紙目を掛けて
 *      銀面のシボにし、金属は放射と水平のヘアラインを1本ずつ引いて挽き目に、
 *      布は繊維フィルタと格子で織りにしている。色を変えただけの面は1つもない。
 *   2. 縫い目があること。革の縁に沿って溝を彫り、その中に少し傾けた糸を
 *      1針ずつ通した。スキューモーフィズムの核心はこの「無意味な手間」で、
 *      点線を1本引いて済ませると、とたんに嘘になる（初稿でそうなった）。
 *   3. 光源が上にひとつだけあること。面取りは上が明るく下が暗い。
 *      ガラスの照りは左上に寄る。ネジの溝は下に影が落ちる。
 *      この一貫性が崩れると、素材ではなく模様に見える。
 *
 * ■ 初稿の失敗
 *   革・金属・布・木を4つの矩形に並べた「素材見本帳」にしたら、
 *   ただの色見本になった。1つの器物（革張りの計器盤）に組み立て直し、
 *   見本は下段の小さな註に落とした。素材は物の形をしていないと効かない。
 */
import { ATLAS, rand, onCircle, shift } from "@/lib/plate";

const P = "sk";
const LEATHER = "#8a7d68";
const LEATHER_D = shift(LEATHER, -0.42);
const LEATHER_L = shift(LEATHER, 0.2);
const SLATE = "#3f4a5a";
const METAL = shift(SLATE, 0.34);
const METAL_L = shift(SLATE, 0.72);
const METAL_D = shift(SLATE, -0.5);
const LINEN = "#d7d2c8";
const CREAM = "#f0ece2";
const INK = "#22201c";
const WOOD = shift(LEATHER, -0.24);

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** 計器の中心。真ん中に置くと器物ではなく記号に見えるので右へ寄せた */
const CX = 332;
const CY = 282;
const R = 166;

/** 縁に沿った縫い目。少し傾けるのが鞍縫いの見え方 */
function stitches(x: number, y: number, w: number, h: number, pitch: number, len: number) {
  const out: [number, number, number, number][] = [];
  const t = len / 2;
  const k = 1.5; // 傾き
  for (let i = x + pitch / 2; i < x + w - pitch / 4; i += pitch) {
    out.push([i - t, y + k, i + t, y - k]);
    out.push([i - t, y + h + k, i + t, y + h - k]);
  }
  for (let j = y + pitch / 2; j < y + h - pitch / 4; j += pitch) {
    out.push([x - k, j - t, x + k, j + t]);
    out.push([x + w - k, j - t, x + w + k, j + t]);
  }
  return out;
}

export default function Plate() {
  const r = rand(613);
  const rm = rand(2071);
  const rp = rand(8819); // 革の毛穴

  /* 金属のヘアライン。放射（ベゼル）と水平（文字盤）を1本ずつ引く */
  const spokes = Array.from({ length: 300 }, (_, i) => {
    const a = (360 / 300) * i;
    const v = r();
    return { a, light: v > 0.5, o: 0.05 + v * 0.16 };
  });
  const grinds = Array.from({ length: 132 }, (_, i) => {
    const v = rm();
    return { y: CY - R + 4 + i * ((R * 2 - 8) / 132), light: v > 0.48, o: 0.04 + v * 0.13 };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="スキューモーフィズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-face`}><circle cx={CX} cy={CY} r={R - 26} /></clipPath>
        <clipPath id={`${P}-bezel`}>
          <path d={`M ${CX - R} ${CY} a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 ${-R * 2} 0 Z
                    M ${CX - R + 26} ${CY} a ${R - 26} ${R - 26} 0 1 1 ${(R - 26) * 2} 0 a ${R - 26} ${R - 26} 0 1 1 ${-(R - 26) * 2} 0 Z`}
                clipRule="evenodd" />
        </clipPath>
        <clipPath id={`${P}-linen`}><rect x="112" y="488" width="444" height="176" rx="9" /></clipPath>
        <clipPath id={`${P}-spine`}><rect x="44" y="44" width="50" height="712" rx="6" /></clipPath>

        {/* ぼかし。彫り込みの影と、落ち影に使う */}
        <filter id={`${P}-b3`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${P}-b8`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        {/* 面取り。上が明るく下が暗い。この向きが全部の部品で揃っている */}
        <linearGradient id={`${P}-bevel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.62" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.62" />
        </linearGradient>
        {/* ベゼルの地。上から光が当たった円筒 */}
        <linearGradient id={`${P}-steel`} x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={METAL_L} />
          <stop offset="0.34" stopColor={METAL} />
          <stop offset="0.52" stopColor={shift(SLATE, 0.5)} />
          <stop offset="0.78" stopColor={METAL_D} />
          <stop offset="1" stopColor={shift(SLATE, 0.16)} />
        </linearGradient>
        {/* 文字盤。中央が明るい */}
        <radialGradient id={`${P}-dial`} cx="0.4" cy="0.3" r="0.85">
          <stop offset="0" stopColor={shift(SLATE, 0.28)} />
          <stop offset="0.62" stopColor={shift(SLATE, 0.02)} />
          <stop offset="1" stopColor={shift(SLATE, -0.42)} />
        </radialGradient>
        {/* ガラスの照り。左上に寄せる */}
        <linearGradient id={`${P}-gloss`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.44" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
        {/* 革。上から光。周辺は落ちる */}
        <radialGradient id={`${P}-hide`} cx="0.42" cy="0.26" r="0.95">
          <stop offset="0" stopColor={LEATHER_L} />
          <stop offset="0.55" stopColor={LEATHER} />
          <stop offset="1" stopColor={LEATHER_D} />
        </radialGradient>
        {/* ネジ頭 */}
        <radialGradient id={`${P}-screw`} cx="0.34" cy="0.28" r="0.86">
          <stop offset="0" stopColor={shift(SLATE, 0.78)} />
          <stop offset="0.6" stopColor={METAL} />
          <stop offset="1" stopColor={METAL_D} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 革の表紙。全面 ─────────────────────────────────── */}
        <rect width="600" height="800" fill={`url(#${P}-hide)`} />
        {/* 銀面のシボ。粗い紙目を2枚がけして粒を立てる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.42" style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.22" style={{ mixBlendMode: "overlay" }} />
        {/* 銀面の毛穴。粒を1つずつ置く。フィルタの粒だけだと「ざらついた茶色」で、
            革には見えなかった（2稿目）。穴の下辺に明るい縁を出すと立体になる */}
        <g>
          {Array.from({ length: 420 }, (_, i) => {
            const x = rp(0, 600);
            const y = rp(0, 800);
            const rr = rp(1.1, 3.4);
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={rr} ry={rr * 0.78} fill={LEATHER_D} opacity={0.1 + rp() * 0.2} />
                <ellipse cx={x} cy={y + rr * 0.7} rx={rr * 0.8} ry={rr * 0.42} fill={LEATHER_L} opacity={0.06 + rp() * 0.12} />
              </g>
            );
          })}
        </g>
        {/* 銀面のシワ。毛穴を撒いただけでは「ざらついた茶色」のままだった（検分）。
            本物の革は毛穴と毛穴のあいだが細かい多角形の網になっていて、
            その稜線が光を拾う。短い曲線を影と光の対で引いて、その網を作る */}
        <g fill="none" strokeLinecap="round">
          {Array.from({ length: 210 }, (_, i) => {
            const x = rp(0, 600);
            const y = rp(0, 800);
            const a = rp(0, Math.PI * 2);
            const len = rp(9, 28);
            const bow = rp(-7, 7);
            const x2 = x + Math.cos(a) * len;
            const y2 = y + Math.sin(a) * len;
            const mx = (x + x2) / 2 - Math.sin(a) * bow;
            const my = (y + y2) / 2 + Math.cos(a) * bow;
            const d = `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
            return (
              <g key={`w${i}`}>
                <path d={d} stroke={LEATHER_D} strokeWidth={rp(0.6, 1.5)} opacity={0.16 + rp() * 0.22} />
                <path d={d} stroke={LEATHER_L} strokeWidth={rp(0.5, 1.1)} opacity={0.1 + rp() * 0.16} transform="translate(0 1.2)" />
              </g>
            );
          })}
        </g>

        {/* 縁の彫り込み。糸はこの溝の底に通る */}
        <rect
          x="22" y="22" width="556" height="756" rx="12"
          fill="none" stroke={INK} strokeWidth="4" opacity="0.34" filter={`url(#${P}-b3)`}
        />
        <g strokeLinecap="round">
          {stitches(22, 22, 556, 756, 17, 9).map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1 + 1.6} x2={x2} y2={y2 + 1.6} stroke={INK} strokeWidth="3.4" opacity="0.4" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CREAM} strokeWidth="2.1" opacity="0.86" />
            </g>
          ))}
        </g>

        {/* ── 左の背。挽き目の金属板とネジ ────────────────────── */}
        <g>
          <rect x="44" y="44" width="50" height="712" rx="6" fill={`url(#${P}-steel)`} />
          <g clipPath={`url(#${P}-spine)`}>
            {Array.from({ length: 96 }, (_, i) => {
              const v = rm();
              return (
                <line
                  key={i} x1="44" y1={46 + i * 7.4} x2="94" y2={46 + i * 7.4}
                  stroke={v > 0.5 ? METAL_L : METAL_D} strokeWidth="1" opacity={0.05 + v * 0.16}
                />
              );
            })}
          </g>
          <rect x="44" y="44" width="50" height="712" rx="6" fill="none" stroke={`url(#${P}-bevel)`} strokeWidth="2.4" />
          {[92, 400, 708].map((y) => (
            <g key={y}>
              <circle cx="69" cy={y + 1.6} r="8" fill={INK} opacity="0.34" filter={`url(#${P}-b3)`} />
              <circle cx="69" cy={y} r="8" fill={`url(#${P}-screw)`} />
              <circle cx="69" cy={y} r="8" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.4" />
              <line x1="63.5" y1={y - 5.5} x2="74.5" y2={y + 5.5} stroke={INK} strokeWidth="2" opacity="0.62" />
              <line x1="63.5" y1={y - 4.2} x2="74.5" y2={y + 6.8} stroke={METAL_L} strokeWidth="0.9" opacity="0.5" />
            </g>
          ))}
        </g>

        {/* ── 計器。革に落とす影 → ベゼル → 文字盤 → ガラス ────── */}
        <ellipse cx={CX} cy={CY + 12} rx={R} ry={R * 0.98} fill={INK} opacity="0.42" filter={`url(#${P}-b8)`} />

        {/* ベゼル。放射のヘアラインで挽き目を作る */}
        <circle cx={CX} cy={CY} r={R} fill={`url(#${P}-steel)`} />
        <g clipPath={`url(#${P}-bezel)`}>
          {spokes.map((s, i) => {
            const [x1, y1] = onCircle(CX, CY, R - 27, s.a);
            const [x2, y2] = onCircle(CX, CY, R, s.a);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={s.light ? METAL_L : METAL_D} strokeWidth="1.6" opacity={s.o} />
            );
          })}
        </g>
        <circle cx={CX} cy={CY} r={R - 1} fill="none" stroke={`url(#${P}-bevel)`} strokeWidth="3" />

        {/* 文字盤。水平のヘアライン＝アルミの挽き目 */}
        <circle cx={CX} cy={CY} r={R - 26} fill={`url(#${P}-dial)`} />
        <g clipPath={`url(#${P}-face)`}>
          {grinds.map((g, i) => (
            <line key={i} x1={CX - R} y1={g.y} x2={CX + R} y2={g.y}
                  stroke={g.light ? METAL_L : METAL_D} strokeWidth="1" opacity={g.o} />
          ))}
          {/* 文字盤の内側に落ちるベゼルの影。彫り込みの深さが出る */}
          <circle cx={CX} cy={CY - 5} r={R - 24} fill="none" stroke={INK} strokeWidth="12" opacity="0.4" filter={`url(#${P}-b8)`} />
        </g>

        {/* 目盛り。大目盛りは長く、数字を彫る */}
        <g>
          {Array.from({ length: 41 }, (_, i) => {
            const a = -120 + i * 6;
            const major = i % 5 === 0;
            const [x1, y1] = onCircle(CX, CY, R - 44, a);
            const [x2, y2] = onCircle(CX, CY, R - (major ? 62 : 54), a);
            return (
              <g key={i}>
                <line x1={x1} y1={y1 + 1} x2={x2} y2={y2 + 1} stroke={INK} strokeWidth={major ? 3 : 1.4} opacity="0.5" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CREAM} strokeWidth={major ? 2.2 : 1} opacity={major ? 0.9 : 0.6} />
              </g>
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const a = -120 + i * 30;
            const [x, y] = onCircle(CX, CY, R - 82, a);
            return (
              <g key={i}>
                <text x={x} y={y + 6.5} textAnchor="middle" fill={INK} opacity="0.55" fontFamily={SERIF} fontSize="17">{i}</text>
                <text x={x} y={y + 5} textAnchor="middle" fill={CREAM} opacity="0.82" fontFamily={SERIF} fontSize="17">{i}</text>
              </g>
            );
          })}
        </g>

        {/* 真鍮の銘板。文字は彫り込み（濃い字＋1px下に明るい縁） */}
        <g>
          <rect x={CX - 66} y={CY + 44} width="132" height="30" rx="4" fill={shift(LEATHER, -0.12)} />
          <rect x={CX - 66} y={CY + 44} width="132" height="30" rx="4" fill="none" stroke={`url(#${P}-bevel)`} strokeWidth="2" />
          <text x={CX} y={CY + 65} textAnchor="middle" fill={CREAM} opacity="0.4" fontFamily={SERIF} fontSize="12.5" letterSpacing="2.6">
            SKEUOS
          </text>
          <text x={CX} y={CY + 64} textAnchor="middle" fill={INK} opacity="0.75" fontFamily={SERIF} fontSize="12.5" letterSpacing="2.6">
            SKEUOS
          </text>
        </g>

        {/* 針。上から光が当たった金属の細い板。軸の下に影 */}
        <g transform={`rotate(-52 ${CX} ${CY})`}>
          <path d={`M ${CX - 5.4} ${CY + 6} L ${CX} ${CY - R + 56} L ${CX + 5.4} ${CY + 6} Z`} fill={INK} opacity="0.4" filter={`url(#${P}-b3)`} />
          <path d={`M ${CX - 4.6} ${CY + 4} L ${CX} ${CY - R + 54} L ${CX + 4.6} ${CY + 4} Z`} fill={CREAM} />
          <path d={`M ${CX} ${CY + 4} L ${CX} ${CY - R + 54} L ${CX + 4.6} ${CY + 4} Z`} fill={INK} opacity="0.3" />
          <path d={`M ${CX - 3} ${CY + 4} L ${CX - 3} ${CY + 26} L ${CX + 3} ${CY + 26} L ${CX + 3} ${CY + 4} Z`} fill={shift(LEATHER, -0.3)} />
        </g>
        <circle cx={CX} cy={CY + 2} r="13" fill={INK} opacity="0.4" filter={`url(#${P}-b3)`} />
        <circle cx={CX} cy={CY} r="13" fill={`url(#${P}-screw)`} />
        <circle cx={CX} cy={CY} r="13" fill="none" stroke={`url(#${P}-bevel)`} strokeWidth="2" />
        <circle cx={CX} cy={CY} r="4.5" fill={METAL_D} opacity="0.8" />

        {/* ベゼルのネジ。4本。光源は上なので溝の影は必ず下に出る */}
        {[38, 142, 218, 322].map((a) => {
          const [x, y] = onCircle(CX, CY, R - 13, a);
          return (
            <g key={a}>
              <circle cx={x} cy={y + 1.4} r="7.5" fill={INK} opacity="0.36" filter={`url(#${P}-b3)`} />
              <circle cx={x} cy={y} r="7.5" fill={`url(#${P}-screw)`} />
              <circle cx={x} cy={y} r="7.5" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.42" />
              <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke={INK} strokeWidth="2" opacity="0.62" transform={`rotate(${a * 2.3} ${x} ${y})`} />
              <line x1={x - 5} y1={y + 1.2} x2={x + 5} y2={y + 1.2} stroke={METAL_L} strokeWidth="0.8" opacity="0.45" transform={`rotate(${a * 2.3} ${x} ${y})`} />
            </g>
          );
        })}

        {/* ガラス。左上に寄せた照り。これが無いと金属の円盤にしか見えない */}
        <g clipPath={`url(#${P}-face)`}>
          <path
            d={`M ${CX - (R - 26)} ${CY - 6} A ${R - 26} ${R - 26} 0 0 1 ${CX + (R - 26)} ${CY - 6}
                Q ${CX} ${CY + (R - 26) * 0.34} ${CX - (R - 26)} ${CY - 6} Z`}
            fill={`url(#${P}-gloss)`}
          />
          {/* 内縁の上側だけを光らせる。ガラスの厚みの縁 */}
          <circle cx={CX} cy={CY + 3} r={R - 28} fill="none" stroke="#ffffff" strokeWidth="2.4" opacity="0.34" />
        </g>

        {/* ── 布のパネル。題字はここに空押しする ────────────────── */}
        <rect x="112" y="492" width="444" height="176" rx="9" fill={INK} opacity="0.34" filter={`url(#${P}-b8)`} />
        <rect x="112" y="488" width="444" height="176" rx="9" fill={LINEN} />
        <g clipPath={`url(#${P}-linen)`}>
          {/* 織り。縦横の細い筋を掛けて目を出す */}
          <rect x="112" y="488" width="444" height="176" filter={`url(#${ATLAS.fibre})`} opacity="0.34" style={{ mixBlendMode: "multiply" }} />
          <g stroke={shift(LINEN, -0.22)} strokeWidth="0.6" opacity="0.4">
            {Array.from({ length: 112 }, (_, i) => (
              <line key={`wv${i}`} x1={112 + i * 4} y1="488" x2={112 + i * 4} y2="664" />
            ))}
            {Array.from({ length: 45 }, (_, i) => (
              <line key={`wh${i}`} x1="112" y1={488 + i * 4} x2="556" y2={488 + i * 4} />
            ))}
          </g>
          {/* 縁の内側に落ちる影。布が革に嵌め込まれている見え方 */}
          <rect x="112" y="488" width="444" height="176" rx="9" fill="none" stroke={INK} strokeWidth="10" opacity="0.34" filter={`url(#${P}-b3)`} />
        </g>
        {/* 布の縁にも1本、糸を通す */}
        <g strokeLinecap="round">
          {stitches(126, 502, 416, 148, 15, 7).map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1 + 1.3} x2={x2} y2={y2 + 1.3} stroke={INK} strokeWidth="2.6" opacity="0.3" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={shift(LEATHER, -0.2)} strokeWidth="1.6" opacity="0.8" />
            </g>
          ))}
        </g>
        {/* 空押しの字。下に1px 明るい縁を出すと、へこんで見える */}
        <text x="334" y="576" textAnchor="middle" fill={CREAM} opacity="0.85" fontFamily={SERIF} fontSize="34" letterSpacing="2.4">
          Skeuomorphism
        </text>
        <text x="334" y="574.6" textAnchor="middle" fill={INK} opacity="0.66" fontFamily={SERIF} fontSize="34" letterSpacing="2.4">
          Skeuomorphism
        </text>
        <text x="334" y="600" textAnchor="middle" fill={CREAM} opacity="0.7" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="3.4">
          REAL MATERIALS, RENDERED — 2007–2013
        </text>
        <text x="334" y="599" textAnchor="middle" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="3.4">
          REAL MATERIALS, RENDERED — 2007–2013
        </text>
        {/* 布に彫った細い罫。二重線は当時の常套 */}
        <g stroke={INK} opacity="0.22">
          <line x1="176" y1="622" x2="492" y2="622" strokeWidth="1" />
          <line x1="176" y1="625" x2="492" y2="625" strokeWidth="0.6" />
        </g>

        {/* ── 素材の註。4つの小片。木目はここにだけ出す ────────── */}
        {([
          ["LEATHER", 0],
          ["BRUSHED STEEL", 1],
          ["LINEN", 2],
          ["WALNUT", 3],
        ] as const).map(([name, i]) => {
          const x = 112 + i * 115;
          const w = 99;
          return (
            <g key={name}>
              <rect x={x} y="694" width={w} height="42" rx="3" fill={INK} opacity="0.3" filter={`url(#${P}-b3)`} />
              <clipPath id={`${P}-sw${i}`}>
                <rect x={x} y="692" width={w} height="42" rx="3" />
              </clipPath>
              <g clipPath={`url(#${P}-sw${i})`}>
                {i === 0 && (
                  <>
                    <rect x={x} y="692" width={w} height="42" fill={LEATHER} />
                    <rect x={x} y="692" width={w} height="42" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.5" style={{ mixBlendMode: "multiply" }} />
                    {Array.from({ length: 90 }, (_, k) => {
                      const sx = x + rp(0, w);
                      const sy = 692 + rp(0, 42);
                      const sr = rp(1, 2.6);
                      return (
                        <g key={k}>
                          <ellipse cx={sx} cy={sy} rx={sr} ry={sr * 0.76} fill={LEATHER_D} opacity={0.16 + rp() * 0.24} />
                          <ellipse cx={sx} cy={sy + sr * 0.7} rx={sr * 0.8} ry={sr * 0.4} fill={LEATHER_L} opacity={0.1 + rp() * 0.14} />
                        </g>
                      );
                    })}
                  </>
                )}
                {i === 1 && (
                  <>
                    <rect x={x} y="692" width={w} height="42" fill={`url(#${P}-steel)`} />
                    {Array.from({ length: 22 }, (_, k) => {
                      const v = rm();
                      return (
                        <line key={k} x1={x} y1={693 + k * 2} x2={x + w} y2={693 + k * 2}
                              stroke={v > 0.5 ? METAL_L : METAL_D} strokeWidth="1" opacity={0.06 + v * 0.2} />
                      );
                    })}
                  </>
                )}
                {i === 2 && (
                  <>
                    <rect x={x} y="692" width={w} height="42" fill={LINEN} />
                    <rect x={x} y="692" width={w} height="42" filter={`url(#${ATLAS.fibre})`} opacity="0.42" style={{ mixBlendMode: "multiply" }} />
                    <g stroke={shift(LINEN, -0.2)} strokeWidth="0.6" opacity="0.5">
                      {Array.from({ length: 25 }, (_, k) => (
                        <line key={k} x1={x + k * 4} y1="692" x2={x + k * 4} y2="734" />
                      ))}
                    </g>
                  </>
                )}
                {i === 3 && (
                  <>
                    <rect x={x} y="692" width={w} height="42" fill={WOOD} />
                    {/* 木目。正弦を少しずつずらして年輪の流れを作る */}
                    {Array.from({ length: 13 }, (_, k) => {
                      const base = 694 + k * 3.2;
                      const d = Array.from({ length: 12 }, (_, j) => {
                        const px = x + (w / 11) * j;
                        const py = base + Math.sin(j * 0.62 + k * 0.9) * (1.6 + (k % 3) * 0.7);
                        return `${j === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
                      }).join(" ");
                      return (
                        <path key={k} d={d} fill="none"
                              stroke={k % 3 === 0 ? shift(WOOD, -0.4) : shift(WOOD, 0.16)}
                              strokeWidth={k % 3 === 0 ? 1.6 : 0.9} opacity="0.6" />
                      );
                    })}
                    <rect x={x} y="692" width={w} height="42" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
                  </>
                )}
              </g>
              <rect x={x} y="692" width={w} height="42" rx="3" fill="none" stroke={`url(#${P}-bevel)`} strokeWidth="1.6" />
              <text x={x + w / 2} y="754" textAnchor="middle" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.4">
                {name}
              </text>
              <text x={x + w / 2} y="753" textAnchor="middle" fill={CREAM} opacity="0.6" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.4">
                {name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
