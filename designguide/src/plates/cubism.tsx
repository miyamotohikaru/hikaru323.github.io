/**
 * キュビズム。
 *
 * 1911–12年のブラック／ピカソ。分析的キュビズムに、ステンシル文字と
 * 貼り紙が入りはじめるあたり。楕円のカンヴァス。
 *
 * ■ 四稿目でここを作り直した理由
 *   三稿までは「揺らした四辺形の格子」で面を敷いていた。辺は必ず一致するし
 *   隙間も出ないが、出来上がるのはモザイクの壁紙で、その上に器物の輪郭を
 *   線で描き足しただけになっていた。**面と物が無関係**なので、
 *   何の絵か読めない。濁った茶色の塊にしか見えない。
 *   キュビズムの面は模様ではなく、**画面を横切る直線の束が作る区画**である。
 *
 * ■ 決定稿の作りかた
 *   1. **直線の配置（line arrangement）で面を切る。**
 *      楕円の版面を、方向のそろった16本の直線で順に半分に割っていく
 *      （Sutherland–Hodgman）。角度は3系統しかない——ほぼ垂直・約34度・約146度。
 *      これで辺が画面を貫いて continue し、長い楔形の面が生まれる。
 *      揺らした格子との差はここ。ブラックの面はどれも「切った」形をしている。
 *   2. **直線は物の急所を通す。** 壜の肩、ギターのくびれ、グラスの縁、卓の稜。
 *      面の切れ目と物の切れ目が一致するから、物が面に溶ける（パッサージュ）。
 *   3. **明暗を先に決める。** 光は左上から。射影で明るさを取り、
 *      静物の塊で沈め、卓の下でさらに沈める。近白から近黒まで11段使う。
 *      三稿までは中間調の茶色だけで塗っていた。あれが「濁り」の正体。
 *   4. **縁で解体する。** 楕円の縁に近いほど階調の幅を圧縮し、明るく寄せる。
 *      ぼかしは使わない。**面のコントラストだけで消していく。**
 *      ぼかすと写真の周辺減光になる（二稿でそうなった）。
 *   5. **綱の額。** ピカソが1912年、楕円の画布のまわりに本物の綱を貼った。
 *      縁が「決めた縁」になるので、地の麻布への落とし方が曖昧にならない。
 *   6. **輪郭は切る。** 器物の線は途中で必ず途切れる。閉じた輪郭を引くと
 *      塗り絵になる。面の辺に線を渡し、別のところで再開させる。
 */
import { ATLAS, rand, rad, type Rand } from "@/lib/plate";

const P = "cub";
const SAND = "#d8cdb8";
const RUST = "#a8582f";
const SLATE = "#3f4a52";
const BLACK = "#1c1a17";
const LIGHT = "#efe7d3";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 近白から近黒まで11段。三稿までは中央5段しか使っていなかった。
   分析的キュビズムは単色だが、明暗の幅は油彩のぶんだけ広い */
const RAMP = [
  "#f4eddc", "#e9dfc8", "#d9ceb2", "#c5b897", "#ad9e7e",
  "#948668", "#7b6e55", "#635846", "#4c4437", "#37322a", "#242019",
];

/* 楕円の画布 */
const CX = 300, CY = 348, RX = 254, RY = 322;

type Pt = [number, number];

/**
 * 半平面で多角形を切る（Sutherland–Hodgman）。直線は ax+by+c=0。
 * 負の側だけ残す。両側を取れば「割る」になり、辺は必ず共有される。
 */
