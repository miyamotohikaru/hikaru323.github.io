/**
 * オーロラUI。
 *
 * ほとんど黒い地に、発光する色の雲を強くぼかして浮かべる。
 * 画面の中で唯一「光っているもの」が背景である、という転倒がこの様式の芯。
 *
 * ■ 隣のグラスモーフィズムと同じ絵にしないために
 *   あちらは暗い地に光の玉を置き、その上に輪郭のはっきりした板を乗せる。
 *   板が主役で、光は板の後ろにある背景でしかない。
 *   こちらは板を1枚も置かない。輪郭のある物は星と惑星の縁だけで、
 *   残りは全部「光そのもの」にした。丸い玉ではなく、天から地へ降りる
 *   縦のカーテンにしてあるのは、極光の形がそうだからで、
 *   丸いぼかしを3つ置くとグラスモーフィズムの背景と見分けがつかない。
 *
 * ■ ここで作っている「らしさ」
 *   1. 加算で光ること。カーテンは mixBlendMode: screen で重ねてある。
 *      重なった所が白へ抜ける。乗算だと絵の具になり、光に見えない。
 *   2. ぼかしの段が2つあること。大きくぼかした雲の上に、
 *      弱くぼかした縦の筋（レイ）を重ねる。極光は遠目には雲、
 *      近くで見ると簾。片方だけだと、ただのグラデーションになる。
 *   3. 光がどこかから「立ち上がって」いること。惑星の縁を1本入れて、
 *      カーテンの根元を決めた。根元が無いと宙に浮いた色の染みになる。
 */
import { ATLAS, rand, lerp } from "@/lib/plate";

const P = "au";
const DARK = "#0a0f1e";
const VIOLET = "#6f6bff";
const CYAN = "#22d3ee";
const PINK = "#f472b6";
const LIGHT = "#e9e6ff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', ui-monospace, monospace";

/** 惑星。中心を版面のはるか下に置いて、縁だけを地平線として見せる */
const PL = { cx: 300, cy: 1200, r: 648 };

