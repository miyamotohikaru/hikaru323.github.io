import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue } from "@/lib/firebase";
import { getWord, incrementView } from "@/lib/in-memory-store";

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

export async function GET(
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

      if (!doc.exists || !doc.data()?.isVisible) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }

      await docRef.update({ viewCount: FieldValue.increment(1) });

      const data = doc.data()!;
      return NextResponse.json({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      });
    } else {
      const doc = getWord(id);
      if (!doc || !doc.isVisible) {
        return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
      }
      incrementView(id);
      return NextResponse.json(doc);
    }
  } catch (error) {
    console.error("Word fetch error:", error);
    return NextResponse.json(
      { error: "語の取得に失敗しました。" },
      { status: 500 }
    );
  }
}
