/**
 * ニュー・ウェーブ・デザイン。
 *
 * ヴァインガルト、グライマン、フリードマン。同じバーゼルの学校から出て、
 * スイス・スタイルの格子を内側から壊した世代。
 *
 * ■ 隣のスイス・スタイルと必ず対にして読ませる
 *   スイスの図版では、格子は**引かず**、すべてが格子に乗っている。
 *   こちらでは格子を**薄く引いて見せた上で、どの要素も乗せていない**。
 *   破っている相手が見えていないと、ただの雑な版面になる。
 *
 * ■ この様式の技法
 *   1. **段送り（ステップ）。** 同じ組を少しずつ右へ、字間を開きながら
 *      3行ずらす。最後の行は版面の外へ出す。TM誌の表紙の作り。
 *   2. **極端な字間。** WAVE の字間は 26。読みやすさより間の造形を採る。
 *   3. **太さの階段の罫。** 0.6 から 14 まで9本。ヴァインガルトの署名。
 *   4. **網点の拡大。** 写真製版のアミを、点が見える大きさまで引き伸ばす。
 *      点の径を位置の関数で変えているので、拡大した「写真」に見える。
 *   5. **版の掛け合わせ。** 青のアミ・赤の帯・黄の面を multiply で重ねる。
 *      オフセットで版が重なると出る紫と緑を、意図して作っている。
 *   6. **行を途中で落とす。** 1行の後半だけベースラインを下げる。
 */
import { ATLAS, rad } from "@/lib/plate";

const P = "nw";
const PAPER = "#f2f0ea";
const INK = "#111111";
const RED = "#e8462a";
const BLUE = "#2f6fd0";
const YELLOW = "#f2c200";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* 破られる側の格子。6段組・10行。スイスの版面と同じ寸法を使う */
const M = 44;
const COLW = 74;
const GUT = 12;
const col = (i: number) => M + i * (COLW + GUT);

/* 網点の径。位置の関数で決めるので、拡大した写真のアミに見える */
const dotR = (x: number, y: number) =>
  4.6 * Math.max(0.06, 0.55 + 0.45 * Math.sin(x * 0.016 + Math.cos(y * 0.021) * 1.7));

export default function Plate() {
  const dots: { x: number; y: number; r: number }[] = [];
  for (let y = 296; y <= 508; y += 9.5) {
    for (let x = 26; x <= 448; x += 9.5) {
      dots.push({ x, y, r: dotR(x, y) });
    }
  }

  /* 太さの階段。等比ではなく、手で決めた9段 */
  const RULES = [0.6, 1, 1.6, 2.4, 3.4, 5, 7, 10, 14];

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ニュー・ウェーブ・デザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <clipPath id={`${P}-screen`}>
          <rect x="26" y="292" width="426" height="220" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 破られる側の格子。薄く、しかし確かに見えるように ───── */}
        <g stroke={BLUE} strokeWidth="0.7" opacity="0.16">
          {Array.from({ length: 6 }, (_, i) => (
            <g key={`c${i}`}>
              <line x1={col(i)} y1="0" x2={col(i)} y2="800" />
              <line x1={col(i) + COLW} y1="0" x2={col(i) + COLW} y2="800" />
            </g>
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`r${i}`} x1="0" y1={44 + i * 71} x2="600" y2={44 + i * 71} />
          ))}
        </g>

        {/* ── 題字。2段の階段。下の段は右へ送り、字間を開く ─────── */}
        <text x={M} y="124" fill={INK} fontFamily={SANS} fontSize="76" fontWeight="800" letterSpacing="-2.5">
          NEW
        </text>
        <text x="152" y="202" fill={INK} fontFamily={SANS} fontSize="76" fontWeight="800" letterSpacing="26">
          WAVE
        </text>
        <rect x={M} y="220" width={516} height="0.9" fill={INK} />

        {/* ── 段送り。3行を右へ送りながら字間を開き、最後は版面の外へ ── */}
        <g fill={INK} fontFamily={SANS} fontSize="13" fontWeight="700">
          <text x={M} y="248" letterSpacing="3.2">SCHRIFT</text>
          <text x={M + 34} y="266" letterSpacing="8.4">RASTER</text>
          <text x={M + 68} y="284" letterSpacing="15.5">BEWEGUNG</text>
        </g>

        {/* ── 拡大した網点。青の版 ──────────────────────────── */}
        <g clipPath={`url(#${P}-screen)`} transform="rotate(-7 240 400)">
          <g fill={BLUE} style={{ mixBlendMode: "multiply" }} opacity="0.92">
            {dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} />
            ))}
          </g>
        </g>

        {/* ── 黄の面。網点に掛けて緑を作る ─────────────────── */}
        <rect
          x="352" y="286" width="196" height="86" fill={YELLOW}
          transform="rotate(-7 450 329)" style={{ mixBlendMode: "multiply" }}
        />

        {/* ── 赤の帯。逆の傾きで交差させ、重なりに紫を出す ────── */}
        <rect
          x="-40" y="452" width="700" height="72" fill={RED} opacity="0.9"
          transform="rotate(14 300 488)" style={{ mixBlendMode: "multiply" }}
        />
        {/* 帯の中の白抜き。帯と一緒に傾ける */}
        <text
          x="70" y="500" fill={PAPER} fontFamily={SANS} fontSize="20" fontWeight="800" letterSpacing="9"
          transform="rotate(14 300 488)"
        >
          KEIN RASTER
        </text>

        {/* ── 太さの階段の罫。9本 ──────────────────────────── */}
        <g fill={INK}>
          {RULES.reduce<{ y: number; els: React.ReactElement[] }>(
            (acc, w, i) => {
              acc.els.push(<rect key={i} x={M} y={acc.y} width={252} height={w} />);
              acc.y += w + 9;
              return acc;
            },
            { y: 566, els: [] },
          ).els}
        </g>
        <text x={M} y="562" fill={INK} fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2.2" opacity="0.7">
          0,6 — 14 PT
        </text>

        {/* ── 行の途中でベースラインを落とす ─────────────────── */}
        <text x="330" y="580" fill={INK} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="2">
          WEING
        </text>
        <text x="404" y="594" fill={RED} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="2">
          ART
        </text>

        {/* 黒帯。斜めに走らせ、白で抜く */}
        <g transform="rotate(-5 300 672)">
          <rect x="-30" y="646" width="700" height="52" fill={INK} />
          <text x="60" y="680" fill={PAPER} fontFamily={SANS} fontSize="21" fontWeight="800" letterSpacing="11">
            TM 6 / 1978
          </text>
        </g>

        {/* 黄の小口と、段を降りる小四角。版面の隅に律動を置く */}
        <rect x="330" y="714" width="44" height="44" fill={YELLOW} />
        <g fill={INK}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={392 + i * 13} y={716 + i * 5} width="8" height="8" />
          ))}
        </g>

        {/* 縦組み。右の余白を字間で埋める */}
        <text
          transform="translate(578 560) rotate(-90)"
          fill={INK} fontFamily={SANS} fontSize="10" fontWeight="700" letterSpacing="7.5"
        >
          BASEL — SCHULE
        </text>

        <text x={M} y="784" fill={INK} fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="2.2" opacity="0.72">
          DAS RASTER IST SICHTBAR, ABER NIEMAND STEHT DARAUF
        </text>

        {/* 紙の目。オフセットの上質紙なので細かく薄く */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.11"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
