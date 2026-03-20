import { NextResponse } from "next/server";

// Use Vercel KV when available, fallback to in-memory for dev
let memoryStore: Record<string, unknown> = {};

async function getKV() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json(null);

  const kv = await getKV();
  if (kv) {
    try {
      const value = await kv.get(key);
      return NextResponse.json(value ? { key, value } : null);
    } catch {
      // KV not configured, fallback
    }
  }

  const value = memoryStore[key];
  return NextResponse.json(value ? { key, value } : null);
}

export async function POST(req: Request) {
  const { key, value } = await req.json();
  if (!key) return NextResponse.json(null);

  const kv = await getKV();
  if (kv) {
    try {
      await kv.set(key, value);
      return NextResponse.json({ key, value });
    } catch {
      // KV not configured, fallback
    }
  }

  memoryStore[key] = value;
  return NextResponse.json({ key, value });
}
