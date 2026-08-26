/**
 * 表現主義（ドイツ表現主義／ブリュッケ）。
 *
 * キルヒナーのベルリン街娼図。見たままを描かず、感じた不安のぶんだけ
 * 形を歪める。垂直は1本もない。建物は内側へ倒れ、道は不自然に急に狭まり、
 * 人は引き伸ばされて棒になる。
 *
 * ■ この版でやっていること
 *   1. 垂直・水平を全部殺す。壁も道も人も6〜14度傾けた。
 *      1本でも真っ直ぐな線があると、そこだけ現実に戻って絵が緩む。
 *   2. 色面と輪郭をわざと合わせない。塗りを線から4〜7px ずらす。
 *      ブリュッケの画家は木版の版下をそのまま油彩に持ち込んだので、
 *      色版と主版がずれた印刷物のような画面になる。
 *   3. 輪郭は「折れる」。曲線を使わず、短い直線を角で継ぐ（jag）。
 *      版木を刃で切った線の硬さがそのまま絵の硬さになる。
 *   4. 影は溶けない。鋭い平行線で刻む。グラデーションを一切使わない。
 *
 * ■ 初稿の失敗
 *   ・人が寸胴だった。裾を280px も広げたので、巨大なテントに小さな頭が
 *     乗った絵になった。キルヒナーの人は「引き伸ばされた棒」で、
 *     全高は頭8つぶん、裾は肩幅の1.4倍までしか広がらない。
 *   ・道が白い空地だった。人物が黒、道が紙色では、画面の6割が虚無になる。
 *     道を斜めに割り、片側を灯りの橙、片側を影の青にして、面に明度を与えた。
 *   ・奥の人影に頭を描かなかったので、ズボンが立っているように見えた。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "ex";

const PAPER = "#e2ddd0";
const INK = "#1a1a1a";
const RED = "#c4342a";
const BLUE = "#2f5a7a";
const ORANGE = "#e8a13a";
/* 5色から作った濃淡 */
const BLUE_D = "#1b3648";
const BLUE_L = "#4b7d9e";
const RED_D = "#7e1f19";
const ORANGE_L = "#f2c877";

type Rnd = ReturnType<typeof rand>;
type Pt = [number, number];

/** 折れた輪郭。節点を法線方向にずらし、直線で継ぐ。曲線は1本も使わない */
function jag(pts: Pt[], r: Rnd, step = 26, amp = 2.4, close = true) {
  const f = (v: number) => v.toFixed(1);
  const out: string[] = [];
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const seg = Math.max(1, Math.round(L / step));
    const nx = -(b[1] - a[1]) / L;
    const ny = (b[0] - a[0]) / L;
    for (let k = 0; k < seg; k++) {
      const t = k / seg;
      const j = r(-amp, amp);
      out.push(`${f(a[0] + (b[0] - a[0]) * t + nx * j)} ${f(a[1] + (b[1] - a[1]) * t + ny * j)}`);
    }
  }
  if (!close) out.push(`${f(pts[pts.length - 1][0])} ${f(pts[pts.length - 1][1])}`);
  return `M${out.join("L")}${close ? "Z" : ""}`;
}

/** 鋭い平行線の影。刃を一方向に走らせる。端は尖る */
function hatch(r: Rnd, box: [number, number, number, number], deg: number, gap: number, w: number, len: number) {
  const [bx, by, bw, bh] = box;
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const span = Math.hypot(bw, bh) / 2;
  const out: string[] = [];
  const f = (v: number) => v.toFixed(1);
  for (let s = -span; s < span; s += gap) {
    const ox = cx + nx * s;
    const oy = cy + ny * s;
    const L = len * r(0.62, 1.18);
    const sh = r(-span * 0.35, span * 0.35);
    const x0 = ox + dx * (sh - L / 2);
    const y0 = oy + dy * (sh - L / 2);
    const x1 = ox + dx * (sh + L / 2);
    const y1 = oy + dy * (sh + L / 2);
    const ww = w * r(0.6, 1.35);
    out.push(
      `M${f(x0)} ${f(y0)}L${f((x0 + x1) / 2 + nx * ww)} ${f((y0 + y1) / 2 + ny * ww)}L${f(x1)} ${f(y1)}L${f((x0 + x1) / 2 - nx * ww)} ${f((y0 + y1) / 2 - ny * ww)}Z`,
    );
  }
  return out;
}

