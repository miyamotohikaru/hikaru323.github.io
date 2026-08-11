"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/JobCard";
import TiltCard from "@/components/TiltCard";
import { Job } from "@/data/jobs";
import { useLang } from "@/lib/lang";
import { saveReturn } from "@/lib/returnNav";

/**
 * デッキ表示。151枚を「束」として見せ、指で送る。
 *
 * 位置は整数ではなく小数(pos)で持つ。3.42 なら 3番と4番のあいだ、という状態を
 * そのまま持てるので、指の動きと束の見え方が最後まで地続きになる。
 * カードは pos との差(rel)だけで見え方が決まり、次のカードが「瞬間で入れ替わる」ことがない。
 *
 * めくり方(FLIPS)は、この rel → 見え方 の対応表を差し替えるだけで切り替わる。
 * 索引グリッドは残したまま表示方法だけを切り替える。カード面(JobCard)には一切触れない。
 */

const RATIO = 47 / 34; // カードの縦横比

const V_WINDOW = 70; // 速度をとる時間窓(ms)
const AXIS_LOCK = 5; // 横に動かす意思が見えたら掴む(px)
const TAP_SLOP = 10;
const TAP_MS = 400;
/** 離した瞬間の速さから、どれだけ滑らせるか(ms) */
const MOMENTUM_MS = 150;
/** 一度に送る上限(枚) */
const MAX_GLIDE = 40;
const SPRING_K = 210;
const SPRING_C = 24;

type Stop = {
  /** カード幅に対する横ずれ */
  x: number;
  /** カード高さに対する縦ずれ */
  y: number;
  /** 画面内での回転 */
  rot: number;
  /** 縦軸まわりの回転（ページをめくる動き・円弧上の回り込み） */
  rotY: number;
  /** 奥行き。カード幅に対する比。負ほど奥 */
  z: number;
  scale: number;
  blur: number;
  sat: number;
  opacity: number;
  /** 上から重ねる地色の濃さ。奥行きは「薄める」のではなく「地の色へ寄せる」で出す */
  veil: number;
  /** セピアへ寄せる量。カードごとの色相を暖色軸へ畳んで、束の中で色が浮かないようにする */
  tone: number;
};

const base: Stop = {
  x: 0,
  y: 0,
  rot: 0,
  rotY: 0,
  z: 0,
  scale: 1,
  blur: 0,
  sat: 0.55,
  opacity: 1,
  veil: 0,
  tone: 1,
};
const S = (o: Partial<Stop>): Stop => ({ ...base, ...o });
/** ピント面。ここだけは色も彩度も素のまま */
const FOCUS = S({ sat: 1, tone: 0 });

export type FlipId = "stack" | "rail" | "arc" | "toss" | "fan" | "turn";

type Flip = {
  id: FlipId;
  ja: string;
  en: string;
  /** rel ごとの見え方。あいだは補間する */
  stops: Record<number, Stop>;
  min: number;
  max: number;
  /** 手前側／奥側に何枚出すか */
  ahead: number;
  behind: number;
  /** 本物のカードを描くスロット */
  real: number[];
  /**
   * 触る端末で本物のカードを描くスロット。描画を軽くするため既定では減らすが、
   * 左右に並ぶ案では両隣を必ず本物にする（片側だけ中身のない板になってしまうため）
   */
  realTouch: number[];
  origin: string;
  /** 遠近の強さ。カード幅に対する比 */
  perspectiveW: number;
  /** カード1枚ぶん送るのに要る指の移動距離（カード幅に対する比） */
  travel: number;
  /** 束の上下に要る余白（カード幅に対する比） */
  pad: number;
  /** 携帯でのカード幅（画面幅に対する%）。省略時は72 */
  narrowVW?: number;
  /** 手前に外れた板を地の色より沈ませるか */
  nearDark: boolean;
};

/** 円弧は円筒に貼った回転台。位置は10個で一周する */
const ARC_FACES = 10;
/** 円筒の半径（カード幅に対する比）。大きいほどカード同士の隙間が開く */
const ARC_R = 1.85;
/** 円弧の遠近の強さ（カード幅に対する比） */
const ARC_PERSP = 3.2;
/** 90度を越えた位置のカードは裏を向く。そこは背面として描く */
const arcIsBack = (n: number) => Math.abs(((360 / ARC_FACES) * n) % 360) > 90;

