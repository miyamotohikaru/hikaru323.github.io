import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { getSql } from "@/lib/db";

/** シェアURLのベースを決める: 明示設定 > リクエスト元オリジン > 本番URL */
function resolveBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return "https://creature-vision.vercel.app";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const creatureId = formData.get("creatureId") as string | null;

    if (!imageFile || !creatureId) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    const shareId = nanoid(8);
    const sql = getSql();

    // Vercel Blob に画像をアップロード
    const blob = await put(`shares/${shareId}.png`, imageFile, {
      access: "public",
      contentType: "image/png",
    });

    // Neon DB にメタデータ保存
    await sql`
      INSERT INTO shares (id, creature_id, image_url)
      VALUES (${shareId}, ${creatureId}, ${blob.url})
    `;

    const shareUrl = `${resolveBaseUrl(req)}/share/${shareId}`;

    return Response.json({ shareId, shareUrl, imageUrl: blob.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[share] Error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
