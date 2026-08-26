/**
 * デコンストラクティビズム。
 *
 * 1988年、MoMA の《Deconstructivist Architecture》展。
 * アイゼンマン、リベスキンド、ハディド、チュミ。
 *
 * ■ 同じ「幾何を斜めに散らす」でも、シュプレマティズムと構成主義とは
 *   まったく別の絵にしなければならない。分けかたはこう決めた。
 *   ・シュプレマティズム＝白のなかに**塗った矩形**が浮く。線は無い。
 *   ・ロシア構成主義＝赤と黒の**宣伝ビラ**。文字が主役。
 *   ・デコン＝**建築の図面**。細い線・破線・断面の黒塗り・引出線と注記。
 *     塗りではなく線が主で、色は冷たい灰青しか使わない。
 *
 * ■ この様式の技法
 *   1. **分解軸測投影（exploded axonometric）。** ひとつの塊を破片に割り、
 *      それぞれを別の方向へ滑らせる。もとの位置は破線の残像で残し、
 *      引出線で結ぶ。建築の図面がそのまま様式の主題になっている。
 *   2. **格子の解体。** 背景の方眼は、左上では直交しているのに、
 *      右下へ行くほど回転と伸びが効いて崩れる。破っている相手を
 *      同じ画面に描いておかないと、ただの散らかりに見える。
 *   3. **題字を切ってずらす。** 1本の水平線で断ち、下半分だけ右へ送る。
 *      文字も構造物として扱い、同じ操作にかける。
 *   4. **断面の黒塗り（ポシェ）。** 切り口だけベタで潰す製図の作法。
 */

const P = "dec";
const PAPER = "#eceae4";
const INK = "#141414";
const RED = "#d64545";
const SLATE = "#5b6b7a";
const GREY = "#9aa3ab";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

type Pt = [number, number];

/* 軸測投影。+x は右下、+y は左下、+z は真上 */
const U = 42;
const OX = 336;
const OY = 462;
const iso = (x: number, y: number, z: number): Pt => [
  OX + (x - y) * U * 0.866,
  OY + (x + y) * U * 0.5 - z * U,
];

type Slab = {
  x: number; y: number; z: number; w: number; d: number; h: number;
  dx: number; dy: number; dz: number;
  top: string; left: string; right: string;
  label?: string;
};

/* 破片。奥から手前の順に並べる（軸測なので描画順がそのまま前後になる） */
const SLABS: Slab[] = [
  { x: 0, y: 0, z: 0, w: 3.2, d: 3.2, h: 0.45, dx: 0, dy: 0, dz: 0,
    top: "#e2e0d9", left: "#b6bcc2", right: "#7f8b95" },
  { x: 0, y: 0, z: 0.45, w: 1.25, d: 3.2, h: 1.7, dx: -1.15, dy: 0.1, dz: 0.15,
    top: "#dedbd3", left: "#aeb6bd", right: SLATE, label: "A" },
  { x: 0, y: 2.0, z: 2.15, w: 3.2, d: 1.2, h: 0.4, dx: -0.25, dy: 1.05, dz: 1.15,
    top: "#e4e2db", left: "#c0c5ca", right: "#8b959d", label: "C" },
  { x: 1.95, y: 0, z: 0.45, w: 1.25, d: 1.35, h: 2.5, dx: 0.75, dy: -0.95, dz: 0.3,
    top: "#dcd9d1", left: "#a7b0b8", right: "#4e5c69", label: "B" },
  /* 断面の黒塗り。切り口だけ潰す */
  { x: 1.35, y: 1.4, z: 0.45, w: 0.55, d: 0.55, h: 1.5, dx: 0, dy: 0, dz: 0,
    top: INK, left: INK, right: INK },
  { x: 0.25, y: 1.15, z: 2.15, w: 2.7, d: 0.16, h: 1.3, dx: 0.45, dy: 1.5, dz: 0.55,
    top: "#e57c7c", left: RED, right: "#a83a3a", label: "D" },
  { x: 1.2, y: 1.2, z: 2.6, w: 1.0, d: 1.0, h: 1.0, dx: 1.55, dy: 0.7, dz: 1.5,
    top: "#e4e2db", left: "#b6bcc2", right: "#77838d", label: "E" },
];

