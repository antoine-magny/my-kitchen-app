"use client";

import { useEffect, useMemo, useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { FeaturedCard } from "@/components/recettes/featured-card";
import { RecipeCard } from "@/components/recettes/recipe-card";
import { RecipeFilterPills } from "@/components/recettes/recipe-filter-pills";
import { RecipeFiltersPanel } from "@/components/recettes/recipe-filters-panel";
import { DEFAULT_FAVORITES, readFavorites, writeFavorites } from "@/lib/favorites";
import {
  countAdvancedFilters,
  countRecipesByTag,
  filterRecipes,
  hasActiveCatalogFilters,
  type TimeFilterId,
} from "@/lib/recipe-filters";
import {
  RECIPES,
  RECIPE_TAGS,
  addCustomRecipe,
  getAllRecipes,
  type NewRecipeInput,
  type Recipe,
  type RecipeCost,
  type RecipeDifficulty,
  type RecipeTag,
} from "@/lib/recipes";

export default function RecettesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<RecipeTag[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterId | null>(null);
  const [difficulties, setDifficulties] = useState<RecipeDifficulty[]>([]);
  const [costs, setCosts] = useState<RecipeCost[]>([]);
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

  const catalogQuery = useMemo(
    () => ({
      selectedTags,
      favoritesOnly,
      favoriteIds: favorites,
      timeFilter,
      difficulties,
      costs,
      query,
    }),
    [selectedTags, favoritesOnly, favorites, timeFilter, difficulties, costs, query],
  );

  const showFeatured = !hasActiveCatalogFilters(catalogQuery);
  const featured = showFeatured ? (recipes.find((r) => r.featured) ?? recipes[0]) : undefined;
  const filtered = filterRecipes(recipes, {
    ...catalogQuery,
    excludeId: featured?.id,
  });
  const advancedCount = countAdvancedFilters(catalogQuery);

  const tagCounts = Object.fromEntries(
    RECIPE_TAGS.map((tag) => [tag, countRecipesByTag(recipes, tag)]),
  ) as Record<RecipeTag, number>;

  const resetAdvanced = () => {
    setTimeFilter(null);
    setDifficulties([]);
    setCosts([]);
  };

  const toggleTag = (tag: RecipeTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleDifficulty = (value: RecipeDifficulty) => {
    setDifficulties((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const toggleCost = (value: RecipeCost) => {
    setCosts((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <main className="mx-auto max-w-md px-5 py-8 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:py-10">
        <div className="mb-8">
          <div className="mb-4">
            <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Collection</p>
            <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">Mes Recettes</h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5"
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2EBE3",
                boxShadow: "0 2px 12px rgba(28,43,30,0.06)",
              }}
            >
              <span className="shrink-0 text-[#7A8F7D]">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titre ou ingrédient…"
                className="min-w-0 flex-1 truncate bg-transparent text-base font-medium text-[#1C2B1E] outline-none"
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

        {featured ? (
          <FeaturedCard recipe={featured} onToggleFav={toggleFav} isFav={favorites.has(featured.id)} />
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <RecipeFilterPills
            selectedTags={selectedTags}
            favoritesOnly={favoritesOnly}
            favoriteCount={recipes.filter((r) => favorites.has(r.id)).length}
            tagCounts={tagCounts}
            totalCount={recipes.length}
            advancedCount={advancedCount}
            onSelectTout={() => {
              setSelectedTags([]);
              setFavoritesOnly(false);
            }}
            onToggleFavoris={() => setFavoritesOnly((prev) => !prev)}
            onToggleTag={toggleTag}
            onOpenFilters={() => setShowFilters(true)}
          />
          <p className="text-sm font-medium text-[#7A8F7D]">
            <span className="font-bold text-[#1C2B1E]">{filtered.length}</span>{" "}
            {favoritesOnly ? "favoris" : "recettes"}
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
            <div className="mb-4 text-5xl">{favoritesOnly ? "💔" : "🔍"}</div>
            <p className="font-lora text-base font-bold text-[#1C2B1E]">
              {favoritesOnly ? "Aucun favori pour l'instant" : "Aucune recette trouvée"}
            </p>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">
              {favoritesOnly
                ? "Touchez le cœur sur une recette pour l'ajouter ici"
                : "Essayez un autre filtre ou mot-clé"}
            </p>
            {!favoritesOnly ? (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
              >
                <PlusIcon size={13} /> Ajouter une recette
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFavoritesOnly(false)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
              >
                Voir toutes les recettes
              </button>
            )}
          </div>
        )}
      </main>

      {showAddModal ? (
        <AddRecipeModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      ) : null}

      {showFilters ? (
        <RecipeFiltersPanel
          timeFilter={timeFilter}
          difficulties={difficulties}
          costs={costs}
          onTimeFilter={setTimeFilter}
          onToggleDifficulty={toggleDifficulty}
          onToggleCost={toggleCost}
          onReset={resetAdvanced}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
    </div>
  );
}
