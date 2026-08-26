/**
 * ポップアート。
 *
 * 大衆の複製物を、そのまま美術の高さへ持ち上げる。
 * リキテンスタインは新聞漫画の1コマを拡大し、印刷の網点まで手で描いた。
 * ウォーホルは同じ図版を色だけ替えて何枚も刷った。
 * この版は両方を1枚に入れる。上＝拡大された1コマ、下＝色替えの反復。
 *
 * ■ この版でやっていること
 *   1. 網点を「絵の要素」として描く。肌は白地に朱の点、髪の陰は黄地に黒の点。
 *      写真の階調ではなく、印刷所の都合がそのまま絵柄になっている状態。
 *   2. 輪郭は太い黒1本。太さを変えない。漫画の主線と同じ規格。
 *   3. 原色のベタ。中間色を作らない。黄・朱・青・白・黒の5つだけで組む。
 *   4. 下段は同じ版を色替えで3度。ウォーホルの反復。
 *      版ズレをわざと4px 残し、機械が刷ったものであることを見せる。
 *
 * ■ 注意
 *   網点の上に ATLAS.rough を掛けない。点が崩れて落書きになる
 *   （risograph.tsx の注意書きと同じ）。この版は歪みフィルタを一切使わない。
 */
import { ATLAS } from "@/lib/plate";

const P = "pa";

const YELLOW = "#f2e600";
const RED = "#e8194b";
const BLUE = "#1a4fd0";
const WHITE = "#ffffff";
const INK = "#111111";

type Skin = { bg: string; hair: string; skin: string; dot: string | null; lip: string };

/**
 * 顔ひとつ。506×446 の局所座標で描く。
 * 上のコマにも下の反復にも同じ関数を使う。「同じ版で刷る」ことが要点。
 */
