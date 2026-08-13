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

export const INGREDIENT_CATEGORIES = [
  "vegetables",
  "fruits",
  "proteins",
  "starches",
  "pantry",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface IngredientCatalogItem {
  /** Identifiant canonique préfixé `ing_`. */
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  /**
   * Vrais synonymes : ces graphies désignent le MÊME aliment et partagent donc
   * l'`ingredientId`. Ne jamais y mettre deux aliments distincts.
   */
  aliases?: readonly string[];
  /**
   * Mots-clés purement visuels : ils choisissent l'emoji d'un nom libre sans
   * jamais influencer l'identité (« Basilic » reste distinct des « Herbes »).
   */
  emojiKeywords?: readonly string[];
}

/**
 * Ingrédients du sélecteur frigo, enrichis (légumes, fruits, protéines,
 * féculents, épicerie). Les `id` sont persistés dans les courses et le frigo :
 * ne jamais en renommer un sans migration.
 */
export const INGREDIENTS: readonly IngredientCatalogItem[] = [
  // --- Existants (sélecteur frigo) ---
  { id: "ing_oeuf", name: "Œuf", emoji: "🥚", category: "proteins" },
  { id: "ing_lait", name: "Lait", emoji: "🥛", category: "proteins" },
  { id: "ing_fromage", name: "Fromage", emoji: "🧀", category: "proteins", emojiKeywords: ["comte", "feta", "burrata", "mozzarella", "parmesan", "chevre", "emmental"] },
  { id: "ing_boeuf", name: "Bœuf / Steak", emoji: "🥩", category: "proteins", emojiKeywords: ["boeuf", "steak", "filet de boeuf"] },
  { id: "ing_tomate", name: "Tomate", emoji: "🍅", category: "vegetables" },
  { id: "ing_carotte", name: "Carotte", emoji: "🥕", category: "vegetables" },
  { id: "ing_beurre", name: "Beurre", emoji: "🧈", category: "proteins" },
  { id: "ing_salade", name: "Salade", emoji: "🥗", category: "vegetables", emojiKeywords: ["mesclun", "roquette"] },
  { id: "ing_citron", name: "Citron", emoji: "🍋", category: "fruits" },
  { id: "ing_myrtille", name: "Myrtilles", emoji: "🫐", category: "fruits" },
  { id: "ing_pomme", name: "Pomme", emoji: "🍎", category: "fruits" },
  { id: "ing_orange", name: "Orange", emoji: "🍊", category: "fruits" },
  { id: "ing_brocoli", name: "Brocoli", emoji: "🥦", category: "vegetables" },
  { id: "ing_laitue", name: "Laitue", emoji: "🥬", category: "vegetables", emojiKeywords: ["epinards", "chou"] },
  { id: "ing_oignon", name: "Oignon", emoji: "🧅", category: "vegetables", emojiKeywords: ["echalote"] },
  { id: "ing_pomme_de_terre", name: "Pomme de terre", emoji: "🥔", category: "vegetables", emojiKeywords: ["grenaille"] },
  { id: "ing_poivron", name: "Poivron", emoji: "🫑", category: "vegetables" },
  { id: "ing_pain", name: "Pain", emoji: "🍞", category: "starches", emojiKeywords: ["baguette", "brioche"] },
  { id: "ing_poisson", name: "Poisson", emoji: "🐟", category: "proteins", emojiKeywords: ["saumon", "cabillaud", "thon", "truite", "dorade", "colin"] },
  { id: "ing_viande", name: "Viande", emoji: "🍖", category: "proteins", emojiKeywords: ["poulet", "dinde", "agneau", "veau", "canard", "cuisse"] },
  { id: "ing_avocat", name: "Avocat", emoji: "🥑", category: "vegetables" },
  { id: "ing_raisin", name: "Raisin", emoji: "🍇", category: "fruits" },
  { id: "ing_gingembre", name: "Gingembre", emoji: "🫚", category: "vegetables" },
  { id: "ing_ail", name: "Ail", emoji: "🧄", category: "vegetables" },

  // --- Légumes & herbes ---
  { id: "ing_champignon", name: "Champignon", emoji: "🍄", category: "vegetables" },
  { id: "ing_concombre", name: "Concombre / Courgette", emoji: "🥒", category: "vegetables", emojiKeywords: ["concombre", "courgette"] },
  { id: "ing_piment", name: "Piment", emoji: "🌶️", category: "vegetables", emojiKeywords: ["paprika", "curcuma", "cumin", "epices"] },
  { id: "ing_aubergine", name: "Aubergine", emoji: "🍆", category: "vegetables" },
  { id: "ing_mais", name: "Maïs", emoji: "🌽", category: "vegetables" },
  { id: "ing_petits_pois", name: "Petits pois", emoji: "🫛", category: "vegetables" },
  { id: "ing_olive", name: "Olive", emoji: "🫒", category: "vegetables", emojiKeywords: ["capres"] },
  { id: "ing_herbes", name: "Herbes fraîches", emoji: "🌿", category: "vegetables", emojiKeywords: ["basilic", "persil", "ciboulette", "aneth", "thym", "romarin", "coriandre", "menthe", "estragon", "laurier"] },
  { id: "ing_patate_douce", name: "Patate douce", emoji: "🍠", category: "vegetables" },

  // --- Fruits ---
  { id: "ing_banane", name: "Banane", emoji: "🍌", category: "fruits" },
  { id: "ing_fraise", name: "Fraise", emoji: "🍓", category: "fruits" },
  { id: "ing_pasteque", name: "Pastèque", emoji: "🍉", category: "fruits", emojiKeywords: ["melon"] },
  { id: "ing_peche", name: "Pêche", emoji: "🍑", category: "fruits", emojiKeywords: ["abricot", "nectarine"] },
  { id: "ing_poire", name: "Poire", emoji: "🍐", category: "fruits" },
  { id: "ing_ananas", name: "Ananas", emoji: "🍍", category: "fruits" },
  { id: "ing_kiwi", name: "Kiwi", emoji: "🥝", category: "fruits" },
  { id: "ing_cerise", name: "Cerise", emoji: "🍒", category: "fruits", emojiKeywords: ["framboise", "mure"] },

  // --- Protéines & laitiers ---
  { id: "ing_bacon", name: "Bacon / Porc", emoji: "🥓", category: "proteins", emojiKeywords: ["bacon", "porc", "lardons", "jambon"] },
  { id: "ing_crevette", name: "Crevette", emoji: "🦐", category: "proteins", emojiKeywords: ["moules", "calamar"] },
  { id: "ing_yaourt", name: "Yaourt / Crème", emoji: "🥣", category: "proteins", emojiKeywords: ["yaourt", "creme", "mascarpone", "ricotta", "skyr"] },
  { id: "ing_tofu", name: "Tofu", emoji: "🧊", category: "proteins", emojiKeywords: ["seitan", "tempeh"] },

  // --- Féculents & céréales ---
  { id: "ing_riz", name: "Riz", emoji: "🍚", category: "starches", emojiKeywords: ["quinoa", "boulgour", "semoule", "couscous"] },
  { id: "ing_pates", name: "Pâtes", emoji: "🍝", category: "starches", emojiKeywords: ["linguine", "spaghetti", "tagliatelles"] },
  { id: "ing_farine", name: "Farine", emoji: "🌾", category: "starches" },
  { id: "ing_legumineuses", name: "Légumineuses / Haricots", emoji: "🫘", category: "starches", emojiKeywords: ["haricot", "lentille", "pois chiche", "pois chiches"] },
  { id: "ing_noix", name: "Fruits à coque / Noix", emoji: "🥜", category: "starches", emojiKeywords: ["noix", "amande", "noisette", "praline", "cacahuete"] },
  { id: "ing_avoine", name: "Flocons d'avoine", emoji: "🥣", category: "starches", emojiKeywords: ["avoine", "granola", "cereales"] },

  // --- Épicerie & condiments ---
  { id: "ing_huile", name: "Huile", emoji: "🫗", category: "pantry" },
  { id: "ing_sel_poivre", name: "Sel & Poivre", emoji: "🧂", category: "pantry", aliases: ["sel et poivre", "sel &amp; poivre"], emojiKeywords: ["sel", "poivre", "fleur de sel"] },
  { id: "ing_miel", name: "Miel", emoji: "🍯", category: "pantry" },
  { id: "ing_sucre", name: "Sucre", emoji: "🍬", category: "pantry" },
  { id: "ing_sauce", name: "Sauce / Vinaigre", emoji: "🥢", category: "pantry", emojiKeywords: ["vinaigre", "moutarde", "sauce soja", "ketchup", "mayonnaise"] },
  { id: "ing_conserve", name: "Boîte de conserve", emoji: "🥫", category: "pantry", emojiKeywords: ["conserve", "bouillon", "coulis"] },
];

const CATALOG_BY_ID = new Map<string, IngredientCatalogItem>(
  INGREDIENTS.map((item) => [item.id, item] as const),
);

/** Nom canonique et synonymes stricts → entrée du catalogue (identité). */
const CATALOG_BY_NAME = new Map<string, IngredientCatalogItem>();
for (const item of INGREDIENTS) {
  for (const key of [item.name, ...(item.aliases ?? [])]) {
    const normalized = normalizeProductName(key);
    if (normalized && !CATALOG_BY_NAME.has(normalized)) {
      CATALOG_BY_NAME.set(normalized, item);
    }
  }
}

/** Mots-clés visuels, du plus spécifique au plus générique. */
const EMOJI_KEYWORDS: Array<readonly [string, IngredientCatalogItem]> = [];
for (const item of INGREDIENTS) {
  const keywords = [
    ...item.name.split("/"),
    ...(item.aliases ?? []),
    ...(item.emojiKeywords ?? []),
  ];
  for (const keyword of keywords) {
    const normalized = normalizeProductName(keyword);
    if (normalized) EMOJI_KEYWORDS.push([normalized, item] as const);
  }
}
EMOJI_KEYWORDS.sort((a, b) => b[0].length - a[0].length);

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

function findCatalogItem(name: string): IngredientCatalogItem | undefined {
  const normalized = normalizeProductName(name);
  if (!normalized) return undefined;
  return CATALOG_BY_NAME.get(normalized) ?? CATALOG_BY_NAME.get(singularize(normalized));
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
 * Emoji le plus pertinent pour un nom libre.
 * Correspondance exacte d'abord, puis mot-clé visuel présent dans le nom
 * (« Tomates cerises » → 🍅).
 */
export function resolveEmoji(name: string): string | undefined {
  const catalogItem = findCatalogItem(name);
  if (catalogItem) return catalogItem.emoji;

  const normalized = normalizeProductName(name);
  if (!normalized) return undefined;
  const singular = singularize(normalized);

  for (const [keyword, item] of EMOJI_KEYWORDS) {
    if (hasWord(normalized, keyword) || hasWord(singular, keyword)) return item.emoji;
  }
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
  const emoji = resolveEmoji(trimmed);
  return {
    ingredientId: resolveIngredientId(trimmed),
    name: trimmed,
    category: category ?? classifyProduct(trimmed),
    ...(emoji ? { emoji } : {}),
  };
}
