"use client";

import { useState } from "react";
import { AppSidebar, MenuIcon } from "@/components/app-sidebar";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function MuscleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5c3.5-3.5 9-3.5 12 0s3 8.5 0 12-8.5 3-12 0" />
      <path d="M6.5 17.5c-3 3-2 7 2 6" />
      <path d="m10 20 4-4" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#E85D75" : "none"}
      stroke={filled ? "#E85D75" : "white"}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

type Filter = "Tout" | "Express" | "Végétarien" | "Riche en protéines" | "Desserts";

const FILTERS: Filter[] = ["Tout", "Express", "Végétarien", "Riche en protéines", "Desserts"];

interface Recipe {
  id: number;
  title: string;
  photo: string;
  time: string;
  calories: number;
  proteins: number;
  tag: Filter | null;
  tagLabel?: string;
  featured?: boolean;
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Filet de bœuf, jus de truffe & légumes racines",
    photo: "https://images.unsplash.com/photo-1663530761401-15eefb544889?w=900&h=560&fit=crop&auto=format",
    time: "45 min",
    calories: 680,
    proteins: 52,
    tag: "Riche en protéines",
    tagLabel: "Signature",
    featured: true,
  },
  {
    id: 2,
    title: "Dos de cabillaud, vierge d'herbes & fenouil braisé",
    photo: "https://images.unsplash.com/photo-1676471926534-d5c9771909fa?w=600&h=400&fit=crop&auto=format",
    time: "30 min",
    calories: 380,
    proteins: 34,
    tag: "Riche en protéines",
    tagLabel: "Léger",
  },
  {
    id: 3,
    title: "Salade de burrata, tomates rôties & basilic",
    photo: "https://images.unsplash.com/photo-1771759441598-0105381b2e70?w=600&h=400&fit=crop&auto=format",
    time: "15 min",
    calories: 280,
    proteins: 12,
    tag: "Végétarien",
    tagLabel: "Express",
  },
  {
    id: 4,
    title: "Buddha bowl quinoa, avocat & pois chiches croustillants",
    photo: "https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=600&h=400&fit=crop&auto=format",
    time: "20 min",
    calories: 420,
    proteins: 18,
    tag: "Végétarien",
    tagLabel: "Végétarien",
  },
  {
    id: 5,
    title: "Saumon fumé mi-cuit, crème citronnée & câpres",
    photo: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&auto=format",
    time: "25 min",
    calories: 450,
    proteins: 42,
    tag: "Riche en protéines",
    tagLabel: "Protéines",
  },
  {
    id: 6,
    title: "Poulet rôti, jus corsé & pommes de terre grenaille",
    photo: "https://images.unsplash.com/photo-1539735257177-0d3949225f96?w=600&h=400&fit=crop&auto=format",
    time: "18 min",
    calories: 510,
    proteins: 38,
    tag: "Express",
    tagLabel: "Express",
  },
  {
    id: 7,
    title: "Moelleux au chocolat noir, cœur coulant praliné",
    photo: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&auto=format",
    time: "35 min",
    calories: 520,
    proteins: 8,
    tag: "Desserts",
    tagLabel: "Dessert",
  },
  {
    id: 8,
    title: "Grande salade fraîche, vinaigrette miel & moutarde",
    photo: "https://images.unsplash.com/photo-1778690103044-88ad0e274e32?w=600&h=400&fit=crop&auto=format",
    time: "12 min",
    calories: 240,
    proteins: 10,
    tag: "Express",
    tagLabel: "Express",
  },
  {
    id: 9,
    title: "Sauce poisson maison, légumes poêlés",
    photo: "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf9?w=600&h=400&fit=crop&auto=format",
    time: "40 min",
    calories: 390,
    proteins: 29,
    tag: "Végétarien",
    tagLabel: "Gastronomique",
  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Signature: { bg: "rgba(28,43,30,0.72)", text: "#E8F5EC" },
  Express: { bg: "rgba(249,115,22,0.88)", text: "#FFF" },
  Léger: { bg: "rgba(74,124,89,0.82)", text: "#FFF" },
  Végétarien: { bg: "rgba(74,124,89,0.82)", text: "#FFF" },
  Protéines: { bg: "rgba(59,130,246,0.80)", text: "#FFF" },
  Dessert: { bg: "rgba(219,85,108,0.85)", text: "#FFF" },
  Gastronomique: { bg: "rgba(161,124,61,0.85)", text: "#FFF" },
};

