/**
 * アール・ヌーヴォー。
 *
 * ミュシャの装飾パネル（1896–98）を基準にした。
 * この様式は色でも構図でもなく、まず「線」で決まる。
 *
 * ■ ここで作っている「らしさ」
 *   1. 線が太さを変えること。鞭のようにふくらんで、先で消える。
 *      stroke で引くと太さが一定になり、蔓ではなく針金に見える。
 *      taper() で3次ベジエを法線方向にふくらませ、「塗りつぶした線」として引く。
 *   2. 髪を「面 → 櫛目」の二段で作ること。ここで二度失敗した。
 *      初稿は太い弧を4本。顔のまわりを輪が囲む絵になった。
 *      二稿は細い線を乱数でばらしただけ。筆で擦った落書きに見えた。
 *      正解は envelope()。内側の曲線と外側の曲線ではさんだ面を先に塗り、
 *      その上に同じ流れの細い線を並べる。面があってはじめて量に見える。
 *   3. 顔は小さく、「抜き」で作ること。
 *      三稿目まで顔が大きすぎて、輪光いっぱいの卵になった。
 *      髪の面を敷き、地色で顔を抜き、その上に輪郭線を乗せる。
 *   4. 曲線が必ず「S」で戻ること。ユーゲント（幾何寄り）との差はここ。
 *      始点から終点まで一方向に曲げず、途中で反りを入れている。
 */
import { ATLAS, rand, lerp, alpha, shift, onCircle } from "@/lib/plate";

const P = "an";
const PAPER = "#efe6d2";
const OLIVE = "#6b7f4e";
const TERRA = "#b4653a";
const DARK = "#2f3b2c";
const GOLD = "#c9a86b";

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

const bez = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
const dbez = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
};

const sample = (c: Cubic, steps = 40): Pt[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [bez(t, c[0][0], c[1][0], c[2][0], c[3][0]), bez(t, c[0][1], c[1][1], c[2][1], c[3][1])] as Pt;
  });

/** ふくらむ線。法線方向に幅 w(t) を振って輪郭を閉じる。蔓も髪もこれで引く */
function taper(c: Cubic, w0: number, wMid: number, w1: number, steps = 36) {
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

/** 内側の曲線と外側の曲線ではさんだ面。髪の「量」はここで作る */
const envelope = (inner: Cubic, outer: Cubic) =>
  `M${[...sample(inner), ...sample(outer).reverse()].map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")} Z`;

/** 面の中を等分して櫛目を並べる。ゆらぎは最小限。散らすと筆跡に見える */
function comb(inner: Cubic, outer: Cubic, n: number, seed: number): Cubic[] {
  const r = rand(seed);
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return inner.map((p, k) => [
      lerp(p[0], outer[k][0], t) + r(-1.6, 1.6),
      lerp(p[1], outer[k][1], t) + r(-1.6, 1.6),
    ] as Pt) as Cubic;
  });
}

/* 髪。左は長く垂らし、右は短く強く巻く。左右対称にすると仮面に見える */
const LOCKS: { inner: Cubic; outer: Cubic; n: number; seed: number; w: number }[] = [
  { inner: [[286, 196], [206, 202], [166, 266], [178, 352]], outer: [[300, 178], [166, 182], [98, 258], [104, 388]], n: 14, seed: 5, w: 7 },
  { inner: [[178, 352], [186, 424], [224, 468], [278, 470]], outer: [[104, 388], [104, 470], [154, 526], [232, 524]], n: 14, seed: 11, w: 6 },
  { inner: [[320, 196], [392, 208], [428, 266], [422, 340]], outer: [[302, 178], [432, 184], [500, 264], [484, 372]], n: 13, seed: 23, w: 7 },
  { inner: [[422, 340], [422, 400], [396, 442], [352, 448]], outer: [[484, 372], [486, 440], [446, 490], [386, 494]], n: 13, seed: 31, w: 6 },
  { inner: [[248, 258], [256, 220], [300, 206], [344, 224]], outer: [[222, 300], [234, 184], [318, 170], [380, 222]], n: 12, seed: 41, w: 5 },
];

/* 輪光の外へ跳ねる後れ毛。輪郭を丸く閉じないための逃がし */
const FLYAWAY: Cubic[] = [
  [[112, 300], [72, 280], [58, 232], [86, 202]],
  [[104, 420], [66, 442], [54, 490], [82, 522]],
  [[492, 320], [532, 300], [548, 254], [520, 224]],
  [[478, 430], [512, 456], [516, 500], [486, 522]],
];

