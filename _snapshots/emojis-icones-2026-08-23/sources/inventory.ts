/**
 * Modèle Snapshot à référence optionnelle — trialité des aliments.
 *
 * Un aliment traverse trois états successifs, volontairement séparés :
 *   Recette (immuable) ➔ Liste de courses (éphémère) ➔ Frigo (inventaire réel).
 *
 * Chaque état possède sa propre identité d'entrée (`id` UUID pour courses/frigo)
 * et une copie éditable des champs métier (`customName`, `amount`, `unit`).
 * Le lien optionnel `ingredientId` (référentiel `lib/ingredients.ts`) autorise
 * matching, fusion via `combineQuantities` et déduplication même après
 * renommage : éditer « Tomate » → « Tomates cerises bio » dans les courses ne
 * touche jamais la recette d'origine.
 */

import type { ShoppingCategoryId } from "@/lib/shopping-categories";
import type { UnitCode } from "@/lib/units";

/** Emplacement de stockage — pilote les onglets de la page Frigo. */
export type FridgeStorageLocation = "fridge" | "freezer" | "pantry";

/**
 * Ingrédient tel qu'il est écrit dans une recette. Immuable :
 * jamais édité depuis les courses ou le frigo.
 */
export interface RecipeIngredient {
  /** ID unique canonique (ex. « ing_tomate »). */
  ingredientId: string;
  /** Nom d'origine de la recette (ex. « Tomate »). */
  name: string;
  /** Quantité numérique. Vaut 0 lorsque `unit` est « qs ». */
  amount: number;
  /** Code d'unité validé par le domaine Postgres `unit_domain`. */
  unit: UnitCode;
  /** Rayon magasin, utilisé au moment de l'export vers les courses. */
  category: ShoppingCategoryId;
  emoji?: string;
}

/** Article de la liste de courses — copie éphémère et librement éditable. */
export interface ShoppingItem {
  /** UUID propre à cette entrée de liste. */
  id: string;
  /** Référence au composant d'origine, conservée même si le nom change. */
  ingredientId?: string;
  /** Nom affiché et éditable (ex. « Tomates cerises bio »). */
  customName: string;
  amount: number;
  unit: UnitCode;
  /** Rayon magasin. */
  category: ShoppingCategoryId;
  emoji?: string;
  isChecked: boolean;
  /** ISO 8601. */
  createdAt: string;
}

/** Article du frigo / congélateur / placards — inventaire réel et éditable. */
export interface FridgeItem {
  /** UUID propre à cette entrée d'inventaire. */
  id: string;
  ingredientId?: string;
  /** Nom affiché et éditable dans le frigo. */
  customName: string;
  /** Quantité restante en stock. */
  amount: number;
  unit: UnitCode;
  /** Emplacement de stockage. */
  category: FridgeStorageLocation;
  emoji?: string;
  /** ISO 8601. */
  addedAt: string;
  /** ISO date YYYY-MM-DD. Absente si l'article n'a pas de DLC. */
  expirationDate?: string;
}

/** Quantité structurée, indépendante de l'état dans lequel se trouve l'aliment. */
export type Quantity = {
  amount: number;
  unit: UnitCode;
};

/** Identité canonique d'un aliment, partagée par les trois états. */
export type IngredientIdentity = {
  ingredientId: string;
  name: string;
  category: ShoppingCategoryId;
  emoji?: string;
};
