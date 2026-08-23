import { describeIngredient } from "@/lib/ingredients";
import { coerceUnitCode, parseAmount, type UnitCode } from "@/lib/units";
import type { RecipeIngredient } from "@/types/inventory";

export type { RecipeIngredient };

export type RecipeFilter = "Tout" | "Express" | "Végétarien" | "Riche en protéines" | "Desserts";

/**
 * Fabrique un ingrédient de recette : l'identité canonique (ingredientId, rayon,
 * emoji) est dérivée du nom, seules la quantité et l'unité sont explicites.
 */
export function ing(name: string, amount: number, unit: UnitCode): RecipeIngredient {
  return { ...describeIngredient(name), amount, unit };
}

/** Variante pour les quantités écrites en toutes lettres (« 150 g », « q.s. »). */
export function ingFromText(name: string, amount: string): RecipeIngredient {
  const { amount: value, unit } = parseAmount(amount);
  return ing(name, value, unit);
}

export interface RecipeStep {
  title: string;
  detail: string;
  duration?: string;
}

export interface Recipe {
  id: number;
  title: string;
  photo: string;
  time: string;
  calories: number;
  proteins: number;
  servings: number;
  difficulty: "Facile" | "Moyen" | "Difficile";
  tag: RecipeFilter | null;
  tagLabel?: string;
  featured?: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  /** Ingrédients absents du frigo (basiques, 1 ou 2 max) — recettes générées IA. */
  missingIngredients?: string[];
}
