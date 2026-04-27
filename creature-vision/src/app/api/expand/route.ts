export async function POST(req: Request) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob;
    const left = Number(formData.get("left") || 0);
    const right = Number(formData.get("right") || 0);
    const up = Number(formData.get("up") || 0);
    const down = Number(formData.get("down") || 0);

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const apiForm = new FormData();
    apiForm.append("image", image);
    if (left > 0) apiForm.append("left", String(left));
    if (right > 0) apiForm.append("right", String(right));
    if (up > 0) apiForm.append("up", String(up));
    if (down > 0) apiForm.append("down", String(down));
    apiForm.append("output_format", "png");
    apiForm.append("prompt",
      "natural seamless extension of the scene, same lighting, style, and perspective, photorealistic"
    );

    const res = await fetch(
      "https://api.stability.ai/v2beta/stable-image/edit/outpaint",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        body: apiForm,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[expand API] Stability AI error:", res.status, errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: res.status, headers: { "Content-Type": "application/json" }
      });
    }

    const blob = await res.blob();
    return new Response(blob, {
      headers: { "Content-Type": blob.type || "image/png" },
    });
  } catch (e) {
    console.error("[expand API] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
