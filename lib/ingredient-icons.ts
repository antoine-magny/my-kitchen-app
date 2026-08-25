/**
 * Visuels d'ingrédients (émojis, hex OpenMoji, mots-clés).
 * Le matching d'identité (`ingredientId`) reste dans `lib/ingredients.ts`.
 */

import { INGREDIENTS, type IngredientCatalogItem } from "@/lib/ingredients-catalog";
import { normalizeProductName } from "@/lib/shopping-categories";

/**
 * Liste épurée : 1 seul ingrédient par émoji ou icône visuel unique.
 * À utiliser dans les sélecteurs / grilles d'emojis UI.
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

/** Emoji visuel neutre par défaut (ensemble vide ∅). */
export const DEFAULT_INGREDIENT_ICON = "2205";

const ICON_HEX_RE = /^[0-9A-Fa-f]{2,6}(-[0-9A-Fa-f]{2,6})*$/;

export function isIconHex(value: string): boolean {
  return ICON_HEX_RE.test(value.trim());
}

function stripFe0fHex(hex: string): string {
  return hex
    .toUpperCase()
    .split("-")
    .filter((part) => part !== "FE0F")
    .join("-");
}

/** Hex OpenMoji du catalogue (plus l'ensemble vide). */
export const CATALOG_ICON_HEXES: ReadonlySet<string> = new Set([
  DEFAULT_INGREDIENT_ICON,
  ...INGREDIENTS.map((item) => item.icon.toUpperCase()),
]);

const CATALOG_EMOJIS: ReadonlySet<string> = new Set(
  INGREDIENTS.flatMap((item) => (item.emoji ? [item.emoji] : [])),
);

const EMPTY_ICON_TOKENS = new Set(["∅", "Ø", "ø", DEFAULT_INGREDIENT_ICON]);

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

/** Visuel autorisé : émoji / hex du catalogue, ou clé encore mappée. */
export function isApprovedIngredientVisual(value?: string): boolean {
  if (!value?.trim()) return false;
  const trimmed = value.trim();
  if (EMPTY_ICON_TOKENS.has(trimmed)) return true;
  if (CATALOG_EMOJIS.has(trimmed)) return true;
  if (Object.prototype.hasOwnProperty.call(EMOJI_TO_HEX_MAP, trimmed)) {
    return CATALOG_ICON_HEXES.has(EMOJI_TO_HEX_MAP[trimmed]);
  }
  if (isIconHex(trimmed)) return CATALOG_ICON_HEXES.has(stripFe0fHex(trimmed));
  return false;
}

/**
 * Icône à persister. Les glyphes hors liste (ex. 🧁 / 1F9C1) sont remplacés
 * par l'icône déduite du nom, sans convertir un émoji catalogue en SVG.
 */
export function resolveStoredIngredientIcon(
  inputIcon: string | undefined,
  identityIcon?: string,
): string {
  const approvedIdentity =
    identityIcon && isApprovedIngredientVisual(identityIcon) ? identityIcon : undefined;

  if (inputIcon === undefined || !inputIcon.trim()) {
    return approvedIdentity ?? DEFAULT_INGREDIENT_ICON;
  }

  const trimmed = inputIcon.trim();
  if (EMPTY_ICON_TOKENS.has(trimmed)) return DEFAULT_INGREDIENT_ICON;

  const inputIsHex = isIconHex(trimmed);
  if (isApprovedIngredientVisual(trimmed) && !inputIsHex) {
    return trimmed;
  }

  if (approvedIdentity) return approvedIdentity;

  if (isApprovedIngredientVisual(trimmed) && inputIsHex) {
    return stripFe0fHex(trimmed);
  }

  return DEFAULT_INGREDIENT_ICON;
}

/** Normalise n'importe quel code hexadécimal ou emoji Unicode en identifiant SVG hex OpenMoji. */
export function toIconHex(input?: string): string {
  if (!input) return DEFAULT_INGREDIENT_ICON;
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_INGREDIENT_ICON;

  if (EMOJI_TO_HEX_MAP[trimmed]) {
    return EMOJI_TO_HEX_MAP[trimmed];
  }

  if (isIconHex(trimmed)) {
    return stripFe0fHex(trimmed);
  }

  const codePoints = Array.from(trimmed)
    .map((c) => c.codePointAt(0)?.toString(16).toUpperCase())
    .filter(Boolean) as string[];

  if (codePoints.length === 0) return DEFAULT_INGREDIENT_ICON;

  const withoutFe0f = codePoints.filter((h) => h !== "FE0F").join("-");
  return withoutFe0f || DEFAULT_INGREDIENT_ICON;
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

function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

/**
 * Icône par mot-clé visuel (après un miss d'identité catalogue).
 * `normalized` / `singular` sont déjà passés par `normalizeProductName`.
 */
export function resolveKeywordIcon(normalized: string, singular: string): string | undefined {
  for (const [keyword, item] of EMOJI_KEYWORDS) {
    if (hasWord(normalized, keyword) || hasWord(singular, keyword)) return item.emoji || item.icon;
  }

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
