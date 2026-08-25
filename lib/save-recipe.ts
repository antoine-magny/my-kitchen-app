import "server-only";

import type { ParsedRecipe } from "@/lib/recipe-import";
import {
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTags,
  ing,
  withDerivedTags,
  type NewRecipeInput,
  type RecipeIngredient,
  type RecipeStep,
} from "@/lib/recipes";
import { parseMinutes } from "@/lib/recipe-time";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_UNIT, normalizeUnit, type UnitCode } from "@/lib/units";

export type RecipeFormIngredient = {
  name: string;
  amount: number | string;
  unit: string;
};

export type RecipeFormPayload = Omit<ParsedRecipe, "ingredients"> & {
  ingredients: RecipeFormIngredient[];
  /** URL http(s) uniquement — les data URLs ne sont pas persistées en base. */
  photo_url?: string | null;
  difficulty?: NewRecipeInput["difficulty"];
  tags?: NewRecipeInput["tags"];
  cost?: NewRecipeInput["cost"];
};

export type SavedRecipeResult = {
  supabaseId: string;
  local: NewRecipeInput;
};

/**
 * Persiste une recette validée dans Supabase (recipes + recipe_ingredients),
 * et renvoie aussi un NewRecipeInput pour le store local / UI.
 */
export async function saveRecipeToSupabase(
  payload: RecipeFormPayload,
): Promise<SavedRecipeResult> {
  const title = payload.title.trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const cleanedIngredients = payload.ingredients
    .map((row) => {
      const unit = normalizeUnit(row.unit);
      return {
        name: row.name.trim(),
        amount: unit === "qs" ? 0 : toPositiveAmount(row.amount),
        unit,
      };
    })
    .filter((row) => row.name.length > 0);

  const instructions = payload.instructions
    .map((step) => step.trim())
    .filter(Boolean);

  if (cleanedIngredients.length === 0) {
    throw new Error("Ajoutez au moins un ingrédient.");
  }
  if (instructions.length === 0) {
    throw new Error("Ajoutez au moins une étape.");
  }

  const servings = Math.max(1, Math.round(payload.servings) || 1);
  const prepMinutes = parseMinutes(payload.prep_time);
  const cookMinutes = parseMinutes(payload.cook_time);
  const totalMinutes =
    prepMinutes != null || cookMinutes != null
      ? (prepMinutes ?? 0) + (cookMinutes ?? 0)
      : null;

  const difficultyUi = coerceRecipeDifficulty(payload.difficulty);
  const difficultyDb = toDbDifficulty(difficultyUi);
  const photoUrl = asHttpUrl(payload.photo_url) ?? null;

  const instructionsText = instructions
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");
  const userId = user.id;

  const { data: recipeRow, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      title,
      instructions: instructionsText,
      prep_time_minutes: totalMinutes,
      difficulty: difficultyDb,
      servings,
      photo_url: photoUrl,
    })
    .select("id")
    .single();

  if (recipeError || !recipeRow) {
    throw new Error(recipeError?.message ?? "Échec de l’insertion de la recette.");
  }

  const recipeId = recipeRow.id;

  // Déduplique par nom (clé composite recipe_id + ingredient_id).
  const merged = new Map<string, { name: string; amount: number; unit: UnitCode }>();
  for (const ing of cleanedIngredients) {
    const key = ing.name.toLowerCase();
    const existing = merged.get(key);
    if (existing && existing.unit === ing.unit) {
      existing.amount += ing.amount;
    } else if (!existing) {
      merged.set(key, { ...ing });
    } else {
      // Unités différentes : conserve la première, ajoute un suffixe pour la suivante.
      merged.set(`${key}__${ing.unit}`, { ...ing });
    }
  }

  try {
    for (const ing of merged.values()) {
      const ingredientId = await findOrCreateIngredient(ing.name, ing.unit, userId);
      const { error: linkError } = await supabase.from("recipe_ingredients").insert({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity: ing.amount,
        unit: ing.unit,
        user_id: userId,
      });
      if (linkError) {
        throw new Error(linkError.message);
      }
    }
  } catch (error) {
    await supabase.from("recipes").delete().eq("id", recipeId);
    throw error;
  }

  const local = toNewRecipeInput(payload, cleanedIngredients, instructions, photoUrl);
  return { supabaseId: recipeId, local };
}

async function findOrCreateIngredient(name: string, unit: UnitCode, userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("ingredients")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);
  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("ingredients")
    .insert({
      name,
      default_unit: unit || DEFAULT_UNIT,
      user_id: userId,
    })
    .select("id")
    .single();

  if (insertError) {
    // Course possible : un autre insert a créé le même citext.
    const { data: retry } = await supabase
      .from("ingredients")
      .select("id")
      .eq("name", name)
      .maybeSingle();
    if (retry?.id) return retry.id;
    throw new Error(insertError.message);
  }

  if (!created?.id) throw new Error("Impossible de créer l’ingrédient.");
  return created.id;
}

export function toNewRecipeInput(
  payload: RecipeFormPayload,
  ingredients: Array<{ name: string; amount: number; unit: UnitCode }>,
  instructions: string[],
  photoUrl: string | null,
): NewRecipeInput {
  const prep = payload.prep_time.trim() || "15 min";
  const cook = payload.cook_time.trim() || "0 min";
  const prepMin = parseMinutes(prep) ?? 0;
  const cookMin = parseMinutes(cook) ?? 0;
  const total = prepMin + cookMin;
  const time =
    total > 0
      ? `${total} min`
      : prep !== "0 min"
        ? prep
        : cook;

  const recipeIngredients: RecipeIngredient[] = ingredients.map((row) =>
    ing(row.name, row.amount, row.unit),
  );

  const steps: RecipeStep[] = instructions.map((detail, index) => ({
    title: `Étape ${index + 1}`,
    detail,
  }));

  const tags = withDerivedTags(
    coerceRecipeTags(payload.tags),
    time,
    Math.max(0, Math.round(payload.protein_per_serving) || 0),
  );

  return {
    title: payload.title.trim(),
    photo: photoUrl ?? "",
    time,
    calories: Math.max(0, Math.round(payload.calories_per_serving) || 0),
    proteins: Math.max(0, Math.round(payload.protein_per_serving) || 0),
    servings: Math.max(1, Math.round(payload.servings) || 1),
    difficulty: coerceRecipeDifficulty(payload.difficulty),
    tags,
    cost: coerceRecipeCost(payload.cost),
    ingredients: recipeIngredients,
    steps,
  };
}

function toPositiveAmount(value: number | string): number {
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return 1;
  return n;
}

export { parseMinutes } from "@/lib/recipe-time";

function toDbDifficulty(value: NewRecipeInput["difficulty"]): string {
  if (value === "Facile") return "facile";
  if (value === "Difficile") return "difficile";
  return "moyen";
}

function asHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}
