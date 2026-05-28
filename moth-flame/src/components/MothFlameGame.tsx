"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ───────────────────────── 1/f Noise ───────────────────────── */
class PN {
  f: number[] = [];
  a: number[] = [];
  p: number[] = [];
  nl: number[];
  constructor(hz: number) {
    let t = 0;
    for (let i = 0; i < 6; i++) {
      const fr = hz * 0.25 * Math.pow(2, i);
      const am = 1 / Math.pow(2, i * 0.7);
      this.f.push(fr);
      this.a.push(am);
      this.p.push(Math.random() * 6.28);
      t += am;
    }
    for (let i = 0; i < 6; i++) this.a[i] /= t;
    this.nl = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
  }
  s(t: number) {
    let v = 0;
    for (let i = 0; i < 6; i++)
      v += Math.sin(t * this.f[i] * 6.28 + this.p[i]) * this.a[i];
    v += this.nl[Math.abs(Math.floor(t * 17.3)) % 256] * 0.08;
    return v;
  }
}

/* ───────────────────────── Constants ───────────────────────── */
const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);
const PX = isMobile ? 3 : 5;
const COLS = ["#fff7c2", "#ffb454", "#ff8a3d", "#ff5874", "#7d3ac1"];
const RCOLS = [
  "#ff5874",
  "#ffb454",
  "#fff7c2",
  "#9efbb6",
  "#7ecadf",
  "#7d3ac1",
  "#ff5874",
];

interface Pt {
  x: number;
  y: number;
  t: number;
}
interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  sz: number;
  col: string;
}
interface AIMoth {
  a: number;
  r: number;
  sp: number;
  ph: number;
}
interface DeathBit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  col: string;
}
interface ClosedCircle {
  pts: Pt[];
  cx: number;
  cy: number;
  r: number;
  score: number;
  born: number;
}
interface RainbowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  col: string;
}

/* ───────────────────────── Fire + Water ASMR Sound ───────────────────────── */
function initFireSound() {
  const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const sr = ac.sampleRate;
  const master = ac.createGain();
  master.gain.value = 0.30;
  master.connect(ac.destination);

  // ──── Soft pachi-pachi only (no clicking) ────
  function pachi() {
    const now = ac.currentTime;
    const dur = 0.015 + Math.random() * 0.03; // 15-45ms — longer = softer pop
    const samples = Math.floor(sr * dur);

    const buf = ac.createBuffer(1, samples, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      const env = Math.exp((-i / samples) * 5); // gentle decay
      d[i] = (Math.random() * 2 - 1) * env;
    }

    const src = ac.createBufferSource();
    src.buffer = buf;

    // Warm cutoff — audible on phone speakers
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500 + Math.random() * 400; // 500-900Hz
    lp.Q.value = 0.3;

    const vol = ac.createGain();
    const v = 0.08 + Math.random() * 0.15;
    vol.gain.setValueAtTime(v, now);
    vol.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.05);

    src.connect(lp).connect(vol).connect(master);
    src.start(now);
    src.stop(now + dur + 0.06);

    // Irregular timing
    let next: number;
    if (Math.random() < 0.15) {
      next = 50 + Math.random() * 100; // quick double-pop
    } else if (Math.random() < 0.35) {
      next = 1500 + Math.random() * 3000; // long silence
    } else {
      next = 400 + Math.random() * 1200; // normal
    }
    setTimeout(pachi, next);
  }
  setTimeout(pachi, 600);
  setTimeout(pachi, 1800);

  return ac;
}

