"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, s, v];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.substring(0, 2), 16) || 0,
    parseInt(m.substring(2, 4), 16) || 0,
    parseInt(m.substring(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const QUICK_COLORS = [
  "#ffffff", "#cccccc", "#888888", "#444444", "#000000",
  "#ff0000", "#ff5500", "#ff9900", "#ffcc00", "#ffff00",
  "#ccff00", "#66ff00", "#00ff88", "#00ccff", "#0088ff",
  "#4400ff", "#8800ff", "#cc00ff", "#ff00ff", "#ff0088",
];

const SV_SIZE = 200;
const HUE_HEIGHT = 16;

export default function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState<[number, number, number]>(() => {
    const [r, g, b] = hexToRgb(color);
    return rgbToHsv(r, g, b);
  });
  const [hexInput, setHexInput] = useState(color);
  const draggingSV = useRef(false);
  const draggingHue = useRef(false);

  const renderSV = useCallback((h: number) => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = SV_SIZE, ht = SV_SIZE;

    // Base hue
    const [r, g, b] = hsvToRgb(h, 1, 1);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, w, ht);

    // White gradient (left to right)
    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, ht);

    // Black gradient (top to bottom)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, ht);
    blackGrad.addColorStop(0, "rgba(0,0,0,0)");
    blackGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, ht);
  }, []);

  const renderHue = useCallback(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, SV_SIZE, 0);
    for (let i = 0; i <= 360; i += 30) {
      const [r, g, b] = hsvToRgb(i, 1, 1);
      grad.addColorStop(i / 360, `rgb(${r},${g},${b})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SV_SIZE, HUE_HEIGHT);
  }, []);

  useEffect(() => {
    renderSV(hsv[0]);
    renderHue();
  }, [hsv[0], renderSV, renderHue]);

  const updateFromSV = (e: React.MouseEvent | MouseEvent) => {
    const rect = svCanvasRef.current!.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const newHsv: [number, number, number] = [hsv[0], s, v];
    setHsv(newHsv);
    const [r, g, b] = hsvToRgb(newHsv[0], s, v);
    const hex = rgbToHex(r, g, b);
    setHexInput(hex);
    onChange(hex);
  };

  const updateFromHue = (e: React.MouseEvent | MouseEvent) => {
    const rect = hueCanvasRef.current!.getBoundingClientRect();
    const h = Math.max(0, Math.min(359, ((e.clientX - rect.left) / rect.width) * 360));
    const newHsv: [number, number, number] = [h, hsv[1], hsv[2]];
    setHsv(newHsv);
    const [r, g, b] = hsvToRgb(h, hsv[1], hsv[2]);
    const hex = rgbToHex(r, g, b);
    setHexInput(hex);
    onChange(hex);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (draggingSV.current) updateFromSV(e);
      if (draggingHue.current) updateFromHue(e);
    };
    const handleUp = () => {
      draggingSV.current = false;
      draggingHue.current = false;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  });

  const svX = hsv[1] * SV_SIZE;
  const svY = (1 - hsv[2]) * SV_SIZE;
  const hueX = (hsv[0] / 360) * SV_SIZE;

  return (
    <>
      <div style={{
        position: "fixed", inset: 0, zIndex: 90,
      }} onClick={onClose} />
      <div style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1e1e1e",
        border: "1px solid #333",
        borderRadius: 16,
        padding: 16,
        zIndex: 100,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        animation: "fadeIn 0.2s ease",
      }}>
        {/* SV field */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <canvas
            ref={svCanvasRef}
            width={SV_SIZE}
            height={SV_SIZE}
            style={{ borderRadius: 8, cursor: "crosshair", display: "block" }}
            onMouseDown={(e) => { draggingSV.current = true; updateFromSV(e); }}
          />
          {/* Cursor */}
          <div style={{
            position: "absolute",
            left: svX - 7,
            top: svY - 7,
            width: 14, height: 14,
            border: "2px solid white",
            borderRadius: "50%",
            boxShadow: "0 0 3px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Hue slider */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <canvas
            ref={hueCanvasRef}
            width={SV_SIZE}
            height={HUE_HEIGHT}
            style={{ borderRadius: 8, cursor: "pointer", display: "block", width: SV_SIZE, height: HUE_HEIGHT }}
            onMouseDown={(e) => { draggingHue.current = true; updateFromHue(e); }}
          />
          <div style={{
            position: "absolute",
            left: hueX - 3,
            top: -2,
            width: 6, height: HUE_HEIGHT + 4,
            border: "2px solid white",
            borderRadius: 3,
            boxShadow: "0 0 3px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Hex input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: color, border: "1px solid #444",
          }} />
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                const [r, g, b] = hexToRgb(e.target.value);
                setHsv(rgbToHsv(r, g, b));
                onChange(e.target.value);
              }
            }}
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: 6,
              color: "#eee",
              padding: "4px 8px",
              fontSize: 13,
              fontFamily: "monospace",
              width: 90,
              outline: "none",
            }}
          />
        </div>

        {/* Quick colors */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 3,
        }}>
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                onChange(c);
                const [r, g, b] = hexToRgb(c);
                setHsv(rgbToHsv(r, g, b));
                setHexInput(c);
              }}
              style={{
                width: 18, height: 18,
                borderRadius: 4,
                background: c,
                border: color === c ? "2px solid white" : "1px solid #333",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
