"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
 * 索引グリッドは残したまま表示方法だけを切り替える。カード面(JobCard)には一切触れない。
 */

const AHEAD = 1; // ピント面より手前に見せる枚数（めくり終わって沈んでいく側）
/** 本物のカードを描くスロット。これ以外はぼかしきると色の板と同じなので板で描く */
const REAL_SLOTS = new Set([0, 1, 2]);
const RATIO = 47 / 34; // カードの縦横比

const COMMIT_PX = 96; // ここまで動かせば確実にめくる
const COMMIT_V = 0.6; // px/ms。勢いだけでもめくる
const V_WINDOW = 70; // 速度をとる時間窓(ms)
const AXIS_LOCK = 8; // 横に動かす意思が見えるまで掴まない
const TAP_SLOP = 10;
const TAP_MS = 400;
const RUBBER = 56; // 端で引っぱれる限界
const SPRING_K = 210;
const SPRING_C = 24;

type Stop = {
  /** カード幅に対する横ずれ */
  x: number;
  /** カード高さに対する縦ずれ */
  y: number;
  rot: number;
  scale: number;
  blur: number;
  sat: number;
  opacity: number;
  /** 上から重ねる紙色の濃さ。奥行きは「薄める」のではなく「明るくする」で出す */
  veil: number;
};

/**
 * rel（ピント面からの距離）ごとの見え方。あいだは補間する。
 * 正 = 奥、負 = 手前（近すぎてぼける側）。
 * 横ずれは1枚ごとに左右を入れ替え、縦より速く広げる（重なりは横方向で読ませる）。
 *
 * 透明にして強くぼかすと「霧」になり、四角形が消えて汚れに見える。
 * 不透明のまま紙色で明るくし、ぼかしは控えめにすると「奥にあるカード」に見える。
 */
const STOPS: Record<number, Stop> = {
  [-2]: { x: -0.66, y: 0.26, rot: -15, scale: 1.09, blur: 16, sat: 0.8, opacity: 0, veil: 0.62 },
  [-1]: { x: -0.34, y: 0.13, rot: -8.5, scale: 1.045, blur: 11, sat: 0.8, opacity: 0.42, veil: 0.62 },
  [0]: { x: 0, y: 0, rot: 0, scale: 1, blur: 0, sat: 1, opacity: 1, veil: 0 },
  [1]: { x: 0.095, y: -0.042, rot: 3.2, scale: 0.962, blur: 2, sat: 0.8, opacity: 0.78, veil: 0.42 },
  [2]: { x: -0.135, y: -0.078, rot: -5.2, scale: 0.922, blur: 4.5, sat: 0.8, opacity: 0.62, veil: 0.58 },
  [3]: { x: 0.195, y: -0.112, rot: 8, scale: 0.878, blur: 7, sat: 0.8, opacity: 0.48, veil: 0.7 },
  [4]: { x: -0.255, y: -0.145, rot: -10.5, scale: 0.83, blur: 9, sat: 0.8, opacity: 0.36, veil: 0.8 },
  [5]: { x: 0.3, y: -0.175, rot: 13, scale: 0.79, blur: 11, sat: 0.8, opacity: 0, veil: 0.85 },
};
const REL_MIN = -2;
const REL_MAX = 5;

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

function sample(rel: number): Stop {
  const r = Math.min(Math.max(rel, REL_MIN), REL_MAX);
  const lo = Math.floor(r);
  const hi = Math.min(lo + 1, REL_MAX);
  const t = r - lo;
  const a = STOPS[lo];
  const b = STOPS[hi];
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rot: lerp(a.rot, b.rot, t),
    scale: lerp(a.scale, b.scale, t),
    blur: lerp(a.blur, b.blur, t),
    sat: lerp(a.sat, b.sat, t),
    opacity: lerp(a.opacity, b.opacity, t),
    veil: lerp(a.veil, b.veil, t),
  };
}

/** 端でのゴムのような抵抗（引くほど重くなり、一定以上は動かない） */
const rubber = (d: number) =>
  Math.sign(d) * RUBBER * (1 - 1 / (Math.abs(d) / RUBBER + 1));

