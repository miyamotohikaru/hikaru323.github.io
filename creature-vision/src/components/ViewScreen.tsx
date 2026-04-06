"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Icon from "./Icon";
import CompareSlider from "./CompareSlider";
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
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [processing, setProcessing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [shareOk, setShareOk] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExpandedSrc, setAiExpandedSrc] = useState<string | null>(null);

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];

  // Load media
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile);
    setMediaSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Load image and setup canvases
  useEffect(() => {
    if (!mediaSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const compareCanvas = compareCanvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_W / img.width);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;

      // Reset AI state when image changes
      setAiExpanded(false);
      setAiExpandedSrc(null);

      // Draw original for compare (human vision = no FOV expansion)
      if (compareCanvas) {
        compareCanvas.width = w;
        compareCanvas.height = h;
        compareCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      }

      // Apply initial filter with FOV expansion
      const ctx = canvas.getContext("2d")!;
      setProcessing(true);

      const fovData = FOV_DATA[selectedId];
      const expansion = fovData?.expansion ?? 1.0;

      if (expansion !== 0 && expansion !== 1.0) {
        expandFOV(ctx, w, h, img, expansion);
      } else if (expansion !== 0) {
        ctx.drawImage(img, 0, 0, w, h);
      }
      // For expansion === 0, just draw normally (filter will make it black anyway)
      if (expansion === 0) {
        ctx.drawImage(img, 0, 0, w, h);
      }

      const c = creatures.find((c) => c.id === selectedId)!;
      applyFilter(ctx, w, h, c.filterType, c.fp);
      setTimeout(() => setProcessing(false), 300);
    };
    img.src = mediaSrc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSrc]);

  // Re-apply filter when creature changes
  useEffect(() => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current;
    const compareCanvas = compareCanvasRef.current;
    if (!canvas || !compareCanvas) return;
    const ctx = canvas.getContext("2d")!;

    setProcessing(true);
    setAiExpanded(false);
    setAiExpandedSrc(null);

    const fovData = FOV_DATA[selectedId];
    const expansion = fovData?.expansion ?? 1.0;
    const img = imgRef.current;

    if (expansion !== 0 && expansion !== 1.0) {
      expandFOV(ctx, canvas.width, canvas.height, img, expansion);
    } else {
      ctx.drawImage(compareCanvas, 0, 0);
    }

    const c = creatures.find((c) => c.id === selectedId)!;
    applyFilter(ctx, canvas.width, canvas.height, c.filterType, c.fp);
    setTimeout(() => setProcessing(false), 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const share = useCallback(() => {
    const text = `🔬 Creature Vision Lab\n\n${creature.name}（${creature.en}）の視覚\n🎨 ${creature.detail}\n🧬 ${creature.bio}\n\n#CreatureVision`;
    navigator.clipboard.writeText(text);
    setShareOk(true);
    setTimeout(() => setShareOk(false), 2000);
  }, [creature]);

  const handleAiExpand = useCallback(async () => {
    if (aiExpanded || aiLoading) return;
    const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_STABILITY_API_KEY not set");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAiLoading(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Failed")), "image/png");
      });

      const fovData = FOV_DATA[selectedId];
      const expandPixels = Math.round(((fovData?.expansion ?? 1.0) - 1.0) * 512);

      const formData = new FormData();
      formData.append("image", blob, "image.png");
      formData.append("left", String(expandPixels));
      formData.append("right", String(expandPixels));
      formData.append("prompt", "natural seamless extension of the scene, same lighting and style");

      const res = await fetch("https://api.stability.ai/v2beta/stable-image/edit/outpaint", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "image/*",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("AI expansion failed");

      const resultBlob = await res.blob();
      const url = URL.createObjectURL(resultBlob);
      setAiExpandedSrc(url);

      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const c = creatures.find((c) => c.id === selectedId)!;
        applyFilter(ctx, canvas.width, canvas.height, c.filterType, c.fp);
        setAiExpanded(true);
        setAiLoading(false);
      };
      img.src = url;
    } catch (e) {
      console.error("AI expand error:", e);
      setAiLoading(false);
    }
  }, [aiExpanded, aiLoading, selectedId, creatures]);

  const isFav = favs.includes(selectedId);

  return (
    <div
      className="min-h-screen px-4 py-6 mx-auto"
      style={{ maxWidth: 960, animation: "fadeUp 0.4s ease-out" }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={onBack} className="pill-btn">← もどる</button>
        <button onClick={() => onToggleFav(selectedId)} className="pill-btn">
          {isFav ? "❤️" : "🤍"} お気に入り
        </button>
        <button onClick={share} className="pill-btn">
          {shareOk ? "✅" : "📤"} シェア
        </button>
        <button onClick={() => setComparing(!comparing)} className="pill-btn"
          style={comparing ? { background: catColor?.accent, color: "#fff" } : {}}
        >
          ⇔ 比較
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
          <Icon id={creature.id} name={creature.name} cat={creature.cat} size={36} />
        </div>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900 }}>{creature.name}のめ</span>
          <div style={{ fontSize: 13, color: "#999" }}>{creature.en}</div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative" style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        {comparing && (
          <CompareSlider creatureName={creature.name} accentColor={catColor?.accent ?? "#999"} />
        )}

        <canvas
          ref={canvasRef}
          className="block w-full"
          style={
            comparing
              ? { clipPath: `inset(0 ${100 - 50}% 0 0)` }
              : {}
          }
        />

        {comparing && (
          <canvas
            ref={compareCanvasRef}
            className="absolute top-0 left-0 block w-full"
            style={{ clipPath: `inset(0 0 0 ${50}%)` }}
          />
        )}

        {!comparing && (
          <canvas ref={compareCanvasRef} className="hidden" />
        )}

        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <div style={{ animation: "pulse 1s ease-in-out infinite" }}>
              <Icon id={creature.id} name={creature.name} cat={creature.cat} size={60} />
            </div>
            <p className="mt-2" style={{ fontWeight: 700, fontSize: 14, color: "#2D2D2D" }}>
              へんかんちゅう...
            </p>
          </div>
        )}
      </div>

      {/* FOV info */}
      {(() => {
        const fovData = FOV_DATA[creature.id];
        if (!fovData) return null;
        return (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#666" }}>
              🔭 視野角: {fovData.fov === 0 ? "なし（目が退化）" : `${fovData.label}（人間は120°）`}
            </span>
            {fovData.expansion > 1.0 && !aiExpanded && process.env.NEXT_PUBLIC_STABILITY_API_KEY && (
              <button
                onClick={handleAiExpand}
                disabled={aiLoading}
                className="pill-btn"
                style={aiLoading ? { opacity: 0.6 } : {}}
              >
                {aiLoading ? "⏳ 生成中..." : "✨ AIで広げる"}
              </button>
            )}
            {aiExpanded && (
              <span style={{ fontSize: 13, fontWeight: 700, color: catColor?.accent ?? "#999" }}>
                ✅ AI生成済み
              </span>
            )}
          </div>
        );
      })()}

      {/* Detail panel */}
      <div className="mt-6">
        <div
          style={{
            padding: 20,
            borderRadius: 18,
            background: catColor?.bg ?? "#f5f5f5",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900 }}>🧬 なんでこうなの？</div>
          <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.8, color: "#555" }}>
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
      `}</style>
    </div>
  );
}
