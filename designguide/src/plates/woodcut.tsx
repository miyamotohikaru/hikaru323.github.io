/**
 * 木版画。
 *
 * 版木の「残った所」が刷られる。だから絵を描くのではなく、
 * 白くしたい所を彫る。刃は必ず一方向に走り、入りと抜きで細くなる。
 *
 * ■ この版でやっていること
 *   1. 諧調を「平行な彫り跡」で作る。空は上ほど彫り幅が細く（黒が残り）、
 *      地平に近づくほど太く彫って紙を出す。網点もグラデーションも使わない。
 *      木版に中間色は存在せず、あるのは彫り残しの面積だけ。
 *   2. 刃を継ぐ。1本の線を版面の端から端まで彫り切ることはない。
 *      1行を2〜4本に割り、継ぎ目をずらす。ここを繋げると銅版画になる。
 *   3. 版ズレ。黒の主版・朱の色版・緑の色版を別々に刷るので必ずずれる。
 *      主版は太陽の位置を丸く彫り抜いてあり、そこへ朱を4px ずらして刷る。
 *      輪の外に朱がはみ出し、反対側には紙が残る。これが多色木版の指紋。
 *
 * ■ 初稿の失敗
 *   烏に ATLAS.rough を掛けたら、嘴と脚が溶けて別の生き物になった。
 *   刃で切った輪郭は「うねる」のではなく「折れる」。だから rough は
 *   枝のような太い面にだけ掛け、烏は短い直線を継いだ多角形で作り直した
 *   （knifeOutline）。刃こぼれは点の横ゆれで出す。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "wc";

const PAPER = "#efe6d2";
const INK = "#1a1a1a";
const RED = "#b03a2e";
const GREEN = "#3f5c4a";
const TAN = "#d9c9a8";
const GREEN_D = "#2c4034"; // 緑を沈めた濃淡

type Rnd = ReturnType<typeof rand>;
type Pt = [number, number];

/** 朱の版が刷られる位置と、主版に彫り抜いた穴の位置 */
const SX = 384;
const SY = 316;
const SR = 142;
const SEA = 470; // 地平
const BAR = 694; // 題字の帯

/**
 * 彫り跡ひとつ。刃を入れ、押し、抜く。端は点で終わり、腹がいちばん太い。
 * end に1以外を渡すと、抜きぎわを太く／細くできる（畝の遠近に使う）。
 */
function gouge(r: Rnd, x0: number, y0: number, x1: number, y1: number, w: number, wob = 1, end = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const K = 6;
  const ph = r(0, 6.28);
  const f = (v: number) => v.toFixed(1);
  const A: string[] = [];
  const B: string[] = [];
  for (let i = 1; i < K; i++) {
    const t = i / K;
    const sway = (Math.sin(t * 3.1 + ph) * 0.55 + Math.sin(t * 8.3 + ph * 2) * 0.28) * w * wob;
    const ax = x0 + dx * t + nx * sway;
    const ay = y0 + dy * t + ny * sway;
    const hw = (w / 2) * (1 + (end - 1) * t) * Math.sin(Math.PI * t) ** 0.28;
    A.push(`L${f(ax + nx * hw)} ${f(ay + ny * hw)}`);
    B.unshift(`L${f(ax - nx * hw)} ${f(ay - ny * hw)}`);
  }
  return `M${f(x0)} ${f(y0)}${A.join("")}L${f(x1)} ${f(y1)}${B.join("")}Z`;
}

/** 1行を2〜4本に継ぐ。継ぎ目の位置は行ごとにずらす */
function row(r: Rnd, xa: number, xb: number, y: number, w: number, slope = 0): string[] {
  const out: string[] = [];
  let x = xa;
  while (x < xb) {
    const x2 = Math.min(xb, x + r(120, 320));
    out.push(gouge(r, x, y + (x - xa) * slope, x2, y + (x2 - xa) * slope, w));
    x = x2 + r(5, 17);
  }
  return out;
}

/**
 * 刃で切った輪郭。滑らかな曲線ではなく、短い直線の連なりにする。
 * 節点を法線方向に微かにずらすと、刃の食い込みの深さの差が出る。
 */
function knifeOutline(pts: Pt[], r: Rnd, step = 20, amp = 1.7) {
  const f = (v: number) => v.toFixed(1);
  const out: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n = Math.max(1, Math.round(L / step));
    const nx = -(b[1] - a[1]) / L;
    const ny = (b[0] - a[0]) / L;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const j = r(-amp, amp);
      out.push(`${f(a[0] + (b[0] - a[0]) * t + nx * j)} ${f(a[1] + (b[1] - a[1]) * t + ny * j)}`);
    }
  }
  return `M${out.join("L")}Z`;
}

