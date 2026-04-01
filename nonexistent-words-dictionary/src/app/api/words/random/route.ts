import { NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWords } from "@/lib/in-memory-store";

export async function GET() {
  try {
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();

        // 総語数を取得
        const countSnapshot = await db
          .collection("words")
          .where("isVisible", "==", true)
          .count()
          .get();
        const totalCount = countSnapshot.data().count || 0;

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

          // この語が何番目に登録されたかを取得
          const createdAt = data.createdAt;
          let wordNumber = 1;
          if (createdAt) {
            const olderSnapshot = await db
              .collection("words")
              .where("isVisible", "==", true)
              .where("createdAt", "<", createdAt)
              .count()
              .get();
            wordNumber = (olderSnapshot.data().count || 0) + 1;
          }

          return NextResponse.json({
            id: doc.id,
            word: data.word || "",
            reading: data.reading || "",
            partOfSpeech: data.partOfSpeech || "",
            definition: data.definition || "",
            examples: data.examples || [],
            nickname: data.nickname || "",
            likes: data.likes || 0,
            wordNumber,
            totalCount,
          });
        }
      } catch (fbError) {
        console.error("Firebase error in random:", fbError);
      }
    }

    // インメモリフォールバック
    const allWords = listWords({ sort: "newest", limit: 1000 });
    if (allWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      const w = allWords[randomIndex];
      // newest順なので逆順で番号を出す
      const wordNumber = allWords.length - randomIndex;
      return NextResponse.json({
        id: w.id,
        word: w.word,
        reading: w.reading,
        partOfSpeech: w.partOfSpeech,
        definition: w.definition,
        examples: w.examples || [],
        nickname: w.nickname,
        likes: w.likes || 0,
        wordNumber,
        totalCount: allWords.length,
      });
    }

    return NextResponse.json({ id: null });
  } catch (error) {
    console.error("Random word error:", error);
    return NextResponse.json({ id: null });
  }
}
