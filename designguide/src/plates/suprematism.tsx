/**
 * シュプレマティズム。
 *
 * マレーヴィチ。1915年の「0,10」展。対象を描くのをやめ、
 * 感覚そのものを白い無限のなかに置いた絵。
 *
 * ■ この様式でしか成立しない絵にするために決めたこと
 *   1. **どの形も紙の縁に触れない。** これが一番効く。
 *      縁で断ち切ると「版面を割った絵」になり、デ・ステイルや
 *      バウハウスの側に落ちる。触れさせないと形が浮き、白が
 *      背景ではなく「無限の空間」になる。
 *   2. **円も三角も使わない。** 矩形だけ。ただし角度は自由。
 *      これで幾何の系譜のなかで角度だけが自由な一枚になる。
 *   3. **一本の主軸に全部を乗せる。** −30度。ばらばらの角度で
 *      散らすと、ただの散らかった図形になる（初稿でそうなった）。
 *      主軸に平行な帯を階段状に並べ、直交する帯を2本だけ挿す。
 *      マレーヴィチの「飛行機の飛行」がこの組み方。
 *   4. **大きさの幅を極端にする。** 一番大きい黒帯と、いちばん小さい
 *      黒片の面積比はおよそ 60 倍。等しい大きさで並べると図案になる。
 *
 * ■ 近くで見る細部
 *   大きな黒帯と赤帯にだけ、貫入（craquelure）を入れてある。
 *   実物は油彩が乾いて細かくひび割れている。遠目には平らな黒、
 *   近寄ると割れが見える、という差がこの絵の見どころ。
 */
import { ATLAS, rand, rad } from "@/lib/plate";

const P = "sup";
const PAPER = "#f2efe6";
const INK = "#141414";
const RED = "#d6321e";
const BLUE = "#1f4fa8";
const YELLOW = "#e8b21e";

/* 主軸。すべての帯はこの角度か、これに直交する角度しか持たない */
const A = -30;
const A2 = A + 90;

/* 主軸の座標系。O を起点に、u＝軸方向、v＝軸に直交する方向 */
const OX = 270;
const OY = 340;
const UX = Math.cos(rad(A));
const UY = Math.sin(rad(A));
const VX = -UY;
const VY = UX;
const at = (du: number, dv: number): [number, number] => [
  OX + UX * du + VX * dv,
  OY + UY * du + VY * dv,
];

type BarDef = { du: number; dv: number; len: number; th: number; fill: string; a?: number };

/**
 * 主軸に平行な階段。
 * 初稿では長さも太さも近い帯を等間隔に並べたので、バーコードに見えた。
 * いまは軸方向の位置（du）を大きくずらし、細さ 6 の線から
 * 一辺 64 の正方形まで、比を 10 倍以上ばらけさせている。
 */
const BARS: BarDef[] = [
  { du: 170, dv: -170, len: 64, th: 64, fill: INK }, // 黒の正方形。マレーヴィチの原点
  { du: -70, dv: -126, len: 224, th: 6, fill: INK },
  { du: 72, dv: -72, len: 250, th: 17, fill: INK },
  { du: -30, dv: -8, len: 418, th: 33, fill: INK }, // 主役
  { du: -110, dv: 54, len: 290, th: 50, fill: RED },
  { du: 150, dv: 98, len: 140, th: 9, fill: INK },
  { du: -190, dv: 118, len: 176, th: 26, fill: BLUE },
  { du: -250, dv: 182, len: 98, th: 34, fill: YELLOW },
];

/* 直交する帯。2本だけ。多いと格子になってしまう。
   赤の方形は主役の黒帯の外に置く。半分だけ重ねると事故に見えた */
const CROSS: BarDef[] = [
  { du: 118, dv: 30, len: 250, th: 8, fill: YELLOW, a: A2 },
  { du: 228, dv: 64, len: 42, th: 42, fill: RED, a: A2 },
];

/* 虚空に取り残された小片。マレーヴィチはこれを必ず置く。
   u/v で置くと縁からはみ出したので、ここだけ絶対座標で置く。
   細い片は本体の細帯の真横に置くと二重に見えたので、右下の虚空へ移した */
