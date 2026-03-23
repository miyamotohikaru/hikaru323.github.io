import type { DrawingData, DrawingMeta } from "./types";

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
    // silent fail
  }
}

export async function saveDrawing(drawing: DrawingData): Promise<void> {
  // Save full drawing
  await kvSet(`drawing:${drawing.id}`, drawing);

  // Update gallery list
  const gallery = (await kvGet<DrawingMeta[]>("gallery:recent")) ?? [];
  const meta: DrawingMeta = {
    id: drawing.id,
    thumbnail: drawing.thumbnail,
    title: drawing.title,
    createdAt: drawing.createdAt,
  };

  const filtered = gallery.filter((d) => d.id !== drawing.id);
  filtered.unshift(meta);
  await kvSet("gallery:recent", filtered.slice(0, 100));

  // Also save to localStorage as backup
  try {
    const local = JSON.parse(localStorage.getItem("rakugaki-my") ?? "[]");
    const localFiltered = local.filter((d: DrawingMeta) => d.id !== drawing.id);
    localFiltered.unshift(meta);
    localStorage.setItem("rakugaki-my", JSON.stringify(localFiltered.slice(0, 50)));
  } catch {
    // localStorage not available
  }
}

export async function getGallery(): Promise<DrawingMeta[]> {
  const gallery = await kvGet<DrawingMeta[]>("gallery:recent");
  return gallery ?? [];
}

export function getMyDrawings(): DrawingMeta[] {
  try {
    return JSON.parse(localStorage.getItem("rakugaki-my") ?? "[]");
  } catch {
    return [];
  }
}

export function deleteMyDrawing(id: string): void {
  try {
    const local = JSON.parse(localStorage.getItem("rakugaki-my") ?? "[]");
    localStorage.setItem(
      "rakugaki-my",
      JSON.stringify(local.filter((d: DrawingMeta) => d.id !== id))
    );
  } catch {
    // ignore
  }
}
