/**
 * バイオメカニカル・アート（H.R.ギーガー）。
 *
 * 生体と機械が見分けられないところまで融合した器官。
 * この群で唯一「暗くて、密で、左右対称」な一枚。
 * ダーク・アカデミアも暗いが、あちらは**光源のある部屋**、
 * こちらは**光源の分からない標本**。艶の出方でそこを分ける。
 *
 * ■ この絵の骨
 *   1. **左右対称**。右半分だけを組み、`scale(-1 1)` で折り返す。
 *      ギーガーの器官は必ず正中線を持つ。これが無いと、ただの機械の絵になる。
 *   2. **エアブラシ＝なめらかな線形グラデーション**。
 *      面ごとに「暗い縁 → 明るい峰 → 暗い縁」を通す。平らな塗りを一箇所も使わない。
 *      峰の位置を全部同じにすると金属パイプの束に見えるので、少しずつずらす。
 *   3. **節（せつ）**。背骨・肋・管を全部「繰り返す小さな単位」で作る。
 *      連続した節が生き物と機械の両方を同時に思わせる。
 *   4. 明部（#c9c4b8）は**縁の細い線にだけ**使う。面に置くと肌が白くなり、
 *      たちまち安っぽいクロムになる。
 *
 * ■ 失敗して直したところ
 *   初稿は背骨を1本立てただけで、余白が真っ黒に空いて寂しかった。
 *   背景を縦の畝（うね）で埋め、肋と管を版面の端まで伸ばして
 *   「隙間なく詰まっている」状態にしたら、ようやくギーガーになった。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "bio";
const VOID = "#14161a";
const STEEL = "#4a5058";
const PALE = "#8a8f96";
const DEEP = "#2a2f36";
const BONE = "#c9c4b8";

const AX = 300; // 正中線

/** 節のある管。経路上に楕円を並べ、接線に沿って倒す */
function hose(
  p0: [number, number], p1: [number, number], p2: [number, number],
  n: number, r0: number, r1: number,
) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
    const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
    const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    return { x, y, r: r0 + (r1 - r0) * t, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  });
}

/** 肋。付け根が太く、先が細る */
function rib(y0: number, len: number, drop: number, w: number) {
  const x0 = AX + 26;
  const x1 = AX + len;
  return (
    `M ${x0} ${y0 - w / 2}` +
    ` C ${x0 + len * 0.42} ${y0 - w / 2 - 16}, ${x1 - 44} ${y0 + drop * 0.36}, ${x1} ${y0 + drop}` +
    ` L ${x1 - 9} ${y0 + drop + 7}` +
    ` C ${x1 - 54} ${y0 + drop * 0.42}, ${x0 + len * 0.36} ${y0 + w / 2 + 10}, ${x0} ${y0 + w / 2} Z`
  );
}

/** 椎骨。角を落とした六角 */
const vert = (cy: number, w: number, h: number) =>
  `M ${AX - w / 2} ${cy} L ${AX - w / 2 + 15} ${cy - h / 2} L ${AX + w / 2 - 15} ${cy - h / 2}` +
  ` L ${AX + w / 2} ${cy} L ${AX + w / 2 - 15} ${cy + h / 2} L ${AX - w / 2 + 15} ${cy + h / 2} Z`;

