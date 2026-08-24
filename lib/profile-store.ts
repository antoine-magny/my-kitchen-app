import type { NutritionGoalId } from "@/lib/profile";

export type CookingLevel = "debutant" | "intermediaire" | "avance";
export type DietType = "omnivore" | "vegetarien" | "vegetalien" | "pescetarien" | "flexitarien";

export type UserProfile = {
  // Objectifs
  goal: NutritionGoalId;
  calories: number;
  proteins: number;

  // Préférences culinaires
  diet: DietType;
  cookingLevel: CookingLevel;
  
  // Tags (fusionnés du quiz et de l'édition manuelle)
  allergyTags: string[];
  favoriteTags: string[];
  dislikedTags: string[];
  
  // Equipement possédé
  equipmentIds: string[];

  // Métadonnées
  quizCompletedAt: string | null;
};

export const DEFAULT_PROFILE: UserProfile = {
  goal: "balance",
  calories: 2100,
  proteins: 120,
  diet: "omnivore",
  cookingLevel: "intermediaire",
  allergyTags: [],
  favoriteTags: [],
  dislikedTags: [],
  equipmentIds: [],
  quizCompletedAt: null,
};

const STORAGE_KEY = "my-kitchen-profile-v1";

/**
 * Lit le profil depuis le localStorage (côté client).
 */
export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_PROFILE;
    
    const parsed = JSON.parse(data);
    
    // Assainissement basique (en cas de données altérées)
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      allergyTags: Array.isArray(parsed.allergyTags) ? parsed.allergyTags : [],
      favoriteTags: Array.isArray(parsed.favoriteTags) ? parsed.favoriteTags : [],
      dislikedTags: Array.isArray(parsed.dislikedTags) ? parsed.dislikedTags : [],
      equipmentIds: Array.isArray(parsed.equipmentIds) ? parsed.equipmentIds : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

/**
 * Sauvegarde le profil complet dans le localStorage.
 */
export function setUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Impossible de sauvegarder le profil :", err);
  }
}

/**
 * Met à jour partiellement le profil et sauvegarde.
 */
export function patchUserProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const next = { ...current, ...patch };
  setUserProfile(next);
  return next;
}
