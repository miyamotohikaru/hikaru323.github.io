/**
 * ヴィクトリアン。
 *
 * 万国博覧会（1851）以後の英国の印刷物。名刺・チラシ・扉。
 * 機械で刷れるようになった途端、人は「刷れるかぎり詰める」ようになった。
 * その過剰さが様式そのものなので、余白を残すと嘘になる。
 *
 * ■ ここで作っている「らしさ」
 *   1. ギヨシェ（彫刻機で引いた同心の波）。紙幣・株券・証書の地紋。
 *      これは手で描ける模様ではなく、幾何学旋盤という機械の産物。
 *      r(θ)=R+a·cos(nθ) の輪を何重にも重ねて作っている。
 *      近くで見たときに持つのは、ほぼこれ一つで決まる。
 *   2. 多書体の混在。一枚の中で大きさも太さも傾きも全部違う行を積む。
 *      現代の版面設計では禁じ手だが、当時はこれが「豪華」だった。
 *   3. 色刷り木活字（chromatic wood type）。同じ文字を版ごとにずらして
 *      刷り、影と縁取りを別色で乗せる。ここでは金→焦茶→朱の3版。
 *   4. 空押し（エンボス）。飾り罫の内外に明暗を1pxずつ入れて起こす。
 *
 * ■ 隣（バロック）と混ざらないようにしたこと
 *   同じ金と朱を使うが、あちらは暗い地に劇的な明暗、こちらは明るい地に
 *   平面的な線。バロックは絵、ヴィクトリアンは版面。役割で分けている。
 */
import { ATLAS, rand, shift, alpha } from "@/lib/plate";

const P = "vc";
const PAPER = "#f0e6d2";
const INK = "#2a1a14";
const RED = "#8b1a1a";
const GOLD = "#c9a227";
const GREEN = "#3f5c4a";

/**
 * ギヨシェの輪。極座標の波。n が花弁の数、a が振れ幅。
 * 幾何学旋盤（geometric lathe）が引いた線を数式で真似ている。
 */
