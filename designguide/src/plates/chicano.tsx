/**
 * チカーノ・アート。
 *
 * 東ロサンゼルスの壁画と、獄中のペン画（パニョ）から出た様式。
 * 図像はグアダルーペの聖母。刷り物より前に、まず「線」の絵である。
 *
 * ■ ここで作っている「らしさ」
 *   1. ファインライン。濃淡を「薄い色」で作らない。細い線の間隔だけで作る。
 *      これがこの様式の一番の技法なので、影は全部「黒い形＋線の伏せ」で
 *      置いた。塗りのグラデーションで陰を付けた瞬間に、これは
 *      チカーノではなくただのイラストになる。
 *   2. 線数を3段だけにする。ボールペン1本で描くので、
 *      線の太さは変わらない。変わるのは間隔だけ。だから伏せは
 *      同じ4px の目に、太さ0.7 / 1.3 / 2.0 の線を通した3枚にした。
 *   3. 正面性。壁画も聖画も左右対称に組む。崩すのは帯と薔薇の側。
 *      対称のままだと図鑑の標本になるので、下半分だけ重心をずらした。
 *   4. 光背。放射する棘は長短を交互に。等長で回すと歯車に見える。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "chi";
const INK = "#1a1a1a";
const RED = "#c8102e";
const GOLD = "#f4a300";
const TEAL = "#0f7b6c";
const CREAM = "#f2e9d8";

/** 光背の中心 */
const CX = 300;
const CY = 330;

/** 8光の星。聖母の外套の紋 */
const star = (r: number) => {
  const a = r * 0.3;
  return `M 0,${-r} L ${a},${-a} L ${r},0 L ${a},${a} L 0,${r} L ${-a},${a} L ${-r},0 L ${-a},${-a} Z`;
};

/** 段のグレカ。メソアメリカの帯 */
const GRECA = "M 0,22 L 0,14 L 6,14 L 6,7 L 12,7 L 12,0 L 18,0 L 18,7 L 24,7 L 24,14 L 30,14 L 30,22 Z";

/** 薔薇。花弁を1枚作って5回まわす */
const PETAL = "M 0,0 C -21,-6 -29,-27 -14,-39 C -4,-46 11,-43 17,-31 C 23,-19 15,-6 0,0 Z";

