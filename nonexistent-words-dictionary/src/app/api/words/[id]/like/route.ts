import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue } from "@/lib/firebase";
import { likeWord } from "@/lib/in-memory-store";

let _firebaseAvailable: boolean | null = null;
async function isFirebaseAvailable(): Promise<boolean> {
  if (_firebaseAvailable !== null) return _firebaseAvailable;
  try {
    await getDb();
    _firebaseAvailable = true;
  } catch {
    _firebaseAvailable = false;
  }
  return _firebaseAvailable;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const firebaseOk = await isFirebaseAvailable();

    if (firebaseOk) {
      const db = await getDb();
      const FieldValue = await getFieldValue();
      const docRef = db.collection("words").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }

      await docRef.update({ likes: FieldValue.increment(1) });
      return NextResponse.json({ success: true });
    } else {
      const likes = likeWord(id);
      if (likes === null) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }
      return NextResponse.json({ success: true, likes });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "いいねに失敗しました。" },
      { status: 500 }
    );
  }
}
