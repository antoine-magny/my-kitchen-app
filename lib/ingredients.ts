/**
 * Référentiel canonique des aliments.
 *
 * C'est la seule source de vérité pour `ingredientId` : l'identifiant stable qui
 * relie un ingrédient de recette, son article de courses et son entrée de frigo.
 * Un nom absent du catalogue reçoit malgré tout un identifiant déterministe
 * dérivé de son nom normalisé, afin que le matching et la fusion fonctionnent
 * aussi pour les produits saisis librement.
 */

import type { IngredientIdentity } from "@/types/inventory";
import {
  classifyProduct,
  normalizeProductName,
  type ShoppingCategoryId,
} from "@/lib/shopping-categories";
import type { UnitCode } from "@/lib/units";
import { findFuzzyMatch, type MatchCandidate } from "@/lib/fuzzy-search";

import {
  INGREDIENT_CATEGORIES,
  INGREDIENTS,
  type IngredientCatalogItem,
  type IngredientCategory,
} from "@/lib/ingredients-catalog";
import { resolveKeywordIcon } from "@/lib/ingredient-icons";

export {
  INGREDIENT_CATEGORIES,
  INGREDIENTS,
  type IngredientCatalogItem,
  type IngredientCategory,
};

export {
  CATALOG_ICON_HEXES,
  DEFAULT_INGREDIENT_ICON,
  EMOJI_TO_HEX_MAP,
  UNIQUE_EMOJI_INGREDIENTS,
  isApprovedIngredientVisual,
  isIconHex,
  resolveStoredIngredientIcon,
  toIconHex,
} from "@/lib/ingredient-icons";

const CATALOG_BY_ID = new Map<string, IngredientCatalogItem>(
  INGREDIENTS.map((item) => [item.id, item] as const),
);

/** Retire les pluriels simples pour retrouver l'entrée canonique. */
function singularize(normalized: string): string {
  return normalized
    .split(" ")
    .map((word) => (word.length > 3 && /(?:s|x)$/.test(word) ? word.slice(0, -1) : word))
    .join(" ");
}

