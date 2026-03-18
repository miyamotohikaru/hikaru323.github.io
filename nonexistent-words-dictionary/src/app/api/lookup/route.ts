import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/firebase";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkRateLimit } from "@/lib/rate-limit";
import { LookupResponse } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "お手数ですが、少々お待ちください。（1分間に5回までご利用いただけます）" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const word = body.word?.trim();

    if (!word || word.length === 0) {
      return NextResponse.json(
        { error: "言葉を入力してください。" },
        { status: 400 }
      );
    }

    if (word.length > 50) {
      return NextResponse.json(
        { error: "50文字以内で入力してください。" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: word }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result: LookupResponse = JSON.parse(content.text);

    // Save to Firestore if it's a nonexistent word
    if (!result.exists) {
      const docRef = await db.collection("words").add({
        word: result.word,
        reading: result.reading,
        partOfSpeech: result.partOfSpeech,
        definition: result.definition,
        etymology: result.etymology,
        examples: result.examples,
        synonyms: result.synonyms,
        notes: result.notes,
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ...result, id: docRef.id });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "申し訳ございません。辞典の編纂に失敗いたしました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
