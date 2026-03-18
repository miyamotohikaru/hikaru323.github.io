"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Drawing } from "@/lib/types";
import { getDrawings, deleteDrawing } from "@/lib/storage";

// Sample gallery items to show as "other people's work"
const SAMPLE_DRAWINGS: Omit<Drawing, "strokes">[] = [
  {
    id: "sample-1",
    thumbnail: "",
    title: "ネオンフラワー",
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "sample-2",
    thumbnail: "",
    title: "夜の東京",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "sample-3",
    thumbnail: "",
    title: "抽象アート #42",
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function GalleryPage() {
  const [myDrawings, setMyDrawings] = useState<Drawing[]>([]);
  const [tab, setTab] = useState<"mine" | "community">("mine");

  useEffect(() => {
    setMyDrawings(getDrawings());
  }, []);

  const handleDelete = (id: string) => {
    deleteDrawing(id);
    setMyDrawings(getDrawings());
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <Link href="/" className="text-neon font-bold text-lg tracking-wide">
          らくがきのブラウザ
        </Link>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/draw" className="hover:text-neon transition-colors">
            描く
          </Link>
          <Link href="/gallery" className="text-neon">
            ギャラリー
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#141414] rounded-xl p-1 mb-8 max-w-xs">
          <button
            onClick={() => setTab("mine")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "mine"
                ? "bg-neon text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            自分の作品
          </button>
          <button
            onClick={() => setTab("community")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "community"
                ? "bg-neon text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            みんなの作品
          </button>
        </div>

        {tab === "mine" ? (
          <>
            {myDrawings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 opacity-30">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">まだ作品がありません</h3>
                <p className="text-muted mb-6">
                  描いて保存すると、ここに表示されます。
                </p>
                <Link
                  href="/draw"
                  className="inline-flex items-center gap-2 bg-neon text-black font-bold px-6 py-3 rounded-full hover:bg-neon-dim transition-colors"
                >
                  描きはじめる
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {myDrawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="group relative bg-[#141414] rounded-xl border border-border overflow-hidden hover:border-neon/30 transition-all"
                  >
                    <div className="aspect-square relative bg-[#0a0a0a]">
                      {drawing.thumbnail ? (
                        <Image
                          src={drawing.thumbnail}
                          alt={drawing.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium truncate">{drawing.title}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDate(drawing.createdAt)}
                      </p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(drawing.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="削除"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Community tab */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {SAMPLE_DRAWINGS.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#141414] rounded-xl border border-border overflow-hidden hover:border-neon/30 transition-all"
                >
                  <div className="aspect-square relative bg-[#0a0a0a] flex items-center justify-center">
                    {/* Placeholder art using CSS gradients */}
                    <div
                      className="w-full h-full"
                      style={{
                        background:
                          item.id === "sample-1"
                            ? "radial-gradient(circle at 30% 40%, #ff006630, transparent 50%), radial-gradient(circle at 70% 60%, #ccff0030, transparent 50%), radial-gradient(circle at 50% 80%, #00ccff30, transparent 40%)"
                            : item.id === "sample-2"
                              ? "linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #1a1a2e 100%), radial-gradient(circle at 80% 20%, #ff990020, transparent 30%)"
                              : "conic-gradient(from 45deg, #ff006620, #ccff0020, #00ccff20, #ff00ff20, #ff006620)",
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">{item.title}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center py-12">
              <p className="text-muted text-sm">
                コミュニティ機能は準備中です。もうすぐ、みんなの作品をここで見られるようになります。
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
