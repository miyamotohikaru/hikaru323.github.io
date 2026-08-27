/**
 * 新古典主義。
 *
 * 18世紀後半の建築図版。ピラネージやアダム兄弟の銅版図面の書式で組む。
 * 主題は建物ではなく「秩序」。だから絵ではなく図面として描く。
 *
 * ■ ここで作っている「らしさ」
 *   1. 完全な左右対称。この一群でこれだけが定規で割り切れる。
 *      バロックの斜め、ロココの非対称と、真正面から対立させてある。
 *   2. 図面の書式。寸法線・目盛・縮尺棒・平面図。
 *      「measured drawing（実測図）」であることを見せるのが要点で、
 *      これを外すと、ただの神殿のイラストになる。
 *   3. 彫刻的な陰影。柱に丸みを、軒に落ち影を、間に闇を置く。
 *      面は平らに塗らない。ただし影は灰で、色は付けない。
 *   4. 朱は雷文（メアンダロス）と円板にだけ使う。
 *      ウェッジウッドのジャスパーが同じ配色をしている。
 *
 * ■ 柱間について
 *   6本（hexastyle）にしてある。偶数だから中心軸に柱が来ず、
 *   正面の中央が扉になる。奇数にすると軸に柱が立って入口が塞がる。
 */
import { ATLAS, rand, shift, alpha } from "@/lib/plate";

const P = "nc";
const PAPER = "#efe9dc";
const STONE = "#c8c2b0";
const GREY = "#8a8574";
const INK = "#2f2a22";
const RED = "#b0442e";

/* 柱の中心。6本。中央は柱ではなく間（＝扉） */
const COLS = [100, 180, 260, 340, 420, 500];
const SHAFT_TOP = 296;
const SHAFT_BOT = 556;

/** 掌状装飾（アンテミオン）。棕櫚の扇。破風の頂と隅飾りに置く */
function Anthemion({ x, y, s, fill, n = 9 }: { x: number; y: number; s: number; fill: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: n }, (_, i) => {
        const u = (i / (n - 1)) * 2 - 1;
        const a = u * 70;
        const L = 26 * (1 - 0.44 * u * u) + 7;
        return <ellipse key={i} transform={`rotate(${a}) translate(0 ${-L / 2})`} rx="3.2" ry={L / 2} fill={fill} />;
      })}
      <path d="M-13 2 C -24 5 -24 18 -13 18 C -5 18 -3 8 -9 8" fill="none" stroke={fill} strokeWidth="2.6" />
      <path d="M13 2 C 24 5 24 18 13 18 C 5 18 3 8 9 8" fill="none" stroke={fill} strokeWidth="2.6" />
      <ellipse cy="10" rx="4" ry="7" fill={fill} />
    </g>
  );
}

