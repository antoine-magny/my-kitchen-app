import { emptyIngredientRow, type RecipeFormIngredientRow } from "@/lib/recipe-import";
import {
  DIFFICULTIES,
  type Recipe,
  type RecipeFilter,
  type RecipeStep,
} from "@/lib/recipes";

export type Difficulty = (typeof DIFFICULTIES)[number];

export function toDifficulty(value: string): Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value) ? (value as Difficulty) : "Facile";
}

export function toTag(value: RecipeFilter | null | undefined): Exclude<RecipeFilter, "Tout"> | "" {
  if (!value || value === "Tout") return "";
  return value;
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
