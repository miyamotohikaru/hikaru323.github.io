/**
 * キュビズム。
 *
 * 1911–12年のブラック／ピカソ。分析的キュビズムに、ステンシル文字と
 * 貼り紙が入り始めるあたり。
 *
 * ■ 幾何の系譜のなかで、これだけ別物に見せるために
 *   1. **楕円の画布。** この時期の二人は楕円のカンヴァスを使った。
 *      面は縁で薄れ、素の麻布に溶ける。四角い版面を割る他の様式と、
 *      輪郭からして違う。
 *   2. **色を捨てる。** 土色だけ。原色を1つでも入れるとバウハウスの側に落ちる。
 *   3. **面を透かして重ねる（パッサージュ）。** 格子をもう1枚、15度ずらして
 *      半透明で重ねる。重なりが中間調を作る。ここが構成主義との差。
 *   4. **同じものを2度描く。** グラスは真上から見た楕円と、横から見た台形を
 *      1本の辺で繋いである。多視点の同時提示という主題そのもの。
 *   5. **貼り紙（パピエ・コレ）。** 木目の刷り紙、籐編み、新聞。
 *      ステンシルの JOU は「JOURNAL」の切れ端。
 *
 * ■ 面の作りかた（ここを2回作り直した）
 *   初稿：支点から扇状に三角形を出した → 爆発した破片に見えた。
 *   二稿：同じ方式で暗くしただけ → やはり扇のまま。
 *   決定稿：**先に格子の頂点を作り、頂点ごとに一度だけ揺らす。**
 *   隣り合うセルは同じ頂点を共有するので、辺が必ず一致し、
 *   隙間も交差もない四辺形の敷き詰めになる。これがキュビズムの面。
 *   明暗はセルの位置から決める（中央が暗く、縁が明るい）。
 *   完全な乱数で塗ると、モザイクのノイズになって構成が消える。
 */
import { ATLAS, rand, rad, type Rand } from "@/lib/plate";

const P = "cub";
const SAND = "#d8cdb8";
const RUST = "#a8582f";
const BLACK = "#1c1a17";
const LIGHT = "#efe7d3";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 面の階調。地の砂色から黒までの9段。原色は足さない */
/* 階調は「土」で作る。中間調を青灰にすると絵ぜんたいが冷えて、
   キュビズムではなく現代の抽象に見えた（三稿目でそうなった）。
   青灰（spine の #3f4a52）は面全体ではなく、差し色として時々だけ使う */
const RAMP = ["#f2ead6", "#e2d7bd", "#cec0a2", "#b6a789", "#9c8d72", "#80735c", "#665c49", "#4e463a", "#35312a"];
const SLATE = "#3f4a52";

const X0 = 30, X1 = 566, Y0 = 8, Y1 = 706;
const COLS = 6, ROWS = 8;

type Cell = { pts: string; fill: string; cx: number; cy: number; ha: number; hatch: boolean; hlen: number };

/**
 * 揺らした格子。頂点を先に作って共有するので、辺が必ず一致する。
 * ang を与えると、その角度で回した格子になる（重ねる2枚目用）。
 */
function lattice(seed: number, cols: number, rows: number, jx: number, jy: number, tone: (u: number, v: number, j: Rand) => string) {
  const r = rand(seed);
  const V: [number, number][][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: [number, number][] = [];
    for (let i = 0; i <= cols; i++) {
      const bx = X0 + ((X1 - X0) * i) / cols;
      const by = Y0 + ((Y1 - Y0) * j) / rows;
      row.push([bx + r(-jx, jx), by + r(-jy, jy)]);
    }
    V.push(row);
  }
  const cells: Cell[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], d = V[j + 1][i];
      const u = (i + 0.5) / cols;
      const v = (j + 0.5) / rows;
      cells.push({
        pts: [a, b, c, d].map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "),
        fill: tone(u, v, r),
        cx: (a[0] + b[0] + c[0] + d[0]) / 4,
        cy: (a[1] + b[1] + c[1] + d[1]) / 4,
        ha: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
        hatch: r() > 0.6,
        hlen: Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.62,
      });
    }
  }
  return cells;
}

/**
 * 明暗。左上が明るく、右下へ沈む。絵画の光の当たり方をそのまま使う。
 * 三稿目は「中央が暗い」にしたら、写真の周辺減光に見えた。
 */
