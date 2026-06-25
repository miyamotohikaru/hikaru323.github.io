"use client";

import { useState } from "react";

interface Props {
  creatureUrl: string;
  humanUrl: string;
  creatureName: string;
  accent?: string;
}

/**
 * シェアページの比較ビュー。メイン画面と同じ「長押しで人間のめ」操作。
 * 通常は生き物のめを表示し、押している間だけ人間のめを重ねて表示する。
 */
export default function ShareCompare({
  creatureUrl,
  humanUrl,
  creatureName,
  accent = "#999",
}: Props) {
  const [isHolding, setIsHolding] = useState(false);

  return (
    <div>
      <div
        className="share-compare"
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "pointer",
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
        {/* 生き物のめ（ベース） */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creatureUrl}
          alt={`${creatureName}の視点`}
          draggable={false}
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* 人間のめ（長押し中だけ表示） */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={humanUrl}
          alt="人間の視点"
          draggable={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isHolding ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* ラベル */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 16px",
            borderRadius: 100,
            background: isHolding ? "rgba(255,255,255,0.9)" : `${accent}ee`,
            color: isHolding ? "#333" : "#fff",
            fontSize: 12,
            fontWeight: 900,
            transition: "all 0.3s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {isHolding ? "👁 人間のめ" : `${creatureName}のめ`}
        </div>
      </div>

      <p
        className="mt-2"
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 12,
          color: "#bbb",
          fontWeight: 700,
        }}
      >
        👆 長押しで人間の目で見る
      </p>
    </div>
  );
}
