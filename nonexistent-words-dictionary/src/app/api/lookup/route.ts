import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsNGWord } from "@/lib/ng-words";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip, 3)) {
    return NextResponse.json(
      { error: "しばらくお待ちください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const word = body.word?.trim();

    if (!word) {
      return NextResponse.json({ error: "言葉を入力してください。" }, { status: 400 });
    }

    if (word.length > 20) {
      return NextResponse.json({ error: "20文字以内で入力してください。" }, { status: 400 });
    }

    if (containsNGWord(word)) {
      return NextResponse.json({ error: "不適切な表現が含まれています。" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `あなたは日本語辞書の判定AIです。以下の言葉が「実在する日本語の単語・慣用句・一般的に使われている言葉」かどうか判定してください。

判定の言葉: 「${word}」

## ルール
- 辞書に載っているレベルの一般的な日本語、慣用句、外来語（カタカナ語含む）、スラングとして広く認知されているものは「実在する」と判定
- 造語、存在しない組み合わせ、意味不明な文字列は「存在しない」と判定
- 固有名詞（人名、地名、商品名）は「実在する」と判定
- 迷ったら「実在する」寄りで判定（存在しない言葉辞典なので、誤って実在する言葉を通すより、造語を弾く方がまし）

## 回答フォーマット（必ずJSON）

実在する場合:
{
  "exists": true,
  "word": "入力された言葉",
  "reading": "ひらがなの読み",
  "partOfSpeech": "品詞",
  "definition": "正式な辞書的定義（簡潔に）",
  "note": "一言コメント（丁重にお断りする感じで、ユーモアを添えて）"
}

存在しない場合:
{
  "exists": false,
  "word": "入力された言葉",
  "reading": "想定されるひらがなの読み",
  "partOfSpeech": "最もふさわしい品詞",
  "definition": "この造語にふさわしい創造的で辞書的な定義文（50-150文字程度）",
  "etymology": "もっともらしい語源解説（ユーモアと知性を兼ね備えた文体で）",
  "examples": ["自然な例文1", "自然な例文2"],
  "synonyms": "類義語（あれば。造語でもOK）"
}

JSONのみ出力してください。説明文は不要です。`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "判定に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "辞書の検索に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
