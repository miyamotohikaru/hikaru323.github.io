/**
 * チカーノ・アート。
 *
 * 東ロサンゼルスの壁画と、獄中のペン画（パニョ）から出た様式。
 * 図像はグアダルーペの聖母。刷り物より前に、まず「線」の絵である。
 *
 * ■ ここで作っている「らしさ」
 *   1. ファインライン。濃淡を「薄い色」で作らない。細い線の間隔だけで作る。
 *      ボールペン1本で描くので線の太さは変わらない。変わるのは間隔だけ。
 *   2. 陰は4枚の入れ子で作る。
 *      初稿は「影の形」を1枚置いて網目を掛けただけで、
 *      布ではなく生地見本に見えた。硬い縁が出るからである。
 *      薄い網の中に中くらいの網、その中に濃い網、と入れ子にすると、
 *      線の間隔だけが詰まっていくので、縁が消えて「陰」になる。
 *   3. 光背は線で敷く。金をベタで塗ると看板になる。
 *      内側から外側へ細い金線を放射させると、光背が光る。
 *   4. 正面性。壁画も聖画も左右対称に組む。
 *      崩すのは帯と薔薇の側。下半分だけ重心を左に寄せた。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "chi";
const INK = "#1a1a1a";
const RED = "#c8102e";
const GOLD = "#f4a300";
const TEAL = "#0f7b6c";
const CREAM = "#f2e9d8";

const CX = 300;
const CY = 330;
const RX = 140; // 光背の内郭
const RY = 214;

/** 8光の星。聖母の外套の紋 */
const star = (r: number) => {
  const a = r * 0.3;
  return `M 0,${-r} L ${a},${-a} L ${r},0 L ${a},${a} L 0,${r} L ${-a},${a} L ${-r},0 L ${-a},${-a} Z`;
};

/** 段のグレカ。メソアメリカの帯 */
const GRECA = "M 0,22 L 0,14 L 6,14 L 6,7 L 12,7 L 12,0 L 18,0 L 18,7 L 24,7 L 24,14 L 30,14 L 30,22 Z";

/** 薔薇の花弁 */
const PETAL = "M 0,0 C -21,-6 -29,-27 -14,-39 C -4,-46 11,-43 17,-31 C 23,-19 15,-6 0,0 Z";

/** 線の伏せ。目は同じ4px。太さだけを変える＝ペンは1本 */
const HATCH: [string, number, number][] = [
  ["a", 0.65, -38], ["b", 1.25, -38], ["c", 2.0, -38],
  ["n", 0.42, -76], ["p", 0.75, -76], ["q", 1.35, -76], ["s", 2.1, -76],
  ["x", 0.8, 46],
];

