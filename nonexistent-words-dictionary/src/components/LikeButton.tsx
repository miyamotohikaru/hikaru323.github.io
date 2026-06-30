"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  wordId: string;
  initialLikes: number;
}

export default function LikeButton({ wordId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const likedWords = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");
    if (likedWords.includes(wordId)) {
      setLiked(true);
    }
  }, [wordId]);

  const handleLike = async () => {
    if (liked || isLoading) return;

    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/words/${wordId}/like`, { method: "POST" });
      if (res.ok) {
        setLikes((prev) => prev + 1);
        setLiked(true);
        const likedWords = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");
        likedWords.push(wordId);
        localStorage.setItem("fictionary_likes", JSON.stringify(likedWords));
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        className={`like-button ${liked ? "liked" : ""} ${liked ? "like-pop" : ""}`}
        onClick={handleLike}
        disabled={liked || isLoading}
        aria-pressed={liked}
        aria-label={`いいね${likes > 0 ? `（${likes}件）` : ""}${liked ? "・済み" : ""}`}
      >
        <span className="like-heart" aria-hidden="true">{liked ? "♥" : "♡"}</span>
        <span className="like-count">{likes > 0 ? likes : ""}</span>
      </button>
      {error && <span role="alert" style={{ fontSize: "11px", color: "var(--accent)", marginLeft: "4px" }}>失敗</span>}
    </span>
  );
}
