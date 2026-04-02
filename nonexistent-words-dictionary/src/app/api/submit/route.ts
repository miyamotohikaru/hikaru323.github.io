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

ユーザーが言葉を送ってきます。あなたの仕事は:

1. その言葉が実在する日本語かどうか判定する
   - 辞書に載っている言葉、日常会話、スラング、ネットミーム、固有名詞、業界用語、方言として実在するものも「実在する」と判定
   - 判断に迷う場合は「実在する」側に倒す（厳格運用）

2. 実在する場合:
   - その言葉の実際の意味・由来・用法を詳しく説明する（辞書的な解説）
   - 方言の場合はどの地方で使われるかも含める

3. 実在しない場合、辞書エントリを生成する:
   - 意味の説明があればそれを尊重しつつ、辞書として自然な表現に整える
   - 意味の説明がなければ、言葉の響きや字面から創造的に定義を考案する
   - 定義文は100〜200文字程度で、辞書らしく詳しく書く。言葉の背景や使われる場面も含める
   - 用例は日常会話で使えそうな自然な1文

必ず以下のJSON形式で出力してください。他の文章は一切含めないでください:
{
  "exists": boolean,
  "reason": "実在する場合：その言葉の実際の意味・由来の詳しい説明。存在しない場合は空文字",
  "reading": "ひらがな読み",
  "partOfSpeech": "名詞|動詞|形容詞|形容動詞|副詞|感動詞|連体詞|接続詞",
  "definition": "定義文（100〜200文字で詳しく）",
  "example": "用例文",
  "formatted": "見出し語【読み】（品詞）定義文。▽用例「用例文」"
}`;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip, 15)) {
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const fallbackDef = meaning || `まだ誰にも定義されていない言葉。「${word}」という響きの中に、新しい概念が眠っている。`;

    // ローカル辞書チェック（O(1)）
    const localResult = existsInLocalDictionary(word);

    if (!apiKey) {
      // APIキー未設定時はフォールバック
      if (localResult.exists) {
        return NextResponse.json({
          exists: true,
          word,
          reason: "一般的な日本語として辞書に登録されています。",
        });
      }
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

    // Claude API判定（ローカル辞書のヒント付き）
    let userContent = meaning
      ? `言葉: ${word}\n意味: ${meaning}`
      : `言葉: ${word}`;

    if (localResult.exists) {
      userContent += `\n\nヒント: この言葉はローカル辞書で実在語として検出されました。実在する言葉として、その意味・由来を詳しく説明してください。`;
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
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
      if (localResult.exists) {
        return NextResponse.json({
          exists: true,
          word,
          reason: "一般的な日本語として辞書に登録されています。",
        });
      }
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
        partOfSpeech: parsed.partOfSpeech || "名詞",
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
