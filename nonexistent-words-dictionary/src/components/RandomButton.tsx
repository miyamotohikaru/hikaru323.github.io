"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RandomButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [noWords, setNoWords] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setNoWords(false);
    try {
      const res = await fetch("/api/random");
      if (!res.ok) return;
      const data = await res.json();
      if (data.id) {
        router.push(`/word/${data.id}`);
      } else {
        setNoWords(true);
        setTimeout(() => setNoWords(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className="random-button" title="ランダムな語を表示">
      {loading ? "…" : noWords ? "まだ語がありません" : "🎲"}
    </button>
  );
}
