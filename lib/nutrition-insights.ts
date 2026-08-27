/**
 * Lectures transverses de l'historique nutritionnel : diversité des sources de
 * protéines, recettes les plus réalisées et aliments les plus consommés.
 */
import { addDays, isoDateFromCalendar, parisCalendarDate } from "@/lib/date-paris";
import { getIngredientById } from "@/lib/ingredients";
import type { DayNutrition, NutritionHistory } from "@/lib/nutrition-history";
import { PROTEIN_SOURCES, PROTEIN_SOURCE_COUNT, type ProteinSourceId } from "@/lib/protein-sources";

/** Jours renseignés de la fenêtre glissante se terminant aujourd'hui. */
function recentDays(
  history: NutritionHistory,
  windowDays: number,
  today: Date,
): { iso: string; entry: DayNutrition }[] {
  const days: { iso: string; entry: DayNutrition }[] = [];
  for (let back = 0; back < windowDays; back++) {
    const iso = isoDateFromCalendar(addDays(today, -back));
    const entry = history[iso];
    if (entry) days.push({ iso, entry });
  }
  return days;
}

export type DiversityFamily = {
  id: ProteinSourceId;
  label: string;
  emoji: string;
  /** Nombre de jours de la fenêtre où cette famille apparaît. */
  days: number;
};

export type DiversityStats = {
  /** Sources de protéines distinctes par jour, en moyenne. */
  avgSources: number;
  daysWithData: number;
  windowDays: number;
  families: DiversityFamily[];
  /** Familles distinctes rencontrées sur toute la fenêtre. */
  familiesCovered: number;
  totalFamilies: number;
};

export function buildDiversityStats(
  history: NutritionHistory,
  windowDays = 7,
  today: Date = parisCalendarDate(),
): DiversityStats {
  const days = recentDays(history, windowDays, today);
  const dayCountBySource = new Map<ProteinSourceId, number>();
  let totalSources = 0;

  for (const { entry } of days) {
    totalSources += entry.sources.length;
    for (const source of entry.sources) {
      dayCountBySource.set(source, (dayCountBySource.get(source) ?? 0) + 1);
    }
  }

  const families = PROTEIN_SOURCES.map((source) => ({
    ...source,
    days: dayCountBySource.get(source.id) ?? 0,
  })).sort((a, b) => b.days - a.days);

  return {
    avgSources: days.length > 0 ? Math.round((totalSources / days.length) * 10) / 10 : 0,
    daysWithData: days.length,
    windowDays,
    families,
    familiesCovered: dayCountBySource.size,
    totalFamilies: PROTEIN_SOURCE_COUNT,
  };
}

export type TopRecipe = {
  title: string;
  count: number;
  /** Part des repas de la fenêtre, en pourcentage. */
  share: number;
  lastIso: string;
};

export type RecipeStats = {
  top: TopRecipe[];
  totalMeals: number;
  distinctRecipes: number;
  /** Repas différents rapportés au total, en pourcentage (variété du répertoire). */
  varietyPercent: number;
  windowDays: number;
};

export function buildRecipeStats(
  history: NutritionHistory,
  windowDays = 365,
  limit = 5,
  today: Date = parisCalendarDate(),
): RecipeStats {
  const byTitle = new Map<string, { count: number; lastIso: string }>();
  let totalMeals = 0;

  for (const { iso, entry } of recentDays(history, windowDays, today)) {
    for (const title of entry.recipes) {
      totalMeals += 1;
      const previous = byTitle.get(title);
      if (previous) previous.count += 1;
      else byTitle.set(title, { count: 1, lastIso: iso });
    }
  }

  const top = [...byTitle.entries()]
    .map(([title, { count, lastIso }]) => ({
      title,
      count,
      share: totalMeals > 0 ? Math.round((count / totalMeals) * 100) : 0,
      lastIso,
    }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "fr"))
    .slice(0, limit);

  return {
    top,
    totalMeals,
    distinctRecipes: byTitle.size,
    varietyPercent: totalMeals > 0 ? Math.round((byTitle.size / totalMeals) * 100) : 0,
    windowDays,
  };
}

export type HighlightStat = { value: string; label: string };

/** Trois chiffres clés de la semaine glissante, pour l'aperçu et l'en-tête. */
export function buildWeeklyHighlights(
  history: NutritionHistory,
  windowDays = 7,
  today: Date = parisCalendarDate(),
): HighlightStat[] {
  const days = recentDays(history, windowDays, today);
  const calories = days.reduce((sum, { entry }) => sum + entry.calories, 0);
  const meals = days.reduce((sum, { entry }) => sum + entry.meals, 0);
  const distinct = new Set(days.flatMap(({ entry }) => entry.recipes)).size;
  const avgCalories = days.length > 0 ? Math.round(calories / days.length) : 0;
  return [
    { value: avgCalories.toLocaleString("fr-FR"), label: "kcal / jour" },
    { value: String(meals), label: "repas cuisinés" },
    { value: String(distinct), label: "recettes différentes" },
  ];
}

export type TopFood = {
  id: string;
  label: string;
  emoji?: string;
  /** Nombre de jours de la fenêtre où l'aliment est cuisiné. */
  days: number;
  share: number;
};

/** `ing_tomates_cerises` → « Tomates cerises » pour les aliments hors catalogue. */
function labelFromIngredientId(id: string): string {
  const words = id.replace(/^ing_/, "").replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Aliment";
}

export function buildTopFoods(
  history: NutritionHistory,
  windowDays = 30,
  limit = 4,
  today: Date = parisCalendarDate(),
): TopFood[] {
  const days = recentDays(history, windowDays, today);
  const dayCountById = new Map<string, number>();
  for (const { entry } of days) {
    for (const id of entry.ingredients) {
      dayCountById.set(id, (dayCountById.get(id) ?? 0) + 1);
    }
  }

  return [...dayCountById.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, count]) => {
      const catalogItem = getIngredientById(id);
      return {
        id,
        label: catalogItem?.name ?? labelFromIngredientId(id),
        ...(catalogItem?.emoji ? { emoji: catalogItem.emoji } : {}),
        days: count,
        share: days.length > 0 ? Math.round((count / days.length) * 100) : 0,
      };
    });
}
