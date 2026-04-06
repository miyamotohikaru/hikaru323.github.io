export async function POST(req: Request) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob;
    const left = Number(formData.get("left") || 0);
    const right = Number(formData.get("right") || 0);
    const up = Number(formData.get("up") || 0);
    const down = Number(formData.get("down") || 0);

    if (!image) {
      return new Response("No image provided", { status: 400 });
    }

    const apiForm = new FormData();
    apiForm.append("image", image);
    if (left > 0) apiForm.append("left", String(left));
    if (right > 0) apiForm.append("right", String(right));
    if (up > 0) apiForm.append("up", String(up));
    if (down > 0) apiForm.append("down", String(down));
    apiForm.append("prompt",
      "natural seamless extension of the scene, same lighting and style"
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
      return new Response("AI expansion failed", { status: 500 });
    }

    const blob = await res.blob();
    return new Response(blob, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
}
