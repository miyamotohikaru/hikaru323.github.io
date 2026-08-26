/**
 * ニューモーフィズム。
 *
 * 2019–2021。地と物が同じ色。形は「凸」と「凹」だけで出す。
 * 光は左上から一方向。凸なら左上に白、右下に灰。凹ならその逆が内側に出る。
 * 色を1つも足さずに立体を作る、という一点だけで成立している様式。
 *
 * ■ ここで作っている「らしさ」
 *   1. 影が必ず2枚あること。白い影（ハイライト）と灰の影が対になって
 *      はじめて「同色の地から盛り上がった」ように見える。片方だけだと
 *      ただの落ち影になり、マテリアルの紙と区別がつかなくなる。
 *   2. 凹（インセット）が内側に影を持つこと。外側の影を反転させるのでは
 *      なく、輪郭からはみ出した分を切り落として内側に置く必要がある。
 *      feComposite operator="out" でそれをやっている。
 *   3. 版面に色が1色しか無いこと。#5a6b8c を弧1本と小さな註にだけ使い、
 *      それ以外は全部 #e6e7ee のまま。彩度を足すと粘土（クレイ）になる。
 *
 * ■ 初稿の失敗
 *   丸いダイヤルを主役にしたら、隣のスキューモーフィズムの計器と
 *   同じ絵になった。主役を「浮き文字と沈み文字」に変えて、
 *   凸と凹を同じ版面で読み比べさせる形にした。
 *   下段の断面は、なぜ凸は左上が明るく、凹は左上が暗いのかの説明。
 */
import { ATLAS, shift, onCircle } from "@/lib/plate";

const P = "nm";
const BG = "#e6e7ee";
const LIGHT = "#ffffff";
const SHADE = shift("#c8cad4", -0.2); // #c8cad4 のままでは地に沈んで影に見えない
const ACCENT = "#5a6b8c";
const INK = "#3a3f52";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** 凸。白い影を左上へ、灰の影を右下へ。距離とぼかしで高さが決まる */
const Out = ({ id, d, b }: { id: string; d: number; b: number }) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceAlpha" stdDeviation={b} result="g" />
    <feOffset in="g" dx={d} dy={d} result="do" />
    <feFlood floodColor={SHADE} floodOpacity="0.95" result="dc" />
    <feComposite in="dc" in2="do" operator="in" result="dark" />
    <feOffset in="g" dx={-d} dy={-d} result="lo" />
    <feFlood floodColor={LIGHT} floodOpacity="1" result="lc" />
    <feComposite in="lc" in2="lo" operator="in" result="lite" />
    <feMerge>
      <feMergeNode in="dark" />
      <feMergeNode in="lite" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

/** 凹。同じ2枚を輪郭の内側だけに残す。out で外へはみ出した分を捨てる */
const In = ({ id, d, b }: { id: string; d: number; b: number }) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
    <feOffset in="SourceAlpha" dx={d} dy={d} result="d1" />
    <feGaussianBlur in="d1" stdDeviation={b} result="d2" />
    <feComposite in="SourceAlpha" in2="d2" operator="out" result="dsh" />
    <feFlood floodColor={SHADE} floodOpacity="1" result="dc" />
    <feComposite in="dc" in2="dsh" operator="in" result="dark" />
    <feOffset in="SourceAlpha" dx={-d} dy={-d} result="l1" />
    <feGaussianBlur in="l1" stdDeviation={b} result="l2" />
    <feComposite in="SourceAlpha" in2="l2" operator="out" result="lsh" />
    <feFlood floodColor={LIGHT} floodOpacity="1" result="lc" />
    <feComposite in="lc" in2="lsh" operator="in" result="lite" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="lite" />
      <feMergeNode in="dark" />
    </feMerge>
  </filter>
);

/* 断面。地の高さと、凸／凹の深さ */
const SY = 596;

