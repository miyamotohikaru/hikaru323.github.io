"use client";

import { ICONS } from "@/data/icons";
import { CATEGORY_COLORS } from "@/styles/theme";

interface IconProps {
  id: string;
  name: string;
  cat: string;
  size?: number;
}

export default function Icon({ id, name, cat, size = 60 }: IconProps) {
  const svg = ICONS[id];
  const color = CATEGORY_COLORS[cat]?.accent ?? "#999";

  if (id === "kosukuma") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/kosukuma.png"
        alt="こすくまくん"
        width={size}
        height={size}
        style={{ display: "block", objectFit: "contain" }}
      />
    );
  }

  if (svg) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: "block" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
      <circle cx="50" cy="50" r="35" fill={color} opacity=".3" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="30"
        fill={color}
        fontWeight="900"
      >
        {name[0]}
      </text>
    </svg>
  );
}
