/**
 * Catégories officielles de la liste de courses + classification automatique.
 */

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

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Mot entier (évite « ail » dans « mayonnaise », « riz » dans « maïs », etc.). */
function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

function hasAnyWord(haystack: string, words: readonly string[]): boolean {
  return words.some((w) => hasWord(haystack, w));
}

// --- Motifs / lexiques (ordre de priorité dans classifyProduct) ---

const SURGELES_MARKERS = [
  "surgele",
  "surgeles",
  "congele",
  "congeles",
  "congelateur",
  "glace",
  "glaces",
  "sorbet",
  "sorbets",
  "glacon",
  "glacons",
  "pizza surgelee",
  "frites surgelees",
] as const;

const MAISON_HYGIENE = [
  "liquide vaisselle",
  "lessive",
  "eponge",
  "eponges",
  "nettoyant",
  "multi usages",
  "multi-usages",
  "sac poubelle",
  "sacs poubelle",
  "papier absorbant",
  "sopalin",
  "papier toilette",
  "pq",
  "mouchoir",
  "mouchoirs",
  "dentifrice",
  "brosse a dents",
  "gel douche",
  "shampoing",
  "shampooing",
  "savon",
  "desodorisant",
  "javel",
  "detergent",
  "assouplissant",
  "essuie tout",
  "essuie-tout",
  "coton tige",
  "rasoir",
  "apres shampoing",
  "apres-shampoing",
] as const;

/** Conserves / bocaux → épicerie (avant fruits/protéines frais). */
const EPICERIE_CONSERVE_MARKERS = [
  "conserve",
  "conserves",
  "en boite",
  "en boites",
  "boite de",
  "bocal",
  "bocaux",
  "en conserve",
  "sauce tomate",
  "coulis de tomate",
  "concentre de tomate",
  "tomate pelee",
  "tomates pelees",
  "thon en boite",
  "sardine",
  "sardines",
  "maquereau en boite",
] as const;

/** Produits secs / ambiants qui citent une protéine mais restent en épicerie. */
const EPICERIE_OVERRIDE_MARKERS = [
  "bouillon",
  "fond de veau",
  "fond de volaille",
  "cube de",
  "cubes de",
] as const;

const LAITIERS_VIANDES = [
  // Laitiers
  "lait",
  "fromage",
  "beurre",
  "yaourt",
  "yogourt",
  "yoghourt",
  "creme fraiche",
  "creme liquide",
  "creme entiere",
  "mascarpone",
  "ricotta",
  "mozzarella",
  "burrata",
  "feta",
  "parmesan",
  "comte",
  "chevre",
  "emmental",
  "gruyere",
  "camembert",
  "brie",
  "skyr",
  // Œufs
  "oeuf",
  "oeufs",
  // Viandes & charcuterie
  "viande",
  "boeuf",
  "steak",
  "poulet",
  "dinde",
  "porc",
  "bacon",
  "jambon",
  "saucisse",
  "saucisses",
  "saucisson",
  "agneau",
  "veau",
  "canard",
  "lapin",
  "lardon",
  "lardons",
  "chorizo",
  "merguez",
  "escalope",
  "cotelette",
  "roti",
  "hache",
  "charcuterie",
  "cuisse de",
  "filet de boeuf",
  "filet mignon",
  "hauts de cuisse",
  // Poissons & fruits de mer (frais / rayon frais)
  "poisson",
  "saumon",
  "cabillaud",
  "thon frais",
  "crevette",
  "crevettes",
  "moule",
  "moules",
  "colin",
  "lieu noir",
  "dorade",
  "truite",
  "sole",
  "maquereau",
  "sardine fraiche",
  "fruit de mer",
  "fruits de mer",
  "calamar",
  "encornet",
  "st jacques",
  "saint jacques",
  // Alternatives végétales / protéines végétales
  "tofu",
  "seitan",
  "tempeh",
  "lait de soja",
  "lait d amande",
  "lait d avoine",
  "lait vegetal",
  "lait vegetaux",
  "yaourt vegetal",
  "yaourt de soja",
  "creme vegetale",
  "creme de soja",
  "fromage vegetal",
  "steak vegetal",
  "galette vegetarienne",
  "galettes vegetariennes",
  "hamburger vegetal",
  "proteine de soja",
] as const;

