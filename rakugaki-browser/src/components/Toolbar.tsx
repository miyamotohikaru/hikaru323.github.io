"use client";

import { useState } from "react";
import { type Tool, type PenType } from "@/lib/types";

interface ToolbarProps {
  color: string;
  brushSize: number;
  tool: Tool;
  penType: PenType;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onToolChange: (tool: Tool) => void;
  onPenTypeChange: (penType: PenType) => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  canSave: boolean;
}

const COLOR_ROWS = [
  ["#000000", "#444444", "#888888", "#cccccc", "#ffffff"],
  ["#ff0000", "#ff5500", "#ff9900", "#ffcc00", "#ffff00"],
  ["#ccff00", "#66ff00", "#00ff88", "#00ffcc", "#00ffff"],
  ["#00ccff", "#0088ff", "#0044ff", "#4400ff", "#8800ff"],
  ["#cc00ff", "#ff00ff", "#ff0088", "#ff3366", "#ff6699"],
];

const BRUSH_PRESETS = [2, 5, 10, 20, 35, 50];

const PEN_TYPES: { type: PenType; label: string; icon: React.ReactNode }[] = [
  {
    type: "pen",
    label: "ペン",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
  },
  {
    type: "marker",
    label: "マーカー",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" />
        <path d="M8 16V4l8 4v8" />
      </svg>
    ),
  },
  {
    type: "highlighter",
    label: "蛍光ペン",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 20h12" />
        <path d="M9 16V8l6 2v6" />
      </svg>
    ),
  },
];

export default function Toolbar({
  color,
  brushSize,
  tool,
  penType,
  onColorChange,
  onBrushSizeChange,
  onToolChange,
  onPenTypeChange,
  onUndo,
  onClear,
  onSave,
  canSave,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushPanel, setShowBrushPanel] = useState(false);
  const [showPenPanel, setShowPenPanel] = useState(false);

  return (
    <>
      {/* Main toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#141414]/95 backdrop-blur-md border border-border rounded-2xl px-4 py-2.5 shadow-2xl z-50">
        {/* Pen types */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPenPanel(!showPenPanel);
              setShowColorPicker(false);
              setShowBrushPanel(false);
            }}
            className={`p-2 rounded-xl transition-all ${
              tool === "pen" ? "bg-neon/20 text-neon" : "text-muted hover:text-foreground"
            }`}
            title="ペンの種類"
          >
            {PEN_TYPES.find((p) => p.type === penType)?.icon}
          </button>

          {showPenPanel && (
            <div className="absolute bottom-full left-0 mb-3 bg-[#1a1a1a] border border-border rounded-xl p-2 shadow-2xl min-w-[140px]">
              {PEN_TYPES.map((p) => (
                <button
                  key={p.type}
                  onClick={() => {
                    onPenTypeChange(p.type);
                    onToolChange("pen");
                    setShowPenPanel(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    penType === p.type && tool === "pen"
                      ? "bg-neon/20 text-neon"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Eraser */}
        <button
          onClick={() => onToolChange("eraser")}
          className={`p-2 rounded-xl transition-all ${
            tool === "eraser" ? "bg-neon/20 text-neon" : "text-muted hover:text-foreground"
          }`}
          title="消しゴム"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
            <path d="M22 21H7" />
            <path d="m5 11 9 9" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Color button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowBrushPanel(false);
              setShowPenPanel(false);
            }}
            className="w-8 h-8 rounded-lg border-2 border-border hover:border-white/40 transition-all shadow-inner"
            style={{ backgroundColor: color }}
            title="色を選ぶ"
          />

          {showColorPicker && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#1a1a1a] border border-border rounded-xl p-3 shadow-2xl">
              <div className="flex flex-col gap-1.5">
                {COLOR_ROWS.map((row, ri) => (
                  <div key={ri} className="flex gap-1.5">
                    {row.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onColorChange(c);
                          onToolChange("pen");
                        }}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          color === c
                            ? "ring-2 ring-white ring-offset-1 ring-offset-[#1a1a1a] scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              {/* Custom color */}
              <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                <label className="text-xs text-muted">カスタム:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    onColorChange(e.target.value);
                    onToolChange("pen");
                  }}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-muted font-mono">{color}</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Brush size */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBrushPanel(!showBrushPanel);
              setShowColorPicker(false);
              setShowPenPanel(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted hover:text-foreground transition-all hover:bg-white/5"
            title="ブラシサイズ"
          >
            <div
              className="rounded-full bg-current"
              style={{
                width: Math.max(4, Math.min(brushSize * 0.6, 18)),
                height: Math.max(4, Math.min(brushSize * 0.6, 18)),
              }}
            />
            <span className="text-xs font-mono">{brushSize}</span>
          </button>

          {showBrushPanel && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#1a1a1a] border border-border rounded-xl p-3 shadow-2xl min-w-[200px]">
              {/* Presets */}
              <div className="flex items-end justify-between gap-2 mb-3">
                {BRUSH_PRESETS.map((size) => (
                  <button
                    key={size}
                    onClick={() => onBrushSizeChange(size)}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-lg transition-all ${
                      brushSize === size
                        ? "bg-neon/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: Math.max(4, size * 0.5),
                        height: Math.max(4, size * 0.5),
                        backgroundColor: brushSize === size ? "var(--accent-neon)" : "#888",
                      }}
                    />
                    <span className="text-[10px] text-muted">{size}</span>
                  </button>
                ))}
              </div>
              {/* Slider */}
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                className="w-full accent-[#ccff00]"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Undo */}
        <button
          onClick={onUndo}
          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-all"
          title="元に戻す"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="p-2 rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="全消去"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Save */}
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            canSave
              ? "bg-neon text-black hover:bg-neon-dim"
              : "bg-border text-muted cursor-not-allowed"
          }`}
          title="保存する"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          保存
        </button>
      </div>

      {/* Click outside to close panels */}
      {(showColorPicker || showBrushPanel || showPenPanel) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowColorPicker(false);
            setShowBrushPanel(false);
            setShowPenPanel(false);
          }}
        />
      )}
    </>
  );
}
