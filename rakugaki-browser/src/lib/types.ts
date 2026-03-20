export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type BrushType =
  | "pen"
  | "marker"
  | "highlighter"
  | "airbrush"
  | "watercolor"
  | "crayon"
  | "pencil"
  | "calligraphy"
  | "dot"
  | "spray"
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
  title: string;
  createdAt: number;
}

export interface DrawingData {
  id: string;
  strokes: Stroke[];
  thumbnail: string;
  title: string;
  createdAt: number;
}

export const BRUSH_INFO: Record<BrushType, { label: string; icon: string }> = {
  pen: { label: "ペン", icon: "✏️" },
  marker: { label: "マーカー", icon: "🖊️" },
  highlighter: { label: "蛍光ペン", icon: "🖍️" },
  pencil: { label: "鉛筆", icon: "✎" },
  crayon: { label: "クレヨン", icon: "🖌️" },
  airbrush: { label: "エアブラシ", icon: "💨" },
  watercolor: { label: "水彩", icon: "🎨" },
  calligraphy: { label: "カリグラフィ", icon: "🪶" },
  dot: { label: "ドット", icon: "⚫" },
  spray: { label: "スプレー", icon: "🔵" },
  eraser: { label: "消しゴム", icon: "🧹" },
};
