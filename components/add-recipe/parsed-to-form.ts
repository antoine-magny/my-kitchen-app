import { emptyIngredientRow, type ParsedRecipe, type RecipeFormIngredientRow } from "@/lib/recipe-import";
import {
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTags,
  withDerivedTags,
} from "@/lib/recipe-model";
import { coerceUnitCode, type UnitCode } from "@/lib/units";
import type { RecipeCost, RecipeDifficulty, RecipeTag } from "@/lib/recipes";

export function parsedToFormState(recipe: ParsedRecipe): {
  title: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  calories: string;
  proteins: string;
  tags: RecipeTag[];
  difficulty: RecipeDifficulty;
  cost: RecipeCost;
  ingredients: RecipeFormIngredientRow[];
  instructions: string[];
} {
  const prepTime = recipe.prep_time || "15 min";
  const cookTime = recipe.cook_time || "20 min";
  return {
    title: recipe.title,
    prepTime,
    cookTime,
    servings: String(recipe.servings || 4),
    calories: String(recipe.calories_per_serving || 400),
    proteins: String(recipe.protein_per_serving || 20),
    tags: withDerivedTags(
      coerceRecipeTags(recipe.tags),
      `${prepTime} ${cookTime}`,
    ),
    difficulty: coerceRecipeDifficulty(recipe.difficulty),
    cost: coerceRecipeCost(recipe.cost),
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
