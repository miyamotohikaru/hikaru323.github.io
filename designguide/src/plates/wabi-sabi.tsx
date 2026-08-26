/**
 * わびさび。
 *
 * 描くのは「静かなベージュの何か」ではない。**時間の痕跡**そのもの。
 * 完全な円をひとつも使わない。轆轤で挽いた器の輪郭は必ず歪んでいるし、
 * 紙は焼けていて、置いた跡が残っている。ここが伝わらなければ落ちる。
 *
 * ■ この絵の骨
 *   1. 井戸形の茶碗を左下に**大きく**据え、右上を空ける。
 *      2稿目までは器が小さく、余白が「ただ空いている」に見えた。
 *      器を版面の対角ぶんまで太らせ、空けた側に三つだけ印を置いた。
 *        ・紙の折り筋（x=470 の縦線）→ 右端が「余白」ではなく「余白の欄」になる
 *        ・置いた跡の輪染み        → 昔ここにも器があった、という時間
 *        ・掠れた一筆（y=176）      → 版面を上下に割る線
 *   2. 釉薬の裾を波打つ線で切り、下は生土のまま残す（土見せ）。
 *      境目の不揃いさがわびさびの一番の勘所。
 *   3. 割れは2種類ある。**金で継いだ割れ**と、**まだ継いでいない割れ**。
 *      直したものと直していないものが同じ器にあることが、この様式の芯。
 *      金は5色にない色ではなく、地の黄土（#b8ac97 / #d0c6b2）の
 *      彩度だけ上げて作った。朱の落款は赤＝別の色相なので使わず、墨の角印にした。
 *
 * ■ 失敗して直したところ
 *   ・初稿：器を中央に上下対称の楕円で描き「壺のアイコン」になった。
 *     輪郭の点を rand で振り、左右で別の種を使って非対称にした。
 *   ・2稿：釉だれを細い矩形で描いたら、黒い棒が3本立っただけに見えた。
 *     裾から下へ膨らんで丸く止まる舌の形に変えた。
 *   ・2稿：金継ぎを器の上に「置いた」ので、口縁の上に金の旗が立って見えた。
 *     3稿で欠けをマスクで本当に噛み切り、金は口縁と重なる範囲だけに клип した。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "wb";
const PAPER = "#e4ddd0";
const CLAY = "#b8ac97";
const CLAY_D = "#ab9e86";
const EARTH = "#7a6f5e";
const INK = "#3a3529";
const WASH = "#d0c6b2";
const GOLD = "#c2a26c";
const GOLD_D = "#87703f";

const CX = 224;      // 器の軸。中央（300）から左へ外す
const RIM_Y = 456;
const RIM_RX = 158;
const RIM_RY = 32;
const BASE_Y = 682;
const FOLD = 470;    // 紙の折り筋。ここから右が余白の欄

/** 欠けの形。角で作る。なめらかに切ると注ぎ口に見える */
const NOTCH = "M 316 428 L 348 418 L 386 436 L 380 466 L 348 476 L 320 456 Z";

