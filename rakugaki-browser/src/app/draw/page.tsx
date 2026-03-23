"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DrawingCanvas from "@/components/DrawingCanvas";
import ColorPicker from "@/components/ColorPicker";
import type { Point, Stroke, BrushType } from "@/lib/types";
import { BRUSH_LIST, PALETTE_COLORS } from "@/lib/types";
import { loadSharedCanvas, saveToGallery } from "@/lib/storage";

const BRUSH_ICONS: Record<BrushType, string> = {
  pen: "✏️", ballpoint: "🖊️", marker: "🖍️", highlighter: "💛",
  crayon: "🖌️", fude: "🖋️", calligraphy: "✒️", watercolor: "💧",
  airbrush: "⚙️", charcoal: "✎", eraser: "🧽",
};

export default function DrawPage() {
  const router = useRouter();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState("#1a1a1a");
  const [brushSize, setBrushSize] = useState(2.5);
  const [brush, setBrush] = useState<BrushType>("pen");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load previous shared canvas on mount
  useEffect(() => {
    loadSharedCanvas().then((prev) => {
      if (prev.length > 0) setStrokes(prev);
      setLoaded(true);
    });
  }, []);

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
  const handleClear = useCallback(() => setStrokes([]), []);

  const handleSave = useCallback(async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas || strokes.length === 0) return;
    setSaving(true);

    const thumb = document.createElement("canvas");
    thumb.width = 400; thumb.height = 400;
    const tctx = thumb.getContext("2d")!;
    tctx.fillStyle = "#faf6f0";
    tctx.fillRect(0, 0, 400, 400);
    const scale = Math.min(400 / canvas.width, 400 / canvas.height);
    const ox = (400 - canvas.width * scale) / 2;
    const oy = (400 - canvas.height * scale) / 2;
    tctx.drawImage(canvas, ox, oy, canvas.width * scale, canvas.height * scale);

    await saveToGallery(strokes, thumb.toDataURL("image/webp", 0.6));

    // Navigate to gallery after saving
    router.push("/saved");
  }, [strokes, router]);

  const topBtn: React.CSSProperties = {
    background: "#fff", border: "1px solid #e8e0d8", borderRadius: 10,
    padding: "8px 12px", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", color: "#666", fontSize: 18,
  };

  if (!loaded) return null;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#faf6f0", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px",
      }}>
        <Link href="/" style={{ ...topBtn, gap: 4, fontSize: 14, padding: "8px 16px", textDecoration: "none", color: "#666" }}>
          ←
        </Link>
        <div style={{ fontSize: 14, color: "#999" }}>
          <span style={{ color: "#e07a3a", fontWeight: 700 }}>{strokes.length}</span> strokes
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleUndo} style={topBtn} title="元に戻す">↩</button>
          <button onClick={handleClear} style={topBtn} title="全消去">🗑️</button>
          <button
            onClick={handleSave}
            disabled={strokes.length === 0 || saving}
            style={{
              background: strokes.length > 0 ? "#e07a3a" : "#e8e0d8",
              color: strokes.length > 0 ? "#fff" : "#999",
              border: "none", borderRadius: 10,
              padding: "8px 20px", cursor: strokes.length > 0 ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: 14,
            }}
          >
            保存する
          </button>
        </div>
      </div>

      {/* Saving overlay */}
      {saving && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "#faf6f0",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            border: "3px solid #e8e0d8", borderTopColor: "#e07a3a",
            animation: "spin 0.8s linear infinite",
            marginBottom: 24,
          }} />
          <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>保存しています...</p>
          <p style={{ color: "#999", fontSize: 15 }}>みんなのギャラリーに追加中</p>
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

      {/* Color Picker popup */}
      {showColorPicker && (
        <ColorPicker
          color={color}
          onChange={(c) => { setColor(c); if (brush === "eraser") setBrush("pen"); }}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Bottom toolbar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80,
        background: "rgba(250,246,240,0.95)", backdropFilter: "blur(8px)",
        borderTop: "1px solid #e8e0d8",
        padding: "8px 16px 16px",
      }}>
        {/* Brush row */}
        <div style={{
          display: "flex", gap: 2, overflowX: "auto", paddingBottom: 8,
          scrollbarWidth: "none",
        }}>
          {BRUSH_LIST.map((b) => (
            <button
              key={b.type}
              onClick={() => setBrush(b.type)}
              style={{
                background: brush === b.type ? "rgba(224,122,58,0.12)" : "transparent",
                border: brush === b.type ? "1.5px solid #e07a3a" : "1.5px solid transparent",
                borderRadius: 10, padding: "6px 8px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                minWidth: 52, flexShrink: 0,
                color: brush === b.type ? "#e07a3a" : "#888",
              }}
            >
              <span style={{ fontSize: 18 }}>{BRUSH_ICONS[b.type]}</span>
              <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* Color + size row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Color swatches */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
            {PALETTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); if (brush === "eraser") setBrush("pen"); }}
                style={{
                  width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: c,
                  boxShadow: color === c ? "0 0 0 2.5px #e07a3a" : (c === "#ffffff" ? "inset 0 0 0 1px #e8e0d8" : "none"),
                  padding: 0,
                }}
              />
            ))}
            {/* Custom color button */}
            <button
              onClick={() => setShowColorPicker(true)}
              style={{
                width: 26, height: 26, borderRadius: 6, cursor: "pointer",
                background: color, border: "1px solid #e8e0d8",
                position: "relative", padding: 0,
              }}
            >
              <span style={{
                position: "absolute", bottom: -1, right: -1,
                fontSize: 8, background: "#e07a3a", color: "#fff",
                borderRadius: 3, padding: "0 2px", lineHeight: "12px",
              }}>▼</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "#e8e0d8" }} />

          {/* Size */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 120 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#333",
            }} />
            <input
              type="range" min="0.5" max="50" step="0.5" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: 70, accentColor: "#e07a3a" }}
            />
            <div style={{
              width: 14, height: 14, borderRadius: "50%", background: "#e07a3a",
            }} />
            <span style={{ fontSize: 12, color: "#999", minWidth: 36, textAlign: "right" }}>{brushSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
