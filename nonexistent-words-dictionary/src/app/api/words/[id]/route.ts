import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { getWord, incrementView } from "@/lib/in-memory-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        const FieldValue = await getFieldValue();
        const docRef = db.collection("words").doc(id);
        const doc = await docRef.get();

        if (!doc.exists || !doc.data()?.isVisible) {
          return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
        }

        await docRef.update({ viewCount: FieldValue.increment(1) });

        const data = doc.data()!;
        return NextResponse.json({
          id: doc.id,
          word: data.word || "",
          reading: data.reading || "",
          partOfSpeech: data.partOfSpeech || "",
          definition: data.definition || "",
          etymology: data.etymology || "",
          examples: data.examples || [],
          synonyms: data.synonyms || "",
          nickname: data.nickname || "",
          kojienFormatted: data.kojienFormatted || "",
          likes: data.likes || 0,
          viewCount: data.viewCount || 0,
          isVisible: true,
          source: data.source || "user",
          language: data.language || "ja",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    // インメモリモード
    const doc = getWord(id);
    if (!doc || !doc.isVisible) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }
    incrementView(id);
    const { authorToken: _at, ...safeDoc } = doc;
    return NextResponse.json(safeDoc);
  } catch (error) {
    console.error("Word fetch error:", error);
    return NextResponse.json(
      { error: "語の取得に失敗しました。" },
      { status: 500 }
    );
  }
}
