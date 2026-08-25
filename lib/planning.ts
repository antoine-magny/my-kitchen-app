/**
 * Logique du planning de repas : structure d'une journée planifiée, amorçage
 * d'une semaine et agrégation des ingrédients pour l'export vers la liste de
 * courses. Aucun rendu ici — la page `app/planning` ne garde que l'UI.
 */
import {
  addDays,
  calendarDateFromIso,
  dayKey,
  isoDateFromCalendar,
  mondayBasedIndex,
  parisCalendarDate,
  sameDay,
  startOfWeek,
} from "@/lib/date-paris";
import { getRecipeById, ing, type RecipeIngredient, type Recipe } from "@/lib/recipes";
import type { PlannedMealRef } from "@/types/inventory";

const LUNCH_RECIPE = getRecipeById(6)!;

export const MEAL_PLANS_KEY = "my-kitchen-meal-plans-v1";

export const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type BreakfastItem = {
  id: string;
  name: string;
  detail: string;
  calories: number;
  proteins: number;
};

export type DayPlan = {
  breakfast: BreakfastItem | null;
  lunchId: number | null;
  dinnerId: number | null;
};

export const EMPTY_DAY_PLAN: DayPlan = {
  breakfast: null,
  lunchId: null,
  dinnerId: null,
};

export function dayHasMeals(plan: DayPlan | undefined): boolean {
  if (!plan) return false;
  return plan.breakfast != null || plan.lunchId != null || plan.dinnerId != null;
}

export function breakfastRecipeId(breakfast: BreakfastItem | null): number | null {
  if (!breakfast?.id.startsWith("recipe-")) return null;
  const parsed = Number(breakfast.id.slice("recipe-".length));
  return Number.isFinite(parsed) ? parsed : null;
}

export function applyRecipeToDay(plan: DayPlan, slot: MealSlot, recipe: Recipe): DayPlan {
  const next: DayPlan = { ...plan };
  if (slot === "breakfast") {
    next.breakfast = {
      id: `recipe-${recipe.id}`,
      name: recipe.title,
      detail: `${recipe.difficulty} · ${recipe.time}`,
      calories: recipe.calories,
      proteins: recipe.proteins,
    };
  }
  if (slot === "lunch") next.lunchId = recipe.id;
  if (slot === "dinner") next.dinnerId = recipe.id;
  return next;
}

export function buildInitialPlans(weekStart: Date): Record<string, DayPlan> {
  const isCurrentWeek = sameDay(weekStart, startOfWeek(parisCalendarDate()));
  const seedIndex = isCurrentWeek ? mondayBasedIndex(parisCalendarDate()) : -1;
  const plans: Record<string, DayPlan> = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const key = dayKey(day);
    const seeded = i === seedIndex;
    plans[key] = {
      breakfast: seeded
        ? {
            id: "bf-yaourt",
            name: "Yaourt grec & granola",
            detail: "Maison · 5 min",
            calories: 320,
            proteins: 18,
          }
        : null,
      lunchId: seeded ? LUNCH_RECIPE.id : null,
      dinnerId: null,
    };
  }
  return plans;
}

/** Ingrédients d'un créneau précis (petit-déj / déjeuner / dîner). */
export function ingredientsFromMealSlot(
  plan: DayPlan,
  mealType: MealSlot,
): RecipeIngredient[] {
  if (mealType === "breakfast") {
    if (!plan.breakfast) return [];
    if (plan.breakfast.id.startsWith("recipe-")) {
      const recipeId = Number(plan.breakfast.id.slice("recipe-".length));
      const recipe = Number.isFinite(recipeId) ? getRecipeById(recipeId) : undefined;
      if (recipe) return [...recipe.ingredients];
      return [ing(plan.breakfast.name, 1, "piece")];
    }
    if (plan.breakfast.id === "bf-yaourt") {
      return [ing("Yaourt grec", 1, "piece"), ing("Granola", 40, "g")];
    }
    return [ing(plan.breakfast.name, 1, "piece")];
  }

  const recipeId = mealType === "lunch" ? plan.lunchId : plan.dinnerId;
  if (recipeId == null) return [];
  const recipe = getRecipeById(recipeId);
  return recipe ? [...recipe.ingredients] : [];
}

