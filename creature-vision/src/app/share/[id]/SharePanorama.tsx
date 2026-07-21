"use client";

import { useState } from "react";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { FOV_DATA } from "@/components/FilterEngine";

interface Props {
  creatureUrl: string; // フィルター済みマスター（生き物のめ）
  humanUrl: string; // 元色マスター（人間のめ）
  creatureId: string;
  creatureName: string;
  photoAspect: number; // 覗き窓の比率（元写真）
  accent?: string;
}

/**
 * シェアページのパノラマ表示。本編と同じスクロールで見回すパノラマ＋
 * 「押している間だけ人間の目」ボタン。
 */
export default function SharePanorama({
  creatureUrl,
  humanUrl,
  creatureId,
  creatureName,
  photoAspect,
  accent = "#999",
}: Props) {
  const [showHuman, setShowHuman] = useState(false);
  const fov = FOV_DATA[creatureId]?.fov ?? 340;

  return (
    <div>
      <PanoramaViewer
        imageUrl={showHuman ? humanUrl : creatureUrl}
        fov={showHuman ? 120 : fov}
        photoAspect={photoAspect || 1}
        frozen={showHuman}
        label={showHuman ? "👁 人間のめ" : `${creatureName}のめ`}
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <button
          onPointerDown={(e) => {
            setShowHuman(true);
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* best effort */ }
          }}
          onPointerUp={() => setShowHuman(false)}
          onPointerCancel={() => setShowHuman(false)}
          onLostPointerCapture={() => setShowHuman(false)}
          style={{
            padding: "10px 20px", borderRadius: 100, border: "none",
            background: showHuman ? accent : "#2D2D2D",
            color: "#fff", fontWeight: 900, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            touchAction: "none", userSelect: "none",
          }}
        >
          {showHuman ? "👁 人間のめ（はなすと戻る）" : "👆 押している間だけ人間の目"}
        </button>
      </div>
    </div>
  );
}