/** 箱ひとつ。見えるのは天・左・右の3面 */
function Box({ s, ghost }: { s: Slab; ghost?: boolean }) {
  const o = ghost ? { dx: 0, dy: 0, dz: 0 } : { dx: s.dx, dy: s.dy, dz: s.dz };
  const X = s.x + o.dx;
  const Y = s.y + o.dy;
  const Z = s.z + o.dz;
  const f = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const top = f([
    iso(X, Y, Z + s.h), iso(X + s.w, Y, Z + s.h), iso(X + s.w, Y + s.d, Z + s.h), iso(X, Y + s.d, Z + s.h),
  ]);
  const right = f([
    iso(X + s.w, Y, Z), iso(X + s.w, Y + s.d, Z), iso(X + s.w, Y + s.d, Z + s.h), iso(X + s.w, Y, Z + s.h),
  ]);
  const left = f([
    iso(X, Y + s.d, Z), iso(X + s.w, Y + s.d, Z), iso(X + s.w, Y + s.d, Z + s.h), iso(X, Y + s.d, Z + s.h),
  ]);
  if (ghost) {
    return (
      <g fill="none" stroke={SLATE} strokeWidth="0.75" strokeDasharray="5 3" opacity="0.75">
        <polygon points={top} />
        <polygon points={right} />
        <polygon points={left} />
      </g>
    );
  }
  return (
    <g stroke={INK} strokeWidth="0.8" strokeLinejoin="round">
      <polygon points={right} fill={s.right} />
      <polygon points={left} fill={s.left} />
      <polygon points={top} fill={s.top} />
    </g>
  );
}

/**
 * 注記。引出線の先は**破片の実座標から計算する**。
 * 初稿は先端の座標を手で書いたので、4本とも何も無い所を指していた。
 */
const NOTES: { x: number; y: number; t: string; sub: string; slab: string; rot: number }[] = [
  /* 引出線が版面を横断しないよう、破片のある側に注記を置く。
     初稿は E の注記を右下に置いたので、線が模型を丸ごと斜めに切っていた */
  { x: 40, y: 300, t: "A — WALL", sub: "DISPLACED 1150", slab: "A", rot: -3 },
  { x: 446, y: 238, t: "E — VOID", sub: "FREE", slab: "E", rot: 2.5 },
  { x: 452, y: 664, t: "B — CORE", sub: "ROTATED 34°", slab: "B", rot: -3 },
  { x: 36, y: 606, t: "D — FIN", sub: "SECTION 1:50", slab: "D", rot: 3 },
];

/** 破片の芯（動かしたあと）の画面座標 */
function anchor(label: string): Pt {
  const s = SLABS.find((v) => v.label === label)!;
  return iso(s.x + s.dx + s.w / 2, s.y + s.dy + s.d / 2, s.z + s.dz + s.h / 2);
}

