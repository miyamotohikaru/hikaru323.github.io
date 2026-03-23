import type { DrawingMeta, Stroke } from "./types";

const API = "/api/storage";

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    return data?.value ?? null;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    // silent
  }
}

export async function loadSharedCanvas(): Promise<Stroke[]> {
  const strokes = await kvGet<Stroke[]>("canvas:shared");
  return strokes ?? [];
}

export async function saveToGallery(
  strokes: Stroke[],
  thumbnail: string
): Promise<void> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await kvSet("canvas:shared", strokes);

  const gallery = (await kvGet<DrawingMeta[]>("gallery:recent")) ?? [];
  const meta: DrawingMeta = {
    id,
    thumbnail,
    strokeCount: strokes.length,
    createdAt: now,
  };
  gallery.unshift(meta);
  await kvSet("gallery:recent", gallery.slice(0, 100));
}

export async function getGallery(): Promise<DrawingMeta[]> {
  const gallery = await kvGet<DrawingMeta[]>("gallery:recent");
  return gallery ?? [];
}