const MOTES: { x: number; y: number; len: number; th: number; fill: string }[] = [
  { x: 86, y: 214, len: 15, th: 15, fill: INK },
  { x: 455, y: 700, len: 52, th: 5, fill: INK },
  { x: 462, y: 92, len: 22, th: 22, fill: BLUE },
  { x: 150, y: 690, len: 10, th: 10, fill: INK },
  { x: 534, y: 618, len: 13, th: 13, fill: INK },
];

function Bar({ du, dv, len, th, fill, a = A }: BarDef) {
  const [cx, cy] = at(du, dv);
  return (
    <rect
      x={cx - len / 2}
      y={cy - th / 2}
      width={len}
      height={th}
      fill={fill}
      transform={`rotate(${a} ${cx.toFixed(2)} ${cy.toFixed(2)})`}
    />
  );
}

export default function Plate() {
  /* 貫入。折れながら伸びる細い割れを、黒帯と赤帯の中だけに引く */
  const rc = rand(1915);
  const cracks = Array.from({ length: 64 }, () => {
    let x = rc(60, 520);
    let y = rc(80, 560);
    let ang = rc(0, 360);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const seg = Math.floor(rc(2, 5));
    for (let i = 0; i < seg; i++) {
      ang += rc(-58, 58);
      const l = rc(7, 24);
      x += Math.cos(rad(ang)) * l;
      y += Math.sin(rad(ang)) * l;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, o: rc(0.14, 0.38) };
  });

  /* 白地の刷毛。マレーヴィチの白は塗った白で、紙の白ではない */
  const rw = rand(1010);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="シュプレマティズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 貫入を落とし込む先。大きい2枚の帯だけ */}
        <clipPath id={`${P}-crack`}>
          {[BARS[3], BARS[4], BARS[0]].map((b, i) => {
            const [cx, cy] = at(b.du, b.dv);
            return (
              <rect
                key={i}
                x={cx - b.len / 2}
                y={cy - b.th / 2}
                width={b.len}
                height={b.th}
                transform={`rotate(${A} ${cx.toFixed(2)} ${cy.toFixed(2)})`}
              />
            );
          })}
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 塗った白。マレーヴィチの白は塗った白で、紙の白ではない。
            初稿は濃くて灰色の板が浮いて見えた。いま 0.02 前後まで落とし、
            刷毛の向きも主軸（−30度）に揃えて、構図と喧嘩しないようにしている */}
        <g style={{ mixBlendMode: "multiply" }}>
          {Array.from({ length: 16 }, (_, i) => {
            const cx = rw(-40, 620);
            const cy = rw(-20, 800);
            return (
              <rect
                key={i}
                x={cx}
                y={cy}
                width={rw(180, 420)}
                height={rw(30, 78)}
                fill="#bdb6a2"
                opacity={rw(0.016, 0.042)}
                transform={`rotate(${A} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
              />
            );
          })}
        </g>

        {/* 階段 */}
        {BARS.map((b, i) => (
          <Bar key={`b${i}`} {...b} />
        ))}
        {/* 直交する2本 */}
        {CROSS.map((b, i) => (
          <Bar key={`c${i}`} {...b} />
        ))}
        {/* 虚空の小片 */}
        {MOTES.map((m, i) => (
          <rect
            key={`m${i}`}
            x={m.x - m.len / 2}
            y={m.y - m.th / 2}
            width={m.len}
            height={m.th}
            fill={m.fill}
            transform={`rotate(${A} ${m.x} ${m.y})`}
          />
        ))}

        {/* 貫入 */}
        <g clipPath={`url(#${P}-crack)`} stroke={PAPER} fill="none" strokeWidth="0.85">
          {cracks.map((c, i) => (
            <path key={i} d={c.d} opacity={c.o} />
          ))}
        </g>

        {/* 題字。形の群れから遠く離れた地の隅に置く。
            近づけると帯の一枚に見えてしまう */}
        <g fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
          <text x="52" y="748" fontSize="15" fontWeight="700" letterSpacing="6.5">
            SUPREMATISM
          </text>
          <text x="52" y="766" fontSize="8.5" fontWeight="600" letterSpacing="2.6" opacity="0.62">
            0,10 — PETROGRAD — 1915
          </text>
        </g>

        {/* 紙の目 */}
        <rect
          width="600"
          height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.15"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
