/**
 * Catégories officielles de la liste de courses + classification automatique.
 */

import {
  includesAny,
  hasAnyWord,
  SURGELES_MARKERS,
  MAISON_HYGIENE,
  EPICERIE_CONSERVE_MARKERS,
  EPICERIE_OVERRIDE_MARKERS,
  FRUITS_LEGUMES,
  EPICERIE_FECULENTS,
  matchesLaitiersViandes,
} from "@/lib/shopping-category-lexicons";

export const SHOPPING_CATEGORY_IDS = [
  "fruits_legumes",
  "laitiers_viandes_poisson",
  "epicerie_feculents",
  "surgeles",
  "maison_hygiene",
] as const;

export type ShoppingCategoryId = (typeof SHOPPING_CATEGORY_IDS)[number];

export type ShoppingCategory = {
  id: ShoppingCategoryId;
  title: string;
};

/** Ordre d'affichage des rayons dans la liste de courses. */
export const SHOPPING_CATEGORIES: readonly ShoppingCategory[] = [
  { id: "fruits_legumes", title: "🍎 Fruits & Légumes" },
  {
    id: "laitiers_viandes_poisson",
    title: "🧀 Produits laitiers, viandes & poisson",
  },
  { id: "epicerie_feculents", title: "🍝 Épicerie & Féculents" },
  { id: "surgeles", title: "🧊 Surgelés" },
  { id: "maison_hygiene", title: "🧴 Maison & Hygiène" },
] as const;

const CATEGORY_BY_ID = Object.fromEntries(
  SHOPPING_CATEGORIES.map((c) => [c.id, c]),
) as Record<ShoppingCategoryId, ShoppingCategory>;

export function getShoppingCategory(id: ShoppingCategoryId): ShoppingCategory {
  return CATEGORY_BY_ID[id];
}

export function isShoppingCategoryId(value: string): value is ShoppingCategoryId {
  return (SHOPPING_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Normalise pour le matching : minuscules, sans accents, espaces condensés. */
export function normalizeProductName(name: string): string {
  return name
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s&+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Attribue une catégorie de liste de courses à un nom de produit / ingrédient.
 * Priorité : surgelés → maison/hygiène → conserves (épicerie) →
 * laitiers/viandes/poisson (+ alternatives) → fruits/légumes frais → épicerie → défaut épicerie.
 */
export function classifyProduct(productName: string): ShoppingCategoryId {
  const n = normalizeProductName(productName);
  if (!n) return "epicerie_feculents";

  // D. Surgelés — marqueurs explicites (ex. « petits pois surgelés »)
  if (includesAny(n, SURGELES_MARKERS) || /\bsurgel/.test(n) || /\bcongel/.test(n)) {
    return "surgeles";
  }

  // E. Maison & hygiène
  if (includesAny(n, MAISON_HYGIENE)) {
    return "maison_hygiene";
  }

  // Conserves / bocaux / bouillons → épicerie (avant fruits frais / protéines)
  if (
    includesAny(n, EPICERIE_CONSERVE_MARKERS) ||
    includesAny(n, EPICERIE_OVERRIDE_MARKERS)
  ) {
    return "epicerie_feculents";
  }

  // B. Laitiers, viandes, poisson (+ alternatives végétales)
  if (matchesLaitiersViandes(n)) {
    return "laitiers_viandes_poisson";
  }

  // Raisins secs → épicerie (avant matching fruits)
  if (/\braisin(s)?\s+sec/.test(n)) {
    return "epicerie_feculents";
  }

  // A. Fruits & légumes frais
  if (includesAny(n, FRUITS_LEGUMES) || hasAnyWord(n, FRUITS_LEGUMES)) {
    return "fruits_legumes";
  }

  // C. Épicerie & féculents (sec / ambiant)
  if (includesAny(n, EPICERIE_FECULENTS) || hasAnyWord(n, EPICERIE_FECULENTS)) {
    return "epicerie_feculents";
  }

  return "epicerie_feculents";
}

/**
 * Regroupe les items par catégorie, en conservant l'ordre officiel des rayons.
 * Les catégories vides sont omises.
 */
export function groupByShoppingCategory<T extends { category: ShoppingCategoryId }>(
  items: T[],
): { category: ShoppingCategory; items: T[] }[] {
  const buckets = new Map<ShoppingCategoryId, T[]>();
  for (const id of SHOPPING_CATEGORY_IDS) {
    buckets.set(id, []);
  }
  for (const item of items) {
    const id = isShoppingCategoryId(item.category) ? item.category : "epicerie_feculents";
    buckets.get(id)!.push(item);
  }
  return SHOPPING_CATEGORY_IDS.filter((id) => (buckets.get(id)?.length ?? 0) > 0).map((id) => ({
    category: getShoppingCategory(id),
    items: buckets.get(id)!,
  }));
}
