/**
 * スイス・スタイル（国際タイポグラフィ様式）。
 *
 * ミュラー＝ブロックマンの《ムジカ・ヴィヴァ》連作。
 * 図はぜんぶ**数列から出す**。目分量で置いた形が1つでもあると、
 * この様式は成立しない。
 *
 * ■ この様式でしか成立しない仕掛け
 *   1. **等比数列の弧。** 半径は 74mm から公比 1.173 で 13 本。
 *      帯の太さも「次の半径との差の 0.46 倍」で決まる。だから外へ行くほど
 *      太くなる。この増えかたが図の全部で、恣意的な判断がどこにもない。
 *   2. **6段組のグリッド。** 罫は引かないが、天の余白に組の位置を示す
 *      トンボだけ立ててある。組んだ人が「格子で組んだ」と分かる印。
 *   3. **左揃え・小文字・ヘルヴェチカ。** 中央揃えを1箇所も使わない。
 *   4. **赤は1本だけ。** 13本のうち7本目。差し色を2つ入れた瞬間に
 *      スイスではなくなる。
 *   5. **平網。** 2本の帯だけ、ベタではなく網点で刷ってある。
 *      オフセットの「％アミ」という当時の技法そのもの。近寄ると点になる。
 *
 * ■ 下三分の一の白は空けたまま
 *   埋めたくなるが、埋めた瞬間にスイスではなくなる。余白は残りではなく要素。
 */
import { ATLAS, rad } from "@/lib/plate";

const P = "swiss";
const WHITE = "#ffffff";
const INK = "#000000";
const RED = "#e2231a";
const GREY = "#8c8c8c";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 版面。左右天地の余白48、6段組・段間12 */
const M = 48;
const COLW = 74;
const GUT = 12;
const col = (i: number) => M + i * (COLW + GUT);
const RIGHT = col(5) + COLW; // 552

/* 弧の中心は紙の右辺の上。だから右へ断ち切れる */
const CX = 600;
const CY = 764;

/* 等比数列。r0=74、公比 1.173、13本 */
const K = 1.1726;
const RADII = Array.from({ length: 13 }, (_, i) => 74 * Math.pow(K, i));

/** 扇形の帯（円環の90度分）。180度＝左、270度＝上 */
function band(r0: number, r1: number) {
  const p = (r: number, a: number) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
  const [ax, ay] = p(r1, 180);
  const [bx, by] = p(r1, 270);
  const [cx, cy] = p(r0, 270);
  const [dx, dy] = p(r0, 180);
  return `M${ax.toFixed(2)} ${ay.toFixed(2)} A${r1.toFixed(2)} ${r1.toFixed(2)} 0 0 1 ${bx.toFixed(2)} ${by.toFixed(2)} L${cx.toFixed(2)} ${cy.toFixed(2)} A${r0.toFixed(2)} ${r0.toFixed(2)} 0 0 0 ${dx.toFixed(2)} ${dy.toFixed(2)} Z`;
}

export default function Plate() {
  const bands = RADII.map((r, i) => {
    const next = i < RADII.length - 1 ? RADII[i + 1] : r * K;
    return { r0: r, r1: r + (next - r) * 0.46, i };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="スイス・スタイル様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={WHITE} />

        {/* 組のトンボ。罫は引かず、天の余白に段の位置だけ立てる。
            「格子で組んだ」という事実だけを残す */}
        <g fill={INK} opacity="0.55">
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <rect x={col(i)} y="56" width="0.8" height="9" />
              <rect x={col(i) + COLW} y="56" width="0.8" height="9" />
            </g>
          ))}
        </g>

        {/* 差し色の小口。視線の入口を左上に1つだけ置く */}
        <rect x={M} y="84" width="11" height="11" fill={RED} />

        {/* 題字。小文字・左揃え・字間は詰める */}
        <text x={M} y="150" fill={INK} fontFamily={SANS} fontSize="56" fontWeight="500" letterSpacing="-1.8">
          musica viva
        </text>
        <text x={M} y="174" fill={INK} fontFamily={SANS} fontSize="11.5" fontWeight="500" letterSpacing="0.3">
          konzerte der stadt zürich
        </text>

        {/* 半径の数列そのものを右の段に立てる。図の設計がそのまま図案になる */}
        <g>
          {/* 凡例の色は弧の色と一致させる。7本目が赤、4本目と11本目が平網。
              図の設計図が、そのまま図の索引になっている */}
          {RADII.map((r, i) => (
            <rect
              key={i}
              x={col(4)}
              y={100 + i * 6}
              width={(r / 500) * 152}
              height="2.4"
              fill={i === 7 ? RED : i === 3 || i === 10 ? GREY : INK}
              opacity={i === 7 ? 1 : 0.85}
            />
          ))}
          <text x={col(4)} y="194" fill={INK} fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.3">
            RADIEN 74 → 500, Q = 1,173
          </text>
        </g>

        <rect x={M} y="212" width={RIGHT - M} height="0.9" fill={INK} />

        <g fill={INK} fontFamily={SANS} fontSize="10.5" fontWeight="400">
          <text x={M} y="232">tonhalle zürich, grosser saal</text>
          <text x={M} y="248">dienstag 26. januar, 20.15 uhr</text>
          <text x={M} y="264" fill={GREY}>leitung paul sacher</text>
        </g>

        {/* ── 弧。等比数列の13本。7本目だけ赤、4本目と11本目は平網 ── */}
        {bands.map(({ r0, r1, i }) => {
          const d = band(r0, r1);
          const screen = i === 3 || i === 10;
          if (screen) {
            return (
              <g key={i}>
                <path d={d} fill={WHITE} />
                <path d={d} fill={`url(#${ATLAS.halftone})`} />
              </g>
            );
          }
          return <path key={i} d={d} fill={i === 7 ? RED : INK} />;
        })}

        {/* 奥付。弧の下の余白に、天地の余白と同じ8pxで */}
        <g fill={INK} fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.4">
          <text x={M} y="782" opacity="0.8">
            RASTER 6 SPALTEN — SATZ HELVETICA
          </text>
          <text x={RIGHT} y="782" textAnchor="end" opacity="0.8">
            ZÜRICH 1957
          </text>
        </g>
      </g>
    </svg>
  );
}
