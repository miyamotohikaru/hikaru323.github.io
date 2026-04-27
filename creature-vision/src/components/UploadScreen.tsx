"use client";

import { useCallback, useRef, useState } from "react";
import Icon from "./Icon";
import { CATEGORY_COLORS } from "@/styles/theme";

const MARQUEE_IDS = [
  "kosukuma","human","dog","horse","goat","chameleon","frog",
  "eagle","owl","bat","cockroach","mantis","spider","koala",
  "dolphin","shark","octopus","foureyedfish","deepsea","snake",
  "mshrimp","mole","flamingo","pigeon",
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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ animation: "fadeUp 0.6s ease-out" }}
    >
      {/* Kosukuma bounce icon */}
      <div style={{ animation: "bounce 2s ease-in-out infinite" }}>
        <Icon id="kosukuma" name="こすくまくん" cat="special" size={80} />
      </div>

      {/* Title */}
      <h1
        className="mt-6 text-center leading-tight"
        style={{
          fontSize: "clamp(24px, 5vw, 42px)",
          fontWeight: 900,
        }}
      >
        生き物の目で{" "}
        <span
          style={{
            background: "linear-gradient(90deg, #FF6B6B, #F5A623, #4CAF50, #2CB1C9, #9B6DC6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          世界を見よう
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-center" style={{ color: "#999", fontSize: 16, fontWeight: 500 }}>
        写真をアップして、24種類の生き物の目で見てみよう
      </p>

      {/* Upload area */}
      <label
        className="mt-8 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.02]"
        style={{
          width: "min(90vw, 420px)",
          height: 220,
          background: dragging ? "#f0f0ff" : "#fff",
          borderRadius: 20,
          border: `2px dashed ${dragging ? "#2CB1C9" : "rgba(0,0,0,0.12)"}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files);
        }}
      >
        <div style={{ fontSize: 48, animation: "bounce 2.5s ease-in-out infinite" }}>📸</div>
        <p className="mt-3" style={{ fontWeight: 700, fontSize: 16, color: "#2D2D2D" }}>
          写真をえらぶ
        </p>
        <p className="mt-1" style={{ fontSize: 12, color: "#aaa" }}>
          JPG, PNG, WebP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </label>

      {/* Marquee carousel */}
      <div
        className="mt-12 w-full overflow-hidden"
        style={{
          maxWidth: 700,
          maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div
          className="flex gap-4"
          style={{
            animation: "marquee 25s linear infinite",
            width: "max-content",
          }}
        >
          {[...marqueeCreatures, ...marqueeCreatures].map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="flex-shrink-0 flex flex-col items-center"
              style={{ width: 64 }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  background: CATEGORY_COLORS[c.cat]?.bg ?? "#f0f0f0",
                }}
              >
                <Icon id={c.id} name={c.name} cat={c.cat} size={32} />
              </div>
              <span
                className="mt-1 text-center truncate w-full"
                style={{ fontSize: 10, color: "#999" }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
