import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kana = searchParams.get("kana");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const startAfterParam = searchParams.get("startAfter");

    let query = db
      .collection("words")
      .orderBy("reading", "asc")
      .limit(limit);

    if (kana) {
      // Filter by the first character of reading matching any character in the kana group
      // For simplicity, we filter by the first character
      const nextChar = String.fromCharCode(kana.charCodeAt(0) + 1);
      query = query.where("reading", ">=", kana).where("reading", "<", nextChar);
    }

    if (startAfterParam) {
      const startAfterDoc = await db.collection("words").doc(startAfterParam).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
    const words = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "辞典の閲覧に失敗いたしました。" },
      { status: 500 }
    );
  }
}
