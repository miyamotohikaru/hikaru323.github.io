"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PanoramaViewerProps {
  imageUrl: string; // フィルター適用済みのマスター拡張画像
  fov: number; // 生き物の視野角
  height?: number; // ビューアの高さ
  label?: string; // 左上に出すラベル（例「馬のめ」）
}

/**
 * Google Street View のようにスクロールして見回すパノラマビューア。
 * - 元写真の位置（中央）からスタート
 * - ドラッグ/スワイプで左右に見回す
 * - 放すと自動でゆっくり往復スクロール
 * - fov に応じて見回せる範囲が変わる（狭い生き物は狭く、広い生き物は広く）
 * 端・余白はクリーム色(#FFF9F2)で背景に溶ける。
 */
export function PanoramaViewer({ imageUrl, fov, height = 400, label }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  const posRef = useRef(0); // 現在のスクロール位置(px)。0=中央(正面)、負=右方向へ移動
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const autoRef = useRef(true);
  const dirRef = useRef(-1);
  const rafRef = useRef(0);
  const maxScrollRef = useRef(0);

  const [autoOn, setAutoOn] = useState(true);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  // fov 120°=ほぼ動かない(0.33)、360°=フルにぐるっと(1.0)
  const viewableRatio = Math.min(1.0, Math.max(0.2, fov / 360));

  // 画像読み込み
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgW(img.naturalWidth);
      setImgH(img.naturalHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 画像が変わったら正面に戻し、ヒントを数秒表示
  useEffect(() => {
    posRef.current = 0;
    dirRef.current = -1;
    setHintVisible(true);
    const t = setTimeout(() => setHintVisible(false), 2600);
    return () => clearTimeout(t);
  }, [imageUrl]);

  const applyTransform = useCallback(() => {
    const inner = imgElRef.current;
    if (inner) inner.style.transform = `translateX(${posRef.current}px)`;
  }, []);

  // 自動往復 + 描画ループ
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imgW || !imgH) return;

    const recompute = () => {
      const cw = container.clientWidth;
      const scale = height / imgH;
      const scaledW = imgW * scale;
      // 見回せる最大量（中央±で fov 制限）
      maxScrollRef.current = Math.max(0, (scaledW - cw) * viewableRatio);
    };
    recompute();
    window.addEventListener("resize", recompute);

    function loop() {
      const maxScroll = maxScrollRef.current;
      if (autoRef.current && !draggingRef.current && maxScroll > 0) {
        posRef.current += dirRef.current * 0.5; // 0.5px/frame（ゆっくり）
        if (posRef.current <= -maxScroll) { posRef.current = -maxScroll; dirRef.current = 1; }
        if (posRef.current >= 0) { posRef.current = 0; dirRef.current = -1; }
      }
      posRef.current = Math.max(-maxScroll, Math.min(0, posRef.current));
      applyTransform();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", recompute);
    };
  }, [imgW, imgH, height, viewableRatio, applyTransform]);

  // ドラッグ操作（pointer=タッチ・マウス両対応）
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
    setHintVisible(false);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const maxScroll = maxScrollRef.current;
    let next = startPosRef.current + (e.clientX - startXRef.current); // 1:1
    next = Math.max(-maxScroll, Math.min(0, next));
    posRef.current = next;
    applyTransform();
  }, [applyTransform]);

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const toggleAuto = () => {
    autoRef.current = !autoRef.current;
    setAutoOn(autoRef.current);
  };

  const scale = imgH ? height / imgH : 1;
  const scaledW = imgW * scale;

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
          height,
          borderRadius: 18,
          overflow: "hidden",
          background: "#FFF9F2",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgElRef}
          className="pano-img"
          src={imageUrl}
          alt="panorama"
          draggable={false}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            height: "100%",
            width: scaledW || "auto",
            maxWidth: "none",
            transform: "translateX(0)",
            marginLeft: scaledW ? -scaledW / 2 : 0,
            marginTop: -height / 2,
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

        {/* 「ドラッグで見回す」ヒント（最初だけ薄く表示して数秒で消す） */}
        {hintVisible && (
          <div
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.9)", color: "#5F5E5A",
              fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 100,
              pointerEvents: "none", transition: "opacity 0.4s ease",
            }}
          >
            👆 ドラッグで見回す
          </div>
        )}
      </div>

      {/* 自動で見回す ON/OFF */}
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
    </div>
  );
}
