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

/* 髪。前の版は左右の房が顎の下で合わさり、顔のまわりに**緑の浮き輪**が
   できていた。ミュシャの髪は輪光の外へ出て、肩の高さまで落ちてから巻く。
   下の2房の終点を輪光の外へ延ばして、輪を開いてある */
const LOCKS: { inner: Cubic; outer: Cubic; n: number; seed: number; w: number }[] = [
  { inner: [[286, 196], [206, 202], [166, 266], [178, 352]], outer: [[300, 178], [166, 182], [98, 258], [104, 388]], n: 14, seed: 5, w: 7 },
  { inner: [[178, 352], [180, 456], [204, 556], [252, 626]], outer: [[104, 388], [78, 506], [104, 628], [196, 686]], n: 15, seed: 11, w: 6 },
  { inner: [[320, 196], [392, 208], [428, 266], [422, 340]], outer: [[302, 178], [432, 184], [500, 264], [484, 372]], n: 13, seed: 23, w: 7 },
  { inner: [[422, 340], [440, 426], [440, 510], [402, 574]], outer: [[484, 372], [520, 462], [522, 552], [470, 626]], n: 14, seed: 31, w: 6 },
  { inner: [[248, 258], [256, 220], [300, 206], [344, 224]], outer: [[222, 300], [234, 184], [318, 170], [380, 222]], n: 12, seed: 41, w: 5 },
];

/* 輪光の外へ跳ねる毛（アラベスク）。
   この様式の指紋は**鞭のようにうねって伸び、先で巻いて消える線**であって、
   顔でも花でもない。前の版はここが4本の短い鉤しかなく、
   輪光のまわりがただの余白だった。長く伸ばし、先を巻き込む。
   ミュシャのパネルでは、髪はほとんど必ず枠の外まで流れていく */
const FLYAWAY: Cubic[] = [
  [[112, 300], [46, 268], [30, 186], [84, 148]],
  [[84, 148], [122, 122], [156, 152], [132, 176]],
  [[104, 420], [34, 456], [18, 566], [72, 626]],
  [[72, 626], [116, 668], [160, 634], [130, 604]],
  [[492, 320], [552, 300], [566, 238], [526, 208]],
  [[526, 208], [498, 188], [474, 210], [492, 228]],
  [[478, 430], [540, 462], [552, 552], [504, 600]],
  [[504, 600], [466, 632], [430, 606], [454, 582]],
];

/**
 * 顔の抜き。左向きの横顔。
 * 前の版は細かい C を継ぎ足しただけで、額から顎までの起伏が読めなかった。
 * 横顔の輪郭は**額（凸）→ 眉間（凹）→ 鼻梁（直）→ 鼻先（凸）→ 人中（凹）
 * → 上唇（凸）→ 口（凹）→ 下唇（凸）→ 顎の窪み（凹）→ 顎（凸）**という
 * 凹凸の交替そのもの。ここを順に置き直した。
 * ミュシャの装飾パネルは、この横顔ひとつで様式が決まる。
 */
const FACE = `M 262 236
  C 240 244 226 266 220 292
  C 218 300 221 304 223 309
  C 216 321 203 335 196 347
  C 193 352 201 354 208 354
  C 213 355 213 359 210 362
  C 214 363 211 367 205 367
  C 209 370 209 371 208 373
  C 207 377 204 379 202 380
  C 209 384 213 386 214 389
  C 209 393 206 397 209 401
  C 217 409 235 415 253 414
  C 282 411 304 394 312 368
  C 320 342 320 288 306 262
  C 298 246 280 232 262 236 Z`;

/**
 * 輪郭線は**前側だけ**引く。
 * 閉じた輪郭を全周に引いたら、頬の後ろに縦の線が立って、
 * 顔が髪の上に貼った面（マスク）に見えた。
 * ミュシャの顔の後ろ側は線ではなく、髪との境目そのものである。
 */
