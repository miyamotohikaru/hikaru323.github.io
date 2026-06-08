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

const SITE = "https://moth-flame.vercel.app/";
const shareMessage = (s: number) =>
  `🔥🦋 I traced a ${s}% circle around the flame in MOTH-FLAME! Can you beat me?`;

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

export default function MothFlameGame() {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const startBgRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [muted, setMuted] = useState<boolean>(false); // sound starts ON every time
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioStartedRef = useRef(false);

  /* ── Audio: Web Audio multi-layer drift player.
     Three copies of the campfire sample loop at slightly different, randomly
     detuned rates and pans, so they drift out of phase forever — the crackle
     bed never repeats (infinite variation), like the flames. ── */
  const BASE_VOL = 0.9;
  const startAudio = useCallback(async () => {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : BASE_VOL;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6500;
    lp.Q.value = 0.2;
    master.connect(lp).connect(ctx.destination);
    masterGainRef.current = master;

    try {
      const res = await fetch("/sounds/campfire.mp3");
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      const dur = buf.duration;
      const rates = [0.97, 1.0, 1.05];
      const gains = [0.55, 0.45, 0.38];
      const pans = [-0.35, 0.0, 0.35];
      for (let i = 0; i < 3; i++) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.playbackRate.value = rates[i] + (Math.random() - 0.5) * 0.012;

        const g = ctx.createGain();
        g.gain.value = gains[i];

        // Slow "breathing" so each layer's level keeps shifting
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.03 + Math.random() * 0.05;
        lfoGain.gain.value = gains[i] * 0.3;
        lfo.connect(lfoGain).connect(g.gain);
        lfo.start();

        if (ctx.createStereoPanner) {
          const pan = ctx.createStereoPanner();
          pan.pan.value = pans[i];
          src.connect(g).connect(pan).connect(master);
        } else {
          src.connect(g).connect(master);
        }
        src.start(0, Math.random() * dur);
      }
    } catch {}
  }, [muted]);

  const handleStart = useCallback(() => {
    setGameStarted(true);
    startAudio();
    audioCtxRef.current?.resume?.();
  }, [startAudio]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nm = !m;
      const mg = masterGainRef.current;
      const ctx = audioCtxRef.current;
      if (mg && ctx) {
        mg.gain.setTargetAtTime(nm ? 0 : BASE_VOL, ctx.currentTime, 0.05);
      }
      return nm;
    });
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard
      ?.writeText(`${shareMessage(result.score)} ${SITE}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }, [result]);

  const handleTweet = useCallback(() => {
    if (!result) return;
    const url =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(shareMessage(result.score)) +
      "&url=" +
      encodeURIComponent(SITE);
    window.open(url, "_blank", "noopener");
  }, [result]);

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
    let fireBuf = new Float32Array(1);
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
      fireBuf = new Float32Array(gw * gh);
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
    try {
      bestScore = parseInt(localStorage.getItem("mf_best") || "0", 10) || 0;
    } catch {}
    let firstCircleDone = bestScore > 0;
    let fireSCX = 0,
      fireSCY = 0,
      fireBaseR = 0;
    let liveScoreVal = 0;
    let liveDistInfo = { accuracy: 0, shape: 0 };
    let deathMX = 0,
      deathMY = 0;
    const deathBits: DeathBit[] = [];

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
        vx: (Math.random() - 0.5) * (burst ? 60 : 22),
        vy: burst
          ? -(50 + Math.random() * 70)
          : -(16 + Math.random() * 26), // gentle rise, then it falls back
        life: burst ? 1.5 + Math.random() * 1.6 : 1.3 + Math.random() * 1.4,
        age: 0,
        sz: Math.random() > 0.5 ? 2 : 1,
        col: ["#ffb454", "#ff5874", "#fff7c2"][Math.floor(Math.random() * 3)],
      });
    }
    function spawnEmberTop(cx: number, topY: number, baseR: number) {
      embers.push({
        x: cx + (Math.random() - 0.5) * baseR * 0.6,
        y: topY - baseR * 0.3,
        vx: (Math.random() - 0.5) * 16,
        vy: -(10 + Math.random() * 20), // drifts up only a little, then fades
        life: 0.8 + Math.random() * 0.9,
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

    /* ── Flame shape generator — a fresh random profile each spawn,
       then slow-noise morphing gives effectively unlimited fire shapes ── */
    function rnd(a: number, b: number) {
      return a + Math.random() * (b - a);
    }
    function genTongues() {
      const n = 5 + Math.floor(Math.random() * 3); // 5–7 tongues
      return Array.from({ length: n }, () => ({
        xo: rnd(-1.0, 1.0),
        hf: rnd(0.45, 1.05),
        wf: rnd(0.26, 0.62),
        ph: Math.random() * 6.28,
        spd: rnd(0.85, 2.3),
        lean: rnd(0.45, 1.45),
      }));
    }
    let tongues = genTongues();

    // Irregular ember scheduling (random gaps + occasional bursts)
    let nextEmberT = 0;
    let nextEmberTopT = 0;

    // Flame has its own time that speeds up / slows down irregularly,
    // so the motion never feels uniform (sometimes calm, sometimes gusty).
    let fireT = 0;

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
      easterEggMsg1 = "★ SECRET ★";
      easterEggMsg2 = "You found the hidden star!";
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
      liveDistInfo = { accuracy: 0, shape: 0 };
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
      // Soft centering factor: full credit when the trail is centred on the
      // fire (within 0.6·idealR), tapering smoothly beyond. A partial arc
      // early in the stroke now scores instead of showing a hard 0%, and a
      // properly centred finished circle is unaffected (factor ≈ 1).
      const centering = Math.max(
        0,
        Math.min(1, 1 - Math.max(0, centDist - idealR * 0.6) / (idealR * 0.8))
      );

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

      const raw = (distanceScore * 0.5 + shapeScore * 0.5) * centering;
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
      firstCircleDone = true;
      if (score > bestScore) {
        bestScore = score;
        try {
          localStorage.setItem("mf_best", String(bestScore));
        } catch {}
      }
      setResult({ score });
      setCopied(false);
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
      // ignore clicks on UI controls (mute / share buttons)
      if ((e.target as HTMLElement | null)?.closest?.("[data-ui]")) return;
      mx = e.clientX;
      my = e.clientY;
      isDown = true;
      mouseIn = true;
      trail = [];
      lastClosed = null;
      setResult(null);
      setCopied(false);
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

    /* ── Multi-tongue fire ── */
    function drawFire() {
      // Drive all flame motion by the irregular flame clock (not real time)
      const T = fireT;
      const fire_size = 0.55;
      const cx = Math.round(gw / 2);
      const cy = Math.floor(gh * 0.62);
      const baseR = Math.min(gw, gh) * 0.13 * fire_size;
      const SX = cx;
      const SY = Math.floor(cy + baseR * 0.4);

      const breath = NB.s(T) * 0.04;
      const gust = NGust.s(T) * 1.8;
      const fireH = baseR * 2.4 * 1.55 * (1 + breath * 0.15);
      const fireW = baseR * 1.6 * (1 + NW.s(T) * 0.06);

      // Bounding box for the flame buffer
      const bx0 = Math.max(0, Math.floor(SX - baseR * 2.4));
      const bx1 = Math.min(gw - 1, Math.ceil(SX + baseR * 2.4));
      const maxH = fireH * 1.6;
      const by0 = Math.max(0, Math.floor(SY - maxH));
      const by1 = Math.min(gh - 1, SY);

      // Clear only the box rows of the accumulation buffer
      for (let y = by0; y <= by1; y++)
        fireBuf.fill(0, y * gw + bx0, y * gw + bx1 + 1);

      let tipX = SX,
        tipY = SY;

      // Accumulate each flame tongue into the buffer
      for (let ti = 0; ti < tongues.length; ti++) {
        const tg = tongues[ti];
        // Slow noise continuously morphs each tongue's shape → endless variety
        const morphA = NWobble.s(T * 0.07 + tg.ph);
        const morphB = NJitter.s(T * 0.05 + tg.ph * 1.3);
        const xo = tg.xo + morphA * 0.5;
        const hf = Math.max(0.3, tg.hf * (1 + morphB * 0.25));
        const wf = Math.max(0.2, tg.wf * (1 + morphA * 0.2));
        const leanM = tg.lean * (1 + morphB * 0.3);
        const pulse =
          NWobble.s(T * tg.spd + tg.ph) * 0.4 +
          NJitter.s(T * tg.spd * 1.7 + tg.ph) * 0.18;
        const surgeRaw = NF.s(T * 0.5 + tg.ph * 0.7);
        const surge = surgeRaw > 0.6 ? (surgeRaw - 0.6) * 1.6 : 0;
        const Hh = fireH * hf * (1 + pulse + surge);
        if (Hh < 2) continue;
        const rootX = SX + xo * baseR;
        const Wt = fireW * wf;
        const top = SY - Hh;
        if (top < tipY) {
          tipY = top;
          tipX = rootX;
        }

        const yStart = Math.max(by0, Math.floor(top));
        for (let py = yStart; py <= SY; py++) {
          const t01 = (SY - py) / Hh;
          if (t01 < 0 || t01 > 1) continue;
          // Sideways lean grows with height; gust pushes the tips
          const sway =
            (Math.sin(T * tg.spd * 1.1 + tg.ph) * 0.6 +
              Math.sin(T * tg.spd * 0.6 + tg.ph * 1.7) * 0.4) *
              leanM *
              baseR *
              Math.pow(t01, 1.4) +
            gust * Math.pow(t01, 1.6) * baseR * 0.25 +
            NJitter.s(T * tg.spd + py * 0.05 + tg.ph) * baseR * 0.12 * t01;
          const centerX = rootX + sway;
          // Width: rounded low body that tapers to a point
          let hw =
            Wt *
            Math.pow(1 - t01, 0.62) *
            (0.55 + 0.9 * Math.min(1, t01 * 4));
          hw *= 1 + (hash(ti * 31, py) - 0.5) * 0.18;
          if (hw < 0.5) continue;
          const left = Math.max(bx0, Math.floor(centerX - hw));
          const right = Math.min(bx1, Math.ceil(centerX + hw));
          const vbright = 1 - t01 * 0.55;
          for (let px = left; px <= right; px++) {
            const dx = px - centerX;
            const e = 1 - Math.abs(dx) / hw;
            if (e <= 0) continue;
            const xN = dx / hw;
            // Upward-scrolling turbulence makes each tongue flicker
            const turb =
              Math.sin(t01 * 9 - T * 4 * tg.spd + tg.ph + xN * 1.2) * 0.5 +
              Math.sin(t01 * 17 - T * 7 + xN * 2.0) * 0.28 +
              NFa.s(T + py * 0.05 + ti) * 0.3;
            const grain = (hash(px, py) - 0.5) * 0.22;
            let v = e * vbright * (0.72 + turb * 0.32) + grain * e;
            if (t01 > 0.72) v -= (t01 - 0.72) * 1.4; // tips break up
            if (v <= 0.02) continue;
            fireBuf[py * gw + px] += v;
          }
        }
      }

      // Broad combustion core sitting on the logs
      const coreH = baseR * 1.0;
      const coreTop = Math.max(by0, Math.floor(SY - coreH));
      for (let py = coreTop; py <= by1; py++) {
        const tt = (SY - py) / coreH;
        const cw = baseR * 1.2 * (1 - tt * 0.5);
        const l = Math.max(bx0, Math.floor(SX - cw));
        const r = Math.min(bx1, Math.ceil(SX + cw));
        for (let px = l; px <= r; px++) {
          const dx = (px - SX) / cw;
          const e = 1 - dx * dx;
          if (e <= 0) continue;
          fireBuf[py * gw + px] += e * (1 - tt) * 0.9;
        }
      }

      // Render the accumulation buffer to pixels (palette preserved)
      for (let py = by0; py <= by1; py++) {
        const row = py * gw;
        for (let px = bx0; px <= bx1; px++) {
          const v = fireBuf[row + px];
          if (v < 0.05) continue;
          let col: string;
          if (v > 1.15) col = COLS[0];
          else if (v > 0.78) col = COLS[1];
          else if (v > 0.5) col = COLS[2];
          else if (v > 0.26) col = COLS[3];
          else col = COLS[4];
          ctx.globalAlpha = Math.min(1, v * 0.85 + 0.12);
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
        for (let x = -Math.floor(lw * 0.4); x < Math.floor(lw * 0.4); x++) {
          ctx.fillStyle = "#3a2010";
          ctx.fillRect(lx + x - Math.floor(y * 0.3), ly - 2 + y, 1, 1);
        }
      for (let x = -Math.floor(lw * 0.35); x < Math.floor(lw * 0.35); x++) {
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

      // Embers — fewer and irregular: random gaps, with occasional little bursts
      if (T >= nextEmberT) {
        const burst = Math.random() < 0.18 ? 2 + Math.floor(Math.random() * 2) : 1;
        for (let k = 0; k < burst; k++) spawnEmber(cx, cy, baseR, false);
        // long lulls sometimes, quick pops other times
        nextEmberT =
          T + (Math.random() < 0.25 ? 0.9 + Math.random() * 1.6 : 0.2 + Math.random() * 0.6);
      }
      if (T >= nextEmberTopT) {
        if (Math.random() < 0.6) spawnEmberTop(tipX, tipY, baseR);
        nextEmberTopT = T + 0.5 + Math.random() * 1.8;
      }

      // Fire center for scoring
      fireSCX = cx * PX + PX / 2;
      fireSCY = (SY - fireH * 0.45) * PX;
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
        const a = 1 - e.age / e.life;
        if (a <= 0) {
          embers.splice(i, 1);
          continue;
        }
        e.vy *= 1 - 0.5 * dt; // no gravity: rise slows toward a drift, never falls
        e.vx *= 1 - 0.9 * dt; // air drag
        e.vx += Math.sin(T * 1.3 + e.y * 0.05) * 7 * dt; // gentle horizontal drift
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.sin(T * 18 + e.x * 0.1) < -0.8) continue; // flicker
        // Cool down as it ages: bright → ember-red → gone
        ctx.globalAlpha = Math.min(1, a * 1.2);
        ctx.fillStyle = a > 0.45 ? e.col : "#ff5874";
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

    /* ── Onboarding guide (shown until the first scored circle) ── */
    function drawGuide() {
      if (firstCircleDone || dead) return;
      const idealR = getIdealR();
      if (idealR < 20 || fireSCX <= 0) return;
      const pulse = 0.5 + Math.sin(T * 2) * 0.5;
      otx.save();
      otx.setLineDash([6, 10]);
      otx.lineDashOffset = -T * 20;
      otx.strokeStyle = `rgba(255,247,194,${0.12 + pulse * 0.14})`;
      otx.lineWidth = 2;
      otx.beginPath();
      otx.arc(fireSCX, fireSCY, idealR, 0, 6.28);
      otx.stroke();
      otx.setLineDash([]);

      otx.textAlign = "center";
      otx.globalAlpha = 0.55 + pulse * 0.45;
      otx.fillStyle = "#fff7c2";
      otx.font = '15px "VT323",monospace';
      otx.fillText("TRACE THE RING AROUND THE FLAME", fireSCX, fireSCY - idealR - 26);
      otx.globalAlpha = 0.55;
      otx.font = '11px "VT323",monospace';
      otx.fillStyle = "#ff5874";
      otx.fillText("TOO CLOSE = BURN", fireSCX, fireSCY - idealR - 12);
      otx.fillStyle = "#7d3ac1";
      otx.fillText("TOO FAR = LOST", fireSCX, fireSCY + idealR + 18);
      otx.restore();
    }

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
      // Live score uses the exact same formula as the final score, so the
      // number at the top converges to — and matches — the final result.
      liveScoreVal = calcScore(trail);

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
        otx.font = 'bold 28px "VT323",monospace';
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
        otx.fillStyle = dCol;
        otx.fillText("DIST:" + liveDistInfo.accuracy + "  SHAPE:" + liveDistInfo.shape, tx, ty + 14);

        otx.globalAlpha = 1;
        if (sc >= 90) {
          otx.font = '11px "VT323",monospace';
          otx.fillStyle = "#9efbb6";
          otx.fillText("★ PERFECT! ★", tx, ty + 28);
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
          `★ ${lastClosed.score} PT  ${lb} ★`,
          W / 2,
          H / 2
        );
      }
      otx.restore();
    }

    function checkDeath(fd: { cx: number; cy: number; baseR: number; SY: number }) {
      // Only the moth in flight (while tracing) can burn or get lost,
      // so moving the cursor to UI buttons never kills the player.
      if (dead || !mouseIn || !isDown) return;
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
        tongues = genTongues(); // new fire shape on every respawn
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

      const textAlpha = age < 0.3 ? age / 0.3 : age > 2.5 ? 1 - (age - 2.5) / 0.5 : 1;
      otx.globalAlpha = textAlpha;
      otx.textAlign = "center";
      otx.textBaseline = "middle";

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
      otx.textAlign = "center";

      // Subtle reminder after the first circle (guide handles the first one)
      if (firstCircleDone) {
        otx.font = '12px "VT323",monospace';
        otx.fillStyle = "rgba(255,247,194,0.7)";
        otx.fillText("DRAG TO DRAW A CIRCLE", fireSCX, fireSCY + fireBaseR * PX * 2.5 + 20);
      }

      // BEST score
      otx.font = '14px "Press Start 2P",monospace';
      otx.fillStyle = "#8be9fd";
      otx.fillText("BEST:" + String(bestScore).padStart(3, "0"), W / 2, H - 40);

      // Signature
      otx.font = '10px "VT323",monospace';
      otx.fillStyle = "#50fa7b";
      otx.fillText("MOTH-FLAME.EXE / v1.0", W / 2, H - 16);

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
      // Irregular flame tempo: mostly 0.5×–1.5×, with occasional fast gusts
      const flameSpeed =
        0.5 + (NGust.s(T * 0.3) + 1) * 0.5 + Math.max(0, NF.s(T * 0.55)) * 1.3;
      fireT += dt * flameSpeed;
      ctx.fillStyle = "rgba(14,13,26,0.5)";
      ctx.fillRect(0, 0, gw, gh);
      otx.clearRect(0, 0, W, H);

      drawBG();
      const fd = drawFire();
      drawEmbers(dt);
      drawAIMoths();
      drawGuide();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  /* ── Start-screen background: a moth flying a circle around the flame ── */
  useEffect(() => {
    if (gameStarted) return;
    const c = startBgRef.current;
    if (!c) return;
    const x = c.getContext("2d")!;
    let raf = 0;
    let t = 0;
    const trail: { x: number; y: number; a: number }[] = [];
    const RC = ["#ff5874", "#ffb454", "#fff7c2", "#9efbb6", "#7ecadf", "#7d3ac1"];
    function resize() {
      c!.width = window.innerWidth;
      c!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      t += 0.016;
      const W = c!.width,
        H = c!.height;
      x.fillStyle = "#0e0d1a";
      x.fillRect(0, 0, W, H);

      const cx = W / 2,
        cy = H / 2,
        R = Math.min(W, H) * 0.26;

      // Flame glow at the centre
      const flick = 0.16 + Math.sin(t * 7) * 0.03 + Math.sin(t * 13) * 0.02;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, R * 0.7);
      g.addColorStop(0, `rgba(255,180,84,${flick})`);
      g.addColorStop(0.5, "rgba(255,120,60,0.06)");
      g.addColorStop(1, "rgba(255,180,84,0)");
      x.fillStyle = g;
      x.fillRect(cx - R, cy - R, 2 * R, 2 * R);

      // Moth position on a perfect circular orbit (equal X/Y radius, no wobble)
      const ang = t * 1.0;
      const mxp = cx + Math.cos(ang) * R;
      const myp = cy + Math.sin(ang) * R;

      trail.push({ x: mxp, y: myp, a: 1 });
      if (trail.length > 150) trail.shift();
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        p.a *= 0.985;
        if (p.a < 0.04) continue;
        x.globalAlpha = p.a * 0.6;
        x.fillStyle = RC[(i + Math.floor(t * 12)) % RC.length];
        x.fillRect(Math.floor(p.x / 4) * 4, Math.floor(p.y / 4) * 4, 4, 4);
      }
      x.globalAlpha = 1;

      // Pixel moth
      const s = 4;
      const bx = Math.floor(mxp / s) * s,
        by = Math.floor(myp / s) * s;
      const flap = Math.floor(t * 12) % 2;
      const gr = x.createRadialGradient(bx, by, 0, bx, by, 22);
      gr.addColorStop(0, "rgba(255,247,194,0.25)");
      gr.addColorStop(1, "rgba(255,247,194,0)");
      x.fillStyle = gr;
      x.fillRect(bx - 22, by - 22, 44, 44);
      x.fillStyle = "#fff7c2";
      x.fillRect(bx, by - s, s, s);
      x.fillStyle = "#ffb454";
      x.fillRect(bx, by, s, s);
      x.fillRect(bx, by + s, s, s);
      x.fillStyle = "#fff7c2";
      if (flap === 0) {
        x.fillRect(bx - s * 2, by, s, s);
        x.fillRect(bx - s, by, s, s);
        x.fillRect(bx + s, by, s, s);
        x.fillRect(bx + s * 2, by, s, s);
      } else {
        x.fillRect(bx - s, by - s, s, s);
        x.fillRect(bx + s, by - s, s, s);
        x.fillRect(bx - s * 2, by - s, s, s);
        x.fillRect(bx + s * 2, by - s, s, s);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [gameStarted]);

  /* ── Pixel button base style ── */
  const pixelBtn: React.CSSProperties = {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 11,
    color: "#0e0d1a",
    background: "#fff7c2",
    border: "2px solid #0e0d1a",
    padding: "10px 14px",
    cursor: "pointer",
    boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
    imageRendering: "pixelated",
  };

  /* ── Start Screen ── */
  if (!gameStarted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0e0d1a",
          zIndex: 10,
          cursor: "default",
          overflow: "hidden",
        }}
      >
        {/* Animated background: a moth tracing a circle around the flame */}
        <canvas
          ref={startBgRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
            zIndex: 0,
          }}
        />
        {/* Foreground content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "clamp(16px, 3.5vw, 28px)",
              color: "#ffb454",
              marginBottom: 28,
              lineHeight: 1.6,
              textShadow: "2px 2px 0 #0e0d1a",
            }}
          >
            MOTH &amp; FLAME
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
              boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
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

      {/* Mute toggle (top-right) */}
      <button
        data-ui="1"
        onClick={toggleMute}
        aria-label={muted ? "unmute" : "mute"}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 6,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 11,
          color: muted ? "#6272a4" : "#0e0d1a",
          background: muted ? "#1c1830" : "#8be9fd",
          border: "2px solid #0e0d1a",
          padding: "8px 12px",
          cursor: "pointer",
          boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
        }}
      >
        {muted ? "♪ OFF" : "♪ ON"}
      </button>

      {/* Share panel — appears after a scored circle */}
      {result && (
        <div
          data-ui="1"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 72,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: 18,
              color: "#fff7c2",
              textShadow: "1px 1px 0 #0e0d1a",
            }}
          >
            YOU TRACED A{" "}
            <span style={{ color: "#9efbb6" }}>{result.score}%</span> CIRCLE
          </div>
          <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
            <button
              data-ui="1"
              onClick={handleTweet}
              style={{ ...pixelBtn, background: "#8be9fd" }}
            >
              TWEET
            </button>
            <button data-ui="1" onClick={handleCopy} style={pixelBtn}>
              {copied ? "COPIED!" : "COPY"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
