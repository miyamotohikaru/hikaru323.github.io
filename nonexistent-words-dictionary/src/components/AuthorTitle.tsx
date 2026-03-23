"use client";

import { useState, useEffect } from "react";

interface AuthorTitleProps {
  className?: string;
}

const TITLES = [
  { posts: 1, likes: 0, title: "語録生", reading: "ごろくせい" },
  { posts: 5, likes: 0, title: "語彙見習", reading: "ごいみならい" },
  { posts: 10, likes: 0, title: "言語採集者", reading: "げんごさいしゅうしゃ" },
  { posts: 0, likes: 100, title: "語義職人", reading: "ごぎしょくにん" },
  { posts: 0, likes: 500, title: "語義博士", reading: "ごぎはかせ" },
  { posts: 50, likes: 0, title: "言霊の番人", reading: "ことだまのばんにん" },
];

function getTitle(postsCount: number, totalLikes: number): { title: string; reading: string } | null {
  let best: { title: string; reading: string } | null = null;
  let bestPriority = -1;

  for (const t of TITLES) {
    const priority = t.posts + t.likes;
    if (postsCount >= t.posts && totalLikes >= t.likes && (t.posts > 0 || t.likes > 0)) {
      if (priority > bestPriority) {
        bestPriority = priority;
        best = { title: t.title, reading: t.reading };
      }
    }
  }
  return best;
}

export default function AuthorTitle({ className }: AuthorTitleProps) {
  const [title, setTitle] = useState<{ title: string; reading: string } | null>(null);

  useEffect(() => {
    const postsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
    const totalLikes = parseInt(localStorage.getItem("fictionary_total_likes") || "0", 10);
    setTitle(getTitle(postsCount, totalLikes));
  }, []);

  if (!title) return null;

  return (
    <span className={`author-title ${className || ""}`} title={title.reading}>
      {title.title}
    </span>
  );
}
