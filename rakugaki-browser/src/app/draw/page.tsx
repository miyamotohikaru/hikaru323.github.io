"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import DrawingCanvas from "@/components/DrawingCanvas";
import ColorPicker from "@/components/ColorPicker";
import type { Point, Stroke, BrushType } from "@/lib/types";
import { BRUSH_INFO } from "@/lib/types";
import { saveDrawing } from "@/lib/storage";

const BRUSH_LIST: BrushType[] = [
  "pen", "marker", "highlighter", "pencil", "crayon",
  "airbrush", "watercolor", "calligraphy", "dot", "spray", "eraser",
];

const SIZE_PRESETS = [2, 5, 10, 20, 35, 50];

export default function DrawPage() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState("#ccff00");
  const [brushSize, setBrushSize] = useState(4);
  const [brush, setBrush] = useState<BrushType>("pen");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushes, setShowBrushes] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const drawingId = useRef(crypto.randomUUID());

  const handleStrokeStart = useCallback(() => setCurrentStroke([]), []);
  const handleStrokePoint = useCallback((p: Point) => setCurrentStroke((prev) => [...prev, p]), []);
  const handleStrokeEnd = useCallback(() => {
    setCurrentStroke((prev) => {
      if (prev.length < 2) return [];
      setStrokes((s) => [...s, {
        id: crypto.randomUUID(),
        points: prev,
        color: brush === "eraser" ? "eraser" : color,
        width: brushSize,
        brush,
        timestamp: Date.now(),
      }]);
      return [];
    });
  }, [color, brushSize, brush]);

  const handleUndo = useCallback(() => setStrokes((p) => p.slice(0, -1)), []);
  const handleClear = useCallback(() => {
    setStrokes([]);
    drawingId.current = crypto.randomUUID();
  }, []);

  const handleSave = useCallback(async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas || strokes.length === 0) return;
    setSaving(true);

    const thumb = document.createElement("canvas");
    thumb.width = 400; thumb.height = 400;
    const tctx = thumb.getContext("2d")!;
    tctx.fillStyle = "#0a0a0a";
    tctx.fillRect(0, 0, 400, 400);
    const scale = Math.min(400 / canvas.width, 400 / canvas.height);
    const ox = (400 - canvas.width * scale) / 2;
    const oy = (400 - canvas.height * scale) / 2;
    tctx.drawImage(canvas, ox, oy, canvas.width * scale, canvas.height * scale);

    await saveDrawing({
      id: drawingId.current,
      strokes,
      thumbnail: thumb.toDataURL("image/webp", 0.6),
      title: `らくがき #${Math.floor(Math.random() * 9999)}`,
      createdAt: Date.now(),
    });

    setSaving(false);
    setToast("保存しました！");
    setTimeout(() => setToast(null), 2500);
  }, [strokes]);

  const closeAll = () => {
    setShowColorPicker(false);
    setShowBrushes(false);
    setShowSizes(false);
  };

  const btnBase: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    fontSize: 16,
    color: "#888",
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: "rgba(204,255,0,0.15)",
    color: "#ccff00",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#0a0a0a", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 6,
          color: "#888", fontSize: 13,
          background: "rgba(20,20,20,0.8)", backdropFilter: "blur(8px)",
          padding: "6px 12px", borderRadius: 20,
          border: "1px solid #2a2a2a", textDecoration: "none",
        }}>
          ← 戻る
        </Link>
        <div style={{
          color: "#888", fontSize: 13,
          background: "rgba(20,20,20,0.8)", backdropFilter: "blur(8px)",
          padding: "6px 12px", borderRadius: 20,
          border: "1px solid #2a2a2a",
        }}>
          {strokes.length} ストローク
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%",
          transform: "translateX(-50%)", zIndex: 200,
          background: "#ccff00", color: "#000",
          fontWeight: 600, padding: "8px 20px",
          borderRadius: 20, fontSize: 14,
          animation: "toast 2.5s ease forwards",
        }}>
          {toast}
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 150,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid #333",
            borderTopColor: "#ccff00",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}

      {/* Canvas */}
      <DrawingCanvas
        strokes={strokes}
        currentStroke={currentStroke}
        color={color}
        brushSize={brushSize}
        brush={brush}
        onStrokeStart={handleStrokeStart}
        onStrokePoint={handleStrokePoint}
        onStrokeEnd={handleStrokeEnd}
      />

      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          color={color}
          onChange={(c) => {
            setColor(c);
            if (brush === "eraser") setBrush("pen");
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Brush panel */}
      {showBrushes && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={closeAll} />
          <div style={{
            position: "fixed", bottom: 72, left: "50%",
            transform: "translateX(-50%)",
            background: "#1e1e1e", border: "1px solid #333",
            borderRadius: 16, padding: 8, zIndex: 100,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 4, minWidth: 220,
            animation: "fadeIn 0.2s ease",
          }}>
            {BRUSH_LIST.map((b) => (
              <button
                key={b}
                onClick={() => { setBrush(b); setShowBrushes(false); }}
                style={{
                  ...btnBase,
                  flexDirection: "column", gap: 2,
                  padding: "8px 4px",
                  fontSize: 11,
                  ...(brush === b ? {
                    background: "rgba(204,255,0,0.15)",
                    color: "#ccff00",
                  } : {}),
                }}
              >
                <span style={{ fontSize: 20 }}>{BRUSH_INFO[b].icon}</span>
                <span>{BRUSH_INFO[b].label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Size panel */}
      {showSizes && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={closeAll} />
          <div style={{
            position: "fixed", bottom: 72, left: "50%",
            transform: "translateX(-50%)",
            background: "#1e1e1e", border: "1px solid #333",
            borderRadius: 16, padding: 12, zIndex: 100,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            minWidth: 220,
            animation: "fadeIn 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  style={{
                    ...btnBase,
                    flexDirection: "column", gap: 6, padding: 6,
                    ...(brushSize === s ? { background: "rgba(204,255,0,0.15)" } : {}),
                  }}
                >
                  <div style={{
                    width: Math.max(4, s * 0.5),
                    height: Math.max(4, s * 0.5),
                    borderRadius: "50%",
                    background: brushSize === s ? "#ccff00" : "#888",
                  }} />
                  <span style={{ fontSize: 10, color: "#888" }}>{s}</span>
                </button>
              ))}
            </div>
            <input
              type="range" min="1" max="50" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#ccff00" }}
            />
          </div>
        </>
      )}

      {/* Toolbar */}
      <div style={{
        position: "fixed", bottom: 16, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(20,20,20,0.95)", backdropFilter: "blur(12px)",
        border: "1px solid #2a2a2a",
        borderRadius: 20, padding: "6px 12px",
        zIndex: 80,
      }}>
        {/* Brush type */}
        <button
          onClick={() => { closeAll(); setShowBrushes(!showBrushes); }}
          style={brush !== "eraser" ? btnActive : btnBase}
          title="ブラシ"
        >
          <span style={{ fontSize: 20 }}>{BRUSH_INFO[brush].icon}</span>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#2a2a2a" }} />

        {/* Color */}
        <button
          onClick={() => { closeAll(); setShowColorPicker(!showColorPicker); }}
          style={{
            ...btnBase,
            padding: 4,
          }}
          title="色を選ぶ"
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: color, border: "2px solid #444",
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#2a2a2a" }} />

        {/* Size */}
        <button
          onClick={() => { closeAll(); setShowSizes(!showSizes); }}
          style={btnBase}
          title="サイズ"
        >
          <div style={{
            width: Math.max(6, Math.min(brushSize * 0.6, 20)),
            height: Math.max(6, Math.min(brushSize * 0.6, 20)),
            borderRadius: "50%",
            background: "#888",
          }} />
          <span style={{ fontSize: 11, marginLeft: 4, fontFamily: "monospace" }}>{brushSize}</span>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#2a2a2a" }} />

        {/* Undo */}
        <button onClick={handleUndo} style={btnBase} title="元に戻す">↩</button>

        {/* Clear */}
        <button onClick={handleClear} style={{ ...btnBase, color: "#888" }} title="全消去">🗑</button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#2a2a2a" }} />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={strokes.length === 0 || saving}
          style={{
            ...btnBase,
            background: strokes.length > 0 ? "#ccff00" : "#333",
            color: strokes.length > 0 ? "#000" : "#666",
            padding: "6px 14px",
            fontWeight: 600,
            fontSize: 13,
            gap: 4,
            cursor: strokes.length > 0 ? "pointer" : "not-allowed",
          }}
          title="保存する"
        >
          💾 保存
        </button>
      </div>
    </div>
  );
}
