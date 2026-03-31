import { NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWords } from "@/lib/in-memory-store";

export async function GET() {
  try {
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        // ランダムキーを使ってランダムなドキュメントを取得
        const randomKey = db.collection("words").doc().id;
        let snapshot = await db
          .collection("words")
          .where("isVisible", "==", true)
          .where("__name__", ">=", randomKey)
          .limit(1)
          .get();

        // ヒットしない場合は逆方向で再試行
        if (snapshot.empty) {
          snapshot = await db
            .collection("words")
            .where("isVisible", "==", true)
            .where("__name__", "<", randomKey)
            .limit(1)
            .get();
        }

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          return NextResponse.json({
            id: doc.id,
            word: data.word || "",
            reading: data.reading || "",
            partOfSpeech: data.partOfSpeech || "",
            definition: data.definition || "",
            examples: data.examples || [],
            nickname: data.nickname || "",
            likes: data.likes || 0,
          });
        }
      } catch (fbError) {
        console.error("Firebase error in random:", fbError);
      }
    }

    // インメモリフォールバック
    const words = listWords({ sort: "newest", limit: 100 });
    if (words.length > 0) {
      const w = words[Math.floor(Math.random() * words.length)];
      return NextResponse.json({
        id: w.id,
        word: w.word,
        reading: w.reading,
        partOfSpeech: w.partOfSpeech,
        definition: w.definition,
        examples: w.examples || [],
        nickname: w.nickname,
        likes: w.likes || 0,
      });
    }

    return NextResponse.json({ id: null });
  } catch (error) {
    console.error("Random word error:", error);
    return NextResponse.json({ id: null });
  }
}