const FACE_FRONT = `M 262 236
  C 240 244 226 266 220 292
  C 218 300 221 304 223 309
  C 216 321 203 335 196 347
  C 193 352 201 354 208 354
  C 213 355 213 359 210 362
  C 214 363 211 367 205 367
  C 209 370 209 371 208 373
  C 207 377 204 379 202 380
  C 209 384 213 386 214 389
  C 209 393 206 397 209 401
  C 217 409 235 415 253 414
  C 282 411 304 394 312 368`;

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
          <ellipse cx="296" cy="284" rx="88" ry="96" fill={shift(TERRA, -0.44)} />
          {LOCKS.map((l, gi) => (
            <path key={`e${gi}`} d={envelope(l.inner, l.outer)} fill={shift(TERRA, -0.44)} />
          ))}
          {/* 面の上に、同じ流れの明るい筋を薄く。艶が出る */}
          {LOCKS.map((l, gi) =>
            comb(l.inner, l.outer, 5, l.seed + 900).map((c, i) => (
              <path key={`h${gi}-${i}`} d={taper(c, 1, l.w * 2.2, 1)} fill={shift(TERRA, -0.1)} opacity="0.5" />
            )),
          )}
          {/* 櫛目。濃い線と金の線を混ぜる。ミュシャは髪に必ず金を差す */}
          {LOCKS.map((l, gi) =>
            comb(l.inner, l.outer, l.n, l.seed).map((c, i) => {
              const rr = rand(gi * 97 + i * 13);
              const k = rr();
              const fill = k > 0.8 ? GOLD : k > 0.58 ? shift(TERRA, -0.06) : DARK;
              return <path key={`c${gi}-${i}`} d={taper(c, 0.8, l.w * rr(0.6, 1.05), 0.6)} fill={fill} opacity={k > 0.84 ? 0.9 : 0.85} />;
            }),
          )}

          {/* 額に落ちる房。前髪が一筋もないと、髪が帽子に見える */}
          <g fill={shift(TERRA, -0.44)}>
            <path d={taper([[286, 232], [252, 240], [228, 264], [219, 292]], 15, 2, 3)} />
          </g>
          <g fill={GOLD} opacity="0.7">
            <path d={taper([[284, 238], [254, 246], [234, 266], [226, 288]], 2.4, 0.8, 0.8)} />
          </g>

          {/* 輪光の外へ跳ねる毛。数本だけ。silhouette が丸く閉じるのを防ぐ */}
          <g fill={shift(TERRA, -0.44)} opacity="0.95">
            {FLYAWAY.map((c, i) => (
              <path key={i} d={taper(c, i % 2 === 0 ? 8 : 4, i % 2 === 0 ? 5 : 2.6, 0.8)} />
            ))}
          </g>
          <g fill={GOLD} opacity="0.6">
            {FLYAWAY.map((c, i) => (
              <path key={`g${i}`} d={taper(c, 1.8, 1.1, 0.4)} />
            ))}
          </g>

          {/* ── 首。塗りを入れないと髪と輪光が透けて首が消える ───────── */}
          <path
            d="M240 408 C 243 432 241 454 241 474 C 259 494 301 494 317 470
               C 311 446 305 420 302 396 C 284 414 258 418 240 408 Z"
            fill={PAPER}
          />
          <path
            d="M240 408 C 243 432 241 454 241 474 C 259 494 301 494 317 470
               C 311 446 305 420 302 396 C 284 414 258 418 240 408 Z"
            fill={alpha(TERRA, 0.16)}
          />
          {/* 顎の落ち影。首の上端をいちばん暗くする */}
          <path d="M240 408 C 258 424 288 422 302 396 C 298 430 288 450 268 450 C 250 450 243 430 240 408 Z" fill={alpha(TERRA, 0.26)} />

          {/* ── 顔。髪から地色で抜き、上に線を乗せる ────────────────── */}
          <path d={FACE} fill={PAPER} />
          <path d={FACE} fill={alpha(TERRA, 0.12)} />
          {/* 頬と顎下の陰。面はここだけ。無いと顔が紙のまま浮く */}
          <path d="M228 316 C 242 336 246 362 238 386 C 227 364 220 338 228 316 Z" fill={alpha(TERRA, 0.18)} />
          <path d="M212 404 C 236 418 268 418 290 402 C 280 424 236 428 212 404 Z" fill={alpha(TERRA, 0.24)} />
          {/* 頬骨の下。ミュシャの顔は面が2段（頬の陰と顎の陰）しかない。
              3段以上入れると挿絵の陰影になって、装飾パネルから外れる */}
          <path d="M242 324 C 264 334 278 352 276 374 C 258 366 244 346 242 324 Z"
                fill={alpha(TERRA, 0.085)} />
          <g fill="none" stroke={DARK} strokeLinecap="round">
            <path d={FACE_FRONT} strokeWidth="2.2" />
            {/* 目。伏し目。上瞼を太く、下瞼を細く。横顔なので前が尖る */}
            <path d="M219 304 C 233 289 259 289 277 301" strokeWidth="3.3" />
            <path d="M222 308 C 236 321 260 320 275 305" strokeWidth="1.2" />
            <path d="M238 304 C 245 312 255 312 261 303" strokeWidth="2.4" opacity="0.85" />
            {/* 睫毛。3本だけ。これが無いと伏し目に見えない */}
            <path d="M222 302 L 215 297" strokeWidth="1.1" />
            <path d="M228 297 L 224 290" strokeWidth="1.1" />
            <path d="M237 294 L 235 286" strokeWidth="1" />
            {/* 眉 */}
            <path d="M221 283 C 237 269 263 270 281 280" strokeWidth="2.4" opacity="0.9" />
            {/* 小鼻と唇。上唇と下唇を別に引く。1本で済ませると線に見える */}
            <path d="M206 348 C 213 345 219 345 223 348" strokeWidth="1.1" opacity="0.8" />
            <path d="M202 366 C 213 360 227 361 236 368" strokeWidth="1.9" />
            <path d="M203 370 C 214 379 229 376 236 368" strokeWidth="1.5" />
            {/* 首 */}
            <path d="M240 410 C 243 434 241 456 241 474" strokeWidth="2" />
            <path d="M303 398 C 308 422 313 446 317 470" strokeWidth="2" />
          </g>
          {/* 前は頬の外にもう1本落としていたが、顔の輪郭線を前側だけにした結果、
              その線だけが宙に立って引っかき傷に見えた。消した */}
          {/* 房の先。内へ巻き戻して線を消す。輪を置くと浮いて見えた（四稿目） */}
          <g fill={DARK} opacity="0.9">
            <path d={taper([[196, 686], [244, 704], [280, 680], [258, 648]], 4, 2.8, 0.5)} />
            <path d={taper([[470, 626], [424, 650], [388, 626], [410, 596]], 3.8, 2.6, 0.5)} />
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
