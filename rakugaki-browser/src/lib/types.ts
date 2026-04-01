export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type BrushType =
  | "pen"
  | "ballpoint"
  | "marker"
  | "highlighter"
  | "crayon"
  | "fude"
  | "calligraphy"
  | "watercolor"
  | "airbrush"
  | "charcoal"
  | "eraser";

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  brush: BrushType;
  timestamp: number;
}

export interface DrawingMeta {
  id: string;
  thumbnail: string;
  strokeCount: number;
  createdAt: number;
}

export const BRUSH_LIST: { type: BrushType; label: string }[] = [
  { type: "pen", label: "ペン" },
  { type: "ballpoint", label: "ボールペン" },
  { type: "marker", label: "マーカー" },
  { type: "highlighter", label: "蛍光ペン" },
  { type: "crayon", label: "クレヨン" },
  { type: "fude", label: "筆" },
  { type: "calligraphy", label: "カリグラフィ" },
  { type: "watercolor", label: "水彩" },
  { type: "airbrush", label: "エアブラシ" },
  { type: "charcoal", label: "木炭" },
  { type: "eraser", label: "消しゴム" },
];

export const PALETTE_COLORS = [
  "#1a1a1a", "#e8626e", "#e8844a", "#f0c75e",
  "#4ec9a0", "#5bb5d6", "#7c8ce8", "#c084e8",
  "#e888b0", "#8b6b52", "#d4c9b8", "#ffffff",
];
