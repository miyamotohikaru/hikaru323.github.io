"use client";

// こすくまくんの吹き出し(DOM)。
//
// 追従のしくみ:
//   SpeechAnchor(Canvas内)が毎フレーム書く sharedRefs.speechAnchor を
//   requestAnimationFrame で読み、style.transform に直書きする。
//   Reactの再レンダリングが起きるのは「セリフが変わったとき」だけ。
//
// 組み立て(いちばん外から):
//   .sb-root  = 頭のよこの点。JSが translate + scale する
//   .sb-wrap  = 吹き出し本体のオフセット。画面のはしでは内側へずれる
//   .sb-body  = 吹き出し本体。CSSアニメ(ぽんっと出る/tone別のくせ)の担当
//     .sb-tail(尻尾のSVG。本体の背面に描いて付け根の線を隠す)
//     .sb-fill(まるい地色。tone で色と形が変わる)
//     .sb-text(セリフ)
//
// transform を JS と CSSアニメで奪い合わないよう、階層を分けているのが要点。
//
// 改行の担当は wrapJa.ts。CSSの折り返しは日本語だと どこでも切ってしまうので、
// 「1行に何文字入るか」だけ実際のCSSから測って、切る場所はこちらで決めている。

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { speechAnchor } from "@/game/scene/sharedRefs";
import { useGameStore, type SpeechTone } from "@/game/store";
import { DEFAULT_MAX_UNITS, wrapJaText } from "./wrapJa";
import "./speech.css";

/**
 * 頭は「吹き出しの手前がわ、22%くらいのところ」の真下に来る。
 * 真横に離して置くと尻尾が長く寝てしまい、細いヒゲみたいに見える。
 * 頭の上にかぶせて、短くて太い尻尾をまっすぐ下ろすほうが しっかり付いて見える。
 */
const SIDE_BIAS = 0.22;
/** 頭と吹き出しの縦のすきま(未スケールのpx)= 尻尾の長さ */
const GAP_Y = 24;
/** ねむいときの尻尾はまるい玉なので、少し長めに取る */
const GAP_Y_SLEEPY = 32;
/**
 * 「よこ」に出すとき、体のシルエットからさらに空ける距離。
 * よこ配置ではこの値がそのまま尻尾の長さになるので、短すぎると
 * 尻尾が見えず、ただのラベルに見えてしまう
 */
const SIDE_GAP = 30;
/** 尻尾が本体のふちから最低これだけは外に出る(どのモードでも必ず見える) */
const MIN_TAIL = 12;
/** 尻尾SVGを四方に広げる量(speech.css の .sb-tail と合わせること) */
const TAIL_PAD = 160;
/** 「上」へ戻るときに求める余分な余裕(境目でパタパタさせない) */
const MODE_HYST = 16;
/** 画面のふちに残す余白 */
const EDGE = 10;
/** 尻尾の付け根の太さ(半分) */
const TAIL_W = 13;
/** 付け根を角の丸みから逃がす余白(border-radius 20px より外に出さない) */
const TAIL_EDGE = 20;
/** 付け根を本体の内側へ食い込ませる量(.sb-fill がふちの線を隠してくれる) */
const TAIL_INSET = 6;
/** 消えるアニメの長さ(speech.css の sb-out と合わせる) */
const OUT_MS = 220;
/**
 * 吹き出しの最大幅。ふだんは getComputedStyle から実測するので使わないが、
 * min() を計算前のまま返すブラウザ向けの保険として持っておく。
 * speech.css の .sb-body の max-width と合わせること
 */
const MAX_W_VW = 0.58;
const MAX_W_PX = 250;
/** 折り返しの幅は、ぎりぎりを狙うとCSS側で1文字だけ折れる。すこし辛めに見る */
const WRAP_MARGIN = 0.2;

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** 尻尾の付け根を、まるい角にかからない範囲へ収める */
const clampTail = (v: number, len: number, lo: number) =>
  Math.min(Math.max(v, lo), Math.max(lo, len - lo));

