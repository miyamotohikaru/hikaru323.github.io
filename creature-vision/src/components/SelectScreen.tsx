"use client";

import { useState, useMemo } from "react";
import Icon from "./Icon";
import { CATEGORIES } from "@/data/categories";
import { COLLECTIONS } from "@/data/collections";
import { CATEGORY_COLORS } from "@/styles/theme";

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
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [hideCollections, setHideCollections] = useState(false);

  const filtered = useMemo(() => {
    let list = creatures;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.includes(q) || c.en.toLowerCase().includes(q)
      );
      return list;
    }

    if (activeCollection) {
      const col = COLLECTIONS.find((c) => c.id === activeCollection);
      if (col) {
        list = list.filter((c) => col.creatureIds.includes(c.id));
      }
      return list;
    }

    if (activeCat === "fav") {
      list = list.filter((c) => favs.includes(c.id));
    } else if (activeCat) {
      list = list.filter((c) => c.cat === activeCat);
    }

    return list;
  }, [creatures, search, activeCat, activeCollection, favs]);

  const handleCatClick = (catId: string | null) => {
    setActiveCat(catId);
    setActiveCollection(null);
  };

  const handleCollectionClick = (colId: string) => {
    if (activeCollection === colId) {
      setActiveCollection(null);
    } else {
      setActiveCollection(colId);
      setActiveCat(null);
    }
  };

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
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value) setActiveCollection(null);
          }}
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

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <CatPill
          label="ぜんぶ"
          active={!activeCat && !activeCollection}
          color="#2D2D2D"
          onClick={() => handleCatClick(null)}
        />
        {favs.length > 0 && (
          <CatPill
            label="❤️"
            active={activeCat === "fav"}
            color="#FF6B6B"
            onClick={() => handleCatClick("fav")}
          />
        )}
        {CATEGORIES.map((cat) => (
          <CatPill
            key={cat.id}
            label={`${cat.emoji} ${cat.label}`}
            active={activeCat === cat.id}
            color={CATEGORY_COLORS[cat.id]?.accent ?? "#999"}
            onClick={() => handleCatClick(cat.id)}
          />
        ))}
      </div>

      {/* Collections */}
      {!search && !hideCollections && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#999" }}>
              おすすめコレクション
            </span>
            <button
              onClick={() => setHideCollections(true)}
              className="cursor-pointer"
              style={{ fontSize: 12, color: "#ccc" }}
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {COLLECTIONS.map((col) => {
              const isActive = activeCollection === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => handleCollectionClick(col.id)}
                  className="flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.03]"
                  style={{
                    padding: "12px 18px",
                    borderRadius: 16,
                    background: isActive ? "rgba(0,0,0,0.08)" : "#fff",
                    border: "2px solid rgba(0,0,0,0.05)",
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isActive && "✓ "}
                  {col.emoji} {col.title}
                </button>
              );
            })}
          </div>
          {activeCollection && (
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: 13, color: "#999" }}>
                {COLLECTIONS.find((c) => c.id === activeCollection)?.title}を表示中
              </span>
              <button
                onClick={() => setActiveCollection(null)}
                className="cursor-pointer"
                style={{
                  fontSize: 12,
                  color: "#FF6B6B",
                  fontWeight: 700,
                }}
              >
                ✕ もどす
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
      >
        {filtered.map((c) => {
          const catColor = CATEGORY_COLORS[c.cat];
          return (
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
                  background: catColor?.bg ?? "#f5f5f5",
                }}
              >
                <Icon id={c.id} name={c.name} cat={c.cat} size={52} />
              </div>
              <div className="p-2 text-center">
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{c.en}</div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: "#ccc", fontSize: 16 }}>
          みつかりませんでした
        </div>
      )}
    </div>
  );
}

function CatPill({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer transition-colors"
      style={{
        padding: "8px 16px",
        borderRadius: 100,
        background: active ? color : "#fff",
        color: active ? "#fff" : "#2D2D2D",
        border: "2px solid rgba(0,0,0,0.07)",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
