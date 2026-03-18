"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import type { Point, Stroke, Tool } from "@/lib/types";

export default function DrawPage() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState("#ccff00");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<Tool>("pen");

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
      };

      setStrokes((s) => [...s, newStroke]);
      return [];
    });
  }, [color, brushSize, tool]);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setStrokes([]);
  }, []);

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

      {/* Canvas */}
      <Canvas
        strokes={strokes}
        currentStroke={currentStroke}
        color={color}
        brushSize={brushSize}
        tool={tool}
        onStrokeStart={handleStrokeStart}
        onStrokePoint={handleStrokePoint}
        onStrokeEnd={handleStrokeEnd}
      />

      {/* Toolbar */}
      <Toolbar
        color={color}
        brushSize={brushSize}
        tool={tool}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onToolChange={setTool}
        onUndo={handleUndo}
        onClear={handleClear}
      />
    </div>
  );
}