function rosette(cx: number, cy: number, R: number, a: number, n: number, ph: number, steps = 220) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = R + a * Math.cos(n * t + ph);
    pts.push(`${(cx + rr * Math.sin(t)).toFixed(1)} ${(cy - rr * Math.cos(t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** ギヨシェの帯。位相をずらした2本の正弦。紙幣の縁飾り */
function guillocheBand(x0: number, x1: number, y: number, amp: number, waves: number, ph: number, steps = 200) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(`${(x0 + (x1 - x0) * t).toFixed(1)} ${(y + amp * Math.sin(t * Math.PI * 2 * waves + ph)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

/** 角の唐草。渦と3枚の葉。四隅に鏡像で置く */
function Fleuron({ x, y, sx, sy }: { x: number; y: number; sx: number; sy: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <path
        d="M2 46 C 2 20 20 2 46 2 C 40 12 30 14 22 20 C 12 28 10 36 10 46 Z"
        fill={INK}
      />
      <path
        d="M14 52 C 14 30 30 14 52 14 C 46 26 34 30 26 38 C 20 44 20 48 20 52 Z"
        fill={GOLD}
        opacity="0.9"
      />
      <path
        d="M24 60 C 24 44 36 30 54 26 C 44 38 40 44 38 54 C 36 62 30 64 24 60 Z"
        fill={GREEN}
      />
      {/* 渦。ここが唐草の要。輪郭だけで巻く */}
      <path d="M60 40 C 76 40 82 54 72 62 C 63 69 52 62 56 52 C 59 45 68 46 67 53" fill="none" stroke={INK} strokeWidth="2.6" />
      <path d="M40 60 C 40 76 54 82 62 72 C 69 63 62 52 52 56 C 45 59 46 68 53 67" fill="none" stroke={INK} strokeWidth="2.6" opacity="0.55" />
      <circle cx="8" cy="8" r="4" fill={RED} />
      <circle cx="22" cy="6" r="2" fill={INK} />
      <circle cx="6" cy="22" r="2" fill={INK} />
    </g>
  );
}

export default function Plate() {
  const r = rand(1851);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ヴィクトリアン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 飾り罫の帯。鎖状の輪。四辺に回す */}
        <pattern id={`${P}-chain`} width="26" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12 C 6 -1 20 -1 26 12" fill="none" stroke={INK} strokeWidth="1.6" />
          <path d="M0 12 C 6 25 20 25 26 12" fill="none" stroke={INK} strokeWidth="1.6" />
          <circle cx="13" cy="12" r="2.6" fill={RED} />
          <circle cx="0" cy="12" r="1.8" fill={GOLD} />
          <circle cx="26" cy="12" r="1.8" fill={GOLD} />
        </pattern>
        {/* アーチの中だけギヨシェを見せる */}
        <clipPath id={`${P}-arch`}>
          <path d="M154 316 L154 218 A146 122 0 0 1 446 218 L446 316 Z" />
        </clipPath>
        <radialGradient id={`${P}-medal`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={shift(GOLD, 0.72)} />
          <stop offset="100%" stopColor={shift(GOLD, 0.3)} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 額。太細太の罫＋鎖の帯。過剰でよい ─────────────────── */}
        <rect x="16" y="16" width="568" height="768" fill="none" stroke={INK} strokeWidth="5" />
        <rect x="26" y="26" width="548" height="748" fill="none" stroke={INK} strokeWidth="1.2" />
        {/* 鎖の帯。上下は横向き、左右は回して同じ紋様を回す */}
        <g>
          <rect x="32" y="32" width="536" height="24" fill={`url(#${P}-chain)`} />
          <rect x="32" y="744" width="536" height="24" fill={`url(#${P}-chain)`} />
          <g transform="translate(56 32) rotate(90)">
            <rect x="0" y="0" width="736" height="24" fill={`url(#${P}-chain)`} />
          </g>
          <g transform="translate(568 32) rotate(90)">
            <rect x="0" y="0" width="736" height="24" fill={`url(#${P}-chain)`} />
          </g>
        </g>
        <rect x="56" y="56" width="488" height="688" fill="none" stroke={INK} strokeWidth="2.6" />
        {/* 空押し。罫の内側に明、外側に暗を1本ずつ足すと起きて見える */}
        <rect x="58" y="58" width="484" height="684" fill="none" stroke={shift(PAPER, 0.6)} strokeWidth="1.2" />
        <rect x="62" y="62" width="476" height="676" fill="none" stroke={GOLD} strokeWidth="1" />

        <Fleuron x={64} y={64} sx={1} sy={1} />
        <Fleuron x={536} y={64} sx={-1} sy={1} />
        <Fleuron x={64} y={736} sx={1} sy={-1} />
        <Fleuron x={536} y={736} sx={-1} sy={-1} />

        {/* ── アーチの円窓。ギヨシェの地紋 ───────────────────── */}
        <path d="M154 316 L154 218 A146 122 0 0 1 446 218 L446 316 Z" fill={`url(#${P}-medal)`} />
        <g clipPath={`url(#${P}-arch)`}>
          {/* 同心の波。位相と花弁数をずらして重ねる。これが彫刻機の線 */}
          <g fill="none" stroke={INK} opacity="0.55">
            {Array.from({ length: 11 }, (_, i) => (
              <path key={i} d={rosette(300, 218, 34 + i * 9, 5 + i * 0.6, 24, i * 0.26)} strokeWidth="0.6" />
            ))}
          </g>
          <g fill="none" stroke={RED} opacity="0.45">
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={rosette(300, 218, 44 + i * 13, 9, 16, 0.4 + i * 0.4)} strokeWidth="0.55" />
            ))}
          </g>
          <g fill="none" stroke={GREEN} opacity="0.4">
            {Array.from({ length: 4 }, (_, i) => (
              <path key={i} d={rosette(300, 218, 122 + i * 8, 6, 40, i * 0.5)} strokeWidth="0.5" />
            ))}
          </g>
          {/* 中央の小さな盾。地紋の芯を締める */}
          <circle cx="300" cy="218" r="30" fill={PAPER} stroke={INK} strokeWidth="1.6" />
          <circle cx="300" cy="218" r="25" fill="none" stroke={GOLD} strokeWidth="2.4" />
          <path d="M300 200 L312 208 L312 224 L300 236 L288 224 L288 208 Z" fill={RED} stroke={INK} strokeWidth="1" />
          <text x="300" y="224" textAnchor="middle" fill={GOLD} fontFamily="Georgia, 'Times New Roman', serif" fontSize="14" fontWeight="700">
            V
          </text>
        </g>
        <path d="M154 316 L154 218 A146 122 0 0 1 446 218 L446 316" fill="none" stroke={INK} strokeWidth="3.4" />
        <path d="M160 316 L160 220 A140 116 0 0 1 440 220 L440 316" fill="none" stroke={GOLD} strokeWidth="1.2" />
        {/* アーチの起拱点に小さな持ち送り */}
        {[154, 446].map((x, i) => (
          <g key={i}>
            <rect x={x - 12} y="310" width="24" height="10" fill={INK} />
            <rect x={x - 17} y="320" width="34" height="7" fill={RED} />
            <rect x={x - 21} y="327" width="42" height="5" fill={INK} />
          </g>
        ))}

        {/* ── 題字の積み上げ。行ごとに書体も大きさも変える ────────── */}
        {/* 1行目。ごく小さい大文字、両側に罫 */}
        <line x1="112" y1="360" x2="238" y2="360" stroke={INK} strokeWidth="1" />
        <line x1="362" y1="360" x2="488" y2="360" stroke={INK} strokeWidth="1" />
        <circle cx="106" cy="360" r="2.4" fill={RED} />
        <circle cx="494" cy="360" r="2.4" fill={RED} />
        <text x="300" y="365" textAnchor="middle" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" letterSpacing="5.5">
          ESTABLISHED MDCCCXXXVII
        </text>

        {/* 2行目。斜体。細く長く */}
        <text x="300" y="398" textAnchor="middle" fill={GREEN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontStyle="italic">
          The Great Exhibition of
        </text>

        {/* 3行目。木活字の3版刷り。金→焦茶→朱の順にずらす */}
        <g fontFamily="Georgia, 'Times New Roman', serif" fontSize="72" fontWeight="700" letterSpacing="1" textAnchor="middle">
          <text x="306" y="472" fill={GOLD}>VICTORIAN</text>
          <text x="303" y="469" fill={shift(INK, -0.1)}>VICTORIAN</text>
          <text x="300" y="466" fill={RED} stroke={INK} strokeWidth="1.4" paintOrder="stroke">
            VICTORIAN
          </text>
        </g>

        {/* 4行目。極端に長体。同じ紙面に別の骨格を混ぜるのがこの様式 */}
        <text
          x="300" y="502" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" fontWeight="700" letterSpacing="2"
          transform="translate(0 -502) scale(1 1) translate(0 502)"
          style={{ transformOrigin: "300px 502px" }}
        >
          <tspan>ORNAMENT · TYPE · MACHINE</tspan>
        </text>

        {/* 飾り罫。菱形を挟んだ両振り */}
        <g>
          <line x1="96" y1="522" x2="276" y2="522" stroke={INK} strokeWidth="2.6" />
          <line x1="324" y1="522" x2="504" y2="522" stroke={INK} strokeWidth="2.6" />
          <line x1="96" y1="527" x2="276" y2="527" stroke={GOLD} strokeWidth="1" />
          <line x1="324" y1="527" x2="504" y2="527" stroke={GOLD} strokeWidth="1" />
          <path d="M300 512 L312 522 L300 532 L288 522 Z" fill={RED} stroke={INK} strokeWidth="1.2" />
          <circle cx="282" cy="522" r="2.4" fill={INK} />
          <circle cx="318" cy="522" r="2.4" fill={INK} />
        </g>

        {/* ── ギヨシェの帯。紙幣の縁。近くで見るともう一つの細部 ──── */}
        <g fill="none">
          <path d={guillocheBand(96, 504, 556, 11, 13, 0)} stroke={GOLD} strokeWidth="1.1" />
          <path d={guillocheBand(96, 504, 556, 11, 13, Math.PI)} stroke={GOLD} strokeWidth="1.1" />
          <path d={guillocheBand(96, 504, 556, 6.5, 13, Math.PI / 2)} stroke={RED} strokeWidth="0.8" opacity="0.75" />
          <path d={guillocheBand(96, 504, 556, 6.5, 13, -Math.PI / 2)} stroke={RED} strokeWidth="0.8" opacity="0.75" />
        </g>
        <line x1="96" y1="574" x2="504" y2="574" stroke={INK} strokeWidth="1" />

        {/* ── 小さな字の塊。詰めるのがこの様式の作法 ───────────── */}
        <text x="300" y="600" textAnchor="middle" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="12" letterSpacing="0.4">
          Engraved &amp; Printed by <tspan fontStyle="italic">Messrs. Whitworth &amp; Sons</tspan>, Ludgate Hill
        </text>
        <text x="300" y="618" textAnchor="middle" fill={GREEN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" letterSpacing="1.4">
          CHROMOLITHOGRAPHY · WOOD TYPE · GUILLOCHE ENGRAVING
        </text>

        {/* ── 印刷屋の花。活字の飾りを一列 ───────────────────── */}
        <g transform="translate(300 660)">
          {[-150, -100, -50, 0, 50, 100, 150].map((d, i) => (
            <g key={i} transform={`translate(${d} 0)`}>
              {i % 2 === 0 ? (
                <>
                  <path d="M0 -14 C 9 -9 9 9 0 14 C -9 9 -9 -9 0 -14 Z" fill={GREEN} />
                  <path d="M-14 0 C -9 -9 9 -9 14 0 C 9 9 -9 9 -14 0 Z" fill={alpha(GREEN, 0.6)} />
                  <circle r="3" fill={RED} />
                </>
              ) : (
                <>
                  <circle r="9" fill="none" stroke={INK} strokeWidth="2" />
                  <circle r="4" fill={GOLD} stroke={INK} strokeWidth="1" />
                  <path d="M0 -16 L3 -11 L-3 -11 Z M0 16 L3 11 L-3 11 Z M-16 0 L-11 3 L-11 -3 Z M16 0 L11 3 L11 -3 Z" fill={INK} />
                </>
              )}
            </g>
          ))}
        </g>

        {/* ── 台。リボン。ここで版面を閉じる ─────────────────── */}
        <path
          d="M108 690 L492 690 L492 718 L108 718 Z"
          fill={RED}
          stroke={INK}
          strokeWidth="1.6"
        />
        <path d="M86 696 L108 690 L108 718 L86 724 Z" fill={shift(RED, -0.3)} stroke={INK} strokeWidth="1.4" />
        <path d="M514 696 L492 690 L492 718 L514 724 Z" fill={shift(RED, -0.3)} stroke={INK} strokeWidth="1.4" />
        <text x="300" y="709" textAnchor="middle" fill={PAPER} fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" letterSpacing="7">
          LONDON · 1851
        </text>

        {/* 刷りのムラ。凸版は必ずインクが偏る */}
        <g fill={INK} opacity="0.12">
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={r(40, 560)} cy={r(40, 760)} r={r(0.4, 1.6)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.22" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
