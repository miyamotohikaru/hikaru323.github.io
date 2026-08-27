/**
 * バロック。
 *
 * 17世紀の銅版口絵（frontispiece）。開いた帳の奥にカルトゥーシュが現れる。
 *
 * ■ ここで作っている「らしさ」
 *   1. キアロスクーロ。光源は画面外の左上、ただ一つ。
 *      版面のほとんどを闇に沈め、光の当たる所だけを起こす。
 *      「明るい所と暗い所がある」ではなく「闇が地で、光が図」。
 *   2. 斜めの動勢。新古典主義の左右対称と正反対。
 *      左の帳を大きく明るく、右を細く暗くして、画面に斜めの重心を作る。
 *   3. 銅版のハッチング。影も襞も金も、全部が線でできている。
 *      初稿でここを間違えた。なめらかなグラデーションだけで作ったら、
 *      バロックではなく 2000 年代のツヤありバッジになった。
 *      面の階調は「段」で作り、その上に平行線を重ねる。これが版画の見え方。
 *   4. アカンサス。渦の起点には必ず葉がある。渦だけだと針金細工になる。
 *
 * ■ 帳（とばり）の襞について
 *   初稿は襞を一点に集めて、壊れた傘のようになった。
 *   布は「一点から放射する線」ではなく「縦に並んだ帯」でできている。
 *   だから襞は帯として一枚ずつ塗り、明暗を交互に振っている。
 */
import { ATLAS, rand, lerp, shift, alpha } from "@/lib/plate";

const P = "bq";
const NIGHT = "#140f0a";
const RED = "#8a1f1a";
const GOLD = "#c9a227";
const CREAM = "#e6ddc6";
const BROWN = "#3f3320";

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

/** ふくらむ線。渦は太さが変わらないと針金に見える */
function taper(c: Cubic, w0: number, wMid: number, w1: number, steps = 32) {
  const bez = (t: number, a: number, b: number, cc: number, d: number) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * cc + t * t * t * d;
  };
  const dbez = (t: number, a: number, b: number, cc: number, d: number) => {
    const u = 1 - t;
    return 3 * u * u * (b - a) + 6 * u * t * (cc - b) + 3 * t * t * (d - cc);
  };
  const wAt = (t: number) => (t < 0.5 ? lerp(w0, wMid, t * 2) : lerp(wMid, w1, (t - 0.5) * 2));
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = bez(t, c[0][0], c[1][0], c[2][0], c[3][0]);
    const y = bez(t, c[0][1], c[1][1], c[2][1], c[3][1]);
    let dx = dbez(t, c[0][0], c[1][0], c[2][0], c[3][0]);
    let dy = dbez(t, c[0][1], c[1][1], c[2][1], c[3][1]);
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const w = wAt(t) / 2;
    L.push(`${(x - dy * w).toFixed(1)} ${(y + dx * w).toFixed(1)}`);
    R.push(`${(x + dy * w).toFixed(1)} ${(y - dx * w).toFixed(1)}`);
  }
  return `M${L.join(" L")} L${R.reverse().join(" L")} Z`;
}

/** アカンサスの葉。切れ込みのある3裂。渦の起点には必ずこれを置く */
const ACANTHUS =
  "M0 0 C 16 -12 24 -30 22 -52 C 33 -36 39 -20 37 -2 C 48 -16 59 -23 72 -22 " +
  "C 59 -9 50 5 48 20 C 61 13 72 13 83 18 C 66 24 53 35 46 50 C 37 37 22 28 4 26 " +
  "C 15 17 19 9 0 0 Z";

