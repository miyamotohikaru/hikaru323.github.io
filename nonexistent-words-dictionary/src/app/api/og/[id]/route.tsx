import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/firebase";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = await getDb();
    const doc = await db.collection("words").doc(id).get();
    if (!doc.exists) {
      return new Response("Not found", { status: 404 });
    }

    const data = doc.data()!;
    const word = data.word || "";
    const reading = data.reading || "";
    const partOfSpeech = data.partOfSpeech || "";
    const definition = data.definition || "";
    const nickname = data.nickname || "";
    // 句読点・スペースの区切りで自然に切る
    const maxLen = 80;
    let defPreview = definition;
    if (definition.length > maxLen) {
      const cut = definition.substring(0, maxLen);
      const lastBreak = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("、"), cut.lastIndexOf(" "), cut.lastIndexOf("."));
      defPreview = (lastBreak > maxLen * 0.4 ? cut.substring(0, lastBreak + 1) : cut) + "…";
    }

    const posMap: Record<string, string> = {
      "名詞": "〘名〙", "動詞": "〘動〙", "形容詞": "〘形〙",
      "形容動詞": "〘形動〙", "副詞": "〘副〙", "感動詞": "〘感〙",
    };
    const posLabel = posMap[partOfSpeech] || `〘${partOfSpeech}〙`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            backgroundColor: "#141210",
            padding: "60px 80px",
            position: "relative",
          }}
        >
          {/* Top-left logo */}
          <div
            style={{
              color: "#6b6256",
              fontSize: "18px",
              letterSpacing: "0.15em",
              marginBottom: "40px",
            }}
          >
            存在しない言葉辞典 ── FICTIONARY
          </div>

          {/* Word heading */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                color: "#d4c5a9",
                fontSize: "56px",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {word}
            </div>
            {reading && (
              <div style={{ color: "#8a7e6b", fontSize: "24px" }}>
                【{reading}】
              </div>
            )}
          </div>

          {/* Part of speech */}
          <div style={{ color: "#6b6256", fontSize: "20px", marginBottom: "24px" }}>
            {posLabel}
          </div>

          {/* Definition */}
          <div
            style={{
              color: "#a89a80",
              fontSize: "28px",
              lineHeight: 1.7,
              maxWidth: "1000px",
            }}
          >
            {defPreview}
          </div>

          {/* Author - bottom left */}
          {nickname && (
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                left: "80px",
                color: "#5a5248",
                fontSize: "18px",
                letterSpacing: "0.1em",
              }}
            >
              ── {nickname} 編
            </div>
          )}

          {/* Decorative line - left */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "40px",
              width: "2px",
              height: "510px",
              backgroundColor: "#2a2520",
            }}
          />

          {/* Decorative line - right */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              right: "40px",
              width: "2px",
              height: "510px",
              backgroundColor: "#2a2520",
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
