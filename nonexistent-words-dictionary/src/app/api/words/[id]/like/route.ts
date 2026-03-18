import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { likeWord } from "@/lib/in-memory-store";

export async function POST(
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

        if (!doc.exists) {
          return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
        }

        await docRef.update({ likes: FieldValue.increment(1) });
        return NextResponse.json({ success: true });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    // インメモリモード
    const likes = likeWord(id);
    if (likes === null) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }
    return NextResponse.json({ success: true, likes });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "いいねに失敗しました。" },
      { status: 500 }
    );
  }
}
