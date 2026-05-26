import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

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

    const expansionDesc =
      expansion >= 2.8
        ? "extremely wide"
        : expansion >= 2.0
          ? "much wider"
          : "wider";

    const prompt =
      direction === "vertical"
        ? `Expand this image vertically by extending the scene above and below the original frame. The new vertical content should appear as ${expansionDesc} continuation of the existing scene. Maintain the exact same lighting, color palette, atmosphere, time of day, and artistic style as the original. The original image must remain centered and unmodified. Make the boundaries seamless and natural — no visible seams, no distortion. Generate realistic content that logically extends what's already there (e.g., more sky above, more ground below).`
        : `Expand this image horizontally by extending the scene to the left and right of the original frame. The new horizontal content should appear as ${expansionDesc} continuation of the existing scene. Maintain the exact same lighting, color palette, atmosphere, time of day, and artistic style as the original. The original image must remain centered and unmodified. Make the boundaries seamless and natural — no visible seams, no distortion. Generate realistic content that logically extends what's already there (e.g., more landscape on the sides).`;

    console.log("[expand] Calling Gemini...", prompt.substring(0, 80) + "...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
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
