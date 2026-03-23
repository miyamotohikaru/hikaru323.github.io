import { NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWords } from "@/lib/in-memory-store";

export async function GET() {
  try {
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
              kojienFormatted: data.kojienFormatted || "",
              nickname: data.nickname || "",
              likes: data.likes || 0,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            },
          });
        }

        return NextResponse.json({ word: null });
      } catch (fbError) {
        console.error("Firebase error in daily:", fbError);
      }
    }

    // In-memory fallback: pick the word with most likes
    const words = listWords({ sort: "popular", limit: 1 });
    if (words.length > 0) {
      const w = words[0];
      return NextResponse.json({
        word: {
          id: w.id,
          word: w.word,
          reading: w.reading,
          partOfSpeech: w.partOfSpeech,
          definition: w.definition,
          kojienFormatted: w.kojienFormatted || "",
          nickname: w.nickname,
          likes: w.likes,
          createdAt: w.createdAt,
        },
      });
    }

    return NextResponse.json({ word: null });
  } catch (error) {
    console.error("Daily word error:", error);
    return NextResponse.json({ word: null });
  }
}
