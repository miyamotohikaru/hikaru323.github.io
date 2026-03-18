import type { Drawing } from "./types";

const STORAGE_KEY = "rakugaki-drawings";

export function saveDrawing(drawing: Drawing): void {
  const drawings = getDrawings();
  const existing = drawings.findIndex((d) => d.id === drawing.id);
  if (existing >= 0) {
    drawings[existing] = drawing;
  } else {
    drawings.unshift(drawing);
  }
  // Keep max 50 drawings
  const trimmed = drawings.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getDrawings(): Drawing[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Drawing[];
  } catch {
    return [];
  }
}

export function deleteDrawing(id: string): void {
  const drawings = getDrawings().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
}