/**
 * 円弧の並びを、円筒に貼った回転台としてつくる。
 *
 * 奥へ一列に退かせる並べ方だと、横幅をいくらでも食うので携帯に収まらない。
 * 円筒なら、正面の数枚のほかは向こう側へ回り込むだけなので幅を食わず、
 * カード同士の隙間から裏を向いたカードの背面が覗いて「一周ぶんある」と分かる。
 */
function arcStops(): Record<number, Stop> {
  const out: Record<number, Stop> = { 0: FOCUS };
  // 背面は暗さを残す。地の色で薄めすぎると、灰色の壁が一枚あるように見えてしまう
  const veil = [0, 0.18, 0.35, 0.26, 0.34, 0.4, 0.4];
  const blur = [0, 0, 2, 0, 0, 0, 0];
  for (let n = -5; n <= 6; n++) {
    if (n === 0) continue;
    const deg = (360 / ARC_FACES) * n;
    const th = (deg * Math.PI) / 180;
    const a = Math.min(Math.abs(n), 6);
    out[n] = S({
      x: ARC_R * Math.sin(th),
      z: ARC_R * (Math.cos(th) - 1),
      rotY: deg, // 円筒の接線に沿わせる
      veil: veil[a],
      blur: blur[a],
    });
  }
  return out;
}

