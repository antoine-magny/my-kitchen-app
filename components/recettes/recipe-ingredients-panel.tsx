"use client";

import { IngredientIcon } from "@/components/ingredient-icon";
import type { Recipe } from "@/lib/recipes";
import { formatAmount } from "@/lib/units";

export function RecipeIngredientsPanel({ recipe }: { recipe: Recipe }) {
  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      {recipe.ingredients.map((ing, idx) => {
        const missing = (recipe.missingIngredients ?? []).some(
          (name) => name.toLowerCase() === ing.name.toLowerCase(),
        );
        return (
          <div
            key={`${ing.ingredientId}-${idx}`}
            className="flex items-center justify-between gap-3 px-5 py-3.5"
            style={{
              borderBottom: idx < recipe.ingredients.length - 1 ? "1px solid #F0F4EF" : "none",
              background: missing ? "#FFF7ED" : undefined,
            }}
          >
            <span className="flex min-w-0 flex-1 items-center text-sm font-semibold break-words text-[#1C2B1E]">
              {ing.icon && ing.icon !== "2205" && ing.icon !== "2753" && ing.icon !== "∅" ? (
                <div className="mr-2 flex shrink-0 items-center justify-center">
                  <IngredientIcon iconHex={ing.icon} size={20} />
                </div>
              ) : null}
              <span className="min-w-0 flex-1 break-words">{ing.name}</span>
            </span>
            <span className="shrink-0 text-right">
              {missing ? (
                <span className="mr-2 text-[11px] font-bold text-[#C2410C]">⚠️ Manque</span>
              ) : null}
              <span className="text-sm font-bold text-[#4A7C59]">
                {formatAmount(ing.amount, ing.unit)}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
