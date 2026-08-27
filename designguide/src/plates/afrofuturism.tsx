/**
 * アフロフューチャリズム。
 *
 * サン・ラーの盤面、パーラメントの見開き、オクテイヴィア・バトラーの装丁。
 * 「アフリカの文様」と「宇宙」を並べるのではなく、
 * 同じ幾何の言葉で書き直す、というのがこの様式の中身である。
 *
 * ■ ここで作っている「らしさ」
 *   1. 円環。ケンテの帯もアディンクラも、太陽も惑星も、
 *      同じ「同心の環」で書ける。だから背後の惑星は
 *      色面ではなく、模様の環を9本重ねて組んだ。
 *      環ごとに単位（破線・三角・折れ線・点）を変えると、
 *      遠目には惑星、近寄ると織物になる。ここがこの図版の要。
 *   2. 横顔。正面ではなく側面。仮面と星図の伝統がどちらも側面を使う。
 *      冠は放射する棘。太陽のコロナと冠を同じ形で描く。
 *   3. 金・青緑・朱。土の色ではなく、鉱物と炎の色を使う。
 *      地は黒ではなく藍。完全な黒に落とすと宇宙が平らになる。
 *   4. 星は等間隔にしない。等間隔の点は「柄」であって星空ではない。
 *
 * ■ 検分で直したこと（重要）
 *   初稿は横顔を地の生成色（#f4e9d8）で抜いていた。
 *   影絵のつもりでも、黒人の未来を描く様式で肌が生成色に見えるのは
 *   端的に間違いである。肌は褐色（SKIN）に置き換え、
 *   背後の太陽からの逆光を金の縁取りで入れて、遠目の抜けを確保した。
 *   生成色は衣に移し、縮小したときの塊は衣が受け持つ。
 *   横顔も鼻梁と唇を作り直した（初稿は西洋の側面線だった）。
 *   肩の布は4段→2段に減らした。下のケンテ帯と二重に効いて、
 *   「アフリカ柄の見本帳」に寄っていたため。
 *   ケンテ帯そのものは残す。実在の織（経糸の帯に緯を打つ）を
 *   構造ごと書いているので、これは異国趣味の飾りではない。
 */
import { ATLAS, rand, onCircle } from "@/lib/plate";

const P = "afr";
const NIGHT = "#0d0a1f";
const GOLD = "#f2b705";
const TEAL = "#00c2a8";
const RED = "#e8452a";
const CREAM = "#f4e9d8";
const DEEP = "#161230"; // 惑星の内側。地よりわずかに明るい藍
/* 肌。5色の軸から外へ出した3色。朱(#e8452a)と藍(#0d0a1f)のあいだに置いて、
   版面の色相からは離れないようにしてある */
const SKIN = "#6f3c1f";      // 頬。主
const SKIN_DK = "#3d1f10";   // 髪の巻き・影
const SKIN_LT = "#96552c";   // 逆光側のわずかな起こし

const DX = 302; // 惑星の中心
const DY = 330;

/** 円周上に折れ線を回す。ジグザグの環 */
function zigRing(cx: number, cy: number, r: number, amp: number, n: number) {
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => {
    const a = (i / (n * 2)) * 360;
    const rr = r + (i % 2 ? amp : -amp);
    return onCircle(cx, cy, rr, a);
  });
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")}`;
}

/** 円周に単位を並べる。三角・菱形など */
function ring<T>(cx: number, cy: number, r: number, n: number, fn: (x: number, y: number, deg: number, i: number) => T) {
  return Array.from({ length: n }, (_, i) => {
    const deg = (i / n) * 360;
    const [x, y] = onCircle(cx, cy, r, deg);
    return fn(x, y, deg, i);
  });
}

/** アディンクラ風の記号。星座の印として置く */
const SIGNS = [
  // 同心（アディンクラヘネ）
  <g key="a"><circle r="13" fill="none" strokeWidth="2.2" /><circle r="8" fill="none" strokeWidth="2.2" /><circle r="3.4" fill="none" strokeWidth="2.2" /></g>,
  // 折れ（ンキンキン）
  <g key="b"><path d="M -14,8 L -7,-8 L 0,8 L 7,-8 L 14,8" fill="none" strokeWidth="2.6" strokeLinejoin="round" /></g>,
  // 星（ンソロンマ）
  <g key="c"><path d="M 0,-15 L 4,-4 L 15,0 L 4,4 L 0,15 L -4,4 L -15,0 L -4,-4 Z" strokeWidth="1.6" /></g>,
  // 櫛（ドゥアフェ）
  <g key="d"><rect x="-12" y="2" width="24" height="4.5" /><rect x="-11" y="-13" width="3.6" height="15" /><rect x="-2" y="-13" width="3.6" height="15" /><rect x="7" y="-13" width="3.6" height="15" /></g>,
];

