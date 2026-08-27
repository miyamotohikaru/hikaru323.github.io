/**
 * ミッドセンチュリー・モダン。
 *
 * 戦後アメリカの居間。合板を熱で曲げ、脚を細く開き、有機的な輪郭を
 * 直線の部屋に置いた。だから図版も「部屋の一場面」で組む。
 * 家具を並べた見本帳ではなく、壁・床・掛け時計・家具の重なりで描く。
 *
 * ■ この様式を決めている4つ
 *   1. 有機的な輪郭。アメーバ形・ブーメラン形の天板。直線の版面に
 *      1つだけ曲線の塊を置くと、それだけで年代が決まる。
 *   2. 細く開いた脚。太い脚を描いた瞬間に戦前の家具に戻る。
 *      先端の真鍮のフェルールまで描くと効く。
 *   3. 星形（ネルソンのボール時計）と原子模様。壁のテキスタイルは
 *      ジラールの疎らな幾何。詰めると70年代になる。
 *   4. 木と橙。teal と橙と赤茶を、クリームの地の上で当てる。
 *
 * ■ 版面
 *   壁と床を y=604 で分ける。壁の右2/3にテキスタイルの面を掛け、
 *   左に時計と題字を置く。家具は床と壁の境をまたがせる。
 *   境をまたがないと、家具が壁に貼りついた絵に見える。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "mcm";

const CREAM = "#efe7d6";
const ORANGE = "#d9822b";
const TEAL = "#2f6f6a";
const RED = "#c4452e";
const BROWN = "#2b2820";

/* 5色から作った中間色。別の色相は足していない */
const WOOD = "#a8703a";
const WOOD_D = "#7c4f27";
const FLOOR = "#e2d4b8";
const FLOOR_L = "#c3ab84";
const TEAL_D = "#255754";
const BRASS = "#d9a24a";

const HORIZON = 604;

/** ネルソンのボール時計。12本の細い骨の先に球 */
function BallClock({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const balls = ["#c4452e", "#d9822b", "#2b2820", "#2f6f6a"];
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={BROWN} strokeWidth="2.2" />
            <circle cx={x} cy={y} r="10.5" fill={balls[i % 4]} />
            <circle cx={x - 3} cy={y - 3.4} r="3" fill="#fff" opacity="0.28" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="13" fill={BROWN} />
      {/* 針。長針を10時、短針を2時に */}
      <line x1={cx} y1={cy} x2={cx + r * 0.62} y2={cy - r * 0.34} stroke={BROWN} strokeWidth="5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx - r * 0.5} y2={cy - r * 0.62} stroke={BROWN} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill={ORANGE} />
    </g>
  );
}

/** 4条の細い星。原子模様の主役 */
function Star({ x, y, s, c, rot = 0 }: { x: number; y: number; s: number; c: string; rot?: number }) {
  const d = `M0 ${-s} C 1.6 ${-s * 0.3} ${s * 0.3} -1.6 ${s} 0 C ${s * 0.3} 1.6 1.6 ${s * 0.3} 0 ${s} C -1.6 ${s * 0.3} ${-s * 0.3} 1.6 ${-s} 0 C ${-s * 0.3} -1.6 -1.6 ${-s * 0.3} 0 ${-s} Z`;
  return <path d={d} transform={`translate(${x} ${y}) rotate(${rot})`} fill={c} />;
}

