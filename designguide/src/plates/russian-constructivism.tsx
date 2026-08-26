/**
 * ロシア構成主義。
 *
 * ロトチェンコの《キノ・グラース》（ヴェルトフ／1924）を下敷きにした。
 * 抽象図形を浮かせるシュプレマティズムとは目的が逆で、こちらは
 * **宣伝物**。読ませるための版面であって、瞑想するための面ではない。
 *
 * ■ 隣り合うシュプレマティズムと描き分けるために決めたこと
 *   1. 形を浮かせない。**紙の縁で断ち切る。** 黒のくさびは天地左右に
 *      食い込み、レンズは右の縁からはみ出す。切り落とすほど印刷物に見える。
 *   2. 斜めは1本の主対角線だけ。そこに全部を掛ける。
 *      角度を散らすと構成主義ではなく抽象画になる。
 *   3. 赤と黒と紙、3色しか使わない。灰は写真の網点のためだけ。
 *   4. 文字を巨大にして、版面の主役にする。図形は文字の台。
 *
 * ■ 近くで見る細部
 *   ・レンズの外環に絞り値の刻み（f 2.8 / 5.6 / 11）を彫ってある。
 *   ・下段はフィルムの実尺。パーフォレーションを開け、5コマに網点の
 *     絵を入れた。写真製版の切り貼りという構成主義の技法そのもの。
 */
import { ATLAS, rad } from "@/lib/plate";

const P = "rc";
const PAPER = "#efe9dc";
const RED = "#c8102e";
const INK = "#141414";
const GREY = "#8c8c8c";
const WHITE = "#f2f2f2";

/* 主対角線。黒のくさびの下辺 (0,470)→(600,180) */
const EDGE_L = 470;
const EDGE_R = 180;
const ANG = (Math.atan2(EDGE_R - EDGE_L, 600) * 180) / Math.PI; // ≈ -25.8°

