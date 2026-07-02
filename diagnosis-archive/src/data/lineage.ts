// 診断名どうしの系譜（改名・分解・吸収・削除…）。
// 連結はすべて各カードの history / debate 本文中の言及に基づく（創作なし）。
import type { Bi } from "@/lib/meta";

export type Relation =
  | "rename" // 改名
  | "merge" // 統合
  | "split" // 分解
  | "absorb" // 吸収
  | "succeed" // 継承
  | "promote" // 昇格
  | "survive" // 存続
  | "sister" // 姉妹診断
  | "echo" // 反響
  | "compromise"; // 折衷

export const RELATION_LABELS: Record<Relation, Bi> = {
  rename: { ja: "改名", en: "renamed" },
  merge: { ja: "統合", en: "merged" },
  split: { ja: "分解", en: "split" },
  absorb: { ja: "吸収", en: "absorbed" },
  succeed: { ja: "継承", en: "succeeded" },
  promote: { ja: "昇格", en: "promoted" },
  survive: { ja: "存続", en: "survives" },
  sister: { ja: "姉妹診断", en: "sister" },
  echo: { ja: "反響", en: "echo" },
  compromise: { ja: "折衷", en: "compromise" },
};

export interface LineageNode {
  id: string;
  /** 直前ノードからこのノードへの関係 */
  rel?: Relation;
}

export interface Chain {
  key: string;
  title: Bi;
  /** linear: 一本鎖 / fan: 先頭ノードが残り全部へ分岐 */
  kind: "linear" | "fan";
  nodes: LineageNode[];
  /** 鎖の終端注記（例: 完全削除） */
  terminus?: { label: Bi };
}

export const CHAINS: Chain[] = [
  {
    key: "trauma",
    title: { ja: "トラウマの系譜", en: "Lineage of trauma" },
    kind: "linear",
    nodes: [
      { id: "DA-052" },
      { id: "DA-051", rel: "succeed" },
      { id: "DA-022", rel: "succeed" },
      { id: "DA-069", rel: "promote" },
    ],
  },
  {
    key: "hysteria",
    title: { ja: "ヒステリーの分解", en: "The splitting of hysteria" },
    kind: "fan",
    nodes: [
      { id: "DA-045" },
      { id: "DA-029", rel: "split" },
      { id: "DA-028", rel: "split" },
      { id: "DA-129", rel: "split" },
      { id: "DA-026", rel: "split" },
      { id: "DA-038", rel: "succeed" },
    ],
  },
  {
    key: "mpd",
    title: { ja: "多重人格の改名", en: "Renaming multiple personality" },
    kind: "linear",
    nodes: [{ id: "DA-055" }, { id: "DA-026", rel: "rename" }],
  },
  {
    key: "schizo",
    title: { ja: "統合失調症への改名", en: "Renaming dementia praecox" },
    kind: "linear",
    nodes: [{ id: "DA-047" }, { id: "DA-007", rel: "rename" }],
  },
  {
    key: "power",
    title: { ja: "権力と診断", en: "Diagnosis and power" },
    kind: "linear",
    nodes: [
      { id: "DA-041" },
      { id: "DA-042", rel: "sister" },
      { id: "DA-151", rel: "echo" },
    ],
  },
  {
    key: "melancholia",
    title: { ja: "うつ病への吸収", en: "Absorbed into depression" },
    kind: "fan",
    nodes: [
      { id: "DA-001" },
      { id: "DA-050", rel: "absorb" },
      { id: "DA-061", rel: "absorb" },
    ],
  },
  {
    key: "homosexuality",
    title: { ja: "同性愛の削除", en: "The deletion of homosexuality" },
    kind: "linear",
    nodes: [{ id: "DA-043" }, { id: "DA-044", rel: "compromise" }],
    terminus: { label: { ja: "1987・DSM-III-R で完全削除", en: "1987 · fully deleted in DSM-III-R" } },
  },
  {
    key: "gender",
    title: { ja: "性別違和への改名", en: "From GID to gender dysphoria" },
    kind: "linear",
    nodes: [{ id: "DA-054" }, { id: "DA-034", rel: "rename" }],
  },
  {
    key: "neurasthenia",
    title: { ja: "神経衰弱の行方", en: "Whereabouts of neurasthenia" },
    kind: "fan",
    nodes: [
      { id: "DA-046" },
      { id: "DA-089", rel: "survive" },
      { id: "DA-065", rel: "echo" },
      { id: "DA-067", rel: "echo" },
    ],
  },
  {
    key: "adhd",
    title: { ja: "ADHDへの改名", en: "Becoming ADHD" },
    kind: "linear",
    nodes: [{ id: "DA-060" }, { id: "DA-003", rel: "rename" }],
  },
  {
    key: "intellectual",
    title: { ja: "改称の連鎖", en: "A chain of renamings" },
    kind: "linear",
    nodes: [{ id: "DA-056" }, { id: "DA-004", rel: "rename" }],
  },
  {
    key: "autism",
    title: { ja: "自閉症の統合", en: "Unifying the autism spectrum" },
    kind: "linear",
    nodes: [{ id: "DA-053" }, { id: "DA-002", rel: "merge" }],
  },
  {
    key: "addiction",
    title: { ja: "行動嗜癖の拡大", en: "Expanding behavioral addiction" },
    kind: "linear",
    nodes: [{ id: "DA-063" }, { id: "DA-068", rel: "promote" }],
  },
];

/** このカードが登場する系譜を返す */
export function chainsFor(id: string): Chain[] {
  return CHAINS.filter((c) => c.nodes.some((n) => n.id === id));
}