function Head({ c, dots }: { c: Skin; dots?: string }) {
  /* 顔と髪の外形。
     初稿は髪を「画面いっぱいの黄色から顔をくり抜いた面」にしたので、
     地の青が1px も見えず、頭が禿げた卵に見えた。
     髪は帯として持たせ、外側に地を残す。ここが漫画の頭の作り方 */
  const FACE =
    "M258 90 C 332 104 374 166 382 250 C 390 318 378 390 352 452 L160 452 C 134 390 122 318 130 250 C 138 166 184 76 258 90 Z";
  const HAIR =
    "M46 458 C 22 350 28 210 98 128 C 152 64 224 30 300 34 C 384 38 452 88 478 178 C 502 262 498 368 476 458" +
    " L352 458 C 378 390 390 318 382 250 C 374 166 332 104 258 90 C 184 76 138 166 130 250" +
    " C 122 318 134 390 160 458 Z";
  /* 目鼻口は初稿の顔（中心255・半幅147・天44・高408）に合わせて描いてある。
     顔を小さくしたぶんを、まとめて1つの変換で追い込む */
  const FEAT = "translate(252 90) scale(0.884 0.887) translate(-255 -44)";
  return (
    <g>
      <rect x="-4" y="-4" width="514" height="454" fill={c.bg} />
      {/* 地の抜き。青の隅に白い星形の閃きを1つ。漫画の背景処理 */}
      <path d="M470 62 L482 26 L492 62 L524 70 L492 80 L482 114 L470 80 L440 70 Z" fill={c.skin} opacity="0.9" />
      {/* 髪。帯として持つ */}
      <path d={HAIR} fill={c.hair} />
      {/* 髪の房。帯の中を、頭頂から裾まで一筆で流す。
         初稿は短い塊を並べたので、髪ではなくヘッドホンの枠に見えた。
         漫画の髪は「長い一本の帯が細りながら落ちる」形で描く */}
      <g fill={INK}>
        <path d="M186 52 C 122 92 84 176 74 264 C 64 348 68 410 80 458 L56 458 C 42 402 38 338 48 254 C 60 158 104 68 172 26 Z" />
        <path d="M232 44 C 168 84 128 172 118 262 C 110 344 114 412 124 458 L106 458 C 94 408 90 340 100 252 C 112 156 156 66 222 24 Z" />
        <path d="M336 44 C 400 84 440 172 450 262 C 458 344 454 412 444 458 L462 458 C 474 408 478 340 468 252 C 456 156 412 66 346 24 Z" />
        <path d="M386 56 C 442 98 476 178 484 264 C 492 348 488 410 478 458 L500 458 C 512 402 514 338 504 254 C 494 160 452 74 400 32 Z" />
        {/* 分け目。頭頂に短く2本 */}
        <path d="M262 30 C 240 44 226 66 218 92 L232 98 C 240 74 252 54 272 40 Z" />
        <path d="M294 30 C 316 44 330 66 338 92 L324 98 C 316 74 304 54 284 40 Z" />
      </g>
      {/* 髪の陰。共有の網点をそのまま fill に使う（黒の点） */}
      {dots && (
        <g opacity="0.55">
          <path d="M46 458 C 22 360 26 244 62 168 L86 184 C 54 258 50 366 72 458 Z" fill={`url(#${ATLAS.halftone})`} />
          <path d="M476 458 C 500 360 496 248 462 172 L438 190 C 470 262 474 366 452 458 Z" fill={`url(#${ATLAS.halftone})`} />
        </g>
      )}
      <path d={HAIR} fill="none" stroke={INK} strokeWidth="7" />

      {/* 顔。白地 */}
      <path d={FACE} fill={c.skin} />
      {/* 網点。肌の階調は点の密度だけで作る */}
      {dots && (
        <g mask={`url(#${dots})`}>
          <path d={FACE} fill={c.dot ?? RED} />
        </g>
      )}
      {/* 頬の陰。点をもう一枚重ねて濃くする */}
      {dots && (
        <g mask={`url(#${dots})`}>
          <path d="M130 262 C 138 340 150 404 168 452 L238 452 C 200 400 170 336 158 256 Z" fill={c.dot ?? RED} opacity="0.85" />
        </g>
      )}
      <path d={FACE} fill="none" stroke={INK} strokeWidth="7" />

      <g transform={FEAT}>
        {/* 左目 */}
        <g>
          <path d="M144 232 C 172 198 236 198 264 232 C 236 264 172 264 144 232 Z" fill={WHITE} stroke={INK} strokeWidth="5" />
          <circle cx="206" cy="231" r="22" fill={BLUE} />
          <circle cx="206" cy="231" r="10" fill={INK} />
          <circle cx="198" cy="222" r="6" fill={WHITE} />
          {/* 上瞼。太く黒く。ここが漫画の目の要 */}
          <path d="M140 234 C 170 190 240 190 268 234 C 240 208 170 208 140 234 Z" fill={INK} />
          <g fill={INK}>
            <path d="M142 224 L120 204 L134 216 Z" />
            <path d="M160 208 L146 184 L172 204 Z" />
            <path d="M196 200 L192 174 L212 198 Z" />
            <path d="M234 202 L244 180 L248 204 Z" />
          </g>
          <path d="M130 178 C 168 150 240 148 278 168 L272 184 C 236 166 168 168 136 194 Z" fill={INK} />
        </g>

        {/* 右目 */}
        <g>
          <path d="M330 226 C 356 196 414 196 438 226 C 414 256 356 256 330 226 Z" fill={WHITE} stroke={INK} strokeWidth="5" />
          <circle cx="386" cy="225" r="20" fill={BLUE} />
          <circle cx="386" cy="225" r="9" fill={INK} />
          <circle cx="379" cy="217" r="5.4" fill={WHITE} />
          <path d="M326 228 C 354 188 418 188 442 228 C 416 204 354 204 326 228 Z" fill={INK} />
          <g fill={INK}>
            <path d="M330 216 L312 196 L324 210 Z" />
            <path d="M350 200 L340 176 L362 198 Z" />
            <path d="M386 194 L384 170 L400 192 Z" />
          </g>
          <path d="M320 174 C 356 146 424 146 456 166 L450 182 C 418 162 356 162 326 190 Z" fill={INK} />
        </g>

        {/* 鼻。線1本と小さな穴 */}
        <path d="M286 288 C 300 318 300 336 282 344 C 274 348 264 344 260 338" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="276" cy="342" rx="7" ry="4" fill={INK} />

        {/* 唇。朱のベタに黒の主線と白のハイライト */}
        <g>
          <path
            d="M196 388 C 226 372 250 380 262 386 C 274 380 300 372 328 388 C 314 424 288 442 262 442 C 236 442 210 424 196 388 Z"
            fill={c.lip}
            stroke={INK}
            strokeWidth="6"
          />
          <path d="M196 388 C 230 398 294 398 328 388" fill="none" stroke={INK} strokeWidth="5" />
          <path d="M216 404 C 232 412 248 414 258 412 C 244 418 226 414 216 404 Z" fill={WHITE} />
        </g>

        {/* 涙。青1粒。漫画の記号 */}
        <g>
          <path d="M154 300 C 166 320 172 332 172 342 C 172 354 162 362 152 362 C 142 362 132 354 132 342 C 132 332 142 318 154 300 Z" fill={BLUE} stroke={INK} strokeWidth="4.5" />
          <ellipse cx="146" cy="342" rx="6" ry="8" fill={WHITE} opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

const MAIN: Skin = { bg: BLUE, hair: YELLOW, skin: WHITE, dot: RED, lip: RED };
const REPEATS: Skin[] = [
  { bg: RED, hair: BLUE, skin: YELLOW, dot: null, lip: WHITE },
  { bg: YELLOW, hair: RED, skin: WHITE, dot: null, lip: BLUE },
  { bg: BLUE, hair: WHITE, skin: YELLOW, dot: null, lip: RED },
];

export default function Plate() {
  /* コマの内側。ここに顔を原寸で置く */
  const PX = 34;
  const PY = 34;
  const PW = 532;
  const PH = 468;
  const BR = 8; // コマ罫の太さ
  const IW = PW - BR * 2;
  const IH = PH - BR * 2;
  const K = IW / 506;

  /* 下段の反復 */
  const RW = 170;
  const RH = 142;
  const RY = 524;

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ポップアート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 網点のマスク。ATLAS.halftone と同じ 8px・45度なので目が揃う。
            共有の網点は黒の点なのでマスクには使えない（黒＝隠す）。
            白い点の版をここで1つだけ持つ */}
        <pattern id={`${P}-dw`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="4" cy="4" r="2.5" fill="#fff" />
        </pattern>
        <mask id={`${P}-dots`}>
          <rect width="600" height="800" fill={`url(#${P}-dw)`} />
        </mask>
        <clipPath id={`${P}-panel`}>
          <rect x={PX + BR} y={PY + BR} width={IW} height={IH} />
        </clipPath>
        {REPEATS.map((_, i) => (
          <clipPath key={`rc${i}`} id={`${P}-r${i}`}>
            <rect x={34 + i * 181 + 5} y={RY + 5} width={RW - 10} height={RH - 10} />
          </clipPath>
        ))}
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={WHITE} />

        {/* ── 拡大された1コマ ─────────────────────────────────────── */}
        <rect x={PX} y={PY} width={PW} height={PH} fill={INK} />
        <g clipPath={`url(#${P}-panel)`}>
          <g transform={`translate(${PX + BR} ${PY + BR}) scale(${K})`}>
            <Head c={MAIN} dots={`${P}-dots`} />
          </g>

          {/* 台詞の枠。コマの左上。漫画のナレーション */}
          <g>
            <rect x={PX + BR + 12} y={PY + BR + 12} width="252" height="70" fill={WHITE} stroke={INK} strokeWidth="4" />
            <text x={PX + BR + 26} y={PY + BR + 40} fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="16" fontWeight="700" letterSpacing="0.4">
              I DON&#39;T CARE — I&#39;D
            </text>
            <text x={PX + BR + 26} y={PY + BR + 62} fill={INK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="16" fontWeight="700" letterSpacing="0.4">
              RATHER PRINT IT TWICE!
            </text>
          </g>

        </g>

        {/* ── 下段。同じ版を色だけ替えて3度刷る ────────────────────── */}
        {REPEATS.map((c, i) => {
          const x = 34 + i * 181;
          const off = [0, 4, -3][i];
          return (
            <g key={`rp${i}`}>
              <rect x={x} y={RY} width={RW} height={RH} fill={INK} />
              <g clipPath={`url(#${P}-r${i})`}>
                {/* 色版。主版より 4px ずれて刷られている */}
                <g transform={`translate(${x + 5 + off} ${RY + 5 + Math.abs(off) * 0.7}) scale(${(RW - 10) / 506})`}>
                  <Head c={c} />
                </g>
              </g>
              {/* 刷り順の番号。近くで見る細部 */}
              <rect x={x + RW - 26} y={RY + RH - 20} width="20" height="14" fill={WHITE} />
              <text x={x + RW - 16} y={RY + RH - 9} fill={INK} textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="10" fontWeight="700">
                {i + 2}
              </text>
            </g>
          );
        })}

        {/* ── 題字。黄のベタに黒 ───────────────────────────────────── */}
        <rect x="34" y="686" width="532" height="82" fill={YELLOW} />
        <rect x="34" y="686" width="532" height="82" fill="none" stroke={INK} strokeWidth="8" />
        <text
          x="52" y="748"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="56"
          fontWeight="800"
          letterSpacing="-2"
        >
          POP ART
        </text>
        <text
          x="322" y="722"
          fill={INK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.6"
        >
          BEN-DAY DOTS — 4 COLOUR
        </text>
        <text
          x="322" y="740"
          fill={RED}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.6"
        >
          EDITION OF ONE MILLION
        </text>
        {/* 印刷所の色玉 */}
        <g>
          {[YELLOW, RED, BLUE, INK].map((c, i) => (
            <g key={`sw${i}`}>
              <rect x={322 + i * 26} y={748} width="20" height="12" fill={c} stroke={INK} strokeWidth="1.6" />
            </g>
          ))}
        </g>
        {/* 網点の見本。近くで見ると点が見える */}
        <g mask={`url(#${P}-dots)`}>
          <rect x="440" y="748" width="112" height="12" fill={RED} />
        </g>
        <rect x="440" y="748" width="112" height="12" fill="none" stroke={INK} strokeWidth="1.6" />

        {/* 新聞紙の粒。網点の上なので歪ませない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.16"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