function tonal(u: number, v: number, j: Rand) {
  let t = 0.14 + 0.74 * ((u * 0.4 + v * 0.78) / 1.18) + j(-0.15, 0.15);
  t = Math.max(0, Math.min(0.999, t));
  if (j() > 0.972) return RUST;
  if (j() > 0.9) return SLATE;
  return RAMP[Math.floor(t * RAMP.length)];
}

function Hatch({ list, tag, op }: { list: Cell[]; tag: string; op: number }) {
  return (
    <g stroke={BLACK} strokeWidth="0.85" opacity={op}>
      {list.map((f, i) =>
        f.hatch ? (
          <g key={`${tag}${i}`} transform={`rotate(${f.ha.toFixed(1)} ${f.cx.toFixed(1)} ${f.cy.toFixed(1)})`}>
            {Array.from({ length: 11 }, (_, k) => (
              <line
                key={k}
                x1={f.cx - f.hlen / 2}
                y1={f.cy - 22 + k * 4.4}
                x2={f.cx + f.hlen / 2}
                y2={f.cy - 22 + k * 4.4}
              />
            ))}
          </g>
        ) : null,
      )}
    </g>
  );
}

/** 輪郭は暗線に明線を1本添えて引く。明るい面でも暗い面でも読める */
function Contour({ d, w = 2.8, o = 0.9 }: { d: string; w?: number; o?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={LIGHT} strokeWidth={w * 0.8} opacity={o * 0.38} strokeLinecap="round" transform="translate(2 2)" />
      <path d={d} fill="none" stroke={BLACK} strokeWidth={w} opacity={o} strokeLinecap="round" />
    </>
  );
}

/** ヴァイオリンの f 孔 */
function FHole({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 C -7 -9, -1 -16, 2 -22 C 5 -28, 0 -34, -4 -38" fill="none" stroke={BLACK}
            strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <circle cx="1" cy="1" r="4.6" fill={BLACK} opacity="0.9" />
      <circle cx="-5" cy="-39" r="4.6" fill={BLACK} opacity="0.9" />
      <line x1="-9" y1="-19" x2="7" y2="-19" stroke={BLACK} strokeWidth="2" opacity="0.75" />
    </g>
  );
}