const FRUITS_LEGUMES = [
  // Fruits
  "pomme",
  "pommes",
  "banane",
  "bananes",
  "fraise",
  "fraises",
  "citron",
  "citrons",
  "orange",
  "oranges",
  "raisin",
  "raisins",
  "pasteque",
  "pasteques",
  "myrtille",
  "myrtilles",
  "peche",
  "peches",
  "poire",
  "poires",
  "ananas",
  "kiwi",
  "kiwis",
  "cerise",
  "cerises",
  "mangue",
  "mangues",
  "abricot",
  "abricots",
  "framboise",
  "framboises",
  "mure",
  "mures",
  "melon",
  "melons",
  "pamplemousse",
  "clementine",
  "clementines",
  "mandarine",
  "mandarines",
  "figue",
  "figues",
  "prune",
  "prunes",
  "nectarine",
  "nectarines",
  "fruit",
  "fruits",
  // Légumes
  "tomate",
  "tomates",
  "tomate cerise",
  "tomates cerises",
  "carotte",
  "carottes",
  "poivron",
  "poivrons",
  "concombre",
  "concombres",
  "courgette",
  "courgettes",
  "aubergine",
  "aubergines",
  "salade",
  "laitue",
  "mesclun",
  "roquette",
  "brocoli",
  "brocolis",
  "chou",
  "choux",
  "chou fleur",
  "epinard",
  "epinards",
  "haricot vert",
  "haricots verts",
  "petit pois",
  "petits pois",
  "radis",
  "betterave",
  "betteraves",
  "celeri",
  "fenouil",
  "poireau",
  "poireaux",
  "navet",
  "navets",
  "panais",
  "asperge",
  "asperges",
  "artichaut",
  "artichauts",
  "courge",
  "potiron",
  "potimarron",
  "mais doux",
  "avocat",
  "avocats",
  "legume",
  "legumes",
  // Bulbes & tubercules
  "oignon",
  "oignons",
  "ail",
  "echalote",
  "echalotes",
  "gingembre",
  "patate douce",
  "patates douces",
  "pomme de terre",
  "pommes de terre",
  "grenaille",
  // Champignons & herbes
  "champignon",
  "champignons",
  "basilic",
  "persil",
  "menthe",
  "ciboulette",
  "coriandre",
  "aneth",
  "thym",
  "romarin",
  "estragon",
  "laurier",
  "herbes fraiches",
  "herbe fraiche",
  "herbes aromatiques",
] as const;

const EPICERIE_FECULENTS = [
  // Céréales & féculents
  "pate",
  "pates",
  "riz",
  "farine",
  "semoule",
  "quinoa",
  "flocons d avoine",
  "avoine",
  "cereale",
  "cereales",
  "boulgour",
  "couscous",
  "polenta",
  "mais",
  // Boulangerie
  "pain",
  "pain de mie",
  "brioche",
  "tortilla",
  "tortillas",
  "biscotte",
  "biscottes",
  "baguette",
  // Légumineuses
  "haricot rouge",
  "haricots rouges",
  "haricot blanc",
  "haricots blancs",
  "lentille",
  "lentilles",
  "pois chiche",
  "pois chiches",
  "legumineuse",
  "legumineuses",
  // Huiles & condiments
  "huile",
  "vinaigre",
  "sel",
  "poivre",
  "epice",
  "epices",
  "sauce soja",
  "moutarde",
  "mayonnaise",
  "ketchup",
  "bouillon",
  "paprika",
  "curcuma",
  "cumin",
  "cannelle",
  "capre",
  "capres",
  "olive",
  "olives",
  "fleur de sel",
  // Sucrants & pâtisserie
  "sucre",
  "miel",
  "sirop d erable",
  "chocolat",
  "poudre a lever",
  "levure",
  "noix",
  "cacahuete",
  "cacahuetes",
  "amande",
  "amandes",
  "noisette",
  "noisettes",
  "praline",
  "cacao",
  "vanille",
  "vin",
  "biere",
] as const;

function matchesLaitiersViandes(n: string): boolean {
  if (hasWord(n, "laitue")) return false;

  if (
    /lait\s+(d |de )?(amande|avoine|soja|riz|coco|vegetal)/.test(n) ||
    /(yaourt|creme|fromage)\s+(vegetal|de soja|d amande|d avoine)/.test(n) ||
    /(steak|galette|burger|nugget)s?\s+veget/.test(n)
  ) {
    return true;
  }

  if (includesAny(n, LAITIERS_VIANDES)) return true;

  return hasAnyWord(n, [
    "lait",
    "oeuf",
    "oeufs",
    "tofu",
    "seitan",
    "tempeh",
    "thon",
    "saumon",
    "cabillaud",
  ]);
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
