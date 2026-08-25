"use client";

import { PlusIcon } from "@/components/icons";
import { RecipeCard } from "@/components/recettes/recipe-card";
import type { Recipe } from "@/lib/recipes";

export function RecipesGrid({
  recipes,
  favorites,
  favoritesOnly,
  onToggleFav,
  onAdd,
  onShowAll,
}: {
  recipes: Recipe[];
  favorites: Set<number>;
  favoritesOnly: boolean;
  onToggleFav: (id: number) => void;
  onAdd: () => void;
  onShowAll: () => void;
}) {
  if (recipes.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onToggleFav={onToggleFav}
            isFav={favorites.has(r.id)}
          />
        ))}
      </div>
    );
  }

  return (
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
          onClick={onAdd}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
        >
          <PlusIcon size={13} /> Ajouter une recette
        </button>
      ) : (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
        >
          Voir toutes les recettes
        </button>
      )}
    </div>
  );
}
