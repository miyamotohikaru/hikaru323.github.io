import { db } from "@/lib/firebase";
import { Metadata } from "next";
import WordDetailClient from "./WordDetailClient";
import { WordEntry } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWord(id: string): Promise<WordEntry | null> {
  try {
    const doc = await db.collection("words").doc(id).get();
    if (!doc.exists || !doc.data()?.isVisible) return null;
    const data = doc.data()!;
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
      likes: data.likes || 0,
      viewCount: data.viewCount || 0,
      isVisible: data.isVisible ?? true,
      source: data.source || "user",
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    };
  } catch {
    return null;
  }
}

async function getRelatedWords(word: WordEntry): Promise<WordEntry[]> {
  try {
    const snapshot = await db
      .collection("words")
      .where("isVisible", "==", true)
      .where("partOfSpeech", "==", word.partOfSpeech)
      .limit(6)
      .get();

    return snapshot.docs
      .filter((doc) => doc.id !== word.id)
      .slice(0, 5)
      .map((doc) => {
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
          likes: data.likes || 0,
          viewCount: data.viewCount || 0,
          isVisible: true,
          source: data.source || "user",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        };
      });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const word = await getWord(id);
  if (!word) {
    return { title: "語が見つかりません — 存在しない言葉辞典" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fictionary.vercel.app";
  const ogImageUrl = `${baseUrl}/api/og/${id}`;

  return {
    title: `${word.word}とは - 存在しない言葉辞典`,
    description: word.definition.substring(0, 120),
    openGraph: {
      title: `${word.word}【${word.reading}】`,
      description: word.definition,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${word.word}とは - 存在しない言葉辞典`,
      description: word.definition.substring(0, 120),
      images: [ogImageUrl],
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: word.word,
        description: word.definition,
      }),
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const { id } = await params;
  const word = await getWord(id);
  const relatedWords = word ? await getRelatedWords(word) : [];

  return <WordDetailClient word={word} relatedWords={relatedWords} />;
}
