import { notFound } from "next/navigation";
import { CREATURES } from "@/data/creatures";
import { Metadata } from "next";
import Link from "next/link";
import { getSql } from "@/lib/db";

// DBアクセスがあるため毎リクエスト動的に評価する
export const dynamic = "force-dynamic";

interface Share {
  id: string;
  creature_id: string;
  image_url: string;
  original_url: string | null;
  created_at: string;
  view_count: number;
}

async function getShare(id: string): Promise<Share | null> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM shares WHERE id = ${id} LIMIT 1`) as Share[];
  if (rows.length === 0) return null;
  await sql`UPDATE shares SET view_count = view_count + 1 WHERE id = ${id}`;
  return rows[0];
}

// OGP動的生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id);
  if (!share) return { title: "シェアが見つかりません" };

  const creature = CREATURES.find((c) => c.id === share.creature_id);
  const title = `${creature?.name || "生き物"}の目で見た世界`;
  const description = `同じ写真なのに、${creature?.name}にはこう見えてるらしい`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: share.image_url, width: 1200, height: 630 }],
      url: `/share/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [share.image_url],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const share = await getShare(id);
  if (!share) notFound();

  const creature = CREATURES.find((c) => c.id === share.creature_id);
  if (!creature) notFound();

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "20px",
        background: "#FFF9F2",
        minHeight: "100vh",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: 20,
          color: "#666",
          textDecoration: "none",
        }}
      >
        ← トップに戻る
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>
        {creature.name}の目で見た世界
      </h1>

      <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={share.image_url}
          alt={`${creature.name}の視点`}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      <div
        style={{
          background: "#FFF5E8",
          padding: 16,
          borderRadius: 16,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
          🧬 なんでこうなの？
        </h3>
        <p style={{ lineHeight: 1.7, fontSize: 14 }}>{creature.bio}</p>
      </div>

      <Link
        href={`/?creature=${creature.id}`}
        style={{
          display: "block",
          padding: "14px 20px",
          background: "#2D2D2D",
          color: "#fff",
          borderRadius: 16,
          textAlign: "center",
          fontWeight: 900,
          textDecoration: "none",
          fontSize: 16,
        }}
      >
        🐾 自分の写真でも{creature.name}の目を試す
      </Link>
    </main>
  );
}
