"use client";

import { useEffect, useState } from "react";
import { loadNutritionHistory, type NutritionHistory } from "@/lib/nutrition-history";
import { DEFAULT_PROFILE, getUserProfile } from "@/lib/profile-store";

const EMPTY_HISTORY: NutritionHistory = {};

const DEFAULT_TARGETS = {
  calories: DEFAULT_PROFILE.calories,
  proteins: DEFAULT_PROFILE.proteins,
};

export type NutritionStatsData = {
  history: NutritionHistory;
  targets: { calories: number; proteins: number };
  /** `false` tant que l'effet client n'a pas remplacé les valeurs par défaut. */
  ready: boolean;
};

/**
 * Historique nutritionnel et cibles quotidiennes chargés après hydratation :
 * le rendu serveur part d'un historique vide et des cibles par défaut.
 */
export function useNutritionStats(): NutritionStatsData {
  const [data, setData] = useState<Omit<NutritionStatsData, "ready">>({
    history: EMPTY_HISTORY,
    targets: DEFAULT_TARGETS,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    setData({
      history: loadNutritionHistory(),
      targets: { calories: profile.calories, proteins: profile.proteins },
    });
    setReady(true);
  }, []);

  return { ...data, ready };
}
