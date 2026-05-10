import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { getWord, incrementView, updateWord } from "@/lib/in-memory-store";

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
          authorToken: data.authorToken || "",
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

// オーナーのみ編集可能
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorToken, definition, example, reading } = body;

    if (!authorToken) {
      return NextResponse.json({ error: "認証情報がありません。" }, { status: 401 });
    }

    const allowedFields: Record<string, unknown> = {};
    if (typeof definition === "string") allowedFields.definition = definition;
    if (typeof example === "string") allowedFields.examples = example ? [example] : [];
    if (typeof reading === "string") allowedFields.reading = reading;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: "更新内容がありません。" }, { status: 400 });
    }

    if (isFirebaseAvailable()) {
      const db = await getDb();
      const docRef = db.collection("words").doc(id);
      const doc = await docRef.get();

      if (!doc.exists || !doc.data()?.isVisible) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }

      if (doc.data()!.authorToken !== authorToken) {
        return NextResponse.json({ error: "この語を編集する権限がありません。" }, { status: 403 });
      }

      // kojienFormattedも更新
      const data = doc.data()!;
      const newDef = allowedFields.definition ?? data.definition;
      const newExamples = allowedFields.examples ?? data.examples;
      const newReading = allowedFields.reading ?? data.reading;
      const ex = Array.isArray(newExamples) && newExamples.length > 0 ? newExamples[0] : "";
      const lang = data.language || "ja";
      const formatted = lang === "en"
        ? `${data.word} (${data.partOfSpeech}) — ${newDef}${ex ? `. Example: "${ex}"` : ""}`
        : `${data.word}【${newReading}】（${data.partOfSpeech}）${newDef}。▽用例「${ex}」`;

      await docRef.update({ ...allowedFields, kojienFormatted: formatted });

      return NextResponse.json({ success: true });
    }

    // インメモリモード
    const doc = getWord(id);
    if (!doc || !doc.isVisible) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }
    if (doc.authorToken !== authorToken) {
      return NextResponse.json({ error: "この語を編集する権限がありません。" }, { status: 403 });
    }

    updateWord(id, allowedFields);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Word update error:", error);
    return NextResponse.json({ error: "更新に失敗しました。" }, { status: 500 });
  }
}