/** 縦のカーテン。左右の縁を正弦で振り、幅も上下で変える */
function ribbon(cx: number, halfW: number, amp: number, freq: number, phase: number, y0: number, y1: number) {
  const N = 22;
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = lerp(y0, y1, t);
    const off = Math.sin(t * freq + phase) * amp + Math.sin(t * freq * 2.4 + phase * 1.7) * amp * 0.36;
    const w = halfW * (0.42 + 0.58 * Math.sin(t * 2.6 + phase * 0.8) ** 2);
    L.push(`${(cx + off - w).toFixed(1)} ${y.toFixed(1)}`);
    R.push(`${(cx + off + w).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${L.join(" L")} L${R.reverse().join(" L")} Z`;
}

/** カーテンの中を走る縦の筋。極光を近くで見ると簾になっている */
function ray(cx: number, amp: number, freq: number, phase: number, y0: number, y1: number) {
  const N = 18;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = lerp(y0, y1, t);
    const off = Math.sin(t * freq + phase) * amp + Math.sin(t * freq * 2.4 + phase * 1.7) * amp * 0.36;
    pts.push(`${(cx + off).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const CURTAINS = [
  { cx: 118, w: 62, amp: 46, freq: 3.1, ph: 0.6, c: VIOLET, o: 0.72, y0: 40, y1: 580 },
  { cx: 262, w: 86, amp: 58, freq: 2.6, ph: 2.2, c: CYAN, o: 0.8, y0: -20, y1: 596 },
  { cx: 392, w: 70, amp: 52, freq: 3.4, ph: 4.1, c: VIOLET, o: 0.78, y0: 10, y1: 588 },
  { cx: 500, w: 58, amp: 40, freq: 2.9, ph: 5.4, c: PINK, o: 0.7, y0: 60, y1: 574 },
];

export default function Plate() {
  const r = rand(4417);
  const stars = Array.from({ length: 170 }, () => ({
    x: r(0, 600),
    y: r(0, 620),
    s: r(0.5, 1.9),
    o: r(0.2, 1),
  }));
  const rr = rand(9021);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="オーロラUI様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-sky`}>
          {/* 惑星の外側だけを空にする。カーテンは地平線の手前に出ない */}
          <path d={`M0 0 H600 V800 H0 Z M${PL.cx - PL.r} ${PL.cy} a ${PL.r} ${PL.r} 0 1 0 ${PL.r * 2} 0 a ${PL.r} ${PL.r} 0 1 0 ${-PL.r * 2} 0 Z`} clipRule="evenodd" />
        </clipPath>

        <filter id={`${P}-b40`} filterUnits="userSpaceOnUse" x="-200" y="-260" width="1000" height="1320">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={`${P}-b14`} filterUnits="userSpaceOnUse" x="-200" y="-260" width="1000" height="1320">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${P}-b5`} filterUnits="userSpaceOnUse" x="-200" y="-260" width="1000" height="1320">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${P}-b2`} filterUnits="userSpaceOnUse" x="-200" y="-260" width="1000" height="1320">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        <linearGradient id={`${P}-night`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#05070f" />
          <stop offset="0.6" stopColor={DARK} />
          <stop offset="1" stopColor="#070a16" />
        </linearGradient>
        {/* カーテンの明るさ。天で消え、地平線の手前で最も強い */}
        {[["v", VIOLET], ["c", CYAN], ["p", PINK]].map(([k, c]) => (
          <linearGradient key={k} id={`${P}-g${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity="0" />
            <stop offset="0.28" stopColor={c} stopOpacity="0.5" />
            <stop offset="0.74" stopColor={c} stopOpacity="1" />
            <stop offset="1" stopColor={c} stopOpacity="0.1" />
          </linearGradient>
        ))}
        <linearGradient id={`${P}-ramp`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={VIOLET} />
          <stop offset="0.5" stopColor={CYAN} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-night)`} />

        {/* 星。惑星に隠れない高さにだけ置く */}
        <g fill={LIGHT}>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={s.o * 0.9} />
          ))}
        </g>
        {/* 明るい星は十字に滲む */}
        {stars.filter((s) => s.s > 1.7).slice(0, 7).map((s, i) => (
          <g key={`f${i}`} stroke={LIGHT} strokeWidth="0.8" opacity="0.5">
            <line x1={s.x - 7} y1={s.y} x2={s.x + 7} y2={s.y} />
            <line x1={s.x} y1={s.y - 7} x2={s.x} y2={s.y + 7} />
          </g>
        ))}

        <g clipPath={`url(#${P}-sky)`}>
          {/* ── 光のカーテン。screen で加算して重なりを白へ抜く ───── */}
          <g style={{ mixBlendMode: "screen" }}>
            {CURTAINS.map((c, i) => {
              const g = c.c === CYAN ? "c" : c.c === PINK ? "p" : "v";
              return (
                <g key={i} opacity={c.o}>
                  {/* 遠目の雲 */}
                  <path d={ribbon(c.cx, c.w * 1.5, c.amp, c.freq, c.ph, c.y0, c.y1)} fill={`url(#${P}-g${g})`} filter={`url(#${P}-b40)`} opacity="0.85" />
                  {/* 芯 */}
                  <path d={ribbon(c.cx, c.w * 0.7, c.amp, c.freq, c.ph, c.y0, c.y1)} fill={`url(#${P}-g${g})`} filter={`url(#${P}-b14)`} />
                  {/* 近くで見たときの簾。ここが無いとただのグラデーションになる */}
                  <g filter={`url(#${P}-b5)`} opacity="0.75">
                    {Array.from({ length: 11 }, (_, j) => {
                      const off = (j - 5) * (c.w / 4.6);
                      return (
                        <path
                          key={j}
                          d={ray(c.cx + off, c.amp, c.freq, c.ph, c.y0 + rr(0, 90), c.y1 - rr(0, 60))}
                          fill="none" stroke={`url(#${P}-g${g})`} strokeWidth={rr(1.6, 4.6)}
                          opacity={rr(0.3, 0.95)}
                        />
                      );
                    })}
                  </g>
                </g>
              );
            })}
          </g>

          {/* 地平線の手前の靄。カーテンの根元がここで滲む */}
          <g style={{ mixBlendMode: "screen" }} filter={`url(#${P}-b40)`} opacity="0.55">
            <ellipse cx="290" cy="574" rx="330" ry="52" fill={CYAN} />
            <ellipse cx="470" cy="566" rx="150" ry="34" fill={PINK} />
            <ellipse cx="110" cy="572" rx="150" ry="34" fill={VIOLET} />
          </g>
        </g>

        {/* ── 惑星。縁の1本だけが版面で唯一の硬い輪郭 ────────────── */}
        <circle cx={PL.cx} cy={PL.cy} r={PL.r} fill="#04060d" />
        <g style={{ mixBlendMode: "screen" }}>
          <circle cx={PL.cx} cy={PL.cy} r={PL.r + 1} fill="none" stroke={CYAN} strokeWidth="7" opacity="0.5" filter={`url(#${P}-b5)`} />
          <circle cx={PL.cx} cy={PL.cy} r={PL.r} fill="none" stroke={LIGHT} strokeWidth="1.2" opacity="0.75" filter={`url(#${P}-b2)`} />
        </g>

        {/* ── 題字。光の中に置くと沈むので、暗い天の左に寄せる ────── */}
        <g style={{ mixBlendMode: "screen" }} opacity="0.55" filter={`url(#${P}-b14)`}>
          <text x="46" y="126" fill={CYAN} fontFamily={SANS} fontSize="58" fontWeight="200" letterSpacing="15">
            AURORA
          </text>
        </g>
        <text x="46" y="126" fill={LIGHT} fontFamily={SANS} fontSize="58" fontWeight="200" letterSpacing="15">
          AURORA
        </text>
        <text x="50" y="152" fill={LIGHT} opacity="0.6" fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="6.4">
          UI — 2020s
        </text>

        {/* ── 惑星の面に置く註 ─────────────────────────────────── */}
        <g fill={LIGHT} fontFamily={MONO} fontSize="9" opacity="0.52">
          <text x="46" y="678">background: #0a0f1e</text>
          <text x="46" y="696">filter: blur(80px)</text>
          <text x="46" y="714">mix-blend-mode: screen</text>
        </g>

        {/* 3色の帯。この3つしか使っていない */}
        <rect x="330" y="666" width="224" height="9" rx="4.5" fill={`url(#${P}-ramp)`} />
        <g fill={LIGHT} opacity="0.5" fontFamily={MONO} fontSize="7.5">
          <text x="330" y="690">#6F6BFF</text>
          <text x="442" y="690" textAnchor="middle">#22D3EE</text>
          <text x="554" y="690" textAnchor="end">#F472B6</text>
        </g>
        <text
          x="554" y="716" textAnchor="end" fill={LIGHT} opacity="0.36"
          fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2.2"
        >
          THREE HUES, ADDED — NEVER MIXED
        </text>

        {/* 締めの1行 */}
        <line x1="46" y1="746" x2="554" y2="746" stroke={LIGHT} strokeWidth="1" opacity="0.14" />
        <text x="46" y="772" fill={LIGHT} opacity="0.66" fontFamily={SANS} fontSize="10.5" fontWeight="400" letterSpacing="1.2">
          The background is the only thing that glows.
        </text>

        {/* 粒。夜空の版はここだけ粒子が要る。加算で乗せる */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.13"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
    </svg>
  );
}
