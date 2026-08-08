"use client";

// チャーム(10本刺すごとに手に入る、剣にぶら下げるかざり)の棚と、獲得の瞬間のお祝い。
//
// 絵柄は絵文字をやめて、12種の「形」そのものを描いている。理由は2つ:
//  1. 12px前後の絵文字は潰れて泥にしか見えない(ハート/よつば/おはなが区別できない)
//  2. 3D(src/game/scene/sword/charmGeometry.ts)と同じ式から輪郭を作れば、
//     剣にぶら下がっている粒とコレクションの絵が食い違わない
// 見せかたは「獲得済み = フルカラー + 縁取り」「未獲得 = 形のシルエット」。
// 逆にすると、がんばって集めたものがいちばん目立たない棚になってしまう。

import { useEffect, useId, useState, type CSSProperties } from "react";
import {
  CHARMS,
  charmLevelOf,
  NORMAL_CHARM_COUNT,
  type CharmShape,
} from "@/lib/config";
import { useGameStore } from "@/game/store";
import { onGameEvent } from "@/game/events";

// ── 輪郭づくり(3Dの charmGeometry.ts と同じ式) ──────────────
type Pt = [number, number];
const TAU = Math.PI * 2;

function polar(n: number, r: (a: number) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    out.push([Math.cos(a) * r(a), Math.sin(a) * r(a)]);
  }
  return out;
}
function rotate(pts: Pt[], t: number): Pt[] {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return pts.map(([x, y]) => [x * c - y * s, x * s + y * c]);
}
function quad(p0: Pt, c: Pt, p1: Pt, n = 8): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
    ]);
  }
  return out;
}
function cubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u ** 3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p1[0],
      u ** 3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p1[1],
    ]);
  }
  return out;
}
function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n = 18): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

function starPts(): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + Math.PI / 2;
    const r = i % 2 === 0 ? 1 : 0.47;
    out.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
}
function moonPts(): Pt[] {
  const R = 1;
  const r = 0.82;
  const d = 0.42;
  const x = (d * d + R * R - r * r) / (2 * d);
  const y = Math.sqrt(Math.max(0, R * R - x * x));
  const a0 = Math.atan2(y, x);
  const b0 = Math.atan2(y, x - d);
  const N = 16;
  const out: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const a = a0 + ((TAU - a0 * 2) * i) / N;
    out.push([Math.cos(a) * R, Math.sin(a) * R]);
  }
  for (let i = 0; i <= N; i++) {
    const a = -b0 - ((TAU - b0 * 2) * i) / N;
    out.push([d + Math.cos(a) * r, Math.sin(a) * r]);
  }
  return rotate(out, Math.PI * 0.62);
}
function dropPts(): Pt[] {
  const N = 30;
  const out: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * TAU;
    const x = Math.cos(t);
    const y = Math.sin(t) * Math.abs(Math.sin(t / 2)) ** 1.7 * 1.75;
    out.push([-y, x]);
  }
  return rotate(out, -Math.PI / 2);
}
function heartPts(): Pt[] {
  const N = 34;
  const out: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    out.push([x / 16, y / 16]);
  }
  return out;
}
function bellPts(): Pt[] {
  let p: Pt[] = [[-0.15, 0.7]];
  p = p.concat(quad([-0.15, 0.7], [-0.15, 0.98], [0, 0.98], 5));
  p = p.concat(quad([0, 0.98], [0.15, 0.98], [0.15, 0.7], 5));
  p = p.concat(cubic([0.15, 0.7], [0.7, 0.5], [0.86, 0.05], [0.86, -0.5], 10));
  p.push([1, -0.7], [-1, -0.7], [-0.86, -0.5]);
  p = p.concat(cubic([-0.86, -0.5], [-0.86, 0.05], [-0.7, 0.5], [-0.15, 0.7], 10));
  return p;
}
function flamePts(): Pt[] {
  let p: Pt[] = [[0.06, 1.1]];
  p = p.concat(cubic([0.06, 1.1], [0.62, 0.55], [0.78, 0], [0.6, -0.4], 10));
  p = p.concat(quad([0.6, -0.4], [0.42, -0.86], [-0.06, -0.86], 7));
  p = p.concat(quad([-0.06, -0.86], [-0.56, -0.86], [-0.66, -0.34], 7));
  p = p.concat(cubic([-0.66, -0.34], [-0.76, 0.12], [-0.34, 0.28], [-0.28, 0.62], 8));
  p = p.concat(quad([-0.28, 0.62], [-0.24, 0.9], [0.06, 1.1], 5));
  return p;
}
function rainbowPts(): Pt[] {
  const cy = -0.25;
  return [
    ...arcPts(0, cy, 1, 0, Math.PI, 20),
    ...arcPts(0, cy, 0.55, Math.PI, 0, 20),
  ];
}

