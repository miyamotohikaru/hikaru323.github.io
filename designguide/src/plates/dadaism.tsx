/**
 * ダダイズム。
 *
 * チューリヒのキャバレー・ヴォルテール。版面の破壊が主題なので、
 * 「構図がない絵」を描くのではなく、**壊す前の秩序が見えている絵**を描く。
 * 活版の込め物・罫・書体見本が、殴られて散らばっている状態にする。
 *
 * ■ この様式でしか成立しない仕掛け
 *   1. **一語のなかで書体を混ぜる。** DADA の4文字が、セリフ／サンセリフ／
 *      タイプライタ／イタリックで、大きさも傾きもベースラインも全部違う。
 *      これは活字箱から手当たりしだいに拾って組んだ、という意味の絵。
 *   2. **貼り込み。** 紙片を切って（破って）貼る。縁をぎざぎざにし、
 *      下にわずかな影を落とす。影がないと「色の四角」にしか見えない。
 *   3. **罫の太さを揃えない。** 髪罫・3ポ・12ポを、揃えずに引く。
 *   4. **逆さまの行と縦の行を入れる。** 読ませる気がない、という宣言。
 *   5. 小さな文字は「読める内容」ではなく、細い横棒の列で組む。
 *      遠目には新聞、近寄ると棒。コラージュの地に貼る紙はこう見える。
 *
 * ■ 気をつけたこと
 *   散らかっているだけの絵にしないため、黒い太罫を1本、版面の上三分の一に
 *   水平近く（−4度）で通してある。この1本があるので、他の全部が「ずれている」
 *   と見える。初稿はこの罫がなく、ただの散らかりだった。
 */
import type { ReactElement } from "react";
import { ATLAS, rand } from "@/lib/plate";

const P = "dd";
const PAPER = "#e8e4d8";
const INK = "#161616";
const RED = "#c62828";
const GREY = "#7a7a7a";
const WHITE = "#f5f5f5";
const PAPER_D = "#d6d1c1"; // 地の紙より一段沈んだ紙片
const GREY_L = "#c2bdb1";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', ui-monospace, monospace";

/** 破った紙の縁。直線の各辺を細かく揺らす */
function torn(x: number, y: number, w: number, h: number, seed: number, amp = 4) {
  const r = rand(seed);
  const pts: string[] = [];
  const step = 14;
  for (let i = 0; i <= w; i += step) pts.push(`${x + i},${(y + r(-amp, amp)).toFixed(1)}`);
  for (let i = 0; i <= h; i += step) pts.push(`${(x + w + r(-amp, amp)).toFixed(1)},${y + i}`);
  for (let i = w; i >= 0; i -= step) pts.push(`${x + i},${(y + h + r(-amp, amp)).toFixed(1)}`);
  for (let i = h; i >= 0; i -= step) pts.push(`${(x + r(-amp, amp)).toFixed(1)},${y + i}`);
  return pts.join(" ");
}

/** 貼り込んだ紙片。影を1枚下に敷かないと「色の四角」に見える */
function Scrap({
  x, y, w, h, rot, fill, seed, amp, children,
}: {
  x: number; y: number; w: number; h: number; rot: number; fill: string; seed: number; amp?: number;
  children?: ReactElement | ReactElement[];
}) {
  const pts = torn(x, y, w, h, seed, amp);
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <polygon points={pts} fill={INK} opacity="0.16" transform="translate(3 4)" />
      <polygon points={pts} fill={fill} />
      {children}
    </g>
  );
}

