"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PanoramaViewerProps {
  imageUrl: string; // フィルター適用済みのマスター拡張画像（360°ぶん・元写真が中心）
  fov: number; // 生き物の視野角（見回せる範囲を決める）
  photoAspect: number; // アップロード写真の縦横比 (w/h)。覗き窓のサイズをこれに合わせる
  label?: string; // 左上ラベル（例「馬のめ」）
  frozen?: boolean; // true=回転も見回しもしない固定表示（人間の目＝元写真サイズ）
}

const AUTO_ONEWAY_SEC = 60; // 片道の秒数（本当にゆっくり）
const START_HOLD_MS = 2000; // 開始時、最初の場所で固定しておく時間

/**
 * 「元写真サイズの覗き窓」の後ろで360°パノラマがゆっくり回る方式。
 * - 窓のサイズ＝アップロード写真の比率。最初は元写真（中央）だけが見える。
 * - 拡張部分は窓の外（左右）に隠れていて、回転/ドラッグで初めて見える。
 * - 放置すると右へゆっくりパン→端で折り返して左へ、を往復（fovで振れ幅が変わる）。
 * - ドラッグ/スワイプで手動でも見回せる。端・余白はクリーム色(#FFF9F2)。
 */
export function PanoramaViewer({ imageUrl, fov, photoAspect, label, frozen = false }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  const posRef = useRef(0); // 中央(=元写真)からのパン量(px)。0=正面
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const dirRef = useRef(-1); // -1=右を見に行く / +1=左へ戻る
  const rafRef = useRef(0);
  const maxRef = useRef(0); // 片側に振れる最大量(px)
  const centerRef = useRef(0); // マスターを窓中央に置くためのオフセット(px)
  const speedRef = useRef(0.3); // px/frame
  const startAtRef = useRef(0); // この時刻(performance.now)まで正面で固定

  const autoRef = useRef(true);
  const [autoOn, setAutoOn] = useState(true);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [scaledW, setScaledW] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const viewableRatio = Math.min(1.0, Math.max(0.18, fov / 360));

  // 画像読み込み
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgW(img.naturalWidth);
      setImgH(img.naturalHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 画像が変わったら正面へ戻し、最初の2秒は固定→その後 右へ動き出す
  useEffect(() => {
    posRef.current = 0;
    dirRef.current = -1; // -1=右へ見に行く
    startAtRef.current = performance.now() + START_HOLD_MS;
    setHintVisible(true);
    const t = setTimeout(() => setHintVisible(false), 2600);
    return () => clearTimeout(t);
  }, [imageUrl]);

  const applyTransform = useCallback(() => {
    const el = imgElRef.current;
    if (el) el.style.transform = `translateX(${centerRef.current + posRef.current}px)`;
  }, []);

  // サイズ計算 + 自動回転ループ
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imgW || !imgH) return;

    const recompute = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = ch / imgH; // マスターを窓の高さに合わせる
      const sw = imgW * scale;
      setScaledW(sw);
      centerRef.current = (cw - sw) / 2; // 中央=元写真が窓中央に来る
      // frozen(人間の目)は見回さない＝振れ幅0。それ以外はfovで制限
      maxRef.current = frozen ? 0 : Math.max(0, ((sw - cw) / 2) * viewableRatio);
      // 片道 AUTO_ONEWAY_SEC 秒でゆっくり
      speedRef.current = Math.max(0.08, (2 * maxRef.current) / (AUTO_ONEWAY_SEC * 60));
      // クランプ
      posRef.current = Math.max(-maxRef.current, Math.min(maxRef.current, posRef.current));
      applyTransform();
    };
    recompute();
    window.addEventListener("resize", recompute);

    function loop() {
      const M = maxRef.current;
      const holding = performance.now() < startAtRef.current; // 開始2秒は固定
      if (autoRef.current && !draggingRef.current && !holding && M > 0) {
        posRef.current += dirRef.current * speedRef.current;
        if (posRef.current <= -M) { posRef.current = -M; dirRef.current = 1; }  // 右端→左へ
        if (posRef.current >= M) { posRef.current = M; dirRef.current = -1; }   // 左端→右へ
      }
      posRef.current = Math.max(-M, Math.min(M, posRef.current));
      applyTransform();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", recompute);
    };
  }, [imgW, imgH, viewableRatio, frozen, applyTransform]);

  // ドラッグ（pointer=タッチ・マウス両対応）
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
    setHintVisible(false);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const M = maxRef.current;
    let next = startPosRef.current + (e.clientX - startXRef.current); // 1:1
    next = Math.max(-M, Math.min(M, next));
    posRef.current = next;
    applyTransform();
  }, [applyTransform]);

  const onPointerUp = useCallback(() => { draggingRef.current = false; }, []);

  const toggleAuto = () => {
    autoRef.current = !autoRef.current;
    setAutoOn(autoRef.current);
  };

  return (
    <div>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: photoAspect || 1, // 覗き窓＝アップロード写真の比率
          borderRadius: 18,
          overflow: "hidden",
          background: "#FFF9F2",
          cursor: frozen ? "default" : "grab",
          touchAction: "none",
          userSelect: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgElRef}
          src={imageUrl}
          alt="panorama"
          draggable={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: scaledW || "auto",
            maxWidth: "none",
            transform: "translateX(0)",
            willChange: "transform",
            pointerEvents: "none",
          }}
        />

        {label && (
          <div
            style={{
              position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(45,45,45,0.85)", color: "#fff",
              fontSize: 12, fontWeight: 900, pointerEvents: "none", whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        )}

        {hintVisible && !frozen && (
          <div
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.9)", color: "#5F5E5A",
              fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 100,
              pointerEvents: "none",
            }}
          >
            👆 ドラッグで見回す
          </div>
        )}
      </div>

      {/* 自動で見回す ON/OFF（人間の目=固定表示のときは出さない） */}
      {!frozen && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button
            onClick={toggleAuto}
            style={{
              padding: "9px 18px", borderRadius: 100, border: "2px solid rgba(0,0,0,0.06)",
              background: "#fff", color: "#555", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {autoOn ? "⏸ 自動で見回すのを止める" : "▶ 自動で見回す"}
          </button>
        </div>
      )}
    </div>
  );
}
