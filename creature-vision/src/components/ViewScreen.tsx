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
  const [processing, setProcessing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [shareOk, setShareOk] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];
  const fovData = FOV_DATA[creature.id];
  const expansion = fovData?.expansion ?? 1.0;

  // Load media
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile);
    setMediaSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Helper: apply creature vision to canvas (FOV expansion + filter)
  const applyCreatureVision = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      sourceImg: CanvasImageSource,
      creatureData: Creature,
      exp: number
    ) => {
      if (exp > 1.0) {
        // Wide FOV: canvas mirror+blur expansion
        expandFOV(ctx, w, h, sourceImg, exp);
      } else if (exp > 0 && exp < 1.0) {
        // Narrow FOV: zoom in
        expandFOV(ctx, w, h, sourceImg, exp);
      } else {
        // Normal (1.0) or blind (0): draw as-is
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
    (
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

      setProcessing(true);
      applyCreatureVision(ctx, w, h, img, c, exp);
      setTimeout(() => setProcessing(false), 300);
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

        {/* Processing overlay */}
        {processing && (
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
