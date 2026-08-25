/**
 * Données statiques pour l'interface de statistiques détaillées.
 * Fichier 100% pur TypeScript (zéro JSX).
 *
 * Les données sont figées pour l'instant (démo). Une future itération
 * les remplacera par des requêtes Supabase + agrégation du localStorage.
 */

export type DailyCalorieEntry = {
  day: string;
  calories: number;
};

export type MacroBreakdown = {
  label: string;
  emoji: string;
  grams: number;
  percent: number;
  color: string;
};

export type WeeklyTrendItem = {
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  trendLabel: string;
  emoji: string;
};

/** Calories quotidiennes sur 7 jours (données de démo). */
export const DAILY_CALORIES: readonly DailyCalorieEntry[] = [
  { day: "Lun", calories: 2050 },
  { day: "Mar", calories: 1820 },
  { day: "Mer", calories: 2200 },
  { day: "Jeu", calories: 1950 },
  { day: "Ven", calories: 2100 },
  { day: "Sam", calories: 2350 },
  { day: "Dim", calories: 1890 },
] as const;

/** Répartition des macronutriments (données de démo). */
export const MACRO_BREAKDOWN: readonly MacroBreakdown[] = [
  { label: "Protéines", emoji: "🥩", grams: 118, percent: 24, color: "#4A7C59" },
  { label: "Glucides", emoji: "🍞", grams: 245, percent: 49, color: "#6FAE82" },
  { label: "Lipides", emoji: "🫒", grams: 67, percent: 27, color: "#A8D5BA" },
] as const;

/** Tendances hebdomadaires comparées à la semaine précédente. */
export const WEEKLY_TRENDS: readonly WeeklyTrendItem[] = [
  { label: "Repas cuisinés", value: "17", trend: "up", trendLabel: "+3 vs sem. préc.", emoji: "🍳" },
  { label: "Aliments gaspillés", value: "2", trend: "down", trendLabel: "−1 vs sem. préc.", emoji: "♻️" },
  { label: "Score anti-gaspi", value: "94%", trend: "up", trendLabel: "+5% vs sem. préc.", emoji: "🌿" },
  { label: "Budget estimé", value: "67 €", trend: "stable", trendLabel: "≈ sem. préc.", emoji: "💰" },
] as const;

/** Cible quotidienne pour la barre de progression des calories. */
export const CALORIE_TARGET = 2100;
