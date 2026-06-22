import { NextRequest, NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWordsByAuthor } from "@/lib/in-memory-store";

// 自分（端末=authorToken）が登録した単語の一覧。
// 登録上限の判定・入れ替えUIで使う。他人のトークンは返さない。
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const authorToken = body.authorToken?.trim();
    if (!authorToken) {
      return NextResponse.json({ words: [] });
    }

    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        // authorToken 単一条件のみ（複合インデックス不要）。isVisible はコードで絞る
        const snap = await db
          .collection("words")
          .where("authorToken", "==", authorToken)
          .get();
        const words = snap.docs
          .filter((d) => d.data().isVisible !== false)
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              word: data.word || "",
              definition: data.definition || "",
              partOfSpeech: data.partOfSpeech || "",
              language: data.language || "ja",
              createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            };
          })
          .sort((a, b) => (a.createdAt || "") < (b.createdAt || "") ? 1 : -1);
        return NextResponse.json({ words });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    const words = listWordsByAuthor(authorToken).map((w) => ({
      id: w.id,
      word: w.word,
      definition: w.definition,
      partOfSpeech: w.partOfSpeech,
      language: w.language,
      createdAt: w.createdAt,
    }));
    return NextResponse.json({ words });
  } catch (error) {
    console.error("My words fetch error:", error);
    return NextResponse.json({ words: [] });
  }
}
