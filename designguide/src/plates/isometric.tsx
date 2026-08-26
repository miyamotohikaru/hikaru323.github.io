/**
 * アイソメトリック（等角投影）。
 *
 * 3本の軸を等しい角度で倒す製図法。消点が無いので、奥の物も手前の物も
 * 同じ大きさで描かれ、どこを測っても同じ縮尺で読める。
 * 図解と UI の絵がこれを選ぶのは、その「測れる」性質のため。
 *
 * ■ 投影を式で持つ
 *   画面座標 = ( (x−y)·cos30 , (x+y)·sin30 − z )
 *   目分量で平行四辺形を置くと必ず角度が狂う。式で持てば狂わない。
 *
 * ■ 面の上に絵を描くための行列
 *   面ごとに「その面のローカル座標 → 画面」の行列を作り、
 *   matrix(...) で包む。すると面の上に、普通の直交座標のつもりで
 *   棒グラフでも文字でも置ける（自動的に等角に倒れる）。
 *     天面   matrix( cos30,  sin30, −cos30, sin30, …)
 *     右の面 matrix(−cos30,  sin30,      0,    −1, …)
 *     左の面 matrix( cos30,  sin30,      0,    −1, …)
 *   これを使わずに1点ずつ手で置くと、円が正しく潰れない。
 *
 * ■ 図版の主題
 *   等角投影が最もよく使われる形＝「積層した層の分解図」にした。
 *   地の菱形格子・浮いた版・破線の投影線・30度の角度記号まで入れて、
 *   投影法そのものが主題であることを見せる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "iso";

const PAPER = "#eef1f6";
const BLUE = "#3b5bdb";
const PURPLE = "#7048e8";
const ORANGE = "#f76707";
const INK = "#141726";

const BLUE_D = "#2a43a8";
const PURPLE_D = "#5333b5";
const FACE_T = "#f7f9fc";

/* ── 投影 ─────────────────────────────────────────────────── */
const K = Math.cos(Math.PI / 6); // 0.8660254
const OX = 300;
const OY = 520;

const iso = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * K, OY + (x + y) * 0.5 - z];
const poly = (arr: [number, number, number][]) =>
  arr.map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(1)).join(",")).join(" ");

/** 天面のローカル座標 (u,v) → 画面 */
const mTop = (z: number) => `matrix(${K} 0.5 ${-K} 0.5 ${OX} ${OY - z})`;
/** 右の面（x = x0）。ローカルは (y, 高さ) */
const mRight = (x0: number, z0: number) => `matrix(${-K} 0.5 0 -1 ${OX + x0 * K} ${OY + x0 * 0.5 - z0})`;
/** 左の面（y = y0）。ローカルは (x, 高さ) */
const mLeft = (y0: number, z0: number) => `matrix(${K} 0.5 0 -1 ${OX - y0 * K} ${OY + y0 * 0.5 - z0})`;

/* ── 文字を置くための面の行列 ───────────────────────────────
   上の3つは「高さが上向き」の座標系なので、そのまま <text> を入れると
   天地が逆になり、右の面では左右も逆になる（初稿で実際にそうなった）。
   文字用には、原点＝面の左上・+x が読む向き・+y が下、の行列を別に作る */
const mRightTxt = (x0: number, zTop: number, a = 104) =>
  `matrix(${K} -0.5 0 1 ${OX + (x0 - a) * K} ${OY + (x0 + a) * 0.5 - zTop})`;
const mLeftTxt = (y0: number, zTop: number, a = 104) =>
  `matrix(${K} 0.5 0 1 ${OX - (a + y0) * K} ${OY + (y0 - a) * 0.5 - zTop})`;

const A = 104; // 版の半径（x,y とも −A..A）

