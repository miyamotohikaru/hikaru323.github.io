import type { DrawingMeta, Stroke } from "./types";

function localGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`rakugaki:${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function localSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`rakugaki:${key}`, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export async function loadSharedCanvas(): Promise<Stroke[]> {
  return localGet<Stroke[]>("canvas:shared") ?? [];
}

export async function saveToGallery(
  strokes: Stroke[],
  thumbnail: string
): Promise<void> {
  const id = crypto.randomUUID();
  const now = Date.now();

  const meta: DrawingMeta = {
    id,
    thumbnail,
    strokeCount: strokes.length,
    createdAt: now,
  };

  localSet("canvas:shared", strokes);

  const gallery = localGet<DrawingMeta[]>("gallery:recent") ?? [];
  gallery.unshift(meta);
  localSet("gallery:recent", gallery.slice(0, 100));
}

export async function getGallery(): Promise<DrawingMeta[]> {
  return localGet<DrawingMeta[]>("gallery:recent") ?? [];
}
