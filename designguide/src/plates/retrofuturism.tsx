/**
 * レトロフューチャリズム。
 *
 * 50年代が思い描いた未来。**カセット・フューチャリズムと必ず描き分ける**。
 * 向こうが「触れる筐体」なら、こちらは「刷られた広告」。
 * だから一枚まるごと当時の雑誌広告の版面にした。見出し・図・本文・囲み。
 *
 * ■ この絵の骨
 *   1. **平らな特色＋網点**。50年代の四色印刷はベタと網点で階調を作った。
 *      惑星の陰も空の沈みも、グラデーションではなく網（ATLAS.halftone）で出す。
 *      ⚠︎ 網の上に ATLAS.rough をかけると点が崩れるので、絶対に重ねない。
 *   2. **右上がりの対角線**。この時代の未来は必ず上を向いている。
 *      ロケットを左下から右上へ通し、速度線を平行に添える。
 *   3. 原子の軌道・環のある惑星・光条（starburst）。この3つが揃うと、
 *      色を変えても他の様式には見えなくなる。
 *   4. 見出しは赤橙のずらし影付き。当時の広告の常套手段そのまま。
 *
 * ■ 失敗して直したところ
 *   初稿はロケットを版面いっぱいに置いて「宇宙のイラスト」になった。
 *   図を枠に囲い、上に見出し、下に本文と丸囲みを付けて**広告の体裁**にしたら、
 *   ようやく「50年代が刷った未来」に見えた。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "rf";
const CREAM = "#e8e2d0";
const BLUE = "#3a6ea5";
const BLUE_D = "#2a527c";
const RED = "#d9542b";
const YELLOW = "#f2c14e";
const NIGHT = "#1f2933";

const PNL = { x: 40, y: 148, w: 520, h: 424 };

export default function Plate() {
  const r = rand(1957);

  /* 本文の代わりの罫。段落の切れ目と行末の長短で「文章」に見せる */
  const copy = (x: number, y: number, w: number, n: number, seed: number) => {
    const q = rand(seed);
    return Array.from({ length: n }, (_, i) => {
      const last = i === n - 1 || q() > 0.88;
      return (
        <rect key={i} x={x} y={y + i * 11.4} width={last ? w * q(0.32, 0.68) : w * q(0.94, 1)}
              height="2.4" fill={NIGHT} opacity="0.45" />
      );
    });
  };

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="レトロフューチャリズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-pnl`}>
          <rect x={PNL.x} y={PNL.y} width={PNL.w} height={PNL.h} rx="5" />
        </clipPath>
        {/* 網点。塗りではなくマスクで使うと、下の色をそのまま点に落とせる */}
        <mask id={`${P}-ht`}>
          <rect width="600" height="800" fill={`url(#${ATLAS.halftone})`} />
        </mask>
        <mask id={`${P}-htf`}>
          <rect width="600" height="800" fill={`url(#${ATLAS.halftoneFine})`} />
        </mask>
        <clipPath id={`${P}-planet`}><circle cx="452" cy="238" r="54" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />

        {/* ── 雑誌の頭 ─────────────────────────────────────── */}
        <rect x="40" y="34" width="520" height="3.4" fill={NIGHT} />
        <text x="40" y="58" fill={NIGHT} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10" fontWeight="700" letterSpacing="4.4">
          MECHANICS ILLUSTRATED
        </text>
        <text x="560" y="58" textAnchor="end" fill={RED}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="10" fontWeight="700" letterSpacing="4.4">
          APRIL 1957 · 35¢
        </text>

        {/* 見出し。赤橙のずらし影。当時の広告の常套手段 */}
        <g transform="translate(0 0)">
          <text x="300" y="112" textAnchor="middle" fill={RED}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="36" fontWeight="800" letterSpacing="-1.1"
                transform="translate(3.5 3.5)">THE WORLD OF TOMORROW</text>
          <text x="300" y="112" textAnchor="middle" fill={NIGHT}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="36" fontWeight="800" letterSpacing="-1.1">THE WORLD OF TOMORROW</text>
        </g>
        <rect x="40" y="130" width="520" height="1.6" fill={NIGHT} opacity="0.6" />

        {/* ── 図版の枠 ─────────────────────────────────────── */}
        <rect x={PNL.x - 5} y={PNL.y - 5} width={PNL.w + 10} height={PNL.h + 10} rx="7" fill={NIGHT} />
        <g clipPath={`url(#${P}-pnl)`}>
          <rect x={PNL.x} y={PNL.y} width={PNL.w} height={PNL.h} fill={BLUE} />

          {/* 光条。初稿は黄を opacity 0.3 で敷いたが、青と混ざって
              灰色の探照灯になった。この様式は平らな特色で刷るので、
              薄めるのではなく「明るい青」というもう1色にする */}
          <g opacity="0.9">
            {Array.from({ length: 26 }, (_, i) => {
              const a = (i / 26) * Math.PI * 2;
              const w = 0.028;
              const L = 460;
              return (
                <path key={i}
                  d={`M 452 238 L ${452 + Math.cos(a - w) * L} ${238 + Math.sin(a - w) * L}` +
                     ` L ${452 + Math.cos(a + w) * L} ${238 + Math.sin(a + w) * L} Z`}
                  fill="#5a8ac2" />
              );
            })}
          </g>

          {/* 空の沈み。網点で。グラデーションを使わないのがこの時代 */}
          <g mask={`url(#${P}-ht)`}>
            <rect x={PNL.x} y={PNL.y + 250} width={PNL.w} height="180" fill={BLUE_D} />
          </g>
          <g mask={`url(#${P}-htf)`}>
            <rect x={PNL.x} y={PNL.y + 190} width={PNL.w} height="90" fill={BLUE_D} opacity="0.7" />
          </g>

          {/* 星。四光。丸ではなく十字にすると50年代になる */}
          {Array.from({ length: 26 }, (_, i) => {
            const q = rand(300 + i);
            const x = q(PNL.x + 8, PNL.x + PNL.w - 8);
            const y = q(PNL.y + 8, PNL.y + 260);
            const s = q(3, 8);
            return (
              <path key={i}
                d={`M ${x} ${y - s} Q ${x + s * 0.2} ${y - s * 0.2} ${x + s} ${y}` +
                   ` Q ${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s}` +
                   ` Q ${x - s * 0.2} ${y + s * 0.2} ${x - s} ${y}` +
                   ` Q ${x - s * 0.2} ${y - s * 0.2} ${x} ${y - s} Z`}
                fill={CREAM} opacity={q(0.45, 1)} />
            );
          })}

          {/* ── 環のある惑星 ─────────────────────────────── */}
          {/* 奥の環 */}
          <ellipse cx="452" cy="238" rx="98" ry="26" fill="none" stroke={CREAM} strokeWidth="6"
                   opacity="0.95" transform="rotate(-18 452 238)" />
          <circle cx="452" cy="238" r="54" fill={YELLOW} />
          <g clipPath={`url(#${P}-planet)`}>
            {/* 陰。網点で作る */}
            <g mask={`url(#${P}-ht)`}>
              <circle cx="474" cy="256" r="54" fill={RED} />
            </g>
            <rect x="398" y="222" width="108" height="7" fill={RED} opacity="0.5" />
            <rect x="398" y="248" width="108" height="5" fill={RED} opacity="0.4" />
          </g>
          <circle cx="452" cy="238" r="54" fill="none" stroke={NIGHT} strokeWidth="2.4" opacity="0.7" />
          {/* 手前の環。惑星の上を通す */}
          <path d="M 366 254 Q 452 300 538 246" fill="none" stroke={CREAM} strokeWidth="6"
                transform="rotate(-18 452 238)" />

          {/* ── 原子の軌道 ───────────────────────────────── */}
          <g transform="translate(140 246)">
            {[0, 60, 120].map((a, i) => (
              <ellipse key={i} rx="76" ry="27" fill="none" stroke={CREAM} strokeWidth="3"
                       opacity="0.9" transform={`rotate(${a})`} />
            ))}
            {[[62, -14], [-30, -48], [-40, 46]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="7.5" fill={RED} stroke={CREAM} strokeWidth="1.8" />
            ))}
            <circle r="15" fill={RED} />
            <circle r="15" fill="none" stroke={CREAM} strokeWidth="2.4" />
          </g>

          {/* ── ロケット。左下から右上へ。未来は必ず上を向く ─── */}
          <g transform="translate(276 348) rotate(38) scale(1.08)">
            {/* 速度線。機体の後ろに平行に */}
            <g stroke={CREAM} strokeWidth="3" strokeLinecap="round" opacity="0.5">
              {[[-64, 120, 66], [64, 132, 54], [-96, 156, 40], [96, 150, 44]].map(([dx, y0, len], i) => (
                <line key={i} x1={dx} y1={y0} x2={dx} y2={y0 + len} />
              ))}
            </g>
            {/* 炎 */}
            <path d="M-24 68 Q -12 116 0 150 Q 12 116 24 68 Z" fill={RED} />
            <path d="M-13 70 Q -6 104 0 126 Q 6 104 13 70 Z" fill={YELLOW} />
            {/* 尾翼。3枚 */}
            <path d="M-26 18 L-62 82 L-26 72 Z" fill={RED} stroke={NIGHT} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M26 18 L62 82 L26 72 Z" fill={RED} stroke={NIGHT} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M-9 40 L0 92 L9 40 Z" fill="#c2461f" stroke={NIGHT} strokeWidth="2" strokeLinejoin="round" />
            {/* 胴 */}
            <path d="M0 -118 C 22 -74 27 -22 27 26 L27 68 L-27 68 L-27 26 C -27 -22 -22 -74 0 -118 Z"
                  fill={CREAM} stroke={NIGHT} strokeWidth="2.6" strokeLinejoin="round" />
            {/* 胴の陰。網点。右側だけ */}
            <g mask={`url(#${P}-htf)`} opacity="0.85">
              <path d="M8 -100 C 22 -70 27 -22 27 26 L27 68 L8 68 Z" fill={BLUE} />
            </g>
            {/* 先端 */}
            <path d="M0 -118 C 12 -98 17 -78 19 -62 L-19 -62 C -17 -78 -12 -98 0 -118 Z" fill={RED}
                  stroke={NIGHT} strokeWidth="2.4" strokeLinejoin="round" />
            {/* 舷窓 */}
            <circle cx="0" cy="-24" r="15" fill={BLUE} stroke={NIGHT} strokeWidth="2.4" />
            <circle cx="0" cy="-24" r="15" fill="none" stroke={CREAM} strokeWidth="4.4" opacity="0.9"
                    strokeDasharray="1 200" />
            <path d="M-9 -32 A 12 12 0 0 1 3 -37" fill="none" stroke={CREAM} strokeWidth="2.6" strokeLinecap="round" />
            {/* 帯 */}
            <rect x="-27" y="34" width="54" height="7" fill={RED} />
            <rect x="-27" y="60" width="54" height="8" fill={NIGHT} />
          </g>

          {/* ── 明日の都市。惑星の縁の上に立つ ─────────────── */}
          <path d={`M ${PNL.x} ${PNL.y + PNL.h} L ${PNL.x} ${PNL.y + 372}` +
                   ` Q 300 ${PNL.y + 322} ${PNL.x + PNL.w} ${PNL.y + 372} L ${PNL.x + PNL.w} ${PNL.y + PNL.h} Z`}
                fill={NIGHT} />
          <g fill={NIGHT}>
            {/* 円蓋と尖塔。丸屋根が50年代の未来都市の記号 */}
            <path d="M 86 508 a 30 30 0 0 1 60 0 Z" />
            <rect x="84" y="506" width="64" height="30" />
            <path d="M 196 500 a 22 22 0 0 1 44 0 Z" />
            <rect x="194" y="498" width="48" height="38" />
            <rect x="266" y="470" width="13" height="70" />
            <circle cx="272.5" cy="464" r="12" />
            <path d="M 316 496 a 26 26 0 0 1 52 0 Z" />
            <rect x="314" y="494" width="56" height="44" />
            <rect x="404" y="482" width="11" height="60" />
            <circle cx="409.5" cy="476" r="10" />
            <path d="M 442 506 a 24 24 0 0 1 48 0 Z" />
            <rect x="440" y="504" width="52" height="34" />
          </g>
          {/* 窓の灯り。黒い塊のままだと都市に見えない。
              初稿は矩形の範囲に撒いたので、地平線より上の空にも点が浮いた。
              地面の曲線を解いて、その下にだけ置く */}
          <g fill={YELLOW}>
            {Array.from({ length: 38 }, (_, i) => {
              const q = rand(600 + i);
              const x = q(80, 512);
              const t = (x - 40) / 520;
              const gy = (1 - t) * (1 - t) * 520 + 2 * t * (1 - t) * 470 + t * t * 520;
              return (
                <rect key={i} x={x} y={q(gy + 8, gy + 52)} width="3.4" height="5"
                      opacity={q(0.5, 1)} />
              );
            })}
          </g>

          {/* 単軌条。細い弧に小さな車両。近くで見て持つ細部 */}
          <path d="M 40 546 Q 300 508 560 548" fill="none" stroke={CREAM} strokeWidth="2.6" opacity="0.9" />
          <g transform="translate(238 519) rotate(-6)">
            <rect x="-30" y="-9" width="60" height="16" rx="8" fill={CREAM} stroke={NIGHT} strokeWidth="1.8" />
            <rect x="-22" y="-5" width="10" height="7" rx="1.6" fill={BLUE} />
            <rect x="-8" y="-5" width="10" height="7" rx="1.6" fill={BLUE} />
            <rect x="6" y="-5" width="10" height="7" rx="1.6" fill={BLUE} />
          </g>
          {/* 地面の網点 */}
          <g mask={`url(#${P}-ht)`} opacity="0.35">
            <rect x={PNL.x} y={PNL.y + 380} width={PNL.w} height="60" fill={CREAM} />
          </g>
        </g>

        {/* ── 本文と丸囲み ─────────────────────────────────── */}
        <text x="40" y="600" fill={NIGHT} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="12" fontWeight="800" letterSpacing="1.6">
          ATOMIC POWER FOR EVERY HOME
        </text>
        {copy(40, 614, 214, 8, 71)}
        {copy(268, 614, 190, 8, 83)}

        {/* 丸囲み。光条の縁を持つのがこの時代の広告 */}
        <g transform="translate(506 646)">
          {(() => {
            const pts: string[] = [];
            for (let i = 0; i < 32; i++) {
              const a = (i / 32) * Math.PI * 2;
              const rad = i % 2 === 0 ? 54 : 42;
              pts.push(`${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`);
            }
            return <polygon points={pts.join(" ")} fill={RED} />;
          })()}
          <text x="0" y="-2" textAnchor="middle" fill={CREAM}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="17" fontWeight="800" letterSpacing="-0.4">NEW!</text>
          <text x="0" y="16" textAnchor="middle" fill={YELLOW}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="9" fontWeight="700" letterSpacing="0.6">1957</text>
        </g>

        {/* ── 版面の締め ───────────────────────────────────── */}
        <rect x="40" y="716" width="520" height="52" fill={NIGHT} />
        <rect x="40" y="716" width="520" height="4" fill={RED} />
        <text x="58" y="750" fill={CREAM} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="19" fontWeight="800" letterSpacing="6.5">RETROFUTURISM</text>
        <text x="542" y="749" textAnchor="end" fill={YELLOW}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="9" fontWeight="700" letterSpacing="2.6">THE ATOMIC AGE</text>

        {/* ざら紙。雑誌の紙は上質紙ではない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.22"
              style={{ mixBlendMode: "multiply" }} />
        {/* 刷りの汚れ。赤版がわずかに右へずれた跡を数箇所だけ */}
        <g fill={RED} opacity="0.18">
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={r(50, 550)} cy={r(60, 760)} r={r(1.4, 3.4)} />
          ))}
        </g>
      </g>
    </svg>
  );
}