/** 烏の輪郭。嘴の先から上を回り、尾の先を折り返して腹へ戻る */
const CROW: Pt[] = [
  [410, 291], [386, 281], [374, 270], [360, 257], [338, 248], [316, 249],
  [300, 258], [284, 270], [266, 281], [244, 294], [224, 309], [202, 325],
  [176, 340], [150, 356], [126, 373],
  [132, 383], [164, 372], [196, 356], [228, 342], [252, 346], [272, 354],
  [290, 360], [316, 360], [340, 352], [360, 338], [372, 322], [378, 306],
  [386, 297],
];

export default function Plate() {
  const r = rand(14980521);

  /* 空の諧調。上は彫り幅が細く黒が残り、地平に近づくほど太く彫る */
  const sky: string[] = [];
  for (let y = -6; y < SEA + 6; y += 8) {
    const t = Math.max(0, Math.min(1, (y + 6) / (SEA + 12)));
    const w = 7.4 * (1 - t) ** 1.65 + 0.32;
    for (const d of row(r, -70, 670, y, w)) sky.push(d);
  }

  /* 地平直下の帯。横に密に彫って最暗部を作る */
  const farBand: string[] = [];
  for (let y = SEA + 5; y < SEA + 44; y += 6) {
    for (const d of row(r, -70, 670, y, 4.4 - (y - SEA) * 0.055)) farBand.push(d);
  }
  /* 交差彫り。木版の最暗部は必ずこれで締める */
  const cross: string[] = [];
  for (let x = -40; x < 660; x += 15) cross.push(gouge(r, x, SEA + 3, x + 30, SEA + 46, r(1.4, 3)));

  /* 畝。手前へ弓なりに垂れる等高線。下ほど彫り幅を太くして明るくする。
     初稿は地平の一点へ収束する扇にしたが、放射が太陽と喧嘩し、
     機械的な縞模様に見えた。畑の畝は視線の高さでは横に寝る */
  const furrow: string[] = [];
  for (let y = SEA + 40; y < BAR + 16; y += 8) {
    const t = (y - SEA - 40) / (BAR - SEA - 24);
    const w = 1.1 + 5.6 * t ** 1.15;
    const amp = 34 * t ** 1.4;
    const bow = (x: number) => y + amp * ((x - 300) / 330) ** 2;
    let x = -70;
    while (x < 670) {
      const x2 = Math.min(670, x + r(110, 300));
      furrow.push(gouge(r, x, bow(x), x2, bow(x2), w, 0.6));
      x = x2 + r(4, 14);
    }
  }
  /* 手前の草。横に短く。刃を細かく入れる */
  const grass: string[] = [];
  for (let i = 0; i < 46; i++) {
    const x = r(-20, 620);
    const y = r(BAR - 78, BAR + 6);
    grass.push(gouge(r, x, y, x + r(-16, 16), y - r(12, 30), r(1.6, 3.2), 1.4));
  }

  /* 烏の羽。刃の向きが羽の流れ。ここが近くで見る所 */
  const feather: string[] = [
    gouge(r, 300, 286, 250, 306, 3.4),
    gouge(r, 296, 298, 240, 320, 3.8),
    gouge(r, 292, 310, 234, 332, 3.6),
    gouge(r, 288, 322, 236, 342, 3),
    gouge(r, 286, 333, 246, 350, 2.4),
    gouge(r, 340, 272, 314, 264, 2.6),
    gouge(r, 352, 282, 326, 273, 2.4),
    gouge(r, 200, 336, 160, 356, 2.8),
    gouge(r, 194, 347, 152, 366, 2.6),
    gouge(r, 186, 357, 146, 374, 2.2),
    gouge(r, 366, 314, 350, 330, 2),
    gouge(r, 396, 288, 380, 285, 1.6),
  ];

  /* 枝の木肌。幹に沿って長く */
  const bark: string[] = [
    gouge(r, -20, 412, 138, 400, 3.4),
    gouge(r, 40, 424, 216, 410, 2.8),
    gouge(r, 160, 406, 322, 396, 2.4),
    gouge(r, 258, 418, 420, 404, 2),
    gouge(r, -10, 432, 106, 424, 2.2),
  ];

  const CONIFER = (x: number, h: number, r2: Rnd) =>
    knifeOutline(
      [[x, SEA + 2], [x - h * 0.34, SEA + 2], [x - h * 0.16, SEA - h * 0.42], [x, SEA - h], [x + h * 0.16, SEA - h * 0.42], [x + h * 0.34, SEA + 2]],
      r2, 14, 1.4,
    );

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="木版画様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 主版は太陽を丸く彫り抜いてある。そこへ色版がずれて乗る */}
        <mask id={`${P}-nosun`}>
          <rect width="600" height="800" fill="#fff" />
          <circle cx={SX} cy={SY} r={SR} fill="#000" />
        </mask>
        <clipPath id={`${P}-sky`}>
          <rect x="-80" y="-20" width="760" height={SEA + 20} />
        </clipPath>
        <clipPath id={`${P}-ground`}>
          <rect x="-80" y={SEA} width="760" height={BAR - SEA + 12} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 色版を先に刷る ─────────────────────────────────────── */}
        {/* 朱。主版の穴より右下へ4px ずれている */}
        <circle cx={SX + 4} cy={SY + 3} r={SR} fill={RED} />
        {/* 緑の地面。2px ずれる。奥は沈め、手前を明るく */}
        <rect x="-22" y={SEA + 2} width="644" height={BAR - SEA + 8} fill={GREEN} />
        <rect x="-22" y={SEA + 2} width="644" height="52" fill={GREEN_D} />
        {/* 薄茶の版。刈り取り済みの一枚。緑の帯を割って畑らしくする */}
        <path d={`M-22 ${SEA + 96} L622 ${SEA + 86} L622 ${SEA + 150} L-22 ${SEA + 162} Z`} fill={TAN} />

        {/* ── 主版（黒）。空の諧調 ──────────────────────────────── */}
        <g clipPath={`url(#${P}-sky)`} mask={`url(#${P}-nosun)`} fill={INK}>
          {sky.map((d, i) => (
            <path key={`s${i}`} d={d} />
          ))}
        </g>
        {/* 彫り抜いた穴の縁。輪は主版の正位置。朱がはみ出す側と紙が残る側ができる */}
        <circle cx={SX} cy={SY} r={SR} fill="none" stroke={INK} strokeWidth="3.4" />

        {/* 遠くを飛ぶ烏。2羽。大きさの物差しになる */}
        <g fill={INK}>
          <path d="M92 156 Q 108 144 122 156 Q 136 144 152 156 Q 136 152 122 164 Q 108 152 92 156 Z" />
          <path d="M156 208 Q 168 199 179 208 Q 190 199 202 208 Q 190 205 179 213 Q 168 205 156 208 Z" />
        </g>

        {/* ── 主版。地面 ─────────────────────────────────────────── */}
        <g clipPath={`url(#${P}-ground)`} fill={INK}>
          {farBand.map((d, i) => (
            <path key={`fb${i}`} d={d} />
          ))}
          {cross.map((d, i) => (
            <path key={`x${i}`} d={d} opacity="0.9" />
          ))}
          {furrow.map((d, i) => (
            <path key={`fu${i}`} d={d} opacity="0.88" />
          ))}
          {grass.map((d, i) => (
            <path key={`gr${i}`} d={d} opacity="0.92" />
          ))}
        </g>
        {/* 地平の線。版木の縁を1本残す */}
        <path d={gouge(r, -30, SEA, 630, SEA + 2, 3.6, 0.3)} fill={INK} />

        {/* 稜線の木立 */}
        <g fill={INK}>
          <path d={CONIFER(60, 46, r)} />
          <path d={CONIFER(88, 30, r)} />
          <path d={CONIFER(524, 38, r)} />
          <path d={CONIFER(552, 27, r)} />
        </g>
        {/* 積み藁。畑に3つ。低く広く積み、西日の影を左へ長く落とす。
           初稿は細く尖らせたので、地平の木立と見分けがつかなかった */}
        <g fill={INK}>
          {([[172, 0.86], [292, 0.7], [452, 0.8]] as [number, number][]).map(([x, k], i) => (
            <g key={`h${i}`}>
              <path
                d={knifeOutline(
                  [
                    [x - 62 * k, SEA + 142], [x - 30 * k, SEA + 116], [x - 4 * k, SEA + 100],
                    [x + 2 * k, SEA + 88], [x + 8 * k, SEA + 101], [x + 34 * k, SEA + 117],
                    [x + 60 * k, SEA + 142],
                  ],
                  r, 15, 1.6,
                )}
              />
              <path
                d={knifeOutline(
                  [
                    [x - 62 * k, SEA + 142], [x - 138 * k, SEA + 154], [x - 130 * k, SEA + 160],
                    [x + 56 * k, SEA + 148],
                  ],
                  r, 20, 1.4,
                )}
                opacity="0.55"
              />
            </g>
          ))}
        </g>

        {/* ── 枝。烏と同じく刃で折った多角形。ATLAS.rough を掛けたら
             板か刃物に見え、小枝が宙に浮いた（2稿の失敗）。
             上端は烏の足の真下（y=388前後）を通す ────────────────── */}
        <g fill={INK}>
          <path
            d={knifeOutline(
              [
                [-30, 376], [58, 384], [140, 389], [230, 389], [300, 385], [372, 374], [438, 358], [486, 340], [512, 326],
                [516, 333], [478, 356], [430, 376], [370, 393], [300, 408], [228, 412], [140, 412], [58, 407], [-30, 401],
              ],
              r, 22, 1.6,
            )}
          />
          {/* 小枝。上へ2本、下へ1本。冬枯れの木 */}
          <path d={knifeOutline([[144, 392], [136, 352], [128, 326], [137, 325], [147, 353], [153, 392]], r, 13, 1.2)} />
          <path d={knifeOutline([[346, 382], [370, 346], [396, 318], [404, 325], [379, 352], [356, 386]], r, 13, 1.2)} />
          <path d={knifeOutline([[231, 400], [225, 428], [218, 456], [226, 458], [234, 430], [240, 401]], r, 13, 1.2)} />
          <path d={knifeOutline([[62, 386], [46, 356], [30, 336], [38, 332], [56, 356], [71, 385]], r, 12, 1.2)} />
          {/* 節。彫り残しの瘤 */}
          <path d={knifeOutline([[186, 388], [200, 384], [210, 392], [200, 402], [186, 400]], r, 8, 1)} />
        </g>

        {/* ── 烏。刃で折った輪郭。rough は掛けない ─────────────────── */}
        <path d={knifeOutline(CROW, r, 18, 1.9)} fill={INK} />
        {/* 脚。枝を掴む。爪まで彫る */}
        <g fill={INK}>
          <path d="M290 356 L296 356 L299 392 L292 392 Z" />
          <path d="M316 354 L322 354 L324 390 L318 390 Z" />
          <path d="M288 390 L304 396 L286 397 Z" />
          <path d="M314 388 L330 394 L312 395 Z" />
        </g>

        {/* 羽と木肌の彫り跡。ここは白で抜く */}
        <g fill={PAPER}>
          {feather.map((d, i) => (
            <path key={`f${i}`} d={d} />
          ))}
          {bark.map((d, i) => (
            <path key={`b${i}`} d={d} opacity="0.9" />
          ))}
        </g>
        {/* 目。白く彫って、瞳だけ残す */}
        <circle cx="368" cy="277" r="5" fill={PAPER} />
        <circle cx="369" cy="277.8" r="2.2" fill={INK} />

        {/* ── 題字の帯。黒を残し、文字を彫り抜く ──────────────────── */}
        <path
          d={`M-10 ${BAR + 8} L120 ${BAR - 2} L300 ${BAR + 4} L470 ${BAR - 4} L610 ${BAR + 3} L610 810 L-10 810 Z`}
          fill={INK}
        />
        <text
          x="46" y={BAR + 66}
          fill={PAPER}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="52"
          fontWeight="700"
          letterSpacing="7"
        >
          WOODCUT
        </text>
        <text
          x="50" y={BAR + 90}
          fill={TAN}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="10"
          letterSpacing="4.2"
        >
          RELIEF — KNIFE AND GOUGE — THREE BLOCKS
        </text>
        {/* 刷り師の色玉。3つの版の濃度を見る。近くで見る細部 */}
        <g>
          {[INK, RED, GREEN].map((c, i) => (
            <g key={`c${i}`}>
              <rect x={498 + i * 30} y={BAR + 38} width="22" height="22" fill={PAPER} />
              <rect x={500 + i * 30} y={BAR + 40} width="18" height="18" fill={c} />
            </g>
          ))}
          <rect x={498} y={BAR + 68} width="82" height="1.6" fill={TAN} opacity="0.6" />
        </g>

        {/* 和紙の繊維。木版は上質紙には刷らない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.fibre})`}
          opacity="0.3"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
