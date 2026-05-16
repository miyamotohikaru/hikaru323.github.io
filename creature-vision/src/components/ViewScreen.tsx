"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Icon from "./Icon";
import { applyFilter, FOV_DATA, applyFisheye } from "./FilterEngine";
import { CATEGORY_COLORS } from "@/styles/theme";
import { SHARE_TEXTS } from "@/data/shareTexts";

interface Creature {
  id: string;
  name: string;
  en: string;
  cat: string;
  color: string;
  filterType: string;
  fp: Record<string, unknown>;
  detail: string;
  bio: string;
}

interface Props {
  creatures: Creature[];
  selectedId: string;
  mediaFile: File;
  favs: string[];
  onBack: () => void;
  onToggleFav: (id: string) => void;
  onSelect: (id: string) => void;
}

const MAX_W = 900;

/* ── SVG Icons ── */

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "#FF6B6B" : "none"}
        stroke={filled ? "#FF6B6B" : "#999"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L12 16" stroke="#555" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8L12 3L17 8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#000" />
      <path d="M13.544 10.456L17.88 5.5H16.68L13.008 9.672L10.068 5.5H6.5L11.04 12.78L6.5 18H7.7L11.58 13.564L14.68 18H18.248L13.544 10.456ZM12.196 12.852L11.656 12.076L8.136 6.412H9.492L12.676 10.416L13.216 11.192L16.68 17.636H15.324L12.196 12.852Z" fill="white"/>
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#06C755" />
      <path d="M19.5 10.6c0-3.42-3.36-6.2-7.5-6.2s-7.5 2.78-7.5 6.2c0 3.07 2.66 5.63 6.25 6.12.24.05.57.16.66.37.07.18.05.47.02.66l-.1.64c-.03.2-.15.77.66.42.82-.35 4.4-2.66 6-4.56C19.06 13.08 19.5 11.92 19.5 10.6z" fill="white"/>
      <path d="M10.25 8.8H9.5a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h.75a.3.3 0 0 0 .3-.3V9.1a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M14.75 8.8H14a.3.3 0 0 0-.3.3v1.96l-1.44-2.1a.3.3 0 0 0-.26-.16h-.75a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h.75a.3.3 0 0 0 .3-.3v-1.96l1.44 2.1a.3.3 0 0 0 .26.16h.75a.3.3 0 0 0 .3-.3V9.1a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M8.5 11.35H7.2V9.1a.3.3 0 0 0-.3-.3h-.75a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3H8.5a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M18.15 9.85a.3.3 0 0 0 .3-.3V8.8a.3.3 0 0 0-.3-.3h-2.4a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3H16.5v-.5h1.65a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3H16.5v-.5h1.65z" fill="#06C755"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path d="M16.5 12.5l.5-3h-3V8c0-.83.4-1.63 1.7-1.63H17V3.88S15.82 3.5 14.7 3.5c-2.33 0-3.86 1.41-3.86 3.97V9.5H8v3h2.84V21h3.5V12.5H16.5z" fill="white"/>
    </svg>
  );
}

/* ── Share image generation ── */

async function generateShareImage(
  creatureCanvas: HTMLCanvasElement,
  humanCanvas: HTMLCanvasElement,
  creature: Creature
): Promise<Blob> {
  const srcW = creatureCanvas.width;
  const srcH = creatureCanvas.height;

  const padding = 20;
  const halfW = Math.round(srcW / 2);
  const gap = 4;
  const totalW = srcW + padding * 2;
  const footerH = 100;
  const totalH = srcH + footerH + padding * 2;

  const cv = document.createElement("canvas");
  cv.width = totalW;
  cv.height = totalH;
  const ctx = cv.getContext("2d")!;

  ctx.fillStyle = "#FFF9F2";
  ctx.fillRect(0, 0, totalW, totalH);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, padding, halfW - gap / 2, srcH, [12, 0, 0, 12]);
  ctx.clip();
  ctx.drawImage(creatureCanvas, 0, 0, srcW, srcH, padding, padding, halfW - gap / 2, srcH);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding + halfW + gap / 2, padding, halfW - gap / 2, srcH, [0, 12, 12, 0]);
  ctx.clip();
  ctx.drawImage(humanCanvas, srcW / 4, 0, srcW / 2, srcH, padding + halfW + gap / 2, padding, halfW - gap / 2, srcH);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding + halfW, padding);
  ctx.lineTo(padding + halfW, padding + srcH);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(padding + 8, padding + 8, 80, 26);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(`${creature.name}のめ`, padding + 14, padding + 25);

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(padding + halfW + gap / 2 + 8, padding + 8, 80, 26);
  ctx.fillStyle = "#fff";
  ctx.fillText("👁 人間のめ", padding + halfW + gap / 2 + 14, padding + 25);

  const footerY = padding + srcH + 16;
  ctx.fillStyle = "#2D2D2D";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`${creature.name}の目で見た世界`, padding, footerY + 20);

  ctx.fillStyle = "#888";
  ctx.font = "13px sans-serif";
  ctx.fillText(SHARE_TEXTS[creature.id] || "", padding, footerY + 42);

  ctx.fillStyle = "#bbb";
  ctx.font = "11px sans-serif";
  ctx.fillText("👁 生き物の目で世界を見よう — creature-vision.vercel.app", padding, footerY + 68);

  return new Promise((resolve) => {
    cv.toBlob((blob) => resolve(blob!), "image/png", 0.92);
  });
}

