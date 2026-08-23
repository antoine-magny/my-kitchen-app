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

export {
  INGREDIENT_CATEGORIES,
  INGREDIENTS,
  type IngredientCatalogItem,
  type IngredientCategory,
};


/**
 * Liste épurée des ingrédients avec visualisations dédupliquées (1 seul ingrédient par émoji ou icône visuel unique).
 * RÈGLE DU PROJET : À utiliser obligatoirement dans les sélecteurs/grilles d'emojis UI pour éviter
 * d'afficher des icônes identiques en doublon (ex. 🥒 partagé par Courgette et Concombre).
 */
export const UNIQUE_EMOJI_INGREDIENTS: readonly IngredientCatalogItem[] = (() => {
  const seen = new Set<string>();
  const list: IngredientCatalogItem[] = [];
  for (const item of INGREDIENTS) {
    const visual = item.emoji || item.icon;
    if (visual && !seen.has(visual)) {
      seen.add(visual);
      list.push(item);
    }
  }
  return list;
})();

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

/** Emoji visuel neutre par défaut lorsqu'aucun ingrédient spécifique n'est reconnu ou choisi (ensemble vide ∅). */
export const DEFAULT_INGREDIENT_ICON = "2205";

export const EMOJI_TO_HEX_MAP: Record<string, string> = {
  "∅": "2205",
  "Ø": "2205",
  "ø": "2205",
  "🫒": "1FAD2",
  "🧈": "1F9C8",
  "🥣": "1F963",
  "🥛": "1F95B",
  "🧀": "1F9C0",
  "🍝": "1F35D",
  "🍚": "1F35A",
  "🌾": "1F33E",
  "🍫": "1F36B",
  "🍯": "1F36F",
  "🍞": "1F35E",
  "🍗": "1F357",
  "🥩": "1F969",
  "🥓": "1F953",
  "🐟": "1F41F",
  "🦐": "1F990",
  "🥔": "1F954",
  "🍅": "1F345",
  "🥬": "1F96C",
  "🥗": "1F957",
  "🍄": "1F344",
  "🥚": "1F95A",
  "🍾": "1F37E",
  "🧂": "1F9C2",
  "🥫": "1F96B",
  "☕": "2615",
  "🫖": "1FAD6",
  "🧃": "1F9C3",
  "💧": "1F4A7",
  "🍷": "1F377",
  "🍺": "1F37A",
  "🍪": "1F36A",
  "🧴": "1F9F4",
  "🧽": "1F9FD",
  "🧻": "1F9FB",
  "🦷": "1F9B7",
  "🪥": "1FAA5",
  "🗑️": "1F5D1",
  "🗑": "1F5D1",
  "🪒": "1FA92",
  "🥕": "1F955",
  "🥒": "1F952",
  "🌶️": "1F336",
  "🌶": "1F336",
  "🧄": "1F9C4",
  "🧅": "1F9C5",
  "🍋": "1F34B",
  "🍎": "1F34E",
  "🍐": "1F350",
  "🍌": "1F34C",
  "🍊": "1F34A",
  "🍑": "1F351",
  "🥝": "1F95D",
  "🍓": "1F353",
  "🍒": "1F352",
  "🍇": "1F347",
  "🍍": "1F34D",
  "🍈": "1F348",
  "🍉": "1F349",
  "🥑": "1F951",
  "🥦": "1F966",
  "🌿": "1F33F",
  "❄️": "2744",
  "🧊": "1F9CA",
};

/**
 * Normalise n'importe quel code hexadécimal ou emoji Unicode en identifiant SVG hex OpenMoji.
 */
