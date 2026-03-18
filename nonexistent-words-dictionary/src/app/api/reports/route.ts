import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wordId = body.wordId?.trim();
    const reason = body.reason?.trim() || "";

    if (!wordId) {
      return NextResponse.json({ error: "wordIdが必要です。" }, { status: 400 });
    }

    const db = await getDb();
    const FieldValue = await getFieldValue();

    // Check if the word exists
    const wordDoc = await db.collection("words").doc(wordId).get();
    if (!wordDoc.exists) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }

    // Save report
    await db.collection("reports").add({
      wordId,
      reason,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Count reports for this word
    const reportsSnapshot = await db
      .collection("reports")
      .where("wordId", "==", wordId)
      .get();

    // Auto-hide if 3+ reports
    if (reportsSnapshot.size >= 3) {
      await db.collection("words").doc(wordId).update({ isVisible: false });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "通報に失敗しました。" },
      { status: 500 }
    );
  }
}
