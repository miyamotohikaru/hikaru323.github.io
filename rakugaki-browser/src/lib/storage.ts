import type { DrawingMeta, Stroke } from "./types";

const API = "/api/storage";

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
  // Try localStorage first (always available), then server
  const local = localGet<Stroke[]>("canvas:shared");
  if (local && local.length > 0) return local;

  const server = await kvGet<Stroke[]>("canvas:shared");
  return server ?? [];
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

  // Save shared canvas to both localStorage and server
  localSet("canvas:shared", strokes);
  kvSet("canvas:shared", strokes); // fire and forget

  // Update gallery in localStorage (primary)
  const gallery = localGet<DrawingMeta[]>("gallery:recent") ?? [];
  gallery.unshift(meta);
  const trimmed = gallery.slice(0, 100);
  localSet("gallery:recent", trimmed);

  // Also update server (fire and forget)
  kvSet("gallery:recent", trimmed);
}

export async function getGallery(): Promise<DrawingMeta[]> {
  // Try localStorage first
  const local = localGet<DrawingMeta[]>("gallery:recent");
  if (local && local.length > 0) return local;

  // Fallback to server
  const server = await kvGet<DrawingMeta[]>("gallery:recent");
  return server ?? [];
}