export function toIconHex(input?: string): string {
  if (!input) return DEFAULT_INGREDIENT_ICON;
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_INGREDIENT_ICON;

  if (EMOJI_TO_HEX_MAP[trimmed]) {
    return EMOJI_TO_HEX_MAP[trimmed];
  }

  // Si c'est déjà une chaîne hex valide (ex. 1F345, 2205, 1F336-FE0F)
  if (/^[0-9A-Fa-f]{2,6}(-[0-9A-Fa-f]{2,6})*$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Conversion des points de code Unicode
  const codePoints = Array.from(trimmed)
    .map((c) => c.codePointAt(0)?.toString(16).toUpperCase())
    .filter(Boolean) as string[];

  if (codePoints.length === 0) return DEFAULT_INGREDIENT_ICON;

  const withoutFe0f = codePoints.filter((h) => h !== "FE0F").join("-");
  return withoutFe0f || DEFAULT_INGREDIENT_ICON;
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
  const singular = singularize(normalized);

  for (const [keyword, item] of EMOJI_KEYWORDS) {
    if (hasWord(normalized, keyword) || hasWord(singular, keyword)) return item.emoji || item.icon;
  }

  // Fallbacks sémantiques par racines ou mots fréquents (émojis natifs prioritaires)
  if (hasWord(normalized, "huile") || normalized.includes("huile")) return "🫒";
  if (hasWord(normalized, "beurre") || normalized.includes("beurre") || hasWord(normalized, "margarine")) return "🧈";
  if (hasWord(normalized, "granola") || hasWord(normalized, "muesli") || hasWord(normalized, "avoine") || hasWord(normalized, "cereale") || hasWord(normalized, "cereales")) return "🥣";
  if (hasWord(normalized, "lait") || hasWord(normalized, "creme")) return "🥛";
  if (hasWord(normalized, "yaourt") || hasWord(normalized, "yogourt") || hasWord(normalized, "skyr") || hasWord(normalized, "fromage blanc")) return "🥣";
  if (hasWord(normalized, "fromage") || hasWord(normalized, "comte") || hasWord(normalized, "emmental") || hasWord(normalized, "parmesan") || hasWord(normalized, "mozzarella") || hasWord(normalized, "burrata") || hasWord(normalized, "feta") || hasWord(normalized, "chevre")) return "🧀";
  if (hasWord(normalized, "pate") || hasWord(normalized, "pates") || hasWord(normalized, "spaghetti") || hasWord(normalized, "pasta") || hasWord(normalized, "linguine") || hasWord(normalized, "penne") || hasWord(normalized, "coquillette") || hasWord(normalized, "coquillettes") || hasWord(normalized, "nouille") || hasWord(normalized, "nouilles")) return "🍝";
  if (hasWord(normalized, "riz") || hasWord(normalized, "risotto")) return "🍚";
  if (hasWord(normalized, "farine") || hasWord(normalized, "fecule") || hasWord(normalized, "semoule") || hasWord(normalized, "quinoa") || hasWord(normalized, "boulgour") || hasWord(normalized, "couscous")) return "🌾";
  if (hasWord(normalized, "chocolat") || hasWord(normalized, "cacao") || hasWord(normalized, "praline")) return "🍫";
  if (hasWord(normalized, "miel") || hasWord(normalized, "confiture") || hasWord(normalized, "sirop") || hasWord(normalized, "marmelade")) return "🍯";
  if (hasWord(normalized, "pain") || hasWord(normalized, "baguette") || hasWord(normalized, "brioche") || hasWord(normalized, "toast")) return "🍞";
  if (hasWord(normalized, "poulet") || hasWord(normalized, "dinde") || hasWord(normalized, "volaille") || hasWord(normalized, "canard")) return "🍗";
  if (hasWord(normalized, "boeuf") || hasWord(normalized, "steak") || hasWord(normalized, "viande") || hasWord(normalized, "porc") || hasWord(normalized, "veau") || hasWord(normalized, "agneau")) return "🥩";
  if (hasWord(normalized, "jambon") || hasWord(normalized, "lardon") || hasWord(normalized, "lardons") || hasWord(normalized, "bacon") || hasWord(normalized, "charcuterie")) return "🥓";
  if (hasWord(normalized, "saumon") || hasWord(normalized, "cabillaud") || hasWord(normalized, "poisson") || hasWord(normalized, "thon") || hasWord(normalized, "colin") || hasWord(normalized, "dorade") || hasWord(normalized, "truite")) return "🐟";
  if (hasWord(normalized, "crevette") || hasWord(normalized, "crevettes") || hasWord(normalized, "gambas") || hasWord(normalized, "moule") || hasWord(normalized, "moules") || hasWord(normalized, "fruit de mer") || hasWord(normalized, "fruits de mer")) return "🦐";
  if (hasWord(normalized, "pomme de terre") || hasWord(normalized, "patate") || hasWord(normalized, "grenaille")) return "🥔";
  if (hasWord(normalized, "tomate") || hasWord(normalized, "tomates")) return "🍅";
  if (hasWord(normalized, "salade") || hasWord(normalized, "laitue") || hasWord(normalized, "mesclun") || hasWord(normalized, "roquette") || hasWord(normalized, "mache") || hasWord(normalized, "epinard") || hasWord(normalized, "epinards")) return "🥬";
  if (hasWord(normalized, "champignon") || hasWord(normalized, "champignons")) return "🍄";
  if (hasWord(normalized, "oeuf") || hasWord(normalized, "oeufs")) return "🥚";
  if (hasWord(normalized, "champagne") || hasWord(normalized, "alcool") || hasWord(normalized, "prosecco") || hasWord(normalized, "cremant") || hasWord(normalized, "spiritueux") || hasWord(normalized, "vodka") || hasWord(normalized, "rhum") || hasWord(normalized, "whisky") || hasWord(normalized, "gin") || hasWord(normalized, "liqueur") || hasWord(normalized, "cocktail")) return "🍾";
  if (hasWord(normalized, "sel") || hasWord(normalized, "sucre") || hasWord(normalized, "cassonade") || hasWord(normalized, "poivre") || hasWord(normalized, "epice") || hasWord(normalized, "epices") || hasWord(normalized, "paprika") || hasWord(normalized, "curry") || hasWord(normalized, "cumin") || hasWord(normalized, "curcuma") || hasWord(normalized, "cannelle")) return "🧂";
  if (hasWord(normalized, "sauce") || hasWord(normalized, "moutarde") || hasWord(normalized, "mayonnaise") || hasWord(normalized, "ketchup") || hasWord(normalized, "conserve") || hasWord(normalized, "coulis") || hasWord(normalized, "concentre") || hasWord(normalized, "pesto") || hasWord(normalized, "vinaigre") || hasWord(normalized, "vinaigrette")) return "🥫";
  if (hasWord(normalized, "cafe")) return "☕";
  if (hasWord(normalized, "the") || hasWord(normalized, "tisane") || hasWord(normalized, "infusion")) return "🫖";
  if (hasWord(normalized, "jus")) return "🧃";
  if (hasWord(normalized, "eau")) return "💧";
  if (hasWord(normalized, "glacon") || hasWord(normalized, "glacons") || hasWord(normalized, "glace") || hasWord(normalized, "glaçon") || hasWord(normalized, "glaçons")) return "🧊";
  if (hasWord(normalized, "vin")) return "🍷";
  if (hasWord(normalized, "biere") || hasWord(normalized, "cidre")) return "🍺";
  if (hasWord(normalized, "biscuit") || hasWord(normalized, "gateau") || hasWord(normalized, "cookie") || hasWord(normalized, "sable")) return "🍪";

  // Fallbacks Maison & Hygiène (les SVG OpenMoji bouchent les trous s'il n'y a pas d'émoji natif)
  if (hasWord(normalized, "savon") || hasWord(normalized, "douche") || hasWord(normalized, "shampoing") || hasWord(normalized, "vaisselle") || hasWord(normalized, "lotion") || hasWord(normalized, "lessive") || hasWord(normalized, "nettoyant") || hasWord(normalized, "javel") || hasWord(normalized, "adoucissant") || hasWord(normalized, "assouplissant")) return "1F9F4";
  if (hasWord(normalized, "eponge")) return "1F9FD";
  if (hasWord(normalized, "papier toilette") || hasWord(normalized, "mouchoir") || hasWord(normalized, "essuie tout") || hasWord(normalized, "sopalin") || hasWord(normalized, "pq")) return "1F9FB";
  if (hasWord(normalized, "dentifrice")) return "1F9B7";
  if (hasWord(normalized, "brosse a dents")) return "1FAA5";
  if (hasWord(normalized, "poubelle") || hasWord(normalized, "sac poubelle")) return "1F5D1";
  if (hasWord(normalized, "rasoir")) return "1FA92";
  if (hasWord(normalized, "pansement") || hasWord(normalized, "pansements") || hasWord(normalized, "pensement") || hasWord(normalized, "pensements") || hasWord(normalized, "medicament") || hasWord(normalized, "medicaments") || hasWord(normalized, "doliprane") || hasWord(normalized, "paracetamol") || hasWord(normalized, "sparadrap") || hasWord(normalized, "compresse")) return "E306";

  return undefined;
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
