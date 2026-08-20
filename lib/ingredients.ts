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
  /** Unité par défaut pré-remplie dans les formulaires et l'IA. */
  defaultUnit?: UnitCode;
  /** Unité variable naturelle de décompte (ex. « gousse », « tranche », « feuille »). */
  countUnit?: UnitCode;
  /** Poids moyen d'une unité de décompte (en grammes). */
  gramsPerCountUnit?: number;
  /** Volume moyen d'une unité de décompte (en millilitres). */
  mlPerCountUnit?: number;
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
 * Ingrédients du sélecteur frigo et du catalogue, enrichis avec les aliments
 * décomptés du quotidien (pièces, tranches, gousses, bottes, feuilles, brins, sachets...).
 */
export const INGREDIENTS: readonly IngredientCatalogItem[] = [
  // ==========================================
  // --- 1. LÉGUMES & BULBES (Décomptés) ---
  // ==========================================
  { id: "ing_tomate", name: "Tomate", emoji: "🍅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 120, emojiKeywords: ["tomates"] },
  { id: "ing_carotte", name: "Carotte", emoji: "🥕", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, emojiKeywords: ["carottes"] },
  { id: "ing_courgette", name: "Courgette", emoji: "🥒", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, emojiKeywords: ["courgettes"] },
  { id: "ing_concombre", name: "Concombre", emoji: "🥒", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, emojiKeywords: ["concombres"] },
  { id: "ing_poivron", name: "Poivron", emoji: "🫑", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 160, emojiKeywords: ["poivrons", "poivron rouge", "poivron vert", "poivron jaune"] },
  { id: "ing_aubergine", name: "Aubergine", emoji: "🍆", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, emojiKeywords: ["aubergines"] },
  { id: "ing_oignon", name: "Oignon", emoji: "🧅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, emojiKeywords: ["oignons", "oignon jaune", "oignon rouge"] },
  { id: "ing_echalote", name: "Échalote", emoji: "🧅", category: "vegetables", defaultUnit: "gousse", countUnit: "gousse", gramsPerCountUnit: 25, aliases: ["echalotte", "echalotes", "echalottes"] },
  { id: "ing_ail", name: "Ail", emoji: "🧄", category: "vegetables", defaultUnit: "gousse", countUnit: "gousse", gramsPerCountUnit: 5, aliases: ["gousse d ail", "gousses d ail", "tete d ail"] },
  { id: "ing_poireau", name: "Poireau", emoji: "🥬", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["poireaux", "blanc de poireau"] },
  { id: "ing_pomme_de_terre", name: "Pomme de terre", emoji: "🥔", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, emojiKeywords: ["grenaille", "patate", "pommes de terre"] },
  { id: "ing_patate_douce", name: "Patate douce", emoji: "🍠", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, emojiKeywords: ["patates douces"] },
  { id: "ing_avocat", name: "Avocat", emoji: "🥑", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, emojiKeywords: ["avocats"] },
  { id: "ing_brocoli", name: "Brocoli", emoji: "🥦", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 350, emojiKeywords: ["brocolis"] },
  { id: "ing_chou_fleur", name: "Chou-fleur", emoji: "🥦", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 600, aliases: ["chou fleur"] },
  { id: "ing_laitue", name: "Laitue / Salade", emoji: "🥬", category: "vegetables", defaultUnit: "piece", countUnit: "feuille", gramsPerCountUnit: 15, aliases: ["salade", "salade verte", "batavia", "romaine", "sucrine"] },
  { id: "ing_fenouil", name: "Fenouil", emoji: "🧅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, emojiKeywords: ["fenouils", "bulbe de fenouil"] },
  { id: "ing_celeri", name: "Céleri", emoji: "🥬", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 40, aliases: ["celeri branche", "branche de celeri"] },
  { id: "ing_radis", name: "Radis", emoji: "🔴", category: "vegetables", defaultUnit: "botte", countUnit: "botte", gramsPerCountUnit: 200, aliases: ["radis rose", "botte de radis"] },
  { id: "ing_navet", name: "Navet", emoji: "⚪", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, emojiKeywords: ["navets"] },
  { id: "ing_betterave", name: "Betterave", emoji: "🟣", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, emojiKeywords: ["betteraves", "betterave cuite"] },
  { id: "ing_artichaut", name: "Artichaut", emoji: "🟢", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, emojiKeywords: ["artichauts"] },
  { id: "ing_asperge", name: "Asperges", emoji: "🫛", category: "vegetables", defaultUnit: "botte", countUnit: "botte", gramsPerCountUnit: 250, aliases: ["asperge", "botte d asperges", "asperges vertes", "asperges blanches"] },
  { id: "ing_oignon_nouveau", name: "Oignon nouveau / Cébette", emoji: "🧅", category: "vegetables", defaultUnit: "botte", countUnit: "botte", gramsPerCountUnit: 100, aliases: ["cebette", "oignons nouveaux", "cive"] },
  { id: "ing_champignon", name: "Champignon", emoji: "🍄", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 25, emojiKeywords: ["champignons", "champignon de paris"] },
  { id: "ing_piment", name: "Piment", emoji: "🌶️", category: "vegetables", defaultUnit: "piece", countUnit: "pincee", gramsPerCountUnit: 5, emojiKeywords: ["piment rouge", "piment vert", "piment oiseau"] },
  { id: "ing_gingembre", name: "Gingembre", emoji: "🫚", category: "vegetables", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 10, emojiKeywords: ["racine de gingembre"] },

  // ==========================================
  // --- 2. HERBES FRAÎCHES & AROMATES (Feuilles, Brins, Bottes) ---
  // ==========================================
  { id: "ing_basilic", name: "Basilic", emoji: "🌿", category: "vegetables", defaultUnit: "feuille", countUnit: "feuille", gramsPerCountUnit: 1, aliases: ["basilic frais", "feuilles de basilic"] },
  { id: "ing_persil", name: "Persil", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["persil plat", "persil frise", "botte de persil"] },
  { id: "ing_ciboulette", name: "Ciboulette", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["botte de ciboulette", "brins de ciboulette"] },
  { id: "ing_menthe", name: "Menthe", emoji: "🌿", category: "vegetables", defaultUnit: "feuille", countUnit: "feuille", gramsPerCountUnit: 1, aliases: ["menthe fraiche", "feuilles de menthe"] },
  { id: "ing_coriandre", name: "Coriandre", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["coriandre fraiche", "botte de coriandre"] },
  { id: "ing_thym", name: "Thym", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin de thym", "branche de thym"] },
  { id: "ing_romarin", name: "Romarin", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin de romarin", "branche de romarin"] },
  { id: "ing_laurier", name: "Laurier", emoji: "🍃", category: "vegetables", defaultUnit: "feuille", countUnit: "feuille", gramsPerCountUnit: 1, aliases: ["feuille de laurier", "laurier sauce"] },
  { id: "ing_aneth", name: "Aneth", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin d aneth"] },
  { id: "ing_herbes", name: "Herbes fraîches", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2 },

  // ==========================================
  // --- 3. FRUITS (Pièce, Tranche) ---
  // ==========================================
  { id: "ing_citron", name: "Citron", emoji: "🍋", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, aliases: ["citron jaune", "citrons"] },
  { id: "ing_citron_vert", name: "Citron vert / Lime", emoji: "🍋‍🟩", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 70, aliases: ["lime", "citrons verts", "citron vert"] },
  { id: "ing_pomme", name: "Pomme", emoji: "🍎", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, emojiKeywords: ["pommes", "golden", "granny smith"] },
  { id: "ing_poire", name: "Poire", emoji: "🍐", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, emojiKeywords: ["poires", "williams"] },
  { id: "ing_banane", name: "Banane", emoji: "🍌", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 120, emojiKeywords: ["bananes"] },
  { id: "ing_orange", name: "Orange", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 180, emojiKeywords: ["oranges"] },
  { id: "ing_clementine", name: "Clémentine / Mandarine", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 70, aliases: ["mandarine", "clementine", "clementines", "mandarines"] },
  { id: "ing_pamplemousse", name: "Pamplemousse", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, aliases: ["pomelo", "pamplemousses"] },
  { id: "ing_peche", name: "Pêche / Nectarine", emoji: "🍑", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 130, aliases: ["nectarine", "abricot", "peches", "nectarines"] },
  { id: "ing_kiwi", name: "Kiwi", emoji: "🥝", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 80, emojiKeywords: ["kiwis"] },
  { id: "ing_ananas", name: "Ananas", emoji: "🍍", category: "fruits", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 100 },
  { id: "ing_melon", name: "Melon", emoji: "🍈", category: "fruits", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 150, aliases: ["melon charentais", "tranche de melon"] },
  { id: "ing_pasteque", name: "Pastèque", emoji: "🍉", category: "fruits", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 200, aliases: ["tranche de pasteque"] },
  { id: "ing_mangue", name: "Mangue", emoji: "🥭", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, emojiKeywords: ["mangues"] },
  { id: "ing_grenade", name: "Grenade", emoji: "🍎", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, emojiKeywords: ["grenades"] },
  { id: "ing_figue", name: "Figue", emoji: "🟣", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 50, emojiKeywords: ["figues", "figue fraiche"] },
  { id: "ing_abricot", name: "Abricot", emoji: "🍑", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 45, emojiKeywords: ["abricots"] },
  { id: "ing_prune", name: "Prune", emoji: "🟣", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 40, aliases: ["prunes", "quetsche", "mirabelle", "reine claude"] },

  // ==========================================
  // --- 4. PROTÉINES, CHARCUTERIE & TRAITEUR (Pièce, Tranche) ---
  // ==========================================
  { id: "ing_oeuf", name: "Œuf", emoji: "🥚", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 55, aliases: ["oeufs", "oeuf frais", "jaune d oeuf", "blanc d oeuf"] },
  { id: "ing_jambon_blanc", name: "Jambon blanc / cuit", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 40, aliases: ["jambon blanc", "jambon cuit", "jambon de paris", "tranches de jambon blanc", "tranche de jambon"] },
  { id: "ing_jambon_cru", name: "Jambon cru / Serrano", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["jambon cru", "jambon sec", "serrano", "prosciutto", "parme", "jambon de bayonne"] },
  { id: "ing_bacon", name: "Bacon / Poitrine", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["bacon", "tranches de bacon", "poitrine fumee"] },
  { id: "ing_saucisse", name: "Saucisse", emoji: "🌭", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 70, aliases: ["chipolata", "merguez", "saucisse de toulouse", "knacki", "saucisses"] },
  { id: "ing_cuisse_poulet", name: "Cuisse / Haut de cuisse de poulet", emoji: "🍗", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 200, aliases: ["cuisse de poulet", "haut de cuisse", "hauts de cuisse", "cuisses de poulet", "pilon de poulet", "pilons de poulet"] },
  { id: "ing_filet_poulet", name: "Filet / Escalope de poulet", emoji: "🍗", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["filet de poulet", "escalope de poulet", "escalope de dinde", "filets de poulet"] },
  { id: "ing_steak", name: "Steak / Pavé de bœuf", emoji: "🥩", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["steak", "steak hache", "pave de boeuf", "entrecote", "faux filet"] },
  { id: "ing_pave_de_saumon", name: "Pavé de saumon", emoji: "🐟", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["pave de saumon", "filet de saumon", "paves de saumon"] },
  { id: "ing_dos_cabillaud", name: "Dos de cabillaud", emoji: "🐟", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["dos de cabillaud", "filet de cabillaud", "filet de colin", "filet de lieu", "filet de dorade"] },
  { id: "ing_saumon_fume", name: "Saumon fumé", emoji: "🐟", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 35, aliases: ["saumon fume", "truite fumee", "tranches de saumon fume"] },
  { id: "ing_tofu", name: "Tofu", emoji: "🧊", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 100, emojiKeywords: ["seitan", "tempeh"] },

  // ==========================================
  // --- 5. FROMAGES (Pièce, Tranche) ---
  // ==========================================
  { id: "ing_mozzarella", name: "Mozzarella", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 125, aliases: ["boule de mozzarella", "mozzarella di bufala", "mozzarella di buffala"] },
  { id: "ing_burrata", name: "Burrata", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["burrata fraiche", "boule de burrata"] },
  { id: "ing_fromage_chevre", name: "Fromage de chèvre", emoji: "🧀", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 30, aliases: ["chevre", "buche de chevre", "crottin de chavignol", "crottin"] },
  { id: "ing_camembert", name: "Camembert / Brie", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, aliases: ["camembert", "brie", "coulommiers", "reblochon"] },
  { id: "ing_fromage_tranche", name: "Fromage en tranches", emoji: "🧀", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["tranche de fromage", "fromage a raclette", "cheddar en tranche", "emmental en tranches"] },

  // ==========================================
  // --- 6. PAINS, PÂTES À TARTE & BOULANGERIE (Tranche, Pièce) ---
  // ==========================================
  { id: "ing_pain", name: "Pain / Baguette", emoji: "🍞", category: "starches", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 35, aliases: ["baguette", "pain de campagne", "pain complet", "tranche de pain", "miche"] },
  { id: "ing_pain_mie", name: "Pain de mie", emoji: "🍞", category: "starches", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 30, aliases: ["pain de mie", "tranches de pain de mie", "toast"] },
  { id: "ing_pain_burger", name: "Pain burger / Bun", emoji: "🍔", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 60, aliases: ["pain burger", "bun", "pain a burger", "pains burger"] },
  { id: "ing_tortilla", name: "Wrap / Tortilla", emoji: "🫓", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 40, aliases: ["wrap", "tortilla", "galette de ble", "galette de mais", "tacos"] },
  { id: "ing_pate_tarte", name: "Pâte à tarte", emoji: "🥧", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 230, aliases: ["pate feuilletee", "pate brisee", "pate sablee", "rouleau de pate", "pate a pizza"] },

  // ==========================================
  // --- 7. ÉPICERIE & CONDIMENTS DÉCOMPTÉS (Sachet, Pincée, Cube, Gousse) ---
  // ==========================================
  { id: "ing_bouillon_cube", name: "Bouillon cube", emoji: "🧂", category: "pantry", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 10, aliases: ["cube de bouillon", "bouillon de volaille", "bouillon de legumes", "bouillon de boeuf", "cube maggi", "tablette de bouillon"] },
  { id: "ing_levure", name: "Levure", emoji: "🧪", category: "pantry", defaultUnit: "sachet", countUnit: "sachet", gramsPerCountUnit: 11, aliases: ["levure chimique", "levure de boulanger", "sachet de levure", "levure seche"] },
  { id: "ing_sucre_vanille", name: "Sucre vanillé", emoji: "🍬", category: "pantry", defaultUnit: "sachet", countUnit: "sachet", gramsPerCountUnit: 7, aliases: ["sucre vanille", "sachet de sucre vanille"] },
  { id: "ing_vanille_gousse", name: "Gousse de vanille", emoji: "🥢", category: "pantry", defaultUnit: "gousse", countUnit: "gousse", gramsPerCountUnit: 3, aliases: ["gousse de vanille", "vanille en gousse"] },
  { id: "ing_sel_poivre", name: "Sel & Poivre", emoji: "🧂", category: "pantry", defaultUnit: "pincee", countUnit: "pincee", gramsPerCountUnit: 1, aliases: ["sel et poivre", "sel &amp; poivre", "fleur de sel"] },
];

/**
 * Liste épurée des ingrédients avec emojis dédupliqués (1 seul ingrédient par emoji visuel unique).
 * RÈGLE DU PROJET : À utiliser obligatoirement dans les sélecteurs/grilles d'emojis UI pour éviter
 * d'afficher des icônes identiques en doublon (ex. 🥒 partagé par Courgette et Concombre).
 */
export const UNIQUE_EMOJI_INGREDIENTS: readonly IngredientCatalogItem[] = (() => {
  const seen = new Set<string>();
  const list: IngredientCatalogItem[] = [];
  for (const item of INGREDIENTS) {
    if (!seen.has(item.emoji)) {
      seen.add(item.emoji);
      list.push(item);
    }
  }
  return list;
})();

const CATALOG_BY_ID = new Map<string, IngredientCatalogItem>(
  INGREDIENTS.map((item) => [item.id, item] as const),
);

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

/** Emoji visuel neutre par défaut lorsqu'aucun ingrédient spécifique n'est reconnu ou choisi. */
export const DEFAULT_INGREDIENT_EMOJI = "🍽️";

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
  if (hasWord(norm, "lait") || hasWord(norm, "eau") || hasWord(norm, "creme") || hasWord(norm, "bouillon") || hasWord(norm, "jus") || hasWord(norm, "vinaigre")) return "ml";
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
  const emoji = resolveEmoji(trimmed);
  return {
    ingredientId: resolveIngredientId(trimmed),
    name: trimmed,
    category: category ?? classifyProduct(trimmed),
    ...(emoji ? { emoji } : {}),
  };
}
