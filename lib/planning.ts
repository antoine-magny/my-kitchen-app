/**
 * Logique du planning de repas : structure d'une journée planifiée, amorçage
 * d'une semaine et agrégation des ingrédients pour l'export vers la liste de
 * courses. Aucun rendu ici — la page `app/planning` ne garde que l'UI.
 */
import {
  addDays,
  dayKey,
  mondayBasedIndex,
  parisCalendarDate,
  sameDay,
  startOfWeek,
} from "@/lib/date-paris";
import { getRecipeById, type RecipeIngredient } from "@/lib/recipes";

const LUNCH_RECIPE = getRecipeById(6)!;

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

export const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

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

function parseDayKey(key: string): Date | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
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

function ingredientsFromDayPlan(plan: DayPlan): RecipeIngredient[] {
  const items: RecipeIngredient[] = [];

  if (plan.breakfast) {
    if (plan.breakfast.id.startsWith("recipe-")) {
      const recipeId = Number(plan.breakfast.id.slice("recipe-".length));
      const recipe = Number.isFinite(recipeId) ? getRecipeById(recipeId) : undefined;
      if (recipe) items.push(...recipe.ingredients);
      else items.push({ name: plan.breakfast.name, amount: "1 portion" });
    } else if (plan.breakfast.id === "bf-yaourt") {
      items.push(
        { name: "Yaourt grec", amount: "1 pot" },
        { name: "Granola", amount: "40 g" },
      );
    } else {
      items.push({ name: plan.breakfast.name, amount: "1 portion" });
    }
  }

  for (const recipeId of [plan.lunchId, plan.dinnerId]) {
    if (recipeId == null) continue;
    const recipe = getRecipeById(recipeId);
    if (recipe) items.push(...recipe.ingredients);
  }

  return items;
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
      collected.push(...ingredientsFromDayPlan(plan));
    }
  }

  return collected;
}
