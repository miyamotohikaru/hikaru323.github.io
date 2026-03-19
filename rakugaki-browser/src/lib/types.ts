export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
  penType: PenType;
}

export interface Drawing {
  id: string;
  strokes: Stroke[];
  thumbnail: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type Tool = "pen" | "eraser";
export type PenType = "pen" | "marker" | "highlighter";
