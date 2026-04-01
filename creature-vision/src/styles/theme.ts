export const COLORS = {
  bg: "#FFF9F2",
  text: "#2D2D2D",
  subtext: "#999",
  muted: "#ccc",
} as const;

export interface CategoryColors {
  bg: string;
  accent: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColors> = {
  ocean:   { bg: "#D4F1F9", accent: "#2CB1C9" },
  sky:     { bg: "#FFF0D4", accent: "#F5A623" },
  land:    { bg: "#FFE0D4", accent: "#FF6B6B" },
  reptile: { bg: "#D8F5D0", accent: "#5CBF50" },
  insect:  { bg: "#E8D8F5", accent: "#9B6DC6" },
  special: { bg: "#FFF5D0", accent: "#F5C518" },
};

export const FONT_FAMILY =
  "'Zen Maru Gothic', 'Rounded Mplus 1c', 'Hiragino Maru Gothic Pro', sans-serif";
