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
    // image = OGP用の合成画像（左右並び）。SNSカードに使う。
    const imageFile = formData.get("image") as File | null;
    // creature/human = 長押し切り替え用の個別画像（任意・後方互換のため無くても可）
    const creatureFile = formData.get("creatureImage") as File | null;
    const humanFile = formData.get("humanImage") as File | null;
    const creatureId = formData.get("creatureId") as string | null;

    if (!imageFile || !creatureId) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    const shareId = nanoid(8);
    const sql = getSql();

    // Vercel Blob に並列アップロード
    const [composite, creatureBlob, humanBlob] = await Promise.all([
      put(`shares/${shareId}.png`, imageFile, {
        access: "public",
        contentType: "image/png",
      }),
      creatureFile
        ? put(`shares/${shareId}-creature.png`, creatureFile, {
            access: "public",
            contentType: "image/png",
          })
        : Promise.resolve(null),
      humanFile
        ? put(`shares/${shareId}-human.png`, humanFile, {
            access: "public",
            contentType: "image/png",
          })
        : Promise.resolve(null),
    ]);

    // 長押し切り替え用カラムを後付けマイグレーション（既存テーブルでも安全）
    await sql`ALTER TABLE shares ADD COLUMN IF NOT EXISTS creature_url TEXT`;
    await sql`ALTER TABLE shares ADD COLUMN IF NOT EXISTS human_url TEXT`;

    // Neon DB にメタデータ保存
    await sql`
      INSERT INTO shares (id, creature_id, image_url, creature_url, human_url)
      VALUES (${shareId}, ${creatureId}, ${composite.url}, ${creatureBlob?.url ?? null}, ${humanBlob?.url ?? null})
    `;

    const shareUrl = `${resolveBaseUrl(req)}/share/${shareId}`;

    return Response.json({ shareId, shareUrl, imageUrl: composite.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[share] Error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
