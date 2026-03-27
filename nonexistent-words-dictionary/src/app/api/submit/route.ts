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

const SYSTEM_PROMPT = `あなたは「存在しない言葉辞典（FICTIONARY）」の編纂者です。

ユーザーが新しい造語を送ってきます（意味の説明が添えられている場合もあります）。あなたの仕事は:

1. その言葉が実在する日本語かどうか判定する
   - 辞書に載っている言葉はもちろん、日常会話、スラング、ネットミーム、
     固有名詞、業界用語、方言として実在するものも「実在する」と判定する
   - 判断に迷う場合は「実在する」側に倒す（厳格運用）

2. 実在しない場合、辞書エントリを生成する
   - 意味の説明があればそれを尊重しつつ、辞書として自然な表現に整える
   - 意味の説明がなければ、言葉の響きや字面から創造的に定義を考案する
   - 定義文は簡潔で断定的。辞書らしい乾いた文体
   - 用例は日常会話で使えそうな自然な1文

必ず以下のJSON形式で出力してください。他の文章は一切含めないでください:
{
  "exists": boolean,
  "reason": "実在する場合の理由（存在しない場合は空文字）",
  "reading": "ひらがな読み",
  "partOfSpeech": "名詞|動詞|形容詞|形容動詞|副詞|感動詞",
  "definition": "定義文",
  "example": "用例文",
  "formatted": "見出し語【読み】（品詞）定義文。▽用例「用例文」"
}`;

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
    const meaning = body.meaning?.trim();

    if (!word) {
      return NextResponse.json({ error: "言葉を入力してください。" }, { status: 400 });
    }
    if (word.length > 20) {
      return NextResponse.json({ error: "言葉は20文字以内で入力してください。" }, { status: 400 });
    }
    if (meaning && meaning.length > 200) {
      return NextResponse.json({ error: "意味は200文字以内で入力してください。" }, { status: 400 });
    }
    if (containsNGWord(word) || (meaning && containsNGWord(meaning))) {
      return NextResponse.json({ error: "不適切な表現が含まれています。" }, { status: 400 });
    }

    // Layer 1: ローカル辞書チェック（O(1)）
    const localResult = existsInLocalDictionary(word);
    if (localResult.exists) {
      return NextResponse.json({
        exists: true,
        word,
        reason: "一般的な日本語として辞書に登録されています。",
      });
    }

    // Layer 2: Claude Opus 4.6 判定
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const fallbackDef = meaning || `まだ誰にも定義されていない言葉。「${word}」という響きの中に、新しい概念が眠っている。`;

    if (!apiKey) {
      // APIキー未設定時はフォールバック（ローカル開発用）
      const reading = guessReading(word);
      const formatted = `${word}【${reading || word}】（名詞）${fallbackDef}`;
      return NextResponse.json({
        exists: false,
        word,
        kojienEntry: {
          word,
          reading: reading || word,
          partOfSpeech: "名詞",
          definition: fallbackDef,
          example: `「${word}」という言葉を聞いたとき、なぜか懐かしい気持ちになった。`,
          formatted,
        },
      });
    }

    const userContent = meaning
      ? `言葉: ${word}\n意味: ${meaning}`
      : `言葉: ${word}`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-opus-4-6-20250612",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // JSON解析失敗時のフォールバック
      const reading = guessReading(word);
      const formatted = `${word}【${reading || word}】（名詞）${fallbackDef}`;
      return NextResponse.json({
        exists: false,
        word,
        kojienEntry: {
          word,
          reading: reading || word,
          partOfSpeech: "名詞",
          definition: fallbackDef,
          example: `「${word}」という言葉を聞いたとき、なぜか懐かしい気持ちになった。`,
          formatted,
        },
      });
    }

    if (parsed.exists) {
      return NextResponse.json({
        exists: true,
        word,
        reason: parsed.reason || "実在する言葉として認識されました。",
      });
    }

    return NextResponse.json({
      exists: false,
      word,
      kojienEntry: {
        word,
        reading: parsed.reading || guessReading(word) || word,
        partOfSpeech: parsed.partOfSpeech || "名",
        definition: parsed.definition || fallbackDef,
        example: parsed.example || "",
        formatted: parsed.formatted || `${word}【${parsed.reading || word}】（${parsed.partOfSpeech || "名詞"}）${parsed.definition || fallbackDef}。`,
      },
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "申請処理に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
