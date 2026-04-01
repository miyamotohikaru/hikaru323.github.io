"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Point, Stroke, BrushType } from "@/lib/types";

interface DrawingCanvasProps {
  strokes: Stroke[];
  currentStroke: Point[];
  color: string;
  brushSize: number;
  brush: BrushType;
  onStrokeStart: () => void;
  onStrokePoint: (point: Point) => void;
  onStrokeEnd: () => void;
}

function drawSmoothLine(
  ctx: CanvasRenderingContext2D, points: Point[], color: string,
  width: number, alpha: number, cap: CanvasLineCap, join: CanvasLineJoin, isEraser = false
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = cap;
  ctx.lineJoin = join;
  ctx.lineWidth = width;
  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.globalAlpha = 1;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const mx = (points[i - 1].x + points[i].x) / 2;
    const my = (points[i - 1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

function drawCrayon(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  for (let pass = 0; pass < 3; pass++) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.15;
    ctx.lineWidth = width * (0.8 + Math.random() * 0.6);
    ctx.beginPath();
    ctx.moveTo(points[0].x + (Math.random() - 0.5) * 3, points[0].y + (Math.random() - 0.5) * 3);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x + (Math.random() - 0.5) * 3, points[i].y + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawFude(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.lineCap = "round";
  for (let i = 1; i < points.length; i++) {
    const speed = Math.sqrt(
      Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2)
    );
    const w = width * Math.max(0.3, Math.min(2.5, 8 / (speed + 1)));
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAirbrush(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  ctx.save();
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const radius = width * 2;
  for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 80))) {
    const p = points[i];
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
  }
  ctx.restore();
}

function drawWatercolor(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  for (let pass = 0; pass < 4; pass++) {
    ctx.globalAlpha = 0.08;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (1.5 + pass * 0.8);
    ctx.beginPath();
    const ox = (Math.random() - 0.5) * 4;
    const oy = (Math.random() - 0.5) * 4;
    ctx.moveTo(points[0].x + ox, points[0].y + oy);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) / 2 + ox;
      const my = (points[i - 1].y + points[i].y) / 2 + oy;
      ctx.quadraticCurveTo(points[i - 1].x + ox, points[i - 1].y + oy, mx, my);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawCalligraphy(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const angle = Math.atan2(dy, dx);
    ctx.lineWidth = width * (0.3 + 0.7 * Math.abs(Math.cos(angle - Math.PI / 4)));
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCharcoal(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  for (let pass = 0; pass < 5; pass++) {
    ctx.globalAlpha = 0.12 + Math.random() * 0.08;
    ctx.lineWidth = width * (0.6 + Math.random() * 1.0);
    ctx.beginPath();
    ctx.moveTo(
      points[0].x + (Math.random() - 0.5) * width * 0.4,
      points[0].y + (Math.random() - 0.5) * width * 0.4
    );
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(
        points[i].x + (Math.random() - 0.5) * width * 0.4,
        points[i].y + (Math.random() - 0.5) * width * 0.4
      );
    }
    ctx.stroke();
  }
  ctx.restore();
}

function renderStroke(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number, brush: BrushType) {
  switch (brush) {
    case "pen":
      drawSmoothLine(ctx, points, color, width, 1, "round", "round");
      break;
    case "ballpoint":
      drawSmoothLine(ctx, points, color, width * 0.7, 0.85, "round", "round");
      break;
    case "marker":
      drawSmoothLine(ctx, points, color, width * 1.5, 0.7, "round", "round");
      break;
    case "highlighter":
      drawSmoothLine(ctx, points, color, width * 3, 0.3, "square", "bevel");
      break;
    case "crayon":
      drawCrayon(ctx, points, color, width * 1.2);
      break;
    case "fude":
      drawFude(ctx, points, color, width * 1.5);
      break;
    case "calligraphy":
      drawCalligraphy(ctx, points, color, width);
      break;
    case "watercolor":
      drawWatercolor(ctx, points, color, width * 2);
      break;
    case "airbrush":
      drawAirbrush(ctx, points, color, width);
      break;
    case "charcoal":
      drawCharcoal(ctx, points, color, width * 1.2);
      break;
    case "eraser":
      drawSmoothLine(ctx, points, color, width * 2, 1, "round", "round", true);
      break;
  }
}

export default function DrawingCanvas({
  strokes, currentStroke, color, brushSize, brush,
  onStrokeStart, onStrokePoint, onStrokeEnd,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) {
      renderStroke(ctx, s.points, s.color, s.width, s.brush || "pen");
    }
    if (currentStroke.length > 0) {
      renderStroke(ctx, currentStroke, brush === "eraser" ? "#000" : color, brushSize, brush);
    }
  }, [strokes, currentStroke, color, brushSize, brush]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  const getPoint = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure };
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 10,
        cursor: "crosshair", touchAction: "none",
        background: "#faf6f0",
      }}
      onPointerDown={(e) => {
        isDrawing.current = true;
        canvasRef.current?.setPointerCapture(e.pointerId);
        onStrokeStart();
        onStrokePoint(getPoint(e));
      }}
      onPointerMove={(e) => { if (isDrawing.current) onStrokePoint(getPoint(e)); }}
      onPointerUp={() => { if (isDrawing.current) { isDrawing.current = false; onStrokeEnd(); } }}
      onPointerLeave={() => { if (isDrawing.current) { isDrawing.current = false; onStrokeEnd(); } }}
    />
  );
}