export default function Plate() {
  const r = rand(19701968);

  /* 光背の棘。長短を交互に。等長で回すと歯車になる */
  const N = 52;
  const rays = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const half = Math.PI / N;
    const k = i % 2 ? 0.78 : 1;
    const p = (rx: number, ry: number, ang: number) =>
      `${(CX + Math.sin(ang) * rx).toFixed(1)},${(CY - Math.cos(ang) * ry).toFixed(1)}`;
    return `M ${p(RX, RY, a - half)} L ${p(RX + 44 * k, RY + 38 * k, a)} L ${p(RX, RY, a + half)} Z`;
  });

  /* 光背の中。細い金線を放射させる。ベタで塗ると看板になる */
  const inner = Array.from({ length: 132 }, (_, i) => {
    const a = (i / 132) * Math.PI * 2;
    const k = i % 3 === 0 ? 0.5 : 0.72;
    return `M ${(CX + Math.sin(a) * RX * k).toFixed(1)},${(CY - Math.cos(a) * RY * k).toFixed(1)} L ${(CX + Math.sin(a) * (RX - 5)).toFixed(1)},${(CY - Math.cos(a) * (RY - 5)).toFixed(1)}`;
  });

  /* 外套の襞。肩から裾へ流れる。この線が絵の背骨 */
  const folds = Array.from({ length: 15 }, (_, i) => {
    const t = (i - 7) / 7;
    const x0 = t * 44;
    const x1 = t * 96;
    const bow = 12 * (1 - Math.abs(t)) * (i % 2 ? 1 : -1);
    return `M ${x0.toFixed(1)},-30 C ${(x0 + bow).toFixed(1)},26 ${(x1 - bow).toFixed(1)},80 ${x1.toFixed(1)},136`;
  });

  /* 光背の外。短い線を疎らに散らして紙を締める */
  const beams = Array.from({ length: 86 }, (_, i) => {
    const a = (i / 86) * Math.PI * 2 + 0.04;
    const r0 = 1.04 + r(0, 0.06);
    const r1 = r0 + r(0.05, 0.2);
    return `M ${(CX + Math.sin(a) * RX * r0 * 1.16).toFixed(1)},${(CY - Math.cos(a) * RY * r0 * 1.16).toFixed(1)} L ${(CX + Math.sin(a) * RX * r1 * 1.16).toFixed(1)},${(CY - Math.cos(a) * RY * r1 * 1.16).toFixed(1)}`;
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="チカーノ・アート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {HATCH.map(([k, w, deg]) => (
          <pattern key={k} id={`${P}-h${k}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform={`rotate(${deg})`}>
            <rect width="4" height="4" fill="#000" />
            <rect width="4" height={w} fill="#fff" />
          </pattern>
        ))}
        {HATCH.map(([k]) => (
          <mask key={k} id={`${P}-m${k}`} maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800">
            <rect width="600" height="800" fill={`url(#${P}-h${k})`} />
          </mask>
        ))}
        <pattern id={`${P}-greca`} width="30" height="22" patternUnits="userSpaceOnUse">
          <path d={GRECA} fill={INK} />
        </pattern>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />

        <g stroke={INK} strokeWidth="0.9" opacity="0.3">
          {beams.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* ── 光背 ────────────────────────────────────────────── */}
        {rays.map((d, i) => (
          <path key={i} d={d} fill={i % 2 ? GOLD : RED} />
        ))}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={CREAM} stroke={INK} strokeWidth="2.6" />
        <g stroke={GOLD} strokeWidth="1.15" opacity="0.9">
          {inner.map((d, i) => <path key={i} d={d} />)}
        </g>
        <ellipse cx={CX} cy={CY} rx={RX - 5} ry={RY - 5} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />

        {/* ── 聖母 ────────────────────────────────────────────── */}
        <g transform={`translate(${CX} ${CY})`}>
          {/* 外套。頭でいったん締まり、肩で広がる。
              2稿目は頭から裾まで一続きの円錐にしたら釣鐘になった。
              頸のくびれと肩の張りの2箇所だけで、布を着た人になる */}
          <path
            d="M 0,-162 C -30,-160 -48,-140 -50,-112 C -51,-96 -46,-84 -40,-76 C -58,-66 -70,-46 -74,-16 C -82,44 -94,96 -104,134 C -70,150 -40,156 0,156 C 40,156 70,150 104,134 C 94,96 82,44 74,-16 C 70,-46 58,-66 40,-76 C 46,-84 51,-96 50,-112 C 48,-140 30,-160 0,-162 Z"
            fill={TEAL} stroke={INK} strokeWidth="2"
          />
          {/* 陰。薄→中→濃の入れ子。内側の境を波打たせないと硬い縁が出る */}
          <g mask={`url(#${P}-mn)`}>
            <path d="M 18,-156 C 40,-148 50,-132 50,-112 C 51,-96 46,-84 40,-76 C 58,-66 70,-46 74,-16 C 82,44 94,96 104,134 C 82,144 58,151 30,155 C 46,116 38,58 30,-10 C 24,-54 32,-112 18,-156 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mq)`}>
            <path d="M 42,-118 C 49,-106 48,-90 42,-78 C 60,-64 70,-44 74,-16 C 82,44 94,96 104,134 C 90,140 74,146 58,150 C 68,106 60,48 52,0 C 47,-42 47,-90 42,-118 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-ms)`}>
            <path d="M 62,-38 C 68,-30 72,-24 74,-16 C 82,44 94,96 104,134 C 96,138 88,142 78,145 C 86,98 74,30 62,-38 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mn)`}>
            <path d="M -74,-16 C -82,44 -94,96 -104,134 C -92,139 -80,143 -66,146 C -76,88 -78,28 -70,-22 Z" fill={INK} />
          </g>
          {/* 襞 */}
          <g stroke={INK} strokeWidth="1.1" fill="none" opacity="0.66">
            {folds.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* 外套の縁。金の一本 */}
          <g fill="none" stroke={GOLD} strokeWidth="5">
            <path d="M -40,-76 C -58,-66 -70,-46 -74,-16 C -82,44 -94,96 -104,134" />
            <path d="M 40,-76 C 58,-66 70,-46 74,-16 C 82,44 94,96 104,134" />
            <path d="M -104,134 C -70,150 -40,156 0,156 C 40,156 70,150 104,134" />
          </g>
          <g fill={GOLD}>
            {[[-62, 6], [-80, 62], [-92, 112], [-56, 140], [-58, -42],
              [62, 6], [82, 62], [94, 112], [58, 140], [60, -42], [78, 96]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d={star(9)} />
                <path d={star(9)} fill="none" stroke={INK} strokeWidth="0.8" />
              </g>
            ))}
          </g>

          {/* 首 */}
          <path d="M -12,-96 L 12,-96 L 12,-62 L -12,-62 Z" fill={CREAM} stroke={INK} strokeWidth="1.4" />
          <g mask={`url(#${P}-mb)`}>
            <path d="M -12,-84 C -4,-76 4,-76 12,-84 L 12,-62 L -12,-62 Z" fill={INK} />
          </g>

          {/* 内衣。薔薇色 */}
          <path
            d="M 0,-68 C -26,-66 -40,-46 -42,-20 C -48,36 -54,88 -58,128 C -32,140 -14,144 0,144 C 14,144 32,140 58,128 C 54,88 48,36 42,-20 C 40,-46 26,-66 0,-68 Z"
            fill={RED} stroke={INK} strokeWidth="1.6"
          />
          <g mask={`url(#${P}-mn)`}>
            <path d="M 8,-66 C 30,-58 40,-42 42,-20 C 48,36 54,88 58,128 C 42,136 28,141 16,143 C 28,78 24,-8 8,-66 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mp)`}>
            <path d="M 24,-44 C 36,-36 41,-30 42,-20 C 48,36 54,88 58,128 C 47,133 38,137 30,139 C 40,74 34,4 24,-44 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mq)`}>
            <path d="M 36,-22 C 40,-22 41,-22 42,-20 C 48,36 54,88 58,128 C 52,130 47,133 42,135 C 48,72 42,20 36,-22 Z" fill={INK} />
          </g>
          <g fill={GOLD}>
            {[[-22, -28], [18, 6], [-14, 52], [22, 84], [-26, 108], [0, -50], [-34, 78]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx="0" cy="-4.6" rx="2.1" ry="4" transform={`rotate(${a})`} />
                ))}
                <circle r="1.7" fill={RED} />
              </g>
            ))}
          </g>
          {/* 妊婦の帯。図像の要 */}
          <path d="M -46,26 C -18,34 18,34 46,26 L 46,44 C 18,52 -18,52 -46,44 Z" fill={INK} />
          <path d="M -44,34 C -16,42 16,42 44,34" fill="none" stroke={GOLD} strokeWidth="1.6" opacity="0.85" />

          {/* 合掌した手。3稿目は縦に長すぎてネクタイに見えたので、
              掌を広げて丈を詰めた。指は3本の線で足りる */}
          <g transform="translate(0 -14)">
            <path d="M -3,14 C -20,8 -27,-10 -25,-30 C -23,-42 -13,-52 -3,-56 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <path d="M 3,14 C 20,8 27,-10 25,-30 C 23,-42 13,-52 3,-56 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <g stroke={INK} strokeWidth="0.85" fill="none" opacity="0.85">
              <path d="M -20,-30 C -15,-37 -9,-43 -5,-47" />
              <path d="M -21,-20 C -15,-28 -9,-35 -4,-40" />
              <path d="M -21,-10 C -15,-19 -8,-27 -4,-33" />
              <path d="M 20,-30 C 15,-37 9,-43 5,-47" />
              <path d="M 21,-20 C 15,-28 9,-35 4,-40" />
              <path d="M 21,-10 C 15,-19 8,-27 4,-33" />
            </g>
            <g mask={`url(#${P}-ma)`}>
              <path d="M 6,12 C 21,6 27,-10 25,-30 C 23,-41 15,-50 6,-54 Z" fill={INK} />
            </g>
            {/* 袖口。金の輪 */}
            <path d="M -26,10 C -13,18 13,18 26,10 L 26,22 C 13,30 -13,30 -26,22 Z" fill={GOLD} stroke={INK} strokeWidth="1.3" />
          </g>

          {/* 顔。外套に開いた窓として抜く */}
          <ellipse cx="0" cy="-116" rx="26" ry="33" fill={CREAM} stroke={INK} strokeWidth="1.6" />
          <g mask={`url(#${P}-ma)`}>
            <path d="M 6,-146 C 21,-140 26,-122 23,-103 C 20,-92 12,-85 4,-84 C 15,-102 17,-127 6,-146 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mb)`}>
            <path d="M 15,-137 C 24,-127 26,-112 23,-99 C 21,-92 17,-87 12,-85 C 20,-102 21,-121 15,-137 Z" fill={INK} />
          </g>
          <g mask={`url(#${P}-mx)`}>
            <path d="M -23,-124 C -27,-110 -22,-96 -12,-88 C -18,-103 -20,-114 -18,-124 Z" fill={INK} />
          </g>
          <g stroke={INK} fill="none" strokeLinecap="round">
            {/* 伏し目。上まぶただけを引く */}
            <path d="M -16,-122 C -11,-117 -6,-117 -3,-121" strokeWidth="1.7" />
            <path d="M 3,-121 C 6,-117 11,-117 16,-122" strokeWidth="1.7" />
            <path d="M -17,-129 C -11,-134 -5,-134 -2,-130" strokeWidth="1" opacity="0.75" />
            <path d="M 2,-130 C 5,-134 11,-134 17,-129" strokeWidth="1" opacity="0.75" />
            <path d="M -1,-120 L -3,-106 C -2,-103 2,-103 3,-105" strokeWidth="1.15" />
            <path d="M -7,-97 C -3,-94 3,-94 7,-97" strokeWidth="1.4" />
            <path d="M -5,-92 C -2,-90 2,-90 5,-92" strokeWidth="0.85" opacity="0.7" />
          </g>
          {/* 頭巾の縁。金と黒を分けて置くと布の厚みが出る */}
          <ellipse cx="0" cy="-116" rx="33" ry="40" fill="none" stroke={GOLD} strokeWidth="5" />
          <ellipse cx="0" cy="-116" rx="36" ry="43" fill="none" stroke={INK} strokeWidth="1" opacity="0.55" />
          <path d="M 0,-162 C -30,-160 -48,-140 -50,-112 C -51,-96 -46,-84 -40,-76" fill="none" stroke={GOLD} strokeWidth="4.5" />
          <path d="M 0,-162 C 30,-160 48,-140 50,-112 C 51,-96 46,-84 40,-76" fill="none" stroke={GOLD} strokeWidth="4.5" />

          {/* 月。聖母の足元 */}
          <path d="M -54,158 C -30,198 30,198 54,158 C 40,206 -40,206 -54,158 Z" fill={GOLD} stroke={INK} strokeWidth="1.8" />
          <g mask={`url(#${P}-mb)`}>
            <path d="M 10,190 C 30,188 46,176 54,158 C 44,196 24,204 6,204 Z" fill={INK} />
          </g>

          {/* 天使。翼を広げて月を担ぐ */}
          <g transform="translate(0 206)">
            <path d="M -8,-6 C -34,-26 -76,-24 -94,-2 C -66,-7 -34,4 -12,11 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <path d="M 8,-6 C 34,-26 76,-24 94,-2 C 66,-7 34,4 12,11 Z" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.75">
              {Array.from({ length: 5 }, (_, i) => (
                <g key={i}>
                  <path d={`M ${-20 - i * 15},${-9 + i * 1.5} C ${-27 - i * 15},${1 + i} ${-29 - i * 15},${6 + i} ${-26 - i * 15},${9 - i * 0.6}`} />
                  <path d={`M ${20 + i * 15},${-9 + i * 1.5} C ${27 + i * 15},${1 + i} ${29 + i * 15},${6 + i} ${26 + i * 15},${9 - i * 0.6}`} />
                </g>
              ))}
            </g>
            <g mask={`url(#${P}-ma)`}>
              <path d="M 16,-14 C 40,-20 68,-18 88,-3 C 64,-6 36,1 16,7 Z" fill={INK} />
            </g>
            <circle cx="0" cy="-4" r="16" fill={CREAM} stroke={INK} strokeWidth="1.5" />
            <g mask={`url(#${P}-ma)`}>
              <path d="M 5,-19 C 16,-15 19,-2 13,7 C 10,11 6,11 4,10 C 10,1 11,-11 5,-19 Z" fill={INK} />
            </g>
            <g stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round">
              <path d="M -8,-7 C -6,-5 -3,-5 -2,-7" />
              <path d="M 2,-7 C 3,-5 6,-5 8,-7" />
              <path d="M -4,3 C -1,5 1,5 4,3" />
            </g>
          </g>
        </g>

        {/* ── 帯。ここから下は対称をやめる ────────────────────────── */}
        <g transform="rotate(-2.2 300 640)">
          <path d="M 18,606 C 160,594 440,594 582,606 L 582,676 C 440,664 160,664 18,676 Z" fill={RED} stroke={INK} strokeWidth="3" />
          <path d="M 18,606 L -4,624 L -4,690 L 18,676 Z" fill={INK} />
          <path d="M 582,606 L 604,624 L 604,690 L 582,676 Z" fill={INK} />
          <g fill="none" stroke={GOLD} strokeWidth="2" opacity="0.9">
            <path d="M 24,614 C 162,603 438,603 576,614" />
            <path d="M 24,668 C 162,657 438,657 576,668" />
          </g>
          <text x="302" y="654" textAnchor="middle" fill={INK}
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="50" fontWeight="700" letterSpacing="5">
            CHICANO
          </text>
          <text x="299" y="650" textAnchor="middle" fill={CREAM}
            fontFamily="Georgia, 'Times New Roman', serif" fontSize="50" fontWeight="700" letterSpacing="5"
            stroke={INK} strokeWidth="1.2">
            CHICANO
          </text>
        </g>

        {/* 薔薇。左を大きく、右を小さく。重心を左へ寄せる */}
        {[
          { x: 74, y: 634, s: 1, rot: -14 },
          { x: 534, y: 648, s: 0.72, rot: 20 },
        ].map((b, k) => (
          <g key={k} transform={`translate(${b.x} ${b.y}) rotate(${b.rot}) scale(${b.s})`}>
            <g fill={TEAL} stroke={INK} strokeWidth="1.3">
              <path d="M -14,18 C -46,20 -62,44 -58,62 C -36,58 -18,40 -14,18 Z" />
              <path d="M 16,20 C 48,26 60,50 54,66 C 34,58 20,42 16,20 Z" />
            </g>
            <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.7">
              <path d="M -16,20 C -34,32 -48,48 -56,60" />
              <path d="M 18,22 C 34,36 46,52 52,64" />
            </g>
            {[0, 72, 144, 216, 288].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <path d={PETAL} fill={RED} stroke={INK} strokeWidth="1.4" />
                {/* 花弁の陰。線が花弁の丸みをなぞる */}
                <g stroke={INK} strokeWidth="0.8" fill="none" opacity="0.85">
                  <path d="M -18,-9 C -22,-22 -14,-33 -4,-36" />
                  <path d="M -13,-6 C -17,-19 -10,-30 -1,-33" />
                  <path d="M -8,-4 C -12,-16 -6,-27 2,-30" />
                </g>
              </g>
            ))}
            <g fill="none" stroke={INK} strokeWidth="1.5">
              <path d="M -13,-2 C -15,-14 -6,-22 4,-19 C 12,-16 13,-6 7,-1 C 3,2 -3,1 -4,-4 C -5,-8 -1,-11 2,-9" />
              <path d="M -13,-2 C -10,6 0,10 8,6" />
            </g>
          </g>
        ))}

        {/* 余白の柱。奉納画の枠。左右の空きを黙って締める */}
        {[42, 558].map((x) => (
          <g key={x} stroke={INK} strokeWidth="1.2" opacity="0.65">
            <line x1={x} y1="96" x2={x} y2="292" />
            <line x1={x} y1="368" x2={x} y2="564" />
            <line x1={x - 5} y1="96" x2={x + 5} y2="96" />
            <line x1={x - 5} y1="564" x2={x + 5} y2="564" />
          </g>
        ))}
        {[42, 558].map((x) => (
          <g key={x} transform={`translate(${x} 330)`}>
            <path d={star(15)} fill={GOLD} />
            <path d={star(15)} fill="none" stroke={INK} strokeWidth="1" />
            <circle r="3.2" fill={INK} />
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

        <text x="300" y="72" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="12.5" fontWeight="700" letterSpacing="7.5">
          LA VIRGEN DE GUADALUPE
        </text>
        <text x="34" y="712" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="11.5" fontWeight="700" letterSpacing="3.4" opacity="0.8">
          C/S — EAST LOS ANGELES
        </text>
        <text x="566" y="712" textAnchor="end" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="11.5" fontWeight="700" letterSpacing="3.4" opacity="0.8">
          TINTA / LINEA FINA
        </text>
        <text x="300" y="786" textAnchor="middle" fill={INK}
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fontWeight="700" letterSpacing="5" opacity="0.58">
          ONE PEN — FOUR LINE SPACINGS — NO GREY
        </text>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
