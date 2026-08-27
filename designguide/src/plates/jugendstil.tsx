/**
 * ユーゲント・シュティール。
 *
 * アール・ヌーヴォーの独墺版。同じ「植物」を扱うのに、線の質がまるで違う。
 * ミュンヘンの誌面（Jugend）とウィーン分離派（Ver Sacrum）を軸にした。
 *
 * ■ 隣のアール・ヌーヴォーと何を変えたか
 *   1. 曲線を「正円の弧」に限る。フランス側は自由曲線（鞭）だが、
 *      独墺側は定規とコンパスで引いた自然に見える。ここが最大の差。
 *      枝はすべて 90 度の円弧＋垂直線。手で S を描いていない。
 *   2. 色面を主役にする。フランス側は線が主役、こちらは平らな色面。
 *      グラデーションを一切使わない。輪郭は太い黒。
 *   3. 正方形。ホフマンの市松。額も台座も、割り付けの方眼も全部四角。
 *      有機の曲線と直交格子をぶつけるのが分離派の作法。
 *   4. 対称。ロココの非対称とはここで分かれる。
 *
 * ■ 割り付けの方眼を薄く残してある
 *   分離派の図版は「作図の跡」を見せる。消すと、ただの平面イラストになる。
 */
import { ATLAS, rand, alpha, shift } from "@/lib/plate";

const P = "jg";
const PAPER = "#ece4d0";
const GREEN = "#4a6b3f";
const RED = "#a8442a";
const GOLD = "#d8b45a";
const INK = "#2a2620";

/* 額の市松。上下と左右で枚数を分けて、角がずれないよう寸法から計算する */
const FR = { x: 26, y: 26, w: 548, h: 748, t: 27 }; // t = 帯の幅
const NX = 20; // 上下の枚数
const NY = 26; // 左右の枚数
const TW = FR.w / NX;
const TH = (FR.h - FR.t * 2) / NY;

/** 枝。幹から水平に出て 90 度で立ち上がる正円の弧＋垂直の茎＋花 */
type Branch = { y: number; r: number; up: number; br: number };
const BRANCHES: Branch[] = [
  { y: 596, r: 112, up: 62, br: 30 },
  { y: 518, r: 87, up: 66, br: 26 },
  { y: 440, r: 63, up: 60, br: 22 },
  { y: 362, r: 41, up: 54, br: 18 },
];

/**
 * 花。
 * 前の版は同心円の的（ターゲット）を9つ、全部同じ形で並べていた。
 * 同じ紋が等間隔で9回出ると、それは図案ではなく**壁紙**になる。
 * モーザーやホフマンの図案は、円・角・蕾を混ぜて、
 * ひとつの茎の上で形を変えていく。3種を用意して段ごとに替えた。
 *   kind 0 = 同心の輪（開いた花）
 *   kind 1 = 角の薔薇（正方形の入れ子。ホフマンの常套）
 *   kind 2 = 蕾（横から見た形。萼まで描く）
 */
function Blossom({ x, y, r, alt, kind = 0 }: { x: number; y: number; r: number; alt?: boolean; kind?: number }) {
  const outer = alt ? GOLD : RED;
  const ring = alt ? RED : GOLD;
  const core = alt ? GREEN : GOLD;

  if (kind === 1) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={outer} stroke={INK} strokeWidth="2.4" />
        <rect x={-r * 0.62} y={-r * 0.62} width={r * 1.24} height={r * 1.24}
              fill="none" stroke={ring} strokeWidth={r * 0.16} transform="rotate(45)" />
        <rect x={-r * 0.28} y={-r * 0.28} width={r * 0.56} height={r * 0.56} fill={core} stroke={INK} strokeWidth="1.6" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={Math.sin((Math.PI / 2) * i) * r * 0.78} cy={-Math.cos((Math.PI / 2) * i) * r * 0.78}
                  r={r * 0.08} fill={INK} opacity="0.8" />
        ))}
      </g>
    );
  }
  if (kind === 2) {
    return (
      <g transform={`translate(${x} ${y})`}>
        {/* 蕾。萼が下から包む */}
        <path d={`M0 ${-r * 1.25} C ${r * 0.78} ${-r * 0.8} ${r * 0.66} ${r * 0.3} 0 ${r * 0.62}
                  C ${-r * 0.66} ${r * 0.3} ${-r * 0.78} ${-r * 0.8} 0 ${-r * 1.25} Z`}
              fill={outer} stroke={INK} strokeWidth="2.2" />
        <path d={`M0 ${-r * 1.1} C ${r * 0.3} ${-r * 0.7} ${r * 0.26} ${r * 0.1} 0 ${r * 0.4}`}
              fill="none" stroke={ring} strokeWidth={r * 0.15} />
        <path d={`M${-r * 0.6} ${r * 0.24} C ${-r * 0.3} ${r * 0.86} ${r * 0.3} ${r * 0.86} ${r * 0.6} ${r * 0.24}
                  C ${r * 0.3} ${r * 0.6} ${-r * 0.3} ${r * 0.6} ${-r * 0.6} ${r * 0.24} Z`}
              fill={GREEN} stroke={INK} strokeWidth="2" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={outer} stroke={INK} strokeWidth="2.4" />
      <circle r={r * 0.62} fill="none" stroke={ring} strokeWidth={r * 0.16} />
      <circle r={r * 0.3} fill={core} stroke={INK} strokeWidth="1.6" />
      <circle r={r * 0.1} fill={INK} />
      {/* 外周の点。12 等分。近くで見たときの細部はここ */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI / 6) * i;
        return <circle key={i} cx={Math.sin(a) * r * 0.84} cy={-Math.cos(a) * r * 0.84} r={r * 0.055} fill={INK} opacity="0.75" />;
      })}
    </g>
  );
}