/**
 * Clé interne du planning (`dayKey`) : `YYYY-M-D` avec mois **0-indexé**,
 * non paddé. Distinct de l'ISO `YYYY-MM-DD` porté par `PlannedMealRef.date`.
 */
function parseDayKey(key: string): Date | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [year, month, day] = parts;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const parsed = new Date(Date.UTC(year, month, day, 12, 0, 0));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return parsed;
}

/**
 * Normalise une date planning vers ISO `YYYY-MM-DD`.
 * Accepte la clé `dayKey` (mois 0-indexé) ou un ISO déjà canonique.
 */
export function toIsoDateFromPlanningKey(date: string): string | null {
  const trimmed = date.trim();
  const fromDayKey = parseDayKey(trimmed);
  if (fromDayKey && dayKey(fromDayKey) === trimmed) {
    return isoDateFromCalendar(fromDayKey);
  }
  const fromIso = calendarDateFromIso(trimmed);
  if (fromIso) return isoDateFromCalendar(fromIso);
  return null;
}

export function collectIngredientsFromDayOnward(
  fromDay: Date,
  currentWeekStart: Date,
  currentWeekPlans: Record<string, DayPlan>,
  plansByWeek: Record<string, Record<string, DayPlan>>,
): RecipeIngredient[] {
  const weeks: Record<string, Record<string, DayPlan>> = {
    ...plansByWeek,
    [dayKey(currentWeekStart)]: currentWeekPlans,
  };

  const collected: RecipeIngredient[] = [];
  const fromTs = fromDay.getTime();

  for (const plans of Object.values(weeks)) {
    for (const [key, plan] of Object.entries(plans)) {
      const day = parseDayKey(key);
      if (!day || day.getTime() < fromTs) continue;
      for (const mealType of ["breakfast", "lunch", "dinner"] as const) {
        const ingredients = ingredientsFromMealSlot(plan, mealType);
        if (ingredients.length === 0) continue;
        const mealRef = plannedMealRefFromSlot(plan, key, mealType);
        for (const ingredient of ingredients) {
          collected.push({ ...ingredient, plannedMeals: [mealRef] });
        }
      }
    }
  }

  return collected;
}

/** Cible d'export granulaire : un créneau d'un jour donné. */
export interface SelectedMealTarget {
  /** Clé `dayKey` du planning, ou ISO `YYYY-MM-DD`. Normalisée en ISO sur `PlannedMealRef`. */
  date: string;
  mealType: MealSlot;
}

function resolveDayPlan(
  date: string,
  weekPlans: Record<string, DayPlan>,
  plansByWeek?: Record<string, Record<string, DayPlan>>,
): DayPlan | undefined {
  const lookupKeys = [date];
  const fromIso = calendarDateFromIso(date);
  if (fromIso) lookupKeys.push(dayKey(fromIso));

  function findIn(plans: Record<string, DayPlan>): DayPlan | undefined {
    for (const key of lookupKeys) {
      if (plans[key]) return plans[key];
    }
    return undefined;
  }

  const fromWeek = findIn(weekPlans);
  if (fromWeek) return fromWeek;
  if (!plansByWeek) return undefined;
  for (const plans of Object.values(plansByWeek)) {
    const found = findIn(plans);
    if (found) return found;
  }
  return undefined;
}

/** Titre affiché d'un créneau planifié, ou `null` s'il est vide. */
export function mealSlotTitle(plan: DayPlan, mealType: MealSlot): string | null {
  if (mealType === "breakfast") return plan.breakfast?.name ?? null;
  const recipeId = mealType === "lunch" ? plan.lunchId : plan.dinnerId;
  if (recipeId == null) return null;
  return getRecipeById(recipeId)?.title ?? null;
}

function plannedMealRefFromSlot(
  plan: DayPlan,
  date: string,
  mealType: MealSlot,
): PlannedMealRef {
  const recipeId =
    mealType === "breakfast"
      ? breakfastRecipeId(plan.breakfast)
      : mealType === "lunch"
        ? plan.lunchId
        : plan.dinnerId;
  const recipeTitle =
    mealSlotTitle(plan, mealType) ??
    (mealType === "breakfast" ? "Petit-déjeuner" : mealType === "lunch" ? "Déjeuner" : "Dîner");

  return {
    ...(recipeId != null ? { recipeId } : {}),
    recipeTitle,
    date: toIsoDateFromPlanningKey(date) ?? date,
    mealType,
  };
}