/**
 * 尻尾のパス。本体ローカル座標(左上=0,0)で、ふち上の付け根(ax,ay)から
 * こすくまくんの頭(tipX,tipY)まで伸ばす。(nx,ny)はそのふちの外向き法線
 * (下辺なら(0,1)・左辺なら(-1,0))なので、上下でも左右でも同じ式で描ける。
 */
function tailPath(
  tone: SpeechTone,
  ax: number,
  ay: number,
  nx: number,
  ny: number,
  tipX: number,
  tipY: number
): string {
  // ふちに沿う向き(法線を90°まわしたもの)
  const px = -ny;
  const py = nx;

  if (tone === "sleepy") {
    // ねむいときは「考えごと」風のまるい尻尾。zzz と相性がいい
    let d = "";
    const steps: [number, number][] = [
      [0.28, 5.6],
      [0.62, 3.9],
      [0.94, 2.4],
    ];
    for (const [t, r] of steps) {
      const cx = ax + (tipX - ax) * t;
      const cy = ay + (tipY - ay) * t;
      d += `M${f(cx - r)},${f(cy)}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`;
    }
    return d;
  }

  // 付け根は本体の内側へ食い込ませる(.sb-fill がふちの線を隠してくれる)
  const cx = ax - nx * TAIL_INSET;
  const cy = ay - ny * TAIL_INSET;
  const b1x = cx - px * TAIL_W;
  const b1y = cy - py * TAIL_W;
  const b2x = cx + px * TAIL_W;
  const b2y = cy + py * TAIL_W;

  if (tone === "shock") {
    // びっくりはギザギザ。両側を逆向きに折って、いなずまみたいに尖らせる。
    // 折れ目は尻尾の向きに対して垂直にずらすので、線が自分と交わらない
    const dx = tipX - cx;
    const dy = tipY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const kx = (-dy / len) * 5.5;
    const ky = (dx / len) * 5.5;
    const k1x = (b1x + tipX) / 2 + kx;
    const k1y = (b1y + tipY) / 2 + ky;
    const k2x = (b2x + tipX) / 2 - kx;
    const k2y = (b2y + tipY) / 2 - ky;
    return `M${f(b1x)},${f(b1y)}L${f(k1x)},${f(k1y)}L${f(tipX)},${f(tipY)}L${f(k2x)},${f(k2y)}L${f(b2x)},${f(b2y)}Z`;
  }

  // ふつう: すこし反った角(つの)。片側だけ膨らませて手描きっぽく。
  // ふちに沿う成分と、ふちから離れる成分に分けて曲げる
  const outward = (tipX - cx) * nx + (tipY - cy) * ny;
  const along1 = ((tipX - b1x) * px + (tipY - b1y) * py) * 0.2;
  const along2 = ((tipX - b2x) * px + (tipY - b2y) * py) * 0.6;
  const c1x = b1x + px * along1 + nx * outward * 0.74;
  const c1y = b1y + py * along1 + ny * outward * 0.74;
  const c2x = b2x + px * along2 + nx * outward * 0.46;
  const c2y = b2y + py * along2 + ny * outward * 0.46;
  return `M${f(b1x)},${f(b1y)}Q${f(c1x)},${f(c1y)} ${f(tipX)},${f(tipY)}Q${f(c2x)},${f(c2y)} ${f(b2x)},${f(b2y)}Z`;
}

/**
 * 尻尾の付け根に貼る「継ぎ目かくし」。地色だけの板で、線は引かない。
 *
 * 尻尾は地色(.sb-fill)の背面に描いているので、尻尾じたいの根元の線は隠れる。
 * ところが **本体のふちの線(border)は尻尾の口の上をそのまま横切る**ので、
 * 吹き出しと尻尾のあいだに1本の線が残ってしまう。これを地色で塗りつぶす。
 *
 * 幅は尻尾の付け根とそろえ、本体の内側へ深く・外側へはほんの少しだけ伸ばす
 * (外へ出しすぎると、尻尾の両サイドの線が根元で途切れて見える)。
 */
