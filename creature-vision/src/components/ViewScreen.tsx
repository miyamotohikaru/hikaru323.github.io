"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Icon from "./Icon";
import VideoControls from "./VideoControls";
import CompareSlider from "./CompareSlider";
import { applyFilter } from "./FilterEngine";
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
  specs: string[];
}

interface Props {
  creatures: Creature[];
  selectedId: string;
  mediaFile: File;
  isVideo: boolean;
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
  isVideo,
  favs,
  onBack,
  onToggleFav,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const selRef = useRef(selectedId);
  const compRef = useRef(false);

  const [processing, setProcessing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparePos, setComparePos] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shareOk, setShareOk] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];

  // Keep refs in sync
  useEffect(() => {
    selRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    compRef.current = comparing;
  }, [comparing]);

  // Load media
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile);
    setMediaSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  // Draw image
  useEffect(() => {
    if (isVideo || !mediaSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const compareCanvas = compareCanvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_W / img.width);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      // Draw original for compare
      if (compareCanvas) {
        compareCanvas.width = w;
        compareCanvas.height = h;
        compareCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      }

      setProcessing(true);
      ctx.drawImage(img, 0, 0, w, h);
      const c = creatures.find((c) => c.id === selRef.current)!;
      applyFilter(ctx, w, h, c.filterType, c.fp);
      setTimeout(() => setProcessing(false), 300);
    };
    img.src = mediaSrc;
  }, [mediaSrc, isVideo, selectedId, creatures]);

  // Re-apply filter when creature changes (image mode)
  useEffect(() => {
    if (isVideo || !mediaSrc) return;
    const canvas = canvasRef.current;
    const compareCanvas = compareCanvasRef.current;
    if (!canvas || !compareCanvas) return;
    const ctx = canvas.getContext("2d")!;
    const cmpCtx = compareCanvas.getContext("2d");
    if (!cmpCtx) return;

    setProcessing(true);
    // Redraw from compare (original)
    ctx.drawImage(compareCanvas, 0, 0);
    const c = creatures.find((c) => c.id === selectedId)!;
    applyFilter(ctx, canvas.width, canvas.height, c.filterType, c.fp);
    setTimeout(() => setProcessing(false), 300);
  }, [selectedId, isVideo, mediaSrc, creatures]);

  // Video frame loop
  useEffect(() => {
    if (!isVideo || !mediaSrc) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const compareCanvas = compareCanvasRef.current;
    if (!video || !canvas) return;

    video.src = mediaSrc;
    video.muted = true;
    video.loop = true;

    const onLoaded = () => {
      const scale = Math.min(1, MAX_W / video.videoWidth);
      const w = Math.floor(video.videoWidth * scale);
      const h = Math.floor(video.videoHeight * scale);
      canvas.width = w;
      canvas.height = h;
      if (compareCanvas) {
        compareCanvas.width = w;
        compareCanvas.height = h;
      }
      setDuration(video.duration);
    };
    video.addEventListener("loadedmetadata", onLoaded);

    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        const ctx = canvas.getContext("2d")!;
        const w = canvas.width;
        const h = canvas.height;
        ctx.drawImage(video, 0, 0, w, h);

        // Compare canvas (original)
        if (compRef.current && compareCanvas) {
          compareCanvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
        }

        const c = creatures.find((c) => c.id === selRef.current);
        if (c) applyFilter(ctx, w, h, c.filterType, c.fp);
        setCurrentTime(video.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(drawFrame);
    };
    animFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [isVideo, mediaSrc, creatures]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const share = useCallback(() => {
    const text = `🔬 Creature Vision Lab\n\n${creature.name}（${creature.en}）の視覚\n🎨 ${creature.detail}\n🧬 ${creature.bio}\n\n#CreatureVision`;
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
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 20, fontWeight: 900 }}>{creature.name}のめ</span>
            {isVideo && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#FF4444",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                🎬 LIVE
              </span>
            )}
          </div>
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
              ? { clipPath: `inset(0 ${100 - comparePos}% 0 0)` }
              : {}
          }
        />

        {comparing && (
          <canvas
            ref={compareCanvasRef}
            className="absolute top-0 left-0 block w-full"
            style={{ clipPath: `inset(0 0 0 ${comparePos}%)` }}
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

        {/* Video play button (initial) */}
        {isVideo && !playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                fontSize: 28,
              }}
            >
              ▶
            </div>
          </button>
        )}
      </div>

      {/* Video controls */}
      {isVideo && (
        <VideoControls
          playing={playing}
          muted={muted}
          currentTime={currentTime}
          duration={duration}
          accentColor={catColor?.accent ?? "#999"}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onSeek={seek}
        />
      )}

      {/* Detail panels */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Filter description */}
        <div style={{ padding: 20, borderRadius: 18, background: catColor?.bg ?? "#f5f5f5" }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>🎨 フィルター表現</div>
          <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6 }}>
            {creature.detail}
          </p>
        </div>

        {/* Biology */}
        <div
          style={{
            padding: 20,
            borderRadius: 18,
            background: "#fff",
            border: "2px solid rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900 }}>🧬 せいぶつがく</div>
          <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: "#555" }}>
            {creature.bio}
          </p>
        </div>

        {/* Specs */}
        <div
          style={{
            padding: 20,
            borderRadius: 18,
            background: "#fff",
            border: "2px solid rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900 }}>📊 スペック</div>
          <div className="mt-3 flex flex-col gap-2">
            {creature.specs.map((spec, i) => {
              const [label, value] = spec.split("：");
              return (
                <div key={i} className="flex gap-2">
                  <span style={{ fontWeight: 700, color: catColor?.accent ?? "#999", fontSize: 13 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 13, color: "#555" }}>{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hidden video element */}
      {isVideo && <video ref={videoRef} className="hidden" playsInline />}

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