/**
 * Extrait la liste plate de `RecipeIngredient[]` pour une sélection précise
 * de repas (fusion / dédoublonnage délégués à la liste de courses).
 * Chaque ingrédient porte `plannedMeals` (recette, date YYYY-MM-DD, créneau).
 */
export function collectIngredientsFromSelectedMeals(
  selectedMeals: SelectedMealTarget[],
  weekPlans: Record<string, DayPlan>,
  plansByWeek?: Record<string, Record<string, DayPlan>>,
): RecipeIngredient[] {
  const collected: RecipeIngredient[] = [];
  const seenMeals = new Set<string>();

  for (const { date, mealType } of selectedMeals) {
    const selectionKey = `${date}|${mealType}`;
    if (seenMeals.has(selectionKey)) continue;
    seenMeals.add(selectionKey);

    const plan = resolveDayPlan(date, weekPlans, plansByWeek);
    if (!plan) continue;
    const ingredients = ingredientsFromMealSlot(plan, mealType);
    if (ingredients.length === 0) continue;
    const mealRef = plannedMealRefFromSlot(plan, date, mealType);
    for (const ingredient of ingredients) {
      collected.push({ ...ingredient, plannedMeals: [mealRef] });
    }
  }

  return collected;
}

function parseStoredMealPlans(raw: string | null): Record<string, Record<string, DayPlan>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, Record<string, DayPlan>>;
  } catch {
    return {};
  }
}

/**
 * Ajoute le seed de la semaine en cours s'il n'existe pas encore.
 * Idempotent : une semaine déjà sauvée (même vide) n'est jamais réécrite.
 */
export function withCurrentWeekSeed(
  plansByWeek: Record<string, Record<string, DayPlan>>,
  today: Date = parisCalendarDate(),
): Record<string, Record<string, DayPlan>> {
  const weekStart = startOfWeek(today);
  const weekId = dayKey(weekStart);
  if (Object.prototype.hasOwnProperty.call(plansByWeek, weekId)) {
    return plansByWeek;
  }
  return { ...plansByWeek, [weekId]: buildInitialPlans(weekStart) };
}

export function getStoredMealPlans(): Record<string, Record<string, DayPlan>> {
  if (typeof window === "undefined") return {};
  const stored = parseStoredMealPlans(window.localStorage.getItem(MEAL_PLANS_KEY));
  const seeded = withCurrentWeekSeed(stored);
  if (seeded !== stored) saveMealPlans(seeded);
  return seeded;
}

export function saveMealPlans(plansByWeek: Record<string, Record<string, DayPlan>>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(plansByWeek));
}

export function getPlanForDay(
  date: Date,
  plansByWeek?: Record<string, Record<string, DayPlan>>,
): DayPlan {
  const allPlans = plansByWeek ?? getStoredMealPlans();
  const ws = startOfWeek(date);
  const weekPlans = allPlans[dayKey(ws)];
  if (!weekPlans) return { ...EMPTY_DAY_PLAN };
  return weekPlans[dayKey(date)] ?? { ...EMPTY_DAY_PLAN };
}

export function getTodayMainMeal(todayDate: Date = parisCalendarDate()): {
  mealType: MealSlot;
  recipe?: Recipe;
  breakfast?: BreakfastItem;
} | null {
  const plan = getPlanForDay(todayDate);
  const isEvening = todayDate.getHours() >= 14;

  if (isEvening && plan.dinnerId != null) {
    return { mealType: "dinner", recipe: getRecipeById(plan.dinnerId) };
  }
  if (plan.lunchId != null) {
    return { mealType: "lunch", recipe: getRecipeById(plan.lunchId) };
  }
  if (plan.dinnerId != null) {
    return { mealType: "dinner", recipe: getRecipeById(plan.dinnerId) };
  }
  if (plan.breakfast != null) {
    return { mealType: "breakfast", breakfast: plan.breakfast };
  }
  return null;
}
