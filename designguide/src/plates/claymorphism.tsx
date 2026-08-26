/**
 * クレイモーフィズム。
 *
 * 2020年代。粘土でこねた玩具のような立体。極端に大きな角丸、
 * パステルの色面、内側に入る柔らかい影、そして自分の色の落ち影。
 *
 * ■ 隣のニューモーフィズムと絶対に間違えないための3点
 *   1. 色がある。しかも1つの物に1色。地と同じ色の物は1つも無い。
 *      ニューモーフィズムは地と同色で、色を足した瞬間に別の様式になる。
 *   2. 物が地から離れて浮いている。落ち影が物の色の暗い版で、
 *      物より下にはっきり出る。地に貼りついていない。
 *   3. 内側の影が上下に2枚入る。上に白、下に暗い色。これで面が
 *      風船のように膨らんで見える。ニューモーフィズムの内側の影は
 *      左上と右下（光の向き）だが、こちらは上下（膨らみ）で入る。
 *
 * ■ 文字も粘土で作る
 *   丸ゴシックの欧文フォントは外部から読めないので、CLAY の4文字を
 *   線の端を丸めた太いストロークで作字した。書体を指定して済ませると、
 *   文字だけ粘土でなくなって版面が割れる（初稿でそうなった）。
 *
 * ■ 検分で直したこと
 *   塊用の内側の光（下へ16ずらして10ぼかす）を、そのまま文字にも掛けていた。
 *   塊は一辺が146あるので問題ないが、文字の線は太さ40しかないので、
 *   白い光が線幅のほとんどを食って、L と A が上半分から消えていた。
 *   縮小すると「CLAY」が「C _ _ Y」に読めてしまう。
 *   細い物には細い物用の光がいる。文字専用に、
 *   ずらし9・ぼかし6・白70% の弱い版（-t*）を用意して掛け分けた。
 */
import { ATLAS, shift } from "@/lib/plate";

const P = "clay";
const BG = "#eef0ff";
const INDIGO = "#a5b4fc";
const PINK = "#fbcfe8";
const YELLOW = "#fde68a";
const INK = "#4c4a68";
const LILAC = shift(INDIGO, 0.18); // 5色から作った4つめのパステル。
// 0.36 まで白へ寄せると Y の一文字だけ地に溶けたので、明度を戻した

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** 粘土の色と、その色の暗い版（影に使う） */
const CLAY = [
  { id: "y", c: YELLOW, s: shift(YELLOW, -0.36) },
  { id: "p", c: PINK, s: shift(PINK, -0.34) },
  { id: "i", c: INDIGO, s: shift(INDIGO, -0.38) },
  { id: "l", c: LILAC, s: shift(LILAC, -0.4) },
] as const;

