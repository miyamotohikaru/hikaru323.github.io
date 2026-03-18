import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = db.collection("words").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }

    await docRef.update({ likes: FieldValue.increment(1) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "いいねに失敗しました。" },
      { status: 500 }
    );
  }
}
