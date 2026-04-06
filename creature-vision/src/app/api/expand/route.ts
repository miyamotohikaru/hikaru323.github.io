export async function POST(req: Request) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob;
    const leftPx = Number(formData.get("left"));
    const rightPx = Number(formData.get("right"));

    if (!image) {
      return new Response("No image provided", { status: 400 });
    }

    const apiForm = new FormData();
    apiForm.append("image", image);
    apiForm.append("left", String(leftPx));
    apiForm.append("right", String(rightPx));
    apiForm.append("prompt", "natural seamless extension of the scene, same lighting and style, same time of day");

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
