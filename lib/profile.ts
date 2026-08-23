/**
 * Profil utilisateur : préférences alimentaires, objectifs et équipements.
 *
 * Les valeurs exportées ici sont des données de démonstration destinées à
 * l'habillage de la page `/parametres`. La persistance (localStorage puis
 * Supabase) sera branchée dans un second temps.
 */

export type PreferenceKind = "favorite" | "disliked" | "allergy";

export type PreferenceGroup = {
  kind: PreferenceKind;
  emoji: string;
  title: string;
  hint: string;
  tags: string[];
};

export const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    kind: "favorite",
    emoji: "💖",
    title: "Aliments préférés",
    hint: "Mis en avant dans les recettes suggérées",
    tags: ["Saumon", "Avocat", "Chocolat noir", "Basilic"],
  },
  {
    kind: "disliked",
    emoji: "🚫",
    title: "Aliments à éviter",
    hint: "Écartés des propositions dès que possible",
    tags: ["Coriandre", "Champignons"],
  },
  {
    kind: "allergy",
    emoji: "⚠️",
    title: "Allergies & intolérances",
    hint: "Exclus sans exception de toutes les recettes",
    tags: ["Gluten", "Arachides", "Lactose"],
  },
];

/** Couleur des pastilles : l'allergie alerte en rouge, le reste reste doux. */
export const PREFERENCE_STYLE: Record<
  PreferenceKind,
  { bg: string; border: string; text: string }
> = {
  favorite: { bg: "#FEE2E8", border: "#F9C5CF", text: "#B03A52" },
  disliked: { bg: "#F0F4EF", border: "#E2EBE3", text: "#5A6B5C" },
  allergy: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
};

export type NutritionGoalId = "loss" | "balance" | "gain";

export const NUTRITION_GOALS: {
  id: NutritionGoalId;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { id: "loss", emoji: "🥗", label: "Perte de poids", hint: "Déficit léger" },
  { id: "balance", emoji: "⚖️", label: "Équilibre", hint: "Maintien" },
  { id: "gain", emoji: "💪", label: "Prise de masse", hint: "Surplus protéiné" },
];

export const DAILY_TARGETS = { calories: 2100, proteins: 120 };

export type KitchenEquipment = { id: string; emoji: string; label: string };

export const KITCHEN_EQUIPMENT: KitchenEquipment[] = [
  { id: "oven", emoji: "🔥", label: "Four" },
  { id: "stove", emoji: "🍳", label: "Plaques" },
  { id: "microwave", emoji: "♨️", label: "Micro-ondes" },
  { id: "hand-blender", emoji: "🌀", label: "Mixeur plongeant" },
  { id: "blender", emoji: "🥤", label: "Blender" },
  { id: "air-fryer", emoji: "🍟", label: "Air Fryer" },
  { id: "stand-mixer", emoji: "🎛️", label: "Robot pâtissier" },
  { id: "scale", emoji: "⚖️", label: "Balance" },
  { id: "pressure-cooker", emoji: "🍲", label: "Cocotte-minute" },
  { id: "grill", emoji: "🍖", label: "Plancha / BBQ" },
];

export const DEFAULT_EQUIPMENT_IDS = ["oven", "stove", "microwave", "hand-blender", "scale"];

export type SettingsEntry = { emoji: string; label: string; hint: string };

export const SETTINGS_ENTRIES: SettingsEntry[] = [
  { emoji: "🔔", label: "Notifications", hint: "Rappels DLC et repas du jour" },
  { emoji: "❓", label: "Aide & support", hint: "Questions fréquentes et contact" },
];

/** Aperçu statique de la future page de statistiques. */
export const WEEKLY_HIGHLIGHTS = [
  { value: "1 980", label: "kcal / jour" },
  { value: "17", label: "repas cuisinés" },
  { value: "2", label: "aliments jetés" },
];

export const TOP_CONSUMED_FOODS: { emoji: string; label: string; share: number }[] = [
  { emoji: "🥚", label: "Œufs", share: 82 },
  { emoji: "🍅", label: "Tomates", share: 64 },
  { emoji: "🍗", label: "Poulet", share: 47 },
  { emoji: "🥑", label: "Avocat", share: 31 },
];
