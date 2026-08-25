import { describeIngredient } from "@/lib/ingredients";
import { parseMinutes } from "@/lib/recipe-time";
import { parseAmount, type UnitCode } from "@/lib/units";
import type { RecipeIngredient } from "@/types/inventory";

export type { RecipeIngredient };

export const RECIPE_TAGS = [
  "entree",
  "plat",
  "dessert",
  "express",
  "vegetarien",
  "riche_en_proteines",
] as const;

export type RecipeTag = (typeof RECIPE_TAGS)[number];

export const MEAL_TAGS = ["entree", "plat", "dessert"] as const satisfies readonly RecipeTag[];
export const ATTRIBUTE_TAGS = [
  "express",
  "vegetarien",
  "riche_en_proteines",
] as const satisfies readonly RecipeTag[];

export const RECIPE_TAG_LABELS: Record<RecipeTag, string> = {
  entree: "Entrée",
  plat: "Plat",
  dessert: "Dessert",
  express: "Express",
  vegetarien: "Végétarien",
  riche_en_proteines: "Riche en protéines",
};

export type RecipeTagColor = {
  bg: string;
  text: string;
  accent: string;
  accentSoft: string;
  accentShadow: string;
};

const MEAL_TAG_COLOR: RecipeTagColor = {
  bg: "rgba(28,43,30,0.72)",
  text: "#E8F5EC",
  accent: "#1C2B1E",
  accentSoft: "#C8E0CF",
  accentShadow: "rgba(28,43,30,0.18)",
};

export const RECIPE_TAG_COLORS: Record<RecipeTag, RecipeTagColor> = {
  entree: MEAL_TAG_COLOR,
  plat: MEAL_TAG_COLOR,
  dessert: MEAL_TAG_COLOR,
  express: {
    bg: "rgba(249,115,22,0.88)",
    text: "#FFF",
    accent: "#F97316",
    accentSoft: "#FCD9B6",
    accentShadow: "rgba(249,115,22,0.25)",
  },
  vegetarien: {
    bg: "rgba(74,124,89,0.82)",
    text: "#FFF",
    accent: "#4A7C59",
    accentSoft: "#C8E0CF",
    accentShadow: "rgba(74,124,89,0.22)",
  },
  riche_en_proteines: {
    bg: "rgba(59,130,246,0.80)",
    text: "#FFF",
    accent: "#3B82F6",
    accentSoft: "#BFDBFE",
    accentShadow: "rgba(59,130,246,0.25)",
  },
};

/** Codes autorisés pour Gemini / le formulaire — identiques aux puces du catalogue. */
export const RECIPE_TAG_CODES_HINT = RECIPE_TAGS.join(" | ");

export const RECIPE_COSTS = ["economique", "moyen", "premium"] as const;
export type RecipeCost = (typeof RECIPE_COSTS)[number];

export const RECIPE_COST_LABELS: Record<RecipeCost, string> = {
  economique: "Économique",
  moyen: "Moyen",
  premium: "Premium",
};

export const RECIPE_COST_SYMBOLS: Record<RecipeCost, "€" | "€€" | "€€€"> = {
  economique: "€",
  moyen: "€€",
  premium: "€€€",
};

export const DIFFICULTIES = ["Facile", "Moyen", "Difficile"] as const;
export type RecipeDifficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_TOQUE_COUNT: Record<RecipeDifficulty, 1 | 2 | 3> = {
  Facile: 1,
  Moyen: 2,
  Difficile: 3,
};

const TAG_SET = new Set<string>(RECIPE_TAGS);
const COST_SET = new Set<string>(RECIPE_COSTS);
const DIFFICULTY_SET = new Set<string>(DIFFICULTIES);

