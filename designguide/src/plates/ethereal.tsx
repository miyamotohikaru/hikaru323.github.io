/**
 * エセリアル。
 *
 * この世ならぬ透明感。輪郭が溶け、光が滲む。
 * ただし**霧を撒いただけの絵は、何も描いていないのと同じ**になる。
 * だからこの一枚は「ぼかし」と「一点の硬さ」の対比で作った。
 *
 * ■ この絵の骨
 *   1. 中央に**光の門**を1つ立てる。溶ける絵ほど、骨格は単純でないと持たない。
 *      門の上に同心の暈（かさ）を重ね、下は水面に映して版面を上下に割る。
 *   2. ぼかしは3段に分ける（26 / 12 / 4）。同じ強さで全部ぼかすと
 *      「ピンぼけの写真」になってしまい、意図した滲みに見えない。
 *   3. **ぼけていない線を必ず1本入れる。** 髪より細い同心円と、
 *      粒立った小さな点。硬いものが隣にあって初めて、他が溶けて見える。
 *   4. 色は淡いまま重ねる（multiply）。濃い色を1滴も入れない。
 *      締め色の #8a7f96 も、線と文字にだけ薄く使う。
 *
 * ■ ぼかしは共有 ATLAS に無いので、ここで `${P}-` 付きで自前に持つ。
 *   feTurbulence は自前で書かない約束だが、feGaussianBlur は各図版の裁量。
 *
 * ■ 失敗して直したところ
 *   初稿は全面を淡い雲で埋めて、白い靄の四角にしかならなかった。
 *   門・水平線・同心円という「読める形」を先に置き、
 *   そのあとで溶かす順に変えたら、初めて絵になった。
 *
 * ■ 検分で直したこと
 *   それでもまだ「白い滲みが1つあるだけ」だった。185pxに落とすと
 *   地の紙（#eeebe4）と見分けがつかない。原因は2つある。
 *     ・明度の幅が5%しかなかった。四隅を沈めて幅を作った。
 *     ・門のほかに見るものが無かった。薄衣（ヴェール）を2枚渡して
 *       版面に横の骨を通し、門の縁に光の分散（桃／水色のずれ）を入れ、
 *       ぼけていない蛾を1匹だけ置いた。
 *   蛾は「硬いもの」の役。これが1つ入るだけで、ほかが溶けて見える。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "eth";
const AIR = "#f7f4f8";
const LILAC = "#e3d5ee";
const AQUA = "#cfe3ea";
const BLUSH = "#f6e0e6";
const SMOKE = "#8a7f96";
/* 分散用。桃と水色をそれぞれ一段だけ濃くしたもの。
   光が縁で割れるのを描くのに、淡いままだと見えない */
const BLUSH_D = "#e7b5c5";
const AQUA_D = "#a6ccdb";

const CX = 300;
const HORIZON = 596;
const ARCH_TOP = 268;   // 門の頂点
const ARCH_W = 112;     // 門の半幅

/** 門の形。矩形の上に半円を載せる */
const arch = (w: number, top: number, bottom: number) =>
  `M ${CX - w} ${bottom} L ${CX - w} ${top} A ${w} ${w} 0 0 1 ${CX + w} ${top} L ${CX + w} ${bottom} Z`;

