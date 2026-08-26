/**
 * キュビズム。
 *
 * 1911–12年のブラック／ピカソ。分析的キュビズムから、
 * ステンシル文字と貼り紙が入り始めるあたり。
 *
 * ■ 幾何の系譜のなかで、これだけ別物に見せるために
 *   1. **楕円の画布。** ブラックもピカソもこの時期は楕円のカンヴァスを
 *      使った。四角い版面を割る他の様式と、輪郭からして違う。
 *      面は縁に近づくほど薄れ、素の麻布に溶ける。
 *   2. **色を捨てる。** 土色4色だけ。原色を1つでも入れると
 *      バウハウス／デ・ステイルの側に落ちる。
 *   3. **面を透かして重ねる（パッサージュ）。** 不透明な面を並べるのではなく、
 *      半透明の面を交差させ、重なりで中間調を作る。ここが構成主義との差。
 *   4. **同じものを2度描く。** グラスは真上から見た楕円と、横から見た台形を
 *      1本の辺で繋いである。多視点の同時提示という主題そのもの。
 *      音孔も大小2つ、違う角度で置いてある。
 *   5. **貼り紙（パピエ・コレ）。** 木目の刷り紙、籐編み、新聞。
 *      ステンシルの JOU は「JOURNAL」の切れ端。
 *
 * ■ 面の作りかた
 *   角度を自由にすると「割れたガラス」になる。3つの支点から、
 *   決まった19方向にしか辺を出さない。半径も 7 段に量子化してある。
 *   だから頂点が勝手に揃い、手で構成したように見える。
 */
import { ATLAS, rand, rad } from "@/lib/plate";

const P = "cub";
const SAND = "#d8cdb8";
const KHAKI = "#8a7f6b";
const SLATE = "#3f4a52";
const RUST = "#a8582f";
const BLACK = "#1c1a17";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 面の階調。地の砂色から黒までの8段。原色は足さない */
const RAMP = ["#e6ddc8", "#d2c6ab", "#bcae91", "#a0947c", "#847b67", "#5f6357", "#4a5157", "#31363a"];

/* 支点。縦の背骨を作るように上・中・下へ。静物の三角構図 */
const PIVOTS: [number, number][] = [
  [248, 292],
  [364, 436],
  [286, 566],
  [198, 462],
];
/* 辺の方向。不規則だが有限。ここを乱数にすると構成が壊れる */
const ANGLES = [-84, -57, -31, -12, 9, 33, 58, 79, 104, 127, 152, 171, 196, 221, 248, 272, 297, 318, 341];
/* 半径も量子化する。頂点が勝手に揃って「組んだ」ように見える */
const RADII = [80, 120, 170, 220, 280, 340, 410];

