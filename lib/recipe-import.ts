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
};

export type RecipeFormIngredientRow = {
  name: string;
  amount: string;
  unit: UnitCode;
};

export function emptyIngredientRow(): RecipeFormIngredientRow {
  return { name: "", amount: "", unit: "g" };
}

export function emptyParsedRecipe(): ParsedRecipe {
  return {
    title: "",
    prep_time: "15 min",
    cook_time: "20 min",
    servings: 4,
    calories_per_serving: 400,
    protein_per_serving: 20,
    ingredients: [{ name: "", amount: 0, unit: "g" }],
    instructions: [""],
  };
}
