/**
 * ジャポニスム。
 *
 * 浮世絵そのものではなく、19世紀後半の西洋がそれを翻案した版画。
 * ホイッスラーやブラックモンが、日本の版画から何を取ったかを1枚にする。
 *
 * ■ 西洋が持ち帰ったのは「描き方」ではなく「画面の作り方」だった
 *   1. 断ち切り。主題を額で平気で切る。
 *      枝は左上の角の外から入り、陽は右の縁で切れている。
 *      西洋の額縁絵は主題を中に納めるので、これだけで異国に見えた。
 *   2. 大きな余白。画面の左半分をほぼ空けてある。
 *      構図の重心を対角へ寄せ、空いた側を「何も無い」まま残す。
 *   3. 平らな色面。陰影を付けない。輪郭線（主版）で形を決め、
 *      その中を一色で埋める。だからグラデーションは暈し（ぼかし）
 *      ——摺師が版木の上で絵具を拭き取って作る一方向の階調——だけ。
 *      水面の帯にだけそれを使っている。
 *   4. 短冊と落款。題字を縦の枠に入れ、朱の印を押す。
 *      西洋の画家は意味の分からないまま、この二つを真似た。
 *      だからここの印も、漢字ではなく幾何の刻みにしてある。
 */
import { ATLAS, rand, shift, alpha } from "@/lib/plate";

const P = "jp";
const PAPER = "#efe7d6";
const INDIGO = "#1f4e5f";
const VERM = "#c0432c";
const GOLD = "#d8a13a";
const SUMI = "#2a2420";

/**
 * 波。ここで二度失敗した。
 * 一度目は三日月、二度目は白い饅頭。どちらも「塊」として描いたからで、
 * 平らな色面だけで組む様式に、陰影を持った塊は最初から入らない。
 * 浮世絵の水は、地の色面に線を何本か引いて表す。それだけでいい。
 * だから泡の渦も、同心の弧を数本ならべた「櫛」で作っている。
 */
function Foam({ x, y, s, flip = 1 }: { x: number; y: number; s: number; flip?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`} fill="none" stroke={PAPER} strokeLinecap="round">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${-46 + i * 10} 0 C ${-46 + i * 10} ${-30 + i * 5} ${2 - i * 3} ${-46 + i * 8} ${40 - i * 9} ${-24 + i * 5}`}
          strokeWidth={3.2 - i * 0.45}
          opacity={1 - i * 0.1}
        />
      ))}
      <path d="M-58 2 C -34 -6 30 -6 54 2" strokeWidth="2.6" />
    </g>
  );
}

