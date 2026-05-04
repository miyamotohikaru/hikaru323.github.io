import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { addWord, findByWord, listWords } from "@/lib/in-memory-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkAllFieldsForNG } from "@/lib/ng-words";

const HIRAGANA_REGEX = /^[ぁ-ゖー]+$/;
const EN_WORD_REGEX = /^[a-zA-Z][a-zA-Z\s\-']*$/;

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
    const reading = body.reading?.trim() || "";
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
    const language = body.language === "en" ? "en" : "ja";

    // Validation — common
    if (!word || !partOfSpeech || !definition || !nickname) {
      return NextResponse.json(
        { error: language === "en" ? "Please fill in all required fields." : "必須項目をすべて入力してください。" },
        { status: 400 }
      );
    }

    if (word.length > 20) {
      return NextResponse.json({ error: language === "en" ? "Word must be 20 characters or less." : "言葉は20文字以内で入力してください。" }, { status: 400 });
    }
    if (definition.length > 200) {
      return NextResponse.json({ error: language === "en" ? "Definition must be 200 characters or less." : "定義文は200文字以内で入力してください。" }, { status: 400 });
    }
    if (nickname.length > 15) {
      return NextResponse.json({ error: language === "en" ? "Nickname must be 15 characters or less." : "ニックネームは15文字以内で入力してください。" }, { status: 400 });
    }
    if (etymology.length > 200) {
      return NextResponse.json({ error: language === "en" ? "Etymology must be 200 characters or less." : "語源は200文字以内で入力してください。" }, { status: 400 });
    }
    for (const ex of examples) {
      if (ex.length > 100) {
        return NextResponse.json({ error: language === "en" ? "Each example must be 100 characters or less." : "例文は100文字以内で入力してください。" }, { status: 400 });
      }
    }
    if (synonyms.length > 30) {
      return NextResponse.json({ error: language === "en" ? "Synonyms must be 30 characters or less." : "類義語は30文字以内で入力してください。" }, { status: 400 });
    }

    // Validation — language-specific
    if (language === "ja") {
      if (!reading) {
        return NextResponse.json({ error: "読みを入力してください。" }, { status: 400 });
      }
      if (reading.length > 30) {
        return NextResponse.json({ error: "読みは30文字以内で入力してください。" }, { status: 400 });
      }
      if (!HIRAGANA_REGEX.test(reading)) {
        return NextResponse.json({ error: "読みはひらがなで入力してください。" }, { status: 400 });
      }
    } else {
      // English: word must be alphabetic
      if (!EN_WORD_REGEX.test(word)) {
        return NextResponse.json({ error: "Word must contain only letters, hyphens, and apostrophes." }, { status: 400 });
      }
      // reading (pronunciation) is optional for English
      if (reading && reading.length > 50) {
        return NextResponse.json({ error: "Pronunciation must be 50 characters or less." }, { status: 400 });
      }
    }

    // NG word check
    if (checkAllFieldsForNG({ word, reading, definition, etymology, synonyms, nickname, examples })) {
      return NextResponse.json({ error: language === "en" ? "Inappropriate content detected." : "不適切な表現が含まれています。" }, { status: 400 });
    }

    // Firebase が使える場合はFirestoreに保存
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        const FieldValue = await getFieldValue();

        // Duplicate check: same word + same language
        const existing = await db
          .collection("words")
          .where("word", "==", word)
          .where("language", "==", language)
          .limit(1)
          .get();

        if (!existing.empty) {
          const existingDoc = existing.docs[0];
          return NextResponse.json(
            { error: language === "en" ? "This word is already registered." : "この言葉はすでに掲載されています。", existingId: existingDoc.id },
            { status: 409 }
          );
        }

        const docRef = await db.collection("words").add({
          word, reading, partOfSpeech, definition, etymology,
          examples, synonyms, nickname, kojienFormatted, authorToken,
          likes: 0, viewCount: 0, isVisible: true, source: "user",
          language,
          createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, id: docRef.id });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    // インメモリモード
    const existing = findByWord(word, language);
    if (existing) {
      return NextResponse.json(
        { error: language === "en" ? "This word is already registered." : "この言葉はすでに掲載されています。", existingId: existing.id },
        { status: 409 }
      );
    }

    const { id } = addWord({
      word, reading, partOfSpeech, definition, etymology,
      examples, synonyms, nickname, kojienFormatted, authorToken,
      likes: 0, viewCount: 0, isVisible: true, source: "user",
      language,
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
    const letter = searchParams.get("letter");
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
        let words = snapshot.docs.map((doc) => {
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
            language: data.language || "ja",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          };
        });

        // Client-side filter for letter (A-Z) since Firestore doesn't support range on word easily
        if (letter) {
          const upperLetter = letter.toUpperCase();
          words = words.filter((w) => (w.language === "en") && w.word.charAt(0).toUpperCase() === upperLetter);
        }

        return NextResponse.json({ words });
      } catch (fbError) {
        console.error("Firebase error, falling back to in-memory:", fbError);
      }
    }

    // インメモリモード
    const rawWords = listWords({ kana, letter, sort, limit, cursor });
    const words = rawWords.map(({ authorToken: _at, ...rest }) => rest);
    return NextResponse.json({ words });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "辞典の閲覧に失敗しました。" },
      { status: 500 }
    );
  }
}
