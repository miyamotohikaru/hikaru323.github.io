/**
 * コラージュ。
 *
 * 1912年、ブラックとピカソが新聞紙を画面に貼った。
 * 以後この様式の主題はずっと「別々の場所から来た紙が、同じ面の上で隣り合う」こと。
 * 描くのではなく、切る・破る・貼る。
 *
 * ■ この版でやっていること
 *   1. 縁を2種類作る。刃で切った縁は完全な直線、手で破った縁は
 *      不規則で、破れ口に紙の白い芯が覗く。この2種が同居していないと
 *      「切り貼り」ではなく「図形の配置」に見える。
 *   2. 影を落とす。厚み 0.1mm の紙でも、必ず落ちる。
 *      影があるかないかで、貼ってあるか描いてあるかが決まる。
 *   3. 出どころの違う断片を混ぜる。新聞の組版、網点の写真、罫線の帳簿、
 *      等高線の地図、切符。それぞれ別の印刷所・別の時代の紙。
 *   4. 題字は身代金要求状の作法で組む。1文字ずつ別の紙から切り抜き、
 *      書体も大きさも角度も揃えない。揃えた瞬間にタイポグラフィになる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "cl";

const PAPER = "#e6e0d4";
const RED = "#c4442e";
const TEAL = "#2f5d62";
const AMBER = "#e2b13c";
const INK = "#1b1a17";
/* 5色から作った紙の色 */
const CORE = "#f6f2e6"; // 破れ口に覗く紙の芯
const NEWS = "#dcd6c6";
const NEWS_D = "#cfc7b3";
const TEAL_D = "#1e3f44";
const RED_D = "#932e1f";
const AMBER_L = "#f0d38c";

type Rnd = ReturnType<typeof rand>;
/** 上・右・下・左 のどれを手で破るか */
type Tear = [boolean, boolean, boolean, boolean];

/**
 * 紙片ひとつ。切った縁は直線、破った縁は不規則。
 * 破った縁の折れ線も返し、あとで紙の芯（白）を細くなぞる。
 */
function scrap(r: Rnd, w: number, h: number, tear: Tear, amp = 3.6, step = 13) {
  const f = (v: number) => v.toFixed(1);
  const corners: [number, number][] = [[0, 0], [w, 0], [w, h], [0, h]];
  const out: string[] = [];
  const tears: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    if (!tear[i]) {
      out.push(`${f(a[0])} ${f(a[1])}`);
      continue;
    }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(2, Math.round(L / step));
    const nx = (b[1] - a[1]) / L; // 外向き法線
    const ny = -(b[0] - a[0]) / L;
    const seg: string[] = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      // 端はずらさない。角がほどけると紙に見えない
      const fade = Math.min(1, Math.min(t, 1 - t) * 5);
      const j = (r(-amp, amp) + (r() > 0.86 ? r(-amp * 2.2, amp * 2.2) : 0)) * fade;
      const px = a[0] + (b[0] - a[0]) * t + nx * j;
      const py = a[1] + (b[1] - a[1]) * t + ny * j;
      seg.push(`${f(px)} ${f(py)}`);
    }
    out.push(...seg.slice(0, -1));
    tears.push(`M${seg.join("L")}`);
  }
  return { d: `M${out.join("L")}Z`, tears };
}

/** 紙片を1枚置く。面・破れ口の芯・影をまとめて出す */
function Sheet({
  r, x, y, w, h, rot, tear, fill, amp, children,
}: {
  r: Rnd; x: number; y: number; w: number; h: number; rot: number;
  tear: Tear; fill: string; amp?: number; children?: React.ReactNode;
}) {
  const s = scrap(r, w, h, tear, amp);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g filter={`url(#${P}-sh)`}>
        <path d={s.d} fill={fill} />
      </g>
      {/* 破れ口の芯。面の色より明るい紙の中身が細く覗く */}
      <g fill="none" stroke={CORE} strokeWidth="2.6" opacity="0.85">
        {s.tears.map((t, i) => (
          <path key={`t${i}`} d={t} />
        ))}
      </g>
      {children}
    </g>
  );
}

