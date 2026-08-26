/**
 * Webブルータリズム。
 *
 * 素の HTML。スタイルシートを当てない、という選択そのものが様式になった。
 * Times、既定の 16px、青い下線のリンク、border="1" の表、body の margin 8px。
 * どれも「誰かが決めた」ものではなく「誰も決めなかった」結果の見た目。
 *
 * ■ この1枚だけ文字組みで持たせる
 *   同じ「画面のための様式」10枚のうち、9枚は光と影と色でできている。
 *   ここだけは装飾が1つも無い。だから群として並べたときに、
 *   この版が白くて字だらけであること自体が対比になる。
 *   質感は紙の目ではなく、罫線・表の格子・等幅の塊で作った。
 *
 * ■ 細部はブラウザの既定値をそのまま写している
 *   ・リンクは #0000EE、下線つき。訪問済みだけ色が変わる
 *   ・<hr> は 1px の罫
 *   ・<pre> は Courier、地は #eeeeee
 *   ・既定のボタンは 2px の outset（左上が明るく右下が暗い）
 *   ・読めなかった画像は、枠と alt 文字だけが残る
 *   最後の1つは、この様式でいちばんよく見る絵なので必ず入れたかった。
 */
import { ATLAS, shift } from "@/lib/plate";

const P = "wbru";
const WHITE = "#ffffff";
const BLUE = "#0000ee";
const BLACK = "#000000";
const RED = "#ff0000";
const GREY = "#eeeeee";
const MIDGREY = shift(BLACK, 0.45); // 既定ボタンの暗い辺
/** 2色を混ぜる。訪問済みリンクの紫を、青と赤だけから作るために要る */
function mix(a: string, b: string, t: number) {
  const p1 = parseInt(a.slice(1), 16);
  const p2 = parseInt(b.slice(1), 16);
  const ch = [16, 8, 0].map((sft) => {
    const c1 = (p1 >> sft) & 255;
    const c2 = (p2 >> sft) & 255;
    return Math.round(c1 + (c2 - c1) * t);
  });
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
const VISITED = mix(BLUE, RED, 0.34); // 既定の #551A8B にほぼ重なる

const TIMES = "'Times New Roman', Times, serif";
const MONO = "'Courier New', ui-monospace, monospace";

/** 表。既定の border="1" は、外枠と各セルに1本ずつ罫が入る */
const TABLE = [
  ["ELEMENT", "BROWSER DEFAULT", "CHANGED?"],
  ["h1", "2em, bold, Times", "no"],
  ["a:link", "#0000EE, underline", "no"],
  ["table", "border 1px, inset", "no"],
  ["body", "margin 8px", "no"],
];
const COLS = [150, 196, 108];
const TX = 16;
const TY = 306;
const RH = 24;

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Webブルータリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={WHITE} />

        {/* ── h1。既定より遥かに大きく組む。版面の端まで詰める ──── */}
        <text x="14" y="86" fill={BLACK} fontFamily={TIMES} fontSize="80" fontWeight="700">
          WEB
        </text>
        <text x="14" y="160" fill={BLACK} fontFamily={TIMES} fontSize="80" fontWeight="700">
          BRUTALISM
        </text>
        <line x1="14" y1="180" x2="586" y2="180" stroke={BLACK} strokeWidth="1" />

        {/* ── 本文。リンクは既定の青と下線のまま ────────────────── */}
        <g fill={BLACK} fontFamily={TIMES} fontSize="15">
          <text x="14" y="206">
            There is no stylesheet. The page is what the browser
          </text>
          <text x="14" y="226">
            does when nobody tells it what to do. Every rule you
          </text>
          <text x="14" y="246">
            can see here —{" "}
            <tspan fill={BLUE} textDecoration="underline">the margin</tspan>, the serif,{" "}
            <tspan fill={BLUE} textDecoration="underline">the blue</tspan>
          </text>
          <text x="14" y="266">
            — was written in 1994 and never touched again.
          </text>
        </g>

        {/* 読み込めなかった画像。枠と alt だけが残る */}
        <g>
          <rect x="482" y="192" width="104" height="76" fill="none" stroke={BLACK} strokeWidth="1" />
          {/* 破れた頁の記号 */}
          <path d="M498 210 h20 l8 8 v26 h-28 Z" fill="none" stroke={BLACK} strokeWidth="1" />
          <path d="M518 210 v8 h8" fill="none" stroke={BLACK} strokeWidth="1" />
          <path d="M498 232 l7 -7 l6 6 l8 -9 l7 8 v14 h-28 Z" fill={BLACK} opacity="0.18" />
          <line x1="494" y1="248" x2="530" y2="206" stroke={RED} strokeWidth="1.4" />
          <text x="534" y="228" fill={BLACK} fontFamily={TIMES} fontSize="11">alt=</text>
          <text x="534" y="242" fill={BLACK} fontFamily={TIMES} fontSize="11">&quot;photo&quot;</text>
          <text x="482" y="282" fill={BLACK} opacity="0.6" fontFamily={MONO} fontSize="9">404 · img</text>
        </g>

        {/* ── h2 と表 ──────────────────────────────────────── */}
        <text x="14" y="296" fill={BLACK} fontFamily={TIMES} fontSize="20" fontWeight="700">
          What was left alone
        </text>
        <g>
          {/* 外枠と行の罫 */}
          {Array.from({ length: TABLE.length + 1 }, (_, i) => (
            <line key={`h${i}`} x1={TX} y1={TY + i * RH} x2={TX + COLS[0] + COLS[1] + COLS[2]} y2={TY + i * RH} stroke={BLACK} strokeWidth="1" />
          ))}
          {[0, COLS[0], COLS[0] + COLS[1], COLS[0] + COLS[1] + COLS[2]].map((dx, i) => (
            <line key={`v${i}`} x1={TX + dx} y1={TY} x2={TX + dx} y2={TY + TABLE.length * RH} stroke={BLACK} strokeWidth="1" />
          ))}
          {TABLE.map((row, r) =>
            row.map((cell, c) => {
              const dx = COLS.slice(0, c).reduce((a, b) => a + b, 0);
              const head = r === 0;
              return (
                <text
                  key={`${r}-${c}`}
                  x={TX + dx + 8}
                  y={TY + r * RH + 16}
                  fill={BLACK}
                  fontFamily={head ? TIMES : c === 0 ? MONO : TIMES}
                  fontSize={head ? 12 : 12.5}
                  fontWeight={head ? 700 : 400}
                >
                  {cell}
                </text>
              );
            }),
          )}
        </g>

        {/* ── 箇条書き。既定の中黒と字下げ ───────────────────── */}
        <g fill={BLACK} fontFamily={TIMES} fontSize="14">
          {[
            "No grid. The text is as wide as the window.",
            "No hierarchy but size. h1 is big because h1 is big.",
            "No images that load. No fonts that download.",
          ].map((t, i) => (
            <g key={i}>
              <circle cx="24" cy={452 + i * 20 - 4.5} r="2.6" fill={BLACK} />
              <text x="38" y={452 + i * 20}>{t}</text>
            </g>
          ))}
        </g>

        {/* ── pre。地は #eeeeee、字は Courier ─────────────────── */}
        <rect x="14" y="524" width="440" height="86" fill={GREY} stroke={BLACK} strokeWidth="1" />
        <g fill={BLACK} fontFamily={MONO} fontSize="10.5">
          <text x="24" y="542">&lt;!DOCTYPE html&gt;</text>
          <text x="24" y="558">&lt;html&gt;&lt;head&gt;&lt;title&gt;index&lt;/title&gt;&lt;/head&gt;</text>
          <text x="24" y="574">&lt;body&gt;</text>
          <text x="24" y="590">  &lt;!-- no stylesheet. that is the design. --&gt;</text>
          <text x="24" y="606">&lt;/body&gt;&lt;/html&gt;</text>
        </g>

        {/* 既定のボタン。2px outset。左上が明るく右下が暗い */}
        <g>
          <rect x="470" y="524" width="116" height="30" fill={shift(GREY, -0.07)} />
          <g strokeWidth="2" fill="none">
            <path d="M470 554 V524 H586" stroke={WHITE} />
            <path d="M470 554 H586 V524" stroke={MIDGREY} />
          </g>
          <rect x="470" y="524" width="116" height="30" fill="none" stroke={BLACK} strokeWidth="0.8" opacity="0.5" />
          <text x="528" y="544" textAnchor="middle" fill={BLACK} fontFamily={TIMES} fontSize="13">
            Submit Query
          </text>
          <text x="470" y="574" fill={BLACK} opacity="0.6" fontFamily={MONO} fontSize="9">
            &lt;input type=submit&gt;
          </text>
          <text x="470" y="590" fill={BLACK} opacity="0.6" fontFamily={MONO} fontSize="9">
            no css applied
          </text>
        </g>

        {/* ── 赤い注意書き。装飾を1つも足さないので、色で叫ぶ ──── */}
        <text x="14" y="640" fill={RED} fontFamily={TIMES} fontSize="16" fontWeight="700">
          THIS SITE IS BEST VIEWED IN ANY BROWSER.
        </text>

        <line x1="14" y1="658" x2="586" y2="658" stroke={BLACK} strokeWidth="1" />

        {/* ── 脚注。リンクの3つの状態を既定の色のまま並べる ────── */}
        <g fontFamily={TIMES} fontSize="13">
          <text x="14" y="680" fill={BLUE} textDecoration="underline">unvisited link</text>
          <text x="126" y="680" fill={VISITED} textDecoration="underline">visited link</text>
          <text x="228" y="680" fill={RED} textDecoration="underline">active link</text>
          <text x="330" y="680" fill={BLACK} opacity="0.7">a:link / a:visited / a:active</text>
        </g>

        <g fill={BLACK} fontFamily={TIMES} fontSize="12.5">
          <text x="14" y="706">Last modified: Tuesday, 04-Mar-2014 11:02:41 GMT</text>
          <text x="14" y="724">Maintained by hand. No build step. 4 KB.</text>
        </g>

        {/* 訪問者カウンタ。等幅の桁を1つずつ枠で囲う */}
        <g>
          <text x="14" y="756" fill={BLACK} fontFamily={TIMES} fontSize="12.5">You are visitor number</text>
          {"0000731".split("").map((d, i) => (
            <g key={i}>
              <rect x={158 + i * 15} y="744" width="14" height="16" fill={BLACK} />
              <text x={165 + i * 15} y="756" textAnchor="middle" fill={GREY} fontFamily={MONO} fontSize="11">{d}</text>
            </g>
          ))}
          <text x="272" y="756" fill={BLACK} fontFamily={TIMES} fontSize="12.5">since 1997.</text>
        </g>
        <text x="586" y="756" textAnchor="end" fill={BLACK} opacity="0.55" fontFamily={MONO} fontSize="9">
          600 × 800 · 0 STYLESHEETS
        </text>

        {/* 紙の目。装飾ゼロの版なので、ほとんど見えない量にする */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.07"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
