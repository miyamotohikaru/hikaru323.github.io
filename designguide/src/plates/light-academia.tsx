/**
 * ライト・アカデミア。
 *
 * ダーク・アカデミアの明るい側。だが**同じ絵の色違いにしてはいけない**。
 * 向こうが「夜・蝋燭・革・重さ」なら、こちらは「昼・窓・紙・軽さ」。
 * わびさび／ジャパンディとも隣り合うので、ベージュの静物にも落とせない。
 *
 * ■ この絵の骨。他の8枚が持っていないものを2つ入れる
 *   1. **斜めの光**。窓の桟の影ごと、版面を左上から右下へ斜めに横切らせる。
 *      この群で唯一、画面全体を貫く斜線がある絵にした。
 *      静かな5枚が全部「水平と垂直」なので、これだけで別の様式に見える。
 *   2. **手書きの筆跡**。便箋を3枚重ね、細い揺れた線で字を埋める。
 *      罫線ではなく「語」の切れ目を作る。ここが一番の質感で、
 *      近くで見て持つ細部でもある。
 *   3. 地は机（#ddd1bb）、便箋は紙（#f4efe4）。同じ明度にすると
 *      紙が机に溶けるので、必ず2段の差をつける。
 *   4. 乾いた花を1枝、封蝋をひとつ。乾いた花は緑を使わない。
 *      枯れ色（#a8917a）で描くのがライト・アカデミア。
 *
 * ■ 失敗して直したところ
 *   初稿は便箋を平らに並べただけで、ジャパンディの静けさと区別がつかなかった。
 *   斜めの光を1枚かぶせ、紙を扇に開いて影を付けた瞬間に、
 *   「午後の机」という時間が入った。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "la";
const DESK = "#ddd1bb";
const SHEET = "#f4efe4";
const MID = "#a8917a";
const IRON = "#6b5c48";
const INK = "#302a22";

/** 窓の桝目。2列×3段。左上から右下へ流す */
const PANES: [number, number][] = [
  [24, -110], [252, -110],
  [24, 138], [252, 138],
  [24, 386], [252, 386],
];

/** 手書きの一行。語に切って、上下に少し揺らす */
function scriptLine(x0: number, x1: number, y: number, seed: number) {
  const r = rand(seed);
  const words: string[] = [];
  let x = x0;
  while (x < x1) {
    const w = r(15, 46);
    if (x + w > x1) break;
    let d = `M ${x.toFixed(1)} ${(y + r(-0.8, 0.8)).toFixed(1)}`;
    const steps = Math.max(2, Math.round(w / 7));
    for (let i = 1; i <= steps; i++) {
      const px = x + (w / steps) * i;
      d += ` Q ${(px - w / steps / 2).toFixed(1)} ${(y + r(-2.6, 2.6)).toFixed(1)} ${px.toFixed(1)} ${(y + r(-1.2, 1.2)).toFixed(1)}`;
    }
    words.push(d);
    /* たまに上へ伸びる字（l・h）と下へ抜ける字（g・y）を混ぜる */
    if (r() > 0.62) words.push(`M ${(x + w * 0.4).toFixed(1)} ${(y - 1).toFixed(1)} L ${(x + w * 0.46).toFixed(1)} ${(y - r(4, 7)).toFixed(1)}`);
    if (r() > 0.78) words.push(`M ${(x + w * 0.7).toFixed(1)} ${y.toFixed(1)} L ${(x + w * 0.66).toFixed(1)} ${(y + r(4, 7)).toFixed(1)}`);
    x += w + r(5, 10);
  }
  return words;
}

