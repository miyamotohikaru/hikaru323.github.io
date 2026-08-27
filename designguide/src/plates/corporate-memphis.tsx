/**
 * コーポレート・メンフィス（Alegria）。
 *
 * 2017年頃から巨大IT企業の説明図がいっせいにこれになった。
 * 誰にも似ていない人を、誰にでも当てはまるように描くための様式。
 *
 * ■ ここで作っている「らしさ」
 *   1. 手足が長い。胴は短く、腕は身長の半分以上ある。
 *      腕を1本の太い曲線（丸い端）で引き、途中で必ず1回たわませる。
 *      真っ直ぐ引くと棒人間になり、たわませすぎると麺になる。
 *   2. 顔を描かない。目も口も入れない。
 *      入れた瞬間に「その人」になってしまい、
 *      誰にでも当てはまる、という前提が壊れる。
 *      髪の形と姿勢だけで人物を書き分ける。
 *   3. 肌の色が自然色でない。菫・珊瑚・薄荷。
 *      人種を描かないための決まりごとで、この様式の核心でもある。
 *   4. 平面。影も立体も付けない。唯一許すのは足元の平たい楕円だけ。
 *      （検分で直した：それでも版面に「NO SHADOWS」と刷ってあったので、
 *      絵と刷り文句が矛盾していた。文句のほうを「FLAT COLOUR」に改めた。
 *      足元の楕円は接地を示すために要る）
 *   5. 背景は大きな幾何と観葉植物。モンステラはほぼ義務。
 */
import { ATLAS } from "@/lib/plate";

const P = "cm";
const PAPER = "#f6f3ef";
const VIOLET = "#6c63ff";
const CORAL = "#ff8a5b";
const MINT = "#3ec1a0";
const NAVY = "#2b2a3d";
const WHITE = "#ffffff";
const TINT = "#e4e2ff"; // 菫の淡い方。5色から作った中間色
const GREY = "#dedbe8";

/** 手足。太い1本の曲線に丸い端。先に手（円）を置く */
const Limb = ({ d, c, w = 16, hand = 10, hx, hy }: { d: string; c: string; w?: number; hand?: number; hx: number; hy: number }) => (
  <g>
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    <circle cx={hx} cy={hy} r={hand} fill={c} />
  </g>
);