/* ── Resize before sending to API ── */

async function resizeForAPI(imageBlob: Blob, maxDim: number = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(imageBlob);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1) return imageBlob; // already small enough
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}

/* ── Expand API call ── */

async function callExpandAPI(
  imageBlob: Blob,
  expansion: number
): Promise<HTMLImageElement | null> {
  console.log("=== API EXPAND START ===", "expansion:", expansion);

  // Resize before sending (large images can cause API timeouts)
  const resized = await resizeForAPI(imageBlob, 1024);
  console.log("Resized blob:", resized.size, "bytes (original:", imageBlob.size, ")");

  const formData = new FormData();
  formData.append("image", resized, "photo.jpg");
  formData.append("expansion", String(expansion));

  // Detect orientation
  const bitmap = await createImageBitmap(resized);
  const direction = bitmap.height > bitmap.width ? "vertical" : "horizontal";
  formData.append("direction", direction);
  console.log("Image direction:", direction, bitmap.width, "x", bitmap.height);

  const res = await fetch("/api/expand", { method: "POST", body: formData });
  console.log("=== API EXPAND RESPONSE ===", res.status);

  if (!res.ok) {
    const errText = await res.text();
    console.error("[expand] API error:", res.status, errText);
    return null;
  }

  const blob = await res.blob();
  console.log("=== EXPANDED IMAGE BLOB ===", blob.size, blob.type);

  if (blob.size < 1000) {
    console.error("[expand] API returned tiny blob:", blob.size);
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log("=== EXPANDED IMAGE LOADED ===", img.width, "x", img.height);
      resolve(img);
    };
    img.onerror = () => {
      console.error("[expand] Failed to load expanded image");
      resolve(null);
    };
    img.src = URL.createObjectURL(blob);
  });
}

/* ── Main component ── */

