import { notFound } from "next/navigation";
import { CARDS } from "@/data/cards";
import EntryDetail from "@/components/EntryDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return CARDS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = CARDS.find((c) => c.id === id);
  if (!card) return {};
  return {
    title: `${card.ja.name} (${card.ja.enName})`,
    description: card.ja.meaning,
  };
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = CARDS.find((c) => c.id === id);
  if (!card) notFound();
  return <EntryDetail card={card} />;
}