export default function Plate() {
  /* ダイヤルの弧。ここだけが版面で唯一の彩度 */
  const arc = (() => {
    const [x1, y1] = onCircle(444, 252, 76, -142);
    const [x2, y2] = onCircle(444, 252, 76, 58);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A 76 76 0 1 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  })();

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ニューモーフィズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <Out id={`${P}-out-l`} d={9} b={7} />
        <Out id={`${P}-out-m`} d={7} b={6} />
        <Out id={`${P}-out-s`} d={4} b={3.4} />
        <In id={`${P}-in-l`} d={9} b={8} />
        <In id={`${P}-in-m`} d={6} b={5} />
        <In id={`${P}-in-s`} d={3.4} b={3} />
        {/* 弧のにじみ。彩度のあるものは必ず柔らかく光る */}
        <filter id={`${P}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={BG} />

        {/* 天の小さな註。版面で色が付くのはここと弧だけ */}
        <text x="48" y="70" fill={ACCENT} fontFamily={SANS} fontSize="9" fontWeight="700" letterSpacing="3.4">
          SOFT UI — 2019–2021
        </text>
        <g filter={`url(#${P}-in-s)`}>
          <rect x="48" y="86" width="504" height="5" rx="2.5" fill={BG} />
        </g>

        {/* ── 主役。同じ言葉を、浮かせたものと沈めたもので組む ────── */}
        <g filter={`url(#${P}-out-m)`}>
          <text
            x="48" y="302" fill={BG}
            fontFamily={SANS} fontSize="120" fontWeight="800" letterSpacing="-5"
          >
            NEU
          </text>
        </g>
        <g filter={`url(#${P}-in-m)`}>
          <text
            x="52" y="370" fill={BG}
            fontFamily={SANS} fontSize="40" fontWeight="800" letterSpacing="5"
          >
            MORPHISM
          </text>
        </g>

        {/* ── 円盤。凸の中に凹を彫り、その溝に色を1本流す ─────────── */}
        <g filter={`url(#${P}-out-l)`}>
          <circle cx="444" cy="252" r="110" fill={BG} />
        </g>
        <g filter={`url(#${P}-in-m)`}>
          <path
            d={`M 444 ${252 - 76} a 76 76 0 1 0 0.1 0 Z`}
            fill="none" stroke={BG} strokeWidth="16"
          />
        </g>
        <path d={arc} fill="none" stroke={ACCENT} strokeWidth="12" strokeLinecap="round" opacity="0.34" filter={`url(#${P}-glow)`} />
        <path d={arc} fill="none" stroke={ACCENT} strokeWidth="9" strokeLinecap="round" opacity="0.92" />
        <g filter={`url(#${P}-out-m)`}>
          <circle cx="444" cy="252" r="46" fill={BG} />
        </g>
        {/* つまみの指標。凹の細い溝。弧の先を指す */}
        <g filter={`url(#${P}-in-s)`} transform="rotate(58 444 252)">
          <rect x="440.5" y="216" width="7" height="22" rx="3.5" fill={BG} />
        </g>

        {/* 彫った罫。ここから下は註 */}
        <g filter={`url(#${P}-in-s)`}>
          <rect x="48" y="440" width="504" height="5" rx="2.5" fill={BG} />
        </g>

        {/* ── 状態の見本。凸・凹・無 ───────────────────────────── */}
        <text x="48" y="478" fill={ACCENT} fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2.6">
          THREE STATES
        </text>
        {([
          ["RAISED", `${P}-out-m`, 48],
          ["INSET", `${P}-in-m`, 144],
          ["FLAT", "", 240],
        ] as const).map(([name, f, x]) => (
          <g key={name}>
            {f ? (
              <g filter={`url(#${f})`}>
                <rect x={x} y="496" width="76" height="76" rx="22" fill={BG} />
              </g>
            ) : (
              /* 影を1枚も置かないと、同色なので本当に何も見えない。
                 それがこの様式の限界そのものなので、点線だけ残して示す */
              <rect
                x={x} y="496" width="76" height="76" rx="22"
                fill={BG} stroke={ACCENT} strokeWidth="1" strokeDasharray="3 4" opacity="0.42"
              />
            )}
            <text
              x={x + 38} y="596" textAnchor="middle" fill={INK} opacity="0.55"
              fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.6"
            >
              {name}
            </text>
          </g>
        ))}
        <text x="48" y="622" fill={INK} opacity="0.4" fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.4">
          NO SHADOW MEANS NO SHAPE AT ALL
        </text>

        {/* ── 断面。なぜ凸は左上が明るく、凹は左上が暗いのか ─────── */}
        <text x="356" y="478" fill={ACCENT} fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2.6">
          SECTION
        </text>
        {/* 光の向き。この矢印1本が版面ぜんたいの前提 */}
        <g stroke={INK} strokeWidth="1.2" opacity="0.5">
          <line x1="352" y1="500" x2="380" y2="528" />
          <path d="M380 528 L372 526.5 L378 520.5 Z" fill={INK} stroke="none" />
        </g>
        <text x="356" y="498" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.4">
          LIGHT
        </text>
        {/* 地の断面。左に凸、右に凹 */}
        <path
          d={`M 356 ${SY} H 392 C 404 ${SY} 398 ${SY - 30} 422 ${SY - 30}
              C 446 ${SY - 30} 440 ${SY} 452 ${SY} H 484
              C 496 ${SY} 490 ${SY + 30} 514 ${SY + 30}
              C 538 ${SY + 30} 532 ${SY} 544 ${SY} H 556`}
          fill="none" stroke={INK} strokeWidth="1.6" opacity="0.32"
        />
        {/* 光の当たる面は白、影になる面は灰。凸と凹で左右が入れ替わる */}
        <g fill="none" strokeWidth="4.6" strokeLinecap="round">
          <path d={`M 392 ${SY} C 404 ${SY} 398 ${SY - 30} 422 ${SY - 30}`} stroke={LIGHT} />
          <path d={`M 422 ${SY - 30} C 446 ${SY - 30} 440 ${SY} 452 ${SY}`} stroke={SHADE} />
          <path d={`M 484 ${SY} C 496 ${SY} 490 ${SY + 30} 514 ${SY + 30}`} stroke={SHADE} />
          <path d={`M 514 ${SY + 30} C 538 ${SY + 30} 532 ${SY} 544 ${SY}`} stroke={LIGHT} />
        </g>
        <text x="422" y={SY - 40} textAnchor="middle" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4">
          RAISED
        </text>
        <text x="514" y={SY + 44} textAnchor="middle" fill={INK} opacity="0.5" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4">
          INSET
        </text>

        {/* ── 締め。刷り色は3つしかない ─────────────────────────── */}
        <g filter={`url(#${P}-in-s)`}>
          <rect x="48" y="668" width="504" height="5" rx="2.5" fill={BG} />
        </g>
        <text x="48" y="706" fill={INK} opacity="0.8" fontFamily={SANS} fontSize="12" fontWeight="600" letterSpacing="0.6">
          The surface never changes colour. Only the light does.
        </text>
        {([
          [LIGHT, "#FFFFFF", "HIGHLIGHT"],
          [BG, "#E6E7EE", "SURFACE"],
          [SHADE, "#A0A2AA", "SHADOW"],
        ] as const).map(([c, hex, name], i) => (
          <g key={hex} transform={`translate(${48 + i * 132} 730)`}>
            <g filter={`url(#${P}-out-s)`}>
              <rect x="0" y="0" width="34" height="20" rx="6" fill={c} />
            </g>
            <text x="44" y="10" fill={INK} opacity="0.62" fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.2">
              {hex}
            </text>
            <text x="44" y="20" fill={INK} opacity="0.36" fontFamily={SANS} fontSize="7" fontWeight="600" letterSpacing="1.2">
              {name}
            </text>
          </g>
        ))}
        <text
          x="552" y="706" textAnchor="end" fill={ACCENT} opacity="0.72"
          fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2"
        >
          ONE HUE · TWO SHADOWS
        </text>

        {/* 紙の目。柔らかい影を濁らせないよう、ごく薄く */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.1"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
