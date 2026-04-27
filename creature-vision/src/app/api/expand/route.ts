export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
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

    const apiForm = new FormData();
    apiForm.append("model", "gpt-image-2");
    apiForm.append("image", image);
    apiForm.append("prompt", prompt);
    apiForm.append("size", "1536x1024");
    apiForm.append("quality", "low");

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: apiForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[expand API] OpenAI error:", res.status, errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) {
      const imgBuffer = Buffer.from(b64, "base64");
      return new Response(imgBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    }

    const url = data.data?.[0]?.url;
    if (url) {
      const imgRes = await fetch(url);
      const blob = await imgRes.blob();
      return new Response(blob, {
        headers: { "Content-Type": "image/png" },
      });
    }

    return new Response(JSON.stringify({ error: "No image in response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[expand API] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
