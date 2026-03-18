import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue } from "@/lib/firebase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const FieldValue = await getFieldValue();
    const docRef = db.collection("words").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || !doc.data()?.isVisible) {
      return NextResponse.json({ error: "語が見つかりません。" }, { status: 404 });
    }

    // Increment view count
    await docRef.update({ viewCount: FieldValue.increment(1) });

    const data = doc.data()!;
    return NextResponse.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Word fetch error:", error);
    return NextResponse.json(
      { error: "語の取得に失敗しました。" },
      { status: 500 }
    );
  }
}
