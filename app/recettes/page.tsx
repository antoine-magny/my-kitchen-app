"use client";

import { useEffect, useMemo, useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { FeaturedCard } from "@/components/recettes/featured-card";
import { RecipeFilterPills } from "@/components/recettes/recipe-filter-pills";
import { RecipeFiltersPanel } from "@/components/recettes/recipe-filters-panel";
import { RecipesGrid } from "@/components/recettes/recipes-grid";
import { RecipesHeader } from "@/components/recettes/recipes-header";
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
        <RecipesHeader
          query={query}
          onQueryChange={setQuery}
          onAdd={() => setShowAddModal(true)}
        />

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

        <RecipesGrid
          recipes={filtered}
          favorites={favorites}
          favoritesOnly={favoritesOnly}
          onToggleFav={toggleFav}
          onAdd={() => setShowAddModal(true)}
          onShowAll={() => setFavoritesOnly(false)}
        />
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