export default function Plate() {
  const r = rand(19740512);

  /* 星。等間隔にしない。密度も場所で変える */
  const stars = Array.from({ length: 130 }, () => {
    const x = r(0, 600);
    const y = r(0, 800);
    const d = Math.hypot(x - DX, (y - DY) * 0.9);
    return { x, y, s: r(0.7, 2.4), big: r() > 0.9, dim: d < 220 };
  }).filter((s) => !s.dim || r() > 0.55);

  /* ケンテの帯。縦の経糸ごとに緯の配色を変える */
  const KENTE_Y = 620;
  const KENTE_H = 66;
  const strips = Array.from({ length: 24 }, (_, i) => {
    const base = i % 2 ? [GOLD, NIGHT, RED, NIGHT, GOLD] : [TEAL, NIGHT, CREAM, NIGHT, TEAL];
    const rows = Array.from({ length: 7 }, (_, k) => base[(k + i) % base.length]);
    return { x: 25 * i, rows };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アフロフューチャリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-kente`}><rect x="0" y={KENTE_Y} width="600" height={KENTE_H} /></clipPath>
        {/* 惑星の内。地よりわずかに明るい藍。真っ黒に落とすと宇宙が平らになる */}
        <radialGradient id={`${P}-core`} cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#241b4a" />
          <stop offset="0.7" stopColor={DEEP} />
          <stop offset="1" stopColor="#0a0818" />
        </radialGradient>
        <radialGradient id={`${P}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor={GOLD} stopOpacity="0.24" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={NIGHT} />
        <rect x={DX - 320} y={DY - 320} width="640" height="640" fill={`url(#${P}-halo)`} />

        {/* 星 */}
        <g fill={CREAM}>
          {stars.map((s, i) =>
            s.big ? (
              <path
                key={i}
                d={`M ${s.x},${s.y - 6} L ${s.x + 1.4},${s.y - 1.4} L ${s.x + 6},${s.y} L ${s.x + 1.4},${s.y + 1.4} L ${s.x},${s.y + 6} L ${s.x - 1.4},${s.y + 1.4} L ${s.x - 6},${s.y} L ${s.x - 1.4},${s.y - 1.4} Z`}
                opacity="0.9"
              />
            ) : (
              <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={0.35 + (i % 4) * 0.16} />
            ),
          )}
        </g>

        {/* ── 惑星。模様の環を重ねて組む ─────────────────────────── */}
        {/* 外へ抜ける光条。長短を交互に */}
        <g>
          {ring(DX, DY, 224, 60, (x, y, deg, i) => {
            const [x2, y2] = onCircle(DX, DY, 224 + (i % 2 ? 34 : 16), deg);
            return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke={i % 4 === 0 ? RED : GOLD} strokeWidth={i % 2 ? 1.4 : 2.6} opacity={i % 2 ? 0.55 : 0.9} />;
          })}
        </g>
        {/* 外環の三角。外へ向く */}
        <g fill={GOLD}>
          {ring(DX, DY, 210, 40, (x, y, deg, i) => (
            <polygon key={i} points="-6,0 6,0 0,-13" transform={`translate(${x} ${y}) rotate(${deg})`} opacity={i % 2 ? 1 : 0.5} />
          ))}
        </g>
        <circle cx={DX} cy={DY} r="200" fill="none" stroke={GOLD} strokeWidth="9" strokeDasharray="20 11" />
        <circle cx={DX} cy={DY} r="200" fill="none" stroke={NIGHT} strokeWidth="1.6" />
        <circle cx={DX} cy={DY} r="188" fill="none" stroke={TEAL} strokeWidth="2.4" />
        <path d={zigRing(DX, DY, 178, 7, 46)} fill="none" stroke={CREAM} strokeWidth="1.8" opacity="0.9" />
        <circle cx={DX} cy={DY} r="164" fill="none" stroke={RED} strokeWidth="13" strokeDasharray="3.5 14" strokeLinecap="round" />
        <circle cx={DX} cy={DY} r="152" fill="none" stroke={GOLD} strokeWidth="1.6" />
        {/* 菱の環。織物の単位 */}
        <g fill={TEAL}>
          {ring(DX, DY, 143, 34, (x, y, deg, i) => (
            <polygon key={i} points="0,-7 6,0 0,7 -6,0" transform={`translate(${x} ${y}) rotate(${deg})`} opacity={i % 2 ? 1 : 0.45} />
          ))}
        </g>
        <circle cx={DX} cy={DY} r="132" fill={`url(#${P}-core)`} stroke={GOLD} strokeWidth="2.6" />
        {/* 内側にもう一段。近寄ったときの取っ掛かり */}
        <circle cx={DX} cy={DY} r="122" fill="none" stroke={CREAM} strokeWidth="1" strokeDasharray="2 7" opacity="0.55" />

        {/* ── 横顔。冠は太陽のコロナと同じ形 ─────────────────────── */}
        <g transform={`translate(292 372) scale(1.16)`}>
          {/* 冠の棘。頭の後ろから前へ、高さを変えて扇に開く */}
          <g fill={GOLD}>
            {Array.from({ length: 11 }, (_, i) => {
              const t = (i - 5) / 5;
              const bx = 8 + t * 46;
              const by = -118 + Math.abs(t) * 22;
              const h = 74 - Math.abs(t) * 26;
              const lean = t * 20;
              return (
                <polygon
                  key={i}
                  points={`${bx - 8},${by} ${bx + 8},${by} ${bx + lean},${by - h}`}
                  opacity={i % 2 ? 1 : 0.78}
                />
              );
            })}
            {/* 冠の中心。円盤を掲げる */}
            <circle cx="8" cy="-206" r="15" />
            <circle cx="8" cy="-206" r="15" fill="none" stroke={NIGHT} strokeWidth="3" />
            <circle cx="8" cy="-206" r="7" fill={RED} />
          </g>

          {/* 髪。冠の下に巻き毛を回す。地肌がそのまま出ていると仮面に見えて、
              人（人格）に見えない。ここは省略してはいけない部分 */}
          <g fill={SKIN_DK}>
            {Array.from({ length: 22 }, (_, i) => {
              const a = -1.30 + (i / 21) * 3.16;   // 生え際から後頭、うなじまで回す
              const rr = 62 - Math.abs(i - 9) * 0.55;
              return <circle key={i} cx={6 + Math.sin(a) * rr} cy={-58 - Math.cos(a) * rr * 1.04} r="9.8" />;
            })}
          </g>

          {/* 衣。生成色はここに置く。縮小したときの塊は顔ではなく衣が受け持つ */}
          <path
            d="M -10,70 C -26,84 -72,100 -112,116 C -136,127 -150,146 -150,172
               L -150,232 L 150,232 L 150,172
               C 150,146 136,127 112,116 C 76,100 54,84 50,70 Z"
            fill={CREAM}
          />

          {/* 顔。褐色の側面。鼻梁を出し、唇に厚みを付け直した */}
          <path
            d="M 10,-122 C -14,-122 -38,-108 -50,-86 C -56,-74 -58,-64 -60,-54
               C -61,-48 -58,-44 -61,-40 C -66,-34 -80,-26 -82,-20
               C -83,-15 -76,-12 -70,-13 C -66,-13 -70,-7 -71,-3
               C -72,1 -66,2 -63,1 C -60,0 -68,7 -69,12
               C -70,18 -63,22 -57,23 C -50,26 -41,31 -34,36
               C -26,44 -16,48 -8,50 C -7,60 -7,68 -10,76
               L 50,76 C 47,58 46,40 48,22
               C 54,-2 66,-24 66,-52 C 66,-84 44,-112 10,-122 Z"
            fill={SKIN}
          />
          {/* 頬骨。起こす面は1つだけ。多くすると彫刻になる。
              輪郭に沿わせないと、ただの染みに見える */}
          <path d="M -50,-30 C -34,-22 -24,-2 -30,22 C -38,30 -46,20 -50,4 Z"
                fill={SKIN_LT} opacity="0.34" />
          {/* 逆光。太陽は背後にある。褐色は藍地に沈むので、
              この金の一本が縮小時の可読性をぜんぶ持っている */}
          <path
            d="M 10,-122 C -14,-122 -38,-108 -50,-86 C -56,-74 -58,-64 -60,-54
               C -61,-48 -58,-44 -61,-40 C -66,-34 -80,-26 -82,-20
               C -83,-15 -76,-12 -70,-13 C -66,-13 -70,-7 -71,-3
               C -72,1 -66,2 -63,1 C -60,0 -68,7 -69,12
               C -70,18 -63,22 -57,23 C -50,26 -41,31 -34,36
               C -26,44 -16,48 -8,50"
            fill="none" stroke={GOLD} strokeWidth="3.4" strokeLinecap="round" opacity="0.95"
          />
          {/* 目。白目を生成色で抜く。褐色の面にそのまま黒を置くと穴になる。
              白目を出しすぎると驚いた顔になるので、上瞼を深く落とす */}
          <path d="M -46,-37 C -39,-43 -26,-43 -20,-37 C -26,-31 -39,-31 -46,-37 Z" fill={CREAM} />
          <circle cx="-33" cy="-36.5" r="4.4" fill={GOLD} />
          <circle cx="-33" cy="-36.5" r="1.9" fill={SKIN_DK} />
          <path d="M -46,-37 C -39,-44 -26,-44 -20,-37" fill="none" stroke={SKIN_DK} strokeWidth="3" strokeLinecap="round" />
          <path d="M -50,-48 C -40,-56 -24,-55 -17,-48" fill="none" stroke={SKIN_DK} strokeWidth="3" strokeLinecap="round" />
          {/* 小鼻と口の合わせ */}
          <path d="M -69,-15 C -63,-12 -57,-13 -53,-17" fill="none" stroke={SKIN_DK} strokeWidth="2" strokeLinecap="round" />
          <path d="M -68,1 C -60,4 -52,4 -46,1" fill="none" stroke={SKIN_DK} strokeWidth="2.4" strokeLinecap="round" />
          {/* 耳 */}
          <path d="M 12,-24 C 24,-30 34,-22 32,-8 C 30,2 20,6 14,2" fill="none" stroke={SKIN_DK} strokeWidth="2.6" />
          {/* 耳飾り。金の環と朱の玉 */}
          <circle cx="22" cy="14" r="10" fill="none" stroke={GOLD} strokeWidth="4" />
          <circle cx="22" cy="28" r="5" fill={RED} />
          {/* 額の帯。生え際に沿わせる。短すぎると髪留めに見えたので、
              巻き毛の際までは伸ばす */}
          <path d="M -52,-84 C -36,-102 -12,-113 14,-113 L 16,-102 C -8,-101 -30,-91 -46,-76 Z" fill={GOLD} />
          <g fill={NIGHT}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = -0.95 + (i / 6) * 0.86;
              return <circle key={i} cx={4 + Math.sin(a) * 58} cy={-90 - Math.cos(a) * 16} r="2.6" />;
            })}
          </g>
          {/* 首飾り。環を3本重ねると「民族衣装の首輪」に読まれる。
              分節した金の襟にして、機械の側へ寄せた */}
          <g>
            <path d="M -12,56 C 2,66 26,68 46,62" fill="none" stroke={GOLD} strokeWidth="4.5" />
            <path d="M -14,68 C 1,79 27,81 48,74" fill="none" stroke={GOLD} strokeWidth="1.8" opacity="0.8" />
            {Array.from({ length: 7 }, (_, i) => {
              const t = i / 6;
              return (
                <rect key={i} x={-8 + t * 50 - 2.6} y={59 + Math.sin(t * Math.PI) * 4 + t * 2}
                      width="5.2" height="9" rx="1.4" fill={GOLD} opacity={i % 2 ? 1 : 0.6} />
              );
            })}
          </g>
          {/* 肩の布。段は4本→2本。下のケンテ帯と二重に効いて
              「アフリカ柄の見本帳」に寄っていた */}
          <rect x="-150" y="126" width="300" height="6" fill={RED} />
          <g fill={TEAL}>
            {Array.from({ length: 13 }, (_, i) => (
              <polygon key={i} points="0,0 22,0 11,22" transform={`translate(${-146 + i * 23} 140)`} opacity={i % 2 ? 1 : 0.55} />
            ))}
          </g>
          <rect x="-150" y="176" width="300" height="4.5" fill={GOLD} />
          <rect x="-150" y="226" width="300" height="3" fill={RED} opacity="0.8" />
          {/* 織り目。無地のままだと衣が板になる。経糸の縦線も入れて、
              下のケンテ帯と同じ織り方であることを見せる */}
          <g stroke={SKIN} opacity="0.2">
            <g strokeWidth="0.9">
              {Array.from({ length: 15 }, (_, i) => (
                <line key={i} x1="-150" y1={190 + i * 2.5} x2="150" y2={190 + i * 2.5} />
              ))}
            </g>
            <g strokeWidth="0.7" opacity="0.6">
              {Array.from({ length: 25 }, (_, i) => (
                <line key={i} x1={-146 + i * 12} y1="182" x2={-146 + i * 12} y2="226" />
              ))}
            </g>
          </g>
        </g>

        {/* ── 星座。アディンクラの記号を線でつなぐ ────────────────── */}
        <g stroke={GOLD}>
          <g fill="none" strokeWidth="0.9" opacity="0.45">
            <path d="M 60 118 L 118 76 L 96 168 L 60 118" />
            <path d="M 548 150 L 568 244 L 526 206 Z" />
            <path d="M 54 462 L 86 540" />
            <path d="M 556 480 L 522 552" />
          </g>
          <g fill={GOLD} strokeLinecap="round">
            {[
              { x: 60, y: 118, k: 0, s: 0.8 },
              { x: 118, y: 76, k: 2, s: 0.7 },
              { x: 96, y: 168, k: 1, s: 0.8 },
              { x: 548, y: 150, k: 3, s: 0.8 },
              { x: 568, y: 244, k: 2, s: 0.6 },
              { x: 526, y: 206, k: 1, s: 0.6 },
              { x: 54, y: 462, k: 2, s: 0.7 },
              { x: 86, y: 540, k: 0, s: 0.6 },
              { x: 556, y: 480, k: 1, s: 0.7 },
              { x: 522, y: 552, k: 2, s: 0.6 },
            ].map((n, i) => (
              <g key={i} transform={`translate(${n.x} ${n.y}) scale(${n.s})`} stroke={GOLD}>
                {SIGNS[n.k]}
              </g>
            ))}
          </g>
        </g>

        {/* ── ケンテの帯。経糸ごとに緯の配色を変える ────────────── */}
        <g clipPath={`url(#${P}-kente)`}>
          <rect x="0" y={KENTE_Y} width="600" height={KENTE_H} fill={NIGHT} />
          {strips.map((st, i) => (
            <g key={i}>
              {st.rows.map((c, k) => (
                <rect key={k} x={st.x} y={KENTE_Y + k * (KENTE_H / 7)} width="25" height={KENTE_H / 7} fill={c} />
              ))}
              {/* 経糸の境。黒の細い筋 */}
              <rect x={st.x + 23} y={KENTE_Y} width="2" height={KENTE_H} fill={NIGHT} />
              {/* 織りの点。近くで見ると糸が見える */}
              {Array.from({ length: 4 }, (_, k) => (
                <rect key={k} x={st.x + 9} y={KENTE_Y + 8 + k * 18} width="6" height="3" fill={i % 2 ? NIGHT : CREAM} opacity="0.5" />
              ))}
            </g>
          ))}
        </g>
        <g fill={GOLD}>
          <rect x="0" y={KENTE_Y - 6} width="600" height="3.4" />
          <rect x="0" y={KENTE_Y + KENTE_H + 3} width="600" height="3.4" />
        </g>

        {/* ── 文字 ────────────────────────────────────────────── */}
        <text
          x="300" y="738" textAnchor="middle" fill={GOLD}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="41" fontWeight="800" letterSpacing="7.5"
        >
          AFROFUTURISM
        </text>
        <text
          x="300" y="60" textAnchor="middle" fill={TEAL}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="11" fontWeight="700" letterSpacing="7"
        >
          THE SUN IS AN ANCESTOR
        </text>
        <g stroke={TEAL} strokeWidth="1" opacity="0.6">
          <line x1="120" y1="74" x2="480" y2="74" />
        </g>
        <text
          x="300" y="772" textAnchor="middle" fill={CREAM}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10" fontWeight="700" letterSpacing="4.2" opacity="0.72"
        >
          NINE WOVEN RINGS — ONE PROFILE — NO HORIZON
        </text>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.18" style={{ mixBlendMode: "overlay" }} />
      </g>
    </svg>
  );
}