function RecipeCard({
  recipe,
  onToggleFav,
  isFav,
}: {
  recipe: Recipe;
  onToggleFav: (id: number) => void;
  isFav: boolean;
}) {
  const tagCfg = recipe.tagLabel ? (TAG_COLORS[recipe.tagLabel] ?? TAG_COLORS.Signature) : null;

  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 2px 16px rgba(28,43,30,0.07)",
      }}
    >
      <div className="relative overflow-hidden bg-[#D4EDD9]" style={{ height: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.photo}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(28,43,30,0.48) 0%, transparent 55%)" }}
        />
        {tagCfg && recipe.tagLabel && (
          <div
            className="absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-[4px]"
            style={{ background: tagCfg.bg, color: tagCfg.text }}
          >
            {recipe.tagLabel}
          </div>
        )}
        <button
          type="button"
          onClick={() => onToggleFav(recipe.id)}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
          style={{
            background: isFav ? "rgba(255,255,255,0.95)" : "rgba(28,43,30,0.35)",
            backdropFilter: "blur(4px)",
          }}
          aria-label="Ajouter aux favoris"
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>

      <div className="px-4 pt-3.5 pb-4">
        <h3 className="font-lora mb-3 line-clamp-2 min-h-10 text-sm leading-snug font-bold text-[#1C2B1E]">
          {recipe.title}
        </h3>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#4A7C59]">
            <ClockIcon />
            <span className="text-xs font-semibold text-[#4A7C59]">{recipe.time}</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#F97316]">
            <FlameIcon />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.calories} kcal</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#3B82F6]">
            <MuscleIcon />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.proteins}g</span>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#C8E0CF] bg-[#F4F9F5] py-2.5 text-xs font-bold text-[#4A7C59] transition-all duration-200 hover:border-[#4A7C59] hover:bg-[#4A7C59] hover:text-white"
        >
          <PlusIcon />
          Ajouter au planning
        </button>
      </div>
    </div>
  );
}

function FeaturedCard({
  recipe,
  onToggleFav,
  isFav,
}: {
  recipe: Recipe;
  onToggleFav: (id: number) => void;
  isFav: boolean;
}) {
  return (
    <div
      className="group relative mb-8 cursor-pointer overflow-hidden rounded-3xl bg-[#1C2B1E]"
      style={{
        height: 340,
        boxShadow: "0 12px 48px rgba(28,43,30,0.20)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={recipe.photo}
        alt={recipe.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10,20,12,0.85) 0%, rgba(10,20,12,0.30) 50%, transparent 100%)",
        }}
      />

      <div className="absolute top-5 left-5 flex items-center gap-2">
        <div
          className="rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-[0.08em] text-white"
        >
          RECETTE DU JOUR
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleFav(recipe.id)}
        className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          background: isFav ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
          backdropFilter: "blur(6px)",
        }}
        aria-label="Ajouter aux favoris"
      >
        <HeartIcon filled={isFav} />
      </button>

      <div className="absolute right-0 bottom-0 left-0 px-6 py-5">
        <h2
          className="font-lora mb-3 text-2xl leading-tight font-bold text-white"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
        >
          {recipe.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/75">
            <ClockIcon />
            <span className="text-xs font-semibold">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <FlameIcon />
            <span className="text-xs font-semibold">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <MuscleIcon />
            <span className="text-xs font-semibold">{recipe.proteins}g protéines</span>
          </div>
          <button
            type="button"
            className="ml-auto flex items-center gap-2 rounded-xl bg-[#4A7C59] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105"
          >
            <PlusIcon /> Ajouter au planning
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecettesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("Tout");
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 5]));
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const featured = RECIPES.find((r) => r.featured)!;
  const rest = RECIPES.filter((r) => !r.featured);

  const filtered = rest.filter((r) => {
    const matchFilter = activeFilter === "Tout" || r.tag === activeFilter;
    const matchQuery = query === "" || r.title.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  const filterCounts: Record<string, number> = {
    Tout: rest.length,
    Express: rest.filter((r) => r.tag === "Express").length,
    Végétarien: rest.filter((r) => r.tag === "Végétarien").length,
    "Riche en protéines": rest.filter((r) => r.tag === "Riche en protéines").length,
    Desserts: rest.filter((r) => r.tag === "Desserts").length,
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8F3]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {sidebarOpen && <AppSidebar isMobile onClose={() => setSidebarOpen(false)} />}
      <AppSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1C2B1E] transition-colors lg:hidden"
              style={{ boxShadow: "0 2px 10px rgba(28,43,30,0.08)" }}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div>
              <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Collection</p>
              <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">Mes Recettes</h1>
            </div>
          </div>

          <div
            className="hidden items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:flex"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2EBE3",
              boxShadow: "0 2px 12px rgba(28,43,30,0.06)",
              width: 260,
            }}
          >
            <span className="shrink-0 text-[#7A8F7D]">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une recette…"
              className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
            />
          </div>
        </div>

        <FeaturedCard recipe={featured} onToggleFav={toggleFav} isFav={favorites.has(featured.id)} />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className="rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200"
                  style={{
                    background: isActive ? "#1C2B1E" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#4A7C59",
                    border: isActive ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(28,43,30,0.18)"
                      : "0 1px 4px rgba(28,43,30,0.05)",
                  }}
                >
                  {f}
                  <span className="ml-2 text-xs" style={{ opacity: isActive ? 0.6 : 0.55 }}>
                    {filterCounts[f]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm font-medium text-[#7A8F7D]">
            <span className="font-bold text-[#1C2B1E]">{filtered.length}</span> recettes
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} onToggleFav={toggleFav} isFav={favorites.has(r.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-4 text-5xl">🔍</div>
            <p className="font-lora text-base font-bold text-[#1C2B1E]">Aucune recette trouvée</p>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">Essayez un autre filtre ou mot-clé</p>
          </div>
        )}
      </main>
    </div>
  );
}
