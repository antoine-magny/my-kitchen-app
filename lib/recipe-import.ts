import type { RecipeCost, RecipeDifficulty, RecipeTag } from "@/lib/recipe-model";
import type { UnitCode } from "@/lib/units";

/** Broullon extrait par Gemini / formulaire d’ajout. */
export type ParsedRecipe = {
  title: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  instructions: string[];
  tags: RecipeTag[];
  difficulty: RecipeDifficulty;
  cost: RecipeCost;
};

export type RecipeFormIngredientRow = {
  name: string;
  amount: string;
  unit: UnitCode;
};

export function emptyIngredientRow(): RecipeFormIngredientRow {
  return { name: "", amount: "", unit: "g" };
}