/** 梅の花。5弁、平ら。陰影は付けない */
function Blossom({ x, y, r, rot, open = true, seed }: { x: number; y: number; r: number; rot: number; open?: boolean; seed: number }) {
  const rr = rand(seed);
  if (!open) {
    // 待ち針に見えたので、萼をつけて蕾の形にした
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 12})`}>
        <path d="M0 10 L0 2" stroke={SUMI} strokeWidth="2" />
        <path d="M0 2 C -8 -1 -11 -11 -7 -18 C -3 -24 3 -24 7 -18 C 11 -11 8 -1 0 2 Z" fill={PAPER} stroke={SUMI} strokeWidth="1.6" />
        <path d="M0 -1 C -5 -4 -7 -12 -4 -18 C -1 -22 3 -21 5 -16 C 8 -9 5 -2 0 -1 Z" fill={VERM} />
        <path d="M-7 3 C -10 -3 -4 -5 0 -2 C 4 -5 10 -3 7 3 C 4 6 -4 6 -7 3 Z" fill={SUMI} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          cx={Math.sin((i / 5) * Math.PI * 2) * r * 0.62}
          cy={-Math.cos((i / 5) * Math.PI * 2) * r * 0.62}
          r={r * 0.46 * rr(0.94, 1.06)}
          fill={PAPER}
          stroke={SUMI}
          strokeWidth="1.5"
        />
      ))}
      <circle r={r * 0.3} fill={VERM} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3;
        return (
          <g key={i}>
            <line x1="0" y1="0" x2={Math.sin(a) * r * 0.52} y2={-Math.cos(a) * r * 0.52} stroke={GOLD} strokeWidth="1.1" />
            <circle cx={Math.sin(a) * r * 0.54} cy={-Math.cos(a) * r * 0.54} r={r * 0.09} fill={GOLD} />
          </g>
        );
      })}
    </g>
  );
}

/* 枝。左上の外から入り、右下へ抜ける。太い所から細い所へ順に引く */
const BRANCH: { d: string; w: number }[] = [
  { d: "M8 44 C 84 96 156 156 214 236", w: 17 },
  { d: "M214 236 C 254 292 288 350 306 412", w: 11 },
  { d: "M306 412 C 318 456 320 492 314 524", w: 6 },
  { d: "M150 160 C 202 150 252 164 292 198", w: 9 },
  { d: "M292 198 C 322 224 344 250 356 278", w: 5 },
  { d: "M232 262 C 232 214 214 172 182 142", w: 6.5 },
  { d: "M276 356 C 322 340 366 344 400 366", w: 7 },
  { d: "M400 366 C 424 382 440 400 448 420", w: 4 },
  { d: "M96 108 C 92 148 100 186 122 216", w: 5 },
];

export default function Plate() {
  const r = rand(1888);
  const TITLE = "JAPONISME".split("");

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ジャポニスム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-field`}>
          <rect x="30" y="30" width="540" height="740" />
        </clipPath>
        {/* 暈し。摺師が版木の上で絵具を拭いて作る一方向の階調 */}
        <linearGradient id={`${P}-bokashi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={alpha(INDIGO, 0)} />
          <stop offset="22%" stopColor={alpha(INDIGO, 0.55)} />
          <stop offset="58%" stopColor={INDIGO} />
          <stop offset="100%" stopColor={shift(INDIGO, -0.4)} />
        </linearGradient>
        <linearGradient id={`${P}-bokashiTop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={alpha(INDIGO, 0.42)} />
          <stop offset="100%" stopColor={alpha(INDIGO, 0)} />
        </linearGradient>
        {/* 青海波。着物の文様をそのまま水面に敷く */}
        <pattern id={`${P}-nami`} width="44" height="22" patternUnits="userSpaceOnUse">
          {[22, 16, 10, 4].map((rr, i) => (
            <g key={i} fill="none" stroke={alpha(PAPER, 0.42)} strokeWidth="1.3">
              <path d={`M${22 - rr} 22 A${rr} ${rr} 0 0 1 ${22 + rr} 22`} />
              <path d={`M${-rr} 0 A${rr} ${rr} 0 0 1 ${rr} 0`} />
              <path d={`M${44 - rr} 0 A${rr} ${rr} 0 0 1 ${44 + rr} 0`} />
            </g>
          ))}
        </pattern>
        {/* 麻の葉。短冊の地に薄く */}
        <pattern id={`${P}-asa`} width="30" height="52" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={alpha(SUMI, 0.28)} strokeWidth="0.8">
            <path d="M15 0 L0 8.7 L0 26 L15 34.6 L30 26 L30 8.7 Z" />
            <path d="M15 0 L15 34.6 M0 8.7 L30 26 M30 8.7 L0 26" />
          </g>
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        <g clipPath={`url(#${P}-field)`}>
          {/* ── 陽。右の縁で断ち切る。中に納めない ─────────────── */}
          <circle cx="452" cy="222" r="156" fill={VERM} />
          {/* 陽の中の淡い輪。一色ベタの中に1本だけ線を入れて版画に見せる */}
          <circle cx="452" cy="222" r="132" fill="none" stroke={alpha(GOLD, 0.5)} strokeWidth="2" />
          {/* 空の暈し。上端だけ薄く藍を掛ける */}
          <rect x="30" y="30" width="540" height="180" fill={`url(#${P}-bokashiTop)`} />

          {/* ── 水。暈しと青海波、そして波頭 ───────────────────── */}
          <path d="M30 596 C 140 566 260 604 360 588 C 452 574 522 592 570 578 L570 770 L30 770 Z" fill={`url(#${P}-bokashi)`} />
          <path d="M30 596 C 140 566 260 604 360 588 C 452 574 522 592 570 578 L570 770 L30 770 Z" fill={`url(#${P}-nami)`} opacity="0.7" />
          <path d="M30 596 C 140 566 260 604 360 588 C 452 574 522 592 570 578" fill="none" stroke={SUMI} strokeWidth="2" />
          {/* 流れ。長い一本線を数本。これだけで水になる */}
          <g fill="none" stroke={PAPER} strokeLinecap="round">
            {[
              { y: 628, o: 0.75, w: 2.4, a: 10 },
              { y: 664, o: 0.6, w: 2, a: 14 },
              { y: 700, o: 0.45, w: 1.7, a: 11 },
              { y: 734, o: 0.32, w: 1.5, a: 16 },
            ].map((L, i) => (
              <path
                key={i}
                d={`M20 ${L.y} C 130 ${L.y - L.a} 190 ${L.y + L.a} 300 ${L.y} C 410 ${L.y - L.a} 470 ${L.y + L.a} 580 ${L.y}`}
                strokeWidth={L.w}
                opacity={L.o}
              />
            ))}
          </g>
          <Foam x={148} y={648} s={0.9} />
          <Foam x={430} y={690} s={1.1} flip={-1} />
          <Foam x={286} y={738} s={0.66} />
          {/* 飛沫。点を散らす。近くで見たときの細部その1 */}
          <g fill={PAPER}>
            {Array.from({ length: 34 }, (_, i) => (
              <circle key={i} cx={r(40, 560)} cy={r(600, 760)} r={r(1, 3.4)} opacity={r(0.35, 0.9)} />
            ))}
          </g>

          {/* ── 枝。左上の外から入れる。太→細の順に引く ────────────── */}
          <g fill="none" stroke={SUMI} strokeLinecap="round">
            {BRANCH.map((b, i) => (
              <path key={i} d={b.d} strokeWidth={b.w} />
            ))}
          </g>
          {/* 幹の肌。梅は瘤と裂けが出る */}
          <g fill="none" stroke={alpha(PAPER, 0.26)} strokeWidth="1.2">
            <path d="M28 58 C 96 106 158 162 208 232" />
            <path d="M220 246 C 254 296 282 348 298 402" />
          </g>
          <g fill={SUMI}>
            {[[74, 88], [146, 152], [212, 234], [270, 322], [300, 400], [330, 344]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx={7 - i * 0.5} ry={5 - i * 0.3} transform={`rotate(${i * 34} ${x} ${y})`} />
            ))}
          </g>

          {/* 花。枝の先と分岐に。数を絞って余白を残す */}
          <Blossom x={314} y={528} r={26} rot={12} seed={3} />
          <Blossom x={356} y={280} r={22} rot={-24} seed={9} />
          <Blossom x={448} y={422} r={24} rot={38} seed={15} />
          <Blossom x={182} y={140} r={20} rot={6} seed={21} />
          <Blossom x={122} y={218} r={17} rot={-16} seed={27} />
          <Blossom x={400} y={366} r={15} rot={22} seed={33} />
          <Blossom x={252} y={190} r={13} rot={-8} seed={39} />
          <Blossom x={276} y={356} r={12} rot={30} open={false} seed={45} />
          <Blossom x={232} y={262} r={11} rot={-40} open={false} seed={51} />

          {/* ── 短冊。題字を縦の枠に入れる ─────────────────────── */}
          <g>
            <rect x="58" y="306" width="56" height="284" fill={PAPER} stroke={SUMI} strokeWidth="2.4" />
            <rect x="58" y="306" width="56" height="284" fill={`url(#${P}-asa)`} opacity="0.6" />
            <rect x="64" y="312" width="44" height="272" fill="none" stroke={SUMI} strokeWidth="0.9" />
            <rect x="58" y="306" width="56" height="16" fill={INDIGO} />
            <rect x="58" y="574" width="56" height="16" fill={INDIGO} />
            {TITLE.map((ch, i) => (
              <text
                key={i}
                x="86"
                y={348 + i * 27}
                textAnchor="middle"
                fill={SUMI}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="21"
              >
                {ch}
              </text>
            ))}
          </g>

          {/* ── 落款。朱の四角。漢字ではなく幾何の刻み ───────────── */}
          <g transform="translate(78 626)">
            <rect width="52" height="52" fill={VERM} />
            <g fill={PAPER}>
              <rect x="8" y="8" width="36" height="4" />
              <rect x="8" y="8" width="4" height="36" />
              <rect x="8" y="40" width="36" height="4" />
              <rect x="18" y="18" width="16" height="4" />
              <rect x="18" y="18" width="4" height="16" />
              <rect x="30" y="26" width="4" height="12" />
              <rect x="38" y="16" width="4" height="20" />
            </g>
          </g>

          {/* 銘。水の上に生成りで。西洋の版元名を真似た体 */}
          <text
            x="556" y="744" textAnchor="end" fill={PAPER}
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" letterSpacing="3.6"
          >
            ESTAMPE JAPONISANTE
          </text>
          <text
            x="556" y="760" textAnchor="end" fill={alpha(PAPER, 0.8)}
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.4" letterSpacing="3" fontStyle="italic"
          >
            Paris · MDCCCLXXXVIII
          </text>
        </g>

        {/* ── 額。細い罫二重。浮世絵の版面にも枠がある ───────────── */}
        <rect x="20" y="20" width="560" height="760" fill="none" stroke={SUMI} strokeWidth="2.4" />
        <rect x="30" y="30" width="540" height="740" fill="none" stroke={SUMI} strokeWidth="1" />

        {/* 和紙の繊維。摺りの地は必ず紙が見える */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
