"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Point, Stroke, Tool, PenType } from "@/lib/types";

interface CanvasProps {
  strokes: Stroke[];
  currentStroke: Point[];
  color: string;
  brushSize: number;
  tool: Tool;
  penType: PenType;
  onStrokeStart: () => void;
  onStrokePoint: (point: Point) => void;
  onStrokeEnd: () => void;
}

function getPenStyle(penType: PenType, color: string, width: number) {
  switch (penType) {
    case "marker":
      return {
        alpha: 0.7,
        lineCap: "round" as CanvasLineCap,
        lineJoin: "round" as CanvasLineJoin,
        width: width * 1.5,
        color,
      };
    case "highlighter":
      return {
        alpha: 0.3,
        lineCap: "square" as CanvasLineCap,
        lineJoin: "bevel" as CanvasLineJoin,
        width: width * 3,
        color,
      };
    case "pen":
    default:
      return {
        alpha: 1,
        lineCap: "round" as CanvasLineCap,
        lineJoin: "round" as CanvasLineJoin,
        width,
        color,
      };
  }
}

export default function Canvas({
  strokes,
  currentStroke,
  color,
  brushSize,
  tool,
  penType,
  onStrokeStart,
  onStrokePoint,
  onStrokeEnd,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: Point[],
      strokeColor: string,
      strokeWidth: number,
      isEraser: boolean,
      strokePenType: PenType
    ) => {
      if (points.length < 2) return;

      ctx.save();

      if (isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 1;
      } else {
        const style = getPenStyle(strokePenType, strokeColor, strokeWidth);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.lineCap = style.lineCap;
        ctx.lineJoin = style.lineJoin;
        ctx.globalAlpha = style.alpha;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const midX = (points[i - 1].x + points[i].x) / 2;
        const midY = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, midX, midY);
      }

      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      const isEraser = stroke.color === "eraser";
      drawStroke(
        ctx,
        stroke.points,
        stroke.color,
        stroke.width,
        isEraser,
        stroke.penType || "pen"
      );
    }

    if (currentStroke.length > 0) {
      const isEraser = tool === "eraser";
      drawStroke(
        ctx,
        currentStroke,
        isEraser ? "eraser" : color,
        brushSize,
        isEraser,
        penType
      );
    }
  }, [strokes, currentStroke, color, brushSize, tool, penType, drawStroke]);

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

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPoint = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    onStrokeStart();
    onStrokePoint(getPoint(e));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    onStrokePoint(getPoint(e));
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    onStrokeEnd();
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 cursor-crosshair touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
