"use client";

import { useEffect, useRef } from "react";

// ── Spawn ──
const MAX_PARTICLES = 20;
const SPAWN_INTERVAL_MIN = 1200; // ms
const SPAWN_INTERVAL_MAX = 1800; // ms

// ── Fall speed ──
const DURATION_MIN = 18; // seconds
const DURATION_MAX = 25; // seconds

// ── Kosukuma icon ──
const ICON_SPAWN_MIN = 2000; // ms
const ICON_SPAWN_MAX = 5000; // ms
const ICON_SIZES = [20, 26, 32, 38];

// ── Visual ──
const FONT_SIZES = [14, 16, 18, 20, 23, 26];
const FONT_FAMILY = '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS PMincho", serif';
const COLORS = [
  "rgba(184, 168, 130, 0.75)",
  "rgba(196, 176, 138, 0.65)",
  "rgba(168, 152, 118, 0.55)",
  "rgba(200, 182, 148, 0.7)",
  "rgba(176, 160, 128, 0.6)",
  "rgba(192, 174, 140, 0.65)",
  "rgba(160, 144, 112, 0.5)",
  "rgba(188, 172, 136, 0.75)",
];

interface Particle {
  type: "word" | "icon";
  word: string;
  x: number;
  y: number;
  speed: number; // px per frame (60fps)
  width: number;
  height: number;
  fontSize: number;
  color: string;
  opacity: number;
  iconSize: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export default function FallingWords() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wordsRef = useRef<string[]>([]);
  const rafRef = useRef(0);
  const iconRef = useRef<HTMLImageElement | null>(null);

  // Load icon
  useEffect(() => {
    const img = new Image();
    img.src = "/kosukuma_white.png";
    img.onload = () => {
      iconRef.current = img;
    };
  }, []);

  // Fetch registered words
  useEffect(() => {
    fetch("/api/words?sort=newest&limit=500")
      .then((res) => res.json())
      .then((data) => {
        const wordList = (data.words || []).map((w: { word: string }) => w.word);
        if (wordList.length > 0) {
          wordsRef.current = wordList;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Spawn word particles on interval ──
    let wordTimer: ReturnType<typeof setTimeout>;
    const scheduleWord = () => {
      const delay = rand(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
      wordTimer = setTimeout(() => {
        const words = wordsRef.current;
        if (words.length > 0 && particlesRef.current.length < MAX_PARTICLES) {
          const word = words[Math.floor(Math.random() * words.length)];
          const fontSize = FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)];
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          ctx.font = `${fontSize}px ${FONT_FAMILY}`;
          const metrics = ctx.measureText(word);
          const w = metrics.width;
          const h = fontSize * 1.2;
          const cw = window.innerWidth;
          const margin = w / 2 + 10;
          const duration = rand(DURATION_MIN, DURATION_MAX);
          const ch = window.innerHeight;
          // speed = total distance / (duration * 60fps)
          const speed = (ch + h + 100) / (duration * 60);

          particlesRef.current.push({
            type: "word",
            word,
            x: margin + Math.random() * Math.max(cw - margin * 2, 0),
            y: -h - 50,
            speed,
            width: w,
            height: h,
            fontSize,
            color,
            opacity: rand(0.12, 0.35),
            iconSize: 0,
          });
        }
        scheduleWord();
      }, delay);
    };
    scheduleWord();

    // ── Spawn icon particles on interval ──
    let iconTimer: ReturnType<typeof setTimeout>;
    const scheduleIcon = () => {
      const delay = rand(ICON_SPAWN_MIN, ICON_SPAWN_MAX);
      iconTimer = setTimeout(() => {
        if (iconRef.current) {
          const iconSize = ICON_SIZES[Math.floor(Math.random() * ICON_SIZES.length)];
          const cw = window.innerWidth;
          const ch = window.innerHeight;
          const duration = rand(DURATION_MIN, DURATION_MAX);
          const speed = (ch + iconSize + 100) / (duration * 60);

          particlesRef.current.push({
            type: "icon",
            word: "",
            x: rand(iconSize, cw - iconSize),
            y: -iconSize - 50,
            speed,
            width: iconSize,
            height: iconSize,
            fontSize: 0,
            color: "",
            opacity: rand(0.15, 0.4),
            iconSize,
          });
        }
        scheduleIcon();
      }, delay);
    };
    scheduleIcon();

    // ── Animation loop ──
    const tick = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, cw, ch);

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.speed;

        // Remove if off screen
        if (p.y > ch + 100) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === "word") {
          ctx.font = `${p.fontSize}px ${FONT_FAMILY}`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = "rgba(184, 168, 130, 0.08)";
          ctx.shadowBlur = 4;
          ctx.textBaseline = "top";
          ctx.fillText(p.word, p.x, p.y);
        } else if (p.type === "icon" && iconRef.current) {
          ctx.drawImage(iconRef.current, p.x, p.y, p.iconSize, p.iconSize);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(wordTimer);
      clearTimeout(iconTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