export const FLIPS: Flip[] = [
  {
    // 奥へ重なっていく束。手前に一枚外れることで被写界深度になる
    id: "stack",
    ja: "束",
    en: "STACK",
    min: -2,
    max: 5,
    ahead: 1,
    behind: 4,
    real: [0, 1, 2],
    realTouch: [0, 1],
    origin: "50% 92%",
    perspectiveW: 3.4,
    travel: 0.34,
    pad: 0.14,
    nearDark: true,
    stops: {
      [-2]: S({ x: -0.66, y: 0.26, rot: -15, scale: 1.09, blur: 16, opacity: 0, veil: 0.6 }),
      [-1]: S({ x: -0.34, y: 0.13, rot: -8.5, scale: 1.045, blur: 11, veil: 0.6 }),
      [0]: FOCUS,
      [1]: S({ x: 0.095, y: -0.042, rot: 3.2, scale: 0.962, blur: 2, opacity: 0.78, veil: 0.5 }),
      [2]: S({ x: -0.135, y: -0.078, rot: -5.2, scale: 0.922, blur: 4.5, opacity: 0.62, veil: 0.62 }),
      [3]: S({ x: 0.195, y: -0.112, rot: 8, scale: 0.878, blur: 7, opacity: 0.48, veil: 0.72 }),
      [4]: S({ x: -0.255, y: -0.145, rot: -10.5, scale: 0.83, blur: 9, opacity: 0.36, veil: 0.82 }),
      [5]: S({ x: 0.3, y: -0.175, rot: 13, scale: 0.79, blur: 11, opacity: 0, veil: 0.86 }),
    },
  },
  {
    // 平らな一列。前後のカードが両脇から覗くので、いま何番めかが分かりやすい
    id: "rail",
    ja: "横ながし",
    en: "RAIL",
    min: -3,
    max: 3,
    ahead: 3,
    behind: 3,
    real: [0, 1, -1],
    realTouch: [0, 1, -1],
    origin: "50% 50%",
    perspectiveW: 3.2,
    travel: 0.5,
    pad: 0.1,
    nearDark: false,
    stops: {
      // 間隔は等しく。ここが不揃いだと、同じだけ指を動かしても
      // 束のどこにいるかで送りの速さが変わってしまう
      [-3]: S({ x: -2.58, scale: 0.8, blur: 10, opacity: 0, veil: 0.7 }),
      [-2]: S({ x: -1.72, scale: 0.865, blur: 6, opacity: 0.55, veil: 0.52 }),
      [-1]: S({ x: -0.86, scale: 0.93, blur: 2, veil: 0.28 }),
      [0]: FOCUS,
      [1]: S({ x: 0.86, scale: 0.93, blur: 2, veil: 0.28 }),
      [2]: S({ x: 1.72, scale: 0.865, blur: 6, opacity: 0.55, veil: 0.52 }),
      [3]: S({ x: 2.58, scale: 0.8, blur: 10, opacity: 0, veil: 0.7 }),
    },
  },
  {
    // 円筒に貼った回転台。隙間から裏を向いたカードが覗き、一周ぶんの厚みが見える
    id: "arc",
    ja: "円弧",
    en: "ARC",
    min: -5,
    max: 6,
    ahead: 4,
    behind: 5,
    real: [0, 1, -1, 2, -2],
    realTouch: [0, 1, -1],
    origin: "50% 50%",
    perspectiveW: ARC_PERSP,
    travel: 0.5,
    pad: 0.1,
    // 回転台は横に場所が要るので、携帯ではカードを一回り小さくして並ぶ余地をつくる
    narrowVW: 55,
    nearDark: false,
    stops: arcStops(),
  },
  {
    // 手札から一枚ずつ放る。抜けていくカードは色を保ったまま大きく回る
    id: "toss",
    ja: "投げ",
    en: "TOSS",
    min: -2,
    max: 4,
    ahead: 1,
    behind: 3,
    real: [0, 1],
    realTouch: [0, 1],
    origin: "50% 50%",
    perspectiveW: 2.7,
    travel: 0.34,
    pad: 0.12,
    nearDark: false,
    stops: {
      // 放ったカードは画面の外へ消える。止まっているあいだ横に幽霊を残さない
      [-2]: S({ x: -2.1, y: 0.3, rot: -40, opacity: 0, tone: 0, sat: 1 }),
      [-1]: S({ x: -1.15, y: 0.12, rot: -20, opacity: 0, tone: 0, sat: 1 }),
      [0]: FOCUS,
      // 縮小ぶんに埋もれないよう、上端がきちんと覗く量だけ持ち上げる
      [1]: S({ y: -0.052, scale: 0.955, veil: 0.18, sat: 0.7 }),
      [2]: S({ y: -0.09, scale: 0.915, veil: 0.32, sat: 0.6 }),
      [3]: S({ y: -0.122, scale: 0.88, veil: 0.44 }),
      [4]: S({ y: -0.148, scale: 0.85, opacity: 0, veil: 0.54 }),
    },
  },
  {
    // 遠い支点を中心に開く扇。紙の束を手で広げたときの並び
    id: "fan",
    ja: "扇",
    en: "FAN",
    min: -2,
    max: 5,
    ahead: 2,
    behind: 4,
    // 扇は左右どちらにも開くので、手前側にも本物のカードを1枚置く
    real: [0, 1, -1, 2],
    realTouch: [0, 1, -1],
    origin: "50% 260%",
    perspectiveW: 3.6,
    travel: 0.34,
    pad: 0.22,
    nearDark: false,
    stops: {
      [-2]: S({ rot: -16, y: 0.04, scale: 1.02, blur: 6, opacity: 0, veil: 0.56 }),
      [-1]: S({ rot: -8, y: 0.015, scale: 1.01, blur: 2, opacity: 0.8, veil: 0.42 }),
      [0]: FOCUS,
      [1]: S({ rot: 8, y: 0.015, scale: 0.99, blur: 1.5, opacity: 0.8, veil: 0.42 }),
      [2]: S({ rot: 16, y: 0.04, scale: 0.975, blur: 3.5, opacity: 0.66, veil: 0.56 }),
      [3]: S({ rot: 24, y: 0.075, scale: 0.955, blur: 6, opacity: 0.5, veil: 0.68 }),
      [4]: S({ rot: 32, y: 0.12, scale: 0.93, blur: 8, opacity: 0.34, veil: 0.78 }),
      [5]: S({ rot: 40, y: 0.17, scale: 0.9, blur: 10, opacity: 0, veil: 0.84 }),
    },
  },
  {
    // 本のページのように左端を軸にして裏返る
    id: "turn",
    ja: "ページ",
    en: "TURN",
    min: -2,
    max: 4,
    ahead: 1,
    behind: 3,
    real: [0, 1],
    realTouch: [0, 1],
    origin: "0% 50%",
    perspectiveW: 2.5,
    travel: 0.4,
    pad: 0.12,
    nearDark: false,
    stops: {
      [-2]: S({ rotY: -150, x: 0.1, opacity: 0, tone: 0, sat: 1 }),
      [-1]: S({ rotY: -100, x: 0.04, opacity: 0.35, tone: 0, sat: 1 }),
      [0]: FOCUS,
      [1]: S({ y: -0.012, scale: 0.985, veil: 0.12, sat: 0.7 }),
      [2]: S({ y: -0.024, scale: 0.97, veil: 0.24 }),
      [3]: S({ y: -0.034, scale: 0.956, veil: 0.36 }),
      [4]: S({ y: -0.042, scale: 0.944, opacity: 0, veil: 0.46 }),
    },
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * 束のまわりの色は「奥行き」だけで決める。
 * カードの色相をそのまま出すと、たまたま次に並んでいる4枚が緑・紫・オリーブ・水色
 * だったときに束のまわりが苔色になる——つまりページの空気が
 * データの並び順で決まってしまう。明るさだけをもらい、色相は紙の側に固定する。
 */
function plateColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum =
    (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  const t = Math.min(Math.max(1 - lum, 0.22), 0.55);
  return `color-mix(in oklab, #cfc6ae ${Math.round(t * 100)}%, var(--vja-paper))`;
}

function sample(flip: Flip, rel: number): Stop {
  const r = Math.min(Math.max(rel, flip.min), flip.max);
  const lo = Math.floor(r);
  const hi = Math.min(lo + 1, flip.max);
  const t = r - lo;
  const a = flip.stops[lo] ?? FOCUS;
  const b = flip.stops[hi] ?? a;
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rot: lerp(a.rot, b.rot, t),
    rotY: lerp(a.rotY, b.rotY, t),
    z: lerp(a.z, b.z, t),
    scale: lerp(a.scale, b.scale, t),
    blur: lerp(a.blur, b.blur, t),
    sat: lerp(a.sat, b.sat, t),
    opacity: lerp(a.opacity, b.opacity, t),
    veil: lerp(a.veil, b.veil, t),
    tone: lerp(a.tone, b.tone, t),
  };
}

/** 端でのゴムのような抵抗（引くほど重くなり、一定以上は動かない） */
const rubber = (d: number, max: number) =>
  Math.sign(d) * max * (1 - 1 / (Math.abs(d) / max + 1));

export default function DeckView({
  jobs,
  flip: flipId = "stack",
}: {
  jobs: Job[];
  flip?: FlipId;
}) {
  const router = useRouter();
  const { lang } = useLang();
  const en = lang === "en";
  const total = jobs.length;

  const flip = useMemo(() => FLIPS.find((f) => f.id === flipId) ?? FLIPS[0], [flipId]);

  /** 描画に使う整数の基準。pos の四捨五入 */
  const [anchor, setAnchor] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** 指で操作している端末か。触る端末では傾き効果を止め、実カードの枚数も減らす */
  const [touch, setTouch] = useState(false);

  const posRef = useRef(0);
  const anchorRef = useRef(0);
  const velRef = useRef(0); // px/s（バネ用）
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const springRef = useRef(0);
  const samples = useRef<{ x: number; t: number }[]>([]);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  /** ドラッグを始めたときの位置。追従中に基準が動くと位置が暴走するので固定して持つ */
  const baseRef = useRef(0);
  const engaged = useRef(false);
  /** ドラッグ直後のクリックで遷移しないようにする */
  const suppress = useRef(false);
  const reducedRef = useRef(false);
  const widthRef = useRef(300);
  /** カード1枚ぶんの指の移動距離(px)。画面の大きさに比例させる */
  const travelRef = useRef(96);
  const flipRef = useRef(flip);
  flipRef.current = flip;

  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const shadow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTouch(matchMedia("(hover: none)").matches);
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => (reducedRef.current = m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);

  /**
   * 束の見え方をすべて posRef から描く。React を通さず直接 style を書く。
   * withFilter=false のときは ぼかし/セピア を触らない。
   * ぼかしは値が変わるたびに描き直しが起きるので、指で追従している最中は固定する。
   */
  const paint = useCallback((withFilter = true) => {
    const f = flipRef.current;
    const pos = posRef.current;
    const a = anchorRef.current;
    const w = widthRef.current;
    const h = w * RATIO;

    nodes.current.forEach((el, k) => {
      if (!el) return;
      const rel = a + k - pos;
      const s = sample(f, rel);
      // 位置はピント面からの距離だけで決める。指を動かした向きで左右を入れ替えると、
      // 逆向きに引いた瞬間に「前のカード」が反対側へ飛び、送り方が左右で変わってしまう
      const depth = s.z * w;
      el.style.transform =
        `translate3d(${(s.x * w).toFixed(2)}px, ${(s.y * h).toFixed(2)}px, ${depth.toFixed(1)}px) ` +
        `rotateX(${(Math.min(Math.abs(rel), 3) * -1.6).toFixed(2)}deg) ` +
        `rotateY(${s.rotY.toFixed(2)}deg) ` +
        `rotate(${s.rot.toFixed(2)}deg) scale(${s.scale.toFixed(4)})`;
      el.style.opacity = s.opacity.toFixed(3);
      el.style.setProperty("--veil", s.veil.toFixed(3));
      el.style.zIndex = String(
        rel >= 0 ? Math.round(100 - rel * 10) : Math.round(96 + rel * 4)
      );
      el.style.pointerEvents = Math.abs(rel) < 0.5 ? "auto" : "none";

      if (!withFilter) return;
      // ぼかしとセピアはカードの絵柄だけに掛ける。
      // 地の色をかぶせる膜(::after)まで一緒にセピアにすると、束全体が黄色く濁る。
      // sepia は「どんな色相でも必ず R>G>B の暖色軸に畳む」唯一の操作で、
      // saturate では色相のずれの符号が残るため緑のカードは緑のまま浮いてしまう。
      const face = el.firstElementChild as HTMLElement | null;
      if (face) {
        face.style.filter =
          s.blur < 0.05 && s.tone < 0.01
            ? "none"
            : `blur(${s.blur.toFixed(2)}px) sepia(${s.tone.toFixed(3)}) saturate(${s.sat.toFixed(2)})`;
      }
    });

    // 影も束の動きに連れて動く
    const sh = shadow.current;
    if (sh) {
      const off = (pos - Math.round(pos)) * w * 0.16;
      const p = Math.min(Math.abs(pos - Math.round(pos)) * 2, 1);
      sh.style.transform = `translate(-50%, calc(var(--deck-w) * 0.691 - 6px)) translateX(${off.toFixed(1)}px) scale(${(1 - p * 0.1).toFixed(3)})`;
      sh.style.opacity = (1 - p * 0.3).toFixed(3);
    }
  }, []);

  /** 幅を測っておく（毎フレーム測らない）。送りに要る距離も画面の大きさに比例させる */
  useLayoutEffect(() => {
    const measure = () => {
      const el = nodes.current.get(0);
      if (el) widthRef.current = el.clientWidth || 300;
      travelRef.current = Math.min(
        Math.max(widthRef.current * flipRef.current.travel, 56),
        150
      );
      paint();
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [paint, flip]);

  // 描画のたび（anchor やめくり方が変わったときなど）に位置を描き直す
  useLayoutEffect(() => {
    anchorRef.current = anchor;
    paint();
  });

  const syncAnchor = useCallback(() => {
    const a = Math.round(posRef.current);
    if (a !== anchorRef.current) {
      anchorRef.current = a;
      setAnchor(a);
    }
  }, []);

  /** バネで target まで運ぶ。離した瞬間の勢いをそのまま引き継ぐ */
  const spring = useCallback(
    (seedPxPerMs: number) => {
      const travel = travelRef.current;
      velRef.current = seedPxPerMs * 1000;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const px = posRef.current * travel;
        const tx = targetRef.current * travel;
        const acc = -SPRING_K * (px - tx) - SPRING_C * velRef.current;
        velRef.current += acc * dt;
        posRef.current = (px + velRef.current * dt) / travel;
        paint();
        syncAnchor();
        if (
          Math.abs(posRef.current - targetRef.current) < 0.002 &&
          Math.abs(velRef.current) < 0.6
        ) {
          posRef.current = targetRef.current;
          velRef.current = 0;
          paint();
          syncAnchor();
          springRef.current = 0;
          return;
        }
        springRef.current = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(springRef.current);
      springRef.current = requestAnimationFrame(tick);
    },
    [paint, syncAnchor]
  );

  /** 遠くへ送るときの動き。最初は速く、最後にすっと止まる */
  const glideTo = useCallback(
    (target: number) => {
      const from = posRef.current;
      const d = Math.abs(target - from);
      const dur = Math.min(300 + 55 * d, 950);
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        posRef.current = from + (target - from) * e;
        paint();
        syncAnchor();
        if (t < 1) {
          springRef.current = requestAnimationFrame(tick);
          return;
        }
        posRef.current = target;
        velRef.current = 0;
        paint();
        syncAnchor();
        springRef.current = 0;
      };
      cancelAnimationFrame(springRef.current);
      springRef.current = requestAnimationFrame(tick);
    },
    [paint, syncAnchor]
  );

  const goTo = useCallback(
    (n: number, seed = 0) => {
      const t = Math.min(Math.max(n, 0), total - 1);
      if (t !== Math.round(posRef.current)) navigator.vibrate?.([0, 14]);
      targetRef.current = t;
      if (reducedRef.current) {
        posRef.current = t;
        velRef.current = 0;
        paint();
        syncAnchor();
        return;
      }
      // 隣へ動くだけならバネ（手応えのある戻り）。
      // 遠くへ送るときはバネだと一瞬で飛んでしまうので、束が回る時間をつくる
      if (Math.abs(t - posRef.current) > 1.5) glideTo(t);
      else spring(seed);
    },
    [total, spring, glideTo, paint, syncAnchor]
  );

  const step = useCallback(
    (dir: 1 | -1) => goTo(Math.round(posRef.current) + dir),
    [goTo]
  );

  /** 直近だけを見た瞬間の速度。ゆっくり引いてから弾く操作も拾える */
  const releaseV = useCallback(() => {
    const s = samples.current;
    const now = performance.now();
    if (s.length < 2) return 0;
    let old = s[0];
    for (const p of s) {
      if (now - p.t <= V_WINDOW) {
        old = p;
        break;
      }
    }
    const dt = now - old.t;
    return dt > 4 ? (s[s.length - 1].x - old.x) / dt : 0;
  }, []);

  /** 指を離した／取り上げられたときの後始末。行き先を決めてバネに渡す */
  /**
   * 指を離したあとの行き先を決める。
   * 離した瞬間の速さぶんだけ滑らせてから、いちばん近いカードで止まる。
   * ここを ±1 に丸めてしまうと、どれだけ勢いよく払っても1枚しか進まない。
   */
  const settle = useCallback(() => {
    const vx = releaseV(); // px/ms（指の動き。右へ動かすと正）
    const travel = travelRef.current;
    // 速さ(px/ms)を「枚/ms」に直し、滑る時間ぶんだけ先へ送る
    const glide = Math.min(
      Math.max((-vx / travel) * MOMENTUM_MS, -MAX_GLIDE),
      MAX_GLIDE
    );
    let target = Math.round(posRef.current + glide);
    // ほとんど動かしていない指離しでは、いまのカードに留まる
    const base = Math.round(baseRef.current);
    if (Math.abs(posRef.current - base) < 0.06 && Math.abs(glide) < 0.5) target = base;
    goTo(target, -vx);
  }, [releaseV, goTo]);

  // キーボード。入力欄や他の場所にいるときは奪わない
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const a = document.activeElement;
      if (a instanceof HTMLElement) {
        if (a.isContentEditable) return;
        const t = a.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
        if (!stage.current?.contains(a) && !a.closest(".vja-deck-nav")) return;
      }
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // ホイール／トラックパッド。1回のはらいで1枚だけ送る
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let lastT = 0;
    let cooldown = 0;
    let axis: "x" | "y" | null = null;
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const u = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const dx = e.deltaX * u;
      const dy = e.deltaY * u;
      if (now - lastT > 180) {
        acc = 0;
        axis = null;
      }
      lastT = now;
      if (!axis) axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      if (axis === "y") return; // 縦は素直にページを送らせる
      e.preventDefault();
      if (now < cooldown) return; // 慣性スクロールの尾を捨てる
      acc += dx;
      if (Math.abs(acc) > 90) {
        stepRef.current(acc > 0 ? 1 : -1);
        acc = 0;
        cooldown = now + 320;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // 前後は先読み。長く送っているあいだは通り過ぎるだけなので、止まってから読む
  useEffect(() => {
    const id = setTimeout(() => {
      for (const n of [anchor + 1, anchor - 1]) {
        if (n >= 0 && n < total) router.prefetch(`/jobs/${jobs[n].no}`);
      }
    }, 260);
    return () => clearTimeout(id);
  }, [anchor, jobs, total, router]);

  // タブを離れると requestAnimationFrame が止まるので、中途半端な位置で
  // 固まらないよう、隠れた時点で目的の位置へ寄せておく
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== "hidden") return;
      cancelAnimationFrame(springRef.current);
      springRef.current = 0;
      posRef.current = targetRef.current;
      velRef.current = 0;
      paint();
      syncAnchor();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [paint, syncAnchor]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(springRef.current);
    },
    []
  );

  const current = jobs[Math.min(Math.max(anchor, 0), total - 1)];
  const progress = (anchor / Math.max(total - 1, 1)) * 100;

  /** 束に出す枚数ぶんのスロット。key は位置なので中身が変わっても DOM は作り直さない */
  const slots: number[] = [];
  for (let k = -flip.ahead; k <= flip.behind; k++) slots.push(k);
  // 触る端末では本物のカードを2枚までにして、ぼかしと画像の負担を減らす
  const realSlots = new Set(touch ? flip.realTouch : flip.real);

  return (
    <div className="select-none">
      <div
        ref={stage}
        className="vja-deck relative mx-auto flex items-center justify-center"
        data-flip={flip.id}
        style={{
          ["--deck-origin" as string]: flip.origin,
          ["--deck-persp" as string]: `calc(var(--deck-w) * ${flip.perspectiveW})`,
          // 画面の高さからカード幅を決めるときは、めくり方ごとの余白ぶんも見込む
          ["--deck-fit" as string]: (1.382 + flip.pad).toFixed(3),
          ["--deck-vw" as string]: `${flip.narrowVW ?? 72}`,
        }}
        onPointerDown={(e) => {
          if (reducedRef.current) return;
          cancelAnimationFrame(springRef.current);
          springRef.current = 0;
          startRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
          samples.current = [{ x: e.clientX, t: performance.now() }];
          baseRef.current = posRef.current;
          engaged.current = false;
        }}
        onPointerMove={(e) => {
          const s = startRef.current;
          if (!s) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (!engaged.current) {
            // 横に動かす意思が出たら掴む。縦に流れているうちは触らず、
            // ページのスクロールをそのまま通す
            if (Math.abs(dx) < AXIS_LOCK || Math.abs(dx) < Math.abs(dy) * 0.9) return;
            engaged.current = true;
            setDragging(true);
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {
              /* 捕まえられなくても追従自体は続けられる */
            }
          }
          samples.current.push({ x: e.clientX, t: performance.now() });
          if (samples.current.length > 6) samples.current.shift();

          const travel = travelRef.current;
          const raw = baseRef.current - dx / travel;
          // 端では重くする
          let next = raw;
          if (raw < 0) next = rubber(raw * travel, travel * 0.6) / travel;
          else if (raw > total - 1)
            next =
              total - 1 + rubber((raw - (total - 1)) * travel, travel * 0.6) / travel;
          posRef.current = next;

          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = 0;
              // 追従中はぼかしを触らない（値が変わるたび描き直しが起きて重くなる）
              paint(false);
              syncAnchor();
            });
          }
        }}
        onPointerUp={(e) => {
          const s = startRef.current;
          startRef.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          const dt = performance.now() - s.t;

          if (!engaged.current) {
            // 動いていなければタップ。遷移そのものは前面カードのリンクに任せる
            suppress.current = !(
              Math.abs(dx) < TAP_SLOP &&
              Math.abs(dy) < TAP_SLOP &&
              dt < TAP_MS
            );
            return;
          }
          suppress.current = true;
          engaged.current = false;
          setDragging(false);
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* すでに離れている場合は何もしなくてよい */
          }
          settle();
        }}
        onPointerCancel={() => {
          startRef.current = null;
          if (!engaged.current) return;
          engaged.current = false;
          setDragging(false);
          // 取り上げられた場合も、いちばん近いカードへ寄せる（元に戻すと操作が消える）
          settle();
        }}
      >
        <div ref={shadow} className="vja-deck-shadow" aria-hidden />

        {slots.map((k) => {
          const n = anchor + k;
          // 飾りの位置は端でも束が絶えないよう巡回させる
          const idx =
            n >= 0 && n < total ? n : total > 6 ? ((n % total) + total) % total : -1;
          if (idx < 0)
            return (
              <div
                key={k}
                ref={(el) => void nodes.current.set(k, el)}
                className="vja-deck-card"
              >
                <div className="vja-deck-face" />
              </div>
            );
          const job = jobs[idx];
          // 円筒の向こう側に回り込んだ位置は、カードの裏面として描く
          const back = flip.id === "arc" && arcIsBack(k);
          return (
            <div
              key={k}
              ref={(el) => void nodes.current.set(k, el)}
              className={`vja-deck-card ${k === 0 ? "is-front" : ""} ${
                k < 0 && flip.nearDark ? "is-near" : ""
              } ${back ? "is-back" : ""}`}
              aria-hidden={k !== 0}
            >
              {/* 絵柄はこの中。ぼかしとセピアはここにだけ掛け、膜(::after)は素のまま残す */}
              <div className="vja-deck-face">
                {k === 0 ? (
                  <a
                    href={`/jobs/${job.no}`}
                    className="vja-deck-hit block"
                    draggable={false}
                    onClick={(ev) => {
                      // ドラッグの流れで出たクリックでは遷移させない
                      if (suppress.current) {
                        suppress.current = false;
                        ev.preventDefault();
                        return;
                      }
                      navigator.vibrate?.([0, 12]);
                      saveReturn();
                    }}
                  >
                    {/* 指で触る端末では傾き効果を止める（ドラッグと取り合いになる） */}
                    <TiltCard variant="hero" enabled={!dragging && !touch}>
                      <JobCard job={job} />
                    </TiltCard>
                  </a>
                ) : back ? (
                  <div className="vja-deck-back" aria-hidden />
                ) : realSlots.has(k) ? (
                  <JobCard job={job} />
                ) : (
                  // ぼかしきったカードは色の板と見分けがつかないので板で描く
                  <div
                    className="vja-deck-proxy"
                    style={{ background: plateColor(job.color) }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 位置と操作の案内 */}
      <div className="mt-6 flex flex-col items-center md:mt-9">
        <div className="flex items-center gap-7">
          <button
            onClick={() => step(-1)}
            disabled={anchor === 0}
            aria-label={en ? "previous card" : "前のカード"}
            className="vja-deck-nav"
          >
            <i className="vja-chev is-prev" aria-hidden />
          </button>
          <p
            className="font-mono-label text-xs tracking-[0.32em] tabular-nums text-vja-ink-soft"
            aria-live="polite"
          >
            {current.no}
            <span className="opacity-35"> / {String(total).padStart(3, "0")}</span>
          </p>
          <button
            onClick={() => step(1)}
            disabled={anchor === total - 1}
            aria-label={en ? "next card" : "次のカード"}
            className="vja-deck-nav"
          >
            <i className="vja-chev is-next" aria-hidden />
          </button>
        </div>

        {/* レールは番号の付属物として近づけ、案内文だけを離す */}
        <div className="vja-deck-rail mt-2.5" aria-hidden>
          <b style={{ width: `${progress}%` }} />
          <span style={{ left: `${progress}%` }} />
        </div>

        <p className="mt-4 font-mono-label text-[9.5px] tracking-[0.3em] text-vja-ink-soft opacity-50">
          {en ? "DRAG TO FLIP · TAP TO OPEN" : "ドラッグでめくる ・ タップでひらく"}
        </p>
      </div>
    </div>
  );
}