/** 顔の抜き。左向きの横顔。額→鼻→唇→顎→顎線→生え際で閉じる */
const FACE = `M 244 254
  C 228 266 220 284 226 294
  C 228 300 232 302 232 306
  C 225 315 211 326 207 333
  C 204 339 216 343 226 344
  C 233 345 232 349 228 355
  C 236 357 244 359 237 364
  C 230 369 229 374 233 380
  C 241 386 246 396 237 404
  C 264 418 298 416 316 396
  C 328 382 336 362 332 344
  C 326 306 300 264 244 254 Z`;

/** 花。ケシに寄せた5弁。雄しべの点まで描くと近くで持つ */
function Bloom({ x, y, r, rot, seed }: { x: number; y: number; r: number; rot: number; seed: number }) {
  const rr = rand(seed);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (360 / 5) * i + rr(-10, 10);
        const w = r * rr(0.84, 1.08);
        return (
          <path
            key={i}
            transform={`rotate(${a})`}
            d={`M0 0 C ${-w * 0.74} ${-w * 0.3} ${-w * 0.66} ${-w * 1.08} 0 ${-w}
                C ${w * 0.66} ${-w * 1.08} ${w * 0.74} ${-w * 0.3} 0 0 Z`}
            fill={alpha(TERRA, 0.88)}
            stroke={DARK}
            strokeWidth="1.1"
          />
        );
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const [sx, sy] = onCircle(0, 0, r * 0.36, (360 / 9) * i + 12);
        return <line key={i} x1="0" y1="0" x2={sx} y2={sy} stroke={DARK} strokeWidth="0.7" opacity="0.7" />;
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const [sx, sy] = onCircle(0, 0, r * 0.38, (360 / 9) * i + 12);
        return <circle key={i} cx={sx} cy={sy} r="1.5" fill={DARK} opacity="0.75" />;
      })}
      <circle r={r * 0.17} fill={DARK} opacity="0.9" />
    </g>
  );
}