export default function Plate() {
  const r = rand(19120714);

  const facets = Array.from({ length: 46 }, () => {
    const p = PIVOTS[Math.floor(r(0, PIVOTS.length))];
    const i = Math.floor(r(0, ANGLES.length));
    const k = 1 + Math.floor(r(0, 2.99));
    const a1 = ANGLES[i];
    const a2 = ANGLES[(i + k) % ANGLES.length];
    const r1 = RADII[Math.floor(r(0, RADII.length))];
    const r2 = RADII[Math.floor(r(0, RADII.length))];
    const tone = RAMP[Math.floor(r(0, RAMP.length))];
    const rust = r() > 0.9;
    const x1 = p[0] + Math.cos(rad(a1)) * r1;
    const y1 = p[1] + Math.sin(rad(a1)) * r1;
    const x2 = p[0] + Math.cos(rad(a2)) * r2;
    const y2 = p[1] + Math.sin(rad(a2)) * r2;
    return {
      pts: `${p[0]},${p[1]} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
      fill: rust ? RUST : tone,
      o: r(0.3, 0.6),
      /* 面の重心と平均角。筆致（ハッチング）をここに置く */
      cx: (p[0] + x1 + x2) / 3,
      cy: (p[1] + y1 + y2) / 3,
      ha: (a1 + a2) / 2 + 90,
      hatch: r() > 0.62,
      hlen: Math.min(72, (r1 + r2) / 7),
    };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="キュビズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 楕円の画布。縁に近づくほど面が消え、素の麻布になる */}
        <radialGradient id={`${P}-fade`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.66" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`${P}-oval`}>
          <ellipse cx="296" cy="372" rx="238" ry="306" fill={`url(#${P}-fade)`} />
        </mask>
        {/* 籐編み。ピカソが実際に印刷された籐柄の油布を貼った、あの柄 */}
        <pattern id={`${P}-cane`} width="17" height="17" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <path d="M0 0 L17 17 M17 0 L0 17" stroke={BLACK} strokeWidth="1.3" fill="none" opacity="0.62" />
          <path d="M8.5 0 L8.5 17 M0 8.5 L17 8.5" stroke={BLACK} strokeWidth="0.8" fill="none" opacity="0.4" />
          <circle cx="8.5" cy="8.5" r="2.4" fill="none" stroke={BLACK} strokeWidth="0.7" opacity="0.45" />
        </pattern>
        <clipPath id={`${P}-wood`}>
          <polygon points="98,548 232,532 248,660 112,678" />
        </clipPath>
        {/* ステンシルの橋。文字に穴を開け、下の面を透かせる */}
        <mask id={`${P}-stencil`}>
          <rect x="290" y="200" width="230" height="70" fill="#fff" />
          <rect x="290" y="222" width="230" height="5" fill="#000" />
          <rect x="290" y="248" width="230" height="5" fill="#000" />
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={SAND} />

        {/* ── 面。楕円の中だけ、縁で溶ける ─────────────────────── */}
        <g mask={`url(#${P}-oval)`}>
          {facets.map((f, i) => (
            <polygon key={`f${i}`} points={f.pts} fill={f.fill} opacity={f.o} />
          ))}

          {/* 筆致。ブラックの平行斜線。面の重心に置く */}
          <g stroke={BLACK} strokeWidth="0.9" opacity="0.22">
            {facets.map((f, i) =>
              f.hatch ? (
                <g key={`h${i}`} transform={`rotate(${f.ha.toFixed(1)} ${f.cx.toFixed(1)} ${f.cy.toFixed(1)})`}>
                  {Array.from({ length: 9 }, (_, j) => (
                    <line
                      key={j}
                      x1={f.cx - f.hlen / 2}
                      y1={f.cy - 18 + j * 4.5}
                      x2={f.cx + f.hlen / 2}
                      y2={f.cy - 18 + j * 4.5}
                    />
                  ))}
                </g>
              ) : null,
            )}
          </g>

          {/* ── 貼り紙 1：木目の刷り紙（フォー・ボワ） ───────────── */}
          <g clipPath={`url(#${P}-wood)`}>
            <polygon points="98,548 232,532 248,660 112,678" fill="#c2a274" opacity="0.9" />
            {Array.from({ length: 17 }, (_, i) => {
              const y = 534 + i * 9;
              return (
                <path
                  key={i}
                  d={`M92 ${y} C 130 ${y - 8}, 172 ${y + 9}, 210 ${y - 4} S 250 ${y + 6}, 256 ${y}`}
                  fill="none"
                  stroke={BLACK}
                  strokeWidth={r(0.7, 2.1).toFixed(2)}
                  opacity={r(0.25, 0.55).toFixed(2)}
                />
              );
            })}
          </g>
          <polygon points="98,548 232,532 248,660 112,678" fill="none" stroke={BLACK} strokeWidth="1" opacity="0.45" />

          {/* ── 貼り紙 2：籐編みの油布 ─────────────────────────── */}
          <g>
            <polygon points="392,556 520,572 508,690 380,668" fill="#cbbc98" opacity="0.85" />
            <polygon points="392,556 520,572 508,690 380,668" fill={`url(#${P}-cane)`} />
            <polygon points="392,556 520,572 508,690 380,668" fill="none" stroke={BLACK} strokeWidth="1" opacity="0.4" />
          </g>

          {/* ── 貼り紙 3：新聞の切れ端。細い横棒の列で組む ───────── */}
          <g transform="rotate(-6 350 636)">
            <rect x="286" y="592" width="132" height="92" fill="#e2dac4" opacity="0.95" />
            <g fill={BLACK} opacity="0.55">
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x={294} y={600 + i * 9} width={116 * r(0.6, 1)} height="2.2" />
              ))}
            </g>
            <rect x="286" y="592" width="132" height="92" fill="none" stroke={BLACK} strokeWidth="0.8" opacity="0.35" />
          </g>

          {/* ── 器物。輪郭だけで、面の下から現れる ───────────────── */}
          <g fill="none" stroke={BLACK} strokeLinecap="round">
            {/* ギターの胴。上下の膨らみを2本の弧で示す */}
            <path d="M172 396 A 78 78 0 0 1 316 358" strokeWidth="2.6" opacity="0.8" />
            <path d="M176 500 A 96 96 0 0 0 362 512" strokeWidth="2.6" opacity="0.8" />
            <path d="M186 404 C 200 452, 200 470, 182 502" strokeWidth="2.2" opacity="0.7" />
            <path d="M320 366 C 336 424, 340 466, 360 508" strokeWidth="2.2" opacity="0.7" />
            {/* 棹と品柱 */}
            <path d="M300 352 L378 236" strokeWidth="2.4" opacity="0.8" />
            <path d="M336 372 L410 258" strokeWidth="2.4" opacity="0.8" />
            {Array.from({ length: 6 }, (_, i) => {
              const t = 0.12 + i * 0.15;
              return (
                <line
                  key={i}
                  x1={300 + (378 - 300) * t}
                  y1={352 + (236 - 352) * t}
                  x2={336 + (410 - 336) * t}
                  y2={372 + (258 - 372) * t}
                  strokeWidth="1.4"
                  opacity="0.55"
                />
              );
            })}
            {/* 弦。音孔をまたいで駒まで */}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={i} x1={318 + i * 5} y1={362 + i * 3} x2={262 + i * 7} y2={548} strokeWidth="0.9" opacity="0.5" />
            ))}
          </g>

          {/* 音孔。ひとつは正面、もうひとつは斜めから。多視点の同時提示 */}
          <circle cx="252" cy="452" r="31" fill="#26282a" opacity="0.88" />
          <circle cx="252" cy="452" r="31" fill="none" stroke="#e6ddc8" strokeWidth="2" opacity="0.5" />
          <ellipse cx="368" cy="356" rx="24" ry="9" fill="#26282a" opacity="0.72" transform="rotate(22 368 356)" />

          {/* ヴァイオリンの f 孔。ブラックの署名のような形 */}
          <g stroke={BLACK} fill="none" strokeWidth="4.5" strokeLinecap="round" opacity="0.85">
            <path d="M404 452 c -9 -16, 11 -26, 4 -44" />
            <path d="M436 468 c -9 -16, 11 -26, 4 -44" />
          </g>
          <g fill={BLACK} opacity="0.85">
            <circle cx="404" cy="454" r="4.2" />
            <circle cx="408" cy="406" r="4.2" />
            <circle cx="436" cy="470" r="4.2" />
            <circle cx="440" cy="422" r="4.2" />
          </g>

          {/* グラス。真上から見た楕円と、横から見た台形を1本の辺で繋ぐ */}
          <g fill="none" stroke={BLACK} strokeWidth="2.2" opacity="0.85">
            <ellipse cx="432" cy="306" rx="46" ry="16" />
            <path d="M386 306 L400 392 L464 392 L478 306" />
            <path d="M400 392 L416 424 L448 424 L464 392" strokeWidth="1.6" opacity="0.7" />
            <ellipse cx="432" cy="306" rx="30" ry="10" strokeWidth="1.2" opacity="0.6" />
          </g>

          {/* 壜。同じ首を8度ずらして2度描く。ここも多視点 */}
          <g fill="none" stroke={BLACK} strokeWidth="2.2" opacity="0.7">
            <path d="M152 268 L152 316 C 152 336, 138 342, 138 366 L138 452" />
            <path d="M196 262 L196 312 C 196 332, 210 338, 210 362 L210 448" />
            <path d="M152 268 L196 262" />
            <g transform="rotate(8 174 360)" opacity="0.5">
              <path d="M152 268 L152 316 C 152 336, 138 342, 138 366 L138 452" />
              <path d="M196 262 L196 312 C 196 332, 210 338, 210 362 L210 448" />
            </g>
          </g>

          {/* 卓の稜。二重線で引き、静物を地面に着ける */}
          <g stroke={BLACK} fill="none" opacity="0.55">
            <line x1="86" y1="596" x2="524" y2="556" strokeWidth="2.4" />
            <line x1="86" y1="606" x2="524" y2="566" strokeWidth="0.9" />
          </g>

          {/* ステンシルの JOU。JOURNAL の切れ端。橋の穴から下の面が見える */}
          <g mask={`url(#${P}-stencil)`}>
            <text
              x="300" y="262" fill={BLACK} fontFamily={SANS} fontSize="62" fontWeight="700"
              letterSpacing="7" opacity="0.82"
            >
              JOU
            </text>
          </g>
          <text
            x="188" y="640" fill={BLACK} fontFamily={SANS} fontSize="21" fontWeight="700"
            letterSpacing="4.5" opacity="0.6" transform="rotate(-6 188 640)"
          >
            VALSE
          </text>
        </g>

        {/* 画布の下描き線。楕円の当たりだけ薄く残す */}
        <ellipse cx="296" cy="372" rx="238" ry="306" fill="none" stroke={BLACK} strokeWidth="0.9" opacity="0.16" />

        {/* だまし絵の釘。ブラックが画面に1本だけ描き込んだあれ */}
        <g>
          <ellipse cx="296" cy="88" rx="9" ry="6.5" fill="#6f6a5c" />
          <ellipse cx="294" cy="86" rx="5" ry="3.4" fill="#a29a86" />
          <path d="M303 92 L322 112" stroke={BLACK} strokeWidth="3.5" opacity="0.28" strokeLinecap="round" />
        </g>

        {/* 題字。楕円の外、素の麻布の上に置く */}
        <g fill={BLACK} fontFamily={SANS}>
          <text x="52" y="742" fontSize="14" fontWeight="700" letterSpacing="6">
            CUBISME
          </text>
          <text x="52" y="762" fontSize="8.5" fontWeight="600" letterSpacing="2.4" opacity="0.62">
            ANALYTIQUE — PARIS 1912
          </text>
          <text x="548" y="762" fontSize="8.5" fontWeight="600" letterSpacing="2.4" opacity="0.62" textAnchor="end">
            HUILE ET PAPIERS COLLES
          </text>
        </g>

        {/* 麻布の目。紙ではなく布なので繊維を強めに */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.22"
              style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.16"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
