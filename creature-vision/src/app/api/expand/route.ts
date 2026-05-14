import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
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

    const fovDesc =
      expansion >= 3.0
        ? "a full 360-degree panoramic"
        : expansion >= 2.5
          ? "an extremely wide panoramic"
          : "a wider panoramic";

    const prompt =
      `Extend this photograph to show ${fovDesc} field of view. ` +
      `Keep the original scene content recognizable in the center and naturally extend ` +
      `the surroundings in all directions. Maintain the same lighting, style, colors, ` +
      `and time of day. The extension should be photorealistic and seamless.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error -- responseModalities is valid but not in the type definitions
        responseModalities: ["Text", "Image"],
      },
    });

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

    if (!parts) {
      return new Response(JSON.stringify({ error: "No response from Gemini" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find image part in response
    for (const part of parts) {
      if (part.inlineData) {
        const imgBuffer = Buffer.from(part.inlineData.data, "base64");
        return new Response(imgBuffer, {
          headers: {
            "Content-Type": part.inlineData.mimeType || "image/png",
            "Cache-Control": "no-store",
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: "No image in Gemini response" }), {
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