/** 貼りテープ。半透明で、端が千切れている */
function Tape({ r, x, y, w, rot }: { r: Rnd; x: number; y: number; w: number; rot: number }) {
  const h = 20;
  const f = (v: number) => v.toFixed(1);
  const left = Array.from({ length: 5 }, (_, i) => `${f(r(-4, 4))} ${f((i / 4) * h)}`);
  const right = Array.from({ length: 5 }, (_, i) => `${f(w + r(-4, 4))} ${f(h - (i / 4) * h)}`);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity="0.6">
      <path d={`M${left.join("L")}L${right.join("L")}Z`} fill={AMBER_L} />
      <rect x="0" y="2.5" width={w} height="2" fill="#ffffff" opacity="0.5" />
      <rect x="0" y={h - 5} width={w} height="1.6" fill={INK} opacity="0.12" />
    </g>
  );
}

/** 身代金要求状の1文字 */
type Letter = { ch: string; font: string; size: number; bg: string; fg: string; rot: number; w: number; h: number; tear: Tear; italic?: boolean };

export default function Plate() {
  const r = rand19();

  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const SERIF = "Georgia, 'Times New Roman', serif";
  const MONO = "'Courier New', ui-monospace, monospace";

  const letters: Letter[] = [
    { ch: "C", font: SERIF, size: 54, bg: CORE, fg: INK, rot: -7, w: 62, h: 68, tear: [true, false, true, false] },
    { ch: "O", font: SANS, size: 58, bg: INK, fg: AMBER, rot: 5, w: 64, h: 64, tear: [false, false, false, false] },
    { ch: "L", font: MONO, size: 50, bg: RED, fg: CORE, rot: -3, w: 56, h: 70, tear: [false, true, false, true] },
    { ch: "L", font: SERIF, size: 60, bg: NEWS, fg: INK, rot: 9, w: 58, h: 66, tear: [true, true, false, false], italic: true },
    { ch: "A", font: SANS, size: 52, bg: TEAL, fg: CORE, rot: -6, w: 62, h: 62, tear: [false, false, true, false] },
    { ch: "G", font: SERIF, size: 56, bg: AMBER, fg: INK, rot: 3, w: 60, h: 68, tear: [true, false, false, true] },
    { ch: "E", font: SANS, size: 62, bg: CORE, fg: RED, rot: -9, w: 60, h: 66, tear: [false, true, true, false] },
  ];

  /* 新聞の組版。太さと長さのちがう行を2段に組む */
  const lines = Array.from({ length: 46 }, (_, i) => ({
    col: i < 23 ? 0 : 1,
    row: i % 23,
    w: 52 + Math.round(r(0, 62)),
    h: r() > 0.9 ? 4.6 : 2.4,
  }));

  /* 地図の等高線。初稿は輪ごとに位相を変えたので線が交差し、落書きになった。
     等高線は交差しない。同じ輪郭を比率だけ変えて入れ子にするのが正しい */
  const shape = (a: number) => 54 + Math.sin(a * 3 + 0.7) * 13 + Math.sin(a * 2 - 1.1) * 7;
  const contour = Array.from({ length: 6 }, (_, i) => {
    const k = 1 - i * 0.145;
    const pts: [number, number][] = Array.from({ length: 30 }, (_, j) => {
      const a = (j / 30) * Math.PI * 2;
      const rr = shape(a) * k;
      return [102 + Math.cos(a) * rr * 1.5, 74 + Math.sin(a) * rr * 0.86];
    });
    const f = (v: number) => v.toFixed(1);
    const mid = (u: [number, number], v: [number, number]): [number, number] => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
    const m0 = mid(pts[pts.length - 1], pts[0]);
    let d = `M${f(m0[0])} ${f(m0[1])}`;
    for (let j = 0; j < pts.length; j++) {
      const m = mid(pts[j], pts[(j + 1) % pts.length]);
      d += `Q${f(pts[j][0])} ${f(pts[j][1])} ${f(m[0])} ${f(m[1])}`;
    }
    return `${d}Z`;
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="コラージュ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 紙1枚ぶんの影。厚みは薄いが、必ず落ちる */}
        <filter id={`${P}-sh`} x="-15%" y="-15%" width="135%" height="140%">
          <feDropShadow dx="2.5" dy="3.5" stdDeviation="2.6" floodColor="#1b1a17" floodOpacity="0.34" />
        </filter>
        <clipPath id={`${P}-photo`}>
          <rect width="236" height="216" />
        </clipPath>
        <clipPath id={`${P}-map`}>
          <rect width="204" height="150" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 台紙 */}
        <rect width="600" height="800" fill={PAPER} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />

        {/* ── 青緑の色紙。刃で切った縁だけ。いちばん下に敷く ─────────── */}
        <Sheet r={r} x={296} y={44} w={278} h={198} rot={3} tear={[false, false, false, false]} fill={TEAL}>
          <g fill={CORE} opacity="0.16">
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={`tl${i}`} x={18} y={22 + i * 19} width={r(80, 240)} height="2" />
            ))}
          </g>
          <text x="86" y="30" fill={AMBER} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" letterSpacing="3.4">
            PAPIERS COLLÉS — 1912
          </text>
        </Sheet>

        {/* ── 新聞。右と下を手で破る ────────────────────────────────── */}
        <Sheet r={r} x={26} y={62} w={276} h={342} rot={-4} tear={[false, true, true, false]} fill={NEWS} amp={4.4}>
          {/* 題字 */}
          <text x="16" y="34" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" fontWeight="700" letterSpacing="1">
            LE JOURNAL
          </text>
          <rect x="16" y="42" width="244" height="1.4" fill={INK} opacity="0.6" />
          <rect x="16" y="46" width="244" height="0.7" fill={INK} opacity="0.4" />
          <text x="16" y="60" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="8" letterSpacing="2.2" opacity="0.7">
            PARIS — JEUDI 14 NOVEMBRE
          </text>
          {/* 2段組の本文。行の長さで組版に見せる */}
          <g fill={INK} opacity="0.62">
            {lines.map((l, i) => (
              <rect key={`ln${i}`} x={16 + l.col * 132} y={76 + l.row * 11} width={l.w} height={l.h} />
            ))}
          </g>
          <rect x="148" y="72" width="0.8" height="256" fill={INK} opacity="0.3" />
        </Sheet>

        {/* ── 網点の写真。新聞から切り抜いた顔 ──────────────────────── */}
        <Sheet r={r} x={330} y={186} w={236} h={216} rot={-6} tear={[true, false, true, false]} fill={CORE} amp={3.2}>
          <g clipPath={`url(#${P}-photo)`}>
            {/* 中間調は網点で。これが「新聞から切った」ことの証拠 */}
            <rect width="236" height="216" fill={`url(#${ATLAS.halftone})`} opacity="0.42" />
            {/* 横顔の影。塊で置く */}
            <path
              d="M78 216 C 66 168 70 120 92 84 C 112 50 148 34 178 42 C 168 62 170 78 180 88 C 192 100 196 108 188 114 C 196 126 192 136 180 138 C 184 152 178 158 166 158 C 168 176 158 186 140 186 C 138 200 142 208 148 216 Z"
              fill={INK}
              opacity="0.88"
            />
            <rect y="150" width="236" height="66" fill={INK} opacity="0.42" />
            <rect y="150" width="236" height="66" fill={`url(#${ATLAS.halftone})`} opacity="0.5" />
            {/* 白い抜き。ここだけ版が飛んでいる */}
            <path d="M148 74 C 158 70 166 74 166 82 C 160 78 152 78 148 74 Z" fill={CORE} />
          </g>
          <rect width="236" height="216" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.25" />
          <text x="8" y="210" fill={CORE} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8" letterSpacing="1.6">
            PHOTO — ARCHIVE 04
          </text>
        </Sheet>

        {/* ── 赤い丸。コンパスで切った完全な円 ──────────────────────── */}
        <g filter={`url(#${P}-sh)`}>
          <circle cx="112" cy="596" r="76" fill={RED} />
        </g>
        <circle cx="112" cy="596" r="76" fill="none" stroke={RED_D} strokeWidth="1.4" opacity="0.5" />
        {/* 丸の上に、もう一枚小さく破った紙 */}
        <Sheet r={r} x={72} y={548} w={92} h={62} rot={-11} tear={[true, true, true, true]} fill={CORE} amp={3}>
          <text x="10" y="26" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" fontStyle="italic">
            découpé
          </text>
          <text x="10" y="44" fill={RED_D} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
            À LA MAIN
          </text>
        </Sheet>

        {/* ── 地図の断片。等高線 ────────────────────────────────────── */}
        <Sheet r={r} x={186} y={618} w={204} h={150} rot={4} tear={[true, false, false, true]} fill={AMBER_L} amp={4}>
          <g clipPath={`url(#${P}-map)`}>
            <g fill="none" stroke={TEAL_D} strokeWidth="0.9" opacity="0.6">
              {contour.map((d, i) => (
                <path key={`ct${i}`} d={d} />
              ))}
            </g>
            <path d="M-10 118 L214 92" stroke={RED} strokeWidth="2.2" fill="none" />
            <path d="M-10 118 L214 92" stroke={CORE} strokeWidth="0.8" strokeDasharray="5 5" fill="none" />
            <circle cx="102" cy="74" r="3.4" fill={RED} />
            <text x="110" y="70" fill={TEAL_D} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8">
              412m
            </text>
          </g>
          <rect width="204" height="150" fill="none" stroke={TEAL_D} strokeWidth="0.8" opacity="0.3" />
        </Sheet>

        {/* ── 帳簿の罫紙 ────────────────────────────────────────────── */}
        <Sheet r={r} x={330} y={556} w={244} h={124} rot={-3} tear={[false, false, true, false]} fill={CORE} amp={3.4}>
          <g stroke={TEAL} strokeWidth="0.7" opacity="0.45">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`rl${i}`} x1="0" y1={18 + i * 13} x2="244" y2={18 + i * 13} />
            ))}
          </g>
          <line x1="34" y1="0" x2="34" y2="124" stroke={RED} strokeWidth="0.9" opacity="0.5" />
          <g fill={INK} opacity="0.68">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={`hw${i}`} x={44} y={9 + i * 13} width={r(50, 160)} height="1.8" />
            ))}
          </g>
          <text x="44" y="118" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" opacity="0.7">
            No. 0417 — 3 FR. 50
          </text>
        </Sheet>

        {/* ── 切符。目打ちの穴が並ぶ ───────────────────────────────── */}
        <g transform="translate(388 690) rotate(7)">
          <g filter={`url(#${P}-sh)`}>
            <rect width="170" height="76" fill={AMBER} />
          </g>
          <rect x="118" y="0" width="52" height="76" fill={AMBER_L} />
          <g fill={PAPER}>
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={`pf${i}`} cx="118" cy={6 + i * 8.6} r="2.4" />
            ))}
          </g>
          <text x="12" y="28" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="17" fontWeight="700" letterSpacing="1.2">
            ADMIT ONE
          </text>
          <text x="12" y="46" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8" letterSpacing="1.4" opacity="0.75">
            SECTION B — ROW 12
          </text>
          <rect x="12" y="54" width="96" height="10" fill={INK} opacity="0.85" />
          <g fill={AMBER}>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={`bc${i}`} x={14 + i * 7} y="54" width={i % 3 === 0 ? 2.6 : 1.2} height="10" />
            ))}
          </g>
          <text x="128" y="44" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="20" fontWeight="800">
            07
          </text>
        </g>

        {/* ── 題字。1文字ずつ別の紙から切り抜いて並べる ────────────── */}
        {letters.map((L, i) => {
          const x = 30 + i * 79;
          const y = 424 + Math.sin(i * 1.4) * 12;
          return (
            <Sheet key={`ls${i}`} r={r} x={x} y={y} w={L.w} h={L.h} rot={L.rot} tear={L.tear} fill={L.bg} amp={3.2}>
              <text
                x={L.w / 2} y={L.h / 2 + L.size * 0.35}
                fill={L.fg}
                textAnchor="middle"
                fontFamily={L.font}
                fontSize={L.size}
                fontWeight={L.font === SANS ? 800 : 700}
                fontStyle={L.italic ? "italic" : undefined}
              >
                {L.ch}
              </text>
            </Sheet>
          );
        })}

        {/* ── テープ。継ぎ目を押さえる ─────────────────────────────── */}
        <Tape r={r} x={252} y={122} w={96} rot={-24} />
        <Tape r={r} x={288} y={396} w={84} rot={16} />
        <Tape r={r} x={64} y={396} w={72} rot={9} />
        <Tape r={r} x={470} y={520} w={78} rot={-38} />
        <Tape r={r} x={150} y={716} w={88} rot={-6} />

        {/* ── 手書きの書き込み。台紙に直接 ────────────────────────── */}
        <text
          x="34" y="722"
          fill={TEAL_D}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="16"
          fontStyle="italic"
          transform="rotate(-5 34 722)"
          opacity="0.85"
        >
          cut &amp; paste
        </text>
        <path d="M34 730 C 70 740 110 736 148 724" fill="none" stroke={TEAL_D} strokeWidth="1.4" opacity="0.55" transform="rotate(-5 34 722)" />
        <text
          x="24" y="782"
          fill={INK}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="9"
          letterSpacing="2.2"
          opacity="0.55"
        >
          PAPER · SCISSORS · PASTE — 9 FRAGMENTS
        </text>

        {/* 台紙の目をもう一度うっすら。全部の紙を1枚に馴染ませる */}
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

/** 種を固定した乱数。破れ方は毎回同じでなければならない */
function rand19() {
  return rand(19121012);
}
