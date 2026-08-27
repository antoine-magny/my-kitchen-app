/**
 * Familles de sources protéiques — socle de l'indice de diversité nutritionnelle.
 * Données et classement purs : aucun accès au localStorage, aucun JSX.
 */
import { getIngredientById } from "@/lib/ingredients";

export const PROTEIN_SOURCES = [
  { id: "viande", label: "Viandes & volailles", emoji: "🍗" },
  { id: "poisson", label: "Poissons & fruits de mer", emoji: "🐟" },
  { id: "oeuf", label: "Œufs", emoji: "🥚" },
  { id: "laitier", label: "Produits laitiers", emoji: "🧀" },
  { id: "legumineuse", label: "Légumineuses", emoji: "🫘" },
  { id: "vegetale", label: "Végétales & oléagineux", emoji: "🌱" },
] as const;

export type ProteinSourceId = (typeof PROTEIN_SOURCES)[number]["id"];

export const PROTEIN_SOURCE_COUNT = PROTEIN_SOURCES.length;

export function isProteinSourceId(value: unknown): value is ProteinSourceId {
  return PROTEIN_SOURCES.some((source) => source.id === value);
}

/**
 * Aliments du catalogue porteurs de protéines. Les entrées volontairement
 * absentes (beurre, semoule, granola…) ne comptent pas comme source.
 */
const SOURCE_BY_CATALOG_ID: Record<string, ProteinSourceId> = {
  ing_steak: "viande",
  ing_filet_poulet: "viande",
  ing_cuisse_poulet: "viande",
  ing_jambon_blanc: "viande",
  ing_jambon_cru: "viande",
  ing_bacon: "viande",
  ing_saucisse: "viande",
  ing_pave_de_saumon: "poisson",
  ing_dos_cabillaud: "poisson",
  ing_saumon_fume: "poisson",
  ing_thon: "poisson",
  ing_crevettes: "poisson",
  ing_oeuf: "oeuf",
  ing_lait: "laitier",
  ing_creme: "laitier",
  ing_yaourt: "laitier",
  ing_mozzarella: "laitier",
  ing_burrata: "laitier",
  ing_fromage_chevre: "laitier",
  ing_camembert: "laitier",
  ing_fromage_pate_dure: "laitier",
  ing_fromage_tranche: "laitier",
  ing_legumineuses: "legumineuse",
  ing_tofu: "vegetale",
  ing_oleagineux: "vegetale",
};

/** Repêchage des saisies libres hors catalogue (recettes IA, ajouts manuels). */
const KEYWORD_SOURCES: readonly (readonly [RegExp, ProteinSourceId])[] = [
  [/poulet|dinde|b(?:oe|œ)uf|porc|agneau|veau|jambon|lardon|bacon|saucisse|steak|viande|canard|magret|chorizo/, "viande"],
  [/saumon|thon|cabillaud|colin|lieu|merlu|poisson|crevette|gambas|moule|sardine|maquereau|truite|dorade|calamar|jacques/, "poisson"],
  [/oeuf|œuf/, "oeuf"],
  [/fromage|yaourt|skyr|mozzarella|burrata|feta|parmesan|comt|emmental|ch(e|è)vre|ricotta|mascarpone/, "laitier"],
  [/lentille|pois chiche|haricot rouge|haricot blanc|f(e|è)ve|l(e|é)gumineuse|edamame|flageolet/, "legumineuse"],
  [/tofu|tempeh|seitan|soja|amande|noix|noisette|cajou|graine|cacahu|quinoa/, "vegetale"],
];

/**
 * Famille protéique d'un ingrédient, ou `null` s'il n'en apporte pas.
 * Un aliment reconnu du catalogue n'est jamais repêché par mots-clés : son
 * absence de `SOURCE_BY_CATALOG_ID` est un choix, pas un oubli.
 */
export function proteinSourceOf(ingredient: { ingredientId?: string; name?: string }): ProteinSourceId | null {
  const id = ingredient.ingredientId?.trim();
  if (id && getIngredientById(id)) return SOURCE_BY_CATALOG_ID[id] ?? null;

  const name = ingredient.name?.trim().toLowerCase();
  if (!name) return null;
  for (const [pattern, source] of KEYWORD_SOURCES) {
    if (pattern.test(name)) return source;
  }
  return null;
}

/** Familles distinctes apportées par une liste d'ingrédients, sans doublon. */
export function collectProteinSources(
  ingredients: readonly { ingredientId?: string; name?: string }[],
): ProteinSourceId[] {
  const found = new Set<ProteinSourceId>();
  for (const ingredient of ingredients) {
    const source = proteinSourceOf(ingredient);
    if (source) found.add(source);
  }
  return PROTEIN_SOURCES.filter((source) => found.has(source.id)).map((source) => source.id);
}
