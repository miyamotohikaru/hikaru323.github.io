"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Icon from "./Icon";
import { applyFilter, expandFOV, FOV_DATA } from "./FilterEngine";
import { CATEGORY_COLORS } from "@/styles/theme";

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
  const expandedCache = useRef<Map<string, string>>(new Map());

  const [processing, setProcessing] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [shareOk, setShareOk] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");
  const [aiFailed, setAiFailed] = useState(false);

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];
  const fovData = FOV_DATA[creature.id];
  const expansion = fovData?.expansion ?? 1.0;

  // Load media
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile);
    setMediaSrc(url);
    // Clear cache when photo changes
    expandedCache.current.forEach((u) => URL.revokeObjectURL(u));
    expandedCache.current.clear();
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Helper: apply creature vision to canvas
  const applyCreatureVision = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      sourceImg: CanvasImageSource,
      creatureData: Creature,
      exp: number
    ) => {
      if (exp > 0 && exp < 1.0) {
        // Zoom in for narrow FOV
        expandFOV(ctx, w, h, sourceImg, exp);
      } else {
        // Draw source image normally
        ctx.drawImage(sourceImg, 0, 0, w, h);
      }
      applyFilter(ctx, w, h, creatureData.filterType, creatureData.fp);
    },
    []
  );

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

      // Human canvas (always original)
      if (humanCanvas) {
        humanCanvas.width = w;
        humanCanvas.height = h;
        humanCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      }

      // Apply creature vision
      renderCreature(selectedId, img, w, h);
    };
    img.src = mediaSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSrc]);

  // Re-render when creature changes
  useEffect(() => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCreature(selectedId, imgRef.current, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Main render function
  const renderCreature = useCallback(
    async (
      creatureId: string,
      img: HTMLImageElement,
      w: number,
      h: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const c = creatures.find((cr) => cr.id === creatureId)!;
      const fov = FOV_DATA[creatureId];
      const exp = fov?.expansion ?? 1.0;

      setAiFailed(false);

      if (exp > 1.0) {
        // Check cache first
        const cached = expandedCache.current.get(creatureId);
        if (cached) {
          const cachedImg = new Image();
          cachedImg.onload = () => {
            ctx.drawImage(cachedImg, 0, 0, w, h);
            applyFilter(ctx, w, h, c.filterType, c.fp);
          };
          cachedImg.src = cached;
          return;
        }

        // AI outpainting
        setIsLoadingAI(true);
        setProcessing(true);
        try {
          // Create blob from original image
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = w;
          tmpCanvas.height = h;
          tmpCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          const blob = await new Promise<Blob>((resolve, reject) => {
            tmpCanvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("blob failed"))),
              "image/png"
            );
          });

          const isPortrait = h > w;
          const baseDim = isPortrait ? h : w;
          const expandPx = Math.round(((exp - 1.0) / 2) * Math.min(baseDim, 512));

          let left = 0, right = 0, up = 0, down = 0;
          if (isPortrait) {
            up = expandPx;
            down = expandPx;
            const newH = h + up + down;
            const ratio = newH / w;
            if (ratio > 2.5) {
              const max = Math.max(0, Math.floor((2.5 * w - h) / 2));
              up = max;
              down = max;
            }
          } else {
            left = expandPx;
            right = expandPx;
            const newW = w + left + right;
            const ratio = newW / h;
            if (ratio > 2.5) {
              const max = Math.max(0, Math.floor((2.5 * h - w) / 2));
              left = max;
              right = max;
            }
          }

          const form = new FormData();
          form.append("image", blob, "image.png");
          form.append("left", String(left));
          form.append("right", String(right));
          form.append("up", String(up));
          form.append("down", String(down));

          const res = await fetch("/api/expand", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error("API failed");

          const resultBlob = await res.blob();
          const url = URL.createObjectURL(resultBlob);
          expandedCache.current.set(creatureId, url);

          const aiImg = new Image();
          aiImg.onload = () => {
            ctx.drawImage(aiImg, 0, 0, w, h);
            applyFilter(ctx, w, h, c.filterType, c.fp);
            setIsLoadingAI(false);
            setProcessing(false);
          };
          aiImg.src = url;
        } catch (e) {
          console.error("AI expand failed:", e);
          setAiFailed(true);
          // Fallback: original image + filter only
          applyCreatureVision(ctx, w, h, img, c, 1.0);
          setIsLoadingAI(false);
          setProcessing(false);
        }
      } else {
        // Zoom in or normal
        setProcessing(true);
        applyCreatureVision(ctx, w, h, img, c, exp);
        setTimeout(() => setProcessing(false), 300);
      }
    },
    [creatures, applyCreatureVision]
  );

  const share = useCallback(() => {
    const text = `🔬 Creature Vision Lab\n\n${creature.name}（${creature.en}）の視覚\n🧬 ${creature.bio}\n\n#CreatureVision`;
    navigator.clipboard.writeText(text);
    setShareOk(true);
    setTimeout(() => setShareOk(false), 2000);
  }, [creature]);

  const isFav = favs.includes(selectedId);

  return (
    <div
      className="min-h-screen px-4 py-6 mx-auto"
      style={{ maxWidth: 960, animation: "fadeUp 0.4s ease-out" }}
    >
      {/* Top bar - only back, fav, share */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={onBack} className="pill-btn">
          ← もどる
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onToggleFav(selectedId)}
          className="pill-btn"
        >
          {isFav ? "❤️" : "🤍"}
        </button>
        <button onClick={share} className="pill-btn">
          {shareOk ? "✅" : "📤"}
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
            width: 48,
            height: 48,
            borderRadius: 14,
            background: catColor?.bg ?? "#f5f5f5",
          }}
        >
          <Icon
            id={creature.id}
            name={creature.name}
            cat={creature.cat}
            size={36}
          />
        </div>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900 }}>
            {creature.name}のめ
          </span>
          <div style={{ fontSize: 13, color: "#999" }}>{creature.en}</div>
        </div>
      </div>

      {/* Canvas area with tap-hold */}
      <div
        className="relative"
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => {
          e.preventDefault();
          setIsHolding(true);
        }}
        onTouchEnd={() => setIsHolding(false)}
        onTouchCancel={() => setIsHolding(false)}
      >
        {/* Creature canvas (bottom layer) */}
        <canvas ref={canvasRef} className="block w-full" />

        {/* Human canvas (top layer, shown on hold) */}
        <canvas
          ref={humanCanvasRef}
          className="absolute top-0 left-0 block w-full"
          style={{
            opacity: isHolding ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* View mode label */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 16px",
            borderRadius: 100,
            background: isHolding
              ? "rgba(255,255,255,0.9)"
              : `${catColor?.accent ?? "#999"}ee`,
            color: isHolding ? "#333" : "#fff",
            fontSize: 12,
            fontWeight: 900,
            transition: "all 0.3s ease",
            pointerEvents: "none",
          }}
        >
          {isHolding ? "👁 人間のめ" : `${creature.name}のめ`}
        </div>

        {/* Loading overlay: "○○に転生中" */}
        {isLoadingAI && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,249,242,0.95)",
              zIndex: 20,
              borderRadius: 18,
            }}
          >
            {/* Eye blink animation */}
            <div
              style={{
                width: 80,
                height: 40,
                position: "relative",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "2.5px solid #2D2D2D",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: catColor?.accent ?? "#F5A623",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#1A1A1A",
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: -2,
                    right: -2,
                    height: "100%",
                    background: "#FFF9F2",
                    borderBottom: "2px solid #2D2D2D",
                    transformOrigin: "top center",
                    animation: "eyeOpen 2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#2D2D2D",
                textAlign: "center",
              }}
            >
              {creature.name}に転生中...
            </p>
          </div>
        )}

        {/* Simple processing overlay (for non-AI processing) */}
        {processing && !isLoadingAI && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <div style={{ animation: "pulse 1s ease-in-out infinite" }}>
              <Icon
                id={creature.id}
                name={creature.name}
                cat={creature.cat}
                size={60}
              />
            </div>
            <p
              className="mt-2"
              style={{ fontWeight: 700, fontSize: 14, color: "#2D2D2D" }}
            >
              へんかんちゅう...
            </p>
          </div>
        )}
      </div>

      {/* Hint + FOV + error */}
      {creature.id === "human" ? (
        <p
          className="mt-3 text-center"
          style={{
            fontSize: 13,
            color: "#999",
            fontWeight: 500,
            lineHeight: 1.8,
          }}
        >
          これがあなたの世界。でも電磁スペクトルのたった0.0035%しか見えていません。
          <br />
          他の生き物をタップして、別の世界を覗いてみよう。
        </p>
      ) : (
        <p
          className="mt-2 text-center"
          style={{ fontSize: 12, color: "#bbb", fontWeight: 700 }}
        >
          👆 長押しで人間の目に戻る
        </p>
      )}

      {fovData && (
        <p
          className="mt-1 text-center"
          style={{ fontSize: 13, fontWeight: 700, color: "#999" }}
        >
          🔭 視野角:{" "}
          {fovData.fov === 0
            ? "なし（目が退化）"
            : `${fovData.fov}°（人間は120°）`}
        </p>
      )}

      {aiFailed && expansion > 1.0 && (
        <p
          className="mt-1 text-center"
          style={{ fontSize: 11, color: "#ccc" }}
        >
          ⚠ 画像拡張に失敗しました
        </p>
      )}

      {/* Bio panel */}
      <div className="mt-6">
        <div
          style={{
            padding: 20,
            borderRadius: 18,
            background: catColor?.bg ?? "#f5f5f5",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900 }}>
            🧬 なんでこうなの？
          </div>
          <p
            className="mt-2"
            style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.8,
              color: "#555",
            }}
          >
            {creature.bio}
          </p>
        </div>
      </div>

      <style>{`
        .pill-btn {
          background: #fff;
          border: 2px solid rgba(0,0,0,0.07);
          border-radius: 100px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          color: #2D2D2D;
        }
        .pill-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
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
