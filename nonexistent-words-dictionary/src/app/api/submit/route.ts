import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsNGWord } from "@/lib/ng-words";
import { existsInLocalDictionary } from "@/lib/dictionary";

function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function guessReading(word: string): string {
  if (/^[ぁ-ゖー]+$/.test(word)) return word;
  const converted = katakanaToHiragana(word);
  if (/^[ぁ-ゖー]+$/.test(converted)) return converted;
  return "";
}

const SYSTEM_PROMPT_JA = `あなたは「存在しない言葉辞典（FICTIONARY）」の編纂者です。

ユーザーが新しい造語を送ってきます（意味の説明が添えられている場合もあります）。あなたの仕事は:

1. その言葉が実在する日本語かどうか判定する
   - 辞書に載っている言葉はもちろん、日常会話、スラング、ネットミーム、
     固有名詞、業界用語、方言として実在するものも「実在する」と判定する
   - 判断に迷う場合は「実在する」側に倒す（厳格運用）

2. 実在する場合、その言葉の意味・由来・語源を詳しく説明する
   - reasonフィールドに100〜200文字程度で、辞書的な意味の説明、
     語源や成り立ち、使われ方の変遷などを含めて詳述する
   - 「この言葉は実在します」のような簡潔な返答はNG

3. 実在しない場合、辞書エントリを生成する
   - 意味の説明があればそれを尊重しつつ、辞書として自然な表現に整える
   - 意味の説明がなければ、言葉の響きや字面から創造的に定義を考案する
   - 定義文は100〜200文字で詳しく。語の背景や使われる場面も含める
   - 辞書らしい乾いた文体だが、詳細に記述する
   - 用例は日常会話で使えそうな自然な1文

必ず以下のJSON形式で出力してください。他の文章は一切含めないでください:
{
  "exists": boolean,
  "reason": "実在する場合: その言葉の意味・由来・語源を100-200文字で詳述。存在しない場合は空文字",
  "reading": "ひらがな読み",
  "partOfSpeech": "名詞|動詞|形容詞|形容動詞|副詞|感動詞",
  "definition": "定義文（100-200文字で詳しく）",
  "example": "用例文",
  "formatted": "見出し語【読み】（品詞）定義文。▽用例「用例文」"
}`;

const SYSTEM_PROMPT_EN = `You are the editor of "FICTIONARY" — a dictionary that only accepts words that do NOT exist.

A user will submit a coined word (possibly with a meaning explanation). Your job:

1. Determine if the word is a real English word
   - Check dictionaries, slang, colloquialisms, technical jargon, brand names, internet slang
   - When in doubt, rule that it EXISTS (strict policy)

2. If it exists, explain its meaning, origin, and etymology in detail
   - In the "reason" field, write 50-150 words covering the dictionary meaning,
     etymology, and how it's used
   - Do NOT just say "this word exists"

3. If it does NOT exist, generate a dictionary entry
   - If meaning is provided, respect it while polishing for dictionary style
   - If no meaning is provided, creatively invent a definition based on the word's sound and feel
   - Definition: 50-150 words, covering the word's nuance and context of use
   - Dry, authoritative dictionary tone but detailed
   - Example: a natural sentence using the word

Output ONLY the following JSON. No other text:
{
  "exists": boolean,
  "reason": "If exists: meaning/origin/etymology in 50-150 words. If not: empty string",
  "reading": "pronunciation guide (IPA or phonetic)",
  "partOfSpeech": "noun|verb|adjective|adverb|interjection",
  "definition": "Definition (50-150 words)",
  "example": "Example sentence",
  "formatted": "word /pronunciation/ (part of speech) — definition. Example: \\"example sentence\\""
}`;

const EXISTS_PROMPT_JA = `あなたは日本語の辞書編纂者です。
ユーザーが送ってきた日本語の言葉について、その意味・由来・語源を詳しく説明してください。

必ず以下のJSON形式で出力してください。他の文章は一切含めないでください:
{
  "reason": "その言葉の意味・由来・語源を100-200文字で詳述する"
}`;