export default function ViewScreen({
  creatures,
  selectedId,
  mediaFile,
  favs,
  onBack,
  onToggleFav,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humanCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");
  const [canvasRatio, setCanvasRatio] = useState<number | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const expandCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];
  const fovData = FOV_DATA[creature.id];

  // Close share menu on outside click
  useEffect(() => {
    if (!showShareMenu) return;
    const handler = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShareMenu]);

  // Load media
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile);
    setMediaSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Load image and initial render
  useEffect(() => {
    if (!mediaSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const humanCanvas = humanCanvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_W / img.width);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;
      setCanvasRatio(w / h);

      if (humanCanvas) {
        humanCanvas.width = w;
        humanCanvas.height = h;
        humanCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      }

      handleCreatureChange(selectedId, img, w, h);
    };
    img.src = mediaSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSrc]);

  // Re-render when creature changes
  useEffect(() => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    handleCreatureChange(selectedId, imgRef.current, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Main rendering function
  const handleCreatureChange = useCallback(
    async (creatureId: string, originalImage: HTMLImageElement, w: number, h: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const c = creatures.find((cr) => cr.id === creatureId)!;
      const fov = FOV_DATA[creatureId];
      const exp = fov?.expansion ?? 1.0;

      console.log("=== CREATURE CHANGE ===", creatureId, "expansion:", exp);

      // --- STEP 1: Loading ---
      setLoadingText(`${c.name}に転生中...`);
      setProcessing(true);

      // --- STEP 2: Determine image source ---
      let sourceImg: CanvasImageSource = originalImage;
      let aiExpandSucceeded = false;

      if (exp > 1.0) {
        // Check cache first
        const cached = expandCacheRef.current.get(creatureId);
        if (cached) {
          console.log("[expand] Using cached image for", creatureId);
          sourceImg = cached;
          aiExpandSucceeded = true;
        } else {
          // AI expansion
          setLoadingText("🔭 視界をひろげてるよ...");
          setExpanding(true);
          try {
            const expandedImg = await callExpandAPI(mediaFile, exp);
            if (expandedImg) {
              expandCacheRef.current.set(creatureId, expandedImg);
              sourceImg = expandedImg;
              aiExpandSucceeded = true;
            } else {
              console.warn("[expand] AI expand returned null, using original");
            }
          } catch (e) {
            console.error("[expand] AI expand failed, using original:", e);
          }
          setExpanding(false);
        }
      }

      // --- STEP 3: Draw source image ---
      ctx.drawImage(sourceImg, 0, 0, w, h);

      // --- STEP 4: Apply creature filter ---
      applyFilter(ctx, w, h, c.filterType, c.fp);

      // --- STEP 5: Narrow FOV zoom + vignette (expansion < 1.0) ---
      if (exp > 0 && exp < 1.0) {
        const filtered = document.createElement("canvas");
        filtered.width = w;
        filtered.height = h;
        filtered.getContext("2d")!.drawImage(ctx.canvas, 0, 0);
        const cropW = w * exp;
        const cropH = h * exp;
        const sx = (w - cropW) / 2;
        const sy = (h - cropH) / 2;
        ctx.drawImage(filtered, sx, sy, cropW, cropH, 0, 0, w, h);

        const darkness = Math.max(0, 1 - exp) * 0.8;
        const vg = ctx.createRadialGradient(
          w / 2, h / 2, w * exp * 0.3,
          w / 2, h / 2, w * 0.6
        );
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, `rgba(0,0,0,${darkness})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
      }

      // --- STEP 6: Fisheye ONLY when AI expansion succeeded ---
      if (aiExpandSucceeded) {
        const fisheyeStrength = Math.min(1.0, (exp - 1.0) / 2.0);
        applyFisheye(ctx, w, h, fisheyeStrength);
        console.log("[fisheye] Applied with strength:", fisheyeStrength);
      } else if (exp > 1.0) {
        console.log("[fisheye] Skipped — AI expansion failed, no fisheye to avoid black borders");
      }

      // --- STEP 7: Done ---
      setProcessing(false);
      setLoadingText("");
    },
    [creatures, mediaFile]
  );

  // Share to specific SNS
  const shareToSns = useCallback(
    async (sns: "x" | "line" | "facebook") => {
      const shareText = SHARE_TEXTS[creature.id] || "";
      const fullText = `${shareText}\n\n👁 生き物の目で世界を見よう`;
      const url = "https://creature-vision.vercel.app";

      const creatureCanvas = canvasRef.current;
      const humanCanvas = humanCanvasRef.current;
      if (creatureCanvas && humanCanvas) {
        const blob = await generateShareImage(creatureCanvas, humanCanvas, creature);
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dlUrl;
        a.download = `creature-vision-${creature.id}.png`;
        a.click();
        URL.revokeObjectURL(dlUrl);
      }

      let shareUrl = "";
      switch (sns) {
        case "x":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`;
          break;
        case "line":
          shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(fullText)}`;
          break;
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullText)}`;
          break;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      setShowShareMenu(false);
    },
    [creature]
  );

  const isFav = favs.includes(selectedId);

  return (
    <div
      className="min-h-screen px-4 py-6 mx-auto"
      style={{ maxWidth: 960, animation: "fadeUp 0.4s ease-out" }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={onBack} className="pill-btn">
          ← もどる
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onToggleFav(selectedId)}
          className="pill-btn"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>

      {/* Creature nav pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {creatures.map((c) => {
          const active = c.id === selectedId;
          const col = CATEGORY_COLORS[c.cat];
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex-shrink-0 cursor-pointer"
              style={{
                padding: "6px 14px",
                borderRadius: 100,
                background: active ? (col?.accent ?? "#999") : "#fff",
                color: active ? "#fff" : "#2D2D2D",
                border: "2px solid rgba(0,0,0,0.05)",
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Title area */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: catColor?.bg ?? "#f5f5f5",
          }}
        >
          <Icon id={creature.id} name={creature.name} cat={creature.cat} size={36} />
        </div>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900 }}>{creature.name}のめ</span>
          <div style={{ fontSize: 13, color: "#999" }}>{creature.en}</div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="relative"
        style={{
          borderRadius: 18, overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
        onTouchEnd={() => setIsHolding(false)}
        onTouchCancel={() => setIsHolding(false)}
      >
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ height: "auto", aspectRatio: canvasRatio ?? undefined }}
        />
        <canvas
          ref={humanCanvasRef}
          className="absolute top-0 left-0 block w-full"
          style={{
            height: "auto", aspectRatio: canvasRatio ?? undefined,
            opacity: isHolding ? 1 : 0,
            transition: "opacity 0.3s ease", pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", top: 12, left: "50%",
            transform: "translateX(-50%)", padding: "6px 16px",
            borderRadius: 100,
            background: isHolding ? "rgba(255,255,255,0.9)" : `${catColor?.accent ?? "#999"}ee`,
            color: isHolding ? "#333" : "#fff",
            fontSize: 12, fontWeight: 900,
            transition: "all 0.3s ease", pointerEvents: "none",
          }}
        >
          {isHolding ? "👁 人間のめ" : `${creature.name}のめ`}
        </div>

        {/* Loading overlay */}
        {(processing || expanding) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <div style={{ animation: "eyeOpen 2s ease-in-out infinite" }}>
              <Icon id={creature.id} name={creature.name} cat={creature.cat} size={60} />
            </div>
            <p className="mt-2" style={{ fontWeight: 700, fontSize: 14, color: "#2D2D2D" }}>
              {loadingText}
            </p>
          </div>
        )}
      </div>

      {/* Hint + FOV */}
      {creature.id === "human" ? (
        <p className="mt-3 text-center" style={{ fontSize: 13, color: "#999", fontWeight: 500, lineHeight: 1.8 }}>
          これがあなたの世界。でも電磁スペクトルのたった0.0035%しか見えていません。
          <br />他の生き物をタップして、別の世界を覗いてみよう。
        </p>
      ) : (
        <p className="mt-2 text-center" style={{ fontSize: 12, color: "#bbb", fontWeight: 700 }}>
          👆 長押しで人間の目に戻る
        </p>
      )}

      {fovData && (
        <p className="mt-1 text-center" style={{ fontSize: 13, fontWeight: 700, color: "#999" }}>
          🔭 視野角: {fovData.fov === 0 ? "なし（目が退化）" : `${fovData.fov}°（人間は120°）`}
        </p>
      )}

      {/* Share button + popup */}
      <div className="relative flex justify-center" ref={shareMenuRef}>
        {showShareMenu && (
          <div
            style={{
              position: "absolute", bottom: "100%", marginBottom: 12,
              background: "#fff", borderRadius: 16, padding: "16px 24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              animation: "fadeUp 0.2s ease-out", zIndex: 10,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "#999", marginBottom: 12 }}>シェアする</p>
            <div className="flex gap-5">
              {([["x", <XIcon key="x" />, "X"], ["line", <LineIcon key="l" />, "LINE"], ["facebook", <FacebookIcon key="f" />, "Facebook"]] as const).map(([sns, icon, label]) => (
                <button
                  key={sns}
                  onClick={() => shareToSns(sns)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 48, height: 48, borderRadius: 14, background: "#f0f0f0", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {icon}
                  </div>
                  <span style={{ fontSize: 10, color: "#999" }}>{label}</span>
                </button>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #fff" }} />
          </div>
        )}
        <button
          onClick={() => setShowShareMenu((v) => !v)}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 16,
            border: "2px solid rgba(0,0,0,0.06)",
            background: shareFeedback ? "#f0fff0" : "#fff",
            color: "#333", fontSize: 15, fontWeight: 900, fontFamily: "inherit",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, marginTop: 12, transition: "all 0.2s",
          }}
        >
          <ShareIcon />
          {shareFeedback ? "✅ 画像を保存しました！" : "この見え方をシェアする"}
        </button>
      </div>

      {/* Bio panel */}
      <div className="mt-6">
        <div style={{ padding: 20, borderRadius: 18, background: catColor?.bg ?? "#f5f5f5" }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>🧬 なんでこうなの？</div>
          <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.8, color: "#555" }}>
            {creature.bio}
          </p>
        </div>
      </div>

      <style>{`
        .pill-btn {
          background: #fff; border: 2px solid rgba(0,0,0,0.07);
          border-radius: 100px; padding: 8px 16px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all 0.2s; font-family: inherit; color: #2D2D2D;
        }
        .pill-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes eyeOpen {
          0%   { transform: scaleY(1); }
          20%  { transform: scaleY(0); }
          80%  { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