export default function Plate() {
  /* ── 解体される格子 ────────────────────────────────────────
     左上では直交、右下へ行くほど回転と伸びが効く。
     頂点を先に全部変形させてから折れ線を引くので、
     線どうしの交点が最後まで保たれ、「歪んだ格子」であって
     「散らばった線」にはならない */
  const GC = 17;
  const GR = 23;
  const warp = (x: number, y: number): Pt => {
    const t = Math.min(1, Math.max(0, (x / 600) * 0.42 + (y / 800) * 0.78));
    const a = (38 * Math.pow(t, 1.7) * Math.PI) / 180;
    const k = 1 + 0.16 * t;
    const px = 40;
    const py = 30;
    const dx = (x - px) * k;
    const dy = (y - py) * k;
    return [px + dx * Math.cos(a) - dy * Math.sin(a), py + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const GV: Pt[][] = [];
  for (let j = 0; j <= GR; j++) {
    const row: Pt[] = [];
    for (let i = 0; i <= GC; i++) row.push(warp((i * 660) / GC - 30, (j * 880) / GR - 40));
    GV.push(row);
  }
  const poly = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="デコンストラクティビズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 題字を断つ2枚。上半分と下半分を別々に置く */}
        {/* 上半分は y<102 で断つ。下半分は 107 から出し、下の字は 5 だけ下げて描く。
            こうすると継ぎ目に 5 の白い隙が開き、字の形は連続したまま切れる。
            隙を作らずに横へ送るだけだと、上下の字が噛み合って読めなくなった */}
        <clipPath id={`${P}-tt`}>
          <rect x="0" y="0" width="600" height="102" />
        </clipPath>
        <clipPath id={`${P}-tb`}>
          <rect x="0" y="107" width="600" height="76" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 解体される格子 */}
        <g fill="none" stroke={GREY} strokeWidth="0.65" opacity="0.62">
          {GV.map((row, j) => (
            <polyline key={`h${j}`} points={poly(row)} />
          ))}
          {Array.from({ length: GC + 1 }, (_, i) => (
            <polyline key={`v${i}`} points={poly(GV.map((row) => row[i]))} />
          ))}
        </g>

        {/* もとの位置の残像。破線で置いてから、破片を上に載せる */}
        {SLABS.filter((s) => s.dx || s.dy || s.dz).map((s, i) => (
          <Box key={`g${i}`} s={s} ghost />
        ))}
        {/* 引出線。残像の芯から動かした先へ */}
        <g stroke={INK} strokeWidth="0.6" strokeDasharray="2.5 3" opacity="0.55">
          {SLABS.filter((s) => s.dx || s.dy || s.dz).map((s, i) => {
            const a = iso(s.x + s.w / 2, s.y + s.d / 2, s.z + s.h / 2);
            const b = iso(s.x + s.dx + s.w / 2, s.y + s.dy + s.d / 2, s.z + s.dz + s.h / 2);
            return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
          })}
        </g>

        {/* 破片 */}
        {SLABS.map((s, i) => (
          <Box key={`s${i}`} s={s} />
        ))}

        {/* 別の系の面が1枚、模型を斜めに貫く。
            層と層が噛み合わずに衝突する、というのがこの様式の骨格 */}
        <g>
          <polygon points="-20,548 372,392 620,486 236,700" fill={SLATE} opacity="0.16" />
          <polygon points="-20,548 372,392 620,486 236,700" fill="none" stroke={SLATE} strokeWidth="0.9" opacity="0.8" />
          <line x1="-20" y1="548" x2="620" y2="486" stroke={SLATE} strokeWidth="0.6" strokeDasharray="4 4" opacity="0.6" />
        </g>

        {/* 赤の細線。図面に引かれた新しい軸。3本だけ */}
        {/* 赤は「新しい軸」1本と、基準線1本だけ。
            初稿は全面を貫く斜線を3本引いて、紙の引っかき傷に見えた */}
        <g stroke={RED} strokeWidth="1" opacity="0.92">
          <line x1="118" y1="700" x2="536" y2="252" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const t = i / 5;
            const x = 118 + (536 - 118) * t;
            const y = 700 + (252 - 700) * t;
            return <line key={i} x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} strokeWidth="0.8" />;
          })}
          <line x1="-10" y1="716" x2="610" y2="612" strokeDasharray="8 5" strokeWidth="0.8" />
        </g>

        {/* 断ってずらした題字 */}
        {/* 断ってずらした題字。初稿は断ち位置に赤い罫を引いたので、
            ずれではなく「取り消し線」に見えた。罫は外した。
            送りは 9 まで。16 でも 30 でも、上下の字が噛み合って読めなくなった */}
        <g clipPath={`url(#${P}-tt)`}>
          <text x="42" y="112" fill={INK} fontFamily={SANS} fontSize="39" fontWeight="700" letterSpacing="2.2">
            DECONSTRUCTIVISM
          </text>
        </g>
        <g clipPath={`url(#${P}-tb)`}>
          <text x="51" y="117" fill={INK} fontFamily={SANS} fontSize="39" fontWeight="700" letterSpacing="2.2">
            DECONSTRUCTIVISM
          </text>
        </g>
        <text x="42" y="140" fill={SLATE} fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="3.2">
          COUPE HORIZONTALE — DECALAGE 9, FENTE 5
        </text>

        {/* 注記と引出線 */}
        <g>
          {NOTES.map((n, i) => {
            const [tx, ty] = anchor(n.slab);
            return (
            <g key={i}>
              <line x1={n.x + 4} y1={n.y + 4} x2={tx} y2={ty} stroke={INK} strokeWidth="0.6" opacity="0.75" />
              <circle cx={tx} cy={ty} r="2.2" fill={INK} />
              <g transform={`rotate(${n.rot} ${n.x} ${n.y})`}>
                <text x={n.x} y={n.y} fill={INK} fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.6">
                  {n.t}
                </text>
                <text x={n.x} y={n.y + 11} fill={SLATE} fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.4">
                  {n.sub}
                </text>
              </g>
            </g>
            );
          })}
        </g>

        {/* 図面の耳。寸法・縮尺・図番。細かいほど図面らしくなる */}
        <g fill={INK} fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.5" opacity="0.8">
          <text x="42" y="748">AXONOMETRIE — ECLATEE</text>
          <text x="42" y="762" fill={SLATE}>GRILLE ORTHOGONALE, DEFORMEE 0° → 38°</text>
          <text x="558" y="762" textAnchor="end">MoMA 1988 — DWG 04</text>
        </g>
        <line x1="42" y1="726" x2="558" y2="726" stroke={INK} strokeWidth="0.7" opacity="0.6" />
        {/* 縮尺の目盛り */}
        <g>
          <rect x="440" y="734" width="118" height="5" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.7" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={440 + i * 29.5} y="734" width="14.75" height="5" fill={INK} opacity={i % 2 ? 0.75 : 0} />
          ))}
        </g>

      </g>
    </svg>
  );
}
