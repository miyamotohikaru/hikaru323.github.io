import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsNGWord } from "@/lib/ng-words";
import { existsInDictionary } from "@/lib/dictionary";

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

    // 存在しない言葉 → 仮の定義を返す
    return NextResponse.json({
      exists: false,
      word,
      reading: "",
      partOfSpeech: "名詞",
      definition: "突然の幸運や予期せぬ収穫によって、一時的に浮き足立ち、普段の冷静さを失った状態。または、そのような状態にある人を指す。特に、思いがけない利益を得た直後の、落ち着きのない心理状態を表す。",
      etymology: "江戸時代の商人言葉に由来するとされる。「富（とみ）」に「子（ご）」をつけた愛称形で、本来は「急に富を得た者」を意味した。転じて、宝くじや相場での思いがけない利益により、地に足がつかなくなった状態を揶揄する言葉として定着。明治期の落語にも「とみご気分」という表現が見られる。",
      examples: [
        "宝くじで十万円当たったばかりの彼は、完全にとみごになっていて、誰彼構わず奢ると言い出した。",
        "株で儲けたからといってとみごになるな、来月には元の木阿弥かもしれないぞ。",
      ],
      synonyms: "浮かれ者、成金気分、調子乗り",
      note: "やや古風な響きを持つ言葉で、現代では主に年配者が使用する。批判的なニュアンスを含むため、本人を前にしての使用は避けるべきである。",
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "辞書の検索に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