const EXISTS_PROMPT_EN = `You are an English dictionary editor.
Explain the meaning, origin, and etymology of the word the user sends.

Output ONLY the following JSON. No other text:
{
  "reason": "Meaning, origin, and etymology in 50-150 words"
}`;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip, 9999)) {
    return NextResponse.json(
      { error: "しばらくお待ちください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const word = body.word?.trim();
    const meaning = body.meaning?.trim();
    const language = body.language === "en" ? "en" : "ja";

    if (!word) {
      return NextResponse.json({ error: language === "en" ? "Please enter a word." : "言葉を入力してください。" }, { status: 400 });
    }
    if (word.length > 20) {
      return NextResponse.json({ error: language === "en" ? "Word must be 20 characters or less." : "言葉は20文字以内で入力してください。" }, { status: 400 });
    }
    if (meaning && meaning.length > 200) {
      return NextResponse.json({ error: language === "en" ? "Meaning must be 200 characters or less." : "意味は200文字以内で入力してください。" }, { status: 400 });
    }
    if (containsNGWord(word) || (meaning && containsNGWord(meaning))) {
      return NextResponse.json({ error: language === "en" ? "Inappropriate content detected." : "不適切な表現が含まれています。" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (language === "ja") {
      return handleJapanese(word, meaning, apiKey);
    } else {
      return handleEnglish(word, meaning, apiKey);
    }
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "申請処理に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}

async function handleJapanese(word: string, meaning: string | undefined, apiKey: string | undefined) {
  const fallbackDef = meaning || `まだ誰にも定義されていない言葉。「${word}」という響きの中に、新しい概念が眠っている。`;

  // Layer 1: ローカル辞書チェック（O(1)）
  const localResult = existsInLocalDictionary(word);

  if (localResult.exists) {
    if (!apiKey) {
      return NextResponse.json({
        exists: true, word,
        reason: "一般的な日本語として辞書に登録されています。",
      });
    }
    const client = new Anthropic({ apiKey });
    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: `言葉: ${word}` }],
        system: EXISTS_PROMPT_JA,
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          exists: true, word,
          reason: parsed.reason || "一般的な日本語として辞書に登録されています。",
        });
      }
    } catch { /* fallback */ }
    return NextResponse.json({
      exists: true, word,
      reason: "一般的な日本語として辞書に登録されています。",
    });
  }

  // Layer 2: Claude判定
  if (!apiKey) {
    const reading = guessReading(word);
    const formatted = `${word}【${reading || word}】（名詞）${fallbackDef}`;
    return NextResponse.json({
      exists: false, word,
      kojienEntry: {
        word, reading: reading || word, partOfSpeech: "名詞",
        definition: fallbackDef,
        example: `「${word}」という言葉を聞いたとき、なぜか懐かしい気持ちになった。`,
        formatted,
      },
    });
  }

  const userContent = meaning ? `言葉: ${word}\n意味: ${meaning}` : `言葉: ${word}`;
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: userContent }],
    system: SYSTEM_PROMPT_JA,
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    const reading = guessReading(word);
    const formatted = `${word}【${reading || word}】（名詞）${fallbackDef}`;
    return NextResponse.json({
      exists: false, word,
      kojienEntry: {
        word, reading: reading || word, partOfSpeech: "名詞",
        definition: fallbackDef,
        example: `「${word}」という言葉を聞いたとき、なぜか懐かしい気持ちになった。`,
        formatted,
      },
    });
  }

  if (parsed.exists) {
    return NextResponse.json({
      exists: true, word,
      reason: parsed.reason || "実在する言葉として認識されました。",
    });
  }

  return NextResponse.json({
    exists: false, word,
    kojienEntry: {
      word,
      reading: parsed.reading || guessReading(word) || word,
      partOfSpeech: parsed.partOfSpeech || "名詞",
      definition: parsed.definition || fallbackDef,
      example: parsed.example || "",
      formatted: parsed.formatted || `${word}【${parsed.reading || word}】（${parsed.partOfSpeech || "名詞"}）${parsed.definition || fallbackDef}。`,
    },
  });
}

async function handleEnglish(word: string, meaning: string | undefined, apiKey: string | undefined) {
  const fallbackDef = meaning || `A word yet to be defined by anyone. Within the sound of "${word}" lies a concept waiting to be discovered.`;

  // No local dictionary check for English (Bloom filter is Japanese only)

  if (!apiKey) {
    const formatted = `${word} (noun) — ${fallbackDef}`;
    return NextResponse.json({
      exists: false, word,
      kojienEntry: {
        word, reading: "", partOfSpeech: "noun",
        definition: fallbackDef,
        example: `I've never heard the word "${word}" before, but somehow it felt familiar.`,
        formatted,
      },
    });
  }

  const userContent = meaning ? `Word: ${word}\nMeaning: ${meaning}` : `Word: ${word}`;
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: userContent }],
      system: SYSTEM_PROMPT_EN,
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      const formatted = `${word} (noun) — ${fallbackDef}`;
      return NextResponse.json({
        exists: false, word,
        kojienEntry: {
          word, reading: "", partOfSpeech: "noun",
          definition: fallbackDef,
          example: `I've never heard the word "${word}" before, but somehow it felt familiar.`,
          formatted,
        },
      });
    }

    if (parsed.exists) {
      return NextResponse.json({
        exists: true, word,
        reason: parsed.reason || "This word is recognized as an existing English word.",
      });
    }

    return NextResponse.json({
      exists: false, word,
      kojienEntry: {
        word,
        reading: parsed.reading || "",
        partOfSpeech: parsed.partOfSpeech || "noun",
        definition: parsed.definition || fallbackDef,
        example: parsed.example || "",
        formatted: parsed.formatted || `${word} (${parsed.partOfSpeech || "noun"}) — ${parsed.definition || fallbackDef}`,
      },
    });
  } catch {
    // AI call failed — return fallback
    const formatted = `${word} (noun) — ${fallbackDef}`;
    return NextResponse.json({
      exists: false, word,
      kojienEntry: {
        word, reading: "", partOfSpeech: "noun",
        definition: fallbackDef,
        example: `I've never heard the word "${word}" before, but somehow it felt familiar.`,
        formatted,
      },
    });
  }
}