export default function Plate() {
  const r = rand(19570214);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ミッドセンチュリー・モダン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-panel`}><rect x="232" y="56" width="368" height="452" /></clipPath>
        {/* 天板の木目 */}
        <linearGradient id={`${P}-wood`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#b87c42" />
          <stop offset="1" stopColor="#8d5c2e" />
        </linearGradient>
        <linearGradient id={`${P}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f0e2" />
          <stop offset="1" stopColor="#d9cdb4" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 壁 ─────────────────────────────────────────── */}
        <rect width="600" height={HORIZON} fill={CREAM} />

        {/* ── テキスタイルの面。ジラール風の疎らな原子模様 ─────── */}
        <rect x="232" y="56" width="368" height="452" fill={TEAL} />
        <g clipPath={`url(#${P}-panel)`}>
          {/* 織りの縦筋。平らな塗りで終わらせない */}
          <g stroke={TEAL_D} strokeWidth="1" opacity="0.5">
            {Array.from({ length: 62 }, (_, i) => (
              <line key={i} x1={232 + i * 6} y1="56" x2={232 + i * 6} y2="508" />
            ))}
          </g>
          {/* 模様。6×8の粗い格子に、種類を替えながら置く。
              詰めると70年代の柄になるので、必ず余白を残す */}
          {Array.from({ length: 7 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => {
              /* 行ごとに半コマずらし、4割を空ける。等間隔に詰めると
                 壁紙の見本帳になった（2稿目）。ジラールの柄は疎らで、
                 大小の差が大きい */
              const x = 254 + col * 70 + (row % 2 ? 35 : 0) + r(-9, 9);
              const y = 96 + row * 60 + r(-8, 8);
              if (r() < 0.26) return null;
              const kind = Math.floor(r(0, 3));
              const c = r() < 0.38 ? ORANGE : CREAM;
              const k = r(0.6, 1.9);
              if (kind === 0) return <Star key={`${row}-${col}`} x={x} y={y} s={11 * k} c={c} rot={r(0, 90)} />;
              if (kind === 1)
                return (
                  <g key={`${row}-${col}`}>
                    <circle cx={x} cy={y} r={6 * k} fill="none" stroke={c} strokeWidth={2 * Math.min(1.4, k)} />
                    <circle cx={x} cy={y} r={2 * k} fill={c} />
                  </g>
                );
              return (
                <path
                  key={`${row}-${col}`}
                  d="M-13 5 C -8 -7 6 -10 14 -3 C 8 -3 -1 1 -4 8 Z"
                  transform={`translate(${x} ${y}) rotate(${r(-50, 50)}) scale(${k.toFixed(2)})`}
                  fill={c}
                />
              );
            }),
          )}
        </g>
        {/* 面の吊り棒 */}
        <rect x="226" y="50" width="380" height="7" fill={BROWN} />

        {/* ── 掛け時計 ───────────────────────────────────── */}
        <BallClock cx={126} cy={162} r={78} />

        {/* ── 題字。壁の左に置く。家具とも柄とも重ねない ───────── */}
        <text x="40" y="398" fill={BROWN} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="29" fontWeight="700" letterSpacing="1.2">
          MID-CENTURY
        </text>
        <text x="40" y="434" fill={RED} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="29" fontWeight="700" letterSpacing="1.2">
          MODERN
        </text>
        <line x1="40" y1="454" x2="186" y2="454" stroke={ORANGE} strokeWidth="2.4" />
        <text x="40" y="478" fill={BROWN} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" fontWeight="600" letterSpacing="4" opacity="0.72">
          AMERICA 1945—1969
        </text>
        <Star x={196} y={451} s={10} c={ORANGE} rot={18} />

        {/* ── 床。板張り。壁との境に幅木 ─────────────────────── */}
        <rect y={HORIZON} width="600" height={800 - HORIZON} fill={FLOOR} />
        <rect y={HORIZON} width="600" height="9" fill={BROWN} />
        <g stroke={FLOOR_L} strokeWidth="1.4" opacity="0.8">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="0" y1={HORIZON + 22 + i * 21} x2="600" y2={HORIZON + 22 + i * 21} />
          ))}
        </g>
        {/* 板の継ぎ目。位置をずらす */}
        <g stroke={FLOOR_L} strokeWidth="1.2" opacity="0.6">
          {Array.from({ length: 14 }, (_, i) => {
            const row = i % 9;
            const y = HORIZON + 22 + row * 21;
            const x = r(20, 580);
            return <line key={i} x1={x} y1={y} x2={x} y2={y - 21} />;
          })}
        </g>

        {/* ── 家具。壁と床の境をまたがせる ─────────────────── */}

        {/* シェルチェア。側面。合板を曲げた一体の殻とエッフェル脚 */}
        <g transform="translate(352 486)">
          {/* 影 */}
          <ellipse cx="66" cy="200" rx="78" ry="8" fill={BROWN} opacity="0.13" />
          {/* 脚。細く開く。真鍮の先 */}
          {[[26, 176, -24], [108, 178, 26], [48, 194, -40], [124, 196, 42]].map(([x, y, dx], i) => (
            <g key={i}>
              <line x1={x} y1="110" x2={x + dx} y2={y} stroke={BROWN} strokeWidth="3.2" strokeLinecap="round" />
              <circle cx={x + dx} cy={y} r="3" fill={BRASS} />
            </g>
          ))}
          {/* 脚の斜め筋交い。エッフェル脚のワイヤー */}
          <path d="M26 110 L166 196 M108 110 L8 194" stroke={BROWN} strokeWidth="1.5" opacity="0.5" fill="none" />
          {/* 座を受ける枠 */}
          <path d="M20 110 L128 108" stroke={BROWN} strokeWidth="3" />
          {/* 殻。背から座までひと続き。閉じた輪郭で描くと背と座が
              別部品に見えたので、太い丸線1本にした。成形品の肉厚が出る */}
          <path
            d="M12 2 C -6 44 2 84 30 98 L122 94"
            stroke="#9c3222" strokeWidth="17" fill="none" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(2.5 3)"
          />
          <path
            d="M12 2 C -6 44 2 84 30 98 L122 94"
            stroke={RED} strokeWidth="17" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d="M12 2 C -6 44 2 84 30 98 L122 94"
            stroke="#e0674f" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"
            transform="translate(-2.5 -3)"
          />
        </g>

        {/* ブーメラン天板の低いテーブル。曲線の塊はこの1つだけ */}
        <g transform="translate(34 588)">
          <ellipse cx="150" cy="120" rx="140" ry="10" fill={BROWN} opacity="0.13" />
          {/* 脚。外へ開く細い丸棒 */}
          {[[42, 46, 14, 116], [128, 62, 116, 118], [232, 52, 258, 114], [176, 40, 178, 112]].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={WOOD_D} strokeWidth="4" strokeLinecap="round" />
              <circle cx={x2} cy={y2} r="3.2" fill={BRASS} />
            </g>
          ))}
          {/* 天板。ブーメラン */}
          <path
            d="M6 40 C 20 8 96 -6 168 6 C 232 17 288 6 296 26 C 303 44 258 54 196 50 C 138 46 74 66 34 62 C 10 60 0 52 6 40 Z"
            fill={`url(#${P}-wood)`}
          />
          {/* 木口。天板の厚み */}
          <path
            d="M6 40 C 0 52 10 60 34 62 C 74 66 138 46 196 50 C 258 54 303 44 296 26 L296 34 C 303 52 258 62 196 58 C 138 54 74 74 34 70 C 10 68 0 60 6 48 Z"
            fill={WOOD_D}
          />
          {/* 木目 */}
          <g stroke="#7c4f27" strokeWidth="1" opacity="0.3" fill="none">
            {[16, 26, 36, 46].map((dy, i) => (
              <path key={i} d={`M14 ${28 + dy * 0.28} C 90 ${6 + dy * 0.5} 200 ${20 + dy * 0.4} 292 ${20 + dy * 0.3}`} />
            ))}
          </g>
          {/* 天板の上の小物。近くで見る細部 */}
          {/* 天板の小物。近くで見る細部。棒だと何か分からなかったので、
              口のすぼまった器と、重ねた本にした */}
          <path d="M88 -14 L88 -4 C 74 2 70 20 76 30 L108 30 C 114 20 110 2 96 -4 L96 -14 Z" fill={TEAL} />
          <path d="M88 -14 L88 -4 C 80 -1 76 6 75 14 C 78 4 84 0 92 -3 L92 -14 Z" fill="#3f8a84" />
          <ellipse cx="92" cy="30" rx="16" ry="4" fill={TEAL_D} />
          <path d="M92 -14 C 88 -30 100 -38 106 -44" stroke="#2f6f6a" strokeWidth="2" fill="none" />
          <path d="M106 -44 C 114 -40 112 -28 102 -28 Z" fill="#2f6f6a" />
          <g>
            <rect x="196" y="18" width="54" height="9" rx="1.5" fill={CREAM} />
            <rect x="196" y="18" width="6" height="9" fill={ORANGE} />
            <rect x="202" y="10" width="50" height="8" rx="1.5" fill={ORANGE} />
            <rect x="202" y="10" width="5" height="8" fill={BROWN} />
          </g>
        </g>

        {/* 三脚のフロアランプ。細い線で版面の右を締める */}
        <g transform="translate(516 336)">
          <path d="M-34 0 L34 0 L22 -52 L-22 -52 Z" fill={CREAM} />
          <path d="M-34 0 L34 0 L22 -52 L-22 -52 Z" fill="none" stroke={BROWN} strokeWidth="2" />
          <path d="M-30 -8 L30 -8 L34 0 L-34 0 Z" fill={ORANGE} opacity="0.22" />
          <line x1="0" y1="0" x2="0" y2="246" stroke={BROWN} strokeWidth="3" />
          {[[-34, 268], [30, 272], [4, 280]].map(([x, y], i) => (
            <g key={i}>
              <line x1="0" y1="228" x2={x} y2={y} stroke={BROWN} strokeWidth="3" strokeLinecap="round" />
              <circle cx={x} cy={y} r="3" fill={BRASS} />
            </g>
          ))}
          <ellipse cx="0" cy="282" rx="46" ry="6" fill={BROWN} opacity="0.12" />
        </g>

        {/* 床の脚注 */}
        <text x="40" y="782" fill={BROWN} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="600" letterSpacing="3.4" opacity="0.6">
          MOULDED PLYWOOD · SPLAYED DOWEL LEG · BRASS FERRULE
        </text>

        {/* 紙の目 */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.17" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
