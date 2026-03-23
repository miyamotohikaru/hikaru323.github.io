import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { addWord, findByWord, listWords } from "@/lib/in-memory-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkAllFieldsForNG } from "@/lib/ng-words";

const HIRAGANA_REGEX = /^[ぁ-ゖー]+$/;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: "しばらくお待ちください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const word = body.word?.trim();
    const reading = body.reading?.trim();
    const partOfSpeech = body.partOfSpeech?.trim();
    const definition = body.definition?.trim();
    const etymology = body.etymology?.trim() || "";
    const rawExamples = body.examples || [];
    const examples = rawExamples
      .map((e: string) => e?.trim())
      .filter((e: string) => e && e.length > 0);
    const synonyms = body.synonyms?.trim() || "";
    const nickname = body.nickname?.trim();
    const kojienFormatted = body.kojienFormatted?.trim() || "";
    const authorToken = body.authorToken?.trim() || "";

    // Validation
    if (!word || !reading || !partOfSpeech || !definition || !nickname) {
      return NextResponse.json(
        { error: "必須項目をすべて入力してください。" },
        { status: 400 }
      );
    }

    if (word.length > 20) {
      return NextResponse.json({ error: "言葉は20文字以内で入力してください。" }, { status: 400 });
    }
    if (reading.length > 30) {
      return NextResponse.json({ error: "読みは30文字以内で入力してください。" }, { status: 400 });
    }
    if (!HIRAGANA_REGEX.test(reading)) {
      return NextResponse.json({ error: "読みはひらがなで入力してください。" }, { status: 400 });
    }
    if (definition.length > 200) {
      return NextResponse.json({ error: "定義文は200文字以内で入力してください。" }, { status: 400 });
    }
    if (nickname.length > 15) {
      return NextResponse.json({ error: "ニックネームは15文字以内で入力してください。" }, { status: 400 });
    }
    if (etymology.length > 200) {
      return NextResponse.json({ error: "語源は200文字以内で入力してください。" }, { status: 400 });
    }
    for (const ex of examples) {
      if (ex.length > 100) {
        return NextResponse.json({ error: "例文は100文字以内で入力してください。" }, { status: 400 });
      }
    }
    if (synonyms.length > 30) {
      return NextResponse.json({ error: "類義語は30文字以内で入力してください。" }, { status: 400 });
    }

    // NG word check
    if (checkAllFieldsForNG({ word, reading, definition, etymology, synonyms, nickname, examples })) {
      return NextResponse.json({ error: "不適切な表現が含まれています。" }, { status: 400 });
    }

    // Firebase が使える場合はFirestoreに保存
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        const FieldValue = await getFieldValue();

        const existing = await db
          .collection("words")
          .where("word", "==", word)
          .limit(1)
          .get();

        if (!existing.empty) {
          const existingDoc = existing.docs[0];
          return NextResponse.json(
            { error: "この言葉はすでに掲載されています。", existingId: existingDoc.id },
            { status: 409 }
          );
        }

        const docRef = await db.collection("words").add({
          word, reading, partOfSpeech, definition, etymology,
          examples, synonyms, nickname, kojienFormatted, authorToken,
          likes: 0, viewCount: 0, isVisible: true, source: "user",
          createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, id: docRef.id });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
        // Firebase失敗 → インメモリにフォールバック
      }
    }

    // インメモリモード
    const existing = findByWord(word);
    if (existing) {
      return NextResponse.json(
        { error: "この言葉はすでに掲載されています。", existingId: existing.id },
        { status: 409 }
      );
    }

    const { id } = addWord({
      word, reading, partOfSpeech, definition, etymology,
      examples, synonyms, nickname, kojienFormatted, authorToken,
      likes: 0, viewCount: 0, isVisible: true, source: "user",
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Word submission error:", error);
    return NextResponse.json(
      { error: "投稿に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kana = searchParams.get("kana");
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const cursor = searchParams.get("cursor");

    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        let query = db.collection("words").where("isVisible", "==", true);

        if (kana) {
          const nextChar = String.fromCharCode(kana.charCodeAt(0) + 1);
          query = query.where("reading", ">=", kana).where("reading", "<", nextChar);
        }

        if (sort === "popular") {
          query = query.orderBy("likes", "desc");
        } else {
          if (!kana) {
            query = query.orderBy("createdAt", "desc");
          } else {
            query = query.orderBy("reading", "asc");
          }
        }

        query = query.limit(limit);

        if (cursor) {
          const cursorDoc = await db.collection("words").doc(cursor).get();
          if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
          }
        }

        const snapshot = await query.get();
        const words = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            kojienFormatted: data.kojienFormatted || "",
            authorToken: data.authorToken || "",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          };
        });

        return NextResponse.json({ words });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    // インメモリモード
    const words = listWords({ kana, sort, limit, cursor });
    return NextResponse.json({ words });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "辞典の閲覧に失敗しました。" },
      { status: 500 }
    );
  }
}