export default function Plate() {
  /* 粒。大きさとぼけ具合を散らす。全部同じだと降っている雪に見える */
  const motes = Array.from({ length: 96 }, (_, i) => {
    const r = rand(2000 + i);
    return {
      x: r(-20, 620),
      y: r(-10, 810),
      r: r(0.9, 7),
      o: r(0.14, 0.85),
      soft: r() > 0.44,
      hue: [LILAC, AQUA, BLUSH, "#ffffff"][Math.floor(r(0, 4))],
    };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="エセリアル様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* ぼかしは3段。強・中・弱を使い分ける */}
        <filter id={`${P}-b1`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <filter id={`${P}-b2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`${P}-b3`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${P}-b4`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>

        {/* 地。上が薄紫、下が桜色。初稿より両端を一段沈めてある。
            淡いままでは地の紙に溶けて、版面の輪郭が消えた */}
        <linearGradient id={`${P}-sky`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ddd0e8" />
          <stop offset="0.42" stopColor={AIR} />
          <stop offset="0.78" stopColor="#f6e9ef" />
          <stop offset="1" stopColor="#d9cee6" />
        </linearGradient>
        {/* 四隅の沈み。中心の光を出すために外を落とす */}
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.42" r="0.78">
          <stop offset="0.42" stopColor="#c8bad8" stopOpacity="0" />
          <stop offset="1" stopColor="#b8a8cc" stopOpacity="0.68" />
        </radialGradient>
        {/* 薄衣の面。中ほどだけ濃くして、端で消す */}
        <linearGradient id={`${P}-veil`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.72" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* 門の中の光。上ほど白い */}
        <linearGradient id={`${P}-gate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="0.45" stopColor="#fdfbff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        {/* 光の筋。上下で消える */}
        <linearGradient id={`${P}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* 水面。手前ほど濃い */}
        <linearGradient id={`${P}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6dced" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ddd2e4" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* ── 雲。淡いまま重ねる。濃い色を1滴も入れない ─────────── */}
        <g filter={`url(#${P}-b1)`} style={{ mixBlendMode: "multiply" }}>
          <ellipse cx="130" cy="176" rx="190" ry="140" fill={LILAC} opacity="0.75" />
          <ellipse cx="500" cy="330" rx="180" ry="200" fill={AQUA} opacity="0.7" />
          <ellipse cx="220" cy="640" rx="220" ry="150" fill={BLUSH} opacity="0.8" />
          <ellipse cx="470" cy="712" rx="180" ry="120" fill={LILAC} opacity="0.55" />
          <ellipse cx="330" cy="420" rx="150" ry="180" fill="#f3ecf7" opacity="0.9" />
        </g>

        {/* ── 暈。門を包む同心の輪。外へ行くほど溶かす ─────────── */}
        <g style={{ mixBlendMode: "screen" }}>
          <circle cx={CX} cy={ARCH_TOP + 40} r="248" fill="#ffffff" opacity="0.2" filter={`url(#${P}-b1)`} />
          <circle cx={CX} cy={ARCH_TOP + 30} r="176" fill="#ffffff" opacity="0.26" filter={`url(#${P}-b2)`} />
        </g>
        <g fill="none" stroke="#ffffff" filter={`url(#${P}-b3)`} opacity="0.85">
          <circle cx={CX} cy={ARCH_TOP + 30} r="150" strokeWidth="3" />
          <circle cx={CX} cy={ARCH_TOP + 30} r="196" strokeWidth="2" opacity="0.7" />
          <circle cx={CX} cy={ARCH_TOP + 30} r="238" strokeWidth="1.6" opacity="0.5" />
        </g>

        {/* ── 光の筋。門の左右から斜めに ─────────────────────── */}
        <g filter={`url(#${P}-b2)`} style={{ mixBlendMode: "screen" }}>
          {[[-196, 26], [-96, 16], [104, 20], [206, 30], [-8, 12]].map(([dx, w], i) => (
            <rect key={i} x={CX + dx - w / 2} y="-40" width={w} height="740"
                  fill={`url(#${P}-ray)`} opacity={0.5 + (i % 3) * 0.14}
                  transform={`rotate(${dx * 0.035} ${CX + dx} 340)`} />
          ))}
        </g>

        {/* 門の外側だけを沈ませる。初稿は中心の白が飽和して、
            門の形がまったく読めなかった。囲いを暗くするほうが、
            中心をさらに明るくするより効く */}
        <mask id={`${P}-outside`}>
          <rect width="600" height="800" fill="#ffffff" />
          <path d={arch(ARCH_W + 16, ARCH_TOP - 10, HORIZON + 6)} fill="#000000"
                filter={`url(#${P}-b2)`} />
        </mask>
        <rect width="600" height="800" fill={LILAC} opacity="0.42" mask={`url(#${P}-outside)`}
              style={{ mixBlendMode: "multiply" }} />

        {/* ── 門。ここだけ形をはっきり作り、縁を溶かす ─────────── */}
        <path d={arch(ARCH_W + 34, ARCH_TOP - 30, HORIZON + 10)} fill="#ffffff" opacity="0.3"
              filter={`url(#${P}-b1)`} />
        <path d={arch(ARCH_W, ARCH_TOP, HORIZON)} fill={`url(#${P}-gate)`} filter={`url(#${P}-b2)`} />
        <path d={arch(ARCH_W - 40, ARCH_TOP + 44, HORIZON)} fill="#ffffff" opacity="0.9"
              filter={`url(#${P}-b3)`} />
        {/* 門の縁。細い線を1本だけ、弱くぼかして残す */}
        <path d={arch(ARCH_W, ARCH_TOP, HORIZON)} fill="none" stroke="#ffffff" strokeWidth="2.4"
              opacity="0.9" filter={`url(#${P}-b4)`} />
        {/* 光の分散。強い光が縁を通ると、桃と水色に割れる。
            白い線を1本引くより、ずらした2本のほうが「光」に見える */}
        <g fill="none" filter={`url(#${P}-b4)`} style={{ mixBlendMode: "multiply" }}>
          <path d={arch(ARCH_W + 5, ARCH_TOP - 5, HORIZON)} stroke={BLUSH_D} strokeWidth="3.4" opacity="0.62" />
          <path d={arch(ARCH_W - 5, ARCH_TOP + 5, HORIZON)} stroke={AQUA_D} strokeWidth="3.4" opacity="0.62" />
        </g>

        {/* ── 薄衣。版面に横の骨を通す。
               門が1つあるだけの絵は、縮小すると滲みにしか見えない。
               上の1枚は門の奥、下の1枚は手前を通す ───────────────── */}
        <g style={{ mixBlendMode: "multiply" }} opacity="0.55">
          <path d="M -40,196 C 90,132 200,224 300,202 C 400,180 520,236 640,172
                   L 640,246 C 520,310 400,254 300,276 C 200,298 90,206 -40,270 Z"
                fill={LILAC} filter={`url(#${P}-b2)`} />
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.75" filter={`url(#${P}-b4)`}>
          <path d="M -40,196 C 90,132 200,224 300,202 C 400,180 520,236 640,172" />
          <path d="M -40,240 C 90,178 200,266 300,244 C 400,222 520,278 640,214" opacity="0.5" />
        </g>

        {/* ── 水面。門を映して版面を上下に割る ─────────────────── */}
        <rect y={HORIZON} width="600" height={800 - HORIZON} fill={`url(#${P}-water)`} />
        <g transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} opacity="0.5">
          <path d={arch(ARCH_W, ARCH_TOP + 120, HORIZON)} fill={`url(#${P}-gate)`}
                filter={`url(#${P}-b1)`} />
        </g>
        {/* 波。横に伸ばした細い光。下ほど間隔を空ける */}
        <g filter={`url(#${P}-b4)`}>
          {Array.from({ length: 26 }, (_, i) => {
            const r = rand(900 + i);
            const y = HORIZON + 6 + i * i * 0.34 + i * 3.2;
            if (y > 792) return null;
            const t = (y - HORIZON) / (800 - HORIZON);   // 手前ほど広く散る
            const w = r(46, 150) * (0.5 + t);
            const cx = CX + r(-1, 1) * 190 * t;
            return (
              <rect key={i} x={cx - w / 2} y={y} width={w} height={r(1.2, 3)}
                    rx="1.5" fill="#ffffff" opacity={(0.9 - t * 0.5) * r(0.5, 1)} />
            );
          })}
        </g>
        {/* 水平線。滲ませて、ここにも硬い線を置かない */}
        <rect y={HORIZON - 3} width="600" height="6" fill="#ffffff" opacity="0.8"
              filter={`url(#${P}-b3)`} />

        {/* ── 粒。ぼけたものと、ぼけていないものを混ぜる ───────── */}
        {motes.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.hue} opacity={m.o}
                  filter={m.soft ? `url(#${P}-b3)` : undefined} />
        ))}

        {/* 手前の薄衣。門と水面をまたいで垂れる。奥の1枚より濃くして、
            前後を作る。同じ濃さで2枚置くと、ただの縞になる */}
        <g style={{ mixBlendMode: "multiply" }} opacity="0.5">
          <path d="M -40,470 C 80,522 190,436 300,458 C 410,480 540,412 640,458
                   L 640,536 C 540,492 410,558 300,536 C 190,514 80,600 -40,548 Z"
                fill={BLUSH} filter={`url(#${P}-b2)`} />
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.8" filter={`url(#${P}-b4)`}>
          <path d="M -40,470 C 80,522 190,436 300,458 C 410,480 540,412 640,458" />
        </g>

        {/* ── 四隅の沈み。中心を明るくするより、外を落とすほうが効く ── */}
        <rect width="600" height="800" fill={`url(#${P}-vig)`} style={{ mixBlendMode: "multiply" }} />

        {/* ── 蛾。この一匹だけが、ぼけていない。
               硬いものが隣にあって初めて、ほかが溶けて見える ───────── */}
        <g transform="translate(452 424) rotate(-12) scale(0.92)" fill={SMOKE}>
          {/* 前翅は三角に後退させ、後翅は小さく下に置く。
              丸い羽4枚だと蝶になり、蛾に見えない */}
          <g opacity="0.46">
            <path d="M -2,-11 L -47,-31 C -54,-24 -52,-9 -45,-3 L -3,3 Z" />
            <path d="M -3,2 L -35,15 C -39,21 -33,28 -27,25 L -3,11 Z" />
            <path d="M 2,-11 L 47,-31 C 54,-24 52,-9 45,-3 L 3,3 Z" />
            <path d="M 3,2 L 35,15 C 39,21 33,28 27,25 L 3,11 Z" />
          </g>
          <g opacity="0.8">
            <ellipse cx="0" cy="1" rx="3" ry="13" />
            <circle cx="0" cy="-13" r="3.2" />
          </g>
          {/* 翅の脈。近寄ったときの取っ掛かり */}
          <g fill="none" stroke={SMOKE} strokeWidth="0.6" opacity="0.6">
            <path d="M -4,-9 L -44,-26" />
            <path d="M -4,-5 L -46,-15" />
            <path d="M 4,-9 L 44,-26" />
            <path d="M 4,-5 L 46,-15" />
          </g>
          {/* 触角。蛾は羽根状。ここは細くても引いておく */}
          <g fill="none" stroke={SMOKE} strokeWidth="1" strokeLinecap="round" opacity="0.8">
            <path d="M -1.5,-15 C -6,-23 -12,-27 -19,-28" />
            <path d="M 1.5,-15 C 6,-23 12,-27 19,-28" />
          </g>
        </g>

        {/* ── ぼけていない線。これが無いと全部が「ピンぼけ」になる ── */}
        <g fill="none" stroke={SMOKE} opacity="0.3">
          <circle cx={CX} cy={ARCH_TOP + 30} r="272" strokeWidth="0.7" />
          <circle cx={CX} cy={ARCH_TOP + 30} r="292" strokeWidth="0.6" strokeDasharray="2 7" opacity="0.7" />
        </g>
        {/* 暈の上に、粒立った小さな点を環に並べる。硬さの拠り所 */}
        {Array.from({ length: 44 }, (_, i) => {
          const r = rand(1200 + i);
          const a = (i / 44) * Math.PI * 2 + r(-0.05, 0.05);
          const rad = 272 + r(-9, 9);
          return (
            <circle key={i} cx={CX + Math.cos(a) * rad} cy={ARCH_TOP + 30 + Math.sin(a) * rad}
                    r={r(0.7, 1.9)} fill={SMOKE} opacity={r(0.2, 0.65)} />
          );
        })}

        {/* ── 文字。滲んだ影を後ろに置いてから、細い字を重ねる ──── */}
        <text x={CX} y="716" textAnchor="middle" fill={SMOKE} opacity="0.35"
              filter={`url(#${P}-b3)`}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="27" letterSpacing="15">
          ETHEREAL
        </text>
        <text x={CX} y="716" textAnchor="middle" fill={SMOKE} opacity="0.72"
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="27" letterSpacing="15">
          ETHEREAL
        </text>
        <text x={CX} y="742" textAnchor="middle" fill={SMOKE} opacity="0.5"
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.5"
              fontStyle="italic" letterSpacing="5.4">
          luminous · weightless · dissolving
        </text>

        {/* 紙の目。淡い版なので極薄に。強いと透明感が濁る */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.07"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
