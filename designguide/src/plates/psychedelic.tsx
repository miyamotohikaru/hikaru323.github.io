/**
 * サイケデリック・アート。
 *
 * 1966〜68年のサンフランシスコ。フィルモアとアヴァロンのコンサート告知。
 * ウェス・ウィルソン、ヴィクター・モスコソ。読ませる気のない文字が、
 * 版面の隅まで波打って詰まっている。
 *
 * ■ この版でやっていること
 *   1. 余白をゼロにする。地の色が見える所を作らない。
 *      呼吸できる隙間を1つでも残すと、それはスイス・スタイルの版面になる。
 *   2. 文字を曲線に流し込む（textPath）。さらに textLength で
 *      パスいっぱいに引き伸ばす。字間ではなく字形そのものを歪ませるのが
 *      この様式の文字組み。読みにくさは失敗ではなく目的。
 *   3. 補色を直に接する。朱の隣は青緑、洋紅の隣は黄。
 *      明度をわざと近づけると、境目が目の中で震える（vibration）。
 *      モスコソはこれを狙って、輪郭線を1本も引かなかった。
 *   4. 波紋。同心円の半径を正弦で揺らした閉曲線を重ねる。
 *      中心を少しずつずらすと、面が液体のように流れる。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "psy";

const VIOLET = "#2b0a4a";
const ORANGE = "#ff5f1f";
const YELLOW = "#ffd400";
const TEAL = "#00b3a4";
const MAGENTA = "#ff2e88";

type Rnd = ReturnType<typeof rand>;

/** 点列を滑らかな閉曲線に。中点を通す二次ベジェで角を消す */
function smoothClosed(p: [number, number][]) {
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const m0 = mid(p[n - 1], p[0]);
  let d = `M${f(m0[0])} ${f(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const m = mid(p[i], p[(i + 1) % n]);
    d += `Q${f(p[i][0])} ${f(p[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}Z`;
}

/** 波紋ひとつ。半径を2つの正弦で揺らした閉曲線 */
function ripple(cx: number, cy: number, R: number, k: number, amp: number, ph: number, steps = 44) {
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = R + amp * Math.sin(k * a + ph) + amp * 0.42 * Math.sin((k * 2 + 1) * a - ph * 1.7);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smoothClosed(pts);
}

export default function Plate() {
  const r = rand(19670114);

  const CX = 300;
  const CY = 402;

  /* 波紋。外から内へ描き重ねる。色は補色を交互に。
     中心を少しずつずらすと、同心円ではなく流れになる */
  const rings: { d: string; c: string }[] = [];
  const CYCLE = [ORANGE, TEAL, MAGENTA, YELLOW];
  for (let i = 0; i < 21; i++) {
    const R = 520 - i * 22;
    const dx = Math.sin(i * 0.55) * 26;
    const dy = Math.cos(i * 0.42) * 20;
    rings.push({
      d: ripple(CX + dx, CY + dy, R, 3 + (i % 4), 16 + (i % 3) * 9, i * 1.31),
      c: CYCLE[i % 4],
    });
  }

  /* 睫毛。初稿は勝手な弧の上に並べたので、瞼から浮いた棘になった。
     上瞼の三次ベジェを実際に刻み、その接線から生やす */
  const LID: [number, number][] = [[104, 402], [168, 292], [432, 292], [496, 402]];
  const bez = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u ** 3 * LID[0][0] + 3 * u * u * t * LID[1][0] + 3 * u * t * t * LID[2][0] + t ** 3 * LID[3][0],
      u ** 3 * LID[0][1] + 3 * u * u * t * LID[1][1] + 3 * u * t * t * LID[2][1] + t ** 3 * LID[3][1],
    ];
  };
  const lash = Array.from({ length: 11 }, (_, i) => {
    const t = 0.08 + (i / 10) * 0.84;
    const [x, y] = bez(t);
    const [xa, ya] = bez(t - 0.02);
    const [xb, yb] = bez(t + 0.02);
    const tx = xb - xa;
    const ty = yb - ya;
    const L0 = Math.hypot(tx, ty) || 1;
    // 外向きの法線。上瞼なので上へ
    const nx = ty / L0;
    const ny = -tx / L0;
    const L = 40 + Math.sin(Math.PI * t) * 46;
    // 先を外へ反らせる
    const bx2 = x + nx * L + tx / L0 * L * 0.55;
    const by2 = y + ny * L + ty / L0 * L * 0.55;
    const c1x = x + nx * L * 0.62;
    const c1y = y + ny * L * 0.62;
    const w = 9;
    return `M${(x - (tx / L0) * w).toFixed(1)} ${(y - (ty / L0) * w).toFixed(1)} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${bx2.toFixed(1)} ${by2.toFixed(1)} Q${(c1x + (tx / L0) * w * 1.6).toFixed(1)} ${(c1y + (ty / L0) * w * 1.6).toFixed(1)} ${(x + (tx / L0) * w).toFixed(1)} ${(y + (ty / L0) * w).toFixed(1)} Z`;
  });

  const EYE = "M104 402 C 168 292 432 292 496 402 C 432 512 168 512 104 402 Z";

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="サイケデリック・アート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-iris`}>
          <circle cx={CX} cy={CY} r="82" />
        </clipPath>
        <clipPath id={`${P}-eye`}>
          <path d={EYE} />
        </clipPath>
        {/* 文字を流す曲線。縦1.45倍の座標系で描いてあるので、
            ここの y はすべて 1.45 で割った値になっている */}
        <path id={`${P}-arc1`} d="M14 110 Q 300 34 586 110" fill="none" />
        <path id={`${P}-arc2`} d="M20 128 Q 300 82 580 128" fill="none" />
        <path id={`${P}-wave1`} d="M6 438 Q 110 412 208 434 T 404 432 T 594 446" fill="none" />
        <path id={`${P}-wave2`} d="M10 492 Q 150 516 300 494 T 590 504" fill="none" />
        <path id={`${P}-wave3`} d="M10 536 Q 160 516 300 536 T 590 528" fill="none" />
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 地。ここは1px も見えないのが正しい */}
        <rect width="600" height="800" fill={VIOLET} />

        {/* ── 波紋の場 ───────────────────────────────────────────── */}
        {rings.map((g, i) => (
          <path key={`rg${i}`} d={g.d} fill={g.c} />
        ))}

        {/* ── 目。版面の芯。波紋がここから発しているように見せる ────── */}
        <g>
          {/* 震えの縁。補色を細く外に1本だけ。初稿は26px＋12px の二重輪にしたので
             土星の環に見えた。輪は細く、白目の黄を必ず残す */}
          <path d={EYE} fill="none" stroke={ORANGE} strokeWidth="16" />
          <path d={EYE} fill={YELLOW} stroke={VIOLET} strokeWidth="8" />
          <g clipPath={`url(#${P}-eye)`}>
            <path d={ripple(300, 402, 112, 5, 14, 1.2)} fill={ORANGE} />
            <path d={ripple(300, 402, 98, 4, 10, 2.6)} fill={MAGENTA} />
          </g>
          {/* 虹彩。中も波紋 */}
          <circle cx={CX} cy={CY} r="82" fill={TEAL} />
          <g clipPath={`url(#${P}-iris)`}>
            <path d={ripple(CX, CY, 68, 7, 9, 0.4)} fill={YELLOW} />
            <path d={ripple(CX, CY, 54, 9, 7, 2.2)} fill={ORANGE} />
            <path d={ripple(CX, CY, 42, 11, 5, 4.1)} fill={MAGENTA} />
          </g>
          <circle cx={CX} cy={CY} r="30" fill={VIOLET} />
          <path d="M276 384 C 288 372 306 370 316 378 C 302 378 288 384 276 396 Z" fill={YELLOW} />
          {/* 睫毛 */}
          <g fill={VIOLET}>
            {lash.map((d, i) => (
              <path key={`ls${i}`} d={d} />
            ))}
          </g>
          {/* 下瞼の彩り */}
          <path d="M120 428 C 186 502 414 502 480 428 C 414 478 186 478 120 428 Z" fill={VIOLET} opacity="0.9" />
        </g>

        {/* ── 文字。縦1.45倍の座標系に置き、曲線へ流し込む ─────────── */}
        <g transform="scale(1 1.45)">
          {/* 洋紅の縁取りを先に。黄の字が青緑の地の上で震える */}
          <text
            fill={YELLOW}
            stroke={VIOLET}
            strokeWidth="7"
            style={{ paintOrder: "stroke" }}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="74"
            fontWeight="800"
          >
            <textPath href={`#${P}-arc1`} startOffset="0" textLength="572" lengthAdjust="spacingAndGlyphs">
              THE FILLMORE
            </textPath>
          </text>
          <text
            fill={MAGENTA}
            stroke={VIOLET}
            strokeWidth="4.5"
            style={{ paintOrder: "stroke" }}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="30"
            fontWeight="800"
          >
            <textPath href={`#${P}-arc2`} startOffset="0" textLength="566" lengthAdjust="spacingAndGlyphs">
              AUDITORIUM · SAN FRANCISCO
            </textPath>
          </text>

          <text
            fill={VIOLET}
            stroke={YELLOW}
            strokeWidth="6"
            style={{ paintOrder: "stroke" }}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="48"
            fontWeight="800"
          >
            <textPath href={`#${P}-wave1`} startOffset="0" textLength="596" lengthAdjust="spacingAndGlyphs">
              THE ELECTRIC PRUNES
            </textPath>
          </text>
          <text
            fill={YELLOW}
            stroke={VIOLET}
            strokeWidth="5"
            style={{ paintOrder: "stroke" }}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="36"
            fontWeight="800"
          >
            <textPath href={`#${P}-wave2`} startOffset="0" textLength="584" lengthAdjust="spacingAndGlyphs">
              QUICKSILVER · MOBY GRAPE
            </textPath>
          </text>
          <text
            fill={TEAL}
            stroke={VIOLET}
            strokeWidth="4"
            style={{ paintOrder: "stroke" }}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="22"
            fontWeight="800"
          >
            <textPath href={`#${P}-wave3`} startOffset="0" textLength="578" lengthAdjust="spacingAndGlyphs">
              LIGHTS BY THE HEADLIGHTS — FEB 12 — TICKETS $3.50
            </textPath>
          </text>
        </g>

        {/* 隅を埋める泡。余白を1つも残さないための詰め物 */}
        <g>
          {Array.from({ length: 26 }, (_, i) => {
            const x = r(0, 600);
            const y = r(0, 800);
            const rr = r(5, 17);
            const c = [ORANGE, TEAL, MAGENTA, YELLOW][i % 4];
            return <path key={`bb${i}`} d={ripple(x, y, rr, 5, rr * 0.24, i, 18)} fill={c} opacity="0.9" />;
          })}
        </g>

        {/* 紙の粒。オフセットの安い紙 */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.14"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
