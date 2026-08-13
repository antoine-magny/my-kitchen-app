"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import {
  ClockIcon,
  FlameIcon,
  HeartIcon,
  MuscleIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import {
  RECIPES,
  addCustomRecipe,
  getAllRecipes,
  type NewRecipeInput,
  type Recipe,
  type RecipeFilter,
} from "@/lib/recipes";

type Filter = RecipeFilter | "Favoris";

const FILTERS: Filter[] = ["Tout", "Favoris", "Express", "Végétarien", "Riche en protéines", "Desserts"];

const FAVORITES_KEY = "my-kitchen-favorite-recipes";
const DEFAULT_FAVORITES = [1, 5];

function readFavorites(): Set<number> {
  if (typeof window === "undefined") return new Set(DEFAULT_FAVORITES);
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set(DEFAULT_FAVORITES);
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? new Set(parsed) : new Set(DEFAULT_FAVORITES);
  } catch {
    return new Set(DEFAULT_FAVORITES);
  }
}

function writeFavorites(favorites: Set<number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

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
      <Link href={`/recettes/${recipe.id}`} className="block">
        <div className="relative overflow-hidden bg-[#D4EDD9]" style={{ height: 200 }}>
          {recipe.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photo}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
          )}
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
        </div>
      </Link>

      <div className="px-4 pt-3.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/recettes/${recipe.id}`}>
            <h3 className="font-lora line-clamp-2 min-h-10 text-sm leading-snug font-bold text-[#1C2B1E]">
              {recipe.title}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => onToggleFav(recipe.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
            style={{ background: isFav ? "#FEE2E8" : "#F0F4EF" }}
            aria-label="Ajouter aux favoris"
          >
            <HeartIcon filled={isFav} />
          </button>
        </div>

        <MissingIngredientsBadges names={recipe.missingIngredients} className="mb-3" />

        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#4A7C59]">
            <ClockIcon size={12} />
            <span className="text-xs font-semibold text-[#4A7C59]">{recipe.time}</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#F97316]">
            <FlameIcon size={12} />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.calories} kcal</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#3B82F6]">
            <MuscleIcon size={12} />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.proteins}g</span>
          </div>
        </div>

        <Link
          href={`/recettes/${recipe.id}`}
          className="flex w-full items-center justify-center rounded-xl bg-[#4A7C59] py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
        >
          Voir les étapes
        </Link>
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
      className="group relative mb-8 overflow-hidden rounded-3xl bg-[#1C2B1E]"
      style={{
        height: 340,
        boxShadow: "0 12px 48px rgba(28,43,30,0.20)",
      }}
    >
      <Link href={`/recettes/${recipe.id}`} className="absolute inset-0 block">
        {recipe.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.photo}
            alt={recipe.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#2A3D2C] text-6xl">🍽️</div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(10,20,12,0.85) 0%, rgba(10,20,12,0.30) 50%, transparent 100%)",
          }}
        />
      </Link>

      <div className="pointer-events-none absolute top-5 left-5 flex items-center gap-2">
        <div className="rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-[0.08em] text-white">
          RECETTE DU JOUR
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleFav(recipe.id)}
        className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          background: isFav ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
          backdropFilter: "blur(6px)",
        }}
        aria-label="Ajouter aux favoris"
      >
        <HeartIcon filled={isFav} light />
      </button>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-6 py-5">
        <h2
          className="font-lora mb-3 text-2xl leading-tight font-bold text-white"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
        >
          {recipe.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/75">
            <ClockIcon size={12} />
            <span className="text-xs font-semibold">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <FlameIcon size={12} />
            <span className="text-xs font-semibold">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <MuscleIcon size={12} />
            <span className="text-xs font-semibold">{recipe.proteins}g protéines</span>
          </div>
          <Link
            href={`/recettes/${recipe.id}`}
            className="pointer-events-auto ml-auto flex items-center gap-2 rounded-xl bg-[#4A7C59] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105"
          >
            Voir les étapes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecettesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("Tout");
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set(DEFAULT_FAVORITES));
  const [query, setQuery] = useState("");

  useEffect(() => {
    setRecipes(getAllRecipes());
    setFavorites(readFavorites());
  }, []);

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavorites(next);
      return next;
    });
  };

  const handleAdd = (input: NewRecipeInput) => {
    addCustomRecipe(input);
    setRecipes(getAllRecipes());
  };

  const showFavoritesOnly = activeFilter === "Favoris";
  const featured = !showFavoritesOnly ? (recipes.find((r) => r.featured) ?? recipes[0]) : undefined;
  const listSource = showFavoritesOnly
    ? recipes.filter((r) => favorites.has(r.id))
    : recipes.filter((r) => r.id !== featured?.id);

  const filtered = listSource.filter((r) => {
    const matchFilter =
      activeFilter === "Tout" ||
      activeFilter === "Favoris" ||
      r.tag === activeFilter;
    const matchQuery = query === "" || r.title.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  const filterCounts: Record<string, number> = {
    Tout: recipes.filter((r) => r.id !== featured?.id).length,
    Favoris: recipes.filter((r) => favorites.has(r.id)).length,
    Express: recipes.filter((r) => r.tag === "Express").length,
    Végétarien: recipes.filter((r) => r.tag === "Végétarien").length,
    "Riche en protéines": recipes.filter((r) => r.tag === "Riche en protéines").length,
    Desserts: recipes.filter((r) => r.tag === "Desserts").length,
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <main className="mx-auto max-w-md px-5 py-8 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Collection</p>
            <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">Mes Recettes</h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:flex"
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2EBE3",
                boxShadow: "0 2px 12px rgba(28,43,30,0.06)",
                width: 240,
              }}
            >
              <span className="shrink-0 text-[#7A8F7D]">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une recette…"
                className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold sm:px-5"
            >
              <PlusIcon size={14} />
              <span className="hidden sm:inline">Ajouter une recette</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {featured && (
          <FeaturedCard recipe={featured} onToggleFav={toggleFav} isFav={favorites.has(featured.id)} />
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f;
              const isFavoris = f === "Favoris";
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200"
                  style={{
                    background: isActive ? (isFavoris ? "#E85D75" : "#1C2B1E") : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : isFavoris ? "#E85D75" : "#4A7C59",
                    border: isActive
                      ? `1.5px solid ${isFavoris ? "#E85D75" : "#1C2B1E"}`
                      : isFavoris
                        ? "1.5px solid #F9C5CF"
                        : "1.5px solid #C8E0CF",
                    boxShadow: isActive
                      ? `0 4px 12px ${isFavoris ? "rgba(232,93,117,0.25)" : "rgba(28,43,30,0.18)"}`
                      : "0 1px 4px rgba(28,43,30,0.05)",
                  }}
                >
                  {isFavoris && (
                    <span className="flex items-center">
                      <HeartIcon filled={isActive} light={isActive} />
                    </span>
                  )}
                  {f}
                  <span className="ml-1 text-xs" style={{ opacity: isActive ? 0.6 : 0.55 }}>
                    {filterCounts[f]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm font-medium text-[#7A8F7D]">
            <span className="font-bold text-[#1C2B1E]">{filtered.length}</span>{" "}
            {showFavoritesOnly ? "favoris" : "recettes"}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onToggleFav={toggleFav}
                isFav={favorites.has(r.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-4 text-5xl">{showFavoritesOnly ? "💔" : "🔍"}</div>
            <p className="font-lora text-base font-bold text-[#1C2B1E]">
              {showFavoritesOnly ? "Aucun favori pour l'instant" : "Aucune recette trouvée"}
            </p>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">
              {showFavoritesOnly
                ? "Touchez le cœur sur une recette pour l'ajouter ici"
                : "Essayez un autre filtre ou mot-clé"}
            </p>
            {!showFavoritesOnly && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
              >
                <PlusIcon size={13} /> Ajouter une recette
              </button>
            )}
            {showFavoritesOnly && (
              <button
                type="button"
                onClick={() => setActiveFilter("Tout")}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
              >
                Voir toutes les recettes
              </button>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddRecipeModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
