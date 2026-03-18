import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsNGWord } from "@/lib/ng-words";
import { existsInDictionary } from "@/lib/dictionary";

// カタカナ→ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 簡易的な読み推定（漢字が含まれない場合のみ対応）
function guessReading(word: string): string {
  // すでにひらがなのみ
  if (/^[ぁ-ゖー]+$/.test(word)) return word;
  // カタカナ→ひらがな
  const converted = katakanaToHiragana(word);
  if (/^[ぁ-ゖー]+$/.test(converted)) return converted;
  // 漢字混じり等は空で返す（フロントで入力してもらう）
  return "";
}

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

    const exists = existsInDictionary(word);

    if (exists) {
      return NextResponse.json({
        exists: true,
        word,
      });
    }

    const reading = guessReading(word);

    // 存在しない言葉 → 仮の定義を返す
    return NextResponse.json({
      exists: false,
      word,
      reading,
      partOfSpeech: "名詞",
      definition: `まだ誰にも定義されていない言葉。「${word}」という響きの中に、新しい概念が眠っている。意味はあなたが決めてください。`,
      etymology: "",
      examples: [
        `「${word}」という言葉を聞いたとき、なぜか懐かしい気持ちになった。`,
      ],
      synonyms: "",
      note: "",
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "辞書の検索に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
