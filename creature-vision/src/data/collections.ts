export interface Collection {
  id: string;
  emoji: string;
  title: string;
  creatureIds: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: "shock",
    emoji: "🤯",
    title: "衝撃ランキング",
    creatureIds: ["mantis-shrimp", "bat", "cavefish", "starfish", "eagle"],
  },
  {
    id: "night",
    emoji: "🌙",
    title: "夜を見る",
    creatureIds: ["owl", "cat", "gecko", "lion", "moth"],
  },
  {
    id: "uv",
    emoji: "💜",
    title: "UVの世界",
    creatureIds: ["honeybee", "butterfly", "hummingbird", "mouse", "pigeon"],
  },
  {
    id: "hunter",
    emoji: "🎯",
    title: "ハンターの目",
    creatureIds: ["eagle", "hawk", "snake", "chameleon", "dragonfly"],
  },
  {
    id: "blind",
    emoji: "🕶️",
    title: "ほぼ見えない",
    creatureIds: ["mole", "earthworm", "cavefish", "tardigrade"],
  },
  {
    id: "supercolor",
    emoji: "🌈",
    title: "超色覚",
    creatureIds: ["mantis-shrimp", "goldfish", "pigeon", "parrot"],
  },
];