export default function Plate() {
  const r = rand(1896);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="アール・ヌーヴォー様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <radialGradient id={`${P}-halo`} cx="50%" cy="44%" r="54%">
          <stop offset="0%" stopColor={shift(GOLD, 0.78)} />
          <stop offset="70%" stopColor={shift(GOLD, 0.54)} />
          <stop offset="100%" stopColor={shift(GOLD, 0.32)} />
        </radialGradient>
        <clipPath id={`${P}-panel`}>
          <rect x="34" y="34" width="532" height="732" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        <g clipPath={`url(#${P}-panel)`}>
          {/* ── 輪光 ───────────────────────────────────────────── */}
          <circle cx="300" cy="296" r="190" fill={`url(#${P}-halo)`} />
          <g stroke={GOLD} strokeWidth="1" opacity="0.6">
            {Array.from({ length: 72 }, (_, i) => {
              const [x1, y1] = onCircle(300, 296, 164, i * 5);
              const [x2, y2] = onCircle(300, 296, 190, i * 5);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
          {/* モザイクの粒。丸と菱を交互に。近くで見たときの細部はここ */}
          {Array.from({ length: 36 }, (_, i) => {
            const a = i * 10 + 5;
            const [x, y] = onCircle(300, 296, 177, a);
            return i % 2 === 0 ? (
              <circle key={i} cx={x} cy={y} r="5" fill={alpha(TERRA, 0.8)} />
            ) : (
              <rect key={i} x={x - 3.8} y={y - 3.8} width="7.6" height="7.6" transform={`rotate(${a} ${x} ${y})`} fill={alpha(OLIVE, 0.8)} />
            );
          })}
          <circle cx="300" cy="296" r="190" fill="none" stroke={DARK} strokeWidth="2.4" />
          <circle cx="300" cy="296" r="164" fill="none" stroke={DARK} strokeWidth="1.3" />
          <circle cx="300" cy="296" r="157" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.85" />

          {/* ── 胸像。肩を作らないと首から下が消えて標本に見える ────── */}
          <g>
            <path
              d="M240 470 C 206 486 178 512 164 548 C 150 588 144 640 144 700
                 L 456 700 C 456 640 450 588 436 548 C 422 512 392 484 334 468
                 C 314 494 260 494 240 470 Z"
              fill={alpha(OLIVE, 0.42)}
              stroke={DARK}
              strokeWidth="1.6"
            />
            {/* 肩の稜線。ここを入れないと釣鐘に見える（三稿目でそうなった） */}
            <g fill="none" stroke={DARK} strokeWidth="1.4" opacity="0.75">
              <path d="M240 470 C 214 496 196 534 190 578" />
              <path d="M334 468 C 362 494 380 532 386 578" />
            </g>
            <g fill="none" stroke={DARK} strokeWidth="1" opacity="0.45">
              <path d="M256 500 C 234 566 224 640 226 700" />
              <path d="M300 506 C 296 578 296 646 300 700" />
              <path d="M344 500 C 366 566 376 640 378 700" />
              <path d="M186 540 C 168 600 160 656 158 700" />
              <path d="M414 542 C 432 602 440 658 442 700" />
            </g>
            {/* 襷。左肩から右腰へ。左右対称を崩すのはここで効く */}
            <path d="M196 534 C 264 592 336 642 424 668 L 428 686 C 334 660 252 610 188 550 Z" fill={alpha(TERRA, 0.55)} stroke={DARK} strokeWidth="1.1" />
            <path d="M196 534 C 264 592 336 642 424 668" fill="none" stroke={GOLD} strokeWidth="1.2" />
            <path d="M188 550 C 252 610 334 660 428 686" fill="none" stroke={GOLD} strokeWidth="1.2" />
            {Array.from({ length: 13 }, (_, i) => {
              const t = (i + 0.5) / 13;
              const x = lerp(194, 426, t);
              const y = lerp(546, 678, t) - Math.sin(t * Math.PI) * 9;
              return (
                <rect key={i} x={x - 3} y={y - 3} width="6" height="6" transform={`rotate(45 ${x} ${y})`}
                      fill={GOLD} stroke={DARK} strokeWidth="0.4" opacity="0.9" />
              );
            })}
            {/* 襟の縁飾り。金の小玉を並べる */}
            <path d="M240 470 C 262 494 312 494 334 468" fill="none" stroke={GOLD} strokeWidth="3" />
            {Array.from({ length: 8 }, (_, i) => {
              const t = i / 7;
              const x = lerp(244, 330, t);
              const y = 469 + Math.sin(t * Math.PI) * 22;
              return <circle key={i} cx={x} cy={y} r="2.6" fill={GOLD} stroke={DARK} strokeWidth="0.6" />;
            })}
          </g>

          {/* ── 髪。面 → 櫛目の二段 ─────────────────────────────── */}
          <ellipse cx="300" cy="286" rx="90" ry="98" fill={shift(OLIVE, -0.28)} />
          {LOCKS.map((l, gi) => (
            <path key={`e${gi}`} d={envelope(l.inner, l.outer)} fill={shift(OLIVE, -0.28)} />
          ))}
          {/* 面の上に、同じ流れの明るい筋を薄く。艶が出る */}
          {LOCKS.map((l, gi) =>
            comb(l.inner, l.outer, 5, l.seed + 900).map((c, i) => (
              <path key={`h${gi}-${i}`} d={taper(c, 1, l.w * 2.2, 1)} fill={OLIVE} opacity="0.5" />
            )),
          )}
          {/* 櫛目。濃い線と金の線を混ぜる。ミュシャは髪に必ず金を差す */}
          {LOCKS.map((l, gi) =>
            comb(l.inner, l.outer, l.n, l.seed).map((c, i) => {
              const rr = rand(gi * 97 + i * 13);
              const k = rr();
              const fill = k > 0.84 ? GOLD : k > 0.62 ? OLIVE : DARK;
              return <path key={`c${gi}-${i}`} d={taper(c, 0.8, l.w * rr(0.6, 1.05), 0.6)} fill={fill} opacity={k > 0.84 ? 0.9 : 0.85} />;
            }),
          )}

          {/* 輪光の外へ跳ねる毛。数本だけ。silhouette が丸く閉じるのを防ぐ */}
          <g fill={DARK} opacity="0.85">
            {FLYAWAY.map((c, i) => (
              <path key={i} d={taper(c, 3.2, 2.2, 0.5)} />
            ))}
          </g>

          {/* ── 首。塗りを入れないと髪と輪光が透けて首が消える ───────── */}
          <path
            d="M237 400 C 240 426 240 450 240 470 C 262 492 310 492 330 466
               C 322 442 314 416 312 392 C 296 412 262 416 237 400 Z"
            fill={PAPER}
          />
          <path
            d="M237 400 C 240 426 240 450 240 470 C 262 492 310 492 330 466
               C 322 442 314 416 312 392 C 296 412 262 416 237 400 Z"
            fill={alpha(TERRA, 0.16)}
          />
          {/* 顎の落ち影。首の上端をいちばん暗くする */}
          <path d="M237 400 C 258 420 302 420 316 394 C 312 428 296 448 272 448 C 250 448 240 424 237 400 Z" fill={alpha(TERRA, 0.26)} />

          {/* ── 顔。髪から地色で抜き、上に線を乗せる ────────────────── */}
          <path d={FACE} fill={PAPER} />
          <path d={FACE} fill={alpha(TERRA, 0.12)} />
          {/* 頬と顎下の陰。面はここだけ。無いと顔が紙のまま浮く */}
          <path d="M234 312 C 250 330 254 358 246 382 C 234 360 226 332 234 312 Z" fill={alpha(TERRA, 0.18)} />
          <path d="M239 404 C 264 418 298 416 316 396 C 306 420 254 424 239 404 Z" fill={alpha(TERRA, 0.24)} />
          <g fill="none" stroke={DARK} strokeLinecap="round">
            <path d={FACE} strokeWidth="2.2" />
            {/* 目。伏し目。上瞼を太く、下瞼を細く */}
            <path d="M228 304 C 240 293 262 293 278 303" strokeWidth="3" />
            <path d="M231 308 C 243 319 262 318 276 306" strokeWidth="1.1" />
            <path d="M244 305 C 251 312 259 312 265 304" strokeWidth="2.4" opacity="0.85" />
            {/* 睫毛。3本だけ。これが無いと伏し目に見えない */}
            <path d="M229 303 L 223 299" strokeWidth="1.1" />
            <path d="M234 299 L 230 293" strokeWidth="1.1" />
            <path d="M242 296 L 240 289" strokeWidth="1" />
            {/* 眉 */}
            <path d="M228 285 C 242 274 266 275 282 284" strokeWidth="2.2" opacity="0.9" />
            {/* 小鼻と唇 */}
            <path d="M212 342 C 218 339 223 339 226 342" strokeWidth="1.1" opacity="0.8" />
            <path d="M222 357 C 230 353 238 354 243 358" strokeWidth="1.7" />
            <path d="M223 360 C 231 366 239 364 243 358" strokeWidth="1.3" />
            {/* 首 */}
            <path d="M237 402 C 240 428 240 452 240 470" strokeWidth="2" />
            <path d="M313 392 C 318 418 324 442 330 466" strokeWidth="2" />
          </g>
          {/* こめかみに落ちる1本だけ残す。顔を横切らせると引っかき傷に見えた */}
          <path d={taper([[326, 262], [338, 300], [338, 342], [328, 380]], 0.8, 3.4, 0.6)} fill={DARK} opacity="0.9" />
          {/* 房の先。内へ巻き戻して線を消す。輪を置くと浮いて見えた（四稿目） */}
          <g fill={DARK} opacity="0.9">
            <path d={taper([[232, 524], [268, 540], [292, 522], [278, 500]], 3.4, 2.4, 0.5)} />
            <path d={taper([[386, 494], [356, 512], [334, 498], [346, 480]], 3.2, 2.2, 0.5)} />
          </g>

          {/* ── 蔓と花。左右で高さを変える。対称にすると死ぬ ────────── */}
          <g fill={OLIVE}>
            <path d={taper([[104, 762], [76, 690], [64, 616], [92, 552]], 8, 5.5, 2.6)} />
            <path d={taper([[92, 552], [104, 528], [104, 514], [96, 500]], 2.6, 3, 1.4)} />
            <path d={taper([[512, 762], [540, 700], [552, 646], [520, 596]], 8, 5.5, 2.6)} />
            <path d={taper([[520, 596], [508, 574], [508, 562], [516, 548]], 2.6, 3, 1.4)} />
            <path d={taper([[478, 764], [472, 726], [486, 704], [474, 676]], 5, 3.6, 1.8)} />
          </g>
          {/* 葉。茎に付ける。宙に浮かせない（初稿で葉が茎から離れていた） */}
          <g fill={alpha(OLIVE, 0.88)} stroke={DARK} strokeWidth="0.9">
            {[
              [80, 668, -34, 0.9, 1],
              [70, 600, 26, 0.72, 1],
              [542, 676, 30, 0.9, -1],
              [546, 618, -26, 0.7, -1],
              [474, 716, 18, 0.6, -1],
            ].map(([x, y, rot, s, dir], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${(s as number) * (dir as number)} ${s})`}>
                <path d="M0 0 C 30 -16 68 -28 100 -12 C 68 8 28 16 0 0 Z" />
                <path d="M4 -1 C 36 -10 70 -16 96 -13" fill="none" stroke={DARK} strokeWidth="1" opacity="0.5" />
              </g>
            ))}
          </g>
          {/* 巻きひげ。細部その2 */}
          <g fill="none" stroke={OLIVE} strokeWidth="1.6">
            <path d="M92 552 C 62 540 48 512 62 496 C 74 484 90 494 84 508 C 80 517 70 515 70 506" />
            <path d="M520 596 C 552 588 566 562 554 546 C 543 532 526 542 532 556 C 536 565 546 563 546 554" />
          </g>

          <Bloom x={96} y={476} r={38} rot={-12} seed={3} />
          <Bloom x={516} y={524} r={30} rot={20} seed={9} />
          <Bloom x={470} y={654} r={19} rot={-6} seed={17} />
          {/* 蕾。開いた花だけだと単調になる */}
          <g fill={alpha(TERRA, 0.85)} stroke={DARK} strokeWidth="1">
            <path d="M128 542 C 116 530 118 506 130 498 C 143 506 145 530 133 542 Z" />
            <path d="M484 596 C 474 586 476 566 486 560 C 497 566 499 586 489 596 Z" />
          </g>

          {/* ── 装飾帯。胸像をここで断ち切る。釣鐘の裾を見せない ────── */}
          <rect x="34" y="700" width="532" height="30" fill={PAPER} />
          <line x1="34" y1="700" x2="566" y2="700" stroke={DARK} strokeWidth="2.2" />
          <line x1="34" y1="706" x2="566" y2="706" stroke={GOLD} strokeWidth="1" />
          {/* 帯の繰り返し文様。丸と菱。輪光のモザイクと呼応させる */}
          {Array.from({ length: 19 }, (_, i) => {
            const x = 44 + i * 29;
            return i % 2 === 0 ? (
              <circle key={i} cx={x} cy="718" r="4" fill={alpha(TERRA, 0.85)} />
            ) : (
              <rect key={i} x={x - 3.4} y="714.6" width="6.8" height="6.8" transform={`rotate(45 ${x} 718)`} fill={alpha(OLIVE, 0.9)} />
            );
          })}
          <line x1="34" y1="730" x2="566" y2="730" stroke={DARK} strokeWidth="1.2" />
          {/* 鞭のような括弧。まっすぐな罫だけだと様式が消える */}
          <g fill={DARK}>
            <path d={taper([[64, 690], [148, 690], [182, 678], [200, 668]], 1, 3.2, 0.8)} />
            <path d={taper([[536, 690], [452, 690], [418, 678], [400, 668]], 1, 3.2, 0.8)} />
          </g>
          <text
            x="300" y="754" textAnchor="middle" fill={DARK}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="27" letterSpacing="6.5"
          >
            ART NOUVEAU
          </text>
        </g>

        {/* ── 額。角に渦を置く。四角い枠のままだと様式にならない ────── */}
        <g fill="none" stroke={DARK}>
          <rect x="22" y="22" width="556" height="756" strokeWidth="2.6" />
          <rect x="34" y="34" width="532" height="732" strokeWidth="0.9" opacity="0.65" />
        </g>
        <g fill={DARK}>
          {[
            [34, 34, 1, 1],
            [566, 34, -1, 1],
            [34, 766, 1, -1],
            [566, 766, -1, -1],
          ].map(([x, y, sx, sy], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
              <path d={taper([[0, 74], [0, 26], [26, 0], [74, 0]], 5.5, 3, 5.5)} />
              <path d={taper([[12, 52], [16, 24], [24, 16], [52, 12]], 1.2, 2.6, 1.2)} opacity="0.8" />
              <path d="M30 30 C 44 26 48 40 38 44 C 30 47 26 38 33 36" fill="none" stroke={DARK} strokeWidth="1.4" />
            </g>
          ))}
        </g>

        {/* 刷りの汚れ。少しあると印刷物に見える */}
        <g fill={DARK} opacity="0.15">
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={r(40, 560)} cy={r(40, 760)} r={r(0.5, 1.4)} />
          ))}
        </g>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.2" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
