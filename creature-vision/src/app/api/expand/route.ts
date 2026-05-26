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

    const innerRect = (formData.get("innerRect") as string) || "";

    // Outpainting prompt: the image already has the original centered with
    // mirror-filled edges. Ask Gemini to replace the extended areas naturally.
    const dirDesc =
      direction === "vertical"
        ? "above and below (vertically)"
        : "to the left and right (horizontally)";

    const prompt =
      `This image contains a photograph in its center with rough mirrored borders ${dirDesc}. ` +
      `Perform AI outpainting: replace the mirrored/repeated border areas with photorealistic scenery that naturally continues the original photograph. ` +
      `CRITICAL RULES:\n` +
      `1. The center portion of the image (the original photo) must remain COMPLETELY UNCHANGED.\n` +
      `2. Only regenerate the extended border areas to seamlessly continue the scene.\n` +
      `3. Match the lighting, colors, perspective, depth of field, and style exactly.\n` +
      `4. The result must look like a single natural photograph, not a collage.\n` +
      `5. Output the FULL image at the same resolution as the input (including both the original center and the new extensions).\n` +
      `6. The final image aspect ratio must match the input exactly.`;

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