const LEGACY_TAG_MAP: Record<string, RecipeTag> = {
  Express: "express",
  express: "express",
  "Végétarien": "vegetarien",
  Vegetarien: "vegetarien",
  vegetarien: "vegetarien",
  "Riche en protéines": "riche_en_proteines",
  "riche_en_proteines": "riche_en_proteines",
  Desserts: "dessert",
  Dessert: "dessert",
  dessert: "dessert",
  Entrée: "entree",
  Entree: "entree",
  entree: "entree",
  Plat: "plat",
  plat: "plat",
  Encas: "plat",
  encas: "plat",
};

export function isRecipeTag(value: unknown): value is RecipeTag {
  return typeof value === "string" && TAG_SET.has(value);
}

export function isRecipeCost(value: unknown): value is RecipeCost {
  return typeof value === "string" && COST_SET.has(value);
}

export function isRecipeDifficulty(value: unknown): value is RecipeDifficulty {
  return typeof value === "string" && DIFFICULTY_SET.has(value);
}

export function coerceRecipeTag(value: unknown): RecipeTag | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Tout") return null;
  if (isRecipeTag(trimmed)) return trimmed;
  return LEGACY_TAG_MAP[trimmed] ?? null;
}

export function coerceRecipeTags(rawTags: unknown, legacyTag?: unknown): RecipeTag[] {
  const collected: RecipeTag[] = [];
  if (Array.isArray(rawTags)) {
    for (const item of rawTags) {
      const tag = coerceRecipeTag(item);
      if (tag) collected.push(tag);
    }
  } else {
    const fromLegacy = coerceRecipeTag(legacyTag);
    if (fromLegacy) collected.push(fromLegacy);
  }

  const unique = [...new Set(collected)];
  const hasMeal = unique.some((tag) => (MEAL_TAGS as readonly string[]).includes(tag));
  return hasMeal ? unique : [...unique, "plat"];
}

export function coerceRecipeCost(value: unknown): RecipeCost {
  return isRecipeCost(value) ? value : "moyen";
}

export function coerceRecipeDifficulty(value: unknown): RecipeDifficulty {
  return isRecipeDifficulty(value) ? value : "Facile";
}

/** `express` est dérivé du temps (≤ 15 min), pas un choix décorrélé. */
export function withDerivedTags(tags: RecipeTag[], time: string): RecipeTag[] {
  const withoutExpress = tags.filter((tag) => tag !== "express");
  const minutes = parseMinutes(time);
  if (minutes != null && minutes <= 15) return [...withoutExpress, "express"];
  return withoutExpress;
}

export function tagToLabel(tag: RecipeTag): string {
  return RECIPE_TAG_LABELS[tag];
}

export function recipeBadgeTags(recipe: Pick<Recipe, "tags">, max = 2): RecipeTag[] {
  const meal = recipe.tags.filter((tag) => (MEAL_TAGS as readonly string[]).includes(tag));
  const attrs = recipe.tags.filter((tag) => (ATTRIBUTE_TAGS as readonly string[]).includes(tag));
  return [...meal, ...attrs].slice(0, max);
}

export function recipeBadgeLabels(recipe: Pick<Recipe, "tags">, max = 2): string[] {
  return recipeBadgeTags(recipe, max).map(tagToLabel);
}

/**
 * Fabrique un ingrédient de recette : l'identité canonique (ingredientId, rayon,
 * emoji) est dérivée du nom, seules la quantité et l'unité sont explicites.
 */
export function ing(name: string, amount: number, unit: UnitCode): RecipeIngredient {
  return { ...describeIngredient(name), amount, unit };
}

/** Variante pour les quantités écrites en toutes lettres (« 150 g », « q.s. »). */
export function ingFromText(name: string, amount: string): RecipeIngredient {
  const { amount: value, unit } = parseAmount(amount);
  return ing(name, value, unit);
}

export interface RecipeStep {
  title: string;
  detail: string;
  duration?: string;
}

export interface Recipe {
  id: number;
  title: string;
  photo: string;
  time: string;
  calories: number;
  proteins: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags: RecipeTag[];
  cost: RecipeCost;
  featured?: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  /** Ingrédients absents du frigo (basiques, 1 ou 2 max) — recettes générées IA. */
  missingIngredients?: string[];
}
