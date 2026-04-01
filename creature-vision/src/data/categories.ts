export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: "ocean",   label: "うみ",    emoji: "🌊" },
  { id: "sky",     label: "そら",    emoji: "☀️" },
  { id: "land",    label: "りく",    emoji: "🌿" },
  { id: "reptile", label: "は虫類",  emoji: "🐸" },
  { id: "insect",  label: "むし",    emoji: "🐛" },
  { id: "special", label: "とくべつ", emoji: "🔬" },
];