export default function Plate() {
  const r = rand(19701968);

  /* 光背の棘。長短を交互に。等長で回すと歯車になる */
  const N = 52;
  const rays = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const half = Math.PI / N;
    const k = i % 2 ? 0.8 : 1;
    const inx = 126;
    const iny = 202;
    const ox = 126 + 46 * k;
    const oy = 202 + 40 * k;
    const p = (rx: number, ry: number, ang: number) =>
      `${(CX + Math.sin(ang) * rx).toFixed(1)},${(CY - Math.cos(ang) * ry).toFixed(1)}`;
    return `M ${p(inx, iny, a - half)} L ${p(ox, oy, a)} L ${p(inx, iny, a + half)} Z`;
  });

  /* 外套の襞。肩から裾へ流れる細い線。線が絵を作るので手を抜かない */
  const folds = Array.from({ length: 15 }, (_, i) => {
    const t = (i - 7) / 7;
    const x0 = t * 52;
    const x1 = t * 104;
    const bow = 14 * (1 - Math.abs(t)) * (i % 2 ? 1 : -1);
    return `M ${x0.toFixed(1)},-84 C ${(x0 + bow).toFixed(1)},-20 ${(x1 - bow).toFixed(1)},52 ${x1.toFixed(1)},134`;
  });

  /* 背景の放射線。光背の外へ短く抜ける。密度で遠近を作る */
  const beams = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2 + 0.03;
    const r0 = 176 + r(0, 26);
    const r1 = r0 + r(18, 78);
    return `M ${(CX + Math.sin(a) * r0 * 0.72).toFixed(1)},${(CY - Math.cos(a) * r0 * 1.16).toFixed(1)} L ${(CX + Math.sin(a) * r1 * 0.72).toFixed(1)},${(CY - Math.cos(a) * r1 * 1.16).toFixed(1)}`;
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="チカーノ・アート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 線の伏せ。目は同じ4px。太さだけ3段。ボールペンは太さが変わらない */}
        {[
          ["a", 0.7, -38],
          ["b", 1.3, -38],
          ["c", 2.0, -38],
          ["x", 0.9, 44],
        ].map(([k, w, deg]) => (
          <pattern key={k as string} id={`${P}-h${k}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform={`rotate(${deg})`}>
            <rect width="4" height="4" fill="#000" />
            <rect width="4" height={w as number} fill="#fff" />
          </pattern>
        ))}
        {["a", "b", "c", "x"].map((k) => (
          <mask key={k} id={`${P}-m${k}`} maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800">
            <rect width="600" height="800" fill={`url(#${P}-h${k})`} />
          </mask>
        ))}

        {/* グレカの帯 */}
        <pattern id={`${P}-greca`} width="30" height="22" patternUnits="userSpaceOnUse">
          <path d={GRECA} fill={INK} />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />

        {/* 背景の放射。光背の外へ細く抜ける */}
        <g stroke={INK} strokeWidth="1" opacity="0.42">
          {beams.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* ── 光背 ────────────────────────────────────────────── */}
        <g>
          {rays.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? GOLD : RED} opacity={i % 2 ? 1 : 0.9} />
          ))}
          {/* 棘の根元を1本の線で締める */}
          <ellipse cx={CX} cy={CY} rx="126" ry="202" fill={CREAM} stroke={INK} strokeWidth="2.6" />
          {/* 光背の内。金を線で敷く。ベタで塗ると聖画にならない */}
          <g mask={`url(#${P}-ma)`}>
            <ellipse cx={CX} cy={CY} rx="124" ry="200" fill={GOLD} />
          </g>
          <ellipse cx={CX} cy={CY} rx="114" ry="188" fill="none" stroke={INK} strokeWidth="1" opacity="0.5" />
        </g>

        {/* ── 聖母 ────────────────────────────────────────────── */}
        <g transform={`translate(${CX} ${CY})`}>
          {/* 外套。青緑。輪郭は太く、中は線で締める */}
          <path
            d="M 0,-162 C -46,-160 -72,-126 -76,-84 C -86,-20 -98,60 -106,134 C -70,150 -40,156 0,156 C 40,156 70,150 106,134 C 98,60 86,-20 76,-84 C 72,-126 46,-160 0,-162 Z"
            fill={TEAL}
          />
          {/* 外套の陰。左から光が当たるので右が沈む。線で沈める */}
          <g mask={`url(#${P}-mc)`}>
            <path
              d="M 30,-150 C 62,-134 74,-104 76,-84 C 86,-20 98,60 106,134 C 78,148 52,154 22,156 C 44,90 46,-30 30,-150 Z"
              fill={INK}
            />
          </g>
          <g mask={`url(#${P}-ma)`}>
            <path
              d="M -76,-84 C -86,-20 -98,60 -106,134 C -86,143 -66,149 -46,152 C -58,60 -66,-20 -62,-92 Z"
              fill={INK}
            />
          </g>
          {/* 襞。肩から裾へ。この線が絵の背骨 */}
          <g stroke={INK} strokeWidth="1.1" fill="none" opacity="0.72">
            {folds.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* 外套の縁。金の一本 */}
          <path
            d="M 0,-162 C -46,-160 -72,-126 -76,-84 C -86,-20 -98,60 -106,134"
            fill="none" stroke={GOLD} strokeWidth="5"
          />
          <path
            d="M 0,-162 C 46,-160 72,-126 76,-84 C 86,-20 98,60 106,134"
            fill="none" stroke={GOLD} strokeWidth="5"
          />
          <path
            d="M -106,134 C -70,150 -40,156 0,156 C 40,156 70,150 106,134"
            fill="none" stroke={GOLD} strokeWidth="5"
          />
          {/* 外套の星。8光。左右で数を変えて対称を崩す */}
          <g fill={GOLD}>
            {[
              [-58, -60], [-72, 10], [-84, 76], [-46, 122], [-30, -110],
              [58, -60], [74, 10], [86, 76], [48, 122], [32, -110], [64, 62],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d={star(9)} />
                <path d={star(9)} fill="none" stroke={INK} strokeWidth="0.8" />
              </g>
            ))}
          </g>

          {/* 内衣。薔薇色。金の小花を散らす */}
          <path
            d="M 0,-98 C -32,-96 -46,-70 -48,-40 C -54,20 -60,84 -64,128 C -34,140 -14,144 0,144 C 14,144 34,140 64,128 C 60,84 54,20 48,-40 C 46,-70 32,-96 0,-98 Z"
            fill={RED}
          />
          <g mask={`url(#${P}-mb)`}>
            <path d="M 14,-96 C 40,-84 46,-62 48,-40 C 54,20 60,84 64,128 C 44,136 28,141 14,143 Z" fill={INK} />
          </g>
          <g fill={GOLD} opacity="0.95">
            {[[-24, -50], [22, -22], [-14, 24], [26, 62], [-30, 96], [4, -78]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx="0" cy="-4.6" rx="2.1" ry="4" transform={`rotate(${a})`} />
                ))}
                <circle r="1.7" fill={RED} />
              </g>
            ))}
          </g>
          {/* 内衣の帯。妊婦の帯。図像の要 */}
          <path d="M -50,-16 C -20,-8 20,-8 50,-16 L 50,0 C 20,8 -20,8 -50,0 Z" fill={INK} opacity="0.9" />

          {/* 手。合掌。指の線だけで作る */}
          <g transform="translate(0 -44)">
            <path d="M -2,10 C -16,4 -21,-16 -18,-36 C -16,-48 -9,-58 -2,-62 Z" fill={CREAM} stroke={INK} strokeWidth="1.4" />
            <path d="M 2,10 C 16,4 21,-16 18,-36 C 16,-48 9,-58 2,-62 Z" fill={CREAM} stroke={INK} strokeWidth="1.4" />
            <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.8">
              <path d="M -14,-38 C -10,-44 -6,-50 -4,-56" />
              <path d="M -15,-28 C -10,-36 -6,-44 -3,-50" />
              <path d="M 14,-38 C 10,-44 6,-50 4,-56" />
              <path d="M 15,-28 C 10,-36 6,-44 3,-50" />
            </g>
            {/* 手の陰。線で沈める */}
            <g mask={`url(#${P}-ma)`}>
              <path d="M 4,8 C 16,2 21,-16 18,-36 C 16,-48 10,-57 4,-61 Z" fill={INK} />
            </g>
          </g>

          {/* 顔。伏し目。線だけで彫る */}
          <g>
            <ellipse cx="0" cy="-118" rx="25" ry="31" fill={CREAM} stroke={INK} strokeWidth="1.6" />
            {/* 頬と顎の陰 */}
            <g mask={`url(#${P}-ma)`}>
              <path d="M 8,-142 C 22,-136 26,-118 22,-102 C 18,-92 10,-88 4,-88 C 14,-104 16,-126 8,-142 Z" fill={INK} />
            </g>
            <g mask={`url(#${P}-mx)`}>
              <path d="M -22,-124 C -26,-112 -22,-98 -12,-90 C -18,-104 -20,-114 -18,-124 Z" fill={INK} />
            </g>
            <g stroke={INK} fill="none" strokeLinecap="round">
              {/* 伏し目。上まぶただけを引く */}
              <path d="M -15,-124 C -11,-120 -6,-120 -3,-123" strokeWidth="1.5" />
              <path d="M 3,-123 C 6,-120 11,-120 15,-124" strokeWidth="1.5" />
              <path d="M -16,-129 C -11,-133 -5,-133 -2,-130" strokeWidth="0.9" opacity="0.7" />
              <path d="M 2,-130 C 5,-133 11,-133 16,-129" strokeWidth="0.9" opacity="0.7" />
              {/* 鼻と口 */}
              <path d="M 0,-124 L -2,-110 C -1,-107 1,-107 2,-108" strokeWidth="1.1" />
              <path d="M -6,-101 C -3,-99 3,-99 6,-101" strokeWidth="1.3" />
              <path d="M -5,-97 C -2,-95 2,-95 5,-97" strokeWidth="0.8" opacity="0.7" />
            </g>
            {/* 頭巾の縁。顔を囲う */}
            <path
              d="M 0,-160 C -30,-158 -44,-140 -44,-118 C -44,-96 -30,-80 -14,-74 L -10,-82 C -22,-88 -32,-102 -32,-118 C -32,-136 -18,-148 0,-149 C 18,-148 32,-136 32,-118 C 32,-102 22,-88 10,-82 L 14,-74 C 30,-80 44,-96 44,-118 C 44,-140 30,-158 0,-160 Z"
              fill={TEAL} stroke={INK} strokeWidth="1.4"
            />
            <path
              d="M 0,-160 C -30,-158 -44,-140 -44,-118 C -44,-96 -30,-80 -14,-74 L -10,-82 C -22,-88 -32,-102 -32,-118 C -32,-136 -18,-148 0,-149"
              fill="none" stroke={GOLD} strokeWidth="3"
            />
          </g>

          {/* 月。聖母の足元。天使が支える */}
          <path
            d="M -48,166 C -26,196 26,196 48,166 C 30,186 -30,186 -48,166 Z"
            fill={INK}
          />
          <path
            d="M -54,160 C -30,200 30,200 54,160 C 40,208 -40,208 -54,160 Z"
            fill={GOLD} stroke={INK} strokeWidth="1.6"
          />
          {/* 天使。翼を広げて月を担ぐ */}
          <g transform="translate(0 196)">
            <path d="M -8,-6 C -34,-24 -74,-22 -92,-2 C -66,-6 -34,4 -12,10 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <path d="M 8,-6 C 34,-24 74,-22 92,-2 C 66,-6 34,4 12,10 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.75">
              {Array.from({ length: 5 }, (_, i) => (
                <g key={i}>
                  <path d={`M ${-18 - i * 15},${-8 + i * 1.4} C ${-24 - i * 15},${1 + i} ${-26 - i * 15},${5 + i} ${-24 - i * 15},${8 - i * 0.6}`} />
                  <path d={`M ${18 + i * 15},${-8 + i * 1.4} C ${24 + i * 15},${1 + i} ${26 + i * 15},${5 + i} ${24 + i * 15},${8 - i * 0.6}`} />
                </g>
              ))}
            </g>
            <circle cx="0" cy="-4" r="15" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <g mask={`url(#${P}-ma)`}>
              <path d="M 4,-18 C 15,-14 18,-2 12,6 C 9,10 5,10 3,9 C 9,0 10,-10 4,-18 Z" fill={INK} />
            </g>
            <g stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round">
              <path d="M -7,-6 C -5,-4 -3,-4 -2,-6" />
              <path d="M 2,-6 C 3,-4 5,-4 7,-6" />
              <path d="M -3,3 C -1,4 1,4 3,3" />
            </g>
          </g>
        </g>

        {/* ── 帯。ここから下は対称をやめる ────────────────────────── */}
        <g transform="rotate(-2.2 300 640)">
          <path
            d="M 18,606 C 160,594 440,594 582,606 L 582,676 C 440,664 160,664 18,676 Z"
            fill={RED} stroke={INK} strokeWidth="3"
          />
          {/* 帯の折り返し。左右の端を裏返す */}
          <path d="M 18,606 L -4,624 L -4,690 L 18,676 Z" fill={INK} opacity="0.85" />
          <path d="M 582,606 L 604,624 L 604,690 L 582,676 Z" fill={INK} opacity="0.85" />
          <path d="M 24,614 C 162,603 438,603 576,614" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.9" />
          <path d="M 24,668 C 162,657 438,657 576,668" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.9" />
          {/* 題字。看板屋の手つきで、影と縁を分けて置く */}
          <text
            x="302" y="654" textAnchor="middle" fill={INK}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="50" fontWeight="700" letterSpacing="5"
          >
            CHICANO
          </text>
          <text
            x="299" y="650" textAnchor="middle" fill={CREAM}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="50" fontWeight="700" letterSpacing="5"
            stroke={INK} strokeWidth="1.2"
          >
            CHICANO
          </text>
        </g>

        {/* 薔薇。左を大きく、右を小さく。重心を左へ寄せる */}
        {[
          { x: 74, y: 646, s: 1, rot: -14 },
          { x: 534, y: 660, s: 0.72, rot: 20 },
        ].map((b, k) => (
          <g key={k} transform={`translate(${b.x} ${b.y}) rotate(${b.rot}) scale(${b.s})`}>
            {/* 葉 */}
            <g fill={TEAL} stroke={INK} strokeWidth="1.3">
              <path d="M -14,18 C -46,20 -62,44 -58,62 C -36,58 -18,40 -14,18 Z" />
              <path d="M 16,20 C 48,26 60,50 54,66 C 34,58 20,42 16,20 Z" />
            </g>
            <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.7">
              <path d="M -16,20 C -34,32 -48,48 -56,60" />
              <path d="M 18,22 C 34,36 46,52 52,64" />
            </g>
            {/* 花弁 */}
            {[0, 72, 144, 216, 288].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <path d={PETAL} fill={RED} stroke={INK} strokeWidth="1.4" />
                <g mask={`url(#${P}-mb)`}>
                  <path d="M 0,0 C -21,-6 -29,-27 -14,-39 C -12,-30 -14,-12 0,0 Z" fill={INK} />
                </g>
              </g>
            ))}
            {/* 芯の渦。ここが薔薇の見分け方 */}
            <g fill="none" stroke={INK} strokeWidth="1.4">
              <path d="M -13,-2 C -15,-14 -6,-22 4,-19 C 12,-16 13,-6 7,-1 C 3,2 -3,1 -4,-4 C -5,-8 -1,-11 2,-9" />
              <path d="M -13,-2 C -10,6 0,10 8,6" />
            </g>
          </g>
        ))}

        {/* ── 版面の縁。グレカの帯 ────────────────────────────── */}
        <rect x="0" y="18" width="600" height="22" fill={`url(#${P}-greca)`} />
        <rect x="0" y="742" width="600" height="22" fill={`url(#${P}-greca)`} />
        <g stroke={INK} strokeWidth="1.4">
          <line x1="0" y1="46" x2="600" y2="46" />
          <line x1="0" y1="736" x2="600" y2="736" />
        </g>
        <g stroke={GOLD} strokeWidth="2.4">
          <line x1="0" y1="50" x2="600" y2="50" />
          <line x1="0" y1="732" x2="600" y2="732" />
        </g>

        <text
          x="300" y="72" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="12.5" fontWeight="700" letterSpacing="7.5"
        >
          LA VIRGEN DE GUADALUPE
        </text>
        {/* 版下の注記。獄中のペン画は必ず署名と日付が入る */}
        <text
          x="34" y="712" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="11.5" fontWeight="700" letterSpacing="3.4" opacity="0.8"
        >
          C/S — EAST LOS ANGELES
        </text>
        <text
          x="566" y="712" textAnchor="end" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="11.5" fontWeight="700" letterSpacing="3.4" opacity="0.8"
        >
          TINTA / LINEA FINA
        </text>
        <text
          x="300" y="786" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="10" fontWeight="700" letterSpacing="5" opacity="0.6"
        >
          ONE PEN — THREE LINE SPACINGS — NO GREY
        </text>

        {/* 紙。壁画も紙も、面は完全には平らでない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