export default function MothFlameGame() {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const handleStart = useCallback(() => {
    setGameStarted(true);
    if (!audioRef.current) {
      audioRef.current = initFireSound();
    }
    // Resume AudioContext if suspended (mobile browsers require user gesture)
    if (audioRef.current && audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const mc = mainRef.current!;
    const oc = overlayRef.current!;
    const ctx = mc.getContext("2d")!;
    const otx = oc.getContext("2d")!;

    /* ── Noise instances ── */
    const NB = new PN(0.12);
    const NF = new PN(0.7);
    const NFa = new PN(2.5);
    const NW = new PN(0.2);
    const NGust = new PN(0.15);
    const NWobble = new PN(0.4);
    const NJitter = new PN(3.2);

    function hash(x: number, y: number) {
      let h = ((x * 374761393 + y * 668265263 + T * 1000) & 0xffffffff) >>> 0;
      h = (((h ^ (h >> 13)) >>> 0) * 1274126177) >>> 0;
      return ((h ^ (h >> 16)) & 0xff) / 255;
    }

    /* ── Sizing ── */
    let W = 0,
      H = 0,
      gw = 0,
      gh = 0;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      gw = Math.floor(W / PX);
      gh = Math.floor(H / PX);
      mc.width = gw;
      mc.height = gh;
      oc.width = W;
      oc.height = H;
      ctx.imageSmoothingEnabled = false;
    }
    resize();
    window.addEventListener("resize", resize);

    /* ── State ── */
    let T = 0,
      last = 0;
    let mx = 0,
      my = 0,
      mouseIn = false,
      isDown = false;
    let trail: Pt[] = [],
      lastClosed: ClosedCircle | null = null;
    let dead = false,
      deadAt = 0,
      deadReason = "";
    let bestScore = 0;
    let fireSCX = 0,
      fireSCY = 0,
      fireBaseR = 0;
    let liveScoreVal = 0;
    let liveDistInfo = { accuracy: 0, shape: 0 };
    let deathMX = 0,
      deathMY = 0;
    const deathBits: DeathBit[] = [];
    const myName =
      "MOTH-" +
      Math.random()
        .toString(36)
        .substr(2, 4)
        .toUpperCase();

    /* ── Easter egg state ── */
    let easterEggActive = false;
    let easterEggAt = 0;
    let easterEggMsg1 = "";
    let easterEggMsg2 = "";
    const rainbowParticles: RainbowParticle[] = [];

    /* ── Stars ── */
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 800,
      b: Math.random() * 0.5 + 0.2,
      sp: Math.random() * 0.006 + 0.002,
      ph: Math.random() * 6.28,
    }));

    /* ── Embers ── */
    const embers: Ember[] = [];
    function spawnEmber(
      cx: number,
      cy: number,
      baseR: number,
      burst: boolean
    ) {
      embers.push({
        x: cx + (Math.random() - 0.5) * baseR * 1.2,
        y: cy + baseR * 0.2,
        vx: (Math.random() - 0.5) * (burst ? 60 : 30),
        vy: -(50 + Math.random() * (burst ? 70 : 60)),
        life: 1.5 + Math.random() * 1.6,
        age: 0,
        sz: Math.random() > 0.5 ? 2 : 1,
        col: ["#ffb454", "#ff5874", "#fff7c2"][Math.floor(Math.random() * 3)],
      });
    }
    function spawnEmberTop(
      cx: number,
      topY: number,
      baseR: number
    ) {
      embers.push({
        x: cx + (Math.random() - 0.5) * baseR * 0.6,
        y: topY - baseR * 0.3,
        vx: (Math.random() - 0.5) * 20,
        vy: -(30 + Math.random() * 40),
        life: 1.0 + Math.random() * 1.2,
        age: 0,
        sz: 1,
        col: ["#ffb454", "#fff7c2"][Math.floor(Math.random() * 2)],
      });
    }

    /* ── AI Moths ── */
    const aiMoths: AIMoth[] = Array.from({ length: 5 }, () => ({
      a: Math.random() * 6.28,
      r: 80 + Math.random() * 100,
      sp: 0.5 + Math.random() * 0.6,
      ph: Math.random() * 6.28,
    }));

    /* ── Helpers ── */
    function getIdealR() {
      return fireBaseR * 3.5 * PX;
    }

    /* ── Star detection ── */
    function detectStar(pts: Pt[]): boolean {
      if (pts.length < 20) return false;
      let sharpTurns = 0;
      const step = Math.max(1, Math.floor(pts.length / 40));
      for (let i = step * 2; i < pts.length; i += step) {
        const ax = pts[i - step].x - pts[i - step * 2].x;
        const ay = pts[i - step].y - pts[i - step * 2].y;
        const bx2 = pts[i].x - pts[i - step].x;
        const by2 = pts[i].y - pts[i - step].y;
        const dot = ax * bx2 + ay * by2;
        const cross = ax * by2 - ay * bx2;
        const angle = Math.abs(Math.atan2(cross, dot));
        if (angle > 1.8) sharpTurns++;
      }
      return sharpTurns >= 4 && sharpTurns <= 7;
    }

    function triggerStarEasterEgg() {
      easterEggActive = true;
      easterEggAt = T;
      easterEggMsg1 = "\u2605 SECRET \u2605";
      easterEggMsg2 = "You found the hidden star!";
      // Spawn 60 rainbow particles from center
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * 6.28;
        const spd = 80 + Math.random() * 200;
        rainbowParticles.push({
          x: W / 2,
          y: H / 2,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 40,
          life: 2.0 + Math.random() * 1.5,
          age: 0,
          col: RCOLS[Math.floor(Math.random() * RCOLS.length)],
        });
      }
    }

    /* ── Scoring ── */
    function calcScore(pts: Pt[]) {
      if (pts.length < 8) return 0;
      const idealR = getIdealR();
      if (idealR < 30) return 0;

      let sx2 = 0,
        sy2 = 0;
      pts.forEach((p) => {
        sx2 += p.x;
        sy2 += p.y;
      });
      const centX = sx2 / pts.length,
        centY = sy2 / pts.length;
      const centDist = Math.sqrt(
        (centX - fireSCX) ** 2 + (centY - fireSCY) ** 2
      );
      if (centDist > idealR * 0.6) {
        liveDistInfo = { accuracy: 0, shape: 0 };
        return 0;
      }

      const fireDists = pts.map((p) =>
        Math.sqrt((p.x - fireSCX) ** 2 + (p.y - fireSCY) ** 2)
      );
      const avgFireDist =
        fireDists.reduce((a, b) => a + b, 0) / fireDists.length;
      const distOffset = Math.abs(avgFireDist - idealR) / idealR;
      const distAccuracy = Math.max(0, 1 - distOffset * 2);
      const distDev = Math.sqrt(
        fireDists.reduce((a, d) => a + (d - avgFireDist) ** 2, 0) /
          fireDists.length
      );
      const distConsistency = Math.max(0, 1 - (distDev / idealR) * 3);
      const distanceScore = distAccuracy * 0.65 + distConsistency * 0.35;

      let sx = 0,
        sy = 0;
      pts.forEach((p) => {
        sx += p.x;
        sy += p.y;
      });
      const cxx = sx / pts.length,
        cyy = sy / pts.length;
      const ownDists = pts.map((p) =>
        Math.sqrt((p.x - cxx) ** 2 + (p.y - cyy) ** 2)
      );
      const ownR = ownDists.reduce((a, b) => a + b, 0) / ownDists.length;
      if (ownR < 15) return 0;

      const ownDev = Math.sqrt(
        ownDists.reduce((a, d) => a + (d - ownR) ** 2, 0) / ownDists.length
      );
      const roundness = Math.max(0, 1 - ownDev / ownR);

      const p0 = pts[0],
        pN = pts[pts.length - 1];
      const closeDist = Math.sqrt((p0.x - pN.x) ** 2 + (p0.y - pN.y) ** 2);
      const closeFit = Math.max(0, 1 - closeDist / (ownR * 1.5));

      let totalAng = 0;
      for (let i = 1; i < pts.length; i++) {
        const a1 = Math.atan2(pts[i - 1].y - cyy, pts[i - 1].x - cxx);
        const a2 = Math.atan2(pts[i].y - cyy, pts[i].x - cxx);
        let da = a2 - a1;
        if (da > Math.PI) da -= 6.28;
        if (da < -Math.PI) da += 6.28;
        totalAng += da;
      }
      const sweep = Math.min(1, Math.abs(totalAng) / 6.28);
      const shapeScore = roundness * 0.5 + closeFit * 0.25 + sweep * 0.25;

      const raw = distanceScore * 0.5 + shapeScore * 0.5;
      liveDistInfo = {
        accuracy: Math.round(distAccuracy * 100),
        shape: Math.round(shapeScore * 100),
      };
      return Math.min(100, Math.round(100 * Math.pow(Math.max(0, raw), 1.3)));
    }

    function endTrail() {
      if (trail.length < 8 || dead) return;

      // Star easter egg check (before normal scoring)
      if (detectStar(trail)) {
        triggerStarEasterEgg();
        trail = [];
        liveScoreVal = 0;
        return;
      }

      const score = calcScore(trail);
      if (score < 1) {
        trail = [];
        return;
      }
      let sx = 0,
        sy = 0;
      trail.forEach((p) => {
        sx += p.x;
        sy += p.y;
      });
      const cxx = sx / trail.length,
        cyy = sy / trail.length;
      const dists = trail.map((p) =>
        Math.sqrt((p.x - cxx) ** 2 + (p.y - cyy) ** 2)
      );
      const r = dists.reduce((a, b) => a + b, 0) / dists.length;
      lastClosed = { pts: [...trail], cx: cxx, cy: cyy, r, score, born: T };
      bestScore = Math.max(bestScore, score);
      trail = [];
      liveScoreVal = 0;
    }

    /* ── Event handlers ── */
    function onPointerMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      mouseIn = true;
    }
    function onPointerDown(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      isDown = true;
      trail = [];
      lastClosed = null;
      if (dead && T - deadAt > 2.2) dead = false;
    }
    function onPointerUp() {
      isDown = false;
      endTrail();
    }
    function onPointerLeave() {
      mouseIn = false;
      isDown = false;
    }
    function onVisibilityChange() {
      if (document.hidden) {
        isDown = false;
        trail = [];
      }
    }
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    /* ══════════════════════ Drawing ══════════════════════ */

    function drawBG() {
      const cy = Math.floor(gh * 0.62);
      for (const s of stars) {
        const sx = Math.floor(s.x % gw),
          sy = Math.floor(s.y % (cy - 2));
        const b = s.b * (0.6 + Math.sin(T * s.sp * 6.28 + s.ph) * 0.4);
        if (b > 0.15) {
          ctx.globalAlpha = b;
          ctx.fillStyle = "#c8c0d8";
          ctx.fillRect(sx, sy, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
      const gc = ["#141020", "#181428", "#1c1830", "#181428", "#141020"];
      for (let y = cy; y < gh; y++) {
        const f = (y - cy) / (gh - cy);
        ctx.fillStyle = gc[Math.min(gc.length - 1, Math.floor(f * gc.length))];
        ctx.fillRect(0, y, gw, 1);
      }
      for (let x = 0; x < gw; x++) {
        if ((x + Math.floor(T * 1.5)) % 3 === 0) {
          ctx.fillStyle = "#141020";
          ctx.fillRect(x, cy - 1, 1, 1);
        }
        if ((x + Math.floor(T * 2) + 1) % 4 === 0) {
          ctx.fillStyle = "#1c1830";
          ctx.fillRect(x, cy, 1, 1);
        }
      }
    }

    function drawFire() {
      const fire_size = 0.55;
      const cx = Math.round(gw / 2);
      const cy = Math.floor(gh * 0.62);
      const baseR = Math.min(gw, gh) * 0.13 * fire_size;
      const SX = cx,
        SY = Math.floor(cy + baseR * 0.4);
      const breath = NB.s(T) * 0.04,
        flick = NF.s(T) * 0.05;
      const gust = NGust.s(T) * 1.8;
      const gustActive = Math.abs(gust) > 0.8;
      const speedMod = 0.6 + NWobble.s(T * 0.7) * 0.15;
      const densityMod = 1.4 + NWobble.s(T * 0.5 + 3) * 0.3;
      const ampMod = 0.55 + NF.s(T * 1.3) * 0.12;

      const heightSurge =
        NWobble.s(T * 0.8) * baseR * 0.6
        + NWobble.s(T * 1.5 + 3) * baseR * 0.35
        + NJitter.s(T * 2.5) * baseR * 0.15;
      const burstChance = NF.s(T * 0.3);
      const burst = burstChance > 0.7 ? (burstChance - 0.7) * baseR * 2.5 : 0;
      const fireH = Math.floor(baseR * 2.4 * 1.55 * (1 + breath * 0.15) + heightSurge + burst);
      const fireW = baseR * 1.6 * (1 + NW.s(T) * 0.06);
      const top = SY - fireH,
        bot = SY;

      for (let py = top; py <= bot; py++) {
        const t01 = Math.max(0, Math.min(1, (SY - py) / fireH));
        let hw = fireW * Math.pow(1 - t01, 0.6);
        if (hw < 0.5) continue;
        hw *= 1 + (hash(0, py) - 0.5) * 0.12;
        let swayH =
          (Math.sin(T * 0.4 + py * 0.012) +
            Math.sin(T * 0.27 + py * 0.018 + 1.7) * 0.6) *
          0.55 *
          PX *
          1.2 *
          t01;
        if (gustActive) swayH += gust * t01 * PX * 0.8;
        swayH += NJitter.s(T + py * 0.03) * 0.6 * t01;

        const left = Math.floor(SX - hw + swayH),
          right = Math.ceil(SX + hw + swayH);
        for (let px = left; px <= right; px++) {
          if (px < 0 || px >= gw) continue;
          const dx = px - SX - swayH;
          if (Math.abs(dx) > hw) continue;
          const edge = 1 - Math.abs(dx) / hw;
          const base = edge * (1 - t01 * 0.55);
          const xN = dx / Math.max(1, hw);
          const w1 = Math.sin(
            t01 * 6.28 * densityMod + T * speedMod * 1.2 + xN * 0.8
          );
          const w2 = Math.sin(
            t01 * 6.28 * densityMod * 1.7 +
              T * speedMod * 0.7 -
              xN * 1.4 +
              1.3
          );
          const w3 = Math.sin(
            t01 * 6.28 * densityMod * 0.6 +
              T * speedMod * 0.45 +
              xN * 0.4 +
              2.1
          );
          const wave = (w1 * 0.5 + w2 * 0.32 + w3 * 0.18) * ampMod * 0.32;
          const sxN = px * 0.018 + Math.cos(T * 0.25) * 0.5,
            syN = py * 0.022 - T * 0.45;
          const drift =
            (Math.sin(sxN) * Math.cos(syN) +
              Math.sin(sxN * 1.7 - syN * 1.3) * 0.5) *
            0.08;
          const fastRow = NFa.s(T + py * 0.004) * 0.04;
          const pxNoise = (hash(px, py) - 0.5) * 0.18;
          let intensity = base + wave + drift + fastRow * 0.18 + pxNoise;
          if (t01 > 0.6)
            intensity += wave * 0.6 + (flick * 0.3 * (t01 - 0.6)) / 0.4;
          if (Math.random() < 0.002 && t01 > 0.2) intensity -= 0.8;
          if (Math.random() < 0.0005) intensity += 0.5;
          intensity = Math.max(0, Math.min(1.3, intensity));
          if (intensity < 0.02) continue;
          let col: string;
          if (intensity > 0.85) col = COLS[0];
          else if (intensity > 0.62) col = COLS[1];
          else if (intensity > 0.4) col = COLS[2];
          else if (intensity > 0.2) col = COLS[3];
          else col = COLS[4];
          ctx.globalAlpha = Math.min(1, intensity * 0.9 + 0.15);
          ctx.fillStyle = col;
          ctx.fillRect(px, py, 1, 1);
        }
      }
      ctx.globalAlpha = 1;

      // Logs
      const lw = Math.floor(baseR * 3),
        lx = cx;
      const ly = SY;
      for (let y = 0; y < 2; y++)
        for (let x = -Math.floor(lw / 2); x < Math.floor(lw / 2); x++) {
          ctx.fillStyle = "#241408";
          ctx.fillRect(lx + x + Math.floor(y * 0.5), ly + y, 1, 1);
        }
      for (let y = 0; y < 2; y++)
        for (
          let x = -Math.floor(lw * 0.4);
          x < Math.floor(lw * 0.4);
          x++
        ) {
          ctx.fillStyle = "#3a2010";
          ctx.fillRect(lx + x - Math.floor(y * 0.3), ly - 2 + y, 1, 1);
        }
      for (
        let x = -Math.floor(lw * 0.35);
        x < Math.floor(lw * 0.35);
        x++
      ) {
        ctx.fillStyle = "#5a3018";
        ctx.fillRect(lx + x, ly - 3, 1, 1);
      }
      for (let i = 0; i < 5; i++) {
        const gx = lx - 3 + Math.floor(Math.sin(T * 1.3 + i) * 2) + i * 1.5;
        ctx.globalAlpha = 0.5 + Math.sin(T * 2 + i) * 0.3;
        ctx.fillStyle = "#ff8a3d";
        ctx.fillRect(Math.floor(gx), ly - 4, 1, 1);
      }
      ctx.globalAlpha = 1;

      // Ground glow (overlay)
      otx.save();
      const gcx = cx * PX + PX / 2,
        gcy = (cy + baseR * 0.3) * PX;
      const gr = baseR * 5 * PX;
      const grad = otx.createRadialGradient(gcx, gcy, 0, gcx, gcy, gr);
      grad.addColorStop(0, "rgba(255,180,84,0.32)");
      grad.addColorStop(0.3, "rgba(255,120,60,0.14)");
      grad.addColorStop(0.65, "rgba(125,58,193,0.05)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      otx.fillStyle = grad;
      otx.fillRect(0, H * 0.55, W, H * 0.45);
      otx.restore();

      // Embers — sparse and irregular
      if (Math.random() < 0.15) spawnEmber(cx, cy, baseR, false);
      if (Math.random() < 0.05) spawnEmberTop(cx, top, baseR);

      // Fire center for scoring
      fireSCX = cx * PX + PX / 2;
      const fireVisCenter = (SY - fireH * 0.45) * PX;
      fireSCY = fireVisCenter;
      fireBaseR = baseR;

      // Center hint
      otx.save();
      const pulse = 0.025 + Math.sin(T * 0.6) * 0.012;
      const grd = otx.createRadialGradient(
        fireSCX,
        fireSCY,
        0,
        fireSCX,
        fireSCY,
        10
      );
      grd.addColorStop(0, `rgba(255,247,194,${pulse})`);
      grd.addColorStop(1, "rgba(255,247,194,0)");
      otx.fillStyle = grd;
      otx.fillRect(fireSCX - 10, fireSCY - 10, 20, 20);
      otx.restore();

      return { cx, cy, baseR, SY };
    }

    function drawEmbers(dt: number) {
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.age += dt;
        e.vy += 22 * dt;
        e.x += e.vx * dt + Math.sin(T * 1.5 + e.y * 0.02) * 0.4;
        e.y += e.vy * dt;
        if (1 - e.age / e.life <= 0) {
          embers.splice(i, 1);
          continue;
        }
        if (Math.sin(T * 20 + e.x * 0.1) < -0.75) continue;
        ctx.globalAlpha = Math.min(1, (1 - e.age / e.life) * 1.5);
        ctx.fillStyle = e.col;
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    function drawAIMoths() {
      const cx = Math.round(gw / 2),
        cy = Math.floor(gh * 0.62);
      const flap = Math.floor(T * 10) % 2;
      for (const m of aiMoths) {
        m.a += m.sp * 0.016;
        const px = Math.floor(
          cx +
            (Math.cos(m.a) * m.r) / PX +
            (Math.sin(T * 0.7 + m.ph) * 4) / PX
        );
        const py = Math.floor(
          cy +
            (Math.sin(m.a) * m.r * 0.75) / PX +
            (Math.cos(T * 0.9 + m.ph) * 4) / PX
        );
        ctx.fillStyle = "#7d3ac1";
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = "#fff7c2";
        ctx.globalAlpha = 0.45;
        if (flap === 0) {
          ctx.fillRect(px - 1, py, 1, 1);
          ctx.fillRect(px + 1, py, 1, 1);
        } else {
          ctx.fillRect(px - 1, py - 1, 1, 1);
          ctx.fillRect(px + 1, py - 1, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    }

    /* ── Overlay drawings ── */

    function drawMoth() {
      if (dead || !mouseIn) return;
      const s = 4,
        bx = Math.floor(mx / s) * s,
        by = Math.floor(my / s) * s;
      const flap = Math.floor(T * 10) % 2;

      const d = Math.sqrt((mx - fireSCX) ** 2 + (my - fireSCY) ** 2);
      const idealR = getIdealR();
      const ratio = idealR > 0 ? d / idealR : 1;
      const proximity = Math.max(0, 1 - Math.abs(ratio - 1) * 2.5);

      let bodyCol: string,
        headCol: string,
        wingCol: string,
        glowCol: string,
        glowR: number;
      if (proximity > 0.6) {
        bodyCol = "#9efbb6";
        headCol = "#fff7c2";
        wingCol = "#fff7c2";
        glowCol = "rgba(158,251,182,";
        glowR = 20 + proximity * 15;
      } else if (ratio < 0.7) {
        const pulse2 = 0.7 + Math.sin(T * 8) * 0.3;
        bodyCol = "#ff5874";
        headCol = "#fff7c2";
        wingCol = `rgba(255,88,116,${pulse2})`;
        glowCol = "rgba(255,88,116,";
        glowR = 12 + Math.sin(T * 6) * 4;
      } else if (ratio > 1.5) {
        bodyCol = "#7d3ac1";
        headCol = "#7d3ac1";
        wingCol = "rgba(125,58,193,0.6)";
        glowCol = "rgba(125,58,193,";
        glowR = 6;
      } else {
        bodyCol = "#ffb454";
        headCol = "#ff5874";
        wingCol = "#fff7c2";
        glowCol = "rgba(255,180,84,";
        glowR = 10;
      }

      otx.save();
      const grd = otx.createRadialGradient(bx, by, 0, bx, by, glowR);
      grd.addColorStop(0, glowCol + (proximity * 0.4 + 0.1) + ")");
      grd.addColorStop(1, glowCol + "0)");
      otx.fillStyle = grd;
      otx.fillRect(bx - glowR, by - glowR, glowR * 2, glowR * 2);

      otx.fillStyle = headCol;
      otx.fillRect(bx, by - s, s, s);
      otx.fillStyle = bodyCol;
      otx.fillRect(bx, by, s, s);
      otx.fillRect(bx, by + s, s, s);
      otx.fillStyle = wingCol;
      if (flap === 0) {
        otx.fillRect(bx - s * 2, by, s, s);
        otx.fillRect(bx - s, by, s, s);
        otx.fillRect(bx + s, by, s, s);
        otx.fillRect(bx + s * 2, by, s, s);
        otx.fillRect(bx - s, by + s, s, s);
        otx.fillRect(bx + s, by + s, s, s);
      } else {
        otx.fillRect(bx - s, by - s, s, s);
        otx.fillRect(bx + s, by - s, s, s);
        otx.fillRect(bx - s * 2, by - s, s, s);
        otx.fillRect(bx + s * 2, by - s, s, s);
        otx.fillRect(bx - s, by, s, s);
        otx.fillRect(bx + s, by, s, s);
      }
      otx.restore();
    }

    function drawTrail() {
      if (trail.length < 2) return;

      const idealR = getIdealR();
      if (idealR > 30 && fireSCX > 0) {
        let distTotal = 0;
        for (const p of trail) {
          const d = Math.sqrt(
            (p.x - fireSCX) ** 2 + (p.y - fireSCY) ** 2
          );
          const off = Math.abs(d - idealR) / idealR;
          distTotal += Math.max(0, 1 - off * 2.5);
        }
        const distScore = distTotal / trail.length;

        let curveScore = 1;
        if (trail.length >= 4) {
          const angleDiffs: number[] = [];
          for (let i = 2; i < trail.length; i++) {
            const ax = trail[i - 1].x - trail[i - 2].x,
              ay = trail[i - 1].y - trail[i - 2].y;
            const bx2 = trail[i].x - trail[i - 1].x,
              by2 = trail[i].y - trail[i - 1].y;
            const a1 = Math.atan2(ay, ax),
              a2 = Math.atan2(by2, bx2);
            let da = a2 - a1;
            if (da > Math.PI) da -= 6.28;
            if (da < -Math.PI) da += 6.28;
            angleDiffs.push(da);
          }
          if (angleDiffs.length > 2) {
            const avgDA =
              angleDiffs.reduce((a, b) => a + b, 0) / angleDiffs.length;
            const variance =
              angleDiffs.reduce((a, d) => a + (d - avgDA) ** 2, 0) /
              angleDiffs.length;
            curveScore = Math.max(0, 1 - Math.sqrt(variance) * 8);
          }
        }

        let sweep = 0;
        if (trail.length >= 3) {
          let sx2 = 0,
            sy2 = 0;
          trail.forEach((p) => {
            sx2 += p.x;
            sy2 += p.y;
          });
          const centX = sx2 / trail.length,
            centY = sy2 / trail.length;
          let totalAng = 0;
          for (let i = 1; i < trail.length; i++) {
            const a1 = Math.atan2(
              trail[i - 1].y - centY,
              trail[i - 1].x - centX
            );
            const a2 = Math.atan2(trail[i].y - centY, trail[i].x - centX);
            let da = a2 - a1;
            if (da > Math.PI) da -= 6.28;
            if (da < -Math.PI) da += 6.28;
            totalAng += da;
          }
          sweep = Math.min(1, Math.abs(totalAng) / 6.28);
        }

        const sweepWeight = Math.min(0.2, trail.length / 200);
        const remainWeight = 1 - sweepWeight;
        const distW = remainWeight * 0.56;
        const curveW = remainWeight * 0.44;
        const raw = distScore * distW + curveScore * curveW + sweep * sweepWeight;
        liveScoreVal = Math.max(
          1,
          Math.min(100, Math.round(100 * Math.pow(raw, 1.15)))
        );
        liveDistInfo = {
          accuracy: Math.round(distScore * 100),
          shape: Math.round(curveScore * 100),
        };
      }

      const sc = liveScoreVal;
      otx.save();
      otx.lineCap = "round";
      otx.lineJoin = "round";

      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1],
          p1 = trail[i];
        const d = Math.sqrt(
          (p1.x - fireSCX) ** 2 + (p1.y - fireSCY) ** 2
        );
        const distRatio = idealR > 0 ? d / idealR : 1;
        const proximity = Math.max(0, 1 - Math.abs(distRatio - 1) * 2.5);
        const alpha = 0.3 + (i / trail.length) * 0.7;

        otx.globalAlpha = alpha * (0.2 + proximity * 0.3);
        otx.lineWidth = 6 + proximity * 8;
        if (sc >= 90) {
          otx.strokeStyle = RCOLS[(i + Math.floor(T * 12)) % RCOLS.length];
        } else if (proximity > 0.6) {
          otx.strokeStyle = "rgba(158,251,182,0.4)";
        } else if (distRatio < 0.6) {
          otx.strokeStyle = "rgba(255,88,116,0.3)";
        } else {
          otx.strokeStyle = "rgba(255,247,194,0.2)";
        }
        otx.beginPath();
        otx.moveTo(p0.x, p0.y);
        otx.lineTo(p1.x, p1.y);
        otx.stroke();

        otx.globalAlpha = alpha;
        otx.lineWidth = sc >= 90 ? 4 : 3;
        if (sc >= 90) {
          otx.strokeStyle = RCOLS[(i + Math.floor(T * 12)) % RCOLS.length];
        } else if (proximity > 0.6) {
          otx.strokeStyle = "#9efbb6";
        } else if (proximity > 0.3) {
          otx.strokeStyle = "#ffb454";
        } else if (distRatio < 0.6) {
          otx.strokeStyle = "#ff5874";
        } else {
          otx.strokeStyle = "#fff7c2";
        }
        otx.beginPath();
        otx.moveTo(p0.x, p0.y);
        otx.lineTo(p1.x, p1.y);
        otx.stroke();
      }

      // Live score — top center of screen
      if (trail.length > 1) {
        const tx = W / 2;
        const ty = 36;
        let scoreCol = "#6272a4";
        if (sc >= 90) scoreCol = RCOLS[Math.floor(T * 10) % RCOLS.length];
        else if (sc >= 70) scoreCol = "#9efbb6";
        else if (sc >= 50) scoreCol = "#ffb454";
        else if (sc >= 30) scoreCol = "#ff8a3d";

        otx.globalAlpha = 1;
        otx.font = 'bold 22px "VT323",monospace';
        otx.textAlign = "center";
        otx.fillStyle = "#0e0d1a";
        otx.fillText(sc + "%", tx + 1, ty + 1);
        otx.fillStyle = scoreCol;
        otx.fillText(sc + "%", tx, ty);

        otx.font = '11px "VT323",monospace';
        otx.globalAlpha = 0.7;
        const dCol =
          liveDistInfo.accuracy >= 60
            ? "#9efbb6"
            : liveDistInfo.accuracy >= 30
            ? "#ffb454"
            : "#ff5874";
        const sCol =
          liveDistInfo.shape >= 60
            ? "#9efbb6"
            : liveDistInfo.shape >= 30
            ? "#ffb454"
            : "#ff5874";
        otx.fillStyle = dCol;
        otx.fillText("DIST:" + liveDistInfo.accuracy + "  SHAPE:" + liveDistInfo.shape, tx, ty + 14);

        otx.globalAlpha = 1;
        if (sc >= 90) {
          otx.font = '11px "VT323",monospace';
          otx.fillStyle = "#9efbb6";
          otx.fillText("\u2605 PERFECT! \u2605", tx, ty + 28);
        } else if (sc >= 70) {
          otx.font = '11px "VT323",monospace';
          otx.fillStyle = "#9efbb6";
          otx.fillText("GREAT", tx, ty + 28);
        }
      }

      // Distance dot at cursor
      if (isDown && trail.length > 2) {
        const curD = Math.sqrt(
          (mx - fireSCX) ** 2 + (my - fireSCY) ** 2
        );
        const ratio = idealR > 0 ? curD / idealR : 1;
        const prox = Math.max(0, 1 - Math.abs(ratio - 1) * 2.5);
        otx.globalAlpha = 0.6;
        otx.fillStyle =
          prox > 0.6
            ? "#9efbb6"
            : prox > 0.3
            ? "#ffb454"
            : ratio < 0.7
            ? "#ff5874"
            : "#7d3ac1";
        otx.beginPath();
        otx.arc(mx, my, 3 + prox * 3, 0, 6.28);
        otx.fill();
        otx.globalAlpha = 1;
      }

      otx.restore();
    }

    function drawClosed() {
      if (!lastClosed) return;
      const age = T - lastClosed.born;
      if (age > 2.2) {
        lastClosed = null;
        return;
      }
      const pts = lastClosed.pts;
      if (pts.length < 2) return;
      const fadeA = age > 1.8 ? 1 - (age - 1.8) / 0.4 : 1;
      otx.save();
      otx.lineCap = "round";
      otx.lineJoin = "round";
      otx.globalAlpha = 0.35 * fadeA;
      otx.strokeStyle = RCOLS[Math.floor(T * 10) % RCOLS.length];
      otx.lineWidth = 14;
      otx.beginPath();
      otx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) otx.lineTo(pts[i].x, pts[i].y);
      otx.closePath();
      otx.stroke();
      otx.globalAlpha = fadeA;
      otx.lineWidth = 4;
      for (let i = 1; i < pts.length; i++) {
        otx.strokeStyle = RCOLS[(i + Math.floor(T * 12)) % RCOLS.length];
        otx.beginPath();
        otx.moveTo(pts[i - 1].x, pts[i - 1].y);
        otx.lineTo(pts[i].x, pts[i].y);
        otx.stroke();
      }
      if (age < 1.2) {
        const fl = Math.floor(T * 8) % 2;
        otx.font = '20px "DotGothic16",monospace';
        otx.textAlign = "center";
        otx.textBaseline = "middle";
        otx.fillStyle = fl ? "#fff7c2" : "#0e0d1a";
        otx.fillRect(W / 2 - 160, H / 2 - 18, 320, 36);
        otx.fillStyle = fl ? "#0e0d1a" : "#fff7c2";
        const lb =
          lastClosed.score >= 90
            ? "FANTASTIC!"
            : lastClosed.score >= 70
            ? "GREAT!"
            : "NICE";
        otx.fillText(
          `\u2605 ${lastClosed.score} PT  ${lb} \u2605`,
          W / 2,
          H / 2
        );
      }
      otx.restore();
    }

    function checkDeath(fd: { cx: number; cy: number; baseR: number; SY: number }) {
      if (dead || !mouseIn) return;
      const dx = mx - fireSCX,
        dy = my - fireSCY;
      const d = Math.sqrt(dx * dx + dy * dy);
      const innerDeath = fd.baseR * 1.8 * PX;
      const outerDeath = fd.baseR * 6.5 * PX;
      if (d < innerDeath) {
        dead = true;
        deadAt = T;
        deadReason = "BURN";
        trail = [];
        deathMX = mx;
        deathMY = my;
        for (let i = 0; i < 28; i++)
          spawnEmber(fd.cx, fd.cy, fd.baseR, true);
        for (let i = 0; i < 15; i++) {
          const a = Math.random() * 6.28,
            spd = Math.random() * 120 + 40;
          deathBits.push({
            x: mx,
            y: my,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd - 60,
            life: 1,
            decay: 0.012 + Math.random() * 0.015,
            col: ["#9efbb6", "#ff5874", "#fff7c2"][
              Math.floor(Math.random() * 3)
            ],
          });
        }
      } else if (d > outerDeath) {
        dead = true;
        deadAt = T;
        deadReason = "LOST";
        trail = [];
        deathMX = mx;
        deathMY = my;
        for (let i = 0; i < 10; i++) {
          const a = Math.random() * 6.28,
            spd = Math.random() * 30 + 10;
          deathBits.push({
            x: mx,
            y: my,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 1,
            decay: 0.008 + Math.random() * 0.01,
            col: ["#7d3ac1", "#44475a", "#6272a4"][
              Math.floor(Math.random() * 3)
            ],
          });
        }
      }
    }

    function drawGameOver() {
      const age = T - deadAt;
      if (deadReason === "BURN") {
        if (age < 0.15) {
          otx.globalAlpha = 0.6 * (1 - age / 0.15);
          otx.fillStyle = "#fff7c2";
          otx.fillRect(0, 0, W, H);
        } else if (age < 0.5) {
          otx.globalAlpha = 0.2 * (1 - (age - 0.15) / 0.35);
          otx.fillStyle = "#ff5874";
          otx.fillRect(0, 0, W, H);
        }
        if (age < 0.3) {
          const shk = Math.floor((1 - age / 0.3) * 6);
          oc.style.transform = `translate(${(Math.random() - 0.5) * shk}px,${
            (Math.random() - 0.5) * shk
          }px)`;
          mc.style.transform = oc.style.transform;
        } else {
          oc.style.transform = "";
          mc.style.transform = "";
        }
        otx.globalAlpha = 1;
        for (let i = deathBits.length - 1; i >= 0; i--) {
          const b = deathBits[i];
          b.x += b.vx * 0.016;
          b.y += b.vy * 0.016;
          b.vy += 200 * 0.016;
          b.life -= b.decay;
          if (b.life <= 0) {
            deathBits.splice(i, 1);
            continue;
          }
          otx.globalAlpha = b.life;
          otx.fillStyle = b.col;
          otx.fillRect(
            Math.floor(b.x / 4) * 4,
            Math.floor(b.y / 4) * 4,
            4,
            4
          );
        }
      } else {
        otx.globalAlpha = Math.min(0.85, age * 0.6);
        otx.fillStyle = "#000";
        otx.fillRect(0, 0, W, H);
        otx.globalAlpha = 1;
        for (let i = deathBits.length - 1; i >= 0; i--) {
          const b = deathBits[i];
          b.x += b.vx * 0.016;
          b.y += b.vy * 0.016;
          b.life -= b.decay;
          if (b.life <= 0) {
            deathBits.splice(i, 1);
            continue;
          }
          otx.globalAlpha = b.life * 0.7;
          otx.fillStyle = b.col;
          otx.fillRect(
            Math.floor(b.x / 4) * 4,
            Math.floor(b.y / 4) * 4,
            4,
            4
          );
        }
        if (age < 1.5) {
          otx.globalAlpha = Math.max(0, 0.5 - age * 0.3);
          otx.fillStyle = "#7d3ac1";
          otx.fillRect(deathMX - 2, deathMY - 2, 4, 4);
        }
      }

      otx.globalAlpha = age > 0.4 ? 1 : age / 0.4;
      const fl = Math.floor(T * 4) % 2;
      otx.font = '28px "Press Start 2P",monospace';
      otx.textAlign = "center";
      otx.textBaseline = "middle";
      if (deadReason === "BURN") {
        otx.fillStyle = "#0e0d1a";
        otx.fillText("TOO CLOSE", W / 2 + 2, H / 2 + 2);
        otx.fillStyle = fl ? "#ff5874" : "#ffb454";
        otx.fillText("TOO CLOSE", W / 2, H / 2);
      } else {
        otx.fillStyle = fl ? "#7d3ac1" : "#44475a";
        otx.fillText("TOO FAR", W / 2, H / 2);
      }
      otx.font = '14px "VT323",monospace';
      otx.fillStyle = "#6272a4";
      otx.globalAlpha = age > 0.8 ? 1 : 0;
      otx.fillText("CLICK TO RESPAWN", W / 2, H / 2 + 40);
      otx.globalAlpha = 1;

      if (age > 1.2 && isDown) {
        dead = false;
        deathBits.length = 0;
        oc.style.transform = "";
        mc.style.transform = "";
      }
    }

    function drawEasterEgg(dt: number) {
      if (!easterEggActive) return;
      const age = T - easterEggAt;
      if (age > 3.0) {
        easterEggActive = false;
        rainbowParticles.length = 0;
        return;
      }

      // Rainbow particles
      for (let i = rainbowParticles.length - 1; i >= 0; i--) {
        const p = rainbowParticles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt;
        if (p.age >= p.life) {
          rainbowParticles.splice(i, 1);
          continue;
        }
        const alpha = 1 - p.age / p.life;
        otx.globalAlpha = alpha;
        otx.fillStyle = p.col;
        otx.fillRect(Math.floor(p.x / 4) * 4, Math.floor(p.y / 4) * 4, 4, 4);
      }

      // Text
      const textAlpha = age < 0.3 ? age / 0.3 : age > 2.5 ? 1 - (age - 2.5) / 0.5 : 1;
      otx.globalAlpha = textAlpha;
      otx.textAlign = "center";
      otx.textBaseline = "middle";

      // Rainbow color cycling
      const rcol = RCOLS[Math.floor(T * 8) % RCOLS.length];

      otx.font = '32px "Press Start 2P",monospace';
      otx.fillStyle = "#0e0d1a";
      otx.fillText(easterEggMsg1, W / 2 + 2, H / 2 - 20 + 2);
      otx.fillStyle = rcol;
      otx.fillText(easterEggMsg1, W / 2, H / 2 - 20);

      otx.font = '16px "Press Start 2P",monospace';
      otx.fillStyle = "#0e0d1a";
      otx.fillText(easterEggMsg2, W / 2 + 1, H / 2 + 25 + 1);
      otx.fillStyle = rcol;
      otx.fillText(easterEggMsg2, W / 2, H / 2 + 25);

      otx.globalAlpha = 1;
    }

    function drawHUD() {
      otx.save();

      // "DRAG TO DRAW A CIRCLE" — centered below fire
      otx.textAlign = "center";
      otx.font = '12px "VT323",monospace';
      otx.fillStyle = "#fff7c2";
      otx.fillText("DRAG TO DRAW A CIRCLE", fireSCX, fireSCY + fireBaseR * PX * 2.5 + 20);

      // BEST score
      otx.font = '14px "Press Start 2P",monospace';
      otx.fillStyle = "#8be9fd";
      otx.fillText(
        "BEST:" + String(bestScore).padStart(3, "0"),
        W / 2,
        H - 40
      );

      // MOTH-FLAME.EXE — centered below fire
      otx.font = '10px "VT323",monospace';
      otx.fillStyle = "#50fa7b";
      otx.fillText("MOTH-FLAME.EXE / v1.0", W / 2, H - 16);

      // Leaderboard panel (smaller on mobile)
      const mob = isMobile;
      const panelW = mob ? 160 : 260,
        rowH = mob ? 18 : 27,
        titleFont = mob ? '9px "Press Start 2P",monospace' : '12px "Press Start 2P",monospace',
        rowFont = mob ? '11px "VT323",monospace' : '15px "VT323",monospace',
        rowFontBold = mob ? 'bold 12px "VT323",monospace' : 'bold 16px "VT323",monospace',
        panelH = (mob ? 38 : 50) + 10 * rowH,
        panelX = W - panelW - 8,
        panelY = 8;
      otx.globalAlpha = 0.35;
      otx.fillStyle = "#0e0d1a";
      otx.fillRect(panelX, panelY, panelW, panelH);
      otx.globalAlpha = 1;
      otx.strokeStyle = "rgba(98,114,164,0.3)";
      otx.lineWidth = 1;
      otx.strokeRect(panelX, panelY, panelW, panelH);

      otx.textAlign = "center";
      otx.font = titleFont;
      otx.fillStyle = "#8be9fd";
      otx.fillText("TOP 10", panelX + panelW / 2, panelY + (mob ? 16 : 22));

      otx.strokeStyle = "rgba(98,114,164,0.2)";
      otx.beginPath();
      otx.moveTo(panelX + 8, panelY + (mob ? 22 : 32));
      otx.lineTo(panelX + panelW - 8, panelY + (mob ? 22 : 32));
      otx.stroke();

      otx.textAlign = "left";
      otx.font = rowFont;
      const rowStart = panelY + (mob ? 36 : 50);
      for (let i = 0; i < 10; i++) {
        const y = rowStart + i * rowH;
        const rank = String(i + 1).padStart(2, " ");
        otx.globalAlpha = 0.25;
        otx.fillStyle = "#44475a";
        otx.font = rowFont;
        otx.fillText(`${rank}.  ---`, panelX + 10, y);
        otx.textAlign = "right";
        otx.fillText("---", panelX + panelW - 10, y);
        otx.textAlign = "left";
      }
      if (bestScore > 0) {
        const y = rowStart;
        otx.globalAlpha = 1;
        otx.fillStyle = "#fff7c2";
        otx.font = rowFontBold;
        otx.fillText(" 1.", panelX + 10, y);
        otx.fillText(myName, panelX + (mob ? 36 : 46), y);
        otx.textAlign = "right";
        otx.fillText(
          String(bestScore).padStart(3, " "),
          panelX + panelW - 10,
          y
        );
        otx.textAlign = "left";
        otx.globalAlpha = 0.08;
        otx.fillStyle = "#9efbb6";
        otx.fillRect(panelX + 4, y - 10, panelW - 8, rowH - 2);
      }
      otx.globalAlpha = 1;
      otx.restore();
    }

    function drawCRT() {
      otx.save();
      otx.fillStyle = "rgba(0,0,0,0.18)";
      otx.globalCompositeOperation = "multiply";
      for (let y = 0; y < H; y += 3) otx.fillRect(0, y, W, 1);
      otx.globalCompositeOperation = "source-over";
      const v = otx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.3,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.8
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.45)");
      otx.fillStyle = v;
      otx.fillRect(0, 0, W, H);
      otx.restore();
    }

    /* ══════════════════════ Main Loop ══════════════════════ */
    let animId: number;
    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      T += dt;
      ctx.fillStyle = "rgba(14,13,26,0.5)";
      ctx.fillRect(0, 0, gw, gh);
      otx.clearRect(0, 0, W, H);

      drawBG();
      const fd = drawFire();
      drawEmbers(dt);
      drawAIMoths();

      if (isDown && !dead) {
        trail.push({ x: mx, y: my, t: T });

        // Auto-detect full circle completion
        if (trail.length > 30) {
          let sx2 = 0, sy2 = 0;
          trail.forEach(p => { sx2 += p.x; sy2 += p.y; });
          const centX = sx2 / trail.length, centY = sy2 / trail.length;
          let totalAng = 0;
          for (let i = 1; i < trail.length; i++) {
            const a1 = Math.atan2(trail[i - 1].y - centY, trail[i - 1].x - centX);
            const a2 = Math.atan2(trail[i].y - centY, trail[i].x - centX);
            let da = a2 - a1;
            if (da > Math.PI) da -= 6.28;
            if (da < -Math.PI) da += 6.28;
            totalAng += da;
          }
          const sweep = Math.abs(totalAng) / 6.28;
          const p0 = trail[0], pN = trail[trail.length - 1];
          const closeDist = Math.sqrt((p0.x - pN.x) ** 2 + (p0.y - pN.y) ** 2);
          const avgR = trail.map(p =>
            Math.sqrt((p.x - centX) ** 2 + (p.y - centY) ** 2)
          ).reduce((a, b) => a + b, 0) / trail.length;
          if (sweep > 0.9 && closeDist < avgR * 0.3) {
            isDown = false;
            endTrail();
          }
        }
      } else liveScoreVal = 0;

      drawTrail();
      drawClosed();
      drawMoth();
      checkDeath(fd);
      if (dead) drawGameOver();
      drawEasterEgg(dt);
      drawHUD();
      drawCRT();

      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [gameStarted]);

  /* ── Start Screen ── */
  if (!gameStarted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0e0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          cursor: "default",
        }}
      >
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(14px, 3vw, 24px)",
            color: "#fff7c2",
            textAlign: "center",
            marginBottom: 40,
            lineHeight: 1.6,
          }}
        >
          DRAG TO DRAW A CIRCLE
        </div>
        <button
          onClick={handleStart}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(16px, 2.5vw, 28px)",
            color: "#0e0d1a",
            background: "#fff7c2",
            border: "none",
            padding: "16px 48px",
            cursor: "pointer",
            transition: "transform 0.1s, background 0.1s",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.background = "#ffb454";
            (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.background = "#fff7c2";
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          START
        </button>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={mainRef}
        id="main"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          zIndex: 1,
        }}
      />
      <canvas
        ref={overlayRef}
        id="overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
