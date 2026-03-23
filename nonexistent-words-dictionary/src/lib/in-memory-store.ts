// Firebase未設定時のフォールバック用インメモリストア

export interface WordDoc {
  id: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string;
  nickname: string;
  likes: number;
  viewCount: number;
  isVisible: boolean;
  source: string;
  createdAt: string;
}

const words: Map<string, WordDoc> = new Map();
let counter = 0;

export function addWord(data: Omit<WordDoc, "id" | "createdAt">): { id: string } {
  counter++;
  const id = `mem_${Date.now()}_${counter}`;
  const doc: WordDoc = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  words.set(id, doc);
  return { id };
}

export function getWord(id: string): WordDoc | null {
  return words.get(id) || null;
}

export function findByWord(word: string): WordDoc | null {
  for (const doc of words.values()) {
    if (doc.word === word) return doc;
  }
  return null;
}

export function listWords(options: {
  kana?: string | null;
  sort?: string;
  limit?: number;
  cursor?: string | null;
}): WordDoc[] {
  let result = Array.from(words.values()).filter((w) => w.isVisible);

  if (options.kana) {
    const kana = options.kana;
    result = result.filter((w) => w.reading >= kana && w.reading < String.fromCharCode(kana.charCodeAt(0) + 1));
  }

  if (options.sort === "popular") {
    result.sort((a, b) => b.likes - a.likes);
  } else if (options.kana) {
    result.sort((a, b) => a.reading.localeCompare(b.reading));
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (options.cursor) {
    const idx = result.findIndex((w) => w.id === options.cursor);
    if (idx >= 0) result = result.slice(idx + 1);
  }

  return result.slice(0, options.limit || 20);
}

export function likeWord(id: string): number | null {
  const doc = words.get(id);
  if (!doc) return null;
  doc.likes++;
  return doc.likes;
}

export function incrementView(id: string): void {
  const doc = words.get(id);
  if (doc) doc.viewCount++;
}
