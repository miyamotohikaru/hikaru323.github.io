import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  console.log("=== /api/expand called ===");

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key exists:", !!apiKey);

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const expansion = Number(formData.get("expansion") || 2.0);
    const direction = (formData.get("direction") as string) || "horizontal";

    console.log("Expansion:", expansion, "Direction:", direction);

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert file to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/png";
    console.log("Image size:", arrayBuffer.byteLength, "mimeType:", mimeType);

    const fovDesc =
      expansion >= 3.0
        ? "a full 360-degree ultra-wide panoramic"
        : expansion >= 2.5
          ? "an extremely wide panoramic"
          : "a wider panoramic";

    const directionPrompt =
      direction === "vertical"
        ? "Extend this photograph VERTICALLY above and below"
        : "Extend this photograph HORIZONTALLY to the LEFT and RIGHT";

    const prompt =
      `${directionPrompt} to create ${fovDesc} view. ` +
      `The original image content must remain in the center, exactly as-is. ` +
      `Generate new scenery that naturally continues the scene. ` +
      `The final image should be ${direction === "vertical" ? "much taller than wide" : "much wider than tall"}, like a panoramic photo. ` +
      `Maintain the same lighting, style, colors, perspective, and time of day. ` +
      `The extension must be photorealistic and seamlessly blend with the original.`;

    console.log("Prompt:", prompt.substring(0, 100) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error -- responseModalities is valid but not in the type definitions
        responseModalities: ["Text", "Image"],
      },
    });

    console.log("Calling Gemini API...");
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    console.log("Gemini response parts:", parts?.length ?? 0);

    if (!parts) {
      console.error("No parts in Gemini response");
      return new Response(JSON.stringify({ error: "No response from Gemini" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find image part in response
    for (const part of parts) {
      if (part.inlineData) {
        console.log("Image part found! mimeType:", part.inlineData.mimeType, "data length:", part.inlineData.data.length);
        const imgBuffer = Buffer.from(part.inlineData.data, "base64");
        return new Response(imgBuffer, {
          headers: {
            "Content-Type": part.inlineData.mimeType || "image/png",
            "Cache-Control": "no-store",
          },
        });
      }
    }

    // No image found — log text parts for debugging
    const textParts = parts.filter((p: { text?: string }) => p.text).map((p: { text?: string }) => p.text);
    console.error("No image in Gemini response. Text parts:", textParts);

    return new Response(JSON.stringify({ error: "No image in Gemini response", textParts }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[expand API] Gemini error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