function tailJoinPath(
  tone: SpeechTone,
  ax: number,
  ay: number,
  nx: number,
  ny: number
): string {
  // ねむいときの尻尾は離れた丸なので、隠すべき継ぎ目がない
  if (tone === "sleepy") return "";
  const px = -ny;
  const py = nx;
  const IN = 5.5; // 本体の内側へ(ふち3px + 余裕)
  const OUT = 0.6; // 外側へ(はみ出しすぎない)
  const w = TAIL_W - 0.4; // 両サイドの線を食べないよう気持ち内側で
  const ix = ax - nx * IN;
  const iy = ay - ny * IN;
  const ox = ax + nx * OUT;
  const oy = ay + ny * OUT;
  return (
    `M${f(ix - px * w)},${f(iy - py * w)}` +
    `L${f(ox - px * w)},${f(oy - py * w)}` +
    `L${f(ox + px * w)},${f(oy + py * w)}` +
    `L${f(ix + px * w)},${f(iy + py * w)}Z`
  );
}

export default function SpeechBubble() {
  // 再レンダリングはセリフが変わったときだけ(位置追従は rAF が直接さわる)
  const speech = useGameStore((s) => s.speech);
  // フェーズは「下に空ける高さ」を測り直すきっかけにだけ使う(数秒に1回)
  const phase = useGameStore((s) => s.phase);

  const layerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const tailRef = useRef<SVGPathElement>(null);
  const joinRef = useRef<SVGPathElement>(null); // 尻尾の継ぎ目かくし

  // 1行に入る全角文字数。字の大きさ(clamp)と最大幅から測るので、画面幅で変わる。
  // 変わったときだけ setState する(セリフごとの再レンダリングは増やさない)
  const [wrapMax, setWrapMax] = useState(DEFAULT_MAX_UNITS);
  const wrapMaxRef = useRef(DEFAULT_MAX_UNITS);

  // 実際に表示する文(改行入り)。セリフか幅が変わったときだけ折り直す
  const shown = useMemo(
    () => (speech ? wrapJaText(speech.text, { max: wrapMax }) : ""),
    [speech, wrapMax]
  );

  // rAFループから読む値はすべて ref(setStateを起こさない)
  const speechRef = useRef(speech);
  const sizeRef = useRef({ w: 150, h: 46 });
  const viewRef = useRef({ w: 1, h: 1 });
  const sideRef = useRef(1); // 1=頭の右 / -1=左
  const besideRef = useRef(false); // true=頭のよこ / false=頭の上
  /** 画面下のUI(確認シート)にかぶらないよう空けておく高さ(画面px) */
  const bottomRef = useRef(0);
  const closingRef = useRef(false);
  const doneAtRef = useRef(0);
  const lastRef = useRef({
    bx: NaN,
    by: NaN,
    ax: NaN,
    ay: NaN,
    tipX: NaN,
    tipY: NaN,
    vis: -1,
  });

  /** 吹き出しの実寸と画面サイズをはかる(毎フレームのレイアウト読みを避ける) */
  const measure = useCallback(() => {
    const body = bodyRef.current;
    if (body && body.offsetWidth > 0) {
      sizeRef.current = { w: body.offsetWidth, h: body.offsetHeight };
    }
    const layer = layerRef.current;
    if (layer) {
      viewRef.current = { w: layer.clientWidth, h: layer.clientHeight };
    }
    // 確認シートはHUD(前面レイヤー)なので、かぶると吹き出しが隠れる。
    // 高さは相手の都合で変わるため、DOMから読むだけ(あちらのCSSは触らない)。
    // offsetTop はレイアウト値なので、せり上がるアニメの途中でも正しく取れる
    const sheet = document.querySelector<HTMLElement>(".confirm-sheet");
    bottomRef.current = sheet
      ? Math.max(0, viewRef.current.h - sheet.offsetTop + 8)
      : 0;

    // ── 1行に入る全角文字数(折り返しの幅) ──
    // 字の大きさは clamp、最大幅は min() で書いてあるので、CSSから読むのが確実。
    // 全角の文字は 1em ちょうどで並ぶので、幅 ÷ 送り幅 が そのまま文字数になる
    const textEl = textRef.current;
    if (body && textEl) {
      const cb = getComputedStyle(body);
      const ct = getComputedStyle(textEl);
      const fs = parseFloat(ct.fontSize);
      const ls = parseFloat(ct.letterSpacing); // "normal" のときは NaN
      let maxW = parseFloat(cb.maxWidth); // min() は計算後の px で返る
      if (!(maxW > 0)) maxW = Math.min(viewRef.current.w * MAX_W_VW, MAX_W_PX);
      if (cb.boxSizing === "border-box") {
        maxW -= (parseFloat(cb.paddingLeft) || 0) + (parseFloat(cb.paddingRight) || 0);
      }
      const adv = fs + (Number.isFinite(ls) ? ls : 0); // 全角1文字ぶんの送り
      if (adv > 0 && maxW > 0) {
        const units = Math.max(5, Math.round((maxW / adv - WRAP_MARGIN) * 10) / 10);
        if (units !== wrapMaxRef.current) {
          wrapMaxRef.current = units;
          setWrapMax(units); // 折り直し → 下の useLayoutEffect で測り直す
        }
      }
    }
  }, []);

  /** 位置・尻尾の再計算(rAFから毎フレーム。書き込みは変わったものだけ) */
  const layout = useCallback((force: boolean) => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    const tail = tailRef.current;
    const sp = speechRef.current;
    if (!root || !wrap || !body || !tail || !sp) return;

    const a = speechAnchor;
    const last = lastRef.current;

    // 画面外/カメラの後ろにいるときは、そっと消す
    const vis = a.visible ? 1 : 0;
    if (vis !== last.vis) {
      root.style.opacity = vis ? "1" : "0";
      last.vis = vis;
    }
    if (!vis && !force) return;

    // 遠いほど小さく。ただしそのままだと文字が読めなくなるので、
    // 下限を上げてゆるく効かせる(0.6〜1.15 → 0.85〜1.12)
    const s = Math.min(1.12, Math.max(0.85, 0.62 + 0.38 * a.scale));
    const { w, h } = sizeRef.current;
    const view = viewRef.current;
    const gapY = sp.tone === "sleepy" ? GAP_Y_SLEEPY : GAP_Y;

    // ローカル単位(=画面px ÷ s)。吹き出しの中身はすべてこの単位で考える。
    // 下だけは確認シートのぶんを差し引く(HUDは吹き出しより上のレイヤーなので、
    // かぶると吹き出しが隠れてしまう)
    const roomR = (view.w - EDGE - a.x) / s;
    const roomL = (a.x - EDGE) / s;
    const roomU = (a.y - EDGE) / s;
    const roomD = (view.h - EDGE - bottomRef.current - a.y) / s;

    // ── 置きかたを決める ────────────────────────────────
    // 1) 頭の上(いちばん自然)
    // 2) 上が詰まっていたら 頭のよこ。safe の寄りカメラのように、こすくまくんが
    //    画面の上ぎりぎりに来る場面がある。ここで「下」に出すと顔を隠してしまう
    // 3) よこも無理なら上へ押し込む(頭のてっぺんだけ隠れる。顔は隠さない)
    const needUp = gapY + h;
    const fitsUp = needUp <= roomU;
    // よこに出すとき、体のシルエットをよける距離
    const clearX = (a.bodyW * 0.5 + SIDE_GAP) / s;
    const fitsSideR = clearX + w <= roomR;
    const fitsSideL = clearX + w <= roomL;
    let beside = besideRef.current;
    if (!beside) {
      if (!fitsUp && (fitsSideR || fitsSideL)) beside = true;
    } else if (needUp + MODE_HYST <= roomU || (!fitsSideR && !fitsSideL)) {
      beside = false;
    }
    besideRef.current = beside;

    // 左右: 入りきらなくなったときだけ反対側へ(ヒステリシスでパタパタしない)
    const nearW = w * SIDE_BIAS; // 頭より手前がわに出るぶん
    const farW = w - nearW; // 頭より向こうがわに伸びるぶん
    let side = sideRef.current;
    const fitR = beside ? fitsSideR : farW <= roomR && nearW <= roomL;
    const fitL = beside ? fitsSideL : farW <= roomL && nearW <= roomR;
    if (side > 0 && !fitR && fitL) side = -1;
    else if (side < 0 && !fitL && fitR) side = 1;
    sideRef.current = side;

    // 本体の位置(アンカー基準・ローカル単位)。画面に入りきらないぶんは
    // 本体だけ内側へずらし、尻尾を伸ばして頭を指し続ける
    let bx = beside
      ? side > 0
        ? clearX
        : -(clearX + w)
      : side > 0
        ? -nearW
        : -farW;
    const maxBx = roomR - w;
    const minBx = -roomL;
    bx = maxBx < minBx ? -w / 2 : Math.min(Math.max(bx, minBx), maxBx);

    // よこに出すときは、頭の高さに顔をならべる(目の高さで話しかける感じ)
    let by = beside ? -h * 0.5 : -(gapY + h);
    const maxBy = roomD - h;
    const minBy = -roomU;
    by = maxBy < minBy ? -h / 2 : Math.min(Math.max(by, minBy), maxBy);

    // 尻尾の先。上に出したときは頭のてっぺん(=アンカー)。
    // よこに出したときは、体をまたいで中心まで伸ばすと長いヒゲになるので、
    // こちら側の「ほっぺた」を指す(短くて太い尻尾になり、しっかり付いて見える)
    let tipX = -bx + (beside ? (side * a.bodyW * 0.5) / s : 0);
    let tipY = -by + (beside ? (a.bodyH * 0.1) / s : 0);
    // 尻尾を出すふち(と、その外向き法線)
    const nx = beside ? (side > 0 ? -1 : 1) : 0;
    const ny = beside ? 0 : 1;
    const edgeX = beside ? (side > 0 ? 0 : w) : 0;
    const edgeY = beside ? 0 : h;
    // ③の押し込み配置では頭が本体の中に入ることがある。そのままだと尻尾が
    // 本体に埋まって消えるので、ふちから最低限だけ外へ出しておく
    const outward = (tipX - edgeX) * nx + (tipY - edgeY) * ny;
    if (outward < MIN_TAIL) {
      tipX += nx * (MIN_TAIL - outward);
      tipY += ny * (MIN_TAIL - outward);
    }
    const tailLo = TAIL_W + TAIL_EDGE;
    const ax = beside ? edgeX : clampTail(tipX, w, tailLo);
    const ay = beside ? clampTail(tipY, h, tailLo) : edgeY;

    root.style.transform = `translate3d(${f(a.x)}px, ${f(a.y)}px, 0) scale(${s.toFixed(3)})`;

    if (force || Math.abs(bx - last.bx) > 0.4 || Math.abs(by - last.by) > 0.4) {
      wrap.style.transform = `translate3d(${f(bx)}px, ${f(by)}px, 0)`;
      last.bx = bx;
      last.by = by;
    }

    if (
      force ||
      Math.abs(ax - last.ax) > 0.5 ||
      Math.abs(ay - last.ay) > 0.5 ||
      Math.abs(tipX - last.tipX) > 0.5 ||
      Math.abs(tipY - last.tipY) > 0.5
    ) {
      tail.setAttribute("d", tailPath(sp.tone, ax, ay, nx, ny, tipX, tipY));
      joinRef.current?.setAttribute("d", tailJoinPath(sp.tone, ax, ay, nx, ny));
      // ぽんっと出るときの基点も尻尾の付け根に合わせる(頭から生えて見える)
      body.style.transformOrigin = `${f(ax)}px ${f(ay)}px`;
      last.ax = ax;
      last.ay = ay;
      last.tipX = tipX;
      last.tipY = tipY;
    }
  }, []);

  // セリフが変わったら: 実寸をはかり直して、1フレーム目からズレずに出す
  useLayoutEffect(() => {
    speechRef.current = speech;
    if (!speech) return;
    closingRef.current = false;
    doneAtRef.current = 0;
    const root = rootRef.current;
    const body = bodyRef.current;
    if (body) body.classList.remove("sb-leave");
    if (root) root.style.display = "";
    lastRef.current.vis = -1; // 表示状態も引き直す
    measure();
    layout(true);
  }, [speech, measure, layout]);

  // 確認シートが出入りしたら、下に空ける高さを取り直す。
  // 描画前に直したいので useLayoutEffect(1フレームだけ かぶるのを防ぐ)。
  // 折り返しの幅(wrapMax)が変わったときも、行が変わるので実寸を測り直す
  useLayoutEffect(() => {
    measure();
    layout(true);
  }, [phase, wrapMax, measure, layout]);

  // フォント読み込み・画面回転で幅が変わる。そのときだけはかり直す
  useEffect(() => {
    const onResize = () => {
      measure();
      layout(true);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    // 丸ゴシックは display:swap。差し替わると行幅が変わるので測り直す
    document.fonts?.ready.then(onResize).catch(() => {});
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [measure, layout]);

  // 追従ループ。ここでは transform の直書きだけを行う
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const sp = speechRef.current;
      const root = rootRef.current;
      if (!sp || !root) return;

      const now = Date.now();
      if (!closingRef.current && now > sp.until) {
        // 表示時間ぎれ → すっと消える
        closingRef.current = true;
        doneAtRef.current = now + OUT_MS;
        bodyRef.current?.classList.add("sb-leave");
      }
      if (closingRef.current) {
        if (now > doneAtRef.current) {
          root.style.display = "none";
          return; // 消えおわったら位置の更新も止める
        }
      }
      layout(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layout]);

  return (
    // aria-live のために、セリフが無いときも入れ物は置いておく
    <div className="sb-layer" ref={layerRef} aria-live="polite" aria-atomic="true">
      {speech && (
        <div className="sb-root" ref={rootRef}>
          <div className="sb-wrap" ref={wrapRef}>
            <div
              key={speech.id}
              ref={bodyRef}
              className={`sb-body sb-${speech.tone}`}
            >
              {/* 尻尾+地色をひとまとめにして、影は「シルエット全体」に落とす。
                  別々に影をつけると、尻尾が本体の影で暗く沈んでしまう */}
              <span className="sb-shape" aria-hidden="true">
                {/* 尻尾は地色より先に描く(付け根の線を .sb-fill が隠す)。
                    SVGは四方に TAIL_PAD ぶん広げてあるので、パスは
                    本体ローカル座標のまま書いて translate でずらす */}
                <svg className="sb-tail">
                  <path
                    ref={tailRef}
                    d=""
                    transform={`translate(${TAIL_PAD},${TAIL_PAD})`}
                  />
                </svg>
                <span className="sb-fill" />
                {/* 地色のあとに、継ぎ目だけを地色で塗りつぶす板を重ねる。
                    本体のふちの線が尻尾の口を横切るのを消すため */}
                <svg className="sb-tail sb-join">
                  <path
                    ref={joinRef}
                    d=""
                    transform={`translate(${TAIL_PAD},${TAIL_PAD})`}
                  />
                </svg>
              </span>
              {/* 改行は wrapJa が入れる。CSSは white-space:pre-wrap でそれを守るだけ */}
              <p className="sb-text" ref={textRef}>
                {shown}
              </p>

              {speech.tone === "sleepy" && (
                <span className="sb-zzz" aria-hidden="true">
                  <i>z</i>
                  <i>z</i>
                  <i>z</i>
                </span>
              )}
              {speech.tone === "happy" && (
                <svg
                  className="sb-spark"
                  viewBox="0 0 40 40"
                  width="40"
                  height="40"
                  aria-hidden="true"
                >
                  <path
                    className="sb-spark-a"
                    d="M27 3 L29.4 11.6 L38 14 L29.4 16.4 L27 25 L24.6 16.4 L16 14 L24.6 11.6 Z"
                  />
                  <path
                    className="sb-spark-b"
                    d="M12 18 L13.5 23.5 L19 25 L13.5 26.5 L12 32 L10.5 26.5 L5 25 L10.5 23.5 Z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
