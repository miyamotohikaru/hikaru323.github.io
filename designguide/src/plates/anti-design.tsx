/**
 * アンチデザイン（イタリアのラディカル・デザイン）。
 *
 * 1960年代後半、良いデザイン（buon design）への皮肉として始まった。
 * 椅子は椅子に見えず、机は風景になり、家具は冗談の器になる。
 * だから図版は「家具のカタログの体裁で、家具に見えない物を並べる」形にした。
 * 体裁が真面目であるほど皮肉が効く。
 *
 * ■ 骨格はスーパースタジオの白い格子
 *   《連続的モニュメント》の、世界を覆う無限のマス目。
 *   この格子は「中立で合理的な近代」の戯画で、
 *   その上に不合理な物を置くのがこの様式の構図そのもの。
 *   だから遠近のついた格子を版面の骨にした。
 *
 * ■ 皮肉は文字で足す
 *   物にカタログの品名を淡々と付ける。サボテンに「洋服掛け」、
 *   唇に「二人掛け」。絵と札のずれが笑いになる。
 *   ここを派手な文字にすると、ただのポップアートになる。
 *
 * ■ 隣の memphis / kitsch / maximalism と分けるために
 *   ・柄を敷かない（メンフィスの領分）
 *   ・甘い色にしない（キッチュの領分）
 *   ・余白を殺さない（マキシマリズムの領分）
 *   白い格子の余白の上に、大きな物を3つだけ。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "adg";

const PAPER = "#e8e2d6";
const RED = "#d94f2b";
const GREEN = "#1f6f5c";
const YELLOW = "#f2c14e";
const INK = "#1a1a1a";

const VPX = 300;
const VPY = 352; // 地平＝消点

/** 渦巻き（イオニア式の渦）。等角螺旋を折れ線で */
const spiral = (cx: number, cy: number, r0: number, turns: number, dir: number) =>
  "M" +
  Array.from({ length: 72 }, (_, i) => {
    const t = i / 71;
    const a = dir * t * turns * Math.PI * 2 - Math.PI / 2;
    const rr = r0 * (1 - t * 0.87);
    return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" L");

/** 淡々とした品名札。絵とのずれが皮肉になる */
function Label({ x, y, tx, ty, text, anchor = "start" }: { x: number; y: number; tx: number; ty: number; text: string; anchor?: "start" | "end" }) {
  return (
    <g>
      <path d={`M${x} ${y} L${tx} ${ty}`} stroke={INK} strokeWidth="1" fill="none" />
      <circle cx={x} cy={y} r="2.6" fill={INK} />
      <line x1={tx} y1={ty} x2={anchor === "end" ? tx - 46 : tx + 46} y2={ty} stroke={INK} strokeWidth="1" />
      <text
        x={anchor === "end" ? tx - 46 : tx + 46}
        y={ty - 5}
        textAnchor={anchor}
        fill={INK}
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="2.2"
      >
        {text}
      </text>
    </g>
  );
}

export default function Plate() {
  const r = rand(19680517);

  /* 格子。消点へ収束する縦線と、手前ほど開く横線 */
  const rows = Array.from({ length: 13 }, (_, i) => {
    const t = (i + 1) / 13;
    return VPY + (800 - VPY) * Math.pow(t, 2.2);
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アンチデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-floor`}><rect y={VPY} width="600" height={800 - VPY} /></clipPath>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efeae0" />
          <stop offset="1" stopColor="#dcd5c6" />
        </linearGradient>
        <linearGradient id={`${P}-hz`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f3ec" stopOpacity="1" />
          <stop offset="1" stopColor="#f6f3ec" stopOpacity="0" />
        </linearGradient>
        {/* 白い床。奥ほど白く飛ばす */}
        <linearGradient id={`${P}-floorfade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f3ec" />
          <stop offset="1" stopColor="#e2dbcc" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* ── 無限の格子。この様式の骨 ─────────────────────── */}
        <rect y={VPY} width="600" height={800 - VPY} fill={`url(#${P}-floorfade)`} />
        <g clipPath={`url(#${P}-floor)`} stroke={INK} fill="none">
          {Array.from({ length: 19 }, (_, i) => {
            const k = i - 9;
            return <line key={`v${i}`} x1={VPX} y1={VPY} x2={VPX + k * 152} y2="800" strokeWidth="1.2" opacity="0.5" />;
          })}
          {rows.map((y, i) => (
            <line key={`h${i}`} x1="0" y1={y} x2="600" y2={y} strokeWidth="1.1" opacity="0.5" />
          ))}
          {/* 地平の直前を白く飛ばす。線が消点で団子になると光条に見える */}
          <rect y={VPY} width="600" height="64" fill={`url(#${P}-hz)`} stroke="none" />
          <line x1="0" y1={VPY} x2="600" y2={VPY} strokeWidth="1.6" opacity="0.7" />
        </g>

        {/* ── 空に浮かぶ格子の塊。《連続的モニュメント》 ─────── */}
        <g>
          <polygon points="396,96 596,64 596,180 396,214" fill="#f6f3ec" />
          <polygon points="352,120 396,96 396,214 352,236" fill="#d5cec0" />
          <g stroke={INK} strokeWidth="0.9" opacity="0.45" fill="none">
            {Array.from({ length: 9 }, (_, i) => {
              const t = i / 8;
              return <line key={`a${i}`} x1={396 + t * 200} y1={96 - t * 32} x2={396 + t * 200} y2={214 - t * 34} />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const t = i / 4;
              return <line key={`b${i}`} x1="396" y1={96 + t * 118} x2="596" y2={64 + t * 116} />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const t = i / 4;
              return <line key={`c${i}`} x1="352" y1={120 + t * 116} x2="396" y2={96 + t * 118} />;
            })}
            <line x1="352" y1="120" x2="396" y2="96" />
            <line x1="352" y1="236" x2="396" y2="214" />
          </g>
          <polygon points="396,96 596,64 596,180 396,214" fill="none" stroke={INK} strokeWidth="1.4" />
          <polygon points="352,120 396,96 396,214 352,236" fill="none" stroke={INK} strokeWidth="1.4" />
        </g>

        {/* ── 題字。カタログの体裁で、真面目に組む ──────────── */}
        <text x="40" y="112" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="62" fontWeight="800" letterSpacing="-3">
          ANTI-
        </text>
        <text x="40" y="172" fill={RED} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="62" fontWeight="800" letterSpacing="-3">
          DESIGN
        </text>
        <text x="42" y="204" fill={GREEN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" fontStyle="italic" letterSpacing="0.6">
          questa non è una sedia
        </text>
        <line x1="40" y1="222" x2="292" y2="222" stroke={INK} strokeWidth="1.6" />
        <text x="40" y="242" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="600" letterSpacing="3.4" opacity="0.7">
          ITALIA · 1966—1975 · CATALOGO N.4
        </text>

        {/* ── 3つの物。多く置くとマキシマリズムになる ────────── */}

        {/* 1. イオニア式の柱頭。座るための「遺跡」。
               初稿は下に柱身を付けたら洗濯機に見えたので、
               柱頭だけを床に転がした。渦を大きく取るのが要 */}
        <g transform="translate(26 574)">
          <ellipse cx="122" cy="152" rx="136" ry="16" fill={INK} opacity="0.13" />
          {/* 台輪 */}
          <rect x="0" y="0" width="244" height="22" fill="#f7f4ee" />
          <rect x="0" y="0" width="244" height="22" fill="none" stroke={INK} strokeWidth="2.2" />
          {/* 座面のえぐり。ここに人が沈む */}
          <path d="M52 0 C 78 42 166 42 192 0" fill="#ded7c8" />
          <path d="M52 0 C 78 42 166 42 192 0" fill="none" stroke={INK} strokeWidth="1.8" />
          <path d="M64 6 C 88 32 156 32 180 6 C 156 22 88 22 64 6 Z" fill={INK} opacity="0.16" />
          {/* 胴。渦がほぼ全面 */}
          <path d="M8 22 L236 22 L228 128 L16 128 Z" fill="#f2eee6" />
          <path d="M8 22 L236 22 L228 128 L16 128 Z" fill="none" stroke={INK} strokeWidth="2.2" />
          <g stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round">
            <path d={spiral(58, 74, 44, 2.2, 1)} />
            <path d={spiral(186, 74, 44, 2.2, -1)} />
          </g>
          {/* 卵鏃。渦と渦の間の帯 */}
          <path d="M104 42 C 122 66 122 66 140 42" stroke={INK} strokeWidth="2.6" fill="none" />
          <g fill={INK} opacity="0.75">
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={106 + i * 16} cy={96} rx="5" ry="8" />
            ))}
          </g>
          {/* 座布団。柔らかい発泡樹脂であることを1つだけ匂わせる */}
          <path d="M16 128 L228 128 L222 148 L22 148 Z" fill="#eae4d8" />
          <path d="M16 128 L228 128 L222 148 L22 148 Z" fill="none" stroke={INK} strokeWidth="2" />
        </g>

        {/* 2. サボテンの洋服掛け。緑の柱 */}
        <g transform="translate(346 292)">
          <ellipse cx="34" cy="320" rx="72" ry="12" fill={INK} opacity="0.13" />
          <g stroke={GREEN} fill="none" strokeLinecap="round">
            <path d="M34 316 L34 44" strokeWidth="54" />
            <path d="M34 196 C -12 196 -20 162 -20 128" strokeWidth="34" />
            <path d="M34 132 C 82 132 90 100 90 66" strokeWidth="34" />
          </g>
          {/* 稜。縦の窪み */}
          <g stroke="#15503f" strokeWidth="2.4" opacity="0.75" fill="none">
            {[-16, 0, 16].map((dx, i) => (
              <path key={i} d={`M${34 + dx} 300 L${34 + dx} 52`} />
            ))}
            <path d="M-20 122 C -20 158 -14 186 22 186" />
            <path d="M90 60 C 90 96 84 122 46 122" />
          </g>
          {/* 棘。近くで見る細部 */}
          {Array.from({ length: 78 }, (_, i) => {
            const arm = r();
            let x: number;
            let y: number;
            if (arm < 0.68) {
              x = 34 + r(-24, 24);
              y = r(46, 312);
            } else if (arm < 0.85) {
              x = r(-30, 26);
              y = r(126, 206);
            } else {
              x = r(44, 98);
              y = r(64, 138);
            }
            return (
              <g key={i} stroke="#0d3a2d" strokeWidth="1.4" strokeLinecap="round">
                <line x1={x} y1={y} x2={x - 3} y2={y + 3.4} />
                <line x1={x} y1={y} x2={x + 3} y2={y + 3.4} />
              </g>
            );
          })}
          {/* 掛かっている帽子。洋服掛けである証拠を1つだけ */}
          <ellipse cx="90" cy="60" rx="30" ry="8" fill={YELLOW} />
          <path d="M74 60 C 74 36 106 36 106 60 Z" fill={YELLOW} />
          <path d="M74 52 L106 52" stroke={RED} strokeWidth="5" />
        </g>

        {/* 3. 唇の長椅子 */}
        <g transform="translate(316 700)">
          <ellipse cx="128" cy="84" rx="132" ry="14" fill={INK} opacity="0.14" />
          <path d="M2 46 C 26 2 66 -14 98 6 C 106 12 118 12 126 6 C 158 -14 198 2 222 46 C 150 28 70 28 2 46 Z" fill={RED} />
          <path d="M2 46 C 70 64 154 64 222 46 C 200 92 24 92 2 46 Z" fill="#c23f1e" />
          {/* 口の暗がり */}
          <path d="M2 46 C 70 30 154 30 222 46 C 154 60 70 60 2 46 Z" fill={INK} opacity="0.55" />
          {/* 照り。丸みはここで出る */}
          <path d="M40 22 C 58 6 76 2 90 8 C 74 12 58 20 46 30 Z" fill="#f2a08a" opacity="0.75" />
          <path d="M60 70 C 100 82 150 80 184 68 C 150 88 96 90 60 70 Z" fill="#f2a08a" opacity="0.5" />
        </g>

        {/* 4. 転がる球。1点だけ黄を置いて版面を締める */}
        <g>
          <ellipse cx="180" cy="790" rx="38" ry="8" fill={INK} opacity="0.13" />
          <circle cx="176" cy="760" r="32" fill={YELLOW} />
          <path d="M152 742 C 161 731 183 729 194 736 C 176 736 161 745 152 755 Z" fill="#f8dc9a" />
          <circle cx="176" cy="760" r="32" fill="none" stroke={INK} strokeWidth="1.6" />
        </g>

        {/* ── 品名札。淡々と間違える ────────────────────────── */}
        <Label x={148} y={640} tx={300} ty={516} text="POLTRONA" anchor="end" />
        <Label x={382} y={340} tx={318} ty={286} text="APPENDIABITI" anchor="end" />
        <Label x={430} y={724} tx={560} ty={668} text="DIVANO 2 POSTI" anchor="end" />

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
