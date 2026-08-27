/**
 * オプ・アート。
 *
 * ヴァザルリの《ヴェガ》。平らな格子を、球の膨らみと窪みで歪ませる。
 * 絵の側は完全に静止しているのに、目のほうが動いてしまう。
 *
 * ■ この様式でしか成立しない仕掛け
 *   1. **格子を歪ませるのであって、球を描かない。** 陰影も輪郭も一切使わない。
 *      升目の大きさが場所で変わる、それだけで球が出てくる。ここを
 *      グラデーションで作った瞬間、オプ・アートではなくただの3D絵になる。
 *   2. **膨らみと窪みを一対で置く。** 膨らみだけだと「レンズを載せた市松」に
 *      見える。逆向きの歪みが隣にあると、面ぜんたいが呼吸して見える。
 *   3. **形も一緒に変える。** 中心へ行くほど升目の角が丸くなり、円に近づく。
 *      縁では正方形のまま。四角と丸のあいだの中間形が、目を落ち着かなくさせる。
 *   4. **色は膨らみの中だけ。** 外は黒と生成りの市松。中だけ紺から赤へ振る。
 *      全面に色を撒くと錯視が弱まる。
 *
 * ■ 歪ませかた
 *   球化：中心からの距離 r を r' = R·(r/R)^p に置き換える。
 *   p<1 で外へ押し出され（膨らみ）、p>1 で内へ吸い込まれる（窪み）。
 *   r=R で r'=R なので、縁で必ず連続する。継ぎ目が出ない。
 *   頂点を先に歪ませてから升目を作るので、隣の升目とは必ず辺を共有する。
 */

const P = "op";
const WHITE = "#ffffff";
const INK = "#000000";
const RED = "#e63946";
const NAVY = "#1d3557";
const CREAM = "#f1faee";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const COLS = 22;
const ROWS = 30;
const CW = 600 / COLS;
const CH = 800 / ROWS;

/* 膨らみ。版面の左上寄りに置き、真ん中に置かない */
const B = { x: 262, y: 300, r: 246, p: 0.62 };
/* 窪み。膨らみの右下に、小さく。
   初稿では膨らみと重なって、球の右下の縁がねじれて事故に見えた。
   中心間の距離（393）が半径の和（378）を超えるところまで離してある */
const D = { x: 466, y: 636, r: 132, p: 1.4 };

type Pt = [number, number];

/** 球化。r<R の内側だけ半径を付け替える */
function warp1(p: Pt, s: { x: number; y: number; r: number; p: number }): Pt {
  const dx = p[0] - s.x;
  const dy = p[1] - s.y;
  const r = Math.hypot(dx, dy);
  if (r >= s.r || r < 0.0001) return p;
  const nr = s.r * Math.pow(r / s.r, s.p);
  const k = nr / r;
  return [s.x + dx * k, s.y + dy * k];
}
const warp = (p: Pt): Pt => warp1(warp1(p, B), D);

/** 角を丸めた四辺形。k=0 で正方形、k=1 で円に近づく */
function roundQuad(Q: Pt[], k: number) {
  if (k <= 0.02) return `M${Q.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")} Z`;
  const t = Math.min(0.5, k * 0.5);
  const at = (i: number): Pt => {
    const c = Q[i];
    const pv = Q[(i + 3) % 4];
    return [c[0] + (pv[0] - c[0]) * t, c[1] + (pv[1] - c[1]) * t];
  };
  const bt = (i: number): Pt => {
    const c = Q[i];
    const nx = Q[(i + 1) % 4];
    return [c[0] + (nx[0] - c[0]) * t, c[1] + (nx[1] - c[1]) * t];
  };
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let d = `M${f(at(0))}`;
  for (let i = 0; i < 4; i++) {
    d += ` Q${f(Q[i])} ${f(bt(i))} L${f(at((i + 1) % 4))}`;
  }
  return d + " Z";
}

/** 2色を混ぜる。球の中を紺から赤へ振るのに使う */
function mix(a: string, b: string, t: number) {
  const na = parseInt(a.slice(1), 16);
  const nb = parseInt(b.slice(1), 16);
  const ch = [16, 8, 0].map((s) => {
    const ca = (na >> s) & 255;
    const cb = (nb >> s) & 255;
    return Math.round(ca + (cb - ca) * Math.max(0, Math.min(1, t)));
  });
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export default function Plate() {
  /* 頂点を先に全部歪ませる。升目はそのあと4点を拾って作るので、
     隣どうしが必ず同じ辺を共有し、隙間も重なりも出ない */
  const V: Pt[][] = [];
  for (let j = -1; j <= ROWS + 1; j++) {
    const row: Pt[] = [];
    for (let i = -1; i <= COLS + 1; i++) row.push(warp([i * CW, j * CH]));
    V.push(row);
  }

  const cells: { d: string; fill: string }[] = [];
  for (let j = 0; j < V.length - 1; j++) {
    for (let i = 0; i < V[0].length - 1; i++) {
      const Q: Pt[] = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]];
      const cx = (Q[0][0] + Q[1][0] + Q[2][0] + Q[3][0]) / 4;
      const cy = (Q[0][1] + Q[1][1] + Q[2][1] + Q[3][1]) / 4;
      const dark = (i + j) % 2 === 0;

      const rb = Math.hypot(cx - B.x, cy - B.y);
      const inB = rb < B.r;
      /* 角の丸みは球の中心で最大。縁では正方形に戻る */
      const k = inB ? Math.pow(1 - rb / B.r, 0.9) : 0;

      let fill: string;
      if (inB) {
        const t = 0.5 + (0.5 * (cx - B.x + (cy - B.y))) / (B.r * 1.42);
        fill = dark ? mix(NAVY, RED, t) : WHITE;
      } else {
        fill = dark ? INK : CREAM;
      }
      cells.push({ d: roundQuad(Q, k), fill });
    }
  }

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="オプ・アート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />
        {cells.map((c, i) => (
          <path key={i} d={c.d} fill={c.fill} />
        ))}

        {/* 奥付の帯。図は全面に敷いたままにして、下の48だけ目を休ませる。
            錯視の面のなかに文字を置くと、文字が動いて読めなくなる */}
        <rect x="0" y="752" width="600" height="48" fill={CREAM} />
        <rect x="0" y="752" width="600" height="2.5" fill={INK} />
        <text x="26" y="782" fill={INK} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="9">
          OP ART
        </text>
        <text x="574" y="782" fill={INK} fontFamily={SANS} fontSize="8.5" fontWeight="600" letterSpacing="2.4"
              textAnchor="end" opacity="0.75">
          THE RESPONSIVE EYE — 1965
        </text>
        {/* 歪みの式を、いちばん小さい字で1行だけ添える */}
        <text x="300" y="782" fill={INK} fontFamily={SANS} fontSize="7" fontWeight="600" letterSpacing="1.4"
              textAnchor="middle" opacity="0.45">
          r' = R (r/R)^p
        </text>
      </g>
    </svg>
  );
}
