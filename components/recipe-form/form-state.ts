import { emptyIngredientRow, type RecipeFormIngredientRow } from "@/lib/recipe-import";
import {
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTags,
  type Recipe,
  type RecipeCost,
  type RecipeDifficulty,
  type RecipeStep,
  type RecipeTag,
} from "@/lib/recipes";

export type Difficulty = RecipeDifficulty;

export function toDifficulty(value: string): Difficulty {
  return coerceRecipeDifficulty(value);
}

export function toTags(recipe?: Recipe): RecipeTag[] {
  return coerceRecipeTags(recipe?.tags);
}

export function toCost(recipe?: Recipe): RecipeCost {
  return coerceRecipeCost(recipe?.cost);
}

export function initialIngredientRows(recipe?: Recipe): RecipeFormIngredientRow[] {
  return recipe?.ingredients.length
    ? recipe.ingredients.map((row) => ({
        name: row.name,
        amount: String(row.amount),
        unit: row.unit,
      }))
    : [emptyIngredientRow()];
}

export function initialSteps(recipe?: Recipe): RecipeStep[] {
  return recipe?.steps.length
    ? recipe.steps.map((step) => ({ ...step, duration: step.duration ?? "" }))
    : [{ title: "", detail: "", duration: "" }];
}
