import type { NutritionGoalId } from "@/lib/profile";
import type { CookingLevel, DietType, UserProfile } from "@/lib/profile-store";

// ─── TYPES ──────────────────────────────────────────────────────────────

export type QuizStepId =
  | "diet"
  | "allergies"
  | "favorites"
  | "disliked"
  | "goal"
  | "level"
  | "equipment";

export type QuizStepDef = {
  id: QuizStepId;
  title: string;
  subtitle: string;
  emoji: string;
};

export type QuizAnswers = {
  diet: DietType;
  allergyTags: string[];
  favoriteTags: string[];
  dislikedTags: string[];
  goal: NutritionGoalId;
  cookingLevel: CookingLevel;
  equipmentIds: string[];
};

// ─── CONSTANTES DU QUIZ ─────────────────────────────────────────────────

export const DEFAULT_QUIZ_ANSWERS: QuizAnswers = {
  diet: "omnivore",
  allergyTags: [],
  favoriteTags: [],
  dislikedTags: [],
  goal: "balance",
  cookingLevel: "intermediaire",
  equipmentIds: [],
};

export const QUIZ_STEPS: QuizStepDef[] = [
  {
    id: "diet",
    title: "Votre régime",
    subtitle: "Sélectionnez votre régime principal",
    emoji: "🥗",
  },
  {
    id: "allergies",
    title: "Allergies et intolérances",
    subtitle: "Ajoutez les aliments que vous ne pouvez pas manger",
    emoji: "🚫",
  },
  {
    id: "favorites",
    title: "Ce que vous adorez",
    subtitle: "Sélectionnez vos aliments préférés",
    emoji: "❤️",
  },
  {
    id: "disliked",
    title: "Ce que vous détestez",
    subtitle: "Sélectionnez les aliments à éviter",
    emoji: "🤢",
  },
  {
    id: "goal",
    title: "Votre objectif",
    subtitle: "Que souhaitez-vous accomplir avec vos repas ?",
    emoji: "🎯",
  },
  {
    id: "level",
    title: "Votre niveau",
    subtitle: "À quel point êtes-vous à l'aise en cuisine ?",
    emoji: "👨‍🍳",
  },
  {
    id: "equipment",
    title: "Votre équipement",
    subtitle: "Cochez ce que vous possédez",
    emoji: "🍳",
  },
];

export const DIET_OPTIONS: { id: DietType; emoji: string; label: string; hint?: string }[] = [
  { id: "omnivore", emoji: "🥩", label: "Omnivore", hint: "Je mange de tout" },
  { id: "flexitarien", emoji: "🍗", label: "Flexitarien", hint: "Végétarien la plupart du temps" },
  { id: "pescetarien", emoji: "🐟", label: "Pescétarien", hint: "Pas de viande, mais du poisson" },
  { id: "vegetarien", emoji: "🧀", label: "Végétarien", hint: "Pas de viande ni de poisson" },
  { id: "vegetalien", emoji: "🌱", label: "Végétalien / Vegan", hint: "Aucun produit d'origine animale" },
];

export const COOKING_LEVEL_OPTIONS: { id: CookingLevel; emoji: string; label: string; hint?: string }[] = [
  { id: "debutant", emoji: "🥚", label: "Débutant", hint: "Je sais faire cuire des pâtes et des œufs" },
  { id: "intermediaire", emoji: "🥘", label: "Intermédiaire", hint: "Je cuisine régulièrement des plats simples" },
  { id: "avance", emoji: "👨‍🍳", label: "Avancé", hint: "J'aime relever des défis culinaires" },
];

// ─── FONCTIONS ──────────────────────────────────────────────────────────

/**
 * Convertit les réponses du quiz en un patch pour le profil utilisateur,
 * en ajoutant le timestamp de complétion.
 */
export function quizAnswersToProfilePatch(answers: QuizAnswers): Partial<UserProfile> {
  return {
    ...answers,
    quizCompletedAt: new Date().toISOString(),
  };
}
