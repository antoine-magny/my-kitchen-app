import {
  emptyIngredientRow,
  type ParsedRecipe,
  type RecipeFormIngredientRow,
} from "@/lib/recipe-import";
import { coerceUnitCode, type UnitCode } from "@/lib/units";

export function parsedToFormState(recipe: ParsedRecipe): {
  title: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  calories: string;
  proteins: string;
  ingredients: RecipeFormIngredientRow[];
  instructions: string[];
} {
  return {
    title: recipe.title,
    prepTime: recipe.prep_time || "15 min",
    cookTime: recipe.cook_time || "20 min",
    servings: String(recipe.servings || 4),
    calories: String(recipe.calories_per_serving || 400),
    proteins: String(recipe.protein_per_serving || 20),
    ingredients: recipe.ingredients.length
      ? recipe.ingredients.map((ing) => ({
          name: ing.name,
          amount: String(ing.amount ?? ""),
          unit: (coerceUnitCode(ing.unit) ?? "g") as UnitCode,
        }))
      : [emptyIngredientRow()],
    instructions: recipe.instructions.length ? recipe.instructions : [""],
  };
}
