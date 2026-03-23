"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DrawingMeta } from "@/lib/types";
import { getGallery } from "@/lib/storage";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function SavedPage() {
  const [drawings, setDrawings] = useState<DrawingMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    getGallery().then((g) => {
      setDrawings(g);
      setLoading(false);
    });
  }, []);

  const latest = drawings[0];
  const others = drawings.slice(1, 7);
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/gallery" : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "らくがきのブラウザ",
          text: "みんなの落書きが重なって、アートになる。あなたも一筆加えてみない？",
          url: shareUrl,
        });
        setShared(true);
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("みんなの落書きが重なって、ひとつのアートになる。\nあなたも一筆加えてみない？\n\n#らくがきのブラウザ")}&url=${encodeURIComponent(shareUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("らくがきのブラウザで描いたよ！一緒に描こう！")}`;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#faf6f0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          border: "3px solid #e8e0d8", borderTopColor: "#e07a3a",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#faf6f0",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px", overflow: "hidden",
    }}>
      {/* Celebration */}
      <p style={{
        fontSize: 14, color: "#e07a3a", fontWeight: 600,
        letterSpacing: "0.1em", marginBottom: 8,
        animation: "fadeIn 0.5s ease",
      }}>
        SAVED!
      </p>
      <h1 style={{
        fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800,
        textAlign: "center", lineHeight: 1.5, marginBottom: 8,
        animation: "fadeIn 0.5s ease 0.15s both",
      }}>
        あなたの一筆が加わりました
      </h1>
      <p style={{
        color: "#999", fontSize: 15, textAlign: "center", marginBottom: 32,
        animation: "fadeIn 0.5s ease 0.3s both",
      }}>
        みんなの落書きが重なって、ひとつのアートになる
      </p>

      {/* Stacked artwork display */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 380,
        marginBottom: 36,
        animation: "slideUp 0.6s ease 0.3s both",
      }}>
        {/* Background layers - other people's art */}
        {others.map((d, i) => (
          <div key={d.id} style={{
            position: "absolute",
            top: 12 + i * 6,
            left: "50%",
            transform: `translateX(-50%) scale(${0.92 - i * 0.03}) rotate(${(i % 2 === 0 ? 1 : -1) * (1 + i * 0.8)}deg)`,
            width: "85%",
            aspectRatio: "4/3",
            borderRadius: 16,
            overflow: "hidden",
            background: "#f0ebe3",
            border: "1px solid #e8e0d8",
            opacity: Math.max(0.15, 0.5 - i * 0.08),
            zIndex: others.length - i,
          }}>
            {d.thumbnail && (
              <img src={d.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
        ))}

        {/* Main card - user's latest drawing */}
        <div style={{
          position: "relative",
          zIndex: 20,
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          border: "2px solid #e07a3a",
          boxShadow: "0 12px 40px rgba(224,122,58,0.15), 0 4px 12px rgba(0,0,0,0.06)",
          marginTop: others.length > 0 ? others.length * 6 + 12 : 0,
        }}>
          <div style={{
            aspectRatio: "4/3", background: "#faf6f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {latest?.thumbnail ? (
              <img src={latest.thumbnail} alt="あなたの作品"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#e8e0d8", fontSize: 48 }}>🖼</span>
            )}
          </div>
          <div style={{
            padding: "12px 16px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <span style={{ color: "#e07a3a", fontWeight: 700, fontSize: 14 }}>
                {latest?.strokeCount ?? 0} strokes
              </span>
              <span style={{ color: "#ccc", fontSize: 12, marginLeft: 12 }}>
                {latest ? formatDate(latest.createdAt) : ""}
              </span>
            </div>
            <span style={{
              background: "#e07a3a", color: "#fff", fontWeight: 700,
              fontSize: 11, padding: "3px 10px", borderRadius: 10,
            }}>NEW</span>
          </div>
        </div>

        {/* Count badge */}
        {drawings.length > 1 && (
          <div style={{
            textAlign: "center", marginTop: 12,
            fontSize: 13, color: "#bbb",
          }}>
            これまでに {drawings.length} 作品が重なっています
          </div>
        )}
      </div>

      {/* Share CTA */}
      <div style={{
        width: "100%", maxWidth: 380,
        animation: "slideUp 0.6s ease 0.5s both",
      }}>
        <p style={{
          textAlign: "center", fontSize: 15, color: "#666",
          marginBottom: 16, lineHeight: 1.7,
        }}>
          友達を誘って、もっと重ねよう。<br />
          <span style={{ color: "#e07a3a", fontWeight: 600 }}>
            次の一筆を待っています。
          </span>
        </p>

        {/* Main share button */}
        <button onClick={handleShare} style={{
          width: "100%", padding: "16px",
          background: "#e07a3a", color: "#fff",
          border: "none", borderRadius: 14,
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(224,122,58,0.3)",
        }}>
          {shared ? "✓ シェアしました！" : "📤 友達にシェアする"}
        </button>

        {/* Sub share row */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 12,
        }}>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, padding: "12px", borderRadius: 12,
            background: "#1da1f2", color: "#fff",
            fontSize: 14, fontWeight: 600, textAlign: "center",
            textDecoration: "none",
          }}>
            𝕏 で共有
          </a>
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, padding: "12px", borderRadius: 12,
            background: "#06c755", color: "#fff",
            fontSize: 14, fontWeight: 600, textAlign: "center",
            textDecoration: "none",
          }}>
            LINE で送る
          </a>
        </div>

        {/* Copy link */}
        <button onClick={handleCopy} style={{
          width: "100%", padding: "12px",
          background: "#fff", border: "1px solid #e8e0d8",
          borderRadius: 12, fontSize: 14, color: "#888",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {copied ? "✓ コピーしました！" : "🔗 リンクをコピー"}
        </button>
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex", gap: 16, marginTop: 32,
        animation: "fadeIn 0.5s ease 0.7s both",
      }}>
        <Link href="/gallery" style={{
          padding: "10px 24px", borderRadius: 10,
          background: "#fff", border: "1px solid #e8e0d8",
          fontSize: 14, color: "#666", textDecoration: "none",
        }}>
          ギャラリーを見る →
        </Link>
        <Link href="/draw" style={{
          padding: "10px 24px", borderRadius: 10,
          background: "#fff", border: "1px solid #e8e0d8",
          fontSize: 14, color: "#666", textDecoration: "none",
        }}>
          もっと描く ✏️
        </Link>
      </div>
    </div>
  );
}
