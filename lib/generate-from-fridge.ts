/**
 * Génération / suggestion de recettes à partir du frigo.
 *
 * - match_existing : matching déterministe sur le catalogue.
 * - ai_create : provider Gemini injecté (GEMINI_API_KEY) → NewRecipeInput dans recipeDraft
 *   (persistance via addCustomRecipe côté client).
 */

import type { FridgeItem, FridgeSnapshotItem } from "@/lib/fridge";
import { getFridgeSnapshot, toFridgeSnapshotItem } from "@/lib/fridge";
import { type MealType } from "@/lib/meal-types";
import {
  getAllRecipes,
  type NewRecipeInput,
  type Recipe,
  type RecipeIngredient,
} from "@/lib/recipes";
import { normalizeProductName } from "@/lib/shopping-categories";

export type GenerateFromFridgeMode = "match_existing" | "ai_create";

export type GenerateFromFridgeRequest = {
  items: FridgeSnapshotItem[];
  mode?: GenerateFromFridgeMode;
  /** Nombre d’options de recettes souhaitées (défaut 2). */
  mealCount?: number;
  /** Favorise les recettes utilisant des DLC urgentes. */
  preferExpiring?: boolean;
  /** Exclut les desserts (défaut true). */
  excludeDesserts?: boolean;
  /** Type de repas ciblé (petit-déjeuner / déjeuner / dîner). */
  mealType?: MealType;
  /** Date cible YYYY-MM-DD. */
  targetDate?: string;
};

export type GenerateFromFridgeSuggestion = {
  source: "existing" | "ai";
  /** Présent si source = existing */
  recipeId?: number;
  title: string;
  score: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
  /** Présent si source = ai — à passer à addCustomRecipe côté client */
  recipeDraft?: NewRecipeInput;
};

export type GenerateFromFridgeResult = {
  mode: GenerateFromFridgeMode;
  suggestions: GenerateFromFridgeSuggestion[];
  /** true si le provider LLM n’est pas configuré / a échoué */
  aiUnavailable?: boolean;
  message?: string;
};

/** Provider injecté depuis la route API (module server-only). */
export type AiRecipeProviderResult = {
  draft: NewRecipeInput;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
};

export type AiRecipeProvider = (
  items: FridgeSnapshotItem[],
  options: {
    mealCount: number;
    preferExpiring: boolean;
    excludeDesserts: boolean;
    mealType: MealType;
    targetDate?: string;
  },
) => Promise<AiRecipeProviderResult[]>;

export type GenerateFromFridgeOptions = {
  aiProvider?: AiRecipeProvider;
};

/** Épices / bases souvent omises du matching « manquant ». */
const PANTRY_STAPLES = [
  "sel",
  "poivre",
  "fleur de sel",
  "huile",
  "huile d olive",
  "eau",
  "beurre",
] as const;

function significantTokens(name: string): string[] {
  return normalizeProductName(name)
    .split(" ")
    .filter((t) => t.length >= 3)
    .filter((t) => !["des", "les", "une", "aux", "avec", "pour", "dans"].includes(t));
}

function isStaple(ingredientName: string): boolean {
  const n = normalizeProductName(ingredientName);
  return PANTRY_STAPLES.some((s) => n === s || n.includes(s) || s.includes(n));
}