function half(poly: Pt[], a: number, b: number, c: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const dp = a * p[0] + b * p[1] + c;
    const dq = a * q[0] + b * q[1] + c;
    if (dp <= 0) out.push(p);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
      const t = dp / (dp - dq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

function area(poly: Pt[]) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    s += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(s) / 2;
}

/** 点 (px,py) を角度 deg で通る直線 */
function line(px: number, py: number, deg: number) {
  const a = -Math.sin(rad(deg));
  const b = Math.cos(rad(deg));
  return { a, b, c: -(a * px + b * py) };
}

/**
 * 切る直線。角度は3系統だけ。物の急所を通してある。
 *  ほぼ垂直（84–98度）／ 約34度 ／ 約146度 ／ 卓のための緩い水平2本
 */
const CUTS = [
  line(148, 352, 82),  // 壜の左肩
  line(203, 330, 96),  // 壜の右肩
  line(252, 400, 88),  // ギターの中心軸
  line(322, 372, 100), // ギターの右のくびれ
  line(404, 316, 79),  // グラスの左
  line(486, 300, 93),  // グラスの右
  line(300, 196, 27),  // 新聞の下端
  line(300, 292, 38),  // ギターの肩
  line(300, 404, 31),  // 音孔を通る
  line(300, 522, 41),  // 下部胴
  line(300, 236, 152), // 棹の方向
  line(300, 344, 141),
  line(300, 446, 157),
  line(300, 566, 143),
  line(300, 574, 6),   // 卓の稜
  line(300, 640, 3),   // 卓の前縁
];

/** 面。直線で順に割る。辺は必ず共有される */
function facets() {
  let cells: Pt[][] = [[[46, 26], [554, 26], [554, 670], [46, 670]]];
  for (const L of CUTS) {
    const next: Pt[][] = [];
    for (const cell of cells) {
      const A = half(cell, L.a, L.b, L.c);
      const B = half(cell, -L.a, -L.b, -L.c);
      if (A.length > 2 && area(A) > 26) next.push(A);
      if (B.length > 2 && area(B) > 26) next.push(B);
    }
    cells = next;
  }
  return cells;
}

/**
 * 明暗。左上からの光を射影で取り、静物の塊と卓の影で沈める。
 * 楕円の縁では階調の幅を圧縮して明るく寄せ、面のまま解体していく。
 */
function tone(x: number, y: number, j: Rand) {
  const lit = ((x - CX) * -0.55 + (y - CY) * -0.83) / 430; // 光軸への射影
  const core = Math.exp(-(((x - 268) / 158) ** 2 + ((y - 428) / 176) ** 2)); // 静物の塊
  const table = 1 / (1 + Math.exp(-(y - 578) / 26)); // 卓の下
  const flash1 = Math.exp(-(((x - 226) / 78) ** 2 + ((y - 326) / 88) ** 2)); // 光る面
  const flash2 = Math.exp(-(((x - 438) / 66) ** 2 + ((y - 292) / 74) ** 2));

  let t = 0.47 + lit * 0.34 - core * 0.36 - table * 0.34 + flash1 * 0.3 + flash2 * 0.24;
  t += j(-0.12, 0.12);

  // 縁での解体。中央から離れるほど中間調へ圧縮し、わずかに明るく
  const e = Math.min(1, Math.hypot((x - CX) / RX, (y - CY) / RY));
  t = 0.52 + (t - 0.52) * (1 - 0.42 * e * e) + 0.15 * e * e * e;

  const k = Math.max(0, Math.min(RAMP.length - 1, Math.round((1 - t) * (RAMP.length - 1))));
  return RAMP[k];
}

/** 輪郭。暗線に明線を添え、破線で切る。閉じた輪郭を引くと塗り絵になる */
function Contour({ d, w = 2.6, o = 0.9, dash }: { d: string; w?: number; o?: number; dash?: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={LIGHT} strokeWidth={w * 0.85} opacity={o * 0.4}
            strokeLinecap="round" strokeDasharray={dash} transform="translate(2.2 2.2)" />
      <path d={d} fill="none" stroke={BLACK} strokeWidth={w} opacity={o}
            strokeLinecap="round" strokeDasharray={dash} />
    </>
  );
}

export default function Plate() {
  const r = rand(19120714);
  const rw = rand(881);
  const cells = facets().map((pts) => {
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0]; cy += p[1]; }
    cx /= pts.length; cy /= pts.length;
    // いちばん長い辺の向き。刷毛（ハッチング）はこの向きに走る
    let bl = 0, ba = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (l > bl) { bl = l; ba = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI; }
    }
    const pick = r();
    return {
      d: `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`,
      fill: pick > 0.965 ? RUST : pick > 0.93 ? SLATE : tone(cx, cy, r),
      cx, cy, ba, bl,
      hatch: r() > 0.62,
      edge: r() > 0.55,
      pts,
    };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="キュビズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 楕円の画布。ぼかさない。縁は面の階調だけで解体する */}
        <clipPath id={`${P}-oval`}>
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} />
        </clipPath>
        {/* 籐編み。ピカソが実際に貼った、印刷された籐柄の油布 */}
        <pattern id={`${P}-cane`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <path d="M0 0 L16 16 M16 0 L0 16" stroke={BLACK} strokeWidth="1.6" fill="none" opacity="0.75" />
          <path d="M8 0 L8 16 M0 8 L16 8" stroke={BLACK} strokeWidth="0.9" fill="none" opacity="0.45" />
          <circle cx="8" cy="8" r="2.3" fill="none" stroke={BLACK} strokeWidth="0.8" opacity="0.55" />
        </pattern>
        <clipPath id={`${P}-wood`}>
          <polygon points="128,546 258,528 268,650 140,666" />
        </clipPath>
        {/* ステンシルの橋。1本だけ。2本入れると小文字に見えた */}
        <mask id={`${P}-stencil`}>
          <rect x="312" y="172" width="220" height="80" fill="#fff" />
          <rect x="312" y="212" width="220" height="4.5" fill="#000" />
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={SAND} />

        <g clipPath={`url(#${P}-oval)`}>
          {/* ① 面。直線の束が切った区画 ─────────────────────── */}
          {cells.map((c, i) => (
            <path key={`f${i}`} d={c.d} fill={c.fill} />
          ))}

          {/* ② 面の辺。全部は引かない。引いた辺だけが構造として残る */}
          <g fill="none" stroke={BLACK} strokeWidth="0.8" opacity="0.2">
            {cells.map((c, i) => (c.edge ? <path key={`e${i}`} d={c.d} /> : null))}
          </g>

          {/* ③ ハッチング。面のいちばん長い辺に沿って走らせる。
                 面をまたいで少しはみ出すのは、実際の筆でもそうなる */}
          <g stroke={BLACK} strokeWidth="0.75" opacity="0.17">
            {cells.map((c, i) =>
              c.hatch ? (
                <g key={`h${i}`} transform={`rotate(${c.ba.toFixed(1)} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)})`}>
                  {Array.from({ length: 8 }, (_, k) => {
                    // 長いと面をまたいで「雨」に見えた。面の中に収まる長さで止める
                    const w = Math.min(c.bl * 0.3, 26);
                    return (
                      <line key={k}
                        x1={c.cx - w / 2} y1={c.cy - 9.8 + k * 2.8}
                        x2={c.cx + w / 2} y2={c.cy - 9.8 + k * 2.8} />
                    );
                  })}
                </g>
              ) : null,
            )}
          </g>

          {/* ④ 貼り紙。面の上、線の下。実際の制作順と同じ ───────── */}
          <g clipPath={`url(#${P}-wood)`}>
            <polygon points="128,546 258,528 268,650 140,666" fill="#b8965f" />
            {Array.from({ length: 17 }, (_, i) => {
              const y = 528 + i * 8.4;
              return (
                <path key={i}
                  d={`M122 ${y} C 162 ${y - 9}, 206 ${y + 10}, 246 ${y - 4} S 286 ${y + 7}, 292 ${y}`}
                  fill="none" stroke="#4a3620"
                  strokeWidth={rw(0.7, 2.3).toFixed(2)} opacity={rw(0.35, 0.75).toFixed(2)} />
              );
            })}
          </g>
          <polygon points="128,546 258,528 268,650 140,666" fill="none" stroke={BLACK} strokeWidth="1.2" opacity="0.55" />

          <polygon points="362,556 486,572 476,660 354,646" fill="#cdbb93" />
          <polygon points="362,556 486,572 476,660 354,646" fill={`url(#${P}-cane)`} />
          <polygon points="362,556 486,572 476,660 354,646" fill="none" stroke={BLACK} strokeWidth="1.2" opacity="0.55" />

          {/* 新聞の切れ端。JOU はここに乗る */}
          {/* 新聞の切れ端。前の版は白すぎて、面の上に貼った付箋に見えた。
              古新聞の地は白ではなく、灰みの黄土 */}
          <g transform="rotate(-5 386 210)">
            <polygon points="312,170 480,156 486,254 318,264" fill="#cdc3a6" />
            <g fill={BLACK} opacity="0.4">
              {Array.from({ length: 4 }, (_, i) => (
                <rect key={i} x={322} y={226 + i * 8} width={148 * rw(0.55, 1)} height="2" />
              ))}
            </g>
            <polygon points="312,170 480,156 486,254 318,264" fill="none" stroke={BLACK} strokeWidth="1" opacity="0.45" />
          </g>

          {/* ⑤ 器物。線は必ずどこかで切れる ───────────────────── */}

          {/* ギター。左右対称に正面から描いたら、黒い音孔が顔の目に見えて
              熊のぬいぐるみになった（四稿目の最初の版）。**傾ける**と、
              対称が崩れて楽器に戻る。棹も胴の肩から直接生やす。
              前の版は棹だけ宙に浮いていて、胴と繋がっていなかった */}
          <g transform="rotate(-15 258 452)">
            {/* 胴の左右。高さの違うところで止め、輪郭を閉じない */}
            <Contour d="M186 350 C 166 390, 172 424, 202 448 C 170 474, 162 522, 182 556" w={2.8} />
            <Contour d="M330 342 C 352 384, 346 420, 316 446 C 350 470, 358 520, 338 556"
                     w={2.8} dash="76 16 40 12" />
            <Contour d="M186 350 C 214 320, 292 316, 330 342" w={2.6} dash="66 16 34 0" />
            <Contour d="M182 556 C 216 586, 306 586, 338 556" w={2.6} />
            {/* 棹。胴の肩から生えて上へ。指板と糸巻き */}
            <Contour d="M242 336 L238 168" w={2.6} />
            <Contour d="M276 332 L272 168" w={2.6} dash="96 18 46 0" />
            <Contour d="M234 166 L280 162 L282 130 L232 134 Z" w={2.3} o={0.8} />
            <Contour d="M236 172 L280 169" w={2.6} o={0.85} />
            <g fill={BLACK} opacity="0.75">
              {Array.from({ length: 3 }, (_, i) => (
                <circle key={`pg${i}`} cx={238 + i * 12} cy={140 + i * 1.5} r="3.2" />
              ))}
            </g>
            {/* 音孔。近黒の円。185pxまで縮めてもここだけは残る */}
            <circle cx="256" cy="424" r="29" fill="#161818" />
            <circle cx="256" cy="424" r="29" fill="none" stroke={LIGHT} strokeWidth="2.2" opacity="0.55" />
            {/* 駒と弦。弦は指板の途中で切る */}
            <Contour d="M218 508 L300 500" w={3} o={0.8} />
            <g stroke={BLACK} fill="none" opacity="0.6">
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`s${i}`} x1={222 + i * 13} y1={507 - i * 1.4} x2={240 + i * 6.6} y2={172}
                      strokeWidth="1.1" strokeDasharray="120 26 92 0" />
              ))}
            </g>
          </g>
          {/* 同じ音孔を、斜めから見た楕円でもう一度置く。多視点の同時提示。
              こちらは傾けた組の外に出す。ずれていること自体が主題 */}
          <ellipse cx="332" cy="382" rx="26" ry="9" fill="#161818" opacity="0.75"
                   transform="rotate(-32 332 382)" />

          {/* 壜。同じ首を9度ずらして2度描く。ここも多視点。
              棹の先（糸巻き）と重なって読めなくなったので、左へ寄せ、
              線も一段濃くした。重ねること自体はキュビズムだが、
              重ねた結果どちらも消えるのはただの失敗 */}
          <Contour d="M100 182 L100 238 C 100 260, 86 266, 86 292 L86 418" w={2.7} o={0.95} />
          <Contour d="M154 176 L154 232 C 154 254, 168 260, 168 286 L168 412" w={2.7} o={0.95} dash="120 16 92 0" />
          <Contour d="M100 182 L154 176" w={2.7} o={0.95} />
          <Contour d="M86 418 L168 412" w={2.2} o={0.7} dash="30 14 26 0" />
          <g transform="rotate(9 126 292)" opacity="0.34" fill="none" stroke={BLACK} strokeWidth="2.3">
            <path d="M100 182 L100 238 C 100 260, 86 266, 86 292 L86 418" />
            <path d="M154 176 L154 232 C 154 254, 168 260, 168 286 L168 412" />
          </g>

          {/* グラス。真上から見た楕円と、横から見た台形を1本の辺で繋ぐ */}
          <Contour d="M404 282 A 44 15 0 1 0 492 282 A 44 15 0 1 0 404 282" w={2.4} />
          <Contour d="M404 282 L417 372 L479 372 L492 282" w={2.4} dash="88 14 62 0" />
          <g fill="none" stroke={BLACK} opacity="0.6">
            <path d="M417 372 L433 406 L463 406 L479 372" strokeWidth="1.7" />
            <ellipse cx="448" cy="282" rx="28" ry="9" strokeWidth="1.2" opacity="0.6" />
          </g>

          {/* 卓の稜。二重線。静物を地面に着ける */}
          <Contour d="M52 588 L548 536" w={3} o={0.7} />
          <line x1="52" y1="601" x2="548" y2="549" stroke={BLACK} strokeWidth="1.1" opacity="0.45" />

          {/* パイプ。ブラックの静物の常連 */}
          <Contour d="M140 462 c -18 -2, -28 8, -26 21 c 2 13, 17 19, 32 15" w={2.5} o={0.8} />
          <Contour d="M148 500 L236 524" w={2.1} o={0.8} />

          {/* 定規で引いた当たり線。ブラックはこれを消さずに残す */}
          <g stroke={BLACK} opacity="0.18" strokeWidth="0.7">
            <line x1="46" y1="212" x2="554" y2="330" />
            <line x1="554" y1="132" x2="60" y2="560" />
          </g>

          {/* ⑥ ステンシル。最後に置く。橋の穴から下の面が透ける */}
          <g mask={`url(#${P}-stencil)`}>
            <text x="326" y="234" fill={BLACK} fontFamily={SANS} fontSize="58" fontWeight="700"
                  letterSpacing="8" opacity="0.88">
              JOU
            </text>
          </g>
          <text x="176" y="622" fill={BLACK} fontFamily={SANS} fontSize="20" fontWeight="700"
                letterSpacing="4" opacity="0.8" transform="rotate(-8 176 622)">
            VALSE
          </text>
        </g>

        {/* ⑦ 綱の額。1912年、ピカソは楕円の画布のまわりに本物の綱を貼った。
               縁が「決めた縁」になる。撚りは破線で作ってある。
               太くすると缶の蓋の縁（あるいはフィルムのパーフォレーション）に
               見えたので、太さも撚りの濃さも半分まで落としてある */}
        <g fill="none">
          <ellipse cx={CX} cy={CY} rx={RX + 3} ry={RY + 3} stroke="#a89468" strokeWidth="6.5" />
          <ellipse cx={CX} cy={CY} rx={RX + 3} ry={RY + 3} stroke="#4a3a22" strokeWidth="6.5"
                   strokeDasharray="2.5 6" opacity="0.3" />
          <ellipse cx={CX} cy={CY} rx={RX + 6.4} ry={RY + 6.4} stroke={BLACK} strokeWidth="0.9" opacity="0.3" />
        </g>

        {/* だまし絵の釘。ブラックが画面に1本だけ描き込んだあれ */}
        <g>
          <ellipse cx="520" cy="88" rx="9.5" ry="7" fill="#5c574a" />
          <ellipse cx="518" cy="86" rx="5" ry="3.4" fill="#a29a86" />
          <path d="M527 93 L547 114" stroke={BLACK} strokeWidth="4" opacity="0.3" strokeLinecap="round" />
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

        {/* 麻布の目。紙ではなく布 */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.13"
              style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.12"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
