"use client";

import { useEffect, useRef } from "react";

// ── Spawn ──
const MAX_PARTICLES = 15;
const SPAWN_INTERVAL_MIN = 1500; // ms
const SPAWN_INTERVAL_MAX = 2500; // ms

// ── Vertical speed (top to bottom) ──
const DURATION_MIN = 20; // seconds
const DURATION_MAX = 28; // seconds

// ── Kosukuma icon ──
const ICON_SPAWN_MIN = 2000; // ms
const ICON_SPAWN_MAX = 5000; // ms
const ICON_SIZES = [20, 26, 32, 38];

// ── Visual ──
const FONT_SIZES = [14, 16, 18, 20, 23, 26];
const FONT_FAMILY =
  '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS PMincho", serif';
const CHAR_SPACING = 1.3; // line-height multiplier for vertical char spacing
// White tones to match kosukuma_white.png
const COLORS = [
  "rgba(255, 255, 255, 0.75)",
  "rgba(255, 255, 255, 0.65)",
  "rgba(255, 255, 255, 0.55)",
  "rgba(250, 248, 245, 0.7)",
  "rgba(255, 255, 255, 0.6)",
  "rgba(245, 243, 240, 0.65)",
  "rgba(255, 255, 255, 0.5)",
  "rgba(250, 248, 245, 0.75)",
];

interface Particle {
  type: "word" | "icon";
  word: string;
  x: number;
  y: number;
  speed: number; // px per frame (60fps)
  colWidth: number; // horizontal width of the vertical text column
  colHeight: number; // total vertical height of stacked characters
  fontSize: number;
  color: string;
  opacity: number;
  iconSize: number;
  iconW: number;
  iconH: number;
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
    fetch("/api/words?sort=popular&limit=100", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const wordList = (data.words || []).map(
          (w: { word: string }) => w.word,
        );
        if (wordList.length > 0) {
          wordsRef.current = wordList;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 視差・モーション低減を希望するユーザーには降ってくる演出を出さない（a11y / 省電力）
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvasの論理サイズ。resize時のみ更新し、以降の描画/座標計算はこれを基準にする
    // （モバイルでキーボード表示中に innerHeight が縮んでも、クリア漏れ＝白い帯が出ないように）
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // 横幅が変わった時だけ再構築する。モバイルで検索ボックスにフォーカス→
    // キーボード表示で「高さだけ」変わるとCanvasが作り直されて降る絵文字/イラストが
    // 崩れるため、高さのみの変化（キーボード）では再構築しない。
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      resize();
    };
    window.addEventListener("resize", handleResize);

    // ── Spawn word particles on interval ──
    let wordTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    const scheduleWord = () => {
      if (disposed) return;
      const delay = rand(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
      wordTimer = setTimeout(() => {
        const words = wordsRef.current;
        // 携帯(幅<768px)は画面が狭く文字が密集して多く見えるため同時表示数を減らす
        const maxParticles = window.innerWidth < 768 ? 7 : MAX_PARTICLES;
        if (words.length > 0 && particlesRef.current.length < maxParticles) {
          const word = words[Math.floor(Math.random() * words.length)];
          const fontSize =
            FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)];
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];

          // Measure the vertical column dimensions
          const charStep = fontSize * CHAR_SPACING;
          const colHeight = charStep * word.length;
          const colWidth = fontSize; // single character width approximation

          const cw = viewW;
          const ch = viewH;
          const duration = rand(DURATION_MIN, DURATION_MAX);
          // speed = total vertical distance / (duration * 60fps)
          const speed = (ch + colHeight + 100) / (duration * 60);

          // Horizontal position: random, keep column on screen
          const margin = colWidth / 2 + 20;
          const xPos = margin + Math.random() * Math.max(cw - margin * 2, 0);

          particlesRef.current.push({
            type: "word",
            word,
            x: xPos,
            y: -colHeight, // start just above the top edge
            speed,
            colWidth,
            colHeight,
            fontSize,
            color,
            // 文字色の透明度(0.5〜0.75)と乗算。PC: 実効 約5.4〜10.4%
            // 携帯(幅<768px)は降ってくるこすくま(薄い輪郭)の見た目の薄さに合わせる。
            // 文字は線が詰まり濃く見えるため数値は低めに: rand(0.03,0.045)=実効 約1.5〜3.4%
            opacity:
              window.innerWidth < 768
                ? rand(0.03, 0.045)
                : rand(0.108, 0.139),
            iconSize: 0,
            iconW: 0,
            iconH: 0,
          });
        }
        scheduleWord();
      }, delay);
    };
    scheduleWord();

    // ── Spawn icon particles on interval ──
    let iconTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleIcon = () => {
      if (disposed) return;
      const delay = rand(ICON_SPAWN_MIN, ICON_SPAWN_MAX);
      iconTimer = setTimeout(() => {
        const img = iconRef.current;
        if (img && img.naturalWidth > 0) {
          const baseSize =
            ICON_SIZES[Math.floor(Math.random() * ICON_SIZES.length)];
          const aspect = img.naturalWidth / img.naturalHeight;
          const iconW = baseSize;
          const iconH = baseSize / aspect;
          const cw = viewW;
          const ch = viewH;
          const duration = rand(DURATION_MIN, DURATION_MAX);
          const speed = (ch + iconH + 100) / (duration * 60);

          particlesRef.current.push({
            type: "icon",
            word: "",
            x: rand(iconW, cw - iconW),
            y: -iconH, // start above the top edge
            speed,
            colWidth: iconW,
            colHeight: iconH,
            fontSize: 0,
            color: "",
            // 画像描画のため色の透明度は掛からず、実効 6〜18%
            opacity: rand(0.06, 0.18),
            iconSize: baseSize,
            iconW,
            iconH,
          });
        }
        scheduleIcon();
      }, delay);
    };
    scheduleIcon();

    // ── Animation loop ──
    const tick = () => {
      const cw = viewW;
      const ch = viewH;
      const particles = particlesRef.current;

      // Canvas全体をクリア（viewHは固定なのでキーボード表示時もクリア漏れしない）
      ctx.clearRect(0, 0, cw, ch);

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.speed; // move down

        // Remove if fully off the bottom edge
        if (p.y > ch + p.colHeight + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === "word") {
          ctx.font = `${p.fontSize}px ${FONT_FAMILY}`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = "rgba(255, 255, 255, 0.08)";
          ctx.shadowBlur = 4;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";

          // Draw each character vertically, stacked top to bottom
          const charStep = p.fontSize * CHAR_SPACING;
          const startY = p.y;
          for (let ci = 0; ci < p.word.length; ci++) {
            ctx.fillText(p.word[ci], p.x, startY + ci * charStep);
          }
        } else if (p.type === "icon" && iconRef.current) {
          ctx.drawImage(
            iconRef.current,
            p.x - p.iconW / 2,
            p.y - p.iconH / 2,
            p.iconW,
            p.iconH,
          );
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
      if (wordTimer) clearTimeout(wordTimer);
      if (iconTimer) clearTimeout(iconTimer);
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
