import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

// マスター拡張画像のプロンプト。写真1枚につき1回だけ生成し、全生き物で使い回す。
// 元写真を中心に固定し、左右に360°ぶんのシーンを「色を変えずに」広げるだけ。
// 色・質感の加工は後段の applyFilter（Canvas）が全部やる（AIに色を触らせない）。
const MASTER_PROMPT = `Extend this photo FAR to BOTH the left and right, turning it into an ultra-wide panorama that is at least three times wider than the original.

STRICT RULES:
- Keep the ORIGINAL photo completely unchanged in the CENTER. It must occupy only the middle third of the result.
- Generate a LARGE amount of NEW scenery filling the entire left third and the entire right third. Do not just add thin borders — genuinely widen the world.
- The new scenery must be a PERFECT, continuous extension of the original: the horizon line, ground level, walls, roads, water line and objects must line up exactly and continue naturally across the seams. No mismatched horizon, no discontinuity, no doubling, no repeated copies.
- Do NOT change colors, brightness, contrast, saturation, or style. Match the original photo EXACTLY in tone.
- This is a pure field-of-view extension — as if the camera had a much wider lens capturing the same moment.
- Photorealistic and seamless: no visible seams, no borders, no frames, no black areas. Fill the entire wide canvas edge to edge with continuous real scenery.

The original stays centered and pristine; only the surroundings to the left and right are newly generated and perfectly connected to it.`;

// 縦方向（ヨツメウオ等の上下拡張）が必要な場合のフォールバック
const MASTER_PROMPT_VERTICAL = `Extend this photo vertically, adding more scene ABOVE and BELOW the original. The original photo MUST stay EXACTLY in the CENTER, unchanged. Do NOT change colors, brightness, contrast, saturation, or style — match the original tone EXACTLY. Pure field-of-view extension. Seamless, photorealistic, no seams, no black areas — fill the entire canvas with real scenery.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[expand] GEMINI_API_KEY not set");
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const direction = (formData.get("direction") as string) || "horizontal";
    const expansion = Number(formData.get("expansion") || 2.0);

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(
      `[expand] image: ${imageFile.size} bytes, direction: ${direction}, expansion: ${expansion}`
    );

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const ai = new GoogleGenAI({ apiKey });

    // マスター拡張プロンプト（写真1枚につき1回。全生き物で使い回す前提）
    const prompt = direction === "vertical" ? MASTER_PROMPT_VERTICAL : MASTER_PROMPT;

    console.log(
      `[expand] master expansion, direction=${direction}, expansion=${expansion}`
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    console.log(`[expand] Gemini returned ${parts.length} parts`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find(
      (p: any) => p.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textParts = parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join(" | ");
      console.error(`[expand] No image in response. Text: ${textParts}`);
      return new Response(
        JSON.stringify({ error: "No image in response", text: textParts }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data ?? "", "base64");
    console.log(`[expand] Returning image: ${imageBuffer.length} bytes`);

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": imagePart.inlineData.mimeType || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[expand] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
