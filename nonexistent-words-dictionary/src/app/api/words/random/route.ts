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
          return NextResponse.json({ id: snapshot.docs[0].id });
        }
      } catch (fbError) {
        console.error("Firebase error in random:", fbError);
      }
    }

    // インメモリフォールバック
    const words = listWords({ sort: "newest", limit: 100 });
    if (words.length > 0) {
      const random = words[Math.floor(Math.random() * words.length)];
      return NextResponse.json({ id: random.id });
    }

    return NextResponse.json({ id: null });
  } catch (error) {
    console.error("Random word error:", error);
    return NextResponse.json({ id: null });
  }
}