/** CLAY の4文字。太いストロークの端を丸めて粘土の紐にする */
const LETTERS = [
  ["M72.6 35.5 A36 36 0 1 0 72.6 94.5"],
  ["M30 16 V114 H84"],
  ["M18 114 L50 20 L82 114", "M31 80 H69"],
  ["M20 18 L50 62 L80 18", "M50 62 V114"],
];

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="クレイモーフィズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <filter id={`${P}-glow`} filterUnits="userSpaceOnUse" x="-300" y="-300" width="1200" height="1400">
          <feGaussianBlur stdDeviation="70" />
        </filter>

        {/* 粘土の光。落ち影＋上の内側の光＋下の内側の影。
            内側の影は「輪郭からはみ出した分を捨てる」ことで作る。
            外に置くと物が2枚に見える（初稿の失敗） */}
        {CLAY.map(({ id, s }) => (
          <filter key={id} id={`${P}-f${id}`} x="-70%" y="-70%" width="240%" height="260%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="ds" />
            <feOffset in="ds" dy="22" result="dso" />
            <feFlood floodColor={s} floodOpacity="0.62" result="dsc" />
            <feComposite in="dsc" in2="dso" operator="in" result="drop" />

            <feOffset in="SourceAlpha" dy="16" result="l1" />
            <feGaussianBlur in="l1" stdDeviation="10" result="l2" />
            <feComposite in="SourceAlpha" in2="l2" operator="out" result="lsh" />
            <feFlood floodColor="#ffffff" floodOpacity="0.85" result="lc" />
            <feComposite in="lc" in2="lsh" operator="in" result="lite" />

            <feOffset in="SourceAlpha" dy="-18" result="d1" />
            <feGaussianBlur in="d1" stdDeviation="11" result="d2" />
            <feComposite in="SourceAlpha" in2="d2" operator="out" result="dsh" />
            <feFlood floodColor={s} floodOpacity="0.62" result="dc" />
            <feComposite in="dc" in2="dsh" operator="in" result="dark" />

            <feMerge>
              <feMergeNode in="drop" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="lite" />
              <feMergeNode in="dark" />
            </feMerge>
          </filter>
        ))}

        {/* 文字用。線が細いので、内側の光と影を塊用より小さく取る。
            ここを塊と同じ値にすると、線幅を光が食い切って字が消える */}
        {CLAY.map(({ id, s }) => (
          <filter key={`t${id}`} id={`${P}-t${id}`} x="-70%" y="-70%" width="240%" height="260%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="ds" />
            <feOffset in="ds" dy="17" result="dso" />
            <feFlood floodColor={s} floodOpacity="0.6" result="dsc" />
            <feComposite in="dsc" in2="dso" operator="in" result="drop" />

            <feOffset in="SourceAlpha" dy="9" result="l1" />
            <feGaussianBlur in="l1" stdDeviation="6" result="l2" />
            <feComposite in="SourceAlpha" in2="l2" operator="out" result="lsh" />
            <feFlood floodColor="#ffffff" floodOpacity="0.7" result="lc" />
            <feComposite in="lc" in2="lsh" operator="in" result="lite" />

            <feOffset in="SourceAlpha" dy="-10" result="d1" />
            <feGaussianBlur in="d1" stdDeviation="6.5" result="d2" />
            <feComposite in="SourceAlpha" in2="d2" operator="out" result="dsh" />
            <feFlood floodColor={s} floodOpacity="0.58" result="dc" />
            <feComposite in="dc" in2="dsh" operator="in" result="dark" />

            <feMerge>
              <feMergeNode in="drop" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="lite" />
              <feMergeNode in="dark" />
            </feMerge>
          </filter>
        ))}
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={BG} />
        {/* 地にもうっすら色を回す。真っ白の地だと粘土が紙の切り抜きに見える */}
        <g filter={`url(#${P}-glow)`} opacity="0.34">
          <circle cx="30" cy="300" r="210" fill={INDIGO} />
          <circle cx="570" cy="390" r="190" fill={PINK} />
          <circle cx="300" cy="812" r="150" fill={YELLOW} opacity="0.5" />
        </g>

        <text x="48" y="70" fill={INK} opacity="0.7" fontFamily={SANS} fontSize="9.5" fontWeight="800" letterSpacing="4.4">
          CLAYMORPHISM — 2020s
        </text>

        {/* 右上の輪。天の角で切って、器物が版面の外へ続くようにする */}
        <g filter={`url(#${P}-fp)`}>
          <circle cx="522" cy="86" r="76" fill="none" stroke={PINK} strokeWidth="46" />
        </g>

        {/* ── 主役。粘土の紐で作った4文字 ─────────────────────── */}
        {LETTERS.map((paths, i) => {
          const clay = CLAY[i % CLAY.length];
          return (
            <g key={i} transform={`translate(${64 + i * 124} 196)`} filter={`url(#${P}-t${clay.id})`}>
              {paths.map((d, j) => (
                <path key={j} d={d} fill="none" stroke={clay.c} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>
          );
        })}

        <text x="66" y="384" fill={INK} opacity="0.66" fontFamily={SANS} fontSize="10" fontWeight="800" letterSpacing="6.2">
          SOFT · ROUNDED · INFLATED
        </text>

        {/* ── 粘土の塊。角丸は短辺の4割まで振り切る ───────────── */}
        <g filter={`url(#${P}-fy)`}>
          <rect x="58" y="424" width="146" height="146" rx="58" fill={YELLOW} transform="rotate(-8 131 497)" />
        </g>
        <g filter={`url(#${P}-fi)`}>
          <circle cx="262" cy="516" r="54" fill={INDIGO} />
        </g>
        <g filter={`url(#${P}-fl)`}>
          <rect x="338" y="466" width="204" height="84" rx="42" fill={LILAC} transform="rotate(6 440 508)" />
        </g>

        {/* ── 下段。粘土1つの断面図 ──────────────────────────── */}
        <line x1="48" y1="604" x2="552" y2="604" stroke={INK} strokeWidth="1" opacity="0.18" />

        <g filter={`url(#${P}-fp)`}>
          <rect x="60" y="634" width="96" height="96" rx="38" fill={PINK} />
        </g>
        {/* 番号の点。3つの層がどこにあるかを指す */}
        {([
          [108, 646, "1"],
          [108, 718, "2"],
          [108, 758, "3"],
        ] as const).map(([x, y, n]) => (
          <g key={n}>
            <circle cx={x} cy={y} r="8.5" fill={INK} opacity="0.86" />
            <text x={x} y={y + 3.2} textAnchor="middle" fill={BG} fontFamily={SANS} fontSize="9" fontWeight="800">{n}</text>
          </g>
        ))}
        <g fill={INK} fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="1.4">
          <text x="180" y="652" opacity="0.78">1 — INNER LIGHT, TOP</text>
          <text x="180" y="676" opacity="0.78">2 — INNER SHADOW, BOTTOM</text>
          <text x="180" y="700" opacity="0.78">3 — DROP SHADOW, ITS OWN HUE</text>
          <text x="180" y="730" opacity="0.42">RADIUS = 40% OF THE SHORT SIDE</text>
          <text x="180" y="752" opacity="0.42">NEVER GREY. NEVER FLAT.</text>
        </g>

        {/* 刷り色。粘土の色と、その影の色を対にして並べる */}
        <g transform="translate(420 634)">
          {CLAY.map(({ id, c, s }, i) => (
            <g key={id} transform={`translate(0 ${i * 26})`}>
              <rect x="0" y="0" width="26" height="18" rx="7" fill={c} />
              <rect x="32" y="0" width="26" height="18" rx="7" fill={s} />
              <text x="66" y="13" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1">
                {c.toUpperCase()}
              </text>
            </g>
          ))}
          <text x="0" y="118" fill={INK} opacity="0.42" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.2">
            CLAY / ITS SHADOW
          </text>
        </g>

        {/* 粒。粘土は艶消しなので、わずかに粉っぽくする */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.13"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
