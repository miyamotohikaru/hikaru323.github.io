"use client";

import { useState } from "react";

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L12 16" stroke="#555" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8L12 3L17 8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** シェアページからこのページ自身を再シェアするボタン */
export default function ShareLinkButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* ユーザーがキャンセルした場合などは無視 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* クリップボード不可時は無視 */
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        width: "100%",
        padding: "12px 20px",
        borderRadius: 14,
        border: "2px solid rgba(0,0,0,0.08)",
        background: copied ? "#f0fff0" : "#fff",
        color: "#333",
        fontSize: 14,
        fontWeight: 900,
        fontFamily: "inherit",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 16,
        transition: "all 0.2s",
      }}
    >
      <ShareIcon />
      {copied ? "✅ リンクをコピーしました" : "この見え方をシェアする"}
    </button>
  );
}
