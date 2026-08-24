import type { NutritionGoalId } from "@/lib/profile";

/** Plage réaliste pour un adulte (saisie utilisateur). */
export const WEIGHT_KG_RANGE = { min: 30, max: 250 } as const;
export const HEIGHT_CM_RANGE = { min: 120, max: 230 } as const;

export type DailyTargets = {
  calories: number;
  proteins: number;
};

const GOAL_CALORIE_FACTOR: Record<NutritionGoalId, number> = {
  loss: 0.85,
  balance: 1,
  gain: 1.1,
};

const GOAL_PROTEIN_G_PER_KG: Record<NutritionGoalId, number> = {
  loss: 1.8,
  balance: 1.6,
  gain: 2,
};

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Convertit une saisie de taille en cm.
 * Accepte les centimètres (175) ou les mètres (1,75).
 */
export function parseHeightCm(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  const cm = n < 3 ? Math.round(n * 100) : Math.round(n);
  if (cm < HEIGHT_CM_RANGE.min || cm > HEIGHT_CM_RANGE.max) return null;
  return cm;
}

export function parseWeightKg(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  if (!Number.isFinite(n) || n < WEIGHT_KG_RANGE.min || n > WEIGHT_KG_RANGE.max) {
    return null;
  }
  return Math.round(n * 10) / 10;
}

/**
 * Estime les cibles journalières à partir du poids, de la taille et de l'objectif.
 *
 * BMR : Mifflin-St Jeor, âge 30 ans, moyenne homme/femme.
 * TDEE : activité légère (PAL 1,4). L'objectif applique un déficit ou un surplus.
 */
export function calculateDailyTargets(
  weightKg: number,
  heightCm: number,
  goal: NutritionGoalId,
): DailyTargets {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * 30 - 78;
  const tdee = bmr * 1.4;
  const calories = clamp(roundTo(tdee * GOAL_CALORIE_FACTOR[goal], 50), 1200, 4500);
  const proteins = clamp(roundTo(weightKg * GOAL_PROTEIN_G_PER_KG[goal], 5), 40, 250);

  return { calories, proteins };
}