const OUTLINE: Record<CharmShape, () => Pt[]> = {
  star: starPts,
  moon: moonPts,
  drop: dropPts,
  heart: heartPts,
  clover: () => polar(48, (a) => 0.38 + 0.62 * Math.abs(Math.cos(2 * a)) ** 0.5),
  gem: () => [
    [-0.46, 0.88],
    [0.46, 0.88],
    [0.95, 0.28],
    [0, -1],
    [-0.95, 0.28],
  ],
  bell: bellPts,
  flower: () => polar(50, (a) => 0.52 + 0.48 * Math.abs(Math.cos(2.5 * a)) ** 0.6),
  fish: () => [
    [1, 0],
    [0.62, 0.4],
    [0.1, 0.46],
    [-0.42, 0.18],
    [-1, 0.58],
    [-0.72, 0],
    [-1, -0.58],
    [-0.42, -0.18],
    [0.1, -0.46],
    [0.62, -0.4],
  ],
  crown: () => [
    [-1, -0.62],
    [1, -0.62],
    [1, 0.12],
    [0.66, 0.96],
    [0.33, 0.22],
    [0, 1.06],
    [-0.33, 0.22],
    [-0.66, 0.96],
    [-1, 0.12],
  ],
  flame: flamePts,
  rainbow: rainbowPts,
};

/**
 * 24×24 の箱いっぱいに収めた path。SVGはyが下向きなので反転する。
 * 剣にぶら下がる粒(SwordArt)も同じ形を使うので公開している
 * (別々に描くと、棚のチャームと剣のチャームが違う形になってしまう)。
 */
const PATHS: Record<string, string> = {};
export function charmPath(shape: CharmShape): string {
  const hit = PATHS[shape];
  if (hit) return hit;
  const pts = (OUTLINE[shape] ?? starPts)();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const S = 24;
  const pad = 1.4;
  const k = (S - pad * 2) / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const d =
    "M" +
    pts
      .map(
        ([x, y]) =>
          `${(S / 2 + (x - cx) * k).toFixed(2)} ${(S / 2 - (y - cy) * k).toFixed(2)}`
      )
      .join("L") +
    "Z";
  PATHS[shape] = d;
  return d;
}

// ── 表示部品 ────────────────────────────────────────────
interface CharmIconProps {
  /** CHARMS の index */
  index: number;
  /** 一辺(px) */
  size?: number;
  /** まだ持っていない表示(形だけのシルエット) */
  ghost?: boolean;
  className?: string;
}

export function CharmIcon({ index, size = 28, ghost, className }: CharmIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = CHARMS[index];
  if (!c) return null;
  const d = charmPath(c.shape);
  return (
    <svg
      className={className ? `kk-charm-svg ${className}` : "kk-charm-svg"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {ghost ? (
        /* 未獲得は「形だけ」。台のくぼみに彫られた影として、形は読めるままにする。
           台を青から暗い樹脂に変えたので、塗りも中立の黒に、ふちは 3.1:1 を
           確保できる明るさ(白40%)に上げてある */
        <path
          d={d}
          fill="rgba(0,0,0,.5)"
          stroke="rgba(255,255,255,.4)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <defs>
            <linearGradient id={`cg${uid}`} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,.72)" />
              <stop offset="0.42" stopColor="rgba(255,255,255,.12)" />
              <stop offset="0.62" stopColor="rgba(0,0,0,0)" />
              <stop offset="1" stopColor="rgba(0,0,0,.26)" />
            </linearGradient>
          </defs>
          <path
            d={d}
            fill={c.hex}
            stroke="rgba(28,22,10,.55)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d={d} fill={`url(#cg${uid})`} />
        </>
      )}
    </svg>
  );
}

/**
 * チャームの棚。持っている数と、つぎの1個までの道のりを見せる。
 *
 * ── 隠しチャームの扱い ──
 * 隠し(secret)のチャームは **手に入れるまで棚に一切出さない**。
 * 「?」の空き枠すら置かない: 枠があるだけで「あと1個ある」と分かってしまい、
 * 隠しではなくなるから。分母も NORMAL_CHARM_COUNT(=12)のままにして、
 * 12個そろった人には「ぜんぶ あつめた！」と言い切る。
 * 手に入れた瞬間だけ、13個目が棚にぬっと増える。
 */