/* レンズ＝眼。右の縁を割って外へ出す */
const LX = 492;
const LY = 150;
const LR = 126;

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** フィルムのひとコマ。網点の灰色に幾何だけの「撮られたもの」を置く */
function Frame({ x, y, w, h, kind }: { x: number; y: number; w: number; h: number; kind: number }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={GREY} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${ATLAS.halftoneFine})`} opacity="0.5" />
      <g fill={INK} opacity="0.9">
        {kind === 0 && <circle cx={cx} cy={cy} r={h * 0.3} />}
        {kind === 1 && (
          <polygon points={`${cx},${y + 5} ${x + w - 8},${y + h - 5} ${x + 8},${y + h - 5}`} />
        )}
        {kind === 2 &&
          [0, 1, 2].map((i) => <rect key={i} x={x + 10 + i * 26} y={y + 5} width={11} height={h - 10} />)}
        {kind === 3 && (
          <>
            <rect x={cx - 5} y={y + 5} width={10} height={h - 10} />
            <rect x={x + 12} y={cy - 5} width={w - 24} height={10} />
          </>
        )}
        {kind === 4 && (
          <>
            <circle cx={cx} cy={cy} r={h * 0.32} fill="none" stroke={INK} strokeWidth="5" />
            <circle cx={cx} cy={cy} r={h * 0.13} />
          </>
        )}
      </g>
    </g>
  );
}

export default function Plate() {
  const WEDGE = `0,0 600,0 600,${EDGE_R} 0,${EDGE_L}`;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ロシア構成主義様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-wedge`}>
          <polygon points={WEDGE} />
        </clipPath>
        {/* 巨大文字を対角線で切り替えるための2枚。
            黒の中では紙色、紙の上では黒。活版の「抜き」の再現 */}
        <clipPath id={`${P}-strip`}>
          <rect x="-80" y="686" width="760" height="86" transform="rotate(-4 300 729)" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 黒のくさび。天地と左右に食い込ませる ───────────────── */}
        <polygon points={WEDGE} fill={INK} />

        {/* レンズから伸びる光条。くさびの中だけに落とす */}
        <g clipPath={`url(#${P}-wedge)`} stroke={WHITE} strokeWidth="1.5" opacity="0.16">
          {Array.from({ length: 34 }, (_, i) => {
            const a = (360 / 34) * i + 5;
            return (
              <line
                key={i}
                x1={LX}
                y1={LY}
                x2={LX + Math.cos(rad(a)) * 620}
                y2={LY + Math.sin(rad(a)) * 620}
              />
            );
          })}
        </g>

        {/* ── 題字。上段は黒の中に紙色で抜く ──────────────────
               版ズレは「赤を先に刷って、紙色を上から重ねる」。
               初稿は逆順で赤を上から掛けたので、文字ぜんたいが桃色に沈んだ。
               先に刷れば、はみ出した縁だけに赤が残る（これが本物の見え方） */}
        <text
          x="40" y="172" fill={RED} fontFamily={SANS}
          fontSize="112" fontWeight="800" letterSpacing="4"
          transform="translate(5 -4)"
        >
          KINO
        </text>
        <text x="40" y="172" fill={PAPER} fontFamily={SANS} fontSize="112" fontWeight="800" letterSpacing="4">
          KINO
        </text>

        {/* ── レンズ＝眼。キノ・グラース（映画眼）そのもの ───────── */}
        <g>
          <circle cx={LX} cy={LY} r={LR} fill={WHITE} />
          <circle cx={LX} cy={LY} r={LR - 14} fill={INK} />
          <circle cx={LX} cy={LY} r={LR - 24} fill={RED} />
          <circle cx={LX} cy={LY} r={LR - 32} fill={INK} />
          {/* 虹彩。網点で「写真」に見せる */}
          <circle cx={LX} cy={LY} r={78} fill={GREY} />
          <circle cx={LX} cy={LY} r={78} fill={`url(#${ATLAS.halftone})`} opacity="0.55" />
          {/* 虹彩の繊維 */}
          <g stroke={INK} strokeWidth="0.9" opacity="0.55">
            {Array.from({ length: 72 }, (_, i) => {
              const a = (360 / 72) * i;
              return (
                <line
                  key={i}
                  x1={LX + Math.cos(rad(a)) * 32}
                  y1={LY + Math.sin(rad(a)) * 32}
                  x2={LX + Math.cos(rad(a)) * 78}
                  y2={LY + Math.sin(rad(a)) * 78}
                />
              );
            })}
          </g>
          <circle cx={LX} cy={LY} r={31} fill={INK} />
          <circle cx={LX - 27} cy={LY - 31} r={10} fill={WHITE} opacity="0.9" />
          {/* 鏡胴の刻み。近くで見る細部 */}
          <g stroke={INK} strokeWidth="1.4" opacity="0.8">
            {Array.from({ length: 48 }, (_, i) => {
              const a = (360 / 48) * i;
              const long = i % 4 === 0;
              return (
                <line
                  key={i}
                  x1={LX + Math.cos(rad(a)) * (LR - 14)}
                  y1={LY + Math.sin(rad(a)) * (LR - 14)}
                  x2={LX + Math.cos(rad(a)) * (LR - (long ? 3 : 7))}
                  y2={LY + Math.sin(rad(a)) * (LR - (long ? 3 : 7))}
                />
              );
            })}
          </g>
          {/* 絞り値。白い環の上に、環に沿わせて彫る。
              初稿は黒地の上に黒で置いたので、まるごと消えていた */}
          <g fill={INK} fontFamily={SANS} fontSize="7.2" fontWeight="700">
            {[
              { a: 148, t: "2.8" },
              { a: 172, t: "5.6" },
              { a: 196, t: "8" },
              { a: 220, t: "11" },
            ].map(({ a, t }) => {
              const px = LX + Math.cos(rad(a)) * (LR - 7);
              const py = LY + Math.sin(rad(a)) * (LR - 7);
              return (
                <text
                  key={t}
                  x={px}
                  y={py}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${(a + 90).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})`}
                >
                  {t}
                </text>
              );
            })}
          </g>
        </g>

        {/* ── 赤の罫。対角線に沿わせて1本だけ。赤は面ではなく線で効かせる ── */}
        <rect
          x="-60"
          y="345"
          width="740"
          height="21"
          fill={RED}
          transform={`rotate(${ANG.toFixed(2)} 315 355)`}
        />

        {/* ── 下段の題字。紙の上なので黒。上下で刷り方が反転する ── */}
        <text x="40" y="640" fill={INK} fontFamily={SANS} fontSize="112" fontWeight="800" letterSpacing="4">
          GLAZ
        </text>

        {/* 年号の赤い小口。GLAZ の右の空きを締める */}
        <g>
          <rect x="498" y="578" width="62" height="62" fill={RED} />
          <text
            x="529"
            y="622"
            fill={WHITE}
            fontFamily={SANS}
            fontSize="30"
            fontWeight="800"
            textAnchor="middle"
          >
            24
          </text>
        </g>

        {/* 版面の注記。対角線の下、右半分にだけ置く */}
        <g fill={INK} fontFamily={SANS} fontSize="10" fontWeight="700" letterSpacing="2.4">
          <text x="330" y="424">DZIGA VERTOV</text>
          <text x="330" y="444" opacity="0.72">SOVKINO — MOSKVA</text>
          <text x="330" y="464" opacity="0.72">6 SERII / 1924</text>
          <text x="330" y="492" fill={RED}>MONTAZH: A. RODCHENKO</text>
        </g>
        {/* 左の余白を縦に使う。長い行は赤い罫とフィルムに食われて切れたので、
            罫と帯のあいだに収まる長さまで詰めた */}
        <text
          transform="translate(27 668) rotate(-90)"
          fill={INK}
          fontFamily={SANS}
          fontSize="9"
          fontWeight="700"
          letterSpacing="3.2"
          opacity="0.62"
        >
          KINO-PRAVDA
        </text>

        {/* ── フィルムの実尺。写真製版の切り貼りという技法そのもの ── */}
        <g clipPath={`url(#${P}-strip)`}>
          <g transform="rotate(-4 300 729)">
            <rect x="-80" y="686" width="760" height="86" fill={INK} />
            {/* パーフォレーション */}
            {Array.from({ length: 27 }, (_, i) => (
              <g key={i} fill={PAPER}>
                <rect x={-70 + i * 29} y="691" width="14" height="10" rx="2" />
                <rect x={-70 + i * 29} y="757" width="14" height="10" rx="2" />
              </g>
            ))}
            {/* コマ */}
            {Array.from({ length: 6 }, (_, i) => (
              <Frame key={i} x={-60 + i * 132} y={708} w={118} h={42} kind={i % 5} />
            ))}
          </g>
        </g>

        {/* ざら紙。宣伝ビラは上質紙には刷らない */}
        <rect
          width="600"
          height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.2"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
