import { NextRequest, NextResponse } from "next/server";
import { getDb, getFieldValue, isFirebaseAvailable } from "@/lib/firebase";
import { addWord, findByWord, listWords, listWordsByAuthor } from "@/lib/in-memory-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkAllFieldsForNG } from "@/lib/ng-words";

const HIRAGANA_REGEX = /^[ぁ-ゖー]+$/;
const EN_WORD_REGEX = /^[a-zA-Z][a-zA-Z\s\-']*$/;

// 1人(端末=authorToken)あたりの登録上限
const REGISTER_LIMIT = 5;

// 一覧APIのキャッシュ方針。recommend は毎回ランダムにシャッフルするためキャッシュ不可。
// それ以外(newest/popular/索引)はCDNで短時間キャッシュし、Firestore読取とレイテンシを削減。
function cacheHeaders(sort: string): Record<string, string> {
  if (sort === "recommend") return { "Cache-Control": "no-store" };
  return { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
}

interface RankableWord {
  likes?: number;
  viewCount?: number;
  createdAt?: string | null;
}

// 「おすすめ」用スコア: 新しさのわりに反応がある＝伸びている単語を上位に。
// さらに毎回のリクエストごとにランダム要素で並びが変わる（Xの For You 風の発掘枠）。
function rankRecommend<T extends RankableWord>(words: T[]): T[] {
  const now = Date.now();
  return words
    .map((w) => {
      const created = w.createdAt
        ? new Date(w.createdAt).getTime()
        : now - 1000 * 60 * 60 * 24 * 30; // 不明は30日前扱い
      const ageHours = Math.max(2, (now - created) / (1000 * 60 * 60));
      // 反応量（いいねを重め）。0でも埋もれないよう +1 のスムージング
      const engagement = (w.likes || 0) * 3 + (w.viewCount || 0) + 1;
      // 勢い＝反応量 ÷ 経過時間^0.7（新しくて反応があるほど高い）
      const velocity = engagement / Math.pow(ageHours, 0.7);
      // 0.5〜1.5 のランダム係数で毎回少しシャッフル
      const score = velocity * (0.5 + Math.random());
      return { w, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.w);
}

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
    // 詳しい定義も登録できるよう上限を緩める（日英共通）
    const defLimit = 600;
    if (definition.length > defLimit) {
      return NextResponse.json({ error: language === "en" ? `Definition must be ${defLimit} characters or less.` : `定義文は${defLimit}文字以内で入力してください。` }, { status: 400 });
    }
    if (nickname.length > 15) {
      return NextResponse.json({ error: language === "en" ? "Nickname must be 15 characters or less." : "ニックネームは15文字以内で入力してください。" }, { status: 400 });
    }
    const etyLimit = 300;
    if (etymology.length > etyLimit) {
      return NextResponse.json({ error: language === "en" ? `Etymology must be ${etyLimit} characters or less.` : `語源は${etyLimit}文字以内で入力してください。` }, { status: 400 });
    }
    const exLimit = 200;
    for (const ex of examples) {
      if (ex.length > exLimit) {
        return NextResponse.json({ error: language === "en" ? `Each example must be ${exLimit} characters or less.` : `例文は${exLimit}文字以内で入力してください。` }, { status: 400 });
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

        // 1人(端末=authorToken)あたり5単語まで
        if (authorToken) {
          const mineSnap = await db
            .collection("words")
            .where("authorToken", "==", authorToken)
            .get();
          const myCount = mineSnap.docs.filter(
            (d) => d.data().isVisible !== false
          ).length;
          if (myCount >= REGISTER_LIMIT) {
            return NextResponse.json(
              {
                error:
                  language === "en"
                    ? `You can register up to ${REGISTER_LIMIT} words. Please delete one of your existing words.`
                    : `登録できるのは1人${REGISTER_LIMIT}単語までです。既存の言葉をどれか削除してください。`,
                limitReached: true,
                count: myCount,
              },
              { status: 403 }
            );
          }
        }

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
        // Firebaseが構成済み（＝本番）なのに書き込み失敗＝無料枠超過や一時障害。
        // ここでインメモリに落とすと「成功したのに保存されず消える」誤解を生むため、
        // 正直に混雑エラーを返す（クライアントは error.busy を表示）。
        console.error("Firebase write error:", fbError);
        return NextResponse.json(
          {
            error:
              language === "en"
                ? "We're experiencing heavy traffic. Please try again in a moment."
                : "いま混み合っています。少し待ってからもう一度お試しください。",
            busy: true,
          },
          { status: 503 }
        );
      }
    }

    // インメモリモード（Firebase未構成のローカル開発用）
    // 1人(端末=authorToken)あたり5単語まで
    if (authorToken && listWordsByAuthor(authorToken).length >= REGISTER_LIMIT) {
      return NextResponse.json(
        {
          error:
            language === "en"
              ? `You can register up to ${REGISTER_LIMIT} words. Please delete one of your existing words.`
              : `登録できるのは1人${REGISTER_LIMIT}単語までです。既存の言葉をどれか削除してください。`,
          limitReached: true,
          count: listWordsByAuthor(authorToken).length,
        },
        { status: 403 }
      );
    }

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
        const upperLetter = letter ? letter.toUpperCase() : null;
        let query;

        if (upperLetter) {
          // letter(英字頭文字)指定時は word の範囲クエリで母集団から確実に絞る。
          // 旧実装は .limit() 後にクライアント側 filter していたため、母集団に該当英単語が
          // 無いと0件になる取りこぼしがあった。word は単一フィールドindexで range+orderBy が
          // 完結するため複合indexは不要（isVisible は後段でフィルタ）。
          const nextL = String.fromCharCode(upperLetter.charCodeAt(0) + 1);
          query = db
            .collection("words")
            .where("word", ">=", upperLetter)
            .where("word", "<", nextL)
            .orderBy("word", "asc");
        } else {
          query = db.collection("words").where("isVisible", "==", true);
          if (kana) {
            const nextChar = String.fromCharCode(kana.charCodeAt(0) + 1);
            query = query.where("reading", ">=", kana).where("reading", "<", nextChar);
          }
          if (sort === "popular") {
            query = query.orderBy("likes", "desc");
          } else if (!kana) {
            // recommend も新しめの候補を母集団にするため createdAt 降順
            query = query.orderBy("createdAt", "desc");
          } else {
            query = query.orderBy("reading", "asc");
          }
        }

        // 「おすすめ」は広めの母集団(150件)を取ってからスコアで上位を選ぶ
        const fetchLimit = sort === "recommend" ? Math.max(150, limit) : limit;
        query = query.limit(upperLetter ? Math.max(fetchLimit, 200) : fetchLimit);

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
            isVisible: data.isVisible !== false,
            source: data.source || "user",
            language: data.language || "ja",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          };
        });

        // letter分岐ではクエリに含めなかった可視判定・英語限定を後段で適用
        if (upperLetter) {
          words = words
            .filter((w) => w.isVisible && w.language === "en" && w.word.charAt(0).toUpperCase() === upperLetter)
            .slice(0, limit);
        }

        // 「おすすめ」: 勢いスコア＋ランダムで上位 limit 件に絞る
        if (sort === "recommend") {
          words = rankRecommend(words).slice(0, limit);
        }

        return NextResponse.json({ words }, { headers: cacheHeaders(sort) });
      } catch (fbError) {
        // Firebaseが構成済み（＝本番）なのに読み取り失敗＝無料枠超過や一時障害。
        // 空配列をインメモリから返すと「本棚が空」がエッジに60秒キャッシュされ全員に波及するため、
        // 混雑エラー(503)をキャッシュ無しで返す（クライアントは error.busy を表示）。
        console.error("Firebase read error:", fbError);
        return NextResponse.json(
          { error: "busy", busy: true },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    // インメモリモード（Firebase未構成のローカル開発用）
    if (sort === "recommend") {
      // kana/letter 指定時はそれを尊重して母集団を絞る（Firebase版と契約を揃える）
      const pool = listWords({ kana, letter, sort: "newest", limit: 150 });
      const ranked = rankRecommend(pool).slice(0, limit);
      const words = ranked.map(({ authorToken: _at, ...rest }) => rest);
      return NextResponse.json({ words }, { headers: cacheHeaders(sort) });
    }
    const rawWords = listWords({ kana, letter, sort, limit, cursor });
    const words = rawWords.map(({ authorToken: _at, ...rest }) => rest);
    return NextResponse.json({ words }, { headers: cacheHeaders(sort) });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "辞典の閲覧に失敗しました。" },
      { status: 500 }
    );
  }
}