/** イオニア式の柱頭。渦（ヴォリュート）2つと卵鏃（エキノス） */
function Capital({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* 頂板（アバクス） */}
      <rect x="-27" y="266" width="54" height="7" fill={shift(STONE, 0.28)} />
      <rect x="-27" y="273" width="54" height="2.4" fill={GREY} opacity="0.6" />
      {/* 渦。左右対称。糸巻きの形 */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 19} 282) scale(${s} 1)`}>
          <circle r="9.5" fill={shift(STONE, 0.2)} stroke={INK} strokeWidth="1.1" />
          <path d="M0 -6 C 5 -6 7 -1 5 3 C 3 6 -2 5 -2 1 C -2 -1 1 -2 2 0" fill="none" stroke={INK} strokeWidth="1.2" />
          <circle r="1.6" fill={INK} />
        </g>
      ))}
      <rect x="-10" y="274" width="20" height="15" fill={shift(STONE, 0.14)} />
      {/* 卵鏃。柱頭の下の玉縁 */}
      <rect x="-21" y="289" width="42" height="7" fill={STONE} />
      {[-15, -5, 5, 15].map((d, i) => (
        <ellipse key={i} cx={d} cy="292.5" rx="3.4" ry="2.6" fill={shift(STONE, 0.36)} stroke={INK} strokeWidth="0.6" />
      ))}
    </g>
  );
}

/** 雷文（メアンダロス）。折れ線1本で描く。曲線を使わないのが古典 */
const MEANDER = "M0 24 L0 0 L26 0 L26 17 L9 17 L9 9 L18 9";

export default function Plate() {
  const r = rand(1780);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="新古典主義様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 柱の丸み。左が光、右が影。全部の柱で使い回す（bbox 基準） */}
        <linearGradient id={`${P}-round`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shift(STONE, 0.1)} />
          <stop offset="26%" stopColor={shift(STONE, 0.44)} />
          <stop offset="62%" stopColor={STONE} />
          <stop offset="100%" stopColor={shift(GREY, -0.1)} />
        </linearGradient>
        <linearGradient id={`${P}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shift(GREY, -0.55)} />
          <stop offset="100%" stopColor={shift(GREY, -0.28)} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 図面の枠。1本の細い罫だけ。飾らないのがこの様式 ──────── */}
        <rect x="30" y="30" width="540" height="740" fill="none" stroke={INK} strokeWidth="1.4" />
        <rect x="39" y="39" width="522" height="722" fill="none" stroke={GREY} strokeWidth="0.6" />

        {/* ── 奥のセラ壁。柱の背後。ここが暗いと柱が立って見える ──── */}
        <rect x="116" y="266" width="368" height="306" fill={`url(#${P}-wall)`} />
        {/* 扉。中央軸。6本柱の中央は間なので、ここが開く */}
        <rect x="264" y="352" width="72" height="220" fill={shift(GREY, -0.72)} />
        <rect x="256" y="340" width="88" height="14" fill={shift(STONE, -0.15)} />
        <rect x="258" y="354" width="84" height="4" fill={shift(GREY, -0.4)} />
        {/* 壁の目地。石積みを示す横線 */}
        <g stroke={shift(GREY, -0.62)} strokeWidth="1">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1="116" y1={272 + i * 28} x2="484" y2={272 + i * 28} />
          ))}
        </g>

        {/* ── 柱。溝彫り（フルーティング）とエンタシス ─────────────── */}
        {COLS.map((x, i) => (
          <g key={i}>
            {/* 落ち影。柱の右へ。これで奥行きが出る */}
            <rect x={x + 17} y={SHAFT_TOP} width="13" height={SHAFT_BOT - SHAFT_TOP} fill={shift(GREY, -0.5)} opacity="0.55" />
            <rect x={x - 18} y={SHAFT_TOP} width="36" height={SHAFT_BOT - SHAFT_TOP} fill={`url(#${P}-round)`} />
            {/* 溝。7本。右へ行くほど間隔を詰めて丸みを見せる */}
            {Array.from({ length: 7 }, (_, j) => {
              const u = (j + 1) / 8;
              const px = x - 18 + 36 * (0.5 - Math.cos(u * Math.PI) * 0.5);
              return (
                <g key={j}>
                  <line x1={px} y1={SHAFT_TOP + 2} x2={px} y2={SHAFT_BOT - 2} stroke={shift(GREY, -0.2)} strokeWidth="1.1" opacity={0.4 + u * 0.5} />
                  <line x1={px + 1.6} y1={SHAFT_TOP + 2} x2={px + 1.6} y2={SHAFT_BOT - 2} stroke={shift(STONE, 0.5)} strokeWidth="0.7" opacity={0.7 - u * 0.4} />
                </g>
              );
            })}
            <Capital x={x} />
            {/* 柱礎 */}
            <rect x={x - 21} y={SHAFT_BOT} width="42" height="6" fill={shift(STONE, 0.2)} />
            <rect x={x - 24} y={SHAFT_BOT + 6} width="48" height="7" fill={STONE} />
            <rect x={x - 27} y={SHAFT_BOT + 13} width="54" height="8" fill={shift(STONE, -0.12)} />
          </g>
        ))}

        {/* ── エンタブレチュア。アーキトレーヴ・フリーズ・コーニス ─── */}
        <rect x="66" y="252" width="468" height="14" fill={shift(STONE, 0.18)} />
        <rect x="66" y="264" width="468" height="2.4" fill={GREY} opacity="0.7" />
        <rect x="60" y="222" width="480" height="30" fill={shift(PAPER, 0.4)} />
        <rect x="60" y="222" width="480" height="2" fill={GREY} opacity="0.6" />
        {/* 歯飾り（デンティル）。近くで見たときの細部その1 */}
        {Array.from({ length: 42 }, (_, i) => (
          <rect key={i} x={62 + i * 11.4} y={210} width="7" height="12" fill={shift(STONE, 0.1)} stroke={GREY} strokeWidth="0.5" />
        ))}
        <rect x="54" y="196" width="492" height="14" fill={shift(STONE, 0.34)} />
        <rect x="54" y="206" width="492" height="4" fill={shift(GREY, 0.1)} />
        <text
          x="300" y="244" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" letterSpacing="6.4"
        >
          ORDO · RATIO · MENSVRA
        </text>

        {/* ── 破風。傾斜コーニスとティンパヌム ─────────────────── */}
        <polygon points="48,196 300,84 552,196" fill={shift(STONE, 0.4)} />
        <polygon points="70,192 300,90 530,192" fill={shift(GREY, -0.15)} />
        <polygon points="78,188 300,99 522,188" fill={shift(PAPER, 0.1)} />
        {/* ティンパヌムの円板。朱地に生成りの掌状装飾 */}
        <circle cx="300" cy="152" r="30" fill={RED} />
        <circle cx="300" cy="152" r="30" fill="none" stroke={INK} strokeWidth="1.2" />
        <Anthemion x={300} y={166} s={0.86} fill={shift(PAPER, 0.5)} />
        {/* 円板の左右に横臥する渦。破風の隅を埋める古典の作法 */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${300 + s * 96} 172) scale(${s} 1)`}>
            <path d="M-56 8 C -30 8 -6 0 8 -16 C 18 -28 34 -26 38 -14 C 41 -5 32 2 26 -4" fill="none" stroke={INK} strokeWidth="2.2" />
            <path d="M-56 14 C -26 14 4 4 20 -14" fill="none" stroke={GREY} strokeWidth="1.4" />
            <circle cx="32" cy="-11" r="2.6" fill={INK} />
          </g>
        ))}
        {/* 隅飾り（アクロテリオン） */}
        <Anthemion x={300} y={78} s={1} fill={INK} />
        <Anthemion x={48} y={190} s={0.66} fill={INK} n={7} />
        <Anthemion x={552} y={190} s={0.66} fill={INK} n={7} />

        {/* ── 基壇。3段。下ほど広い ─────────────────────────── */}
        {[
          [66, 572, 468, 14],
          [56, 586, 488, 14],
          [46, 600, 508, 16],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={i % 2 === 0 ? shift(STONE, 0.22) : STONE} />
            <rect x={x} y={y} width={w} height="2.6" fill={shift(STONE, 0.6)} />
            <rect x={x} y={(y as number) + (h as number) - 2} width={w} height="2" fill={shift(GREY, -0.2)} />
          </g>
        ))}
        <rect x="40" y="616" width="520" height="4" fill={INK} />

        {/* ── 雷文の帯。朱。曲線を一切使わない文様 ───────────────── */}
        <g transform="translate(48 634)">
          <rect x="-8" y="-4" width="512" height="32" fill={alpha(RED, 0.12)} />
          {Array.from({ length: 19 }, (_, i) => (
            <path key={i} d={MEANDER} transform={`translate(${i * 26} 0)`} fill="none" stroke={RED} strokeWidth="3.4" />
          ))}
        </g>
        <line x1="40" y1="668" x2="560" y2="668" stroke={INK} strokeWidth="1.2" />

        {/* ── 題字。ローマ碑文体。字間を広く、中黒で区切る ─────────── */}
        <text
          x="300" y="706" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="29" letterSpacing="8.6"
        >
          NEOCLASSICISM
        </text>
        <text x="300" y="726" textAnchor="middle" fill={GREY} fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" letterSpacing="4.4">
          ORDINIS IONICI ELEVATIO · ROMÆ MDCCLXX
        </text>

        {/* ── 縮尺棒。実測図であることの印。近くで見たときの細部その2 ── */}
        <g transform="translate(196 744)">
          <rect x="0" y="0" width="208" height="9" fill="none" stroke={INK} strokeWidth="1" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={i * 26} y="0" width="26" height="9" fill={i % 2 === 0 ? INK : PAPER} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1={i * 26} y1="9" x2={i * 26} y2={i % 2 === 0 ? 15 : 12} stroke={INK} strokeWidth="0.9" />
              {i % 2 === 0 && (
                <text x={i * 26} y="24" textAnchor="middle" fill={GREY} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7">
                  {i * 5}
                </text>
              )}
            </g>
          ))}
          <text x="-8" y="8" textAnchor="end" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="8" letterSpacing="1.4">
            SCALA
          </text>
          <text x="216" y="8" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="8" letterSpacing="1.4">
            PEDVM
          </text>
        </g>

        {/* ── 寸法線。左の余白。図面の書式そのもの ─────────────── */}
        <g stroke={INK} strokeWidth="0.8" fill={INK}>
          <line x1="50" y1={SHAFT_TOP} x2="50" y2={SHAFT_BOT + 21} />
          <polygon points={`50,${SHAFT_TOP} 47,${SHAFT_TOP + 7} 53,${SHAFT_TOP + 7}`} />
          <polygon points={`50,${SHAFT_BOT + 21} 47,${SHAFT_BOT + 14} 53,${SHAFT_BOT + 14}`} />
          {/* 目盛。10 分割。柱身をモデュールで割るのが古典の作法 */}
          {Array.from({ length: 11 }, (_, i) => {
            const y = SHAFT_TOP + ((SHAFT_BOT + 21 - SHAFT_TOP) / 10) * i;
            return <line key={i} x1={i % 5 === 0 ? 44 : 47} y1={y} x2="53" y2={y} strokeWidth="0.7" />;
          })}
          <line x1="44" y1={SHAFT_TOP} x2="78" y2={SHAFT_TOP} strokeWidth="0.5" opacity="0.6" />
          <line x1="44" y1={SHAFT_BOT + 21} x2="78" y2={SHAFT_BOT + 21} strokeWidth="0.5" opacity="0.6" />
        </g>
        <text
          transform={`translate(64 ${(SHAFT_TOP + SHAFT_BOT) / 2}) rotate(-90)`}
          textAnchor="middle" fill={GREY}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="8" letterSpacing="2.6"
        >
          X MODVLI
        </text>

        {/* ── 破風の両脇に小図。実測図版の作法 ─────────────────────
            初稿は平面図を右の余白に置いたが、正面図が版面いっぱいなので
            柱に重なった。破風の斜辺の外側は三角に空くので、そこへ収める。
            左に平面、右に柱頭の詳細。左右に1枚ずつ置かないと対称が崩れる */}
        <g transform="translate(48 96)" opacity="0.9">
          <text x="0" y="-4" fill={GREY} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7" letterSpacing="1.8">
            PLANVM
          </text>
          <rect x="0" y="0" width="96" height="50" fill="none" stroke={GREY} strokeWidth="0.6" />
          <rect x="14" y="9" width="68" height="32" fill="none" stroke={INK} strokeWidth="0.9" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <circle cx={6 + i * 8.4} cy="5" r="2.1" fill="none" stroke={INK} strokeWidth="0.8" />
              <circle cx={6 + i * 8.4} cy="45" r="2.1" fill="none" stroke={INK} strokeWidth="0.8" />
            </g>
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <circle cx="6" cy={13 + i * 8} r="2.1" fill="none" stroke={INK} strokeWidth="0.8" />
              <circle cx="90" cy={13 + i * 8} r="2.1" fill="none" stroke={INK} strokeWidth="0.8" />
            </g>
          ))}
          <line x1="0" y1="25" x2="96" y2="25" stroke={RED} strokeWidth="0.6" strokeDasharray="4 3" />
        </g>

        <g transform="translate(456 96)" opacity="0.9">
          <text x="96" y="-4" textAnchor="end" fill={GREY} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7" letterSpacing="1.8">
            CAPITVLVM
          </text>
          <rect x="0" y="0" width="96" height="50" fill="none" stroke={GREY} strokeWidth="0.6" />
          {/* 渦の作図。中心の目と、巻きを決める補助円 */}
          <circle cx="30" cy="26" r="16" fill="none" stroke={GREY} strokeWidth="0.5" strokeDasharray="3 2" />
          <circle cx="66" cy="26" r="16" fill="none" stroke={GREY} strokeWidth="0.5" strokeDasharray="3 2" />
          <rect x="8" y="6" width="80" height="5" fill={INK} opacity="0.85" />
          <path d="M30 14 C 42 14 47 24 42 32 C 37 39 26 37 26 29 C 26 24 33 23 34 28" fill="none" stroke={INK} strokeWidth="1.3" />
          <path d="M66 14 C 54 14 49 24 54 32 C 59 39 70 37 70 29 C 70 24 63 23 62 28" fill="none" stroke={INK} strokeWidth="1.3" />
          <path d="M30 14 C 40 10 56 10 66 14" fill="none" stroke={INK} strokeWidth="1.3" />
          <rect x="36" y="34" width="24" height="10" fill="none" stroke={INK} strokeWidth="0.9" />
          {[41, 48, 55].map((x, i) => (
            <ellipse key={i} cx={x} cy="39" rx="2.6" ry="3.4" fill="none" stroke={INK} strokeWidth="0.7" />
          ))}
          <line x1="48" y1="0" x2="48" y2="50" stroke={RED} strokeWidth="0.6" strokeDasharray="4 3" />
        </g>

        {/* 紙の目。図面用紙は上質紙 */}
        <g fill={INK} opacity="0.08">
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={r(40, 560)} cy={r(40, 760)} r={r(0.4, 1.3)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
