"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DrawingMeta } from "@/lib/types";
import { getGallery, getMyDrawings, deleteMyDrawing } from "@/lib/storage";

function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const SAMPLE_ART: DrawingMeta[] = [
  { id: "s1", thumbnail: "", title: "ネオンフラワー", createdAt: Date.now() - 86400000 * 2 },
  { id: "s2", thumbnail: "", title: "夜の東京タワー", createdAt: Date.now() - 86400000 * 5 },
  { id: "s3", thumbnail: "", title: "抽象アート #42", createdAt: Date.now() - 86400000 * 1 },
  { id: "s4", thumbnail: "", title: "猫のスケッチ", createdAt: Date.now() - 86400000 * 3 },
];

const GRADIENTS = [
  "radial-gradient(circle at 30% 40%, #ff006630, transparent 50%), radial-gradient(circle at 70% 60%, #ccff0030, transparent 50%)",
  "linear-gradient(135deg, #0a0a0a, #1a1a2e), radial-gradient(circle at 80% 20%, #ff990030, transparent 40%)",
  "conic-gradient(from 45deg, #ff006620, #ccff0020, #00ccff20, #ff00ff20, #ff006620)",
  "radial-gradient(circle at 50% 50%, #00ccff20, transparent 60%), radial-gradient(circle at 20% 80%, #ff336630, transparent 40%)",
];

export default function GalleryPage() {
  const [tab, setTab] = useState<"mine" | "community">("mine");
  const [myDrawings, setMyDrawings] = useState<DrawingMeta[]>([]);
  const [communityDrawings, setCommunityDrawings] = useState<DrawingMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMyDrawings(getMyDrawings());
    getGallery().then((g) => {
      setCommunityDrawings(g.length > 0 ? g : []);
      setLoading(false);
    });
  }, []);

  const handleDelete = (id: string) => {
    deleteMyDrawing(id);
    setMyDrawings(getMyDrawings());
  };

  const cardStyle: React.CSSProperties = {
    background: "#141414",
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    overflow: "hidden",
    transition: "border-color 0.2s",
    cursor: "pointer",
    position: "relative",
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    background: active ? "#ccff00" : "transparent",
    color: active ? "#000" : "#888",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid #2a2a2a",
      }}>
        <Link href="/" style={{ color: "#ccff00", fontWeight: 700, fontSize: 18, letterSpacing: "0.05em", textDecoration: "none" }}>
          らくがきのブラウザ
        </Link>
        <nav style={{ display: "flex", gap: 24, fontSize: 14, color: "#888" }}>
          <Link href="/draw" style={{ textDecoration: "none", color: "inherit" }}>描く</Link>
          <Link href="/gallery" style={{ textDecoration: "none", color: "#ccff00" }}>ギャラリー</Link>
        </nav>
      </header>

      <main style={{ flex: 1, padding: "32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: "#141414",
          borderRadius: 12, padding: 4, maxWidth: 280, marginBottom: 32,
        }}>
          <button onClick={() => setTab("mine")} style={tabBtn(tab === "mine")}>
            自分の作品
          </button>
          <button onClick={() => setTab("community")} style={tabBtn(tab === "community")}>
            みんなの作品
          </button>
        </div>

        {tab === "mine" ? (
          myDrawings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>✏️</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>まだ作品がありません</h3>
              <p style={{ color: "#888", marginBottom: 24 }}>描いて保存すると、ここに表示されます。</p>
              <Link href="/draw" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#ccff00", color: "#000", fontWeight: 600,
                padding: "12px 28px", borderRadius: 24, textDecoration: "none",
              }}>
                描きはじめる →
              </Link>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}>
              {myDrawings.map((d) => (
                <div key={d.id} style={cardStyle}>
                  <div style={{
                    aspectRatio: "1", background: "#0a0a0a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    {d.thumbnail ? (
                      <img src={d.thumbnail} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#333", fontSize: 32 }}>🖼</span>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.title}
                    </h3>
                    <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{formatDate(d.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(0,0,0,0.6)", border: "none",
                      color: "#888", cursor: "pointer", padding: "4px 8px",
                      borderRadius: 8, fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: 32, height: 32,
                  border: "3px solid #333", borderTopColor: "#ccff00",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <p style={{ color: "#888" }}>読み込み中...</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 16,
                }}>
                  {/* Real community drawings */}
                  {communityDrawings.map((d) => (
                    <div key={d.id} style={cardStyle}>
                      <div style={{
                        aspectRatio: "1", background: "#0a0a0a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                      }}>
                        {d.thumbnail ? (
                          <img src={d.thumbnail} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "#333", fontSize: 32 }}>🖼</span>
                        )}
                      </div>
                      <div style={{ padding: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 500 }}>{d.title}</h3>
                        <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{formatDate(d.createdAt)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Sample placeholders */}
                  {SAMPLE_ART.map((item, i) => (
                    <div key={item.id} style={cardStyle}>
                      <div style={{
                        aspectRatio: "1",
                        background: GRADIENTS[i % GRADIENTS.length],
                      }} />
                      <div style={{ padding: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</h3>
                        <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <p style={{ color: "#666", fontSize: 14 }}>
                    Vercel KV を接続すると、みんなの作品がリアルタイムで表示されます。
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