/** 便箋1枚 */
function Sheet({ x, y, w, h, rot, seed, lines, head }: {
  x: number; y: number; w: number; h: number; rot: number; seed: number; lines: number; head?: boolean;
}) {
  const r = rand(seed);
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 3} y={y + 5} width={w} height={h} fill={IRON} opacity="0.16" />
      <rect x={x} y={y} width={w} height={h} fill={SHEET} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={MID} strokeWidth="0.7" opacity="0.5" />
      {head && (
        <g>
          <text x={x + w / 2} y={y + 40} textAnchor="middle" fill={IRON}
                fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" letterSpacing="4.6">
            EPISTOLA
          </text>
          <line x1={x + w * 0.28} y1={y + 52} x2={x + w * 0.72} y2={y + 52}
                stroke={MID} strokeWidth="0.9" />
        </g>
      )}
      <g stroke={IRON} strokeWidth="0.85" fill="none" strokeLinecap="round" opacity="0.62">
        {Array.from({ length: lines }, (_, i) => {
          const yy = y + (head ? 78 : 40) + i * 21;
          if (yy > y + h - 60) return null;
          /* 段落の最後の行だけ短くする。全部同じ長さだと罫線に見える */
          const short = r() > 0.78;
          /* 行ごとにわずかに傾ける。全行が水平だと方眼の模様に見える */
          const tilt = r(-0.9, 0.9);
          return (
            <g key={i} transform={`rotate(${tilt.toFixed(2)} ${x + w / 2} ${yy})`}>
              {scriptLine(x + 22, x + w - (short ? r(60, 130) : 22), yy, seed * 31 + i).map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
          );
        })}
      </g>
      {/* 署名。字を大きく、傾けて */}
      <g stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65"
         transform={`rotate(-4 ${x + w * 0.6} ${y + h - 40})`}>
        {scriptLine(x + w * 0.42, x + w - 30, y + h - 40, seed * 7).slice(0, 4).map((d, k) => (
          <path key={k} d={d} transform="scale(1.25 1.6)"
                style={{ transformOrigin: `${x + w * 0.42}px ${y + h - 40}px` }} />
        ))}
      </g>
    </g>
  );
}

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ライト・アカデミア様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* 光の縁をわずかに溶かす。硬い矩形のままだと紙を切ったように見える */}
        <filter id={`${P}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${P}-soft2`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        {/* 窓の桝目。ここを抜いた所だけ光が当たる */}
        <mask id={`${P}-win`}>
          <rect width="600" height="800" fill="#ffffff" />
          <g transform="translate(300 400) rotate(-27) skewX(-13) translate(-300 -400)">
            {PANES.map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="206" height="226" fill="#000000"
                    filter={`url(#${P}-soft)`} />
            ))}
          </g>
        </mask>
        {/* 机。奥がわずかに沈む */}
        <linearGradient id={`${P}-desk`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#e4dac6" />
          <stop offset="1" stopColor="#d3c6ae" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={DESK} />
        <rect width="600" height="800" fill={`url(#${P}-desk)`} />
        {/* 机の木目。細く、まばらに */}
        <g stroke={MID} strokeWidth="0.7" opacity="0.2">
          {Array.from({ length: 16 }, (_, i) => {
            const r = rand(400 + i);
            const y = 20 + i * 50;
            return <path key={i} d={`M 0 ${y} Q 300 ${y + r(-14, 14)} 600 ${y + r(-10, 10)}`} fill="none" />;
          })}
        </g>

        {/* ── 便箋を扇に開く。3枚 ───────────────────────────── */}
        <Sheet x={54} y={182} w={286} h={392} rot={-11} seed={91} lines={13} />
        <Sheet x={252} y={224} w={288} h={396} rot={9} seed={57} lines={13} />
        <Sheet x={142} y={252} w={302} h={412} rot={-2} seed={23} lines={14} head />

        {/* ── 乾いた花。緑を使わないのがライト・アカデミア ─────── */}
        <g transform="translate(10 68) rotate(-24 350 610)">
          <path d="M228 612 Q300 604 418 608" stroke={MID} strokeWidth="1.8" fill="none" />
          {Array.from({ length: 7 }, (_, i) => {
            const x = 246 + i * 26;
            const up = i % 2 === 0;
            return (
              <g key={i}>
                <path d={`M${x} 610 q ${up ? 8 : 6} ${up ? -14 : 14} ${up ? 20 : 16} ${up ? -18 : 18}`}
                      stroke={MID} strokeWidth="1.1" fill="none" />
                <ellipse cx={x + (up ? 21 : 17)} cy={610 + (up ? -19 : 19)} rx="8" ry="4.2"
                         fill="#c0ab90" stroke={MID} strokeWidth="0.7"
                         transform={`rotate(${up ? -38 : 38} ${x + (up ? 21 : 17)} ${610 + (up ? -19 : 19)})`} />
              </g>
            );
          })}
          {/* 乾いた頭花。3つ。花弁は反り返らせる */}
          {[[240, 604], [330, 596], [416, 606]].map(([cx, cy], i) => (
            <g key={i}>
              {Array.from({ length: 8 }, (_, k) => (
                <ellipse key={k} cx={cx} cy={cy - 10} rx="3.4" ry="9" fill="#e2d6bf" stroke={MID}
                         strokeWidth="0.7" transform={`rotate(${k * 45} ${cx} ${cy})`} />
              ))}
              <circle cx={cx} cy={cy} r="5" fill={MID} />
            </g>
          ))}
        </g>

        {/* 封蝋。赤は5色にないので、鉄色の蝋にした */}
        <g transform="translate(452 668) rotate(-12)">
          <ellipse cx="2" cy="4" rx="25" ry="23" fill={INK} opacity="0.2" />
          <path d="M-24 0 q4 -22 24 -24 q22 2 24 24 q-4 22 -24 24 q-22 -2 -24 -24 Z" fill={IRON} />
          <path d="M-19 -2 q3 -17 19 -19 q17 2 19 19 q-3 17 -19 19 q-17 -2 -19 -19 Z"
                fill="none" stroke="#54483a" strokeWidth="1.2" />
          <text x="0" y="7" textAnchor="middle" fill="#e6ddca"
                fontFamily="Georgia, 'Times New Roman', serif" fontSize="19" opacity="0.85">A</text>
        </g>

        {/* ── 窓からの斜めの光 ───────────────────────────────
            初稿は「明るい帯」と「桟の影の帯」を足して描いたので、
            灰色のテープを斜めに貼ったように見えた。
            2稿では逆にした。全面に薄い影を敷き、窓の桝目だけを
            マスクで抜く。当たっている所は紙のまま、外れた所が沈む */}
        <rect width="600" height="800" fill={IRON} opacity="0.15" mask={`url(#${P}-win)`} />
        <g transform="translate(300 400) rotate(-27) skewX(-13) translate(-300 -400)">
          {PANES.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="206" height="226" fill="#fffbef"
                  opacity="0.42" filter={`url(#${P}-soft)`} />
          ))}
        </g>

        {/* ── 文字 ───────────────────────────────────────────── */}
        <text x="300" y="98" textAnchor="middle" fill={INK}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" letterSpacing="7.5">
          LIGHT ACADEMIA
        </text>
        <line x1="182" y1="118" x2="418" y2="118" stroke={IRON} strokeWidth="0.9" opacity="0.55" />
        <text x="300" y="140" textAnchor="middle" fill={IRON}
              fontFamily="Georgia, 'Times New Roman', serif" fontSize="10"
              fontStyle="italic" letterSpacing="4.2" opacity="0.8">
          dum spiro, spero
        </text>
        <text x="42" y="770" fill={IRON} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="9" letterSpacing="3" opacity="0.6">
          THREE LETTERS, UNSENT — AFTERNOON, WEST WINDOW
        </text>
        <text x="558" y="770" textAnchor="end" fill={IRON} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="9" letterSpacing="3" opacity="0.5">IV · XV</text>

        {/* 上質紙の目。ざら紙にすると軽さが消える */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.15"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
