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

interface Props {
  creatures: { id: string; name: string; cat: string }[];
  onFile: (file: File) => void;
  // シェアリンク(/?creature=xxx)から来たとき、その生き物を強調表示する
  preselectedCreature?: { id: string; name: string; cat: string } | null;
}

export default function UploadScreen({ creatures, onFile, preselectedCreature }: Props) {
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
        height: "100dvh",
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

      {/* Hero section */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          animation: "fadeUp 0.6s ease-out",
        }}
        className="hero-section"
      >
        {/* 0. シェアから来たときの文脈バナー */}
        {preselectedCreature && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: CATEGORY_COLORS[preselectedCreature.cat]?.bg ?? "#fff",
              border: `2px solid ${INK}`,
              borderRadius: 999,
              padding: "6px 16px 6px 8px",
              marginBottom: 12,
              boxShadow: `3px 3px 0 ${INK}`,
              transform: "rotate(-1deg)",
              fontFamily: "'Zen Maru Gothic', sans-serif",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 30,
                height: 30,
                borderRadius: "50%",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <Icon
                id={preselectedCreature.id}
                name={preselectedCreature.name}
                cat={preselectedCreature.cat}
                size={24}
              />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
              「{preselectedCreature.name}の目」で見てみよう！
            </span>
          </div>
        )}

        {/* 1. Kosukuma icon */}
        <div style={{ animation: "bounce 2s ease-in-out infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kosukuma.png"
            alt="こすくまくん"
            className="kosukuma-icon"
            style={{ display: "block", objectFit: "contain" }}
          />
        </div>

        {/* 2. CREATURE VISION badge */}
        <div
          className="cv-badge"
          style={{
            background: INK,
            color: CREAM,
            fontWeight: 700,
            letterSpacing: "0.2em",
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
            marginTop: 14,
            textAlign: "center",
            fontFamily: "'Klee One', 'Zen Maru Gothic', sans-serif",
            fontWeight: 800,
            lineHeight: 1.05,
            color: INK,
          }}
        >
          <span className="title-line1" style={{ display: "block" }}>
            生き物の目で
          </span>
          <span style={{ display: "block", marginTop: 1 }}>
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
            marginTop: 10,
            textAlign: "center",
            color: "#7a6a55",
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontWeight: 500,
          }}
        >
          {preselectedCreature ? (
            <>写真をえらぶと、<br className="md:hidden" />すぐ{preselectedCreature.name}の視点に変わります</>
          ) : (
            <>写真をアップして、<br className="md:hidden" />24種類の生き物の目で見てみよう</>
          )}
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

      {/* Belt conveyor (shared: mobile & desktop) */}
      <div
        style={{
          position: "relative",
          borderTop: `1.5px dashed ${INK}`,
          borderTopColor: "rgba(42,32,24,0.25)",
          overflow: "hidden",
          zIndex: 2,
          maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        className="belt-container"
      >
        <div
          className="belt-track"
          style={{
            display: "flex",
            gap: 10,
            width: "max-content",
            animation: "belt 40s linear infinite",
          }}
        >
          {[...marqueeCreatures, ...marqueeCreatures, ...marqueeCreatures].map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="belt-item"
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  borderRadius: "50%",
                  background: CATEGORY_COLORS[c.cat]?.bg ?? "#f0f0f0",
                  border: `2px solid ${CREAM}`,
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
                className="belt-icon"
              >
                <span className="belt-icon-inner">
                  <Icon id={c.id} name={c.name} cat={c.cat} size={56} />
                </span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: INK,
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  textAlign: "center",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
                className="belt-label"
              >
                {c.id === "kosukuma" ? "こすくま" : c.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        /* ── Mobile-first (default) ── */
        .kosukuma-icon {
          width: 90px; height: 90px;
        }
        .cv-badge {
          margin-top: 6px; font-size: 9px; padding: 3px 12px;
        }
        .title-line1, .title-highlight {
          font-size: clamp(43px, 8vw, 84px);
        }
        .subcopy {
          font-size: 12px; max-width: 280px;
        }
        .upload-card {
          width: min(88vw, 420px); padding: 14px 14px;
          min-height: auto; margin-top: 14px !important;
        }
        .hero-section {
          padding: 10px 16px 8px;
        }
        .belt-container {
          height: 100px; padding-top: 18px; flex-shrink: 0;
        }
        .belt-icon {
          width: 57px; height: 57px;
        }
        .belt-item {
          width: 64px;
        }
        .belt-label {
          font-size: 8px !important;
        }
        .belt-icon-inner {
          display: flex; transform: scale(0.72); transform-origin: center;
        }

        /* ── Desktop ── 画面幅に応じて拡大し、大画面でも中央に小さくならないように */
        @media (min-width: 768px) {
          .kosukuma-icon {
            width: clamp(120px, 9vw, 180px); height: clamp(120px, 9vw, 180px);
          }
          .cv-badge {
            margin-top: clamp(16px, 1.6vw, 26px); font-size: clamp(11px, 0.9vw, 15px); padding: clamp(5px, 0.5vw, 8px) clamp(18px, 1.6vw, 28px);
          }
          .title-line1, .title-highlight {
            font-size: clamp(56px, 8.5vw, 156px);
          }
          .subcopy {
            font-size: clamp(14px, 1.3vw, 22px); max-width: none;
          }
          .upload-card {
            width: min(90vw, 660px); padding: clamp(26px, 2.4vw, 40px) clamp(32px, 3vw, 48px); margin-top: clamp(28px, 3vw, 48px) !important;
          }
          .hero-section {
            padding: clamp(40px, 5vw, 80px) 20px clamp(24px, 3vw, 48px);
          }
          .belt-container {
            height: clamp(150px, 11vw, 210px); padding-top: 16px;
          }
          .belt-icon {
            width: clamp(90px, 6vw, 120px); height: clamp(90px, 6vw, 120px);
          }
          .belt-item {
            width: clamp(104px, 7vw, 140px);
          }
          .belt-label {
            font-size: clamp(11px, 0.95vw, 15px) !important;
          }
          .belt-icon-inner {
            transform: scale(1.2);
          }
        }
        .upload-card:hover {
          transform: rotate(-1deg) translateY(-3px) !important;
          box-shadow: 7px 7px 0 #2a2018 !important;
          background: #e0e0e0 !important;
          border-color: #2a2018 !important;
        }
        .belt-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