export default function Plate() {
  const base = lattice(19120714, COLS, ROWS, 34, 30, tonal);
  const over = lattice(556677, 4, 5, 44, 40, (u, v, j) => {
    const t = Math.max(0, Math.min(0.999, 0.2 + 0.7 * ((u * 0.5 + v * 0.7) / 1.2) + j(-0.18, 0.18)));
    return RAMP[Math.floor(t * RAMP.length)];
  });
  const rw = rand(881);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="キュビズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 楕円の画布。縁の20pxほどで麻布へ落とす。
            ぼかしを広く取ると、周辺減光をかけた写真に見えた */}
        <radialGradient id={`${P}-fade`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.93" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`${P}-oval`}>
          <ellipse cx="298" cy="356" rx="262" ry="344" fill={`url(#${P}-fade)`} />
        </mask>
        {/* 籐編み。ピカソが実際に貼った、印刷された籐柄の油布 */}
        <pattern id={`${P}-cane`} width="17" height="17" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <path d="M0 0 L17 17 M17 0 L0 17" stroke={BLACK} strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M8.5 0 L8.5 17 M0 8.5 L17 8.5" stroke={BLACK} strokeWidth="0.9" fill="none" opacity="0.5" />
          <circle cx="8.5" cy="8.5" r="2.4" fill="none" stroke={BLACK} strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <clipPath id={`${P}-wood`}>
          <polygon points="80,538 220,518 238,660 94,682" />
        </clipPath>
        {/* ステンシルの橋。1本だけ。2本入れると小文字に見えた */}
        <mask id={`${P}-stencil`}>
          <rect x="280" y="180" width="260" height="100" fill="#fff" />
          <rect x="280" y="232" width="260" height="5" fill="#000" />
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={SAND} />

        <g mask={`url(#${P}-oval)`}>
          {/* ① 面の敷き詰め。頂点を共有した四辺形の格子 */}
          {base.map((c, i) => (
            <polygon key={`b${i}`} points={c.pts} fill={c.fill} />
          ))}
          {/* ② もう1枚の格子を15度ずらして半透明で重ねる＝パッサージュ */}
          <g transform="rotate(15 298 356)" opacity="0.42">
            {over.map((c, i) => (
              <polygon key={`o${i}`} points={c.pts} fill={c.fill} />
            ))}
          </g>
          <Hatch list={base} tag="hb" op={0.26} />

          {/* ③ 貼り紙。面の上、線の下に挟むのが実際の順序 ───────── */}
          <g clipPath={`url(#${P}-wood)`}>
            <polygon points="80,538 220,518 238,660 94,682" fill="#b8965f" />
            {Array.from({ length: 19 }, (_, i) => {
              const y = 520 + i * 9;
              return (
                <path
                  key={i}
                  d={`M74 ${y} C 114 ${y - 9}, 158 ${y + 10}, 198 ${y - 4} S 238 ${y + 7}, 246 ${y}`}
                  fill="none"
                  stroke="#4a3620"
                  strokeWidth={rw(0.7, 2.3).toFixed(2)}
                  opacity={rw(0.35, 0.75).toFixed(2)}
                />
              );
            })}
          </g>
          <polygon points="80,538 220,518 238,660 94,682" fill="none" stroke={BLACK} strokeWidth="1.2" opacity="0.6" />

          <polygon points="396,540 528,560 516,684 382,662" fill="#cdbb93" />
          <polygon points="396,540 528,560 516,684 382,662" fill={`url(#${P}-cane)`} />
          <polygon points="396,540 528,560 516,684 382,662" fill="none" stroke={BLACK} strokeWidth="1.2" opacity="0.6" />

          <g transform="rotate(-7 340 626)">
            <rect x="274" y="582" width="132" height="90" fill="#ded4bb" />
            <g fill={BLACK} opacity="0.72">
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x={282} y={590 + i * 9} width={116 * rw(0.6, 1)} height="2.3" />
              ))}
            </g>
            <rect x="274" y="582" width="132" height="90" fill="none" stroke={BLACK} strokeWidth="1" opacity="0.55" />
          </g>

          {/* ④ 器物の線。暗線＋明線の二重引きで、どの面の上でも読める ── */}
          <Contour d="M162 386 A 84 84 0 0 1 314 340" />
          <Contour d="M166 502 A 102 102 0 0 0 368 518" />
          <Contour d="M180 398 C 196 452, 196 474, 174 508" w={2.3} o={0.78} />
          <Contour d="M320 350 C 340 418, 344 466, 366 514" w={2.3} o={0.78} />
          {/* 棹は断片で止める。長く伸ばすと JOU の O を貫いて Ø に見えた */}
          <Contour d="M300 334 L346 266" w={2.5} />
          <Contour d="M338 356 L384 288" w={2.5} />
          <g stroke={BLACK} fill="none">
            {Array.from({ length: 6 }, (_, i) => {
              const t = 0.12 + i * 0.15;
              return (
                <line key={i}
                  x1={300 + (346 - 300) * t} y1={334 + (266 - 334) * t}
                  x2={338 + (384 - 338) * t} y2={356 + (288 - 356) * t}
                  strokeWidth="1.7" opacity="0.7" />
              );
            })}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`s${i}`} x1={314 + i * 5} y1={348 + i * 3} x2={254 + i * 7} y2={558}
                    strokeWidth="1.1" opacity="0.6" />
            ))}
          </g>
          {/* 卓の稜。二重線で引き、静物を地面に着ける */}
          <Contour d="M62 604 L540 552" w={3} o={0.72} />
          <g stroke={BLACK} fill="none" opacity="0.5">
            <line x1="62" y1="616" x2="540" y2="564" strokeWidth="1.1" />
          </g>
          {/* パイプ。ブラックの静物の常連 */}
          <Contour d="M152 472 c -18 -2, -28 8, -26 21 c 2 13, 17 19, 32 15" w={2.6} o={0.82} />
          <Contour d="M158 510 L258 538" w={2.2} o={0.82} />

          {/* 音孔。正面から見た円と、斜めから見た楕円。多視点の同時提示 */}
          <circle cx="246" cy="448" r="34" fill="#1a1d20" />
          <circle cx="246" cy="448" r="34" fill="none" stroke={LIGHT} strokeWidth="2.4" opacity="0.6" />
          <ellipse cx="374" cy="336" rx="27" ry="9" fill="#1a1d20" opacity="0.85" transform="rotate(22 374 336)" />

          <FHole x={192} y={498} s={1.2} />
          <FHole x={330} y={522} s={1.2} flip />

          {/* グラス。真上から見た楕円と、横から見た台形を1本の辺で繋ぐ */}
          <Contour d="M392 282 A 48 17 0 1 0 488 282 A 48 17 0 1 0 392 282" w={2.5} />
          <Contour d="M392 282 L406 374 L474 374 L488 282" w={2.5} />
          <g fill="none" stroke={BLACK} opacity="0.7">
            <path d="M406 374 L424 410 L456 410 L474 374" strokeWidth="1.8" />
            <ellipse cx="440" cy="282" rx="31" ry="10" strokeWidth="1.3" opacity="0.7" />
          </g>

          {/* 壜。同じ首を9度ずらして2度描く。ここも多視点 */}
          <Contour d="M138 240 L138 292 C 138 314, 124 320, 124 346 L124 446" w={2.5} o={0.82} />
          <Contour d="M188 234 L188 288 C 188 310, 202 316, 202 342 L202 440" w={2.5} o={0.82} />
          <Contour d="M138 240 L188 234" w={2.5} o={0.82} />
          <g transform="rotate(9 164 340)" opacity="0.42" fill="none" stroke={BLACK} strokeWidth="2.4">
            <path d="M138 240 L138 292 C 138 314, 124 320, 124 346 L124 446" />
            <path d="M188 234 L188 288 C 188 310, 202 316, 202 342 L202 440" />
          </g>

          {/* 定規で引いた当たり線。ブラックはこれを消さずに残す */}
          <g stroke={BLACK} opacity="0.3" strokeWidth="0.8">
            <line x1="40" y1="200" x2="560" y2="332" />
            <line x1="176" y1="20" x2="300" y2="700" />
            <line x1="560" y1="120" x2="60" y2="560" />
          </g>

          {/* ⑤ 手前の面。線の一部をここで沈める */}
          <g opacity="0.34">
            {base.filter((_, i) => i % 5 === 2).map((c, i) => (
              <polygon key={`t${i}`} points={c.pts} fill={c.fill} />
            ))}
          </g>

          {/* ⑥ ステンシル。最後に置く。橋の穴から下の面が透ける */}
          <g mask={`url(#${P}-stencil)`}>
            <text x="292" y="258" fill={BLACK} fontFamily={SANS} fontSize="66" fontWeight="700"
                  letterSpacing="8" opacity="0.9">
              JOU
            </text>
          </g>
          <text x="170" y="652" fill={BLACK} fontFamily={SANS} fontSize="22" fontWeight="700"
                letterSpacing="5" opacity="0.85" transform="rotate(-7 170 652)">
            VALSE
          </text>
        </g>

        {/* だまし絵の釘。ブラックが画面に1本だけ描き込んだあれ */}
        <g>
          <ellipse cx="504" cy="96" rx="9.5" ry="7" fill="#5c574a" />
          <ellipse cx="502" cy="94" rx="5" ry="3.4" fill="#a29a86" />
          <path d="M511 101 L531 122" stroke={BLACK} strokeWidth="4" opacity="0.3" strokeLinecap="round" />
        </g>

        {/* 題字。楕円の外、素の麻布の上に置く */}
        <g fill={BLACK} fontFamily={SANS}>
          <text x="52" y="748" fontSize="14" fontWeight="700" letterSpacing="6">CUBISME</text>
          <text x="52" y="768" fontSize="8.5" fontWeight="600" letterSpacing="2.4" opacity="0.62">
            ANALYTIQUE — PARIS 1912
          </text>
          <text x="548" y="768" fontSize="8.5" fontWeight="600" letterSpacing="2.4" opacity="0.62" textAnchor="end">
            HUILE ET PAPIERS COLLES
          </text>
        </g>

        {/* 麻布の目。紙ではなく布。強くすると絵が白ちゃけるので控えめに */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.13"
              style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.12"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
