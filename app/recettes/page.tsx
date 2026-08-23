"use client";

import { useEffect, useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { HeartIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { FeaturedCard } from "@/components/recettes/featured-card";
import { RecipeCard } from "@/components/recettes/recipe-card";
import { DEFAULT_FAVORITES, readFavorites, writeFavorites } from "@/lib/favorites";
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