export default function Plate() {
  const r = rand(1976);

  /* 背骨。上ほど小さく、腰で最大になる */
  const spine = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return {
      cy: 316 + i * 33,
      w: 92 + Math.sin(t * Math.PI) * 62,
      h: 25 + t * 5,
    };
  });

  /* ── 右半分。これを折り返して左を作る ────────────────────── */
  const HALF = (
    <g>
      {/* 肋。6本。下へ行くほど長く、深く垂れる */}
      {[[352, 176, 96, 30], [412, 208, 108, 32], [472, 236, 116, 33],
        [532, 250, 112, 31], [590, 236, 96, 28], [644, 206, 74, 24]].map(([y0, len, drop, w], i) => (
        <g key={`rib${i}`}>
          <path d={rib(y0, len, drop, w)} fill={`url(#${P}-rib)`} />
          {/* 稜。肋の背にだけ細い明部を通す */}
          <path d={rib(y0, len, drop, w * 0.24)} fill={BONE} opacity="0.16" />
          <path d={rib(y0, len, drop, w)} fill="none" stroke="#0c0e11" strokeWidth="1.2" opacity="0.85" />
        </g>
      ))}

      {/* 大きな管。頭の後ろから出て、外へ垂れる */}
      {hose([AX + 40, 250], [AX + 210, 300], [AX + 258, 700], 26, 25, 9).map((s, i) => (
        <g key={`h1${i}`} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
          <ellipse rx={s.r * 0.62} ry={s.r} fill={`url(#${P}-seg)`} />
          <ellipse rx={s.r * 0.62} ry={s.r} fill="none" stroke="#0c0e11" strokeWidth="1" opacity="0.7" />
          <ellipse cx={-s.r * 0.2} rx={s.r * 0.12} ry={s.r * 0.72} fill={BONE} opacity="0.15" />
        </g>
      ))}
      {/* 細い管。もう1本、内側を通す */}
      {hose([AX + 30, 300], [AX + 128, 430], [AX + 150, 754], 22, 13, 5).map((s, i) => (
        <g key={`h2${i}`} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
          <ellipse rx={s.r * 0.6} ry={s.r} fill={`url(#${P}-seg)`} />
          <ellipse rx={s.r * 0.6} ry={s.r} fill="none" stroke="#0c0e11" strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
      {/* 締め金。管を2箇所で留める。近くで見て持つ細部 */}
      {[[AX + 168, 372, -62], [AX + 244, 566, -80]].map(([x, y, a], i) => (
        <g key={`cl${i}`} transform={`translate(${x} ${y}) rotate(${a})`}>
          <rect x="-9" y="-30" width="18" height="60" rx="4" fill={`url(#${P}-band)`} />
          <rect x="-9" y="-30" width="18" height="60" rx="4" fill="none" stroke="#0c0e11" strokeWidth="1" />
          <circle cx="0" cy="-20" r="2.6" fill="#0c0e11" />
          <circle cx="0" cy="20" r="2.6" fill="#0c0e11" />
        </g>
      ))}
      {/* 初稿はここに長い腱を7本流したが、器官の上を横切る蜘蛛の巣に見えた。
          肋と背骨のあいだを繋ぐ短い筋だけに変える */}
      <g fill="none" stroke={PALE} strokeWidth="1.2" opacity="0.2">
        {[352, 412, 472, 532, 590, 644].map((y, i) => (
          <path key={i} d={`M ${AX + 26} ${y} Q ${AX + 62} ${y + 22} ${AX + 96} ${y + 30}`} />
        ))}
      </g>
    </g>
  );

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="バイオメカニカル・アート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* エアブラシの筒。暗い縁 → 明るい峰 → 暗い縁。用途ごとに峰をずらす */}
        <linearGradient id={`${P}-rib`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1114" />
          <stop offset="0.28" stopColor={STEEL} />
          <stop offset="0.46" stopColor="#989ea6" />
          <stop offset="0.68" stopColor={DEEP} />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
        <linearGradient id={`${P}-seg`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0c0e11" />
          <stop offset="0.3" stopColor="#4e545c" />
          <stop offset="0.46" stopColor="#7f858d" />
          <stop offset="0.72" stopColor="#22262c" />
          <stop offset="1" stopColor="#0a0c0f" />
        </linearGradient>
        <linearGradient id={`${P}-vert`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d0f12" />
          <stop offset="0.2" stopColor="#5b626b" />
          <stop offset="0.38" stopColor="#adb2b8" />
          <stop offset="0.56" stopColor="#5b626b" />
          <stop offset="0.8" stopColor="#22262c" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id={`${P}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#191c21" />
          <stop offset="0.4" stopColor="#8f959c" />
          <stop offset="1" stopColor="#15181c" />
        </linearGradient>
        <linearGradient id={`${P}-wall`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b0d10" />
          <stop offset="0.45" stopColor="#3a4048" />
          <stop offset="0.62" stopColor="#565d66" />
          <stop offset="1" stopColor="#0a0c0f" />
        </linearGradient>
        {/* 頭。上から回り込む艶 */}
        <radialGradient id={`${P}-dome`} cx="0.36" cy="0.24" r="0.86">
          <stop offset="0" stopColor="#b8bdc3" />
          <stop offset="0.34" stopColor="#6e747c" />
          <stop offset="0.7" stopColor={DEEP} />
          <stop offset="1" stopColor="#0b0d10" />
        </radialGradient>
        {/* 空洞 */}
        <radialGradient id={`${P}-hole`} cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#000000" />
          <stop offset="0.72" stopColor="#0e1013" />
          <stop offset="1" stopColor="#2b3037" />
        </radialGradient>
        {/* 四隅を沈める */}
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.44" r="0.62">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.62" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.72" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={VOID} />

        {/* ── 背景の畝。隙間なく縦に詰める ─────────────────── */}
        <g opacity="0.72">
          {(() => {
            const out = [];
            let x = -10;
            let i = 0;
            while (x < 610) {
              const w = r(9, 26);
              out.push(
                <rect key={i} x={x} y={-10} width={w - 2} height="820" fill={`url(#${P}-wall)`}
                      opacity={r(0.45, 1)} />,
              );
              x += w;
              i++;
            }
            return out;
          })()}
        </g>
        {/* 畝の途中に横の節を通す。縦だけだと簾に見える。
            初稿は両端の y を別々に振ったので、版面を斜めに横切る
            蜘蛛の巣になった。必ず水平にする */}
        <g>
          {Array.from({ length: 20 }, (_, i) => {
            const y = r(0, 800);
            return (
              <g key={i}>
                <line x1="-10" y1={y} x2="610" y2={y} stroke="#07090b" strokeWidth="3" opacity="0.7" />
                <line x1="-10" y1={y + 2.4} x2="610" y2={y + 2.4} stroke={PALE} strokeWidth="0.8" opacity="0.1" />
              </g>
            );
          })}
        </g>

        {/* 空洞。奥に2つ。
            検分で直したところ：初稿はここが「黒く塗った楕円＋細い縁」
            だけだったので、器官ではなく耳当てに見えていた。
            穴が穴に見えるには、中に**奥行き**と、縁に**分節**が要る。
              ・同心の環を消失点へ寄せながら縮めて、奥へ抜ける筒にする
              ・縁に放射の節を回す。機械の絞りにも、生き物の口にも読める形 */}
        <ellipse cx="112" cy="238" rx="76" ry="98" fill={`url(#${P}-hole)`} />
        <ellipse cx="488" cy="238" rx="76" ry="98" fill={`url(#${P}-hole)`} />
        {[112, 488].map((cx) => {
          const dir = cx < AX ? 1 : -1;   // 消失点は正中側へ寄せる
          return (
            <g key={cx}>
              {/* 縁の節。外縁から内へ食い込む楔。上側を明るくする */}
              {Array.from({ length: 26 }, (_, i) => {
                const a = (i / 26) * Math.PI * 2;
                const ox = Math.cos(a);
                const oy = Math.sin(a);
                const x0 = cx + ox * 76;
                const y0 = 238 + oy * 98;
                const x1 = cx + ox * 64;
                const y1 = 238 + oy * 82;
                const tx = -oy * 7.4;
                const ty = ox * 5.6;
                return (
                  <polygon
                    key={`s${i}`}
                    points={`${x0 + tx},${y0 + ty} ${x0 - tx},${y0 - ty} ${x1 - tx * 0.34},${y1 - ty * 0.34} ${x1 + tx * 0.34},${y1 + ty * 0.34}`}
                    fill={i % 2 ? DEEP : STEEL}
                    opacity={oy < 0 ? 0.72 : 0.38}
                  />
                );
              })}
              {/* 奥へ抜ける筒 */}
              {Array.from({ length: 6 }, (_, i) => {
                const t = (i + 1) / 7;
                const k = 0.78 * (1 - t * 0.8);
                return (
                  <ellipse
                    key={`t${i}`}
                    cx={cx + dir * 26 * t} cy={238 - 22 * t}
                    rx={76 * k} ry={98 * k}
                    fill="none" stroke={PALE} strokeWidth={1.7 - i * 0.2}
                    opacity={0.22 - i * 0.03}
                  />
                );
              })}
              {/* 筒の底。ここだけ完全に潰す */}
              <ellipse cx={cx + dir * 24} cy="218" rx="8" ry="10" fill="#04060a" />
              {/* 縁。上側に明部、下側に暗部を回すと、塗り潰しではなく穴に見える */}
              <path d={`M ${cx - 76} 238 A 76 98 0 0 1 ${cx + 76} 238`} fill="none" stroke="#0a0c0f"
                    strokeWidth="6" opacity="0.9" />
              <path d={`M ${cx - 74} 232 A 74 96 0 0 1 ${cx + 74} 232`} fill="none" stroke={BONE}
                    strokeWidth="1.4" opacity="0.22" />
              <path d={`M ${cx - 76} 238 A 76 98 0 0 0 ${cx + 76} 238`} fill="none" stroke={PALE}
                    strokeWidth="2.4" opacity="0.18" />
              <ellipse cx={cx} cy="238" rx="76" ry="98" fill="none" stroke="#0a0c0f" strokeWidth="1.4" />
            </g>
          );
        })}

        {/* ── 器官。右半分を組み、折り返す ─────────────────── */}
        {HALF}
        <g transform="translate(600 0) scale(-1 1)">{HALF}</g>

        {/* ── 正中線の上のもの ─────────────────────────────── */}
        {/* 背骨 */}
        {spine.map((v, i) => (
          <g key={`v${i}`}>
            <path d={vert(v.cy, v.w, v.h)} fill={`url(#${P}-vert)`} />
            <path d={vert(v.cy, v.w, v.h)} fill="none" stroke="#0a0c0f" strokeWidth="1.4" />
            {/* 峰の細い明部 */}
            <rect x={AX - v.w / 2 + 20} y={v.cy - v.h / 2 + 3} width={v.w - 40} height="1.6"
                  fill={BONE} opacity="0.3" />
            {/* 中央の溝 */}
            <rect x={AX - 7} y={v.cy - v.h / 2 + 5} width="14" height={v.h - 10} rx="6" fill="#07090b" />
            <rect x={AX - 7} y={v.cy - v.h / 2 + 5} width="14" height={v.h - 10} rx="6"
                  fill="none" stroke={PALE} strokeWidth="0.7" opacity="0.35" />
            {/* 鋲 */}
            <circle cx={AX - v.w / 2 + 26} cy={v.cy} r="2.6" fill="#0a0c0f" />
            <circle cx={AX + v.w / 2 - 26} cy={v.cy} r="2.6" fill="#0a0c0f" />
          </g>
        ))}

        {/* 頭蓋。初稿は丸い殻に楕円の眼窩を2つ入れたので、
            愛嬌のあるロボットの顔になってしまった。
            ギーガーの頭蓋は細長く、そして**目が無い**。
            縦に伸ばし、眼窩を捨て、側面に鰓の切れ込みを入れた */}
        <path d="M 300 48 C 332 50 354 86 358 132 C 362 180 346 228 316 252
                 C 310 258 290 258 284 252 C 254 228 238 180 242 132
                 C 246 86 268 48 300 48 Z"
              fill={`url(#${P}-dome)`} />
        <path d="M 300 48 C 332 50 354 86 358 132 C 362 180 346 228 316 252
                 C 310 258 290 258 284 252 C 254 228 238 180 242 132
                 C 246 86 268 48 300 48 Z"
              fill="none" stroke="#0a0c0f" strokeWidth="1.6" />
        {/* 頭蓋の節。横の稜を5本。これが無いと卵に見える */}
        <g fill="none" stroke="#0a0c0f" strokeWidth="1.5" opacity="0.75">
          {[96, 130, 164, 198, 226].map((y, i) => {
            const w = 30 + Math.sin(((y - 60) / 200) * Math.PI) * 26;
            return <path key={i} d={`M ${300 - w} ${y} Q 300 ${y + 9} ${300 + w} ${y}`} />;
          })}
        </g>
        <g fill="none" stroke={BONE} strokeWidth="0.8" opacity="0.2">
          {[96, 130, 164, 198, 226].map((y, i) => {
            const w = 30 + Math.sin(((y - 60) / 200) * Math.PI) * 26;
            return <path key={i} d={`M ${300 - w} ${y - 2.4} Q 300 ${y + 6.6} ${300 + w} ${y - 2.4}`} />;
          })}
        </g>
        {/* 正中の稜 */}
        <path d="M 300 50 C 306 100 306 200 300 252" stroke="#0a0c0f" strokeWidth="2.6" fill="none" opacity="0.85" />
        <path d="M 296.6 52 C 302 102 302 200 296.6 250" stroke={BONE} strokeWidth="1" fill="none" opacity="0.24" />
        {/* 艶。左上に細い弧を1本だけ */}
        <path d="M 264 106 C 272 78 292 66 308 68" stroke={BONE} strokeWidth="3.6" fill="none"
              opacity="0.3" strokeLinecap="round" />
        {/* 鰓。左右3本ずつ。目に見せない位置に置く */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={253 + i * 9} y={188 + i * 5} width="4" height={34 - i * 5} rx="2" fill="#05070a"
                  transform={`rotate(-12 ${255 + i * 9} ${205})`} />
            <rect x={343 - i * 9} y={188 + i * 5} width="4" height={34 - i * 5} rx="2" fill="#05070a"
                  transform={`rotate(12 ${345 - i * 9} ${205})`} />
          </g>
        ))}

        {/* 首の節。頭と背骨をつなぐ */}
        {Array.from({ length: 4 }, (_, i) => {
          const cy = 258 + i * 17;
          const w = 62 + i * 10;
          return (
            <g key={`n${i}`}>
              <rect x={AX - w / 2} y={cy - 7} width={w} height="14" rx="7" fill={`url(#${P}-vert)`} />
              <rect x={AX - w / 2} y={cy - 7} width={w} height="14" rx="7" fill="none"
                    stroke="#0a0c0f" strokeWidth="1.2" />
            </g>
          );
        })}

        {/* 刃の列。初稿は小さすぎて画面の埃に見えた。倍にして下腹に並べる */}
        <g>
          {Array.from({ length: 15 }, (_, i) => {
            const x = AX - 118 + i * 16.4;
            const h = 34 - Math.abs(i - 7) * 2.6;
            return (
              <g key={i}>
                <path d={`M ${x} 668 L ${x + 13} 668 L ${x + 8.4} ${668 + h} L ${x + 4.6} ${668 + h} Z`}
                      fill={`url(#${P}-band)`} />
                <path d={`M ${x} 668 L ${x + 13} 668 L ${x + 8.4} ${668 + h} L ${x + 4.6} ${668 + h} Z`}
                      fill="none" stroke="#0a0c0f" strokeWidth="0.9" />
              </g>
            );
          })}
        </g>

        {/* 台座。版面の底を締める */}
        <rect y="716" width="600" height="10" fill={`url(#${P}-band)`} opacity="0.7" />
        <rect y="726" width="600" height="74" fill="#0b0d10" />
        <g stroke="#20242a" strokeWidth="1">
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={i * 20 + 4} y1="726" x2={i * 20 + 4} y2="800" />
          ))}
        </g>

        {/* 四隅を沈める */}
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />

        {/* ── 文字。彫り込む。明部を1px 下に置くと沈んで見える ──── */}
        <text x="300" y="761.4" textAnchor="middle" fill={BONE} opacity="0.4"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="17"
              fontWeight="300" letterSpacing="11">BIOMECHANICAL</text>
        <text x="300" y="760" textAnchor="middle" fill="#3d434b"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="17"
              fontWeight="300" letterSpacing="11">BIOMECHANICAL</text>
        <text x="300" y="782" textAnchor="middle" fill={PALE} opacity="0.6"
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="8"
              letterSpacing="4.6">BIOMECHANOID · SPECIMEN VII · AIRBRUSH ON BOARD</text>

        {/* 粒。滑らかな面に少しだけ乗せて、樹脂の質感を殺さない */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.12"
              style={{ mixBlendMode: "overlay" }} />
      </g>
    </svg>
  );
}