export default function DeckView({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const { lang } = useLang();
  const en = lang === "en";
  const total = jobs.length;
  const behind = 4;

  /** 描画に使う整数の基準。pos の四捨五入 */
  const [anchor, setAnchor] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** 表示用のカード番号（頻繁には変えない） */
  const [shown, setShown] = useState(0);

  const posRef = useRef(0);
  const anchorRef = useRef(0);
  const velRef = useRef(0); // px/s（バネ用）
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const springRef = useRef(0);
  const sideRef = useRef(-1); // めくったカードが抜けていく向き
  const samples = useRef<{ x: number; t: number }[]>([]);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  /** ドラッグを始めたときの位置。追従中に基準が動くと位置が暴走するので固定して持つ */
  const baseRef = useRef(0);
  const engaged = useRef(false);
  /** ドラッグ直後のクリックで遷移しないようにする */
  const suppress = useRef(false);
  const reducedRef = useRef(false);
  const widthRef = useRef(300);

  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const shadow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => (reducedRef.current = m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);

  /** 束の見え方をすべて posRef から描く。React を通さず直接 style を書く */
  const paint = useCallback(() => {
    const pos = posRef.current;
    const a = anchorRef.current;
    const w = widthRef.current;
    const h = w * RATIO;
    const side = sideRef.current;

    nodes.current.forEach((el, k) => {
      if (!el) return;
      const rel = a + k - pos;
      const s = sample(rel);
      // めくったカードは指を動かした向きへ抜けていく
      const sx = rel < 0 ? Math.abs(s.x) * side : s.x;
      const depth = -Math.abs(rel) * 12;
      el.style.transform =
        `translate3d(${(sx * w).toFixed(2)}px, ${(s.y * h).toFixed(2)}px, ${depth.toFixed(1)}px) ` +
        `rotateX(${(Math.min(Math.abs(rel), 3) * -1.6).toFixed(2)}deg) ` +
        `rotate(${s.rot.toFixed(2)}deg) scale(${s.scale.toFixed(4)})`;
      el.style.opacity = s.opacity.toFixed(3);
      el.style.setProperty("--veil", s.veil.toFixed(3));
      el.style.filter =
        s.blur < 0.05
          ? "none"
          : `blur(${s.blur.toFixed(2)}px) saturate(${s.sat.toFixed(2)}) brightness(1.06)`;
      el.style.zIndex = String(
        rel >= 0 ? Math.round(100 - rel * 10) : Math.round(96 + rel * 4)
      );
      el.style.pointerEvents = Math.abs(rel) < 0.5 ? "auto" : "none";
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

  /** 幅を測っておく（毎フレーム測らない） */
  useLayoutEffect(() => {
    const measure = () => {
      const el = nodes.current.get(0);
      if (el) widthRef.current = el.clientWidth || 300;
      paint();
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [paint]);

  // 描画のたび（anchor が動いたときなど）に位置を描き直す
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
      velRef.current = seedPxPerMs * 1000;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const px = posRef.current * COMMIT_PX;
        const tx = targetRef.current * COMMIT_PX;
        const acc = -SPRING_K * (px - tx) - SPRING_C * velRef.current;
        velRef.current += acc * dt;
        posRef.current = (px + velRef.current * dt) / COMMIT_PX;
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
          setShown(Math.round(posRef.current));
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

  const goTo = useCallback(
    (n: number, seed = 0) => {
      const t = Math.min(Math.max(n, 0), total - 1);
      if (t !== Math.round(posRef.current)) navigator.vibrate?.([0, 14]);
      sideRef.current = t > posRef.current ? -1 : 1;
      targetRef.current = t;
      if (reducedRef.current) {
        posRef.current = t;
        velRef.current = 0;
        paint();
        syncAnchor();
        setShown(t);
        return;
      }
      spring(seed);
    },
    [total, spring, paint, syncAnchor]
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

  // キーボード。入力欄や他の場所にいるときは奪わない
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const a = document.activeElement;
      if (a instanceof HTMLElement) {
        if (a.isContentEditable) return;
        const t = a.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
        // 束の中か、束の操作ボタンにいるときだけ効かせる
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

  // 前後は先読み
  useEffect(() => {
    for (const n of [shown + 1, shown - 1]) {
      if (n >= 0 && n < total) router.prefetch(`/jobs/${jobs[n].no}`);
    }
  }, [shown, jobs, total, router]);

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
      setShown(Math.round(posRef.current));
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

  const current = jobs[Math.min(Math.max(shown, 0), total - 1)];
  const progress = (shown / Math.max(total - 1, 1)) * 100;

  /** 束に出す枚数ぶんのスロット。key は位置なので中身が変わっても DOM は作り直さない */
  const slots: number[] = [];
  for (let k = -AHEAD; k <= behind; k++) slots.push(k);

  return (
    <div className="select-none">
      <div
        ref={stage}
        className="vja-deck relative mx-auto flex touch-pan-y items-center justify-center"
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
            // 横に動かす意思がはっきりするまでは掴まない（縦スクロールを邪魔しない）
            if (Math.abs(dx) < AXIS_LOCK || Math.abs(dx) <= Math.abs(dy)) return;
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

          sideRef.current = dx < 0 ? -1 : 1;
          const raw = baseRef.current - dx / COMMIT_PX;
          // 端では重くする
          let next = raw;
          if (raw < 0) next = rubber(raw * COMMIT_PX) / COMMIT_PX;
          else if (raw > total - 1)
            next = total - 1 + rubber((raw - (total - 1)) * COMMIT_PX) / COMMIT_PX;
          posRef.current = next;

          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = 0;
              paint();
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

          const vx = releaseV(); // px/ms（指の動き。右へ動かすと正）
          const from = Math.round(baseRef.current);
          const moved = posRef.current - from;
          // 大きく動かしたか、勢いよく払ったらめくる。
          // 勢いの向きと動かした向きが揃っているときだけ拾う（引き戻しでの誤爆を防ぐ）
          const flick =
            Math.abs(vx) > COMMIT_V &&
            Math.abs(dx) > 24 &&
            (moved === 0 || Math.sign(-vx) === Math.sign(moved));
          let target = from;
          if (Math.abs(moved) > 0.5) target = from + (moved < 0 ? -1 : 1);
          else if (flick) target = from + (vx < 0 ? 1 : -1);
          // 離した瞬間の勢いをそのままバネへ（pos の向きに合わせて符号を反転）
          goTo(target, -vx);
        }}
        onPointerCancel={() => {
          if (engaged.current) {
            engaged.current = false;
            setDragging(false);
            goTo(anchorRef.current, 0);
          }
          startRef.current = null;
        }}
      >
        <div ref={shadow} className="vja-deck-shadow" aria-hidden />

        {slots.map((k) => {
          const n = anchor + k;
          // 飾りの位置は端でも束が絶えないよう巡回させる
          const idx =
            n >= 0 && n < total ? n : total > 6 ? ((n % total) + total) % total : -1;
          if (idx < 0) return <div key={k} ref={(el) => void nodes.current.set(k, el)} />;
          const job = jobs[idx];
          return (
            <div
              key={k}
              ref={(el) => void nodes.current.set(k, el)}
              className={`vja-deck-card ${k === 0 ? "is-front" : ""}`}
              aria-hidden={k !== 0}
            >
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
                  <TiltCard variant="hero" enabled={!dragging}>
                    <JobCard job={job} />
                  </TiltCard>
                </a>
              ) : REAL_SLOTS.has(k) ? (
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
          );
        })}
      </div>

      {/* 位置と操作の案内 */}
      <div className="mt-9 flex flex-col items-center gap-4">
        <div className="flex items-center gap-7">
          <button
            onClick={() => step(-1)}
            disabled={shown === 0}
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
            disabled={shown === total - 1}
            aria-label={en ? "next card" : "次のカード"}
            className="vja-deck-nav"
          >
            <i className="vja-chev is-next" aria-hidden />
          </button>
        </div>

        <div className="vja-deck-rail" aria-hidden>
          <b style={{ width: `${progress}%` }} />
          <span style={{ left: `${progress}%` }} />
        </div>

        <p className="font-mono-label text-[9.5px] tracking-[0.3em] text-vja-ink-soft opacity-50">
          {en ? "DRAG TO FLIP · TAP TO OPEN" : "ドラッグでめくる ・ タップでひらく"}
        </p>
      </div>
    </div>
  );
}