/** 直方体の版。天・右・左の3面 */
function Slab({ z0, z1, top, right, left, a = A }: { z0: number; z1: number; top: string; right: string; left: string; a?: number }) {
  return (
    <g>
      <polygon points={poly([[-a, -a, z1], [a, -a, z1], [a, a, z1], [-a, a, z1]])} fill={top} />
      <polygon points={poly([[a, -a, z1], [a, a, z1], [a, a, z0], [a, -a, z0]])} fill={right} />
      <polygon points={poly([[-a, a, z1], [a, a, z1], [a, a, z0], [-a, a, z0]])} fill={left} />
      <polygon
        points={poly([[-a, -a, z1], [a, -a, z1], [a, a, z1], [-a, a, z1]])}
        fill="none" stroke={INK} strokeWidth="1.1" opacity="0.45"
      />
      <path
        d={`M${iso(a, -a, z1).join(" ")} L${iso(a, -a, z0).join(" ")} M${iso(a, a, z1).join(" ")} L${iso(a, a, z0).join(" ")} M${iso(-a, a, z1).join(" ")} L${iso(-a, a, z0).join(" ")}`}
        stroke={INK} strokeWidth="1.1" opacity="0.45" fill="none"
      />
      <path
        d={`M${iso(a, -a, z0).join(" ")} L${iso(a, a, z0).join(" ")} L${iso(-a, a, z0).join(" ")}`}
        stroke={INK} strokeWidth="1.1" opacity="0.45" fill="none"
      />
    </g>
  );
}

/** 立方体。分解図の周りに散らす */
function Cube({ x, y, z, s, c1, c2, c3 }: { x: number; y: number; z: number; s: number; c1: string; c2: string; c3: string }) {
  const h = s / 2;
  return (
    <g>
      <polygon points={poly([[x - h, y - h, z + s], [x + h, y - h, z + s], [x + h, y + h, z + s], [x - h, y + h, z + s]])} fill={c1} />
      <polygon points={poly([[x + h, y - h, z + s], [x + h, y + h, z + s], [x + h, y + h, z], [x + h, y - h, z]])} fill={c2} />
      <polygon points={poly([[x - h, y + h, z + s], [x + h, y + h, z + s], [x + h, y + h, z], [x - h, y + h, z]])} fill={c3} />
    </g>
  );
}

const Z0 = 0;
const Z1 = 16;
const ZB0 = 122;
const ZB1 = 136;
const ZC0 = 244;
const ZC1 = 258;

