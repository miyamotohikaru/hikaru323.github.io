"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Physics constants ──
const GRAVITY = 0.012;
const MAX_FALL_SPEED = 1.5;
const COLLISION_ITERATIONS = 5;

// ── Mouse interaction ──
const MOUSE_RADIUS = 150;
const MOUSE_PUSH = 55;
const DISPLACE_LERP = 0.08;
const RETURN_LERP = 0.035;
const MOUSE_SMOOTH_LERP = 0.06;

// ── Spawn ──
const SPAWN_INTERVAL = 5; // frames
const SPAWN_COUNT = 2;
const MAX_PARTICLES = 500;

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
  word: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  supported: boolean;
  phase: number; // for sway
  displaceX: number;
  displaceY: number;
  tiltOffset: number;
  landingOffset: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function FallingWords() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wordsRef = useRef<string[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const mouseRawRef = useRef({ x: -9999, y: -9999 });
  const mouseSmoothRef = useRef({ x: -9999, y: -9999 });

  // Fetch all registered words from the dictionary
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

  // Track mouse via window events (canvas has pointer-events: none)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRawRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRawRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const spawnParticle = useCallback((ctx: CanvasRenderingContext2D, cw: number): Particle | null => {
    const words = wordsRef.current;
    if (words.length === 0) return null;

    const word = words[Math.floor(Math.random() * words.length)];
    const fontSize = FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    const metrics = ctx.measureText(word);
    const w = metrics.width;
    const h = fontSize * 1.2;

    const margin = w / 2 + 10;
    const x = margin + Math.random() * (cw - margin * 2);
    const y = -(Math.random() * 400 + h);

    return {
      word,
      x,
      y,
      vy: 0,
      width: w,
      height: h,
      fontSize,
      color,
      supported: false,
      phase: Math.random() * Math.PI * 2,
      displaceX: 0,
      displaceY: 0,
      tiltOffset: 0,
      landingOffset: 0,
    };
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

    const tick = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const particles = particlesRef.current;
      const frame = frameRef.current;

      // ── Clear ──
      ctx.clearRect(0, 0, cw, ch);

      // ── Smooth mouse ──
      const sm = mouseSmoothRef.current;
      const rm = mouseRawRef.current;
      sm.x = lerp(sm.x, rm.x, MOUSE_SMOOTH_LERP);
      sm.y = lerp(sm.y, rm.y, MOUSE_SMOOTH_LERP);

      // ── Spawn ──
      if (frame % SPAWN_INTERVAL === 0 && particles.length < MAX_PARTICLES) {
        for (let i = 0; i < SPAWN_COUNT; i++) {
          if (particles.length >= MAX_PARTICLES) break;
          const p = spawnParticle(ctx, cw);
          if (p) particles.push(p);
        }
      }

      // ── Physics: gravity ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.supported) {
          p.vy += GRAVITY;
          if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;
          p.y += p.vy;
        }
      }

      // ── Floor collision ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const bottom = p.y + p.height;
        if (bottom >= ch) {
          p.y = ch - p.height;
          p.vy = 0;
          p.supported = true;
        }
      }

      // ── Stacking collision (vertical only) ──
      for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
        // Reset supported (keep floor-supported)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.supported = (p.y + p.height) >= ch - 0.5;
        }

        // Check collisions & propagate support
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];

            // AABB overlap check
            const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
            const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;

            if (overlapX && overlapY) {
              // Determine which is on top
              if (a.y < b.y) {
                // a is above b
                if (b.supported) {
                  a.y = b.y - a.height;
                  a.vy = 0;
                  a.supported = true;
                  // Record landing offset for tilt
                  const aCenterX = a.x + a.width / 2;
                  const bCenterX = b.x + b.width / 2;
                  a.landingOffset = (aCenterX - bCenterX) / Math.max(b.width, 1);
                }
              } else {
                // b is above a
                if (a.supported) {
                  b.y = a.y - b.height;
                  b.vy = 0;
                  b.supported = true;
                  const bCenterX = b.x + b.width / 2;
                  const aCenterX = a.x + a.width / 2;
                  b.landingOffset = (bCenterX - aCenterX) / Math.max(a.width, 1);
                }
              }
            }
          }
        }
      }

      // ── Mouse displacement ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = p.x + p.width / 2 + p.displaceX;
        const cy = p.y + p.height / 2 + p.displaceY;
        const dx = cx - sm.x;
        const dy = cy - sm.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0.01) {
          const norm = 1 - dist / MOUSE_RADIUS;
          const strength = norm * norm * MOUSE_PUSH;
          const angle = Math.atan2(dy, dx);
          const targetDX = Math.cos(angle) * strength;
          const targetDY = Math.sin(angle) * strength;
          p.displaceX = lerp(p.displaceX, targetDX, DISPLACE_LERP);
          p.displaceY = lerp(p.displaceY, targetDY, DISPLACE_LERP);
        } else {
          p.displaceX = lerp(p.displaceX, 0, RETURN_LERP);
          p.displaceY = lerp(p.displaceY, 0, RETURN_LERP);
        }
      }

      // ── Draw ──
      ctx.textBaseline = "top";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const drawX = p.x + p.displaceX;
        const drawY = p.y + p.displaceY;

        // Sway & tilt (supported only)
        let rotation = 0;
        let swayX = 0;
        if (p.supported) {
          const heightRatio = 1 - (p.y / ch);

          // Tilt from landing offset
          const targetTilt = p.landingOffset * 0.1;
          p.tiltOffset = lerp(p.tiltOffset, targetTilt, 0.03);
          rotation = p.tiltOffset;

          // Organic sway
          const swayAmount = heightRatio * heightRatio * 0.05;
          swayX =
            Math.sin(frame * 0.012 + p.phase) * swayAmount * p.fontSize +
            Math.sin(frame * 0.007 + p.phase * 1.7) * swayAmount * 0.4 * p.fontSize;
        }

        ctx.save();
        ctx.translate(drawX + p.width / 2 + swayX, drawY + p.height / 2);
        ctx.rotate(rotation);
        ctx.font = `${p.fontSize}px ${FONT_FAMILY}`;
        ctx.fillStyle = p.color;
        ctx.shadowColor = "rgba(184, 168, 130, 0.08)";
        ctx.shadowBlur = 4;
        ctx.fillText(p.word, -p.width / 2, -p.height / 2);
        ctx.restore();
      }

      frameRef.current++;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [spawnParticle]);

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
