"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RandomWordButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/words/random");
      const data = await res.json();
      if (data.id) {
        router.push(`/word/${data.id}`);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="random-word-button"
      onClick={handleClick}
      disabled={isLoading}
      title="ランダムな語を引く"
      aria-label="ランダムな語を引く"
    >
      {isLoading ? "…" : "⚄"}
    </button>
  );
}
