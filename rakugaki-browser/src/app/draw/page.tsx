"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import type { Point, Stroke, Tool, PenType } from "@/lib/types";
import { saveDrawing } from "@/lib/storage";

export default function DrawPage() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState("#ccff00");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<Tool>("pen");
  const [penType, setPenType] = useState<PenType>("pen");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const drawingId = useRef(crypto.randomUUID());

  const handleStrokeStart = useCallback(() => {
    setCurrentStroke([]);
  }, []);

  const handleStrokePoint = useCallback((point: Point) => {
    setCurrentStroke((prev) => [...prev, point]);
  }, []);

  const handleStrokeEnd = useCallback(() => {
    setCurrentStroke((prev) => {
      if (prev.length < 2) return [];

      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points: prev,
        color: tool === "eraser" ? "eraser" : color,
        width: brushSize,
        timestamp: Date.now(),
        penType: tool === "eraser" ? "pen" : penType,
      };

      setStrokes((s) => [...s, newStroke]);
      return [];
    });
  }, [color, brushSize, tool, penType]);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setStrokes([]);
    drawingId.current = crypto.randomUUID();
  }, []);

  const handleSave = useCallback(() => {
    // Generate thumbnail from canvas
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    // Create a smaller thumbnail
    const thumbCanvas = document.createElement("canvas");
    const thumbSize = 400;
    thumbCanvas.width = thumbSize;
    thumbCanvas.height = thumbSize;
    const thumbCtx = thumbCanvas.getContext("2d");
    if (!thumbCtx) return;

    // Fill with dark background
    thumbCtx.fillStyle = "#0a0a0a";
    thumbCtx.fillRect(0, 0, thumbSize, thumbSize);

    // Draw the canvas content scaled down
    const scale = Math.min(
      thumbSize / canvas.width,
      thumbSize / canvas.height
    );
    const offsetX = (thumbSize - canvas.width * scale) / 2;
    const offsetY = (thumbSize - canvas.height * scale) / 2;
    thumbCtx.drawImage(
      canvas,
      offsetX,
      offsetY,
      canvas.width * scale,
      canvas.height * scale
    );

    const thumbnail = thumbCanvas.toDataURL("image/webp", 0.7);
    const now = Date.now();

    saveDrawing({
      id: drawingId.current,
      strokes,
      thumbnail,
      title: `らくがき #${Math.floor(Math.random() * 9999)}`,
      createdAt: now,
      updatedAt: now,
    });

    setSaveMessage("保存しました！");
    setTimeout(() => setSaveMessage(null), 2000);
  }, [strokes]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Back button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-muted hover:text-neon transition-colors text-sm bg-[#141414]/80 backdrop-blur-sm px-3 py-2 rounded-full border border-border"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        戻る
      </Link>

      {/* Stroke count */}
      <div className="fixed top-4 right-4 z-50 text-muted text-sm bg-[#141414]/80 backdrop-blur-sm px-3 py-2 rounded-full border border-border">
        {strokes.length} ストローク
      </div>

      {/* Save message toast */}
      {saveMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neon text-black font-medium px-4 py-2 rounded-full text-sm animate-fade-in">
          {saveMessage}
        </div>
      )}

      {/* Canvas */}
      <Canvas
        strokes={strokes}
        currentStroke={currentStroke}
        color={color}
        brushSize={brushSize}
        tool={tool}
        penType={penType}
        onStrokeStart={handleStrokeStart}
        onStrokePoint={handleStrokePoint}
        onStrokeEnd={handleStrokeEnd}
      />

      {/* Toolbar */}
      <Toolbar
        color={color}
        brushSize={brushSize}
        tool={tool}
        penType={penType}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onToolChange={setTool}
        onPenTypeChange={setPenType}
        onUndo={handleUndo}
        onClear={handleClear}
        onSave={handleSave}
        canSave={strokes.length > 0}
      />
    </div>
  );
}
