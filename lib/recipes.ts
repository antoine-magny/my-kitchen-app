import { coerceUnitCode } from "@/lib/units";
import { describeIngredient } from "@/lib/ingredients";
import type { RecipeIngredient } from "@/types/inventory";
import { RECIPES } from "@/lib/recipes-data";
import {
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTags,
  ingFromText,
  withDerivedTags,
  type Recipe,
} from "@/lib/recipe-model";

export { RECIPES } from "@/lib/recipes-data";
export {
  ATTRIBUTE_TAGS,
  DIFFICULTIES,
  MEAL_TAGS,
  RECIPE_COSTS,
  RECIPE_COST_LABELS,
  RECIPE_COST_SYMBOLS,
  RECIPE_TAG_LABELS,
  RECIPE_TAG_COLORS,
  RECIPE_TAG_CODES_HINT,
  DIFFICULTY_TOQUE_COUNT,
  RECIPE_TAGS,
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTag,
  coerceRecipeTags,
  ing,
  ingFromText,
  isRecipeTag,
  tagToLabel,
  recipeBadgeTags,
  recipeBadgeLabels,
  withDerivedTags,
  type Recipe,
  type RecipeCost,
  type RecipeDifficulty,
  type RecipeStep,
  type RecipeTag,
  type RecipeTagColor,
} from "@/lib/recipe-model";
export type { RecipeIngredient };

const CUSTOM_RECIPES_KEY = "my-kitchen-custom-recipes";
const RECIPE_OVERRIDES_KEY = "my-kitchen-recipe-overrides";
const DELETED_RECIPES_KEY = "my-kitchen-deleted-recipes";

/**
 * Remet un ingrédient au format structuré.
 * Les recettes enregistrées avant la refonte stockaient `amount` en toutes
 * lettres (« 150 g ») et n'avaient ni `ingredientId` ni rayon.
 */
function sanitizeIngredient(raw: unknown): RecipeIngredient | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<RecipeIngredient> & { amount?: unknown };
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!name) return null;

  if (typeof entry.amount === "number" && entry.unit && coerceUnitCode(String(entry.unit))) {
    return {
      ...describeIngredient(name, entry.category),
      amount: entry.amount,
      unit: coerceUnitCode(String(entry.unit))!,
    };
  }

  return ingFromText(name, typeof entry.amount === "string" ? entry.amount : "");
}

function sanitizeRecipe(raw: unknown): Recipe | null {
  if (!raw || typeof raw !== "object") return null;
  const recipe = raw as Recipe & { tag?: unknown; tagLabel?: unknown };
  if (typeof recipe.id !== "number" || typeof recipe.title !== "string") return null;
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map(sanitizeIngredient)
        .filter((ing): ing is RecipeIngredient => ing != null)
    : [];
  const time = typeof recipe.time === "string" ? recipe.time : "30 min";
  const tags = withDerivedTags(coerceRecipeTags(recipe.tags, recipe.tag), time);
  const { tag: _legacyTag, tagLabel: _tagLabel, ...rest } = recipe;
  return {
    ...rest,
    time,
    ingredients,
    tags,
    cost: coerceRecipeCost(recipe.cost),
    difficulty: coerceRecipeDifficulty(recipe.difficulty),
  };
}

function readCustomRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeRecipe).filter((r): r is Recipe => r != null);
  } catch {
    return [];
  }
}

function writeCustomRecipes(recipes: Recipe[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
}

function readOverrides(): Record<string, Recipe> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RECIPE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const overrides: Record<string, Recipe> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const recipe = sanitizeRecipe(value);
      if (recipe) overrides[key] = recipe;
    }
    return overrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, Recipe>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECIPE_OVERRIDES_KEY, JSON.stringify(overrides));
}

function readDeletedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_RECIPES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? new Set(parsed.filter((n) => Number.isFinite(n))) : new Set();
  } catch {
    return new Set();
  }
}

function writeDeletedIds(ids: Set<number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DELETED_RECIPES_KEY, JSON.stringify([...ids]));
}

export function getAllRecipes(): Recipe[] {
  const overrides = readOverrides();
  const deleted = readDeletedIds();
  const base = RECIPES.filter((r) => !deleted.has(r.id)).map(
    (r) => overrides[String(r.id)] ?? r,
  );
  const custom = readCustomRecipes()
    .filter((r) => !deleted.has(r.id))
    .map((r) => overrides[String(r.id)] ?? r);
  return [...base, ...custom];
}

export function getRecipeById(id: number): Recipe | undefined {
  return getAllRecipes().find((r) => r.id === id);
}

export type NewRecipeInput = Omit<Recipe, "id" | "featured">;

export function addCustomRecipe(input: NewRecipeInput): Recipe {
  const custom = readCustomRecipes();
  const maxId = Math.max(0, ...RECIPES.map((r) => r.id), ...custom.map((r) => r.id));
  const recipe: Recipe = { ...input, id: maxId + 1 };
  writeCustomRecipes([recipe, ...custom]);
  return recipe;
}

export function updateRecipe(id: number, input: NewRecipeInput): Recipe {
  const existing = getRecipeById(id);
  const updated: Recipe = {
    ...input,
    id,
    featured: existing?.featured,
    photo: input.photo,
  };

  const custom = readCustomRecipes();
  const customIndex = custom.findIndex((r) => r.id === id);
  if (customIndex >= 0) {
    const next = [...custom];
    next[customIndex] = updated;
    writeCustomRecipes(next);
    return updated;
  }

  const overrides = readOverrides();
  overrides[String(id)] = updated;
  writeOverrides(overrides);
  return updated;
}

/** Supprime une recette (custom ou seed) de la liste visible. */
export function deleteRecipe(id: number): boolean {
  const custom = readCustomRecipes();
  const customIndex = custom.findIndex((r) => r.id === id);
  if (customIndex >= 0) {
    writeCustomRecipes(custom.filter((r) => r.id !== id));
  }

  const overrides = readOverrides();
  if (overrides[String(id)]) {
    delete overrides[String(id)];
    writeOverrides(overrides);
  }

  const deleted = readDeletedIds();
  deleted.add(id);
  writeDeletedIds(deleted);

  return true;
}


