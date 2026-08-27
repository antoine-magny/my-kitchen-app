/**
 * Agrégation calories / protéines de l'historique nutritionnel en séries
 * prêtes à tracer : une barre par jour (semaine) ou par semaine (mois).
 */
import {
  addDays,
  addMonths,
  formatDayShortFr,
  formatMonthYearFr,
  formatWeekLabel,
  isoDateFromCalendar,
  parisCalendarDate,
  startOfMonth,
  startOfWeek,
} from "@/lib/date-paris";
import type { NutritionHistory } from "@/lib/nutrition-history";
import { MONTHS_FR } from "@/lib/planning";

export type PeriodMode = "week" | "month";

export type NutritionBar = {
  key: string;
  /** Libellé principal sous la barre (« Lun », « S1 »). */
  label: string;
  /** Précision sous le libellé (numéro du jour, plage de dates). */
  caption: string;
  calories: number;
  proteins: number;
  hasData: boolean;
};

export type NutritionPeriod = {
  mode: PeriodMode;
  title: string;
  bars: NutritionBar[];
  /** Moyennes calculées sur les seuls jours renseignés. */
  avgCalories: number;
  avgProteins: number;
  daysWithData: number;
};

/** Recul maximal autorisé, aligné sur la rétention d'un an de l'historique. */
export const MIN_PERIOD_OFFSET: Record<PeriodMode, number> = { week: -51, month: -11 };

type DayTotals = { calories: number; proteins: number; hasData: boolean };

function totalsFor(history: NutritionHistory, date: Date): DayTotals {
  const entry = history[isoDateFromCalendar(date)];
  if (!entry) return { calories: 0, proteins: 0, hasData: false };
  return { calories: entry.calories, proteins: entry.proteins, hasData: true };
}

function average(total: number, count: number): number {
  return count > 0 ? Math.round(total / count) : 0;
}

function buildWeekBars(history: NutritionHistory, weekStart: Date): NutritionBar[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const totals = totalsFor(history, day);
    return {
      key: isoDateFromCalendar(day),
      label: formatDayShortFr(day),
      caption: String(day.getUTCDate()),
      ...totals,
    };
  });
}

/** Une barre par semaine du mois, valorisée par la moyenne de ses jours renseignés. */
function buildMonthBars(history: NutritionHistory, monthStart: Date): NutritionBar[] {
  const monthIndex = monthStart.getUTCMonth();
  const bars: NutritionBar[] = [];
  let current: { first: number; last: number; calories: number; proteins: number; days: number } | null = null;

  const flush = () => {
    if (!current) return;
    bars.push({
      key: `w${bars.length}`,
      label: `S${bars.length + 1}`,
      caption: current.first === current.last ? `${current.first}` : `${current.first}–${current.last}`,
      calories: average(current.calories, current.days),
      proteins: average(current.proteins, current.days),
      hasData: current.days > 0,
    });
  };

  for (let day = startOfMonth(monthStart); day.getUTCMonth() === monthIndex; day = addDays(day, 1)) {
    const isWeekStart = day.getUTCDate() === 1 || day.getTime() === startOfWeek(day).getTime();
    if (isWeekStart) {
      flush();
      current = { first: day.getUTCDate(), last: day.getUTCDate(), calories: 0, proteins: 0, days: 0 };
    }
    if (!current) continue;
    current.last = day.getUTCDate();
    const totals = totalsFor(history, day);
    if (!totals.hasData) continue;
    current.calories += totals.calories;
    current.proteins += totals.proteins;
    current.days += 1;
  }
  flush();
  return bars;
}

/** Somme des jours renseignés de la période, pour les moyennes journalières. */
function periodAverages(history: NutritionHistory, start: Date, dayCount: number) {
  let calories = 0;
  let proteins = 0;
  let daysWithData = 0;
  for (let index = 0; index < dayCount; index++) {
    const totals = totalsFor(history, addDays(start, index));
    if (!totals.hasData) continue;
    calories += totals.calories;
    proteins += totals.proteins;
    daysWithData += 1;
  }
  return {
    avgCalories: average(calories, daysWithData),
    avgProteins: average(proteins, daysWithData),
    daysWithData,
  };
}

function daysInMonth(monthStart: Date): number {
  return addDays(addMonths(startOfMonth(monthStart), 1), -1).getUTCDate();
}

/**
 * Série de la période courante décalée de `offset` (0 = semaine / mois en cours,
 * −1 = période précédente).
 */
export function buildNutritionPeriod(
  history: NutritionHistory,
  mode: PeriodMode,
  offset: number,
  today: Date = parisCalendarDate(),
): NutritionPeriod {
  if (mode === "week") {
    const weekStart = addDays(startOfWeek(today), offset * 7);
    return {
      mode,
      title: formatWeekLabel(weekStart, MONTHS_FR),
      bars: buildWeekBars(history, weekStart),
      ...periodAverages(history, weekStart, 7),
    };
  }

  const monthStart = startOfMonth(addMonths(startOfMonth(today), offset));
  return {
    mode,
    title: formatMonthYearFr(monthStart),
    bars: buildMonthBars(history, monthStart),
    ...periodAverages(history, monthStart, daysInMonth(monthStart)),
  };
}