export default function Plate() {
  const r = rand(20250330);

  /* 中段の節点。天面のローカル座標で置く */
  const nodes = Array.from({ length: 11 }, () => [r(-86, 86), r(-86, 86)] as [number, number]);
  const links: [number, number][] = [[0, 3], [3, 5], [5, 8], [8, 10], [1, 4], [4, 6], [6, 9], [2, 3], [7, 5], [1, 7], [2, 9], [0, 6]];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アイソメトリック様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <linearGradient id={`${P}-bg`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f7f9fc" />
          <stop offset="1" stopColor="#dfe5f0" />
        </linearGradient>
        {/* 菱形格子。等角投影の骨。60度の平行四辺形を1枚のタイルにする */}
        <pattern
          id={`${P}-lattice`}
          width={K * 2 * 26} height={26}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${OX} ${OY})`}
        >
          <path d={`M0 0 L${K * 26} 13 L${K * 52} 0 M0 26 L${K * 26} 13 L${K * 52} 26`} stroke={INK} strokeWidth="0.8" fill="none" opacity="0.5" />
        </pattern>
        <linearGradient id={`${P}-glass`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#cdd8ee" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-bg)`} />
        {/* 地の菱形格子 */}
        <rect width="600" height="800" fill={`url(#${P}-lattice)`} opacity="0.34" />

        {/* ── 題字。図面の表題欄のように、左上に組む ───────────── */}
        <text x="40" y="88" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="46" fontWeight="800" letterSpacing="-1.4">
          ISOMETRIC
        </text>
        <line x1="40" y1="102" x2="286" y2="102" stroke={ORANGE} strokeWidth="2.6" />
        <text x="40" y="122" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="10" fontWeight="700" letterSpacing="2.2" opacity="0.75">
          30° · SCALE 1:1:1 · NO VANISHING POINT
        </text>

        {/* ── 接地影 ─────────────────────────────────────── */}
        <polygon points={poly([[-A - 10, -A - 10, -34], [A + 10, -A - 10, -34], [A + 10, A + 10, -34], [-A - 10, A + 10, -34]])} fill={INK} opacity="0.07" />

        {/* ── 投影線。上の版の角から地まで垂らす ────────────── */}
        <g stroke={INK} strokeWidth="1" strokeDasharray="5 5" opacity="0.4">
          {([[-A, -A], [A, -A], [A, A], [-A, A]] as [number, number][]).map(([x, y], i) => (
            <line key={i} x1={iso(x, y, ZC1)[0]} y1={iso(x, y, ZC1)[1]} x2={iso(x, y, -34)[0]} y2={iso(x, y, -34)[1]} />
          ))}
        </g>

        {/* ── 版1（地）。天面に街区、周りに立方体 ───────────── */}
        <Slab z0={Z0 - 16} z1={Z1} top="#dde4f2" right={BLUE} left={BLUE_D} />
        <g transform={mTop(Z1)}>
          {/* 天面の細かい格子。ローカル座標で普通に引けば等角に倒れる */}
          <g stroke={INK} strokeWidth="0.9" opacity="0.28">
            {Array.from({ length: 9 }, (_, i) => {
              const t = -A + (i * 2 * A) / 8;
              return <g key={i}><line x1={t} y1={-A} x2={t} y2={A} /><line x1={-A} y1={t} x2={A} y2={t} /></g>;
            })}
          </g>
          {/* 道。天面に直交する2本 */}
          <rect x={-A} y={-14} width={2 * A} height="28" fill="#c6d0e6" />
          <rect x={22} y={-A} width="26" height={2 * A} fill="#c6d0e6" />
          <line x1={-A} y1="0" x2={A} y2="0" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="10 9" />
          <line x1="35" y1={-A} x2="35" y2={A} stroke="#ffffff" strokeWidth="2.4" strokeDasharray="10 9" />
        </g>
        {/* 街区の箱。版の上に建てる */}
        {([[-62, -60, 44, 26], [-30, -66, 30, 34], [-66, 46, 34, 20], [-24, 52, 26, 30], [72, -58, 22, 40], [76, 44, 26, 22]] as [number, number, number, number][]).map(
          ([x, y, s, h], i) => (
            <g key={i}>
              <polygon points={poly([[x - s / 2, y - s / 2, Z1 + h], [x + s / 2, y - s / 2, Z1 + h], [x + s / 2, y + s / 2, Z1 + h], [x - s / 2, y + s / 2, Z1 + h]])} fill={FACE_T} />
              <polygon points={poly([[x + s / 2, y - s / 2, Z1 + h], [x + s / 2, y + s / 2, Z1 + h], [x + s / 2, y + s / 2, Z1], [x + s / 2, y - s / 2, Z1]])} fill="#b9c6e4" />
              <polygon points={poly([[x - s / 2, y + s / 2, Z1 + h], [x + s / 2, y + s / 2, Z1 + h], [x + s / 2, y + s / 2, Z1], [x - s / 2, y + s / 2, Z1]])} fill="#93a4cd" />
              {/* 窓。左の面のローカル座標で刻む */}
              <g transform={mLeft(y + s / 2, Z1)} opacity="0.75">
                {Array.from({ length: Math.max(1, Math.floor(h / 12)) }, (_, k) =>
                  Array.from({ length: Math.max(1, Math.floor(s / 12)) }, (_, j) => (
                    <rect key={`${k}-${j}`} x={x - s / 2 + 4 + j * 12} y={6 + k * 12} width="6" height="6" fill={INK} opacity="0.4" />
                  )),
                )}
              </g>
            </g>
          ),
        )}
        {/* 版1の側面の刻み。目盛りを打つと「測れる図」になる */}
        <g transform={mRightTxt(A, Z1)}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={i * 26} y1={32} x2={i * 26} y2={32 - (i % 2 ? 8 : 14)} stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
          ))}
          <text x="10" y="13" fill="#ffffff" fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" opacity="0.9">
            GROUND PLANE Z=0
          </text>
        </g>

        {/* ── 版2（節点）。半透明にして下の版を透かす ────────── */}
        <Slab z0={ZB0} z1={ZB1} top={`url(#${P}-glass)`} right={PURPLE} left={PURPLE_D} />
        <g transform={mTop(ZB1)}>
          {links.map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={PURPLE} strokeWidth="1.8" opacity="0.7" />
          ))}
          {nodes.map(([x, y], i) => (
            <g key={i}>
              {/* 円は行列の中で自動的に等角に潰れる。手で楕円を置くと必ず狂う */}
              <circle cx={x} cy={y} r={i % 4 === 0 ? 11 : 7} fill={i % 4 === 0 ? ORANGE : "#ffffff"} stroke={PURPLE_D} strokeWidth="2" />
              {i % 4 === 0 && <circle cx={x} cy={y} r="19" fill="none" stroke={ORANGE} strokeWidth="1.4" strokeDasharray="4 4" />}
            </g>
          ))}
        </g>
        {/* 検分で直した：x=10 だと、上に載る版3の張り出しに
            頭の3文字が食われて「PH LAYER Z=122」に見えていた。
            隠れる幅ぶん右へ送る */}
        <g transform={mRightTxt(A, ZB1)}>
          <text x="44" y="11" fill="#ffffff" fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" opacity="0.9">
            GRAPH LAYER Z=122
          </text>
        </g>

        {/* ── 版3（画面）。天面に図表を描く ────────────────── */}
        <Slab z0={ZC0} z1={ZC1} top="#ffffff" right={BLUE} left={BLUE_D} />
        <g transform={mTop(ZC1)}>
          {/* 目盛り */}
          <g stroke={INK} strokeWidth="0.9" opacity="0.16">
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={-88} y1={-70 + i * 28} x2={88} y2={-70 + i * 28} />
            ))}
          </g>
          {/* 棒。ローカルでは普通の棒グラフ。倒れて等角になる */}
          {[38, 62, 30, 78, 52, 88, 44].map((h, i) => (
            <rect key={i} x={-84 + i * 24} y={70 - h} width="16" height={h} fill={i === 5 ? ORANGE : BLUE} opacity={i === 5 ? 1 : 0.85} />
          ))}
          {/* 折れ線 */}
          <polyline
            points={[52, 24, 66, 12, 40, 6, 30].map((v, i) => `${-76 + i * 24},${-6 - v}`).join(" ")}
            fill="none" stroke={PURPLE} strokeWidth="2.6"
          />
          {[52, 24, 66, 12, 40, 6, 30].map((v, i) => (
            <circle key={i} cx={-76 + i * 24} cy={-6 - v} r="3.4" fill="#ffffff" stroke={PURPLE} strokeWidth="2" />
          ))}
          <line x1={-88} y1={70} x2={88} y2={70} stroke={INK} strokeWidth="1.6" opacity="0.5" />
          {/* 目盛りの数字。天面の文字は30度剪断されるので、極力短く */}
          {[0, 2, 4, 6].map((i) => (
            <text
              key={i}
              x={-84 + i * 24} y={84}
              fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="10" fontWeight="700" opacity="0.45"
            >
              {i + 1}
            </text>
          ))}
        </g>
        <g transform={mLeftTxt(A, ZC1)}>
          <text x="10" y="11" fill="#ffffff" fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" opacity="0.9">
            UI LAYER Z=244
          </text>
        </g>

        {/* 版3の上に浮く小さな立方体。版の外へ出す。
            天面に載せると図表と喧嘩した（初稿でそうなった） */}
        <Cube x={-142} y={-40} z={ZC1 - 10} s={26} c1="#ffffff" c2={ORANGE} c3="#c2530b" />
        <Cube x={46} y={-146} z={ZC1 + 26} s={20} c1="#ffffff" c2={PURPLE} c3={PURPLE_D} />
        <Cube x={148} y={116} z={ZB1 + 14} s={16} c1="#ffffff" c2={BLUE} c3={BLUE_D} />

        {/* ── 30度の角度記号。投影法そのものを見せる。
               初稿はY軸を逆向きに引いて、記号として成立していなかった。
               3軸は必ず画面上で (K,0.5) (−K,0.5) (0,−1) の向きに引く ── */}
        {(() => {
          const ox = 108;
          const oy = 630;
          const L = 62;
          const ax: [number, number] = [ox + L * K, oy + L * 0.5];
          const ay: [number, number] = [ox - L * K, oy + L * 0.5];
          const az: [number, number] = [ox, oy - L];
          return (
            <g>
              <line x1={ox - 4} y1={oy} x2={ox + 76} y2={oy} stroke={INK} strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />
              <g stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round">
                <line x1={ox} y1={oy} x2={ax[0]} y2={ax[1]} />
                <line x1={ox} y1={oy} x2={ay[0]} y2={ay[1]} />
                <line x1={ox} y1={oy} x2={az[0]} y2={az[1]} />
              </g>
              {/* 水平線から X 軸までの30度 */}
              <path d={`M${ox + 40} ${oy} A 40 40 0 0 1 ${ox + 40 * K} ${oy + 20}`} stroke={ORANGE} strokeWidth="2.2" fill="none" />
              <text x={ox + 48} y={oy + 20} fill={ORANGE} fontFamily="'Courier New', ui-monospace, monospace" fontSize="13" fontWeight="700">30°</text>
              <text x={ax[0] + 5} y={ax[1] + 11} fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="11" fontWeight="700">X</text>
              <text x={ay[0] - 15} y={ay[1] + 11} fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="11" fontWeight="700">Y</text>
              <text x={az[0] - 4} y={az[1] - 7} fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="11" fontWeight="700">Z</text>
              <circle cx={ox} cy={oy} r="3" fill={INK} />
            </g>
          );
        })()}

        {/* ── 引き出し線。層に番号を振る ───────────────────── */}
        {([[iso(A, -A, ZC1), 508, 210, "03"], [iso(A, -A, ZB1), 520, 338, "02"], [iso(A, -A, Z1), 528, 466, "01"]] as [[number, number], number, number, string][]).map(
          ([p0, tx, ty, n], i) => (
            <g key={i}>
              <path d={`M${p0[0]} ${p0[1]} L${tx - 26} ${ty} L${tx} ${ty}`} stroke={INK} strokeWidth="1" fill="none" opacity="0.55" />
              <circle cx={p0[0]} cy={p0[1]} r="3" fill={ORANGE} />
              <circle cx={tx + 12} cy={ty - 4} r="12" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.7" />
              <text x={tx + 12} y={ty} textAnchor="middle" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="11" fontWeight="700">
                {n}
              </text>
            </g>
          ),
        )}

        {/* ── 表題欄 ─────────────────────────────────────── */}
        <g>
          <line x1="40" y1="700" x2="560" y2="700" stroke={INK} strokeWidth="1.4" opacity="0.5" />
          {[["01", "GROUND PLANE", BLUE], ["02", "GRAPH LAYER", PURPLE], ["03", "UI LAYER", ORANGE]].map(([n, t, c], i) => (
            <g key={i} transform={`translate(${40 + i * 176} 726)`}>
              <rect width="14" height="14" fill={c} />
              <text x="22" y="11" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9.5" fontWeight="700" letterSpacing="1.4">
                {n} {t}
              </text>
            </g>
          ))}
          <text x="40" y="768" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" opacity="0.55">
            PROJECTION  sx=(x−y)·cos30   sy=(x+y)·sin30−z
          </text>
          <text x="560" y="768" textAnchor="end" fill={INK} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" opacity="0.55">
            SHEET 07/80
          </text>
        </g>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.12" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