function parseRecipeMinutes(time: string): number | null {
  const match = time.match(/(\d+)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function recipeFitsMealType(
  recipe: Recipe,
  mealType: MealType | undefined,
  excludeDesserts: boolean,
): boolean {
  if (excludeDesserts && recipe.tag === "Desserts" && mealType !== "breakfast") return false;
  if (!mealType) return true;
  if (mealType === "breakfast") {
    const minutes = parseRecipeMinutes(recipe.time);
    if (minutes != null && minutes > 35) return false;
  }
  return true;
}

export function ingredientNamesMatch(a: string, b: string): boolean {
  const na = normalizeProductName(a);
  const nb = normalizeProductName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  const ta = new Set(significantTokens(a));
  if (ta.size === 0) return false;
  return significantTokens(b).some((t) => ta.has(t));
}

/**
 * Cherche l'article de frigo correspondant à un ingrédient de recette.
 * L'identifiant canonique prime : il est exact et résiste aux renommages.
 * Le rapprochement flou par nom ne sert que de filet de sécurité.
 */
function findFridgeMatch(
  ingredient: RecipeIngredient,
  fridge: FridgeSnapshotItem[],
): FridgeSnapshotItem | undefined {
  const byId = fridge.find((item) => item.ingredientId === ingredient.ingredientId);
  if (byId) return byId;
  return fridge.find((item) => ingredientNamesMatch(ingredient.name, item.name));
}

function scoreRecipeAgainstFridge(
  recipe: Recipe,
  fridge: FridgeSnapshotItem[],
  preferExpiring: boolean,
): GenerateFromFridgeSuggestion | null {
  if (recipe.ingredients.length === 0) return null;

  const matched: string[] = [];
  const missing: string[] = [];
  let urgencyHits = 0;
  let weightedTotal = 0;
  let weightedMatched = 0;

  for (const ing of recipe.ingredients) {
    const staple = isStaple(ing.name);
    const weight = staple ? 0.35 : 1;
    weightedTotal += weight;

    const hit = findFridgeMatch(ing, fridge);
    if (hit) {
      matched.push(ing.name);
      weightedMatched += weight;
      if (hit.urgency === "urgent" || hit.urgency === "soon") urgencyHits += 1;
    } else if (!staple) {
      missing.push(ing.name);
    }
  }

  if (weightedTotal <= 0) return null;

  let score = weightedMatched / weightedTotal;
  if (preferExpiring && urgencyHits > 0) {
    score = Math.min(1, score + Math.min(0.25, urgencyHits * 0.08));
  }

  // Au moins un vrai match non-staple, ou couverture correcte
  const realMatches = matched.filter((name) => !isStaple(name));
  if (realMatches.length === 0 && score < 0.5) return null;
  if (score < 0.28) return null;

  const coveragePct = Math.round((matched.length / recipe.ingredients.length) * 100);
  const reasonParts = [`${coveragePct}% des ingrédients déjà dans le frigo`];
  if (urgencyHits > 0) {
    reasonParts.push(
      `${urgencyHits} produit${urgencyHits > 1 ? "s" : ""} bientôt périmé${urgencyHits > 1 ? "s" : ""} utilisé`,
    );
  }
  if (missing.length > 0) {
    reasonParts.push(`${missing.length} à acheter`);
  }

  return {
    source: "existing",
    recipeId: recipe.id,
    title: recipe.title,
    score,
    matchedIngredients: matched,
    missingIngredients: missing,
    reason: reasonParts.join(" · "),
  };
}

/**
 * Matching déterministe catalogue ↔ frigo.
 * Utilisable côté client (recettes custom incluses) et serveur (seed).
 */
export function matchRecipesFromFridge(
  fridge: FridgeSnapshotItem[],
  recipes: Recipe[],
  options: {
    mealCount?: number;
    preferExpiring?: boolean;
    /** Exclut les desserts (défaut true pour le planning repas). */
    excludeDesserts?: boolean;
    mealType?: MealType;
  } = {},
): GenerateFromFridgeSuggestion[] {
  const mealCount = Math.max(1, options.mealCount ?? 2);
  const preferExpiring = options.preferExpiring ?? true;
  const excludeDesserts = options.excludeDesserts ?? true;
  const mealType = options.mealType;

  if (fridge.length === 0) return [];

  const catalog = recipes.filter((recipe) => recipeFitsMealType(recipe, mealType, excludeDesserts));

  const ranked = catalog
    .map((recipe) => scoreRecipeAgainstFridge(recipe, fridge, preferExpiring))
    .filter((s): s is GenerateFromFridgeSuggestion => s != null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "fr"));

  const picked: GenerateFromFridgeSuggestion[] = [];
  const usedIds = new Set<number>();

  for (const suggestion of ranked) {
    if (suggestion.recipeId != null && usedIds.has(suggestion.recipeId)) continue;
    picked.push(suggestion);
    if (suggestion.recipeId != null) usedIds.add(suggestion.recipeId);
    if (picked.length >= mealCount) break;
  }

  return picked;
}

/** Entrée client : lit le frigo local + toutes les recettes (seed + custom). */
export function suggestRecipesFromFridge(options?: {
  mealCount?: number;
  preferExpiring?: boolean;
  excludeDesserts?: boolean;
  items?: FridgeItem[];
}): GenerateFromFridgeResult {
  const snapshot =
    options?.items != null
      ? options.items.filter((i) => i.amount > 0).map((i) => toFridgeSnapshotItem(i))
      : getFridgeSnapshot();

  const suggestions = matchRecipesFromFridge(snapshot, getAllRecipes(), {
    mealCount: options?.mealCount ?? 2,
    preferExpiring: options?.preferExpiring ?? true,
    excludeDesserts: options?.excludeDesserts ?? true,
  });

  return {
    mode: "match_existing",
    suggestions,
    message:
      suggestions.length === 0
        ? "Aucune recette ne correspond assez bien à votre frigo. Ajoutez des ingrédients ou créez une recette."
        : undefined,
  };
}

/**
 * Orchestrateur serveur / API.
 * Mode `ai_create` : appelle `aiProvider` (clé serveur), parse en recipeDraft.
 * Sans provider / en erreur : fallback matching + aiUnavailable.
 */
export async function generateFromFridge(
  request: GenerateFromFridgeRequest,
  recipes: Recipe[],
  options: GenerateFromFridgeOptions = {},
): Promise<GenerateFromFridgeResult> {
  const mode = request.mode ?? "match_existing";
  const mealCount = request.mealCount ?? 2;
  const preferExpiring = request.preferExpiring ?? true;
  const excludeDesserts = request.excludeDesserts ?? true;
  const mealType = request.mealType ?? "lunch";
  const targetDate = request.targetDate;

  if (mode === "ai_create") {
    const fallback = () =>
      matchRecipesFromFridge(request.items, recipes, {
        mealCount,
        preferExpiring,
        excludeDesserts,
        mealType,
      });

    if (!options.aiProvider) {
      const suggestions = fallback();
      return {
        mode,
        suggestions,
        aiUnavailable: true,
        message:
          suggestions.length > 0
            ? "Génération IA non configurée — suggestions basées sur vos recettes existantes."
            : "Génération IA non configurée et aucune recette compatible trouvée.",
      };
    }

    try {
      const created = await options.aiProvider(request.items, {
        mealCount,
        preferExpiring,
        excludeDesserts,
        mealType,
        targetDate,
      });

      const suggestions: GenerateFromFridgeSuggestion[] = created.map((item, index) => ({
        source: "ai" as const,
        title: item.draft.title,
        score: Math.max(0.55, 1 - index * 0.08),
        matchedIngredients: item.matchedIngredients,
        missingIngredients: item.missingIngredients,
        reason: item.reason,
        recipeDraft: {
          ...item.draft,
          missingIngredients: item.missingIngredients,
        },
      }));

      return {
        mode,
        suggestions,
        message:
          suggestions.length === 0
            ? "L’IA n’a proposé aucune recette exploitable."
            : undefined,
      };
    } catch (error) {
      const suggestions = fallback();
      const detail =
        error instanceof Error && error.message
          ? error.message
          : "Génération IA indisponible.";
      return {
        mode,
        suggestions,
        aiUnavailable: true,
        message:
          suggestions.length > 0
            ? `${detail} — suggestions basées sur vos recettes existantes.`
            : detail,
      };
    }
  }

  const suggestions = matchRecipesFromFridge(request.items, recipes, {
    mealCount,
    preferExpiring,
    excludeDesserts,
    mealType,
  });

  return {
    mode: "match_existing",
    suggestions,
    message:
      suggestions.length === 0
        ? "Aucune recette ne correspond assez bien à votre frigo."
        : undefined,
  };
}