export default function Plate() {
  const r = rand(19130317);

  /* 版面の骨。道が消える点は中心から右へ外す */
  const VPX = 352;
  const VPY = 366;

  /* 左の壁・右の壁・空の楔。どれも内側へ倒す */
  const wallL: Pt[] = [[-40, -20], [196, -20], [258, 352], [-40, 414]];
  const wallR: Pt[] = [[452, -20], [640, -20], [640, 338], [420, 364]];
  const sky: Pt[] = [[196, -20], [452, -20], [420, 364], [258, 352]];
  const road: Pt[] = [[-60, 418], [258, 352], [420, 364], [660, 342], [1180, 824], [-580, 824]];
  /* 道を斜めに割る。奥＝街灯の橙、手前＝影の青 */
  const roadLit: Pt[] = [[258, 352], [420, 364], [712, 824], [-186, 646], [-60, 470]];

  /* 壁の窓。壁の傾きに沿って並べ、灯りは数個だけ点ける */
  const winL: { p: Pt[]; lit: boolean }[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 4 + col * 50 - row * 3;
      const y = 18 + row * 60;
      const p: Pt[] = [[x, y], [x + 28, y + 2], [x + 29, y + 42], [x, y + 44]];
      winL.push({ p, lit: (row * 4 + col) % 7 === 2 });
    }
  }
  const winR: { p: Pt[]; lit: boolean }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 476 + col * 52 + row * 2;
      const y = 14 + row * 64;
      const p: Pt[] = [[x, y], [x + 30, y - 4], [x + 31, y + 38], [x, y + 44]];
      winR.push({ p, lit: (row * 3 + col) % 5 === 1 });
    }
  }

  const wallLHatch = hatch(r, [-30, 40, 260, 340], 74, 15, 2.2, 260);
  const wallRHatch = hatch(r, [430, 20, 210, 320], 104, 14, 2, 250);
  const roadHatch = hatch(r, [-60, 380, 720, 440], -58, 19, 2.6, 340);

  /* ── 手前の女 ────────────────────────────────────────────────
     全高500px に対し頭は60px、裾は肩幅の1.6倍まで。棒のように立たせる */
  const hatBrim: Pt[] = [[344, 306], [372, 296], [430, 292], [462, 300], [452, 314], [400, 320], [354, 318]];
  const hatCrown: Pt[] = [[370, 300], [376, 258], [402, 248], [430, 252], [436, 296]];
  const feathers: Pt[][] = [
    [[426, 262], [474, 240], [514, 222], [498, 248], [452, 272], [434, 274]],
    [[418, 252], [462, 224], [496, 202], [486, 228], [446, 254], [428, 262]],
  ];
  const face: Pt[] = [[380, 312], [428, 310], [432, 350], [424, 378], [404, 390], [386, 372], [376, 340]];
  const coat: Pt[] = [[376, 392], [434, 388], [452, 470], [462, 600], [478, 824], [326, 824], [340, 610], [352, 470]];
  const armR: Pt[] = [[444, 402], [468, 470], [478, 560], [456, 566], [440, 476], [428, 414]];

  /* ── 隣の男。山高帽。少し奥に立たせる ───────────────────────── */
  const mHat: Pt[] = [[214, 358], [216, 316], [268, 312], [272, 356], [292, 362], [290, 372], [196, 376], [194, 364]];
  const mFace: Pt[] = [[224, 368], [264, 366], [266, 400], [258, 424], [240, 432], [226, 414], [220, 392]];
  const mCoat: Pt[] = [[222, 434], [268, 430], [282, 510], [292, 640], [300, 796], [178, 796], [190, 640], [204, 512]];

  /* ── 奥の人影。頭を描かないと立ったズボンに見える ─────────────── */
  const crowd: { head: Pt[]; body: Pt[]; c: string }[] = [
    {
      head: [[300, 386], [318, 384], [320, 408], [310, 418], [300, 408]],
      body: [[298, 420], [322, 418], [332, 480], [338, 566], [286, 566], [292, 480]],
      c: INK,
    },
    {
      head: [[492, 402], [510, 400], [512, 424], [502, 434], [492, 424]],
      body: [[490, 436], [514, 434], [528, 512], [540, 640], [478, 640], [484, 508]],
      c: BLUE_D,
    },
    {
      head: [[344, 372], [358, 371], [360, 391], [352, 399], [344, 391]],
      body: [[342, 400], [362, 399], [370, 452], [374, 522], [332, 522], [336, 452]],
      c: INK,
    },
  ];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="表現主義様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-wallL`}>
          <path d={jag(wallL, r, 40, 2)} />
        </clipPath>
        <clipPath id={`${P}-wallR`}>
          <path d={jag(wallR, r, 40, 2)} />
        </clipPath>
        <clipPath id={`${P}-road`}>
          <path d={jag(road, r, 60, 2)} />
        </clipPath>
        <clipPath id={`${P}-coat`}>
          <path d={jag(coat, r, 40, 2.4)} />
        </clipPath>
        <clipPath id={`${P}-mcoat`}>
          <path d={jag(mCoat, r, 40, 2.4)} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 空の楔。酸のような橙 ─────────────────────────────── */}
        <path d={jag(sky, r, 46, 2.2)} fill={ORANGE} />
        <path d={jag([[230, 148], [434, 156], [420, 364], [258, 352]], r, 40, 2)} fill={ORANGE_L} />
        {/* 突き当りの建物。道の奥を暗く塞ぐ */}
        <path d={jag([[254, 292], [424, 302], [420, 366], [258, 356]], r, 34, 1.8)} fill={BLUE_D} />

        {/* ── 道。塗りを輪郭より下へずらす（色版のズレ） ───────────── */}
        <path d={jag(road, r, 60, 2)} fill={BLUE} transform="translate(6 5)" />
        <g clipPath={`url(#${P}-road)`}>
          <path d={jag(roadLit, r, 54, 3)} fill={ORANGE_L} />
          <g fill={INK} opacity="0.34">
            {roadHatch.map((d, i) => (
              <path key={`rh${i}`} d={d} />
            ))}
          </g>
          {/* 敷石の目地。遠近が急すぎるのは意図 */}
          <g stroke={INK} strokeWidth="2.4" opacity="0.42">
            {Array.from({ length: 9 }, (_, i) => {
              const t = (i - 4) / 4;
              return <line key={`pv${i}`} x1={VPX + t * 84} y1={VPY} x2={VPX + t * 720} y2="834" />;
            })}
          </g>
          {/* 人の影。街灯から左下へ長く伸ばす */}
          <g fill={INK} opacity="0.62">
            <path d={jag([[330, 824], [486, 824], [592, 706], [520, 682]], r, 50, 3)} />
            <path d={jag([[180, 824], [304, 824], [408, 700], [352, 682]], r, 50, 3)} />
          </g>
        </g>

        {/* ── 左の壁 ────────────────────────────────────────────── */}
        <path d={jag(wallL, r, 40, 2)} fill={BLUE} transform="translate(-5 4)" />
        <g clipPath={`url(#${P}-wallL)`}>
          <g fill={INK} opacity="0.4">
            {wallLHatch.map((d, i) => (
              <path key={`lh${i}`} d={d} />
            ))}
          </g>
          {winL.map((w, i) => (
            <path key={`wl${i}`} d={jag(w.p, r, 18, 1.4)} fill={w.lit ? ORANGE : BLUE_D} />
          ))}
        </g>
        <path d={jag(wallL, r, 40, 2)} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="miter" />

        {/* ── 右の壁 ────────────────────────────────────────────── */}
        <path d={jag(wallR, r, 40, 2)} fill={RED_D} transform="translate(7 -4)" />
        <g clipPath={`url(#${P}-wallR)`}>
          <g fill={INK} opacity="0.4">
            {wallRHatch.map((d, i) => (
              <path key={`rr${i}`} d={d} />
            ))}
          </g>
          {winR.map((w, i) => (
            <path key={`wr${i}`} d={jag(w.p, r, 18, 1.4)} fill={w.lit ? ORANGE : INK} />
          ))}
        </g>
        <path d={jag(wallR, r, 40, 2)} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="miter" />

        {/* ── 街灯。棘のある光。垂直から11度倒す ────────────────────── */}
        <g transform="rotate(-13 74 244)">
          <path d={jag([[69, 246], [79, 246], [88, 470], [58, 470]], r, 50, 1.4)} fill={INK} />
          <g stroke={ORANGE} strokeWidth="3.2" opacity="0.95">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + 0.2;
              const L = 32 + (i % 3) * 22;
              return (
                <line key={`ray${i}`} x1={74 + Math.cos(a) * 20} y1={222 + Math.sin(a) * 20}
                      x2={74 + Math.cos(a) * L} y2={222 + Math.sin(a) * L} />
              );
            })}
          </g>
          <path d={jag([[74, 196], [100, 222], [74, 248], [48, 222]], r, 14, 1.6)} fill={ORANGE} />
          <path d={jag([[74, 204], [92, 222], [74, 240], [56, 222]], r, 11, 1.2)} fill={ORANGE_L} />
        </g>

        {/* ── 奥の人影。頭と胴。輪郭だけで顔は描かない ───────────────── */}
        {crowd.map((c, i) => (
          <g key={`cr${i}`}>
            <path d={jag(c.body, r, 30, 2)} fill={c.c} transform={`translate(${i % 2 ? -4 : 4} 3)`} />
            <path d={jag(c.body, r, 30, 2)} fill="none" stroke={INK} strokeWidth="3.4" strokeLinejoin="miter" />
            <path d={jag(c.head, r, 14, 1.4)} fill={i === 1 ? ORANGE : INK} />
            <path d={jag(c.head, r, 14, 1.4)} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="miter" />
          </g>
        ))}

        {/* ── 隣の男 ────────────────────────────────────────────── */}
        <path d={jag(mCoat, r, 36, 2.4)} fill={INK} transform="translate(-6 5)" />
        <path d={jag(mCoat, r, 36, 2.4)} fill={BLUE_D} />
        <g clipPath={`url(#${P}-mcoat)`}>
          <g fill={INK} opacity="0.9">
            {hatch(r, [170, 430, 140, 380], 84, 12, 2.6, 380).map((d, i) => (
              <path key={`mh${i}`} d={d} />
            ))}
          </g>
        </g>
        <path d={jag(mCoat, r, 36, 2.4)} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="miter" />
        <path d={jag(mFace, r, 18, 1.6)} fill={ORANGE} transform="translate(4 -3)" />
        <path d={jag(mFace, r, 18, 1.6)} fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="miter" />
        <path d={jag([[228, 384], [244, 381], [245, 391], [229, 393]], r, 10, 0.9)} fill={INK} />
        <path d={jag([[252, 380], [264, 378], [265, 388], [253, 390]], r, 9, 0.9)} fill={INK} />
        <path d={jag([[234, 410], [256, 407], [255, 413], [234, 415]], r, 10, 0.8)} fill={INK} />
        <path d={jag(mHat, r, 20, 2)} fill={INK} />

        {/* ── 手前の女 ──────────────────────────────────────────── */}
        <path d={jag(coat, r, 36, 2.4)} fill={INK} transform="translate(-7 6)" />
        <path d={jag(coat, r, 36, 2.4)} fill={BLUE_D} />
        <g clipPath={`url(#${P}-coat)`}>
          <g fill={INK} opacity="0.9">
            {hatch(r, [320, 390, 160, 430], 80, 11, 2.8, 430).map((d, i) => (
              <path key={`ch${i}`} d={d} />
            ))}
          </g>
          {/* 襟。朱を一枚だけ差す */}
          <path d={jag([[374, 390], [436, 386], [424, 442], [400, 456], [382, 436]], r, 20, 2)} fill={RED} />
          {/* 裾の折り返し */}
          <path d={jag([[330, 742], [472, 736], [476, 770], [328, 776]], r, 30, 2.4)} fill={INK} opacity="0.9" />
        </g>
        <path d={jag(coat, r, 36, 2.4)} fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="miter" />
        {/* 腕。外套の外へ細く出す */}
        <path d={jag(armR, r, 26, 2)} fill={BLUE_D} />
        <path d={jag(armR, r, 26, 2)} fill="none" stroke={INK} strokeWidth="4.4" strokeLinejoin="miter" />
        <path d={jag([[452, 556], [478, 552], [484, 582], [462, 590], [450, 574]], r, 14, 1.6)} fill={ORANGE} />
        <path d={jag([[452, 556], [478, 552], [484, 582], [462, 590], [450, 574]], r, 14, 1.6)} fill="none" stroke={INK} strokeWidth="3.4" />

        {/* 顔。塗りを輪郭から5px ずらす */}
        <path d={jag(face, r, 18, 1.7)} fill={ORANGE} transform="translate(5 -4)" />
        <path d={jag(face, r, 18, 1.7)} fill="none" stroke={INK} strokeWidth="4.4" strokeLinejoin="miter" />
        <path d={jag([[384, 334], [404, 330], [406, 342], [386, 345]], r, 11, 1)} fill={INK} />
        <path d={jag([[414, 330], [430, 327], [431, 340], [415, 342]], r, 10, 1)} fill={INK} />
        <path d={jag([[402, 344], [398, 362], [410, 364]], r, 11, 1.1, false)} fill="none" stroke={INK} strokeWidth="2.8" />
        <path d={jag([[390, 370], [422, 366], [420, 377], [390, 380]], r, 11, 1)} fill={RED} />
        <g fill={INK} opacity="0.55">
          {hatch(r, [378, 336, 26, 46], 78, 7, 1.1, 40).map((d, i) => (
            <path key={`fh${i}`} d={d} />
          ))}
        </g>
        {/* 帽子。羽根を尖らせる。ここが近くで見る所 */}
        <g>
          {feathers.map((f, i) => (
            <path key={`ft${i}`} d={jag(f, r, 16, 1.4)} fill={i === 1 ? RED : INK} />
          ))}
          <path d={jag(hatCrown, r, 18, 1.8)} fill={INK} />
          <path d={jag(hatBrim, r, 20, 1.8)} fill={INK} />
          <path d={jag(hatBrim, r, 20, 1.8)} fill="none" stroke={PAPER} strokeWidth="1.8" opacity="0.5" />
        </g>

        {/* ── 題字。左上の壁に打ち込む。傾けて画面と揃える ──────────── */}
        <g transform="rotate(-6 40 96)">
          <text
            x="24" y="92"
            fill={PAPER}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="44"
            fontWeight="800"
            letterSpacing="-1"
            style={{ paintOrder: "stroke" }}
            stroke={INK}
            strokeWidth="7"
          >
            DIE BRÜCKE
          </text>
          <text
            x="28" y="116"
            fill={ORANGE}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="4.4"
          >
            DRESDEN — BERLIN — 1905/1913
          </text>
        </g>

        {/* ざら紙。表現主義の刷り物は上質紙に乗らない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.24"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
