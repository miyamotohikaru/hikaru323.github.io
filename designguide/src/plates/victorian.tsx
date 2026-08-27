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

/**
 * 角の唐草。初稿は弧をばらまいただけで、割れた欠片に見えた。
 * 唐草には骨組みがある。角を抱く親葉が2枚、対角に小葉が1枚、
 * それぞれの先で渦を巻いて止まる。この順で組むと唐草に見える。
 */
function Fleuron({ x, y, sx, sy, k = 1 }: { x: number; y: number; sx: number; sy: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${sx * k} ${sy * k})`}>
      {/* 親葉。上辺と左辺へ。角で交わらせて一体に見せる */}
      <path d="M4 4 C 42 2 74 12 102 34 C 70 34 40 26 18 14 C 12 11 7 8 4 4 Z" fill={INK} />
      <path d="M4 4 C 2 42 12 74 34 102 C 34 70 26 40 14 18 C 11 12 8 7 4 4 Z" fill={INK} />
      {/* 金の内葉。二色刷りの縁取り。ずらして重ねるのがこの時代の作法 */}
      <path d="M11 11 C 42 11 68 21 90 39 C 65 37 41 29 23 19 Z" fill={GOLD} />
      <path d="M11 11 C 11 42 21 68 39 90 C 37 65 29 41 19 23 Z" fill={GOLD} />
      {/* 対角の小葉 */}
      <path d="M15 15 C 38 27 56 45 68 70 C 47 60 29 43 17 23 Z" fill={GREEN} />
      {/* 渦。三つの葉先すべてで巻いて止める */}
      <g fill="none" strokeLinecap="round">
        <path d="M102 34 C 119 37 122 54 109 60 C 98 65 89 56 96 48 C 101 43 108 47 106 53" stroke={INK} strokeWidth="3" />
        <path d="M34 102 C 37 119 54 122 60 109 C 65 98 56 89 48 96 C 43 101 47 108 53 106" stroke={INK} strokeWidth="3" />
        <path d="M68 70 C 84 77 84 92 72 95 C 62 97 57 88 64 83" stroke={GREEN} strokeWidth="2.4" />
        {/* 髭。細い線を1本添えると彫りに見える */}
        <path d="M20 20 C 46 30 66 48 78 74" stroke={INK} strokeWidth="1" opacity="0.5" />
      </g>
      {/* 角の座金。親葉2枚の合わせ目が尖って紙飛行機に見えたので、
          扇形の座で受けて隠す。彫金の角飾りはたいていこの形をしている */}
      <path d="M2 2 L2 40 A38 38 0 0 0 40 2 Z" fill={INK} />
      <path d="M2 2 L2 30 A28 28 0 0 0 30 2 Z" fill={RED} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = ((i + 0.5) / 5) * (Math.PI / 2);
        return <line key={i} x1="2" y1="2" x2={2 + Math.cos(a) * 30} y2={2 + Math.sin(a) * 30} stroke={GOLD} strokeWidth="1.4" />;
      })}
      <path d="M2 2 L2 14 A12 12 0 0 0 14 2 Z" fill={GOLD} />
      {/* 実。三つ */}
      <circle cx="9" cy="40" r="3.4" fill={RED} />
      <circle cx="40" cy="9" r="3.4" fill={RED} />
      <circle cx="27" cy="27" r="2.6" fill={INK} />
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
        <Fleuron x={64} y={736} sx={1} sy={-1} k={0.78} />
        <Fleuron x={536} y={736} sx={-1} sy={-1} k={0.78} />

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
        {/* アーチの起拱点に持ち送り。さらに台輪で受ける。
            初稿は金の面が宙に浮いて、盾を吊るしたように見えた */}
        {[154, 446].map((x, i) => (
          <g key={i}>
            <rect x={x - 12} y="308" width="24" height="10" fill={INK} />
            <rect x={x - 17} y="318" width="34" height="7" fill={RED} />
          </g>
        ))}
        <rect x="118" y="325" width="364" height="9" fill={INK} />
        <rect x="104" y="334" width="392" height="6" fill={RED} />
        <rect x="92" y="340" width="416" height="4" fill={INK} />
        <rect x="92" y="346" width="416" height="1.6" fill={GOLD} />

        {/* ── 題字の積み上げ。行ごとに書体も大きさも変える ────────── */}
        {/* 1行目。ごく小さい大文字、両側に罫 */}
        <line x1="104" y1="374" x2="150" y2="374" stroke={INK} strokeWidth="1.4" />
        <line x1="450" y1="374" x2="496" y2="374" stroke={INK} strokeWidth="1.4" />
        <circle cx="96" cy="374" r="2.6" fill={RED} />
        <circle cx="504" cy="374" r="2.6" fill={RED} />
        <text x="300" y="379" textAnchor="middle" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" letterSpacing="3.6">
          ESTABLISHED MDCCCXXXVII
        </text>

        {/* 2行目。斜体。細く長く */}
        <text x="300" y="412" textAnchor="middle" fill={GREEN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontStyle="italic">
          The Great Exhibition of
        </text>

        {/* 3行目。木活字の3版刷り。金→焦茶→朱の順にずらす */}
        <g fontFamily="Georgia, 'Times New Roman', serif" fontSize="72" fontWeight="700" letterSpacing="1" textAnchor="middle">
          <text x="306" y="486" fill={GOLD}>VICTORIAN</text>
          <text x="303" y="483" fill={shift(INK, -0.1)}>VICTORIAN</text>
          <text x="300" y="480" fill={RED} stroke={INK} strokeWidth="1.4" paintOrder="stroke">
            VICTORIAN
          </text>
        </g>

        {/* 4行目。極端に長体。同じ紙面に別の骨格を混ぜるのがこの様式 */}
        <text
          x="300" y="516" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" fontWeight="700" letterSpacing="2"
          transform="translate(0 -516) scale(1 1) translate(0 516)"
          style={{ transformOrigin: "300px 516px" }}
        >
          <tspan>ORNAMENT · TYPE · MACHINE</tspan>
        </text>

        {/* 飾り罫。菱形を挟んだ両振り */}
        <g>
          <line x1="96" y1="536" x2="276" y2="536" stroke={INK} strokeWidth="2.6" />
          <line x1="324" y1="536" x2="504" y2="536" stroke={INK} strokeWidth="2.6" />
          <line x1="96" y1="541" x2="276" y2="541" stroke={GOLD} strokeWidth="1" />
          <line x1="324" y1="541" x2="504" y2="541" stroke={GOLD} strokeWidth="1" />
          <path d="M300 526 L312 536 L300 546 L288 536 Z" fill={RED} stroke={INK} strokeWidth="1.2" />
          <circle cx="282" cy="536" r="2.4" fill={INK} />
          <circle cx="318" cy="536" r="2.4" fill={INK} />
        </g>

        {/* ── ギヨシェの帯。紙幣の縁。近くで見るともう一つの細部 ──── */}
        <g fill="none">
          <path d={guillocheBand(96, 504, 570, 11, 13, 0)} stroke={GOLD} strokeWidth="1.1" />
          <path d={guillocheBand(96, 504, 570, 11, 13, Math.PI)} stroke={GOLD} strokeWidth="1.1" />
          <path d={guillocheBand(96, 504, 570, 6.5, 13, Math.PI / 2)} stroke={RED} strokeWidth="0.8" opacity="0.75" />
          <path d={guillocheBand(96, 504, 570, 6.5, 13, -Math.PI / 2)} stroke={RED} strokeWidth="0.8" opacity="0.75" />
        </g>
        <line x1="96" y1="588" x2="504" y2="588" stroke={INK} strokeWidth="1" />

        {/* ── 小さな字の塊。詰めるのがこの様式の作法 ───────────── */}
        <text x="300" y="612" textAnchor="middle" fill={INK} fontFamily="Georgia, 'Times New Roman', serif" fontSize="12" letterSpacing="0.4">
          Engraved &amp; Printed by <tspan fontStyle="italic">Messrs. Whitworth &amp; Sons</tspan>, Ludgate Hill
        </text>
        <text x="300" y="630" textAnchor="middle" fill={GREEN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" letterSpacing="1.4">
          CHROMOLITHOGRAPHY · WOOD TYPE · GUILLOCHE ENGRAVING
        </text>

        {/* ── 印刷屋の花。活字の飾りを一列 ───────────────────── */}
        <g transform="translate(300 668)">
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
          d="M148 692 L452 692 L452 720 L148 720 Z"
          fill={RED}
          stroke={INK}
          strokeWidth="1.6"
        />
        <path d="M126 698 L148 692 L148 720 L126 726 Z" fill={shift(RED, -0.3)} stroke={INK} strokeWidth="1.4" />
        <path d="M474 698 L452 692 L452 720 L474 726 Z" fill={shift(RED, -0.3)} stroke={INK} strokeWidth="1.4" />
        <text x="300" y="711" textAnchor="middle" fill={PAPER} fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" letterSpacing="7">
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
