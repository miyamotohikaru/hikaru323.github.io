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
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, s, max];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [parseInt(m.substring(0, 2), 16) || 0, parseInt(m.substring(2, 4), 16) || 0, parseInt(m.substring(4, 6), 16) || 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

const SV_SIZE = 200;
const HUE_H = 16;

export default function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const svRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState<[number, number, number]>(() => {
    const [r, g, b] = hexToRgb(color);
    return rgbToHsv(r, g, b);
  });
  const [hex, setHex] = useState(color);
  const dragSV = useRef(false);
  const dragHue = useRef(false);

  const renderSV = useCallback((h: number) => {
    const ctx = svRef.current?.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = hsvToRgb(h, 1, 1);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, SV_SIZE, SV_SIZE);
    const wg = ctx.createLinearGradient(0, 0, SV_SIZE, 0);
    wg.addColorStop(0, "rgba(255,255,255,1)"); wg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wg; ctx.fillRect(0, 0, SV_SIZE, SV_SIZE);
    const bg = ctx.createLinearGradient(0, 0, 0, SV_SIZE);
    bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, SV_SIZE, SV_SIZE);
  }, []);

  const renderHue = useCallback(() => {
    const ctx = hueRef.current?.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, SV_SIZE, 0);
    for (let i = 0; i <= 360; i += 30) {
      const [r, gr, b] = hsvToRgb(i, 1, 1);
      g.addColorStop(i / 360, `rgb(${r},${gr},${b})`);
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, SV_SIZE, HUE_H);
  }, []);

  useEffect(() => { renderSV(hsv[0]); renderHue(); }, [hsv[0], renderSV, renderHue]);

  const pickSV = (e: React.MouseEvent | MouseEvent) => {
    const rect = svRef.current!.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const nv: [number, number, number] = [hsv[0], s, v];
    setHsv(nv);
    const [r, g, b] = hsvToRgb(nv[0], s, v);
    const h = rgbToHex(r, g, b);
    setHex(h); onChange(h);
  };

  const pickHue = (e: React.MouseEvent | MouseEvent) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const h = Math.max(0, Math.min(359, ((e.clientX - rect.left) / rect.width) * 360));
    const nv: [number, number, number] = [h, hsv[1], hsv[2]];
    setHsv(nv);
    const [r, g, b] = hsvToRgb(h, hsv[1], hsv[2]);
    const hx = rgbToHex(r, g, b);
    setHex(hx); onChange(hx);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragSV.current) pickSV(e); if (dragHue.current) pickHue(e); };
    const up = () => { dragSV.current = false; dragHue.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  });

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={onClose} />
      <div style={{
        position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
        background: "#fff", border: "1px solid #e8e0d8", borderRadius: 16, padding: 16,
        zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <canvas ref={svRef} width={SV_SIZE} height={SV_SIZE}
            style={{ borderRadius: 8, cursor: "crosshair", display: "block" }}
            onMouseDown={(e) => { dragSV.current = true; pickSV(e); }}
          />
          <div style={{
            position: "absolute", left: hsv[1] * SV_SIZE - 7, top: (1 - hsv[2]) * SV_SIZE - 7,
            width: 14, height: 14, border: "2px solid white", borderRadius: "50%",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)", pointerEvents: "none",
          }} />
        </div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <canvas ref={hueRef} width={SV_SIZE} height={HUE_H}
            style={{ borderRadius: 8, cursor: "pointer", display: "block", width: SV_SIZE, height: HUE_H }}
            onMouseDown={(e) => { dragHue.current = true; pickHue(e); }}
          />
          <div style={{
            position: "absolute", left: (hsv[0] / 360) * SV_SIZE - 3, top: -2,
            width: 6, height: HUE_H + 4, border: "2px solid white", borderRadius: 3,
            boxShadow: "0 0 4px rgba(0,0,0,0.3)", pointerEvents: "none",
          }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: color, border: "1px solid #e8e0d8" }} />
          <input value={hex}
            onChange={(e) => {
              setHex(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                const [r, g, b] = hexToRgb(e.target.value);
                setHsv(rgbToHsv(r, g, b));
                onChange(e.target.value);
              }
            }}
            style={{
              background: "#faf6f0", border: "1px solid #e8e0d8", borderRadius: 6,
              color: "#333", padding: "4px 8px", fontSize: 13, fontFamily: "monospace",
              width: 90, outline: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}
