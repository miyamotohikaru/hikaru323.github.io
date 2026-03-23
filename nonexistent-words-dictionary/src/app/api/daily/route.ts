import { NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWords } from "@/lib/in-memory-store";

export async function GET() {
  try {
    // 過去7日間でいいねが最も多い語を「今日の一語」として選出
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        const snapshot = await db
          .collection("words")
          .where("isVisible", "==", true)
          .orderBy("likes", "desc")
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          return NextResponse.json({
            word: {
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
              authorToken: data.authorToken || "",
              likes: data.likes || 0,
              viewCount: data.viewCount || 0,
              isVisible: true,
              source: data.source || "user",
              createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            },
          });
        }
      } catch (fbError) {
        console.error("Firebase error in daily:", fbError);
      }
    }

    // インメモリフォールバック
    const words = listWords({ sort: "popular", limit: 1 });
    if (words.length > 0) {
      return NextResponse.json({
        word: {
          ...words[0],
          kojienFormatted: words[0].kojienFormatted || "",
          authorToken: words[0].authorToken || "",
          source: words[0].source as "user" | "ai",
        },
      });
    }

    return NextResponse.json({ word: null });
  } catch (error) {
    console.error("Daily word error:", error);
    return NextResponse.json({ word: null });
  }
}
