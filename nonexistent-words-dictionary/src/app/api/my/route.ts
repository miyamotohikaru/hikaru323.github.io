import { NextRequest, NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { listWordsByAuthor, getWord } from "@/lib/in-memory-store";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { error: "しばらくお待ちください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const authorToken: string | undefined = body.authorToken;
    const ids: string[] | undefined = body.ids;
    const type: string | undefined = body.type;

    // Liked words lookup
    if (type === "liked" && ids && ids.length > 0) {
      const limitedIds = ids.slice(0, 50);

      if (isFirebaseAvailable()) {
        try {
          const db = await getDb();
          const docs = await Promise.all(
            limitedIds.map((id) => db.collection("words").doc(id).get())
          );

          const words = docs
            .filter((doc) => doc.exists && doc.data()?.isVisible)
            .map((doc) => {
              const data = doc.data()!;
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

          return NextResponse.json({ words });
        } catch (fbError) {
          console.error("Firebase error in liked words:", fbError);
        }
      }

      const words = limitedIds
        .map((id) => getWord(id))
        .filter((w): w is NonNullable<typeof w> => w !== null && w.isVisible)
        .map(({ authorToken: _, ...rest }) => rest);

      return NextResponse.json({ words });
    }

    // Author's own words lookup
    if (authorToken) {
      if (isFirebaseAvailable()) {
        try {
          const db = await getDb();
          const snapshot = await db
            .collection("words")
            .where("authorToken", "==", authorToken)
            .where("isVisible", "==", true)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

          const words = snapshot.docs.map((doc) => {
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

          return NextResponse.json({ words });
        } catch (fbError) {
          console.error("Firebase error in my words:", fbError);
        }
      }

      const rawWords = listWordsByAuthor(authorToken);
      const words = rawWords.map(({ authorToken: _, ...rest }) => rest);
      return NextResponse.json({ words });
    }

    return NextResponse.json({ words: [] });
  } catch (error) {
    console.error("My words error:", error);
    return NextResponse.json({ words: [] });
  }
}