/** 閉じた点列をなめらかな輪郭に。中点を継ぎ目にした2次曲線でつなぐ */
function closed(pts: [number, number][]) {
  const n = pts.length;
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const [sx, sy] = mid(pts[n - 1], pts[0]);
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const [qx, qy] = mid(p, pts[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${qx.toFixed(1)} ${qy.toFixed(1)}`;
  }
  return `${d} Z`;
}

/** 開いた点列。先頭の M は呼ぶ側が書く */
function through(pts: [number, number][]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  const e = pts[pts.length - 1];
  return `${d} L ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
}

/** 歪んだ環。「円のはずのもの」は全部これで描く */
function wobbleRing(cx: number, cy: number, rx: number, ry: number, amp: number, seed: number, n = 28) {
  const r = rand(seed);
  return closed(
    Array.from({ length: n }, (_, i): [number, number] => {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + (r() - 0.5) * amp;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    }),
  );
}

/* 断面。[y, 半幅]。口で少し開き、腰で締まる井戸形 */
const PROFILE: [number, number][] = [
  [456, 158], [474, 159], [498, 157], [524, 152],
  [550, 144], [576, 133], [600, 119], [620, 104], [636, 88], [648, 76],
];

export default function Plate() {
  const rimPath = wobbleRing(CX, RIM_Y, RIM_RX, RIM_RY, 0.05, 1717);

  /* 左右で別の種。同じ種だと左右対称になり、型で抜いたように見える */
  const jR = rand(881);
  const jL = rand(2207);
  const side = (dir: 1 | -1, j: () => number): [number, number][] =>
    PROFILE.map(([y, hw]) => [CX + dir * (hw + (j() - 0.5) * 7), y + (j() - 0.5) * 3.4]);

  const right = side(1, jR);
  const left = side(-1, jL).reverse();

  /* 高台。碗の裾より細い。削り出しの段が出る */
  const FT = 654;
  const FW = 60;
  const bodyPath = closed([
    ...right,
    [CX + FW + 4, FT],
    [CX + FW, BASE_Y - 3],
    [CX + FW - 11, BASE_Y + 1],
    [CX - FW + 10, BASE_Y - 1],   // 底も水平ではない。畳に置くと少し傾く
    [CX - FW - 2, BASE_Y - 4],
    [CX - FW - 4, FT],
    ...left,
  ]);

  /* 釉薬の裾。土見せは細く。広いと二色のきのこに見える */
  const jh = rand(5150);
  const hem: [number, number][] = Array.from({ length: 13 }, (_, i) => [
    CX - 172 + (344 / 12) * i,
    610 + (jh() - 0.5) * 34,
  ]);
  const glaze =
    `M ${CX - 210} 400 L ${CX + 210} 400 L ${(CX + 210).toFixed(1)} ${hem[12][1].toFixed(1)}` +
    ` L ${hem[12][0].toFixed(1)} ${hem[12][1].toFixed(1)}` +
    through([...hem].reverse()) +
    ` L ${CX - 210} ${hem[0][1].toFixed(1)} Z`;

  /* 貫入。釉の上の細いひび。明るい線だと髪の毛に見えたので、暗い線にした */
  const jc = rand(9931);
  const crackles = Array.from({ length: 30 }, () => {
    const x = CX - 140 + jc() * 280;
    const y = 474 + jc() * 110;
    const pts: [number, number][] = [[x, y]];
    let px = x;
    let py = y;
    const n = 1 + Math.floor(jc() * 2);
    for (let k = 0; k < n; k++) {
      px += (jc() - 0.5) * 34;
      py += 7 + jc() * 15;
      pts.push([px, py]);
    }
    return `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}${through(pts)}`;
  });

  /* 鉄粉。土に浮く黒点 */
  const js = rand(444);
  const specks = Array.from({ length: 56 }, () => ({
    x: CX - 176 + js() * 352,
    y: 466 + js() * 216,
    r: 0.5 + js() * 1.7,
    o: 0.16 + js() * 0.42,
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="わびさび様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-body`}><path d={bodyPath} /></clipPath>
        {/* 欠け。器から本当に噛み切る。金は口縁と重なる範囲だけを埋める */}
        <clipPath id={`${P}-notch`}><path d={NOTCH} /></clipPath>
        <clipPath id={`${P}-rimshape`}><path d={rimPath} /></clipPath>
        <mask id={`${P}-bite`}>
          <rect width="600" height="800" fill="#fff" />
          <path d={NOTCH} fill="#000" />
        </mask>

        {/* ぼかしは ATLAS に無いので自前で持つ */}
        <filter id={`${P}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={`${P}-soft2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>

        {/* 釉。左肩から右腰へ落ちる窯変。均一に塗ると陶に見えない */}
        <linearGradient id={`${P}-glaze`} x1="0.14" y1="0.05" x2="0.9" y2="1">
          <stop offset="0" stopColor="#8f8474" />
          <stop offset="0.38" stopColor={EARTH} />
          <stop offset="1" stopColor="#463f33" />
        </linearGradient>
        {/* 器の中。手前の内壁が暗く、向こうの内壁が少し明るい */}
        <linearGradient id={`${P}-in`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e5544" />
          <stop offset="0.35" stopColor="#3b3529" />
          <stop offset="1" stopColor="#241f18" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 紙のむら。均一な地にしない。焼けと湿りの跡 */}
        <g filter={`url(#${P}-soft)`} opacity="0.4">
          <path d={wobbleRing(130, 170, 200, 160, 0.5, 12)} fill={WASH} />
          <path d={wobbleRing(520, 660, 150, 190, 0.55, 77)} fill={WASH} />
          <path d={wobbleRing(340, 330, 240, 200, 0.45, 303)} fill="#ece7dc" />
        </g>

        {/* 紙の折り筋。空けた側に「縁」を与えないと、余白が事故に見える */}
        <g opacity="0.5">
          <line x1={FOLD} y1="0" x2={FOLD + 3} y2="800" stroke={CLAY} strokeWidth="1.6" />
          <line x1={FOLD + 4} y1="0" x2={FOLD + 7} y2="800" stroke="#efe9de" strokeWidth="2.4" />
        </g>

        {/* 版面を割る一筆。掠れて右へ消える。点線に見えないよう長短をつける */}
        <g stroke={EARTH} strokeLinecap="round" fill="none">
          <path d="M 34 175 Q 180 178 268 176" strokeWidth="2.6" opacity="0.5" />
          <path d="M 284 177 Q 340 175.5 372 177" strokeWidth="1.5" opacity="0.34" />
          <path d="M 388 176.5 L 434 177" strokeWidth="0.8" opacity="0.2" />
        </g>

        {/* 置いた跡の輪染み。器がもうひとつ「あった」時間 */}
        <g opacity="0.6">
          <path d={wobbleRing(340, 258, 74, 27, 0.1, 61)} fill={WASH} opacity="0.45" filter={`url(#${P}-soft2)`} />
          <path d={wobbleRing(340, 258, 74, 27, 0.1, 61)} fill="none" stroke={CLAY} strokeWidth="2.8" />
          <path d={wobbleRing(340, 258, 65, 22, 0.13, 199)} fill="none" stroke={CLAY} strokeWidth="0.9" opacity="0.65" />
        </g>

        {/* 床の線。かすれた一筆 */}
        <g stroke={EARTH} strokeLinecap="round" opacity="0.5">
          {[[30, 116, 2.4, 0.75], [124, 226, 1.6, 0.5], [234, 372, 2.1, 0.7],
            [382, 446, 1.2, 0.42]].map(([x1, x2, w, o], i) => (
            <line key={i} x1={x1} y1={BASE_Y + 6 + i * 0.7} x2={x2} y2={BASE_Y + 6.7 + i * 0.7}
                  strokeWidth={w} opacity={o} />
          ))}
        </g>

        {/* 影。接地のきわだけ濃く。広い影を敷くと汚れに見える */}
        <ellipse cx={CX + 40} cy={BASE_Y + 7} rx="132" ry="11" fill={EARTH} opacity="0.22"
                 filter={`url(#${P}-soft2)`} />
        <ellipse cx={CX + 4} cy={BASE_Y + 2} rx="56" ry="6" fill={INK} opacity="0.34"
                 filter={`url(#${P}-soft2)`} />

        {/* ── 器 ─────────────────────────────────────────────── */}
        <g mask={`url(#${P}-bite)`}>
          {/* 生土で全形を取り、上から釉を掛ける。焼き物と同じ順 */}
          <path d={bodyPath} fill={CLAY_D} />
          <g clipPath={`url(#${P}-body)`}>
            <path d={glaze} fill={`url(#${P}-glaze)`} />
            {/* 釉だれ。裾から下へ膨らんで丸く止まる舌 */}
            {[[-96, 636, 22], [-18, 644, 14], [62, 630, 27], [122, 618, 11]].map(([dx, y2, w], i) => {
              const x = CX + dx;
              const t = 590;
              return (
                <path key={i}
                  d={`M ${x - w / 2} ${t} Q ${x - w / 2 - 3} ${(t + y2) / 2} ${x - w * 0.42} ${y2 - 9}` +
                     ` Q ${x} ${y2 + 8} ${x + w * 0.42} ${y2 - 9}` +
                     ` Q ${x + w / 2 + 3} ${(t + y2) / 2} ${x + w / 2} ${t} Z`}
                  fill="#4d463a" opacity="0.88" />
              );
            })}
            <g stroke="#2c281f" strokeWidth="0.5" fill="none" opacity="0.17">
              {crackles.map((d, i) => <path key={i} d={d} />)}
            </g>
            {specks.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={INK} opacity={s.o} />)}
            {/* 左肩の照り。艶をここだけに置くと、他が土に見える */}
            <ellipse cx={CX - 88} cy="520" rx="34" ry="76" fill="#b6aa93" opacity="0.24"
                     transform={`rotate(-12 ${CX - 88} 520)`} filter={`url(#${P}-soft2)`} />
            <path d={`M ${CX - 74} ${FT + 3} Q ${CX} ${FT + 10} ${CX + 74} ${FT + 1}`}
                  stroke={INK} strokeWidth="1.2" fill="none" opacity="0.24" />
          </g>

          {/* 口縁。歪んだ環。ここが真円だと全部が嘘になる */}
          <path d={rimPath} fill={`url(#${P}-in)`} />
          <path d={wobbleRing(CX, RIM_Y + 3, RIM_RX - 16, RIM_RY - 7, 0.055, 1717)} fill="#201c15" opacity="0.55" />
          {/* 茶の残り線。内壁に一本だけ。近くで見たときの物語 */}
          <path d={wobbleRing(CX, RIM_Y + 8, RIM_RX - 30, RIM_RY - 12, 0.06, 424)} fill="none"
                stroke="#6b6046" strokeWidth="1.2" opacity="0.4" />
          {/* 向こうの内壁。ここに光を入れないと、口が黒い板に見える */}
          <path d={wobbleRing(CX, RIM_Y - 6, RIM_RX - 22, RIM_RY - 9, 0.05, 1717)} fill="#6a6049"
                opacity="0.5" filter={`url(#${P}-soft2)`} />
          <path d={wobbleRing(CX, RIM_Y + 6, RIM_RX - 18, RIM_RY - 8, 0.055, 1717)} fill="#231f18" opacity="0.85" />
          <path d={rimPath} fill="none" stroke={CLAY} strokeWidth="3" opacity="0.9" />
        </g>

        {/* 欠けを金で埋める。口縁と重なる範囲だけ。外へはみ出させない */}
        <g clipPath={`url(#${P}-notch)`}>
          <g clipPath={`url(#${P}-rimshape)`}>
            <rect x="300" y="400" width="110" height="100" fill={GOLD} />
            <rect x="300" y="400" width="110" height="100" fill={GOLD_D} opacity="0.35"
                  transform="translate(0 26)" />
          </g>
        </g>
        {/* 埋めた金の縁。器側にだけ細い線を落として、継いだ跡に見せる */}
        <path d="M 320 452 L 348 470 L 378 462" fill="none" stroke={GOLD_D} strokeWidth="1.4" opacity="0.75" />

        {/* 割れは2種類。金で継いだもの／まだ継いでいないもの。
            割れはなめらかな曲線ではないので、途中に角を入れる */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 350 472 L 340 502 L 346 520 L 330 552 L 336 578 L 324 610"
                stroke={GOLD_D} strokeWidth="6" opacity="0.4" />
          <path d="M 350 472 L 340 502 L 346 520 L 330 552 L 336 578 L 324 610"
                stroke={GOLD} strokeWidth="3.4" />
          <path d="M 344 522 L 362 534 L 366 560" stroke={GOLD} strokeWidth="1.9" opacity="0.9" />
          {/* まだ継いでいない割れ。左肩。細く、暗い */}
          <path d="M 130 478 L 122 506 L 130 528 L 124 556 L 130 578"
                stroke="#26221a" strokeWidth="1.7" opacity="0.5" />
          <path d="M 127 516 L 112 530 L 108 550" stroke="#26221a" strokeWidth="1" opacity="0.36" />
        </g>

        {/* ── 余白の欄。折り筋の右 ───────────────────────────── */}
        <text x="512" y="122" fill={INK} fontFamily="'Hiragino Mincho ProN', Georgia, serif"
              fontSize="26" opacity="0.4">侘</text>
        <text x="512" y="156" fill={INK} fontFamily="'Hiragino Mincho ProN', Georgia, serif"
              fontSize="26" opacity="0.4">寂</text>
        {/* 墨の角印。朱を使えないぶん、彫った線で見せる */}
        <g opacity="0.5">
          <rect x="513" y="178" width="23" height="23" fill="none" stroke={INK} strokeWidth="1.6" />
          <path d="M518 184 h13 M518 190 h13 M524.5 184 v12 M518 196 h13" stroke={INK} strokeWidth="1.2" fill="none" />
        </g>
        <text transform="translate(566 706) rotate(-90)" fill={INK}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="14.5"
              letterSpacing="9" opacity="0.58">
          WABI—SABI
        </text>

        <text x="40" y="748" fill={INK} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="9.5" letterSpacing="3.4" opacity="0.52">
          IMPERFECT · IMPERMANENT · INCOMPLETE
        </text>
        <text x="40" y="768" fill={EARTH} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="8.5" letterSpacing="2.3" opacity="0.42">
          IDO CHAWAN — ONE SEAM MENDED IN GOLD, ONE LEFT AS IT BROKE
        </text>

        {/* 紙の塵 */}
        {Array.from({ length: 14 }, (_, i) => {
          const d = rand(70 + i);
          return <circle key={i} cx={d(30, 570)} cy={d(40, 780)} r={d(0.5, 1.6)} fill={INK} opacity={d(0.07, 0.2)} />;
        })}

        {/* 和紙の繊維。強いと刷毛目の金属板に見えるので薄く重ねる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.13"
              style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.14"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
