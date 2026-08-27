/**
 * オーロラUI。
 *
 * ■ 前稿の失敗（検分でここを作り直した）
 *   前稿は惑星の縁の上に極光のカーテンを立てた天体イラストだった。
 *   絵としては綺麗だが、これを見た人が learn するのは「オーロラ」であって
 *   「オーロラUI」ではない。この様式は SaaS のダッシュボードから広がった
 *   画面の様式で、極光はあくまで背景の比喩でしかない。
 *   だから縦のカーテンと惑星と星をやめ、
 *   「ぼかしきった色の霧の上に、平らなUIが浮いている」絵に組み直した。
 *
 * ■ 隣のグラスモーフィズムとどこで分けているか
 *   あちらの板は磨りガラスで、後ろの物を実際にぼかして通す。
 *   板そのものが主役で、輪郭も白い縁も太い。
 *   こちらの板は背景をぼかさない。白8%のベタと1pxの縁があるだけの、
 *   ほとんど平らな板。光っているのは板ではなく後ろの霧のほうで、
 *   板は霧を隠さない大きさに留める。註にもそう書いてある。
 *
 * ■ ここで作っている「らしさ」
 *   1. ぼかし半径を要素の幅と同じだけ取ること。これがこの様式の唯一の規則で、
 *      下に実物の見本（blur 0 / 半分 / 幅と同じ）を並べて証拠にした。
 *      境目が1本でも見えた瞬間、これは安いグラデーションに落ちる。
 *   2. 加算で光ること。霧は mixBlendMode: screen。重なりが白へ抜ける。
 *   3. 色相は紫・シアン・ピンクの3つだけ。4つ目を足すと灰に濁る。
 *   4. 地は真っ黒でなく紺。文字は純白でなく薄紫（#e9e6ff）。
 *   5. 下三分の一を空けること。霧は上60%で終わらせ、下は暗いまま置く。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "au";
const DARK = "#0a0f1e";
const VIOLET = "#6f6bff";
const CYAN = "#22d3ee";
const PINK = "#f472b6";
const LIGHT = "#e9e6ff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', ui-monospace, monospace";

/** 霧の塊。真円だと3つ並べただけに見えるので、正弦で縁を崩した閉曲線にする */
function bloom(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const r = rand(seed);
  const N = 16;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 0.74 + r() * 0.5;
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** カードの中の棒グラフ。実行時乱数は使わない */
const BARS = (() => {
  const r = rand(3311);
  return Array.from({ length: 16 }, () => r(0.22, 1));
})();

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="オーロラUI様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* ぼかしは要素の幅と同じ半径まで取る。ここが様式の芯なので値を大きく持つ */}
        <filter id={`${P}-b90`} filterUnits="userSpaceOnUse" x="-400" y="-400" width="1400" height="1600">
          <feGaussianBlur stdDeviation="90" />
        </filter>
        <filter id={`${P}-b56`} filterUnits="userSpaceOnUse" x="-400" y="-400" width="1400" height="1600">
          <feGaussianBlur stdDeviation="56" />
        </filter>
        <filter id={`${P}-b30`} filterUnits="userSpaceOnUse" x="-400" y="-400" width="1400" height="1600">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        {/* 下の見本用。40幅の四角を 0 / 20 / 40 でぼかして並べる */}
        <filter id={`${P}-s20`} filterUnits="userSpaceOnUse" x="-80" y="-80" width="240" height="240">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={`${P}-s40`} filterUnits="userSpaceOnUse" x="-80" y="-80" width="240" height="240">
          <feGaussianBlur stdDeviation="20" />
        </filter>

        <linearGradient id={`${P}-night`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#0b1024" />
          <stop offset="0.55" stopColor={DARK} />
          <stop offset="1" stopColor="#06080f" />
        </linearGradient>
        <linearGradient id={`${P}-ramp`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={VIOLET} />
          <stop offset="0.5" stopColor={CYAN} />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        {/* 霧を下側で消す。下三分の一を暗いまま残すため */}
        <linearGradient id={`${P}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.58" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.86" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${P}-upper`}>
          <rect width="600" height="800" fill={`url(#${P}-fade)`} />
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-night)`} />

        {/* ── 光の霧。3色だけを加算で重ねる。一番明るい塊は左上の三分の一 ── */}
        <g mask={`url(#${P}-upper)`} style={{ mixBlendMode: "screen" }}>
          <g filter={`url(#${P}-b90)`}>
            <path d={bloom(196, 214, 250, 208, 11)} fill={VIOLET} opacity="0.95" />
            <path d={bloom(452, 322, 236, 196, 27)} fill={CYAN} opacity="0.8" />
            <path d={bloom(372, 118, 226, 150, 43)} fill={PINK} opacity="0.72" />
          </g>
          {/* 2段目。少しだけ弱いぼかしで、霧に濃淡の芯を作る。
              それでも幅より小さい半径にはしない（境目が出た時点で負け） */}
          <g filter={`url(#${P}-b56)`} opacity="0.62">
            <path d={bloom(238, 190, 132, 112, 71)} fill={VIOLET} />
            <path d={bloom(436, 286, 118, 100, 83)} fill={CYAN} />
            <path d={bloom(120, 330, 110, 96, 97)} fill={PINK} opacity="0.7" />
          </g>
          {/* 一番明るい芯。ここだけ白へ抜ける */}
          <g filter={`url(#${P}-b30)`} opacity="0.34">
            <ellipse cx="228" cy="196" rx="62" ry="52" fill="#c9c6ff" />
            <ellipse cx="446" cy="296" rx="48" ry="40" fill="#b8f2ff" />
          </g>
        </g>

        {/* ── 題字。霧の一番暗いところ（左上の外側）に置く ───────────── */}
        <text x="46" y="88" fill={LIGHT} fontFamily={SANS} fontSize="44" fontWeight="200" letterSpacing="13">
          AURORA
        </text>
        <text x="50" y="114" fill={LIGHT} opacity="0.62" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="5.6">
          U I — 2 0 2 0 s
        </text>

        {/* 右上の nav。SaaS の hero はほぼ必ずこの列を持つ。
            題字と対にして、上半分が霧だけで空くのを防ぐ */}
        <g transform="translate(330 58)">
          {[
            [0, 62, "DOCS"],
            [70, 62, "PRICING"],
            [140, 80, "SIGN IN"],
          ].map(([x, w, label], i) => (
            <g key={i}>
              <rect x={x as number} y="0" width={w as number} height="24" rx="12" fill="#ffffff" fillOpacity={i === 2 ? 0.16 : 0.06} />
              <rect x={x as number} y="0" width={w as number} height="24" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" />
              <text
                x={(x as number) + (w as number) / 2} y="15.5" textAnchor="middle"
                fill={LIGHT} opacity={i === 2 ? 0.95 : 0.7}
                fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4"
              >
                {label as string}
              </text>
            </g>
          ))}
        </g>

        {/* hero の一行。霧だけで200近く空くと、縮小したとき
            ただのグラデーションに見える。文字を1本通して版面を締める */}
        <text x="88" y="212" fill={LIGHT} fontFamily={SANS} fontSize="31" fontWeight="200" letterSpacing="0.4">
          Depth without a single edge.
        </text>
        <text x="90" y="238" fill={LIGHT} opacity="0.52" fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="3">
          A DASHBOARD ON A FIELD OF LIGHT
        </text>

        {/* ── 浮いている板。ここが「UI」だと分かる唯一の物 ───────────
            背景をぼかさない。白8%のベタと1pxの縁だけ。
            ガラスにするとグラスモーフィズムになってしまう */}
        <g transform="translate(88 296)">
          <rect width="408" height="212" rx="20" fill="#ffffff" fillOpacity="0.08" />
          <rect width="408" height="212" rx="20" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />

          {/* 見出しの行 */}
          <circle cx="26" cy="30" r="4" fill={CYAN} />
          <text x="40" y="34" fill={LIGHT} fontFamily={SANS} fontSize="9.5" fontWeight="700" letterSpacing="2.4">
            THROUGHPUT
          </text>
          <rect x="330" y="20" width="56" height="20" rx="10" fill="#ffffff" fillOpacity="0.1" />
          <rect x="330" y="20" width="56" height="20" rx="10" fill="none" stroke="#ffffff" strokeOpacity="0.2" />
          <text x="358" y="34" textAnchor="middle" fill={LIGHT} fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.4">
            LIVE
          </text>

          {/* 数字 */}
          <text x="26" y="86" fill={LIGHT} fontFamily={SANS} fontSize="38" fontWeight="200" letterSpacing="1">
            98.4
          </text>
          <text x="110" y="86" fill={LIGHT} opacity="0.55" fontFamily={SANS} fontSize="14" fontWeight="300">
            %
          </text>
          <text x="150" y="82" fill={CYAN} fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="1.2">
            +2.1
          </text>

          {/* 棒。3色のなかだけで振る */}
          <g>
            {BARS.map((h, i) => {
              const c = i % 3 === 0 ? VIOLET : i % 3 === 1 ? CYAN : PINK;
              const bh = 6 + h * 52;
              return (
                <rect
                  key={i} x={26 + i * 22} y={162 - bh} width="12" height={bh} rx="6"
                  fill={c} opacity={0.42 + h * 0.42}
                />
              );
            })}
          </g>
          <line x1="26" y1="168" x2="382" y2="168" stroke="#ffffff" strokeOpacity="0.14" />
          <g fill={LIGHT} opacity="0.42" fontFamily={MONO} fontSize="7">
            <text x="26" y="186">00:00</text>
            <text x="204" y="186" textAnchor="middle">12:00</text>
          </g>
        </g>

        {/* 小さい板を重ねる。奥行きは影ではなく重ね順だけで示す */}
        <g transform="translate(356 476)">
          <rect width="176" height="52" rx="16" fill="#ffffff" fillOpacity="0.1" />
          <rect width="176" height="52" rx="16" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
          <rect x="16" y="20" width="96" height="12" rx="6" fill={`url(#${P}-ramp)`} />
          <text x="16" y="16" fill={LIGHT} opacity="0.55" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.8">
            REGION
          </text>
          <text x="152" y="32" textAnchor="middle" fill={LIGHT} fontFamily={SANS} fontSize="12" fontWeight="300">
            →
          </text>
        </g>

        {/* ── 下三分の一。ここは霧を入れず、註だけ置く ───────────── */}
        <line x1="46" y1="606" x2="554" y2="606" stroke={LIGHT} strokeWidth="1" opacity="0.13" />

        {/* ぼかし半径の見本。0 → 幅の半分 → 幅と同じ。
            右端が「境目の見えない」状態で、これがこの様式の合格線 */}
        <g transform="translate(46 630)">
          <text x="0" y="0" fill={LIGHT} opacity="0.5" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2.2">
            RADIUS = ELEMENT WIDTH
          </text>
          <g transform="translate(0 12)">
            <rect width="40" height="40" rx="8" fill={VIOLET} />
            <g filter={`url(#${P}-s20)`}>
              <rect x="72" width="40" height="40" rx="8" fill={CYAN} />
            </g>
            <g filter={`url(#${P}-s40)`}>
              <rect x="144" width="40" height="40" rx="8" fill={PINK} />
            </g>
          </g>
          <g fill={LIGHT} opacity="0.4" fontFamily={MONO} fontSize="7">
            <text x="0" y="72">blur 0</text>
            <text x="72" y="72">blur 20</text>
            <text x="144" y="72">blur 40 ✓</text>
          </g>
        </g>

        {/* 3色の帯。この3つしか使っていない */}
        <g transform="translate(330 640)">
          <rect width="224" height="9" rx="4.5" fill={`url(#${P}-ramp)`} />
          <g fill={LIGHT} opacity="0.5" fontFamily={MONO} fontSize="7.5">
            <text x="0" y="24">#6F6BFF</text>
            <text x="112" y="24" textAnchor="middle">#22D3EE</text>
            <text x="224" y="24" textAnchor="end">#F472B6</text>
          </g>
          <text
            x="224" y="46" textAnchor="end" fill={LIGHT} opacity="0.36"
            fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2"
          >
            THREE HUES, ADDED — NEVER MIXED
          </text>
        </g>

        <g fill={LIGHT} fontFamily={MONO} fontSize="8.5" opacity="0.46">
          <text x="46" y="732">background: #0a0f1e</text>
          <text x="46" y="748">filter: blur(90px)</text>
          <text x="46" y="764">card: rgba(255,255,255,.08) — no backdrop-filter</text>
        </g>
        <text x="554" y="764" textAnchor="end" fill={LIGHT} opacity="0.66" fontFamily={SANS} fontSize="10" fontWeight="400" letterSpacing="1">
          The background is the only thing that glows.
        </text>

        {/* 粒。帯（バンディング）を殺すために夜空の版には必ず要る */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.12"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
    </svg>
  );
}