function slugify(normalized: string): string {
  return normalized.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/** Nom canonique et synonymes stricts → entrée du catalogue (identité). */
const CATALOG_BY_NAME = new Map<string, IngredientCatalogItem>();
const CATALOG_MATCH_CANDIDATES: Array<MatchCandidate<IngredientCatalogItem>> = [];

for (const item of INGREDIENTS) {
  for (const key of [item.name, ...(item.aliases ?? [])]) {
    const normalized = normalizeProductName(key);
    if (normalized) {
      if (!CATALOG_BY_NAME.has(normalized)) {
        CATALOG_BY_NAME.set(normalized, item);
      }
      CATALOG_MATCH_CANDIDATES.push({ text: normalized, item });
      const sing = singularize(normalized);
      if (sing !== normalized) {
        CATALOG_MATCH_CANDIDATES.push({ text: sing, item });
      }
    }
  }
}

const DESCRIPTOR_PREFIXES = [
  "boule de",
  "boules de",
  "tranche de",
  "tranches de",
  "gousse d",
  "gousse de",
  "gousses d",
  "gousses de",
  "sachet de",
  "sachets de",
  "morceau de",
  "morceaux de",
  "paquet de",
  "paquets de",
  "boite de",
  "boites de",
  "feuille de",
  "feuilles de",
  "brin de",
  "brins de",
  "branche de",
  "branches de",
  "pave de",
  "paves de",
  "filet de",
  "filets de",
  "escalope de",
  "escalopes de",
];

function stripDescriptorPrefix(normalized: string): string {
  for (const prefix of DESCRIPTOR_PREFIXES) {
    if (normalized.startsWith(prefix + " ")) {
      return normalized.slice(prefix.length + 1).trim();
    }
    if (normalized.startsWith(prefix)) {
      return normalized.slice(prefix.length).trim();
    }
  }
  return normalized;
}

/**
 * Retrouve un ingrédient du catalogue par son nom, avec correction orthographique intelligente
 * (insensible à la casse, aux accents, aux pluriels, aux consonnes doublées et aux fautes de frappe).
 */
function findCatalogItem(name: string): IngredientCatalogItem | undefined {
  const normalized = normalizeProductName(name);
  if (!normalized) return undefined;

  // 1. Recherche directe exacte ou singulier
  const exact = CATALOG_BY_NAME.get(normalized) ?? CATALOG_BY_NAME.get(singularize(normalized));
  if (exact) return exact;

  // 2. Recherche directe après retrait des préfixes de conditionnement (ex: « boule de mozzarella » → « mozzarella »)
  const stripped = stripDescriptorPrefix(normalized);
  if (stripped !== normalized) {
    const strippedExact = CATALOG_BY_NAME.get(stripped) ?? CATALOG_BY_NAME.get(singularize(stripped));
    if (strippedExact) return strippedExact;
  }

  // 3. Recherche tolérante aux fautes d'orthographe (ex: « mozarella » → Mozzarella)
  const fuzzy = findFuzzyMatch(normalized, CATALOG_MATCH_CANDIDATES);
  if (fuzzy) return fuzzy.item;

  // 4. Recherche tolérante après retrait des préfixes (ex: « boule de mozarella » → Mozzarella)
  if (stripped !== normalized) {
    const strippedFuzzy = findFuzzyMatch(stripped, CATALOG_MATCH_CANDIDATES);
    if (strippedFuzzy) return strippedFuzzy.item;
  }

  return undefined;
}

function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

export function getIngredientById(id: string): IngredientCatalogItem | undefined {
  return CATALOG_BY_ID.get(id);
}

/**
 * Identifiant canonique d'un aliment.
 * Retombe sur un slug déterministe (`ing_tomates_cerises`) hors catalogue, ce
 * qui garde la fusion et la déduplication fonctionnelles pour les saisies libres.
 */
export function resolveIngredientId(name: string): string {
  const catalogItem = findCatalogItem(name);
  if (catalogItem) return catalogItem.id;

  const slug = slugify(singularize(normalizeProductName(name)));
  return slug ? `ing_${slug}` : "ing_inconnu";
}

/**
 * Icône ou émoji le plus pertinent pour un nom libre.
 * Correspondance exacte d'abord, puis mot-clé visuel présent dans le nom.
 * Priorise l'émoji natif ancien s'il existe, sinon l'icône SVG OpenMoji.
 */
export function resolveIcon(name: string): string | undefined {
  const catalogItem = findCatalogItem(name);
  if (catalogItem) return catalogItem.emoji || catalogItem.icon;

  const normalized = normalizeProductName(name);
  if (!normalized) return undefined;
  return resolveKeywordIcon(normalized, singularize(normalized));
}

/**
 * Renvoie l'unité par défaut recommandée pour un ingrédient donné.
 * Si l'ingrédient n'est pas reconnu, retombe sur « piece » (pièce).
 */
export function getIngredientDefaultUnit(nameOrId?: string): UnitCode {
  if (!nameOrId?.trim()) return "piece";
  const item = CATALOG_BY_ID.get(nameOrId) ?? findCatalogItem(nameOrId);
  if (item?.defaultUnit) return item.defaultUnit;

  const norm = normalizeProductName(nameOrId);
  if (hasWord(norm, "ail") || hasWord(norm, "echalote") || hasWord(norm, "vanille")) return "gousse";
  if (hasWord(norm, "melon") || hasWord(norm, "pasteque") || hasWord(norm, "pain") || hasWord(norm, "bacon") || hasWord(norm, "jambon") || hasWord(norm, "saumon fume") || hasWord(norm, "truite fumee")) return "tranche";
  if (hasWord(norm, "basilic") || hasWord(norm, "menthe") || hasWord(norm, "laurier") || hasWord(norm, "feuille")) return "feuille";
  if (hasWord(norm, "thym") || hasWord(norm, "romarin") || hasWord(norm, "persil") || hasWord(norm, "ciboulette") || hasWord(norm, "coriandre") || hasWord(norm, "aneth")) return "brin";
  if (hasWord(norm, "radis") || hasWord(norm, "asperge") || hasWord(norm, "cebette") || hasWord(norm, "oignon nouveau")) return "botte";
  if (hasWord(norm, "levure") || hasWord(norm, "sucre vanille")) return "sachet";
  if (hasWord(norm, "bouillon cube") || hasWord(norm, "cube")) return "piece";
  if (hasWord(norm, "sel") || hasWord(norm, "poivre") || hasWord(norm, "piment") || hasWord(norm, "epice") || hasWord(norm, "epices")) return "pincee";
  if (hasWord(norm, "lait") || hasWord(norm, "eau") || hasWord(norm, "creme") || hasWord(norm, "bouillon") || hasWord(norm, "jus") || hasWord(norm, "vinaigre") || hasWord(norm, "champagne") || hasWord(norm, "alcool") || hasWord(norm, "boisson") || hasWord(norm, "vin") || hasWord(norm, "biere")) return "ml";
  if (hasWord(norm, "huile") || hasWord(norm, "sauce") || hasWord(norm, "miel")) return "c_soupe";
  if (hasWord(norm, "farine") || hasWord(norm, "sucre") || hasWord(norm, "chocolat") || hasWord(norm, "beurre") || hasWord(norm, "riz") || hasWord(norm, "pates") || hasWord(norm, "viande hachee")) return "g";

  return "piece";
}

/**
 * Renvoie l'unité variable de décompte spécifique à l'aliment (ex: « gousse » pour l'ail).
 * Si l'aliment n'a pas d'unité de décompte dédiée, retombe sur « piece » (pièce).
 */
export function getIngredientCountUnit(nameOrId?: string): UnitCode {
  if (!nameOrId?.trim()) return "piece";
  const item = CATALOG_BY_ID.get(nameOrId) ?? findCatalogItem(nameOrId);
  if (item?.countUnit) return item.countUnit;

  const norm = normalizeProductName(nameOrId);
  if (hasWord(norm, "ail") || hasWord(norm, "echalote") || hasWord(norm, "vanille")) return "gousse";
  if (hasWord(norm, "melon") || hasWord(norm, "pasteque") || hasWord(norm, "pain") || hasWord(norm, "bacon") || hasWord(norm, "jambon") || hasWord(norm, "carpaccio") || hasWord(norm, "saumon fume") || hasWord(norm, "truite fumee")) return "tranche";
  if (hasWord(norm, "basilic") || hasWord(norm, "menthe") || hasWord(norm, "laurier") || hasWord(norm, "sauge")) return "feuille";
  if (hasWord(norm, "thym") || hasWord(norm, "romarin") || hasWord(norm, "persil") || hasWord(norm, "aneth") || hasWord(norm, "ciboulette") || hasWord(norm, "coriandre")) return "brin";
  if (hasWord(norm, "radis") || hasWord(norm, "asperge") || hasWord(norm, "cebette") || hasWord(norm, "oignon nouveau")) return "botte";
  if (hasWord(norm, "levure") || hasWord(norm, "sucre vanille")) return "sachet";
  if (hasWord(norm, "sel") || hasWord(norm, "poivre") || hasWord(norm, "piment") || hasWord(norm, "epice") || hasWord(norm, "epices")) return "pincee";

  return "piece";
}

/**
 * Renvoie les ratios d'équivalence en masse/volume d'une unité de décompte pour un ingrédient.
 */
export function getIngredientEquivalence(nameOrId?: string): { gramsPerCountUnit?: number; mlPerCountUnit?: number } | undefined {
  if (!nameOrId?.trim()) return undefined;
  const item = CATALOG_BY_ID.get(nameOrId) ?? findCatalogItem(nameOrId);
  if (item?.gramsPerCountUnit || item?.mlPerCountUnit) {
    return {
      gramsPerCountUnit: item.gramsPerCountUnit,
      mlPerCountUnit: item.mlPerCountUnit,
    };
  }

  const norm = normalizeProductName(nameOrId);
  if (hasWord(norm, "ail") || hasWord(norm, "echalote")) return { gramsPerCountUnit: 5 };
  if (hasWord(norm, "melon") || hasWord(norm, "pasteque")) return { gramsPerCountUnit: 150 };
  if (hasWord(norm, "pain") || hasWord(norm, "bacon") || hasWord(norm, "jambon")) return { gramsPerCountUnit: 35 };
  if (hasWord(norm, "basilic") || hasWord(norm, "menthe") || hasWord(norm, "laurier")) return { gramsPerCountUnit: 1 };
  if (hasWord(norm, "oeuf") || hasWord(norm, "citron") || hasWord(norm, "tomate") || hasWord(norm, "oignon")) return { gramsPerCountUnit: 100 };

  return undefined;
}

/**
 * Identité complète d'un aliment à partir d'un nom libre : identifiant canonique,
 * rayon magasin et emoji. Utilisé à chaque passage d'un état à l'autre.
 */
export function describeIngredient(
  name: string,
  category?: ShoppingCategoryId,
): IngredientIdentity {
  const trimmed = name.trim();
  const icon = resolveIcon(trimmed);
  return {
    ingredientId: resolveIngredientId(trimmed),
    name: trimmed,
    category: category ?? classifyProduct(trimmed),
    ...(icon ? { icon } : {}),
  };
}
