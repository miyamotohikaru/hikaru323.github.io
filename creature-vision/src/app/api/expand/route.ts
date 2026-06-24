import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

// 全プロンプト共通の「色を変えない」制約。
// outpaint は視野角（広げる範囲）だけを担当し、色・質感・フィルター効果には触れない。
// 色加工は後段の applyFilter（Canvas）が全部やるので、AIが色をいじると二重がけで不自然になる。
const PRESERVE_RULE = `CRITICAL: Do NOT change colors, brightness, contrast, saturation, or style. The extended area must match the original photo EXACTLY in color and tone, as if the camera simply captured a wider angle of the same scene. This is a pure field-of-view extension — only add more of the surrounding real scenery. No color grading, no filters, no stylization. Seamless, photorealistic, no visible seams, no black areas — fill the entire canvas with real scenery that continues the original.`;

// 生き物ごとの「視野角」プロンプト（広げる範囲の指示のみ・色には触れない）。{direction} は実行時に置換。
const CREATURE_FOV_PROMPTS: Record<string, string> = {
  // ━━━ 超広角パノラマ（330-350°）━━━
  horse: `Extend this photo to {direction} into an almost complete 350-degree panoramic field of view — the wide wraparound range a horse sees with eyes on the sides of its head. Add much more of the same surrounding environment, covering nearly everything except directly behind.`,
  goat: `Extend this photo to {direction} into a wide 340-degree horizontal panorama, keeping the horizon level — the wide horizontal range a goat sees. Add more of the same surrounding environment on the sides.`,
  chameleon: `Extend this photo to {direction} into a very wide 342-degree field of view. Add much more of the same surrounding environment.`,
  eagle: `Extend this photo to {direction} into a wide 340-degree field of view, as a soaring eagle surveys the landscape. Add much more of the same surrounding environment.`,
  octopus: `Extend this photo to {direction} into a wide 340-degree wraparound field of view. Add much more of the same surrounding environment.`,
  pigeon: `Extend this photo to {direction} into a wide 340-degree near-surround field of view, as a pigeon sees almost all around. Add much more of the same surrounding environment.`,
  // ━━━ 全方位（360°）━━━
  frog: `Extend this photo to {direction} into a full 360-degree surround field of view, as a frog sees with eyes on top of its head. Add much more of the same surrounding environment all around.`,
  bat: `Extend this photo to {direction} into a full 360-degree surround field of view. Add much more of the same surrounding environment all around.`,
  cockroach: `Extend this photo to {direction} into a full 360-degree all-around field of view, as an insect sees in every direction. Add much more of the same surrounding environment.`,
  spider: `Extend this photo to {direction} into a full 360-degree surround field of view, as a spider sees with eight eyes. Add much more of the same surrounding environment all around.`,
  shark: `Extend this photo to {direction} into a full 360-degree surround field of view. Add much more of the same surrounding environment all around.`,
  foureyedfish: `Extend this photo {direction} into a 360-degree split field of view — add more of the scene above (toward the sky/surface) and below (toward the ground/underwater). Add much more of the same surrounding environment vertically.`,
  mshrimp: `Extend this photo to {direction} into a full 360-degree surround field of view. Add much more of the same surrounding environment all around.`,
  // ━━━ 中広角（270-300°）━━━
  kosukuma: `Extend this photo to {direction} into a wide 270-degree field of view. Add much more of the same surrounding environment.`,
  mantis: `Extend this photo to {direction} into a wide 300-degree field of view. Add much more of the same surrounding environment.`,
  dolphin: `Extend this photo to {direction} into a wide 300-degree field of view. Add much more of the same surrounding environment.`,
  snake: `Extend this photo to {direction} into a wide 300-degree field of view. Add much more of the same surrounding environment.`,
  flamingo: `Extend this photo to {direction} into a wide 300-degree field of view. Add much more of the same surrounding environment.`,
  // ━━━ やや広角（200-250°）━━━
  dog: `Extend this photo to {direction} into a wide 250-degree field of view, as a dog sees with eyes angled to the sides. Add much more of the same surrounding environment.`,
  koala: `Extend this photo to {direction} into a moderately wide 200-degree field of view. Add more of the same surrounding environment.`,
};

const DEFAULT_FOV_PROMPT = `Extend this photo to {direction} into a wide field of view. Add much more of the same surrounding environment.`;

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
    const creatureId = (formData.get("creatureId") as string) || "";

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

    // 生き物ごとの「視野角」プロンプトを取得し、{direction} を置換
    const directionText =
      direction === "vertical" ? "above and below" : "the left and right";
    const fovPrompt = (
      CREATURE_FOV_PROMPTS[creatureId] || DEFAULT_FOV_PROMPT
    ).replace("{direction}", directionText);

    // 視野角プロンプト + 「色を変えない」共通制約 を結合（色加工は後段の applyFilter が担当）
    const prompt = `${fovPrompt}\n\n${PRESERVE_RULE}`;

    console.log(
      `[expand] creature=${creatureId || "(default)"}, direction=${direction}, expansion=${expansion}`
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
