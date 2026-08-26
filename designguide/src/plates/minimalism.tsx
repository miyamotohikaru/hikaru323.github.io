/**
 * ミニマリズム。
 *
 * 要素は4つしかない。細い罫2本、手で引いた格子の面が1枚、黒い小口が1つ。
 * 残りは全部余白で、余白のほうが主役。
 *
 * ■ 「少ない」を「手を抜いた」に見せないために決めたこと
 *   1. **寸法に理由を持たせる。** 格子の面は 336×448。これは版面 600×800 の
 *      ちょうど 56%、つまり紙と同じ 3:4 の相似形。左96・右168・天140・地212 と
 *      四辺の余白を全部違えてあるので、面は「真ん中に置いた四角」にならない。
 *   2. **罫を紙の端まで通す。** 面の右辺と下辺を、そのまま天地左右へ伸ばす。
 *      これで面と紙が同じ構造で結ばれる。切れた線は宙に浮く。
 *   3. **近くで見る細部を1つだけ持たせる。** 遠目には薄い灰色の面、
 *      近寄ると手引きの横線。5本ずつ詰め、間を一段あける律動。
 *      1本ずつ濃さと端の位置が違う。
 *      アグネス・マーティンの格子はこう見える。ここが無いと
 *      「灰色の四角」で終わり、図版として持たない。
 *   4. **赤は 56 の長さの罫が1本だけ。** 面でも点でもなく、長さだけを持つ。
 *   5. 最大の黒は 17×17 の正方形ひとつ。
 *
 * ■ 80枚に並べたときに「描き忘れ」に見えないように
 *   初稿は薄すぎて、縮小一覧のなかで白紙に見えた。面の濃さ・罫の太さ・
 *   黒い小口の大きさを、それぞれ一段だけ上げてある。静かさは保つが、
 *   小さくしても「面と2本の罫と黒い角」という形は必ず読める強さにした。
 *
 * ■ スイス・スタイルと混ざらないように
 *   あちらは太い黒と密な文字組で紙を押さえる。こちらは太い線を一本も使わない。
 *   書体も 9.5px 以上に上げない。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "min";
const PAPER = "#f4f3f0";
const INK = "#111111";
const GREY = "#8c8c8c";
const SOFT = "#d8d5cd";
const RED = "#e2231a";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 格子の面。紙と相似（3:4）で 56% */
const FX = 96;
const FY = 140;
const FW = 336;
const FH = 448;
const FR = FX + FW; // 432
const FB = FY + FH; // 588

/**
 * 横線の間隔。等間隔で引いたら方眼紙にしか見えなかった（初稿）。
 * 5本を詰めて引き、そのあと一段あける、という律動にすると
 * とたんにアグネス・マーティンの帯になる。
 * 周期は 5+5+5+5+14 = 34。448 のなかに 13 周期ちょうど入る。
 */
const GAPS = [5, 5, 5, 5, 14];
const COLS = 7; // 縦は48間隔。ほとんど見えない濃さで、面を締めるためだけ

/** 帯の律動から横線の y を作る */
function bandRows() {
  const ys: number[] = [];
  let y = 0;
  let i = 0;
  while (y <= FH + 0.01) {
    ys.push(y);
    y += GAPS[i % GAPS.length];
    i++;
  }
  return ys;
}

export default function Plate() {
  const r = rand(1966);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ミニマリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 面の下地。ごく薄い一枚。これが無いと格子が宙に浮く */}
        <rect x={FX} y={FY} width={FW} height={FH} fill={SOFT} opacity="0.78" />

        {/* ── 手で引いた格子。1本ずつ濃さと端が違う ─────────────
               定規を当てても、鉛筆の線は濃さが揺れ、端は必ずはみ出すか届かない。
               ここを均一に引くと、印刷された方眼紙になってしまう */}
        <g stroke={GREY}>
          {bandRows().map((dy, i) => {
            const y = FY + dy;
            return (
              <line
                key={`h${i}`}
                x1={FX + r(-3.5, 2)}
                y1={y}
                x2={FR + r(-2, 3.5)}
                y2={y + r(-0.35, 0.35)}
                strokeWidth={r(0.32, 0.62).toFixed(2)}
                opacity={r(0.34, 0.78).toFixed(2)}
              />
            );
          })}
          {Array.from({ length: COLS + 1 }, (_, i) => {
            const x = FX + i * (FW / COLS);
            return (
              <line
                key={`v${i}`}
                x1={x + r(-0.35, 0.35)}
                y1={FY + r(-3.5, 2)}
                x2={x + r(-0.35, 0.35)}
                y2={FB + r(-2, 3.5)}
                strokeWidth={r(0.3, 0.5).toFixed(2)}
                opacity={r(0.06, 0.14).toFixed(2)}
              />
            );
          })}
        </g>

        {/* ── 面の右辺と下辺を紙の端まで伸ばした2本 ───────────── */}
        <line x1={FR} y1="0" x2={FR} y2="800" stroke={INK} strokeWidth="0.9" opacity="0.95" />
        <line x1="0" y1={FB} x2="600" y2={FB} stroke={INK} strokeWidth="0.9" opacity="0.95" />

        {/* 2本の交点に接する黒。版面でいちばん濃いのはこの 14mm 角だけ */}
        <rect x={FR} y={FB} width="17" height="17" fill={INK} />

        {/* 面の幅の寸法。ごく薄く。図版が自分の寸法を持っている */}
        <g stroke={INK} opacity="0.38" strokeWidth="0.5">
          <line x1={FX} y1="616" x2={FR} y2="616" />
          <line x1={FX} y1="611" x2={FX} y2="621" />
          <line x1={FR} y1="611" x2={FR} y2="621" />
        </g>
        <text
          x={(FX + FR) / 2} y="609" fill={INK} fontFamily={SANS} fontSize="6.5" fontWeight="600"
          letterSpacing="1.4" textAnchor="middle" opacity="0.5"
        >
          336
        </text>

        {/* ── 文字。9.5px より上げない ────────────────────────── */}
        <text x={FX} y="710" fill={INK} fontFamily={SANS} fontSize="9.5" fontWeight="500" letterSpacing="7.5">
          MINIMALISM
        </text>
        {/* 赤は長さ 56 の罫が1本だけ */}
        <rect x={FX} y="722" width="56" height="2" fill={RED} />
        <g fill={GREY} fontFamily={SANS} fontSize="7" fontWeight="500" letterSpacing="2.4">
          <text x={FX} y="744">THIRTEEN BANDS OF FIVE, DRAWN BY HAND</text>
          <text x={FX} y="757">336 × 448 ON 600 × 800 — 3 : 4</text>
        </g>

        {/* 紙の目。ごく薄く。無いと画面が平らに見える */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.1"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
