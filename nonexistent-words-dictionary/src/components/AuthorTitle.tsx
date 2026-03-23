"use client";

import { useState, useEffect } from "react";
import { getAuthorTitle } from "@/lib/types";

export default function AuthorTitle() {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const posts = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
    const likes = parseInt(localStorage.getItem("fictionary_total_likes") || "0", 10);
    setTitle(getAuthorTitle(posts, likes));
  }, []);

  if (!title) return null;

  return <span className="author-title">{title}</span>;
}
