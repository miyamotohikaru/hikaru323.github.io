"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { DrawingMeta } from "@/lib/types";
import { getGallery } from "@/lib/storage";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const justSaved = searchParams.get("saved") === "1";

  const [drawings, setDrawings] = useState<DrawingMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery().then((g) => {
      setDrawings(g);
      setLoading(false);
    });
  }, []);

  const btnStyle: React.CSSProperties = {
    padding: "8px 16px", borderRadius: 10, border: "1px solid #e8e0d8",
    fontSize: 14, color: "#666", background: "#fff", cursor: "pointer",
    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf6f0" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: "1px solid #e8e0d8",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={{
            ...btnStyle, background: "#333", color: "#fff", border: "none",
            fontWeight: 600,
          }}>TOP</Link>
          <Link href="/draw" style={btnStyle}>← 戻る</Link>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginLeft: 8 }}>みんなのらくがき</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#e07a3a", fontWeight: 700, fontSize: 14 }}>
            {drawings.length}作品
          </span>
          <Link href="/draw" style={{
            ...btnStyle, background: "#e07a3a", color: "#fff", border: "none",
            fontWeight: 700,
          }}>+ 新しく描く</Link>
        </div>
      </div>

      <div style={{ padding: "16px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Success banner */}
        {justSaved && (
          <div style={{
            background: "rgba(224,122,58,0.08)", border: "1px solid rgba(224,122,58,0.2)",
            borderRadius: 12, padding: "12px 20px", marginBottom: 20,
            fontSize: 15, animation: "fadeInBanner 0.4s ease",
          }}>
            🎉 保存しました！あなたの作品がギャラリーに追加されました
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid #e8e0d8", borderTopColor: "#e07a3a",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <p style={{ color: "#999" }}>読み込み中...</p>
          </div>
        ) : drawings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🖌️</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>まだ作品がありません</h3>
            <p style={{ color: "#999", marginBottom: 24 }}>描いて保存すると、ここに表示されます。</p>
            <Link href="/draw" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#e07a3a", color: "#fff", fontWeight: 600,
              padding: "12px 28px", borderRadius: 24, textDecoration: "none",
            }}>
              描きはじめる →
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {drawings.map((d, i) => (
              <div key={d.id} style={{
                background: "#fff", borderRadius: 16, overflow: "hidden",
                border: i === 0 && justSaved ? "2px solid #e07a3a" : "1px solid #e8e0d8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                position: "relative",
                transition: "transform 0.2s",
              }}>
                {/* NEW badge */}
                {i === 0 && justSaved && (
                  <div style={{
                    position: "absolute", top: 12, right: 12, zIndex: 5,
                    background: "#e07a3a", color: "#fff", fontWeight: 700,
                    fontSize: 11, padding: "3px 10px", borderRadius: 10,
                  }}>NEW</div>
                )}
                <div style={{
                  aspectRatio: "4/3", background: "#faf6f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {d.thumbnail ? (
                    <img src={d.thumbnail} alt="らくがき"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#e8e0d8", fontSize: 40 }}>🖼</span>
                  )}
                </div>
                <div style={{
                  padding: "10px 16px", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "#e07a3a", fontWeight: 700, fontSize: 13 }}>
                    {d.strokeCount} strokes
                  </span>
                  <span style={{ color: "#ccc", fontSize: 12 }}>
                    {formatDate(d.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#faf6f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #e8e0d8", borderTopColor: "#e07a3a",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
