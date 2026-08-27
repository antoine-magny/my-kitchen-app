/**
 * Historique nutritionnel quotidien, conservé 1 an dans le localStorage.
 *
 * Le planning (`my-kitchen-meal-plans-v1`) reste la source de vérité : chaque
 * lecture le re-dérive puis l'archive. L'archive prend le relais pour les jours
 * qui ne sont plus dans le planning, et tout ce qui dépasse un an est purgé.
 */
import {
  addDays,
  calendarDateFromIso,
  isoDateFromCalendar,
  parisCalendarDate,
} from "@/lib/date-paris";
import {
  breakfastRecipeId,
  getStoredMealPlans,
  toIsoDateFromPlanningKey,
  type DayPlan,
  type MealSlot,
} from "@/lib/planning";
import { collectProteinSources, isProteinSourceId, type ProteinSourceId } from "@/lib/protein-sources";
import { getAllRecipes, type Recipe } from "@/lib/recipes";

export const NUTRITION_HISTORY_KEY = "my-kitchen-nutrition-history-v1";

/** Durée de rétention des statistiques nutritionnelles. */
export const HISTORY_RETENTION_DAYS = 365;

export type DayNutrition = {
  calories: number;
  proteins: number;
  /** Créneaux réellement renseignés (0 à 3). */
  meals: number;
  /** Titres des repas du jour, un par créneau renseigné. */
  recipes: string[];
  /** `ingredientId` distincts cuisinés ce jour-là. */
  ingredients: string[];
  /** Familles protéiques distinctes du jour. */
  sources: ProteinSourceId[];
};

/** Indexé par date ISO `YYYY-MM-DD`. */
export type NutritionHistory = Record<string, DayNutrition>;

const MEAL_SLOTS: readonly MealSlot[] = ["breakfast", "lunch", "dinner"];

type SlotIngredient = { ingredientId?: string; name?: string };

function slotRecipe(plan: DayPlan, slot: MealSlot, recipesById: Map<number, Recipe>): Recipe | undefined {
  const id =
    slot === "breakfast"
      ? breakfastRecipeId(plan.breakfast)
      : slot === "lunch"
        ? plan.lunchId
        : plan.dinnerId;
  return id == null ? undefined : recipesById.get(id);
}

/** Petit-déjeuner libre : le seed « bf-yaourt » a une composition connue. */
function breakfastIngredients(plan: DayPlan): SlotIngredient[] {
  if (!plan.breakfast) return [];
  if (plan.breakfast.id === "bf-yaourt") {
    return [{ name: "Yaourt grec" }, { name: "Granola" }];
  }
  return [{ name: plan.breakfast.name }];
}

function dayNutritionFromPlan(plan: DayPlan, recipesById: Map<number, Recipe>): DayNutrition | null {
  let calories = 0;
  let proteins = 0;
  const recipes: string[] = [];
  const ingredientIds = new Set<string>();
  const ingredients: SlotIngredient[] = [];

  for (const slot of MEAL_SLOTS) {
    const recipe = slotRecipe(plan, slot, recipesById);
    const isFreeBreakfast = slot === "breakfast" && plan.breakfast != null && !recipe;
    if (!recipe && !isFreeBreakfast) continue;

    if (recipe) {
      calories += recipe.calories;
      proteins += recipe.proteins;
      recipes.push(recipe.title);
      for (const ingredient of recipe.ingredients) {
        ingredients.push(ingredient);
        if (ingredient.ingredientId) ingredientIds.add(ingredient.ingredientId);
      }
    } else if (plan.breakfast) {
      calories += plan.breakfast.calories;
      proteins += plan.breakfast.proteins;
      recipes.push(plan.breakfast.name);
      ingredients.push(...breakfastIngredients(plan));
    }
  }

  if (recipes.length === 0) return null;
  return {
    calories: Math.round(calories),
    proteins: Math.round(proteins),
    meals: recipes.length,
    recipes,
    ingredients: [...ingredientIds],
    sources: collectProteinSources(ingredients),
  };
}

/** Re-dérive l'historique depuis le planning, limité à la fenêtre de rétention. */
export function buildHistoryFromPlanning(today: Date = parisCalendarDate()): NutritionHistory {
  const plansByWeek = getStoredMealPlans();
  const recipesById = new Map(getAllRecipes().map((recipe) => [recipe.id, recipe]));
  const floor = addDays(today, -HISTORY_RETENTION_DAYS).getTime();
  const history: NutritionHistory = {};

  for (const weekPlans of Object.values(plansByWeek)) {
    if (!weekPlans || typeof weekPlans !== "object") continue;
    for (const [planningKey, plan] of Object.entries(weekPlans)) {
      const iso = toIsoDateFromPlanningKey(planningKey);
      const date = iso ? calendarDateFromIso(iso) : null;
      if (!iso || !date || date.getTime() < floor) continue;
      const entry = dayNutritionFromPlan(plan, recipesById);
      if (entry) history[iso] = entry;
    }
  }
  return history;
}

function sanitizeEntry(raw: unknown): DayNutrition | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<DayNutrition>;
  const recipes = Array.isArray(entry.recipes) ? entry.recipes.filter((r) => typeof r === "string") : [];
  if (recipes.length === 0) return null;
  const number = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
  return {
    calories: number(entry.calories),
    proteins: number(entry.proteins),
    meals: number(entry.meals) || recipes.length,
    recipes,
    ingredients: Array.isArray(entry.ingredients)
      ? entry.ingredients.filter((id) => typeof id === "string")
      : [],
    sources: Array.isArray(entry.sources) ? entry.sources.filter(isProteinSourceId) : [],
  };
}

function readStoredHistory(): NutritionHistory {
  try {
    const raw = window.localStorage.getItem(NUTRITION_HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const history: NutritionHistory = {};
    for (const [iso, value] of Object.entries(parsed as Record<string, unknown>)) {
      const entry = sanitizeEntry(value);
      if (entry && calendarDateFromIso(iso)) history[iso] = entry;
    }
    return history;
  } catch {
    return {};
  }
}

function pruneHistory(history: NutritionHistory, today: Date): NutritionHistory {
  const floorIso = isoDateFromCalendar(addDays(today, -HISTORY_RETENTION_DAYS));
  const pruned: NutritionHistory = {};
  for (const [iso, entry] of Object.entries(history)) {
    if (iso >= floorIso) pruned[iso] = entry;
  }
  return pruned;
}

/**
 * Historique fusionné (archive + planning) purgé au-delà d'un an, puis réécrit.
 * À n'appeler que côté client, après hydratation.
 */
export function loadNutritionHistory(today: Date = parisCalendarDate()): NutritionHistory {
  if (typeof window === "undefined") return {};
  const merged = pruneHistory(
    { ...readStoredHistory(), ...buildHistoryFromPlanning(today) },
    today,
  );
  try {
    window.localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(merged));
  } catch {
    // Quota dépassé : l'historique reste exploitable en mémoire pour la session.
  }
  return merged;
}
