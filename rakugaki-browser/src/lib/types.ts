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
}

export interface Drawing {
  urlKey: string;
  strokes: Stroke[];
  createdAt: number;
  updatedAt: number;
}

export type Tool = "pen" | "eraser";
