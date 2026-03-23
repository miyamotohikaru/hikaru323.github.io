import { readFileSync } from "fs";
import { join } from "path";
import { BloomFilter } from "bloom-filters";

let bloomFilter: InstanceType<typeof BloomFilter> | null = null;

function getBloomFilter(): InstanceType<typeof BloomFilter> {
  if (!bloomFilter) {
    const jsonPath = join(process.cwd(), "data", "dictionary-bloom.json");
    const raw = readFileSync(jsonPath, "utf-8");
    const json = JSON.parse(raw);
    bloomFilter = BloomFilter.fromJSON(json) as InstanceType<typeof BloomFilter>;
    if (!bloomFilter) {
      throw new Error("Bloom filter のデシリアライズに失敗しました");
    }
  }
  return bloomFilter;
}

export function existsInLocalDictionary(word: string): boolean {
  const filter = getBloomFilter();
  if (filter.has(word)) return true;
  const hiragana = toHiragana(word);
  const katakana = toKatakana(word);
  if (hiragana !== word && filter.has(hiragana)) return true;
  if (katakana !== word && filter.has(katakana)) return true;
  return false;
}

export function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

export function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}
