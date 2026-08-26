/**
 * グラスモーフィズム。
 *
 * 2020–。すりガラスの板。板の向こうが「ぼけて透ける」ことだけが本体で、
 * 白い半透明の板を置いただけでは成立しない。
 *
 * ■ ここで作っている「らしさ」
 *   1. 背景を2回描いていること。1回目はそのまま、2回目は同じものを
 *      ぼかして板の形に切り抜いて重ねる。だから細い格子や輪郭線が、
 *      板の外では鋭く、板の内側では溶ける。この境目が唯一の証拠で、
 *      初稿では白い半透明の矩形を置いただけで、ただの曇りガラス風の
 *      四角にしかならなかった。
 *   2. 背景が彩り豊かであること。暗い地に青と紫の光の玉を置いてある。
 *      背景が単色だと、ぼかしても何も起きず、透明であることが分からない。
 *   3. 縁が細く明るいこと。上辺と左辺が明るく、下辺と右辺は暗い。
 *      ガラスの厚みの縁に光が回り込んだ、という嘘をここで作っている。
 *   4. 板が2枚あること。重なった所は2回ぼける。ガラスの上にガラスを
 *      置くと何が起きるかを、右下の小さい板で見せている。
 *
 * ■ 背景を <defs> の <g> に1回だけ書いて <use> で2度出しているのは、
 *   鋭い版とぼけた版が「同じ絵」でないと、透けているように見えないため。
 */
import { ATLAS } from "@/lib/plate";

const P = "gm";
const DEEP = "#0a0f24";
const NAVY = "#16214a";
const BLUE = "#7aa2ff";
const PURPLE = "#b98cff";
const WHITE = "#ffffff";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', ui-monospace, monospace";