/** 渦。金は「段」で塗り、輪郭に線を足す。なめらかに塗るとツヤ物になる */
function Volute({ x, y, s, rot, flip = 1, dim = 0 }: { x: number; y: number; s: number; rot: number; flip?: number; dim?: number }) {
  const lit = shift(GOLD, 0.4 - dim * 0.6);
  const mid = shift(GOLD, 0.02 - dim * 0.5);
  const dark = shift(GOLD, -0.5 - dim * 0.3);
  const edge = shift(NIGHT, 0.06);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * flip} ${s})`}>
      {/* 葉は小さくする。大きいと楓の葉の束を貼ったように見え、
          渦（volute）本体が読めなくなる。主役は巻きのほう */}
      <path d={ACANTHUS} transform="translate(-4 8) rotate(16) scale(0.82)" fill={dark} />
      <path d={ACANTHUS} transform="translate(-9 3) rotate(16) scale(0.72)" fill={mid} />
      <path d={ACANTHUS} transform="translate(-13 -1) rotate(16) scale(0.5)" fill={lit} />
      {/* 葉脈。彫りの線 */}
      <g stroke={edge} strokeWidth="1.1" fill="none" opacity="0.7">
        <path d="M-8 4 C 4 -12 10 -30 9 -48" />
        <path d="M-6 8 C 10 2 26 -8 42 -18" />
        <path d="M-4 14 C 12 18 26 26 36 40" />
      </g>
      <path d={taper([[24, 4], [76, -16], [120, 12], [116, 60]], 20, 14, 6)} fill={dark} />
      <path d={taper([[24, 1], [74, -19], [116, 10], [112, 57]], 14, 9, 4)} fill={mid} />
      <path d={taper([[26, -3], [72, -21], [112, 8], [108, 54]], 5, 3.6, 1.6)} fill={lit} />
      <path d={taper([[116, 60], [112, 90], [86, 104], [66, 90]], 6, 9, 3)} fill={mid} />
      <path d={taper([[66, 90], [50, 78], [58, 58], [78, 62]], 3, 6, 1.4)} fill={dark} />
      <circle cx="74" cy="75" r="6" fill={lit} />
      <circle cx="74" cy="75" r="2.4" fill={edge} />
      {/* 巻きの上に彫りの線を数本。これで金が版画になる */}
      <g stroke={edge} strokeWidth="0.9" fill="none" opacity="0.55">
        <path d="M34 -6 C 74 -18 106 6 104 44" />
        <path d="M40 8 C 76 -2 100 18 98 46" />
      </g>
    </g>
  );
}

/** 帳の一襞。上・絞り・裾の三点を通る帯。布は帯の集まりでできている */
function fold(t0: number, t1: number, top: [number, number], pinch: [number, number], bot: [number, number], yTop: number, yPinch: number, yBot: number) {
  const T = (t: number) => lerp(top[0], top[1], t);
  const Pn = (t: number) => lerp(pinch[0], pinch[1], t);
  const B = (t: number) => lerp(bot[0], bot[1], t);
  const mid1 = (yTop + yPinch) / 2;
  const mid2 = (yPinch + yBot) / 2;
  return (
    `M${T(t0)} ${yTop}` +
    ` C ${T(t0)} ${mid1} ${Pn(t0)} ${mid1} ${Pn(t0)} ${yPinch}` +
    ` C ${Pn(t0)} ${mid2} ${B(t0)} ${mid2} ${B(t0)} ${yBot}` +
    ` L ${B(t1)} ${yBot}` +
    ` C ${B(t1)} ${mid2} ${Pn(t1)} ${mid2} ${Pn(t1)} ${yPinch}` +
    ` C ${Pn(t1)} ${mid1} ${T(t1)} ${mid1} ${T(t1)} ${yTop} Z`
  );
}

/** 帳。左は大きく明るく、右は細く暗く。ここで画面の斜めを作る */
function Curtain({ side, n, top, pinch, bot, shade }: {
  side: 1 | -1; n: number; top: [number, number]; pinch: [number, number]; bot: [number, number]; shade: number;
}) {
  const mirror = side === -1 ? "translate(600 0) scale(-1 1)" : undefined;
  return (
    <g transform={mirror}>
      {Array.from({ length: n }, (_, i) => {
        const t0 = i / n;
        const t1 = (i + 1) / n;
        const c = Math.cos(((i + 0.5) / n) * Math.PI * 2 * 2.5 + 0.6);
        const tone = 0.24 * c - 0.52 - shade - ((i + 0.5) / n) * 0.3;
        return <path key={i} d={fold(t0, t1, top, pinch, bot, 96, 452, 782)} fill={shift(RED, tone)} />;
      })}
      {/* 襞の谷に彫りの線。布が線でできていることを見せる */}
      <g stroke={shift(NIGHT, 0.04)} strokeWidth="1.2" fill="none" opacity="0.5">
        {Array.from({ length: n + 1 }, (_, i) => {
          const t = i / n;
          const T = lerp(top[0], top[1], t);
          const Pn = lerp(pinch[0], pinch[1], t);
          const B = lerp(bot[0], bot[1], t);
          return <path key={i} d={`M${T} 96 C ${T} 274 ${Pn} 274 ${Pn} 452 C ${Pn} 617 ${B} 617 ${B} 782`} />;
        })}
      </g>
    </g>
  );
}

export default function Plate() {
  const r = rand(1650);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="バロック様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 明暗の幅。前の版は全域が中間の焦茶で、看板に CHIAROSCVRO と
            書いてあるのに明暗が無かった。いちばん明るい所と暗い所の差を倍にする */}
        <radialGradient id={`${P}-light`} cx="22%" cy="8%" r="96%">
          <stop offset="0%" stopColor={shift(BROWN, 0.54)} />
          <stop offset="24%" stopColor={shift(BROWN, 0.14)} />
          <stop offset="52%" stopColor={shift(NIGHT, 0.14)} />
          <stop offset="78%" stopColor={shift(NIGHT, 0.03)} />
          <stop offset="100%" stopColor="#0b0806" />
        </radialGradient>
        {/* 斜めに差す一条。バロックの構図は必ず斜めに動く。
            対称の舞台のままだと、動き（motus）が絵に入らない */}
        <linearGradient id={`${P}-shaft`} x1="0" y1="0" x2="0.86" y2="1">
          <stop offset="0" stopColor={shift(GOLD, 0.5)} stopOpacity="0.3" />
          <stop offset="0.42" stopColor={shift(GOLD, 0.2)} stopOpacity="0.11" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        {/* 額の中も平らに塗らない。左上が明るく、右下が沈む */}
        <linearGradient id={`${P}-panel`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={shift(CREAM, 0.26)} />
          <stop offset="0.46" stopColor={shift(CREAM, -0.06)} />
          <stop offset="1" stopColor={shift(CREAM, -0.42)} />
        </linearGradient>
        {/* 銅版のハッチ。影も光も、全部この線でできている */}
        <pattern id={`${P}-h1`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="6" height="1.6" fill={NIGHT} />
        </pattern>
        <pattern id={`${P}-h2`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="7" height="2.2" fill={NIGHT} />
          <rect width="2.2" height="7" fill={NIGHT} />
        </pattern>
        <pattern id={`${P}-hp`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-36)">
          <rect width="5" height="1" fill={BROWN} />
        </pattern>
        <clipPath id={`${P}-valance`}>
          <path d="M-20 -10 L620 -10 L620 92
             C 556 150 500 96 442 148 C 384 200 340 132 300 156
             C 260 132 216 200 158 148 C 100 96 44 150 -20 92 Z" />
        </clipPath>
        <clipPath id={`${P}-oval`}>
          <ellipse cx="300" cy="424" rx="132" ry="158" transform="rotate(-4 300 424)" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-light)`} />

        {/* ── 奥の壁龕。上の弧と、下へ行くほど深い闇 ───────────────── */}
        <path d="M300 118 A 218 218 0 0 1 518 336 L518 800 L82 800 L82 336 A 218 218 0 0 1 300 118 Z" fill={shift(BROWN, -0.42)} />
        <path d="M300 118 A 218 218 0 0 1 518 336 L518 800 L82 800 L82 336 A 218 218 0 0 1 300 118 Z" fill={`url(#${P}-h1)`} opacity="0.45" />
        {/* 壁龕の右下は交叉線で最暗部に */}
        <path d="M518 340 L518 800 L286 800 C 412 706 480 552 518 340 Z" fill={`url(#${P}-h2)`} opacity="0.38" />
        {/* 壁龕の縁。左上だけ光る */}
        <path d="M82 336 A 218 218 0 0 1 300 118" fill="none" stroke={shift(BROWN, 0.34)} strokeWidth="5" />
        <path d="M300 118 A 218 218 0 0 1 518 336" fill="none" stroke={shift(NIGHT, 0.1)} strokeWidth="5" />
        <line x1="82" y1="336" x2="82" y2="800" stroke={shift(BROWN, 0.24)} strokeWidth="4" />
        <line x1="518" y1="336" x2="518" y2="800" stroke={shift(BROWN, -0.42)} strokeWidth="4" />

        {/* 斜めの一条。左上の高みから右下へ抜ける。
            これがないと、対称の舞台に置いた飾りにしか見えない */}
        <polygon points="-40,60 214,-20 560,690 300,800" fill={`url(#${P}-shaft)`} />

        {/* ── 帳。**左右で開き方をはっきり変える。**
               扉絵の枠組みが左右対称なのは当時の作法どおりで構わないが、
               対称のまま何も動かないと、バロックではなく19世紀の額縁になる。
               斜めの光（上の一条）と、この帳の開き差の2つで画面を動かす。
               ・左：大きく引き開けて明るい。舞台の奥が見える
               ・右：ほとんど閉じたまま暗い。襞も多く重い
               銘帯を斜めに渡す案も試したが、白い棒が題字の前に寝ている
               ようにしか見えなかったので捨てた ─────────────────── */}
        <Curtain side={1} n={8} top={[-30, 172]} pinch={[42, 150]} bot={[-30, 216]} shade={0} />
        <Curtain side={-1} n={11} top={[-30, 232]} pinch={[62, 214]} bot={[-30, 286]} shade={0.34} />

        {/* ── 上の横幕。裾を五つの弧で刻む ───────────────────── */}
        <path
          d="M-20 -10 L620 -10 L620 92
             C 556 150 500 96 442 148 C 384 200 340 132 300 156
             C 260 132 216 200 158 148 C 100 96 44 150 -20 92 Z"
          fill={shift(RED, -0.1)}
        />
        {/* 横幕の襞。等幅の短冊を並べたらバーコードに見えたので、
            裾の弧まで届く帯にし、明暗の幅も狭くした */}
        <g clipPath={`url(#${P}-valance)`}>
          {Array.from({ length: 34 }, (_, i) => {
            const t = i / 34;
            const x = -20 + t * 640;
            const c = Math.cos(t * Math.PI * 2 * 5.5);
            return (
              <path
                key={i}
                d={`M${x} -10 C ${x + 3} 60 ${x + 5} 120 ${x + 6} 200 L${x + 19} 200 C ${x + 18} 120 ${x + 20} 60 ${x + 19} -10 Z`}
                fill={shift(RED, -0.12 + c * 0.16 - t * 0.42)}
              />
            );
          })}
        </g>
        <path
          d="M-20 -10 L620 -10 L620 92
             C 556 150 500 96 442 148 C 384 200 340 132 300 156
             C 260 132 216 200 158 148 C 100 96 44 150 -20 92 Z"
          fill="none"
          stroke={shift(NIGHT, 0.05)}
          strokeWidth="1"
          opacity="0.4"
        />
        {/* 金の縁と房 */}
        <path
          d="M-20 92 C 44 150 100 96 158 148 C 216 200 260 132 300 156
             C 340 132 384 200 442 148 C 500 96 556 150 620 92
             L620 104 C 554 164 498 110 442 162 C 386 214 340 146 300 170
             C 260 146 214 214 158 162 C 102 110 46 164 -20 104 Z"
          fill={shift(GOLD, -0.15)}
        />
        {Array.from({ length: 30 }, (_, i) => {
          const t = (i + 0.5) / 30;
          const x = -20 + t * 640;
          // 裾の弧に合わせて高さを出す（5山）
          const y = 104 + 32 * Math.abs(Math.sin(t * Math.PI * 2.5)) + Math.abs(t - 0.5) * 26;
          const len = 10 + Math.abs(Math.sin(t * Math.PI * 5)) * 12;
          const lit = 0.34 - t * 0.6;
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x} y2={y + len} stroke={shift(GOLD, lit)} strokeWidth="2.6" />
              <circle cx={x} cy={y + len + 2.4} r="3" fill={shift(GOLD, lit + 0.12)} />
            </g>
          );
        })}

        {/* ── 帳の絞りと総。左右で高さを変えて対称を崩す ───────────── */}
        {[
          { x: 112, y: 452, lit: 0.2, s: 1 },
          { x: 512, y: 452, lit: -0.5, s: 0.86 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
            {/* 房。初稿は三日月を伏せた形で、角のように見えた。
                実物は「帳を巻く綱＋結び玉＋垂れる房」の三つでできている */}
            <path d="M-56 -16 C -30 16 30 16 56 -16" fill="none" stroke={shift(GOLD, c.lit - 0.28)} strokeWidth="9" strokeLinecap="round" />
            <path d="M-56 -18 C -30 12 30 12 56 -18" fill="none" stroke={shift(GOLD, c.lit + 0.1)} strokeWidth="4" strokeLinecap="round" />
            {/* 綱の撚り。斜めの短い線を並べる */}
            {Array.from({ length: 15 }, (_, j) => {
              const t = (j + 0.5) / 15;
              const x = -56 + t * 112;
              const y = -16 + 24 * (1 - Math.pow((t - 0.5) * 2, 2)) - 4;
              return <line key={j} x1={x - 3} y1={y - 4} x2={x + 3} y2={y + 4} stroke={shift(NIGHT, 0.08)} strokeWidth="1.4" opacity="0.5" />;
            })}
            <ellipse cy="9" rx="12" ry="9" fill={shift(GOLD, c.lit + 0.14)} />
            <ellipse cy="9" rx="12" ry="9" fill="none" stroke={shift(NIGHT, 0.08)} strokeWidth="1" />
            <path d="M-11 16 C -14 34 -13 48 -10 58 L10 58 C 13 48 14 34 11 16 Z" fill={shift(GOLD, c.lit - 0.06)} />
            {Array.from({ length: 9 }, (_, j) => (
              <line key={j} x1={-10 + j * 2.5} y1="20" x2={-11 + j * 2.8} y2="58" stroke={shift(NIGHT, 0.08)} strokeWidth="0.9" opacity="0.45" />
            ))}
            {Array.from({ length: 9 }, (_, j) => (
              <line key={j} x1={-10 + j * 2.5} y1="58" x2={-13 + j * 3.3} y2="80" stroke={shift(GOLD, c.lit - 0.3)} strokeWidth="2.2" strokeLinecap="round" />
            ))}
          </g>
        ))}

        {/* ── 渦。四隅に。左（光側）を大きく ───────────────────── */}
        <Volute x={150} y={302} s={0.98} rot={-30} flip={1} dim={0} />
        <Volute x={158} y={556} s={0.8} rot={126} flip={1} dim={0.3} />
        <Volute x={452} y={318} s={0.72} rot={30} flip={-1} dim={0.6} />
        <Volute x={444} y={552} s={0.6} rot={-126} flip={-1} dim={0.75} />

        {/* ── カルトゥーシュ。4度傾ける。真っ直ぐに置くと様式が死ぬ ── */}
        <g transform="rotate(-4 300 424)">
          <ellipse cx="300" cy="424" rx="152" ry="178" fill={shift(NIGHT, 0.04)} />
          {/* 金の枠は「段」で塗る。なめらかに塗るとツヤ物になる */}
          <ellipse cx="300" cy="424" rx="147" ry="173" fill="none" stroke={shift(GOLD, -0.6)} strokeWidth="16" />
          <ellipse cx="300" cy="424" rx="147" ry="173" fill="none" stroke={shift(GOLD, -0.15)} strokeWidth="10" />
          <ellipse cx="300" cy="424" rx="147" ry="173" fill="none" stroke={GOLD} strokeWidth="4" />
          <path d="M300 251 A147 173 0 0 0 153 424" fill="none" stroke={shift(GOLD, 0.52)} strokeWidth="4.5" />
          {/* 枠を横切る彫りの線。金に彫りが入ってはじめて版画になる */}
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const sx = 300 + Math.sin(a) * 139;
            const sy = 424 - Math.cos(a) * 163;
            const ex = 300 + Math.sin(a) * 156;
            const ey = 424 - Math.cos(a) * 184;
            return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={shift(NIGHT, 0.06)} strokeWidth="1" opacity={0.2 + Math.max(0, Math.cos(a - 2.6)) * 0.5} />;
          })}
          <ellipse cx="300" cy="424" rx="132" ry="158" fill={`url(#${P}-panel)`} />
        </g>

        {/* ── 額の中。彫りのハッチと題字 ─────────────────────── */}
        <g clipPath={`url(#${P}-oval)`}>
          {/* 右下から回り込む影。全部ハッチで作る */}
          <rect x="160" y="250" width="300" height="360" fill={`url(#${P}-hp)`} opacity="0.16" />
          <path d="M460 250 L460 600 L120 600 C 290 540 400 400 460 250 Z" fill={`url(#${P}-hp)`} opacity="0.5" />
          <path d="M460 380 L460 600 L230 600 C 340 550 410 470 460 380 Z" fill={`url(#${P}-hp)`} opacity="0.55" />
          <path d="M460 470 L460 600 L320 600 C 380 570 430 520 460 470 Z" fill={`url(#${P}-hp)`} opacity="0.6" />
          <text x="300" y="336" textAnchor="middle" fill={BROWN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" letterSpacing="4.6">
            ROMA · MDC—MDCCL
          </text>
          <line x1="206" y1="349" x2="394" y2="349" stroke={BROWN} strokeWidth="1.1" opacity="0.7" />
          <text x="299" y="411" textAnchor="middle" fill={alpha(CREAM, 0.85)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="45" letterSpacing="2">
            BAROQVE
          </text>
          <text x="300" y="413" textAnchor="middle" fill={shift(BROWN, -0.3)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="45" letterSpacing="2">
            BAROQVE
          </text>
          <text x="300" y="441" textAnchor="middle" fill={RED} fontFamily="Georgia, 'Times New Roman', serif" fontSize="17" fontStyle="italic">
            In tenebris lux
          </text>
          <line x1="234" y1="458" x2="366" y2="458" stroke={BROWN} strokeWidth="0.9" opacity="0.6" />
          <text x="300" y="478" textAnchor="middle" fill={BROWN} fontFamily="Georgia, 'Times New Roman', serif" fontSize="9.2" letterSpacing="3" opacity="0.9">
            CHIAROSCVRO · MOTVS · POMPA
          </text>
          {/* 小さな挿画。蝋燭＝唯一の光源という主題そのもの */}
          <g transform="translate(300 528)">
            <ellipse rx="60" ry="30" fill="none" stroke={BROWN} strokeWidth="1.1" opacity="0.7" />
            {Array.from({ length: 15 }, (_, i) => {
              const a = -Math.PI + (i / 14) * Math.PI;
              return <line key={i} x1={Math.cos(a) * 20} y1={-16 + Math.sin(a) * 9} x2={Math.cos(a) * 38} y2={-16 + Math.sin(a) * 19} stroke={shift(GOLD, -0.2)} strokeWidth="0.9" opacity="0.6" />;
            })}
            <rect x="-4" y="-9" width="8" height="26" fill={shift(CREAM, 0.2)} stroke={BROWN} strokeWidth="0.8" />
            <rect x="0" y="-9" width="4" height="26" fill={shift(BROWN, 0.5)} opacity="0.6" />
            <path d="M0 -24 C 6 -18 6 -11 0 -9 C -6 -11 -6 -18 0 -24 Z" fill={GOLD} />
            <path d="M0 -20 C 3 -16 3 -12 0 -11 C -3 -12 -3 -16 0 -20 Z" fill={CREAM} />
            <rect x="-13" y="16" width="26" height="5" fill={BROWN} />
            <rect x="-13" y="16" width="26" height="1.6" fill={shift(BROWN, 0.4)} />
          </g>
        </g>

        {/* 右下の闇。バロックの画面はここが必ずいちばん沈む */}
        <path d="M600 300 L600 800 L250 800 C 430 690 540 500 600 300 Z" fill="#0b0806" opacity="0.42" />

        {/* ── 台石。下の縁を締める ───────────────────────────── */}
        <path d="M64 720 L536 720 L560 762 L40 762 Z" fill={shift(BROWN, -0.2)} />
        <path d="M64 720 L536 720 L539 730 L61 730 Z" fill={shift(BROWN, 0.36)} />
        <rect x="40" y="762" width="520" height="38" fill={shift(NIGHT, 0.04)} />
        <rect x="40" y="730" width="520" height="70" fill={`url(#${P}-h2)`} opacity="0.4" />
        {/* 台石の上の飾り帯。端が裏へ返る紙 */}
        <g>
          <path d="M136 696 C 210 668 390 668 464 696 L464 714 C 390 738 210 738 136 714 Z" fill={shift(GOLD, -0.42)} />
          <path d="M141 697 C 212 671 388 671 459 697 L459 712 C 388 734 212 734 141 712 Z" fill={shift(CREAM, -0.14)} />
          <path d="M141 697 C 212 671 388 671 459 697" fill="none" stroke={shift(BROWN, 0.2)} strokeWidth="1" opacity="0.6" />
          <path d="M136 696 C 110 682 92 696 86 716 C 102 710 120 712 136 722 Z" fill={shift(GOLD, -0.08)} />
          <path d="M464 696 C 490 682 508 696 514 716 C 498 710 480 712 464 722 Z" fill={shift(GOLD, -0.62)} />
          <text x="300" y="710" textAnchor="middle" fill={shift(BROWN, -0.3)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" fontStyle="italic" letterSpacing="1.4">
            Ars est celare artem
          </text>
        </g>
        <text x="300" y="784" textAnchor="middle" fill={shift(GOLD, -0.22)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.6" letterSpacing="3.2" opacity="0.9">
          SCVLPSIT · CVM PRIVILEGIO
        </text>

        {/* 版のよごれ。銅版は必ず拭き残しが出る */}
        <g fill={CREAM} opacity="0.06">
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={r(20, 580)} cy={r(20, 780)} r={r(0.6, 2.4)} />
          ))}
        </g>
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.24" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
