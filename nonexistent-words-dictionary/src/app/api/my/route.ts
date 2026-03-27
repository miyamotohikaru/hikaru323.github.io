import { NextRequest, NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWords } from "@/lib/in-memory-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorToken = body.authorToken?.trim() || "";
    const likedIds: string[] = body.likedIds || [];

    if (!authorToken && likedIds.length === 0) {
      return NextResponse.json({ myWords: [], likedWords: [] });
    }

    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        let myWords: Record<string, unknown>[] = [];
        let likedWords: Record<string, unknown>[] = [];

        // 自分が投稿した語（authorTokenで照合）
        if (authorToken) {
          const snapshot = await db
            .collection("words")
            .where("isVisible", "==", true)
            .where("authorToken", "==", authorToken)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

          myWords = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
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
              likes: data.likes || 0,
              viewCount: data.viewCount || 0,
              isVisible: true,
              source: data.source || "user",
              createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            };
          });
        }

        // いいねした語（IDリストで取得）
        if (likedIds.length > 0) {
          // Firestoreの in クエリは最大30件
          const chunks = [];
          for (let i = 0; i < likedIds.length; i += 30) {
            chunks.push(likedIds.slice(i, i + 30));
          }

          for (const chunk of chunks) {
            const snapshot = await db
              .collection("words")
              .where("__name__", "in", chunk)
              .get();

            for (const doc of snapshot.docs) {
              const data = doc.data();
              if (!data.isVisible) continue;
              likedWords.push({
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
                likes: data.likes || 0,
                viewCount: data.viewCount || 0,
                isVisible: true,
                source: data.source || "user",
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
              });
            }
          }
        }

        return NextResponse.json({ myWords, likedWords });
      } catch (fbError) {
        console.error("Firebase error in /api/my:", fbError);
      }
    }

    // インメモリフォールバック
    const allWords = listWords({ sort: "newest", limit: 100 });
    const myWords = authorToken
      ? allWords.filter((w) => w.authorToken === authorToken).map(({ authorToken: _at, ...rest }) => rest)
      : [];
    const likedWords = likedIds.length > 0
      ? allWords.filter((w) => likedIds.includes(w.id)).map(({ authorToken: _at, ...rest }) => rest)
      : [];

    return NextResponse.json({ myWords, likedWords });
  } catch (error) {
    console.error("My page API error:", error);
    return NextResponse.json({ myWords: [], likedWords: [] });
  }
}
