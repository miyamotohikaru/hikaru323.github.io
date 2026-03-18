import { db } from "@/lib/firebase";
import { Metadata } from "next";
import WordDetailClient from "./WordDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWord(id: string) {
  try {
    const doc = await db.collection("words").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      id: doc.id,
      word: data?.word || "",
      reading: data?.reading || "",
      partOfSpeech: data?.partOfSpeech || "",
      definition: data?.definition || "",
      etymology: data?.etymology || "",
      examples: data?.examples || [],
      synonyms: data?.synonyms || "",
      notes: data?.notes || "",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const word = await getWord(id);
  if (!word) {
    return { title: "語が見つかりません — 存在しない言葉辞典" };
  }
  return {
    title: `${word.word}【${word.reading}】 — 存在しない言葉辞典`,
    description: word.definition,
    openGraph: {
      title: `${word.word}【${word.reading}】`,
      description: word.definition,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${word.word}【${word.reading}】 — 存在しない言葉辞典`,
      description: word.definition,
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const { id } = await params;
  const word = await getWord(id);

  return <WordDetailClient word={word} />;
}