/** 葉。菱に近い幾何の葉。茎に必ず付ける（宙に浮かせない） */
function Leaf({ x, y, r, flip }: { x: number; y: number; r: number; flip: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path d={`M0 0 L${r * 0.9} ${-r * 0.5} L${r * 1.7} 0 L${r * 0.9} ${r * 0.5} Z`}
            fill={GREEN} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M0 0 L${r * 1.7} 0`} stroke={INK} strokeWidth="1.1" opacity="0.7" />
    </g>
  );
}

export default function Plate() {
  const r = rand(1898);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ユーゲント・シュティール様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 版面の方眼。作図の跡を薄く残す */}
        <pattern id={`${P}-grid`} width="27" height="27" patternUnits="userSpaceOnUse" x="54" y="54">
          <path d="M27 0 V27 M0 27 H27" fill="none" stroke={GOLD} strokeWidth="0.7" />
        </pattern>
        <clipPath id={`${P}-field`}>
          <rect x="53" y="53" width="494" height="694" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />
        <rect x="53" y="53" width="494" height="694" fill={`url(#${P}-grid)`} opacity="0.4" />

        <g clipPath={`url(#${P}-field)`}>
          {/* ── 台座。市松の段。幹はここに立つ ─────────────────── */}
          <rect x="118" y="628" width="364" height="10" fill={INK} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={118 + i * 26} y={638} width="26" height="18" fill={i % 2 === 0 ? GREEN : GOLD} stroke={INK} strokeWidth="1.4" />
          ))}
          <rect x="106" y="656" width="388" height="8" fill={INK} />

          {/* ── 幹と枝。全部が正円の弧と垂直線。手描きの曲線を混ぜない ── */}
          <g fill="none" stroke={INK} strokeWidth="17" strokeLinecap="butt">
            <line x1="300" y1="628" x2="300" y2="200" />
            {BRANCHES.map((b, i) => (
              <g key={i}>
                <path d={`M300 ${b.y} A${b.r} ${b.r} 0 0 0 ${300 + b.r} ${b.y - b.r}`} />
                <path d={`M300 ${b.y} A${b.r} ${b.r} 0 0 1 ${300 - b.r} ${b.y - b.r}`} />
                <line x1={300 + b.r} y1={b.y - b.r} x2={300 + b.r} y2={b.y - b.r - b.up} />
                <line x1={300 - b.r} y1={b.y - b.r} x2={300 - b.r} y2={b.y - b.r - b.up} />
              </g>
            ))}
          </g>
          {/* 芯を緑で抜く。黒の外郭＋緑の芯＝分離派の平塗り */}
          <g fill="none" stroke={GREEN} strokeWidth="10" strokeLinecap="butt">
            <line x1="300" y1="628" x2="300" y2="200" />
            {BRANCHES.map((b, i) => (
              <g key={i}>
                <path d={`M300 ${b.y} A${b.r} ${b.r} 0 0 0 ${300 + b.r} ${b.y - b.r}`} />
                <path d={`M300 ${b.y} A${b.r} ${b.r} 0 0 1 ${300 - b.r} ${b.y - b.r}`} />
                <line x1={300 + b.r} y1={b.y - b.r} x2={300 + b.r} y2={b.y - b.r - b.up} />
                <line x1={300 - b.r} y1={b.y - b.r} x2={300 - b.r} y2={b.y - b.r - b.up} />
              </g>
            ))}
          </g>

          {/* ── コンパスの跡。枝の弧の中心に印を残す ─────────────────
              葉を足す案は捨てた。枝の弧と重なって緑の瘤にしか見えなかった。
              代わりに「この植物は定規とコンパスで作図した」と言う印を残す。
              分離派の図版は作図の跡を見せる。これがフランス側との差になる */}
          <g opacity="0.55">
            {BRANCHES.map((b, i) => {
              const cy = b.y - b.r;
              return (
                <g key={i}>
                  <circle cx="300" cy={cy} r={b.r} fill="none" stroke={GOLD} strokeWidth="0.8" opacity={i === 0 ? 0.9 : 0.35} />
                  <circle cx="300" cy={cy} r="4.5" fill="none" stroke={GOLD} strokeWidth="1.2" />
                  <path d={`M294 ${cy} h12 M300 ${cy - 6} v12`} stroke={GOLD} strokeWidth="1.2" />
                </g>
              );
            })}
          </g>

          {BRANCHES.map((b, i) => {
            const by = b.y - b.r - b.up - b.br + 6;
            const kind = [0, 2, 1, 2][i];
            return (
              <g key={i}>
                <Blossom x={300 + b.r} y={by} r={b.br} alt={i % 2 === 1} kind={kind} />
                <Blossom x={300 - b.r} y={by} r={b.br} alt={i % 2 === 1} kind={kind} />
                {/* 茎の途中に葉。花の下端よりさらに下げる。
                    近づけると花の縁に瘤が付いたように見えた */}
                <Leaf x={300 + b.r} y={by + b.br + b.up * 0.5} r={b.br * 0.5} flip={1} />
                <Leaf x={300 - b.r} y={by + b.br + b.up * 0.5} r={b.br * 0.5} flip={-1} />
              </g>
            );
          })}
          {/* 冠の花。いちばん大きい。中心軸を締める */}
          <Blossom x={300} y={168} r={36} />

          {/* ── 左右の垂れ飾り。正方形の連続。分離派の常套 ─────────── */}
          {[76, 524].map((x, k) => (
            <g key={k}>
              <line x1={x} y1="78" x2={x} y2="600" stroke={INK} strokeWidth="2" />
              {Array.from({ length: 9 }, (_, i) => {
                const y = 96 + i * 58;
                const c = i % 3 === 0 ? RED : i % 3 === 1 ? GOLD : GREEN;
                return (
                  <g key={i}>
                    <rect x={x - 11} y={y - 11} width="22" height="22" fill={c} stroke={INK} strokeWidth="2.2" />
                    <rect x={x - 4} y={y - 4} width="8" height="8" fill={INK} opacity="0.85" />
                  </g>
                );
              })}
              <rect x={x - 16} y="600" width="32" height="32" fill={INK} />
              <rect x={x - 8} y="608" width="16" height="16" fill={GOLD} />
            </g>
          ))}

          {/* ── 題字の箱。黒地に地色の文字。方眼に乗せる ─────────── */}
          <rect x="94" y="672" width="412" height="52" fill={INK} />
          <rect x="100" y="678" width="400" height="40" fill="none" stroke={GOLD} strokeWidth="1" />
          <text
            x="300" y="706" textAnchor="middle" fill={PAPER}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="26" fontWeight="600" letterSpacing="10"
          >
            JUGENDSTIL
          </text>
          {/* 箱の左右に小さな正方形。三つ並べるのが分離派の句読点 */}
          {[[70, 698], [82, 698], [518, 698], [530, 698]].map(([x, y], i) => (
            <rect key={i} x={x - 4} y={y - 4} width="8" height="8" fill={INK} />
          ))}
          <text
            x="300" y="740" textAnchor="middle" fill={INK}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="9" fontWeight="600" letterSpacing="5.2" opacity="0.8"
          >
            VER SACRUM — MÜNCHEN · WIEN 1895—1910
          </text>
        </g>

        {/* ── 額。市松の帯。角がずれないよう寸法から枚数を出す ─────── */}
        <g stroke={INK} strokeWidth="0.8">
          {Array.from({ length: NX }, (_, i) => {
            const c = i % 5 === 2 ? RED : i % 2 === 0 ? INK : PAPER;
            const c2 = i % 5 === 4 ? GOLD : i % 2 === 0 ? PAPER : INK;
            return (
              <g key={`h${i}`}>
                <rect x={FR.x + i * TW} y={FR.y} width={TW} height={FR.t} fill={c} />
                <rect x={FR.x + i * TW} y={FR.y + FR.h - FR.t} width={TW} height={FR.t} fill={c2} />
              </g>
            );
          })}
          {Array.from({ length: NY }, (_, i) => {
            const c = i % 5 === 1 ? GOLD : i % 2 === 0 ? PAPER : INK;
            const c2 = i % 5 === 3 ? RED : i % 2 === 0 ? INK : PAPER;
            const y = FR.y + FR.t + i * TH;
            return (
              <g key={`v${i}`}>
                <rect x={FR.x} y={y} width={FR.t} height={TH} fill={c} />
                <rect x={FR.x + FR.w - FR.t} y={y} width={FR.t} height={TH} fill={c2} />
              </g>
            );
          })}
        </g>
        <rect x={FR.x} y={FR.y} width={FR.w} height={FR.h} fill="none" stroke={INK} strokeWidth="3" />
        <rect x={FR.x + FR.t} y={FR.y + FR.t} width={FR.w - FR.t * 2} height={FR.h - FR.t * 2} fill="none" stroke={INK} strokeWidth="2.4" />
        <rect x={FR.x + FR.t + 5} y={FR.y + FR.t + 5} width={FR.w - FR.t * 2 - 10} height={FR.h - FR.t * 2 - 10} fill="none" stroke={GOLD} strokeWidth="1" />

        {/* 刷りムラ。平塗りだけだと版画に見えない */}
        <g fill={INK} opacity="0.12">
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={r(60, 540)} y={r(60, 740)} width={r(1, 3)} height={r(1, 3)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
