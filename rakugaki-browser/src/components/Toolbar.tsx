"use client";

import { type Tool } from "@/lib/types";

interface ToolbarProps {
  color: string;
  brushSize: number;
  tool: Tool;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = [
  "#ccff00",
  "#ff3366",
  "#00ccff",
  "#ff9900",
  "#ffffff",
  "#ff00ff",
  "#00ff88",
];

export default function Toolbar({
  color,
  brushSize,
  tool,
  onColorChange,
  onBrushSizeChange,
  onToolChange,
  onUndo,
  onClear,
}: ToolbarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#141414] border border-border rounded-full px-6 py-3 shadow-lg z-50">
      {/* Tool buttons */}
      <button
        onClick={() => onToolChange("pen")}
        className={`p-2 rounded-full transition-colors ${
          tool === "pen" ? "bg-neon text-black" : "text-muted hover:text-foreground"
        }`}
        title="ペン"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>

      <button
        onClick={() => onToolChange("eraser")}
        className={`p-2 rounded-full transition-colors ${
          tool === "eraser" ? "bg-neon text-black" : "text-muted hover:text-foreground"
        }`}
        title="消しゴム"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Colors */}
      <div className="flex gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              color === c && tool === "pen" ? "border-white scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Brush size */}
      <div className="flex items-center gap-2">
        <span className="text-muted text-xs">{brushSize}px</span>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-20 accent-[#ccff00]"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Actions */}
      <button
        onClick={onUndo}
        className="p-2 rounded-full text-muted hover:text-foreground transition-colors"
        title="元に戻す"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>

      <button
        onClick={onClear}
        className="p-2 rounded-full text-muted hover:text-red-400 transition-colors"
        title="全消去"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