/** モンステラの葉。楕円に切れ込みを入れるだけで、あの葉に見える */
const Leaf = ({ x, y, rot, s, c }: { x: number; y: number; rot: number; s: number; c: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx="0" cy="-46" rx="29" ry="47" fill={c} />
    {/* 切れ込みは左右2本ずつで足りる。初稿は5本入れて千切れた草に見えた */}
    <g fill={PAPER}>
      <path d="M 30,-64 L 4,-58 L 30,-51 Z" />
      <path d="M 30,-34 L 4,-29 L 29,-22 Z" />
      <path d="M -30,-56 L -4,-50 L -30,-43 Z" />
      <path d="M -30,-26 L -4,-21 L -29,-14 Z" />
    </g>
  </g>
);

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="コーポレート・メンフィス様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 背景の幾何。大きく、平らに、少しだけ ────────────────── */}
        <circle cx="304" cy="318" r="206" fill={TINT} />
        <path d="M 520,120 A 96 96 0 0 1 568,246" fill="none" stroke={CORAL} strokeWidth="13" strokeLinecap="round" />
        <path d="M 40,470 A 84 84 0 0 0 92,548" fill="none" stroke={MINT} strokeWidth="11" strokeLinecap="round" />
        <circle cx="524" cy="424" r="17" fill={MINT} />
        <circle cx="72" cy="196" r="11" fill={VIOLET} />
        <circle cx="466" cy="88" r="8" fill={NAVY} opacity="0.5" />
        <g stroke={VIOLET} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M 96,268 C 106,256 118,278 128,266" />
        </g>

        {/* ── 板。掲げているものは、いつも中身の無いUI ──────────── */}
        <g transform="rotate(-4 350 250)">
          <rect x="236" y="176" width="228" height="148" rx="20" fill={WHITE} />
          <circle cx="270" cy="212" r="15" fill={MINT} />
          <rect x="296" y="204" width="128" height="11" rx="5.5" fill={VIOLET} />
          <rect x="296" y="222" width="76" height="9" rx="4.5" fill={GREY} />
          <rect x="266" y="250" width="176" height="9" rx="4.5" fill={GREY} />
          <rect x="266" y="268" width="128" height="9" rx="4.5" fill={GREY} />
          <rect x="266" y="288" width="72" height="22" rx="11" fill={CORAL} />
        </g>

        {/* ── 足元の影。この様式で唯一許される立体らしさ ──────────── */}
        <g fill={NAVY} opacity="0.09">
          <ellipse cx="196" cy="614" rx="58" ry="10" />
          <ellipse cx="456" cy="614" rx="54" ry="10" />
          <ellipse cx="94" cy="632" rx="46" ry="9" />
        </g>

        {/* ── 左の人。腕が身長の半分以上ある ────────────────────── */}
        <g>
          <g fill="none" stroke={CORAL} strokeWidth="18" strokeLinecap="round">
            <path d="M 186,450 C 176,506 182,552 170,592" />
            <path d="M 210,450 C 224,504 216,552 228,592" />
          </g>
          <ellipse cx="164" cy="602" rx="19" ry="10" fill={NAVY} />
          <ellipse cx="234" cy="602" rx="19" ry="10" fill={NAVY} />
          <rect x="170" y="350" width="52" height="110" rx="26" fill={VIOLET} />
          {/* 長い腕。板の左下の角まで届かせる */}
          <Limb d="M 212,374 C 242,346 248,290 240,244" c={MINT} hx={238} hy={240} />
          <Limb d="M 176,378 C 152,412 148,454 158,488" c={MINT} hx={158} hy={490} />
          {/* 首と頭。顔は描かない */}
          <rect x="188" y="322" width="16" height="34" rx="8" fill={MINT} />
          <circle cx="196" cy="322" r="26" fill={MINT} />
          <path d="M 170,318 C 170,290 182,276 197,276 C 214,276 224,290 222,316 C 216,300 208,294 196,294 C 183,294 174,303 170,318 Z" fill={NAVY} />
        </g>

        {/* ── 右の人。板の右を支え、もう一方の手に丸いものを持つ ──── */}
        <g>
          <g fill="none" stroke={NAVY} strokeWidth="18" strokeLinecap="round">
            <path d="M 446,456 C 438,510 444,554 432,594" />
            <path d="M 470,456 C 482,508 474,554 486,594" />
          </g>
          <ellipse cx="426" cy="604" rx="19" ry="10" fill={NAVY} />
          <ellipse cx="492" cy="604" rx="19" ry="10" fill={NAVY} />
          <rect x="432" y="360" width="52" height="106" rx="26" fill={CORAL} />
          <Limb d="M 476,386 C 496,350 488,290 468,242" c={VIOLET} hx={464} hy={238} />
          <Limb d="M 434,388 C 402,418 396,462 406,496" c={VIOLET} hx={406} hy={498} />
          <circle cx="406" cy="498" r="21" fill={MINT} />
          <rect x="450" y="332" width="16" height="34" rx="8" fill={VIOLET} />
          <circle cx="458" cy="332" r="26" fill={VIOLET} />
          {/* 髪は結ぶ。顔を描かないので、書き分けはここだけ */}
          <path d="M 432,330 C 430,300 442,286 459,286 C 478,286 488,302 484,330 C 480,338 470,326 458,326 C 446,326 436,336 432,330 Z" fill={NAVY} />
          <circle cx="458" cy="278" r="14" fill={NAVY} />
        </g>

        {/* ── モンステラ。この様式ではほぼ義務 ────────────────── */}
        <g>
          <g fill="none" stroke="#2f9c81" strokeWidth="5" strokeLinecap="round">
            <path d="M 95,566 Q 84,542 74,522" />
            <path d="M 95,566 Q 108,544 118,528" />
            <path d="M 95,566 Q 95,536 95,506" />
          </g>
          <Leaf x={74} y={522} rot={-27} s={0.92} c={MINT} />
          <Leaf x={118} y={528} rot={22} s={0.8} c="#2f9c81" />
          <Leaf x={95} y={506} rot={-3} s={1.02} c={MINT} />
          <path d="M 60,566 L 130,566 L 121,624 C 120,632 110,637 95,637 C 80,637 70,632 69,624 Z" fill={CORAL} />
          <rect x="54" y="554" width="82" height="18" rx="9" fill="#e6754d" />
        </g>

        {/* 浮いている小さな部品。近くで見るときの取っ掛かり */}
        <g transform="rotate(8 98 314)">
          <rect x="60" y="288" width="76" height="52" rx="16" fill={WHITE} />
          <path d="M 60,332 L 60,340 L 76,332 Z" fill={WHITE} />
          <rect x="74" y="304" width="48" height="8" rx="4" fill={GREY} />
          <rect x="74" y="318" width="30" height="8" rx="4" fill={GREY} />
        </g>
        <g transform="translate(508 512)">
          <circle r="26" fill={VIOLET} />
          <path d="M -11,1 L -3,10 L 12,-8" fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ── 文字 ────────────────────────────────────────────── */}
        <text x="44" y="712" fill={NAVY}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="49" fontWeight="700" letterSpacing="-1.4">
          CORPORATE
        </text>
        <text x="44" y="764" fill={VIOLET}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="49" fontWeight="700" letterSpacing="-1.4">
          MEMPHIS
        </text>
        <text x="556" y="692" textAnchor="end" fill={NAVY}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10.5" fontWeight="600" letterSpacing="2.6" opacity="0.62">
          NO FACES — FLAT COLOUR
        </text>
        <text x="556" y="710" textAnchor="end" fill={NAVY}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10.5" fontWeight="600" letterSpacing="2.6" opacity="0.62">
          ARMS LONGER THAN LEGS
        </text>
        {/* 色の見本。丸で並べるのがこの様式の作法 */}
        <g>
          {[VIOLET, CORAL, MINT, NAVY, TINT].map((c, i) => (
            <circle key={i} cx={410 + i * 32} cy="754" r="13" fill={c} />
          ))}
        </g>

        {/* 紙目はごく薄く。平面が身上なので質感で誤魔化さない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.09" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
