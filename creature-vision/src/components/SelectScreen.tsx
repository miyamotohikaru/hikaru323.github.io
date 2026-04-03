"use client";

import { useState, useMemo } from "react";
import Icon from "./Icon";

interface Creature {
  id: string;
  name: string;
  en: string;
  cat: string;
  color: string;
}

interface Props {
  creatures: Creature[];
  favs: string[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function SelectScreen({ creatures, favs, onSelect, onBack }: Props) {
  const [search, setSearch] = useState("");
  const [showFavs, setShowFavs] = useState(false);

  const filtered = useMemo(() => {
    let list = creatures;

    if (showFavs) {
      list = list.filter((c) => favs.includes(c.id));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.includes(q) || c.en.toLowerCase().includes(q)
      );
    }

    return list;
  }, [creatures, search, showFavs, favs]);

  return (
    <div
      className="min-h-screen px-4 py-6 mx-auto"
      style={{ maxWidth: 960, animation: "fadeUp 0.4s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 cursor-pointer"
          style={{
            background: "#fff",
            border: "2px solid rgba(0,0,0,0.07)",
            borderRadius: 100,
            padding: "8px 16px",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ← もどる
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>👆 どの目でみる？</h2>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          type="text"
          placeholder="なまえでさがす..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 outline-none"
          style={{
            background: "#fff",
            border: "2px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 500,
          }}
        />
      </div>

      {/* Favorites tab */}
      {favs.length > 0 && (
        <div className="flex gap-2 pb-3 mb-4">
          <button
            onClick={() => setShowFavs(false)}
            className="flex-shrink-0 cursor-pointer transition-colors"
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              background: !showFavs ? "#2D2D2D" : "#fff",
              color: !showFavs ? "#fff" : "#2D2D2D",
              border: "2px solid rgba(0,0,0,0.07)",
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            ぜんぶ
          </button>
          <button
            onClick={() => setShowFavs(true)}
            className="flex-shrink-0 cursor-pointer transition-colors"
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              background: showFavs ? "#FF6B6B" : "#fff",
              color: showFavs ? "#fff" : "#2D2D2D",
              border: "2px solid rgba(0,0,0,0.07)",
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            ❤️ お気に入り
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
      >
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="flex flex-col overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03]"
            style={{
              borderRadius: 16,
              background: "#fff",
              border: "2px solid rgba(0,0,0,0.05)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                aspectRatio: "1",
                background: "#f5f5f5",
              }}
            >
              <Icon id={c.id} name={c.name} cat={c.cat} size={52} />
            </div>
            <div className="p-2 text-center">
              <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>{c.en}</div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: "#ccc", fontSize: 16 }}>
          みつかりませんでした
        </div>
      )}
    </div>
  );
}
