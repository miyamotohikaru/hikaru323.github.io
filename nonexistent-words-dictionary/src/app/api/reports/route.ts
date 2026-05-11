import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { getWord } from "@/lib/in-memory-store";

// インメモリ通報カウント（Firebase未設定時のフォールバック）
const inMemoryReports = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wordId = body.wordId?.trim();
    const reason = body.reason?.trim() || "";

    if (!wordId) {
      return NextResponse.json({ error: "wordIdが必要です。" }, { status: 400 });
    }

    if (isFirebaseAvailable()) {
      const db = await getDb();
      const FieldValue = await getFieldValue();

      const wordDoc = await db.collection("words").doc(wordId).get();
      if (!wordDoc.exists) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }

      await db.collection("reports").add({
        wordId,
        reason,
        createdAt: FieldValue.serverTimestamp(),
      });

      const reportsSnapshot = await db
        .collection("reports")
        .where("wordId", "==", wordId)
        .get();

      if (reportsSnapshot.size >= 3) {
        await db.collection("words").doc(wordId).update({ isVisible: false });
      }

      return NextResponse.json({ success: true });
    }

    // インメモリフォールバック
    const doc = getWord(wordId);
    if (!doc) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }

    const count = (inMemoryReports.get(wordId) || 0) + 1;
    inMemoryReports.set(wordId, count);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "通報に失敗しました。" },
      { status: 500 }
    );
  }
}
