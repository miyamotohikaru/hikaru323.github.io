import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doc = await db.collection("words").doc(id).get();
    if (!doc.exists) {
      return new Response("Not found", { status: 404 });
    }

    const data = doc.data()!;
    const word = data.word || "";
    const definition = data.definition || "";
    const defPreview = definition.length > 50 ? definition.substring(0, 50) + "…" : definition;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#141210",
            padding: "60px",
            position: "relative",
          }}
        >
          {/* Top-left logo */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "60px",
              color: "#8a7e6b",
              fontSize: "24px",
              letterSpacing: "0.1em",
            }}
          >
            存在しない言葉辞典
          </div>

          {/* Bottom-right english logo */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "60px",
              color: "#6b6256",
              fontSize: "20px",
              letterSpacing: "0.2em",
            }}
          >
            FICTIONARY
          </div>

          {/* Word */}
          <div
            style={{
              color: "#d4c5a9",
              fontSize: "72px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {word}
          </div>

          {/* Definition */}
          <div
            style={{
              color: "#8a7e6b",
              fontSize: "28px",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.6,
            }}
          >
            {defPreview}
          </div>

          {/* Decorative line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "40px",
              width: "3px",
              height: "200px",
              backgroundColor: "#2a2520",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Error generating image", { status: 500 });
  }
}