/* 板A。ここでは回転前の座標で持つ */
const A = { x: 68, y: 244, w: 464, h: 306, rx: 30, rot: -8, cx: 300, cy: 397 };
/* 板B。Aの右下に重ねて、2回ぼけるところを見せる */
const B = { x: 336, y: 468, w: 208, h: 152, rx: 24, rot: 7, cx: 440, cy: 544 };

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="グラスモーフィズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-pa`}><rect x={A.x} y={A.y} width={A.w} height={A.h} rx={A.rx} /></clipPath>
        <clipPath id={`${P}-pb`}><rect x={B.x} y={B.y} width={B.w} height={B.h} rx={B.rx} /></clipPath>

        {/* ぼかし。領域を版面より外まで取らないと、縁が黒く落ちる */}
        <filter id={`${P}-b22`} filterUnits="userSpaceOnUse" x="-120" y="-120" width="840" height="1040">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id={`${P}-b40`} filterUnits="userSpaceOnUse" x="-120" y="-120" width="840" height="1040">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={`${P}-orb`} filterUnits="userSpaceOnUse" x="-260" y="-260" width="1120" height="1320">
          <feGaussianBlur stdDeviation="58" />
        </filter>
        {/* 下段の見本用。領域を狭く取って軽くする */}
        {[6, 16, 32].map((v) => (
          <filter key={v} id={`${P}-s${v}`} filterUnits="userSpaceOnUse" x="-70" y="-70" width="252" height="204">
            <feGaussianBlur stdDeviation={v / 2} />
          </filter>
        ))}

        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={DEEP} />
          <stop offset="0.55" stopColor={NAVY} />
          <stop offset="1" stopColor={DEEP} />
        </linearGradient>
        {/* 縁。左上が明るく、右下で消える */}
        <linearGradient id={`${P}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={WHITE} stopOpacity="0.72" />
          <stop offset="0.45" stopColor={WHITE} stopOpacity="0.24" />
          <stop offset="1" stopColor={WHITE} stopOpacity="0.06" />
        </linearGradient>
        {/* 板の地。左上ほど白が乗る */}
        <linearGradient id={`${P}-tint`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={WHITE} stopOpacity="0.17" />
          <stop offset="1" stopColor={WHITE} stopOpacity="0.05" />
        </linearGradient>
        {/* 斜めの照り */}
        <linearGradient id={`${P}-sheen`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor={WHITE} stopOpacity="0" />
          <stop offset="0.42" stopColor={WHITE} stopOpacity="0.2" />
          <stop offset="0.5" stopColor={WHITE} stopOpacity="0.02" />
          <stop offset="1" stopColor={WHITE} stopOpacity="0" />
        </linearGradient>

        {/* ── 背景。これを鋭いまま1回、ぼかして2回使う ─────────── */}
        <g id={`${P}-scene`}>
          <rect x="-120" y="-120" width="840" height="1040" fill={`url(#${P}-sky)`} />
          <g filter={`url(#${P}-orb)`}>
            <circle cx="128" cy="164" r="176" fill={BLUE} opacity="0.62" />
            <circle cx="486" cy="268" r="146" fill={PURPLE} opacity="0.58" />
            <circle cx="316" cy="672" r="196" fill={BLUE} opacity="0.34" />
            <circle cx="60" cy="640" r="120" fill={PURPLE} opacity="0.4" />
          </g>
          {/* 細い格子。板の内と外で、これが溶けるかどうかを見る */}
          <g stroke={BLUE} strokeWidth="0.8" opacity="0.16">
            {Array.from({ length: 23 }, (_, i) => (
              <line key={`v${i}`} x1={i * 34 - 60} y1="-120" x2={i * 34 - 60} y2="920" />
            ))}
            {Array.from({ length: 30 }, (_, i) => (
              <line key={`h${i}`} x1="-120" y1={i * 34 - 60} x2="720" y2={i * 34 - 60} />
            ))}
          </g>
          {/* 板の縁をまたぐ鋭い形。境目で切り替わるところが読みどころ */}
          <circle cx="434" cy="196" r="92" fill="none" stroke={WHITE} strokeWidth="1.4" opacity="0.5" />
          <circle cx="434" cy="196" r="62" fill="none" stroke={PURPLE} strokeWidth="2.4" opacity="0.6" />
          <line x1="-40" y1="622" x2="640" y2="118" stroke={WHITE} strokeWidth="1.6" opacity="0.42" />
          <g fill={WHITE}>
            {Array.from({ length: 26 }, (_, i) => (
              <circle key={i} cx={40 + i * 21} cy={588 - i * 15.4} r={i % 4 === 0 ? 2.4 : 1.3} opacity={0.3 + (i % 4 === 0 ? 0.4 : 0)} />
            ))}
          </g>
          <g fill="none" stroke={BLUE} strokeWidth="1.2" opacity="0.55">
            {[26, 44, 62, 80].map((rr) => <circle key={rr} cx="96" cy="470" r={rr} />)}
          </g>
        </g>

        {/* 下段の見本の中身。彩度と細部の両方を入れないと、ぼかしの差が出ない */}
        <g id={`${P}-tile`}>
          <rect x="-70" y="-70" width="252" height="204" fill={NAVY} />
          <circle cx="26" cy="20" r="26" fill={BLUE} />
          <circle cx="84" cy="46" r="24" fill={PURPLE} />
          <g stroke={WHITE} strokeWidth="0.8" opacity="0.55">
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={i * 14} y1="0" x2={i * 14} y2="64" />
            ))}
          </g>
        </g>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 鋭いままの背景 */}
        <use href={`#${P}-scene`} />

        {/* ── 板A。回転してから、中で背景を回転し戻して使う ─────── */}
        <g transform={`rotate(${A.rot} ${A.cx} ${A.cy})`}>
          <g clipPath={`url(#${P}-pa)`}>
            <g transform={`rotate(${-A.rot} ${A.cx} ${A.cy})`}>
              <use href={`#${P}-scene`} filter={`url(#${P}-b22)`} />
            </g>
            <rect x={A.x} y={A.y} width={A.w} height={A.h} fill={`url(#${P}-tint)`} />
            <rect x={A.x} y={A.y} width={A.w} height={A.h} fill={`url(#${P}-sheen)`} />
            {/* 上辺の内側だけを光らせる。ガラスの厚みの縁 */}
            <rect x={A.x} y={A.y} width={A.w} height="1.4" fill={WHITE} opacity="0.5" />
          </g>
          <rect
            x={A.x + 0.5} y={A.y + 0.5} width={A.w - 1} height={A.h - 1} rx={A.rx}
            fill="none" stroke={`url(#${P}-edge)`} strokeWidth="1.4"
          />

          {/* 板に乗る文字。板と一緒に傾く */}
          <text x={A.x + 36} y={A.y + 126} fill={WHITE} fontFamily={SANS} fontSize="70" fontWeight="200" letterSpacing="9">
            GLASS
          </text>
          <text x={A.x + 40} y={A.y + 158} fill={WHITE} opacity="0.74" fontFamily={SANS} fontSize="16" fontWeight="600" letterSpacing="9.4">
            MORPHISM
          </text>
          {/* 作り方そのもの。近くで見たときに読む所 */}
          <g fill={WHITE} opacity="0.6" fontFamily={MONO} fontSize="9" letterSpacing="0.4">
            <text x={A.x + 40} y={A.y + 208}>background: rgba(255,255,255,.12)</text>
            <text x={A.x + 40} y={A.y + 224}>backdrop-filter: blur(22px)</text>
            <text x={A.x + 40} y={A.y + 240}>border: 1px rgba(255,255,255,.4)</text>
          </g>
        </g>

        {/* ── 板B。Aの上に重ねる。ここは背景が2回ぼける ─────────── */}
        <g transform={`rotate(${B.rot} ${B.cx} ${B.cy})`}>
          <g clipPath={`url(#${P}-pb)`}>
            <g transform={`rotate(${-B.rot} ${B.cx} ${B.cy})`}>
              <use href={`#${P}-scene`} filter={`url(#${P}-b40)`} />
              {/* Aと重なる部分は、Aの白も乗せる */}
              <g transform={`rotate(${A.rot} ${A.cx} ${A.cy})`} clipPath={`url(#${P}-pa)`}>
                <rect x={A.x} y={A.y} width={A.w} height={A.h} fill={WHITE} opacity="0.1" />
              </g>
            </g>
            <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={`url(#${P}-tint)`} />
            <rect x={B.x} y={B.y} width={B.w} height="1.4" fill={WHITE} opacity="0.5" />
          </g>
          <rect
            x={B.x + 0.5} y={B.y + 0.5} width={B.w - 1} height={B.h - 1} rx={B.rx}
            fill="none" stroke={`url(#${P}-edge)`} strokeWidth="1.4"
          />
          <text x={B.x + 22} y={B.y + 42} fill={WHITE} opacity="0.8" fontFamily={SANS} fontSize="10" fontWeight="700" letterSpacing="3">
            GLASS ON GLASS
          </text>
          <text x={B.x + 22} y={B.y + 62} fill={WHITE} opacity="0.5" fontFamily={MONO} fontSize="8.5">
            blur ×2 = 40px
          </text>
        </g>

        {/* ── 下段。ぼかし量の階段。0 は板ではなく、ただの色付き矩形 ── */}
        <text x="48" y="672" fill={WHITE} opacity="0.62" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="3">
          THE ONLY VARIABLE THAT MATTERS
        </text>
        {([0, 6, 16, 32] as const).map((v, i) => {
          const x = 48 + i * 120;
          return (
            <g key={v}>
              <clipPath id={`${P}-t${v}`}>
                <rect x={x} y="686" width="112" height="64" rx="10" />
              </clipPath>
              <g clipPath={`url(#${P}-t${v})`}>
                <g transform={`translate(${x} 686)`} filter={v ? `url(#${P}-s${v})` : undefined}>
                  <use href={`#${P}-tile`} />
                </g>
                <rect x={x} y="686" width="112" height="64" fill={WHITE} opacity={v ? 0.1 : 0} />
              </g>
              <rect x={x + 0.5} y="686.5" width="111" height="63" rx="10" fill="none" stroke={WHITE} strokeOpacity={v ? 0.34 : 0.14} strokeWidth="1" />
              <text
                x={x + 56} y="768" textAnchor="middle" fill={WHITE} opacity={v ? 0.7 : 0.4}
                fontFamily={MONO} fontSize="9" letterSpacing="0.6"
              >
                blur({v}px)
              </text>
            </g>
          );
        })}

        {/* 粒。ガラスの版はここだけが「紙」の名残 */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.16"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
    </svg>
  );
}
