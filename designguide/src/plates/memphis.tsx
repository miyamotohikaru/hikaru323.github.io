/**
 * メンフィス（ミラノ、1981—1987）。
 *
 * ソットサスたちが「良い趣味」を壊すために作った幾何の衝突。
 * 隣の anti-design が「場面」なのに対し、こちらは「面」で組む。
 * 物語を持たない図形が、脈絡なくぶつかって重なるだけ。
 * 場面にした瞬間にラディカル・デザインの領分に戻ってしまう。
 *
 * ■ この様式でなければ成立しない4つ
 *   1. バクテリオ。ソットサスのメラミン化粧板の落書き模様。
 *      黒い蚯蚓が白地を這う。これが写っていればメンフィス。
 *   2. テラゾー。色の紙吹雪を樹脂に流し込んだ人造石。
 *      メンフィスの床と天板はほぼこれ。
 *   3. 傾いた柱。垂直に立てない。必ず10〜20度倒して、
 *      支えるべき物を支えないように置く。
 *   4. 太い黒のジグザグと、うねる1本線。
 *
 * ■ 隣の kitsch / maximalism と分けるために
 *   ・地の余白を残す（マキシマリズムは余白を殺す）
 *   ・光沢や飾りを付けない（キッチュは艶と装飾で押す）
 *   ・原色4色と黒だけ。中間色を作らない。ベタで塗る。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "mph";

const CREAM = "#f6f2e8";
const PINK = "#f2385a";
const TEAL = "#36c9c6";
const YELLOW = "#f5c400";
const INK = "#1b1b1b";

export default function Plate() {
  const r = rand(19811201);

  /* バクテリオ。1タイルに蚯蚓を8匹 */
  const bacterio = Array.from({ length: 9 }, () => {
    const x = r(-6, 66);
    const y = r(-6, 66);
    const a = r(-40, 40);
    const w = r(10, 22);
    const h = r(6, 15);
    return `M${x.toFixed(1)} ${y.toFixed(1)} c ${(w * 0.4).toFixed(1)} ${(-h).toFixed(1)} ${(w * 0.7).toFixed(1)} ${h.toFixed(1)} ${w.toFixed(1)} ${a.toFixed(1) === "0" ? 0 : (a / 12).toFixed(1)} c ${(w * 0.3).toFixed(1)} ${(-h * 0.8).toFixed(1)} ${(w * 0.8).toFixed(1)} ${(h * 1.2).toFixed(1)} ${(w * 1.1).toFixed(1)} ${(h * 0.2).toFixed(1)}`;
  });

  /* テラゾー。色の紙吹雪 */
  const chips = Array.from({ length: 44 }, () => {
    const x = r(0, 120);
    const y = r(0, 120);
    const s = r(2.6, 8);
    const c = [PINK, TEAL, YELLOW, INK, INK][Math.floor(r(0, 5))];
    const pts = Array.from({ length: 5 }, (_, k) => {
      const a = (k / 5) * Math.PI * 2 + r(-0.4, 0.4);
      const rr = s * r(0.5, 1.2);
      return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
    }).join(" ");
    return { pts, c };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="メンフィスデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* バクテリオ */}
        <pattern id={`${P}-bact`} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="#ffffff" />
          <g stroke={INK} strokeWidth="5.5" fill="none" strokeLinecap="round">
            {bacterio.map((d, i) => <path key={i} d={d} />)}
          </g>
        </pattern>

        {/* テラゾー */}
        <pattern id={`${P}-terr`} width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="#fbf8f0" />
          {chips.map((c, i) => <polygon key={i} points={c.pts} fill={c.c} />)}
        </pattern>

        {/* 太い斜め縞 */}
        <pattern id={`${P}-stripe`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="26" height="26" fill="#ffffff" />
          <rect width="13" height="26" fill={INK} />
        </pattern>

        {/* 細かい点の格子 */}
        <pattern id={`${P}-dot`} width="15" height="15" patternUnits="userSpaceOnUse">
          <rect width="15" height="15" fill={CREAM} />
          <circle cx="7.5" cy="7.5" r="3" fill={INK} />
        </pattern>

        <clipPath id={`${P}-col`}>
          <rect x="118" y="196" width="86" height="440" rx="43" transform="rotate(-13 161 416)" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={CREAM} />

        {/* ── 天の帯。太い黒のジグザグ ─────────────────────── */}
        <path
          d={`M-20 62 ${Array.from({ length: 9 }, (_, i) => `L${-20 + (i + 1) * 76} ${i % 2 ? 62 : 24}`).join(" ")}`}
          stroke={INK} strokeWidth="9" fill="none" strokeLinejoin="miter"
        />
        <text x="40" y="112" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" fontWeight="700" letterSpacing="4.4">
          MILANO · 1981—1987
        </text>

        {/* ── 図形の衝突。順に重ねる ──────────────────────── */}

        {/* 黄の三角。右上から降ってくる */}
        <polygon points="352,138 596,168 428,368" fill={YELLOW} />
        <polygon points="352,138 596,168 428,368" fill="none" stroke={INK} strokeWidth="3.5" />

        {/* 点格子の四角。傾ける */}
        <rect x="404" y="132" width="118" height="118" fill={`url(#${P}-dot)`} transform="rotate(11 463 191)" />
        <rect x="404" y="132" width="118" height="118" fill="none" stroke={INK} strokeWidth="3.5" transform="rotate(11 463 191)" />

        {/* バクテリオの四角。ソットサスの化粧板 */}
        <rect x="44" y="150" width="170" height="170" fill={`url(#${P}-bact)`} transform="rotate(-7 129 235)" />
        <rect x="44" y="150" width="170" height="170" fill="none" stroke={INK} strokeWidth="4" transform="rotate(-7 129 235)" />

        {/* 桃の円。半分だけ黄で塗り分ける */}
        <circle cx="330" cy="326" r="104" fill={PINK} />
        <path d="M330 222 A 104 104 0 0 1 330 430 Z" fill={YELLOW} />
        <circle cx="330" cy="326" r="104" fill="none" stroke={INK} strokeWidth="4" />

        {/* 傾いた柱。垂直に立てない。支えるべき物を支えない */}
        <g>
          <rect x="118" y="196" width="86" height="440" rx="43" fill={`url(#${P}-stripe)`} transform="rotate(-13 161 416)" />
          <rect x="118" y="196" width="86" height="440" rx="43" fill="none" stroke={INK} strokeWidth="4" transform="rotate(-13 161 416)" />
          {/* 柱頭。青緑の輪 */}
          {/* 柱頭。回転後の頭の位置に合わせる。ずれると輪が宙に浮く */}
          <ellipse cx="112" cy="201" rx="52" ry="19" fill={TEAL} transform="rotate(-13 112 201)" />
          <ellipse cx="112" cy="201" rx="52" ry="19" fill="none" stroke={INK} strokeWidth="4" transform="rotate(-13 112 201)" />
        </g>

        {/* 青緑の帯。柱を貫いて右へ */}
        <rect x="196" y="452" width="416" height="46" fill={TEAL} transform="rotate(-6 404 475)" />
        <rect x="196" y="452" width="416" height="46" fill="none" stroke={INK} strokeWidth="4" transform="rotate(-6 404 475)" />

        {/* 桃の細い棒。1本だけ直交させる */}
        <rect x="474" y="286" width="22" height="230" fill={PINK} transform="rotate(17 485 401)" />
        <rect x="474" y="286" width="22" height="230" fill="none" stroke={INK} strokeWidth="3.5" transform="rotate(17 485 401)" />

        {/* 青緑の輪。左下の空きを受ける。ここが空くと重心が右へ寄る */}
        <circle cx="92" cy="536" r="58" fill="none" stroke={TEAL} strokeWidth="20" />
        <circle cx="92" cy="536" r="68" fill="none" stroke={INK} strokeWidth="3.5" />
        <circle cx="92" cy="536" r="48" fill="none" stroke={INK} strokeWidth="3.5" />
        {/* 桃の小さな板。輪に立てかける */}
        <rect x="122" y="556" width="64" height="64" fill={PINK} transform="rotate(-24 154 588)" />
        <rect x="122" y="556" width="64" height="64" fill="none" stroke={INK} strokeWidth="3.5" transform="rotate(-24 154 588)" />

        {/* うねる1本線。版面を横に断ち切る */}
        <path
          d="M-20 396 C 60 340 96 456 176 400 C 250 348 292 462 372 404 C 444 352 490 458 560 400 C 588 378 606 384 620 396"
          stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round"
        />

        {/* 黄の半円。地の帯の上に載せる */}
        <path d="M420 618 A 78 78 0 0 1 576 618 Z" fill={YELLOW} />
        <path d="M420 618 A 78 78 0 0 1 576 618 Z" fill="none" stroke={INK} strokeWidth="4" />

        {/* 小さな階段。近くで見る細部 */}
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={44 + i * 26} y={618 - (i + 1) * 22} width="26" height={(i + 1) * 22} fill={i % 2 ? TEAL : CREAM} stroke={INK} strokeWidth="3" />
          ))}
        </g>

        {/* ── 地の帯。テラゾー ────────────────────────────── */}
        <rect y="618" width="600" height="182" fill={`url(#${P}-terr)`} />
        <line x1="0" y1="618" x2="600" y2="618" stroke={INK} strokeWidth="7" />

        {/* 題字。白い札を傾けて置く */}
        <g transform="rotate(-4 300 712)">
          <rect x="42" y="654" width="404" height="94" fill="#ffffff" />
          <rect x="42" y="654" width="404" height="94" fill="none" stroke={INK} strokeWidth="4" />
          <text x="62" y="726" fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="62" fontWeight="800" letterSpacing="-1">
            MEMPHIS
          </text>
          <circle cx="418" cy="678" r="9" fill={PINK} stroke={INK} strokeWidth="3" />
        </g>

        {/* 紙吹雪。地の帯の外にも数枚だけ散らす */}
        {Array.from({ length: 12 }, (_, i) => {
          const x = r(0, 600);
          const y = r(120, 600);
          const c = [PINK, TEAL, YELLOW][Math.floor(r(0, 3))];
          return <circle key={i} cx={x} cy={y} r={r(3, 7)} fill={c} stroke={INK} strokeWidth="2" />;
        })}

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.13" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