/** 新聞の段。読める文字ではなく細い横棒の列で組む。遠目には文章に見える */
function Lines({
  x, y, w, rows, lh, seed, fill = INK, th = 2.6, op = 0.62,
}: { x: number; y: number; w: number; rows: number; lh: number; seed: number; fill?: string; th?: number; op?: number }) {
  const r = rand(seed);
  return (
    <g fill={fill} opacity={op}>
      {Array.from({ length: rows }, (_, i) => (
        <rect key={i} x={x} y={y + i * lh} width={w * r(0.62, 1)} height={th} />
      ))}
    </g>
  );
}

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ダダイズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 貼り込んだ紙片。地をまず壊す ─────────────────────── */}
        {/* 紙片は必ず重ねる。並べて置くと「2枚の四角」になって貼り込みに見えない */}
        <Scrap x={34} y={30} w={290} h={170} rot={-9} fill={WHITE} seed={11}>
          <Lines x={52} y={56} w={252} rows={9} lh={13} seed={12} />
        </Scrap>
        <Scrap x={268} y={78} w={250} h={142} rot={6} fill={GREY_L} seed={13}>
          <Lines x={284} y={102} w={212} rows={6} lh={16} seed={14} th={3.4} op={0.5} />
        </Scrap>
        {/* 赤の小片。ピカビアの雑誌『391』。赤を天に1点だけ上げて版面を吊る */}
        <Scrap x={468} y={22} w={106} h={60} rot={-15} fill={RED} seed={19} amp={3}>
          <text
            x={521} y={64} fill={WHITE} fontFamily={MONO} fontSize="34" fontWeight="700"
            textAnchor="middle" letterSpacing="1"
          >
            391
          </text>
        </Scrap>
        {/* 写真の切れ端。フォトモンタージュはダダの発明した技法なので、
            紙片のうち1枚は文字ではなく網点の「機械の写真」にしてある */}
        <Scrap x={412} y={298} w={162} h={136} rot={6} fill={WHITE} seed={15}>
          <g>
            <rect x={422} y={308} width={142} height={116} fill={GREY} />
            <rect x={422} y={308} width={142} height={116} fill={`url(#${ATLAS.halftone})`} opacity="0.5" />
            <g fill={INK} opacity="0.92">
              <circle cx={478} cy={368} r={30} fill="none" stroke={INK} strokeWidth="7" />
              <circle cx={478} cy={368} r={8} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (Math.PI / 5) * i;
                return (
                  <rect
                    key={i}
                    x={478 - 2.5}
                    y={368 - 34}
                    width={5}
                    height={16}
                    transform={`rotate(${(i * 36).toFixed(0)} 478 368)`}
                  />
                );
              })}
              <rect x={524} y={316} width={36} height={9} />
              <rect x={524} y={332} width={22} height={9} />
            </g>
          </g>
        </Scrap>
        <Scrap x={30} y={596} w={214} h={176} rot={4} fill={PAPER_D} seed={17} />

        {/* ── 罫。太さを揃えない。この一番太い1本だけが版面を束ねる ── */}
        <g fill={INK}>
          <rect x="18" y="228" width="452" height="1.2" />
          <rect x="-20" y="246" width="470" height="17" transform="rotate(-4 215 254)" />
          <rect x="206" y="286" width="400" height="5" transform="rotate(-1.5 406 288)" />
          <rect x="300" y="652" width="300" height="9" transform="rotate(3 450 656)" />
          <rect x="34" y="700" width="236" height="2" />
          <rect x="34" y="707" width="236" height="2" />
        </g>
        {/* 太罫は帯として使う。初稿は帯の下に文字を置いて、行が食われて事故に見えた。
            いまは帯の中に白で抜いてある。活版なら当たり前の逃げ方 */}
        <text
          x="34" y="260" fill={WHITE} fontFamily={SANS} fontSize="11" fontWeight="700" letterSpacing="6.2"
          transform="rotate(-4 215 254)"
        >
          CABARET VOLTAIRE
        </text>

        {/* ── 題字。4文字が全部ちがう活字。ここが絵の主題 ──────── */}
        {/* A は黒い版から白抜き。切り抜いて貼ったように見せる */}
        <rect x="146" y="352" width="142" height="156" fill={INK} transform="rotate(7 217 430)" />
        <text
          x="40" y="472" fill={INK} fontFamily={SERIF} fontSize="148" fontWeight="700"
          transform="rotate(-5 40 472)"
        >
          D
        </text>
        <text
          x="150" y="494" fill={WHITE} fontFamily={SANS} fontSize="196" fontWeight="800"
          transform="rotate(7 150 494)"
        >
          A
        </text>
        <text
          x="296" y="444" fill={RED} fontFamily={MONO} fontSize="136" fontWeight="700"
          transform="rotate(-16 296 444)"
        >
          D
        </text>
        <text
          x="350" y="524" fill={INK} fontFamily={SERIF} fontSize="172" fontWeight="700" fontStyle="italic"
          transform="rotate(3 350 524)"
        >
          A
        </text>

        {/* ── 揃わない小さな行 ───────────────────────────────── */}
        <text x="24" y="214" fill={RED} fontFamily={MONO} fontSize="13" fontWeight="700" letterSpacing="1.5"
              transform="rotate(1 24 214)">
          ZURICH — 5. II. 1916
        </text>
        <text x="42" y="306" fill={INK} fontFamily={SANS} fontSize="9" fontWeight="600" letterSpacing="17"
              opacity="0.7">
          NICHTS
        </text>
        {/* 込め物（活字の隙間を埋める鉛の四角）を、そのまま版面に出しておく */}
        <g fill={INK} opacity="0.85" transform="rotate(-3 300 322)">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={252 + i * 15} y={314} width={9} height={9} />
          ))}
        </g>
        <text x="60" y="592" fill={INK} fontFamily={SERIF} fontSize="27" fontStyle="italic"
              transform="rotate(-3 60 592)">
          was ist dada?
        </text>
        {/* 逆さまの行。読ませる気がない、という宣言。
            初稿は消印と、次稿では指と重なって潰れた。いま両方の間に置いてある */}
        <text x="316" y="700" fill={INK} fontFamily={SANS} fontSize="15" fontWeight="700" letterSpacing="1.2"
              transform="rotate(180 390 695)" opacity="0.85">
          UND WARUM NICHT
        </text>
        {/* 縦の行 */}
        <text transform="translate(586 560) rotate(-90)" fill={INK} fontFamily={SANS}
              fontSize="15" fontWeight="800" letterSpacing="9">
          MERZ
        </text>

        {/* ── 活版の指（マニキュール）。
               初稿は ATLAS.bleed を掛けたら溶けて塊になった。
               活字の版下は輪郭が立っていないと絵にならないので、外した ── */}
        <g transform="rotate(-7 268 686)">
          <g fill={INK}>
            <rect x="212" y="662" width="26" height="50" rx="2" />
            <rect x="236" y="659" width="46" height="55" rx="17" />
            <rect x="272" y="669" width="64" height="17" rx="8.5" />
            <rect x="268" y="690" width="32" height="13" rx="6.5" />
            <rect x="266" y="702" width="26" height="11" rx="5.5" />
            <rect x="246" y="646" width="32" height="15" rx="7.5" transform="rotate(-28 246 653)" />
          </g>
          <g stroke={PAPER} strokeWidth="1.5" opacity="0.9" fill="none">
            <line x1="219" y1="666" x2="219" y2="708" />
            <line x1="227" y1="664" x2="227" y2="710" />
            <line x1="272" y1="688" x2="300" y2="688" />
            <line x1="270" y1="700" x2="292" y2="700" />
          </g>
        </g>

        {/* ── 消印。赤い版を2度、わずかにずらして押す ───────────── */}
        <g transform="rotate(13 492 692)">
          {[0, 1].map((k) => (
            <g key={k} transform={k ? "translate(3 -2)" : undefined} opacity={k ? 0.32 : 1}>
              <circle cx="492" cy="692" r="54" fill="none" stroke={RED} strokeWidth="4" />
              <circle cx="492" cy="692" r="44" fill="none" stroke={RED} strokeWidth="1.4" />
              <text x="492" y="686" fill={RED} fontFamily={SANS} fontSize="26" fontWeight="800"
                    textAnchor="middle" letterSpacing="1.5">
                DADA
              </text>
              <text x="492" y="706" fill={RED} fontFamily={SANS} fontSize="8" fontWeight="700"
                    textAnchor="middle" letterSpacing="2.6">
                GEPRUFT
              </text>
            </g>
          ))}
        </g>

        {/* 小さな段。斜めに貼り込んだ紙の上に組む */}
        <Lines x={52} y={624} w={172} rows={8} lh={12} seed={21} op={0.55} />
        <g transform="rotate(6 150 748)">
          <Lines x={54} y={730} w={168} rows={3} lh={11} seed={22} op={0.45} />
        </g>

        {/* 奥付。版面のいちばん下に、ようやく整った行を1本だけ置く */}
        <text x="34" y="788" fill={INK} fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2.2"
              opacity="0.7">
          TZARA — BALL — ARP — HUELSENBECK — JANCO
        </text>

        {/* ざら紙。ビラは上質紙には刷らない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.24"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
