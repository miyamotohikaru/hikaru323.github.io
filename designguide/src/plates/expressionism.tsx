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

  /* 版面の骨。道が消える点は中心から右上へ外す */
  const VPX = 356;
  const VPY = 300;

  /* 左の壁・右の壁・空の楔。どれも内側へ倒す */
  const wallL: Pt[] = [[-40, -20], [204, -20], [252, 286], [-40, 344]];
  const wallR: Pt[] = [[448, -20], [640, -20], [640, 274], [412, 296]];
  const sky: Pt[] = [[204, -20], [448, -20], [412, 296], [252, 286]];
  const road: Pt[] = [[252, 288], [412, 296], [680, 820], [-80, 820]];

  /* 壁の窓。壁の傾きに沿って並べる。灯りは3つだけ点ける */
  const winL: { p: Pt[]; lit: boolean }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 6 + col * 52 - row * 4;
      const y = 24 + row * 58;
      const sk = 0.16; // 壁の倒れ
      const p: Pt[] = [
        [x, y], [x + 30, y + 30 * sk * -1 + 3], [x + 30, y + 40], [x, y + 44],
      ];
      winL.push({ p, lit: (row * 4 + col) % 7 === 2 });
    }
  }
  const winR: { p: Pt[]; lit: boolean }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 474 + col * 54 + row * 3;
      const y = 18 + row * 62;
      const p: Pt[] = [[x, y], [x + 32, y - 4], [x + 32, y + 38], [x, y + 44]];
      winR.push({ p, lit: (row * 3 + col) % 5 === 1 });
    }
  }

  /* 舗道の影。手前ほど強く、右上へ流す */
  const roadHatch = hatch(r, [-40, 420, 680, 400], -66, 17, 2.4, 300);
  const wallLHatch = hatch(r, [-30, 40, 260, 300], 74, 15, 2.2, 240);
  const wallRHatch = hatch(r, [430, 20, 210, 280], 104, 14, 2, 230);

  /* 女の顔。角で折れた仮面。目は斜めの隙間、口は一の字 */
  const face: Pt[] = [[396, 318], [438, 314], [450, 352], [444, 396], [424, 420], [400, 404], [388, 360]];
  /* 帽子。羽根を尖らせる */
  const hat: Pt[] = [
    [352, 330], [340, 300], [362, 276], [400, 258], [376, 218], [406, 246], [438, 232],
    [430, 252], [468, 250], [478, 286], [496, 318], [456, 330], [412, 322],
  ];
  /* 外套。肩から裾へ広がる楔。画面の下で切る */
  const coat: Pt[] = [[380, 408], [452, 400], [498, 520], [556, 820], [268, 820], [312, 560]];

  /* 奥の人影。輪郭だけ。群衆の気配 */
  const crowd: Pt[][] = [
    [[236, 336], [258, 330], [268, 366], [284, 500], [222, 502], [230, 380]],
    [[286, 322], [304, 318], [312, 348], [322, 452], [278, 454], [280, 356]],
    [[430, 328], [450, 324], [462, 358], [478, 470], [426, 472], [424, 366]],
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
          <path d={jag(coat, r, 40, 2.6)} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 空の楔。酸のような橙。奥ほど白く抜く ─────────────────── */}
        <path d={jag(sky, r, 46, 2.2)} fill={ORANGE} />
        <path d={jag([[236, 130], [430, 138], [412, 296], [252, 286]], r, 40, 2)} fill={ORANGE_L} />
        {/* 奥の建物。道の突き当り */}
        <path d={jag([[248, 250], [416, 258], [414, 300], [250, 292]], r, 34, 1.8)} fill={BLUE_D} />

        {/* ── 道。塗りを輪郭より下へずらす（色版のズレ） ─────────────── */}
        <path d={jag(road, r, 60, 2)} fill={PAPER} transform="translate(6 5)" />
        <g clipPath={`url(#${P}-road)`}>
          <path d={jag([[252, 288], [412, 296], [520, 560], [130, 552]], r, 44, 2.4)} fill={ORANGE_L} opacity="0.85" />
          <g fill={BLUE} opacity="0.5">
            {roadHatch.map((d, i) => (
              <path key={`rh${i}`} d={d} />
            ))}
          </g>
          {/* 敷石の目地。放射に並べる。遠近が急すぎるのは意図 */}
          <g stroke={INK} strokeWidth="1.6" opacity="0.5">
            {Array.from({ length: 11 }, (_, i) => {
              const t = (i - 5) / 5;
              return <line key={`pv${i}`} x1={VPX + t * 90} y1={VPY} x2={VPX + t * 760} y2="830" />;
            })}
          </g>
        </g>

        {/* ── 左の壁 ────────────────────────────────────────────── */}
        <path d={jag(wallL, r, 40, 2)} fill={BLUE} transform="translate(-5 4)" />
        <g clipPath={`url(#${P}-wallL)`}>
          <g fill={INK} opacity="0.42">
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

        {/* ── 街灯。棘のある光。垂直から10度倒す ────────────────────── */}
        <g transform="rotate(-9 168 300)">
          <path d={jag([[162, 300], [174, 300], [186, 800], [150, 800]], r, 60, 1.6)} fill={INK} />
          <g fill={ORANGE}>
            <path d={jag([[168, 240], [196, 268], [168, 296], [140, 268]], r, 16, 1.6)} />
          </g>
          <g stroke={ORANGE} strokeWidth="3" opacity="0.9">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + 0.2;
              const L = 34 + (i % 3) * 20;
              return (
                <line key={`ray${i}`} x1={168 + Math.cos(a) * 22} y1={268 + Math.sin(a) * 22}
                      x2={168 + Math.cos(a) * L} y2={268 + Math.sin(a) * L} />
              );
            })}
          </g>
          <path d={jag([[168, 246], [188, 268], [168, 290], [148, 268]], r, 12, 1.2)} fill={ORANGE_L} />
        </g>

        {/* ── 奥の人影。黒い棒。顔は描かない ───────────────────────── */}
        {crowd.map((c, i) => (
          <g key={`cr${i}`}>
            <path d={jag(c, r, 34, 2.4)} fill={i === 2 ? BLUE_D : INK} transform={`translate(${i % 2 ? -5 : 5} 4)`} />
            <path d={jag(c, r, 34, 2.4)} fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="miter" />
          </g>
        ))}

        {/* ── 手前の女。外套・顔・帽子 ─────────────────────────────── */}
        <path d={jag(coat, r, 40, 2.6)} fill={INK} transform="translate(-7 6)" />
        <path d={jag(coat, r, 40, 2.6)} fill={BLUE_D} />
        <g clipPath={`url(#${P}-coat)`}>
          <g fill={INK} opacity="0.85">
            {hatch(r, [260, 400, 300, 420], 82, 13, 3, 420).map((d, i) => (
              <path key={`ch${i}`} d={d} />
            ))}
          </g>
          {/* 襟。朱を一枚だけ差す */}
          <path d={jag([[378, 404], [452, 396], [438, 452], [396, 462]], r, 22, 2.2)} fill={RED} />
        </g>
        <path d={jag(coat, r, 40, 2.6)} fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="miter" />

        {/* 顔。塗りを輪郭から5px ずらす */}
        <path d={jag(face, r, 20, 1.8)} fill={ORANGE} transform="translate(5 -4)" />
        <path d={jag(face, r, 20, 1.8)} fill="none" stroke={INK} strokeWidth="4.6" strokeLinejoin="miter" />
        {/* 目。斜めの隙間。左右で角度を変えて不安にする */}
        <path d={jag([[398, 344], [420, 338], [422, 350], [400, 356]], r, 12, 1)} fill={INK} />
        <path d={jag([[430, 340], [446, 336], [448, 350], [432, 352]], r, 10, 1)} fill={INK} />
        {/* 鼻と口。線は一の字 */}
        <path d={jag([[416, 356], [412, 382], [426, 384]], r, 12, 1.2, false)} fill="none" stroke={INK} strokeWidth="3" />
        <path d={jag([[404, 396], [438, 390], [436, 400], [404, 405]], r, 12, 1)} fill={RED} />
        {/* 頬の刻み。木版の刃跡 */}
        <g fill={INK} opacity="0.6">
          {hatch(r, [392, 350, 30, 60], 78, 8, 1.2, 46).map((d, i) => (
            <path key={`fh${i}`} d={d} />
          ))}
        </g>

        {/* 帽子 */}
        <path d={jag(hat, r, 24, 2.6)} fill={INK} transform="translate(-4 -5)" />
        <path d={jag(hat, r, 24, 2.6)} fill={INK} />
        <path d={jag(hat, r, 24, 2.6)} fill="none" stroke={PAPER} strokeWidth="2" strokeLinejoin="miter" opacity="0.55" />

        {/* ── 題字。左上の壁に打ち込む。傾けて画面と揃える ──────────── */}
        <g transform="rotate(-6 40 96)">
          <text
            x="26" y="96"
            fill={PAPER}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="46"
            fontWeight="800"
            letterSpacing="-1"
            style={{ paintOrder: "stroke" }}
            stroke={INK}
            strokeWidth="7"
          >
            DIE BRÜCKE
          </text>
          <text
            x="30" y="120"
            fill={ORANGE}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="11"
            fontWeight="700"
            letterSpacing="4.6"
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