export function CharmShelf() {
  const myTotal = useGameStore((s) => s.myTotal);
  const hasEarth = useGameStore((s) => s.hasEarthCharm);
  const level = charmLevelOf(myTotal);
  // 隠しは持っている人にしか存在しない。持っていない人の棚は12枠ちょうど
  const slots = CHARMS.filter((c) => !c.secret || hasEarth);
  // CHARMS[level] をそのまま使うと、12個そろった人に隠しチャームの名前と
  // 条件(Infinity本)が「つぎは…」として出てしまう。ここで必ず止める
  const next = level < NORMAL_CHARM_COUNT ? CHARMS[level] : undefined;
  const prevNeed = level > 0 ? CHARMS[level - 1].need : 0;
  const span = next ? next.need - prevNeed : 1;
  const pct = next
    ? Math.max(0, Math.min(1, (myTotal - prevNeed) / span)) * 100
    : 100;
  const remain = next ? Math.max(1, next.need - myTotal) : 0;

  return (
    <div className="kk-charms">
      <div className="kk-charms-head">
        <span className="kk-sec-label kk-label-charm">チャーム</span>
        <span className="kk-charms-count">
          <b>{level}</b>/{NORMAL_CHARM_COUNT}
        </span>
      </div>

      {/* 13個になったら1行7枠にする。3行目を作ると棚が縦に伸びて、
          引き出しの中で下の進捗バーが押し出されてしまうため */}
      <ul className={`kk-charms-grid${hasEarth ? " wide" : ""}`}>
        {slots.map((c, i) => {
          const got = c.secret || i < level;
          const isNext = !c.secret && i === level;
          return (
            <li
              key={c.name}
              className={`kk-charm-slot${got ? " got" : ""}${
                isNext ? " next" : ""
              }${c.secret ? " secret" : ""}`}
              aria-label={
                c.secret
                  ? `${c.name} ひみつの チャーム`
                  : got
                    ? `${c.name} もってる`
                    : `${c.name} ${c.need}本で もらえる`
              }
            >
              <span className="kk-charm-cell">
                <CharmIcon
                  index={i}
                  size={got ? (hasEarth ? 24 : 26) : hasEarth ? 20 : 21}
                  ghost={!got}
                />
              </span>
              {/* 隠しだけは条件を書かない(書いた瞬間に隠しでなくなる) */}
              <span className="kk-charm-need">{c.secret ? "ひみつ" : c.need}</span>
            </li>
          );
        })}
      </ul>

      <div className="kk-charms-next">
        {next ? (
          <>
            <p className="kk-charms-line">
              <CharmIcon index={level} size={18} className="kk-charms-line-ico" />
              つぎは <b>{next.need}本</b>で {next.name} <em>あと{remain}本！</em>
            </p>
            <div className="kk-charms-bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <p className="kk-charms-line kk-charms-done">
            ぜんぶ あつめた！ すごい！ 🎉
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * チャームを手に入れた瞬間のお祝い。数秒でひとりでに消える。
 * 隠しチャームのときは、通常の獲得とはっきり別物に見せる:
 *  ・見出しを「！？」にして、なにが起きたか一瞬わからなくする
 *  ・光を金から白青へ、輪を二重に、粒をひとまわり大きく
 *  ・表示時間を長くして、じっくり「なにこれ」と眺めさせる
 */
export function CharmGet() {
  const clearNewCharm = useGameStore((s) => s.clearNewCharm);
  const [shown, setShown] = useState<{ id: number; index: number } | null>(null);

  // 音("charm-get")と同時に出したいのでイベント購読で起動する。
  // newCharm は store が先に立てているので、そのときの値を読めばよい。
  useEffect(
    () =>
      onGameEvent((t) => {
        if (t !== "charm-get") return;
        const i = useGameStore.getState().newCharm;
        if (i === null) return;
        setShown({ id: Date.now(), index: i });
      }),
    []
  );

  const secret = shown !== null && !!CHARMS[shown.index]?.secret;

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(
      () => {
        setShown(null);
        clearNewCharm(); // 演出しきったので store を片付ける
      },
      secret ? 4400 : 2900
    );
    return () => clearTimeout(timer);
  }, [shown, secret, clearNewCharm]);

  if (!shown) return null;
  const c = CHARMS[shown.index];
  if (!c) return null;

  return (
    <div
      className={`kk-charmget${secret ? " secret" : ""}`}
      role="status"
      key={shown.id}
    >
      <div className="kk-charmget-in">
        <div className="kk-charmget-rays" aria-hidden="true" />
        <div className="kk-charmget-ring" aria-hidden="true" />
        {secret && <div className="kk-charmget-ring2" aria-hidden="true" />}
        <CharmIcon
          index={shown.index}
          size={secret ? 98 : 78}
          className="kk-charmget-disc"
        />
        <div className="kk-charmget-title">
          {secret ? "！？" : "チャーム ゲット！"}
        </div>
        <div className="kk-charmget-name">
          {secret ? `ひみつの チャーム 「${c.name}」` : c.name}
        </div>
        {secret && (
          <div className="kk-charmget-note">だれにも ないしょだよ…</div>
        )}
      </div>
    </div>
  );
}

/** 授与式などで「1個ぶん」を見せるとき用(サイズ指定つきの薄い包み) */
export function CharmDisc({
  index,
  size = 30,
}: {
  index: number;
  size?: number;
}) {
  const style = { "--kk-charm-d": `${size}px` } as CSSProperties;
  return (
    <span className="kk-disc" style={style} aria-hidden="true">
      <CharmIcon index={index} size={size} />
    </span>
  );
}
