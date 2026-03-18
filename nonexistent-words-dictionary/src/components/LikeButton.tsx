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

  useEffect(() => {
    const likedWords = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");
    if (likedWords.includes(wordId)) {
      setLiked(true);
    }
  }, [wordId]);

  const handleLike = async () => {
    if (liked || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/words/${wordId}/like`, { method: "POST" });
      if (res.ok) {
        setLikes((prev) => prev + 1);
        setLiked(true);
        const likedWords = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");
        likedWords.push(wordId);
        localStorage.setItem("fictionary_likes", JSON.stringify(likedWords));
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${liked ? "liked" : ""}`}
      onClick={handleLike}
      disabled={liked || isLoading}
      aria-label="いいね"
    >
      <span className="like-heart">{liked ? "♥" : "♡"}</span>
      <span className="like-count">{likes}</span>
    </button>
  );
}
