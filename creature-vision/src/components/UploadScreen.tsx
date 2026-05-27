"use client";

import { useCallback, useRef, useState } from "react";
import Icon from "./Icon";
import { CATEGORY_COLORS } from "@/styles/theme";

const INK = "#2a2018";
const CREAM = "#fff8eb";

const MARQUEE_IDS = [
  "kosukuma","human","dog","horse","goat","chameleon","frog",
  "eagle","owl","bat","cockroach","mantis","spider","koala",
  "dolphin","shark","octopus","foureyedfish","deepsea","snake",
  "mshrimp","mole","flamingo","pigeon",
];

/* Desktop background sticker positions: [id, top%, left%, size, rotation] */
const STICKER_LAYOUT: [string, number, number, number, number][] = [
  ["dog",      14, 6,   60, -8],
  ["eagle",    10, 88,  54, 12],
  ["frog",     62, 4,   48, -5],
  ["shark",    50, 90,  64, 10],
  ["spider",   84, 14,  52, -12],
  ["octopus",  84, 82,  56, 7],
  ["bat",       6, 48,  50, 14],
  ["flamingo", 90, 50,  58, -3],
  ["chameleon",38, 92,  52, -10],
  ["owl",      30,  3,  56, 6],
];

interface Props {
  creatures: { id: string; name: string; cat: string }[];
  onFile: (file: File) => void;
}

export default function UploadScreen({ creatures, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (files?.[0]) onFile(files[0]);
    },
    [onFile]
  );

  const marqueeCreatures = MARQUEE_IDS.map(
    (id) => creatures.find((c) => c.id === id) ?? { id, name: id, cat: "special" }
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: CREAM,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dot texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, #e6d9b8 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Desktop background stickers */}
      <div className="hidden md:block" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        {STICKER_LAYOUT.map(([id, top, left, size, rot]) => {
          const c = creatures.find((cr) => cr.id === id);
          if (!c) return null;
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: CATEGORY_COLORS[c.cat]?.bg ?? "#f0f0f0",
                border: `3px solid ${CREAM}`,
                boxShadow: "0 6px 16px rgba(80,50,20,.12), inset 0 0 0 1px rgba(0,0,0,.04)",
                transform: `rotate(${rot}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Icon id={c.id} name={c.name} cat={c.cat} size={Math.round(size * 0.6)} />
            </div>
          );
        })}
      </div>

      {/* Hero section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          padding: "48px 20px 24px",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        {/* 1. Kosukuma icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kosukuma.png"
          alt="こすくまくん"
          width={48}
          height={48}
          style={{ display: "block", objectFit: "contain" }}
        />

        {/* 2. CREATURE VISION badge */}
        <div
          style={{
            marginTop: 16,
            background: INK,
            color: CREAM,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            padding: "5px 18px",
            borderRadius: 999,
            transform: "rotate(-2deg)",
            fontFamily: "'Zen Maru Gothic', sans-serif",
          }}
        >
          CREATURE VISION
        </div>

        {/* 3. Main title */}
        <h1
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: "'Klee One', 'Zen Maru Gothic', sans-serif",
            fontWeight: 800,
            lineHeight: 1.05,
            color: INK,
          }}
        >
          <span
            className="title-line1"
            style={{ display: "block" }}
          >
            生き物の目で
          </span>
          <span style={{ display: "block", marginTop: 4 }}>
            <span
              className="title-highlight"
              style={{
                display: "inline-block",
                background: INK,
                color: CREAM,
                padding: "0 12px",
                transform: "rotate(-1.5deg)",
                borderRadius: 4,
              }}
            >
              世界を見よう
            </span>
          </span>
        </h1>

        {/* 4. Subcopy */}
        <p
          className="subcopy"
          style={{
            marginTop: 16,
            textAlign: "center",
            color: "#7a6a55",
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontWeight: 500,
          }}
        >
          写真をアップして、<br className="md:hidden" />24種類の生き物の目で見てみよう
        </p>

        {/* 5. Upload card */}
        <label
          className="upload-card"
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: dragging ? "#f5f0e0" : "#fff",
            border: `2px solid ${INK}`,
            borderRadius: 20,
            boxShadow: `5px 5px 0 ${INK}`,
            transform: "rotate(-1deg)",
            cursor: "pointer",
            position: "relative",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files); }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "rotate(-1deg) translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = `7px 7px 0 ${INK}`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "rotate(-1deg)";
            (e.currentTarget as HTMLElement).style.boxShadow = `5px 5px 0 ${INK}`;
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: INK, fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                写真をえらぶ
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#7a6a55", marginLeft: 36, fontFamily: "'Zen Maru Gothic', sans-serif" }}>
              JPG · PNG · WebP
            </span>
          </div>
          <div
            style={{
              background: INK,
              color: CREAM,
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              fontFamily: "'Zen Maru Gothic', sans-serif",
            }}
          >
            えらぶ →
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
      </div>

      {/* Mobile belt conveyor */}
      <div
        className="md:hidden"
        style={{
          position: "relative",
          height: 80,
          borderTop: `1.5px dashed ${INK}`,
          borderTopColor: "rgba(42,32,24,0.25)",
          overflow: "hidden",
          zIndex: 2,
          maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="belt-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            height: "100%",
            width: "max-content",
            animation: "belt 40s linear infinite",
          }}
        >
          {[...marqueeCreatures, ...marqueeCreatures].map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              style={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: CATEGORY_COLORS[c.cat]?.bg ?? "#f0f0f0",
                border: `2px solid ${CREAM}`,
                boxShadow: `2px 2px 0 ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Icon id={c.id} name={c.name} cat={c.cat} size={30} />
            </div>
          ))}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .title-line1 {
          font-size: clamp(38px, 8vw, 84px);
        }
        .title-highlight {
          font-size: clamp(38px, 8vw, 84px);
        }
        .subcopy {
          font-size: 14px;
          max-width: 320px;
        }
        .upload-card {
          width: min(90vw, 420px);
          padding: 20px 24px;
        }
        @media (max-width: 767px) {
          .subcopy {
            font-size: 11px;
            max-width: 240px;
          }
          .upload-card {
            padding: 26px 20px;
            min-height: 120px;
          }
        }
        .belt-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
