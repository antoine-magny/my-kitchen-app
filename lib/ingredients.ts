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
  "maison_hygiene",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface IngredientCatalogItem {
  /** Identifiant canonique préfixé `ing_`. */
  id: string;
  name: string;
  icon: string;
  emoji?: string;
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
  iconKeywords?: readonly string[];
  emojiKeywords?: readonly string[];
}

/**
 * Ingrédients du sélecteur frigo et du catalogue, enrichis avec les aliments
 * décomptés du quotidien (pièces, tranches, gousses, bottes, feuilles, brins, sachets...).
 */


export const INGREDIENTS: readonly IngredientCatalogItem[] = [
  // ==========================================
  // --- 1. LÉGUMES, BULBES & CHAMPIGNONS ---
  // ==========================================
  { id: "ing_tomate", name: "Tomate", icon: "1F345", emoji: "🍅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 120, iconKeywords: ["tomates", "tomate cerise", "tomates cerises"] },
  { id: "ing_carotte", name: "Carotte", icon: "1F955", emoji: "🥕", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, iconKeywords: ["carottes", "carotte fanee"] },
  { id: "ing_courgette", name: "Courgette", icon: "1F952", emoji: "🥒", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, iconKeywords: ["courgettes"] },
  { id: "ing_concombre", name: "Concombre", icon: "1F952", emoji: "🥒", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, iconKeywords: ["concombres"] },
  { id: "ing_poivron", name: "Poivron", icon: "1FAD1", emoji: "🫑", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 160, iconKeywords: ["poivrons", "poivron rouge", "poivron vert", "poivron jaune"] },
  { id: "ing_aubergine", name: "Aubergine", icon: "1F346", emoji: "🍆", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, iconKeywords: ["aubergines"] },
  { id: "ing_oignon", name: "Oignon", icon: "1F9C5", emoji: "🧅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, iconKeywords: ["oignons", "oignon jaune", "oignon rouge"] },
  { id: "ing_echalote", name: "Échalote", icon: "1F9C5", emoji: "🧅", category: "vegetables", defaultUnit: "gousse", countUnit: "gousse", gramsPerCountUnit: 25, aliases: ["echalotte", "echalotes", "echalottes"] },
  { id: "ing_ail", name: "Ail", icon: "1F9C4", emoji: "🧄", category: "vegetables", defaultUnit: "gousse", countUnit: "gousse", gramsPerCountUnit: 5, aliases: ["gousse d ail", "gousses d ail", "tete d ail"] },
  { id: "ing_poireau", name: "Poireau", icon: "1F96C", emoji: "🥬", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["poireaux", "blanc de poireau"] },
  { id: "ing_pomme_de_terre", name: "Pomme de terre", icon: "1F954", emoji: "🥔", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, iconKeywords: ["grenaille", "patate", "pommes de terre", "pomme de terre grenaille"] },
  { id: "ing_patate_douce", name: "Patate douce", icon: "1F360", emoji: "🍠", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, iconKeywords: ["patates douces"] },
  { id: "ing_avocat", name: "Avocat", icon: "1F951", emoji: "🥑", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, iconKeywords: ["avocats"] },
  { id: "ing_brocoli", name: "Brocoli", icon: "1F966", emoji: "🥦", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 350, iconKeywords: ["brocolis"] },
  { id: "ing_chou_fleur", name: "Chou-fleur", icon: "1F966", emoji: "🥦", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 600, aliases: ["chou fleur", "choux"] },
  { id: "ing_laitue", name: "Laitue / Salade", icon: "1F96C", emoji: "🥬", category: "vegetables", defaultUnit: "piece", countUnit: "feuille", gramsPerCountUnit: 15, aliases: ["salade", "salade verte", "batavia", "romaine", "sucrine", "mesclun", "mache", "roquette", "epinard", "epinards", "pousses d epinard"] },
  { id: "ing_fenouil", name: "Fenouil", icon: "1F9C5", emoji: "🧅", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, iconKeywords: ["fenouils", "bulbe de fenouil"] },
  { id: "ing_celeri", name: "Céleri", icon: "1F96C", emoji: "🥬", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 40, aliases: ["celeri branche", "branche de celeri", "celeri rave"] },
  { id: "ing_radis", name: "Radis", icon: "1F957", emoji: "🥗", category: "vegetables", defaultUnit: "botte", countUnit: "botte", gramsPerCountUnit: 200, aliases: ["radis rose", "botte de radis"] },
  { id: "ing_navet", name: "Navet", icon: "1F954", emoji: "🥔", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, iconKeywords: ["navets"] },
  { id: "ing_betterave", name: "Betterave", icon: "1F360", emoji: "🍠", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, iconKeywords: ["betteraves", "betterave cuite"] },
  { id: "ing_artichaut", name: "Artichaut", icon: "1F96C", emoji: "🥬", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, iconKeywords: ["artichauts", "coeur d artichaut"] },
  { id: "ing_petits_pois", name: "Petits pois", icon: "1FADB", emoji: "🫛", category: "vegetables", defaultUnit: "g", iconKeywords: ["petits pois", "pois", "haricots verts", "haricot vert", "mange tout"] },
  { id: "ing_oignon_nouveau", name: "Oignon nouveau / Cébette", icon: "1F9C5", emoji: "🧅", category: "vegetables", defaultUnit: "botte", countUnit: "botte", gramsPerCountUnit: 100, aliases: ["cebette", "oignons nouveaux", "cive"] },
  { id: "ing_champignon", name: "Champignon", icon: "1F344", emoji: "🍄", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 25, iconKeywords: ["champignons", "champignon de paris", "pleurote", "girolle", "cepe"] },
  { id: "ing_piment", name: "Piment", icon: "1F336", emoji: "🌶️", category: "vegetables", defaultUnit: "piece", countUnit: "pincee", gramsPerCountUnit: 5, iconKeywords: ["piment rouge", "piment vert", "piment oiseau", "espelette"] },
  { id: "ing_gingembre", name: "Gingembre", icon: "1FADA", emoji: "🫚", category: "vegetables", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 10, iconKeywords: ["racine de gingembre"] },
  { id: "ing_courge", name: "Courge / Butternut", icon: "1F383", emoji: "🎃", category: "vegetables", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 800, aliases: ["butternut", "potiron", "potimarron", "courge spaghetti"] },

  // ==========================================
  // --- 2. HERBES FRAÎCHES & AROMATES ---
  // ==========================================
  { id: "ing_basilic", name: "Basilic/Laurier", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "feuille", countUnit: "feuille", gramsPerCountUnit: 1, aliases: ["basilic frais", "feuilles de basilic", "feuille de laurier", "laurier sauce", "laurier"] },
  { id: "ing_persil", name: "Persil", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["persil plat", "persil frise", "botte de persil"] },
  { id: "ing_ciboulette", name: "Ciboulette", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["botte de ciboulette", "brins de ciboulette"] },
  { id: "ing_menthe", name: "Menthe", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "feuille", countUnit: "feuille", gramsPerCountUnit: 1, aliases: ["menthe fraiche", "feuilles de menthe"] },
  { id: "ing_coriandre", name: "Coriandre", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["coriandre fraiche", "botte de coriandre"] },
  { id: "ing_thym", name: "Thym", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin de thym", "branche de thym"] },
  { id: "ing_romarin", name: "Romarin", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin de romarin", "branche de romarin"] },
  { id: "ing_aneth", name: "Aneth", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, aliases: ["brin d aneth"] },
  { id: "ing_herbes", name: "Herbes fraîches", icon: "1F33F", emoji: "🌿", category: "vegetables", defaultUnit: "brin", countUnit: "brin", gramsPerCountUnit: 2, iconKeywords: ["herbes", "bouquet garni", "herbes de provence", "estragon"] },

  // ==========================================
  // --- 3. FRUITS ---
  // ==========================================
  { id: "ing_citron", name: "Citron", icon: "1F34B", emoji: "🍋", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 100, aliases: ["citron jaune", "citrons", "citron vert", "lime", "citrons verts", "jus de citron"] },
  { id: "ing_pomme", name: "Pomme", icon: "1F34E", emoji: "🍎", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, iconKeywords: ["pommes", "golden", "granny smith", "gala"] },
  { id: "ing_poire", name: "Poire", icon: "1F350", emoji: "🍐", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, iconKeywords: ["poires", "williams", "conference"] },
  { id: "ing_banane", name: "Banane", icon: "1F34C", emoji: "🍌", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 120, iconKeywords: ["bananes"] },
  { id: "ing_orange", name: "Orange", icon: "1F34A", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 180, iconKeywords: ["oranges", "jus d orange"] },
  { id: "ing_clementine", name: "Clémentine / Mandarine", icon: "1F34A", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 70, aliases: ["mandarine", "clementine", "clementines", "mandarines"] },
  { id: "ing_pamplemousse", name: "Pamplemousse", icon: "1F34A", emoji: "🍊", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, aliases: ["pomelo", "pamplemousses"] },
  { id: "ing_peche", name: "Pêche / Nectarine", icon: "1F351", emoji: "🍑", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 130, aliases: ["nectarine", "abricot", "peches", "nectarines", "abricots"] },
  { id: "ing_kiwi", name: "Kiwi", icon: "1F95D", emoji: "🥝", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 80, iconKeywords: ["kiwis"] },
  { id: "ing_raisin", name: "Raisin", icon: "1F347", emoji: "🍇", category: "fruits", defaultUnit: "g", iconKeywords: ["raisins", "raisin blanc", "raisin noir", "grappe de raisin"] },
  { id: "ing_ananas", name: "Ananas", icon: "1F34D", emoji: "🍍", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 900 },
  { id: "ing_melon", name: "Melon", icon: "1F348", emoji: "🍈", category: "fruits", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 150, aliases: ["melon charentais"] },
  { id: "ing_pasteque", name: "Pastèque", icon: "1F349", emoji: "🍉", category: "fruits", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 150, aliases: ["pasteques"] },
  { id: "ing_mangue", name: "Mangue", icon: "1F96D", emoji: "🥭", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 300, iconKeywords: ["mangues", "passion", "fruit de la passion"] },
  { id: "ing_grenade", name: "Grenade", icon: "1F34E", emoji: "🍎", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, iconKeywords: ["grenades"] },
  { id: "ing_figue", name: "Figue", icon: "1F347", emoji: "🍇", category: "fruits", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 50, iconKeywords: ["figues", "figue fraiche", "prune", "prunes", "raisin", "raisins"] },
  { id: "ing_fraise", name: "Fraise / Fruits rouges", icon: "1F353", emoji: "🍓", category: "fruits", defaultUnit: "g", iconKeywords: ["fraise", "fraises", "framboise", "framboises", "fruits rouges"] },
  { id: "ing_myrtille", name: "Myrtille / Mûre", icon: "1FAD0", emoji: "🫐", category: "fruits", defaultUnit: "g", iconKeywords: ["myrtille", "myrtilles", "mure", "mures", "cassis"] },
  { id: "ing_cerise", name: "Cerise", icon: "1F352", emoji: "🍒", category: "fruits", defaultUnit: "g", iconKeywords: ["cerise", "cerises"] },

  // ==========================================
  // --- 4. VIANDES, VOLAILLES, POISSONS & TRAITEUR ---
  // ==========================================
  { id: "ing_oeuf", name: "Œuf", icon: "1F95A", emoji: "🥚", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 55, aliases: ["oeufs", "oeuf frais", "jaune d oeuf", "blanc d oeuf"] },
  { id: "ing_jambon_blanc", name: "Jambon blanc / cuit", icon: "1F953", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 40, aliases: ["jambon blanc", "jambon cuit", "jambon de paris", "tranches de jambon blanc", "tranche de jambon"] },
  { id: "ing_jambon_cru", name: "Jambon cru / Serrano", icon: "1F953", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["jambon cru", "jambon sec", "serrano", "prosciutto", "parme", "jambon de bayonne"] },
  { id: "ing_bacon", name: "Bacon / Lardons", icon: "1F953", emoji: "🥓", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["bacon", "tranches de bacon", "poitrine fumee", "lardon", "lardons", "pancetta", "chorizo"] },
  { id: "ing_saucisse", name: "Saucisse", icon: "1F32D", emoji: "🌭", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 70, aliases: ["chipolata", "merguez", "saucisse de toulouse", "knacki", "saucisses", "saucisson"] },
  { id: "ing_cuisse_poulet", name: "Cuisse / Haut de cuisse de poulet", icon: "1F357", emoji: "🍗", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 200, aliases: ["cuisse de poulet", "haut de cuisse", "hauts de cuisse", "cuisses de poulet", "pilon de poulet", "pilons de poulet"] },
  { id: "ing_filet_poulet", name: "Filet / Escalope de poulet", icon: "1F357", emoji: "🍗", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["filet de poulet", "escalope de poulet", "escalope de dinde", "filets de poulet", "poulet", "dinde", "canard", "magret"] },
  { id: "ing_steak", name: "Steak / Bœuf / Viande rouge", icon: "1F969", emoji: "🥩", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["steak", "steak hache", "pave de boeuf", "entrecote", "faux filet", "filet de boeuf", "viande hachee", "boeuf hache", "veau", "agneau", "porc", "cote de porc", "roti"] },
  { id: "ing_pave_de_saumon", name: "Pavé de saumon", icon: "1F41F", emoji: "🐟", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["pave de saumon", "filet de saumon", "paves de saumon", "saumon"] },
  { id: "ing_dos_cabillaud", name: "Dos de cabillaud / Poisson blanc", icon: "1F41F", emoji: "🐟", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 140, aliases: ["dos de cabillaud", "filet de cabillaud", "filet de colin", "filet de lieu", "filet de dorade", "poisson", "filets de poisson blanc", "bar", "sole", "merlu"] },
  { id: "ing_saumon_fume", name: "Saumon fumé", icon: "1F41F", emoji: "🐟", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 35, aliases: ["saumon fume", "truite fumee", "tranches de saumon fume"] },
  { id: "ing_thon", name: "Thon / Sardines en boîte", icon: "1F41F", emoji: "🐟", category: "proteins", defaultUnit: "g", iconKeywords: ["thon", "thon en boite", "sardine", "sardines", "maquereau", "anchois"] },
  { id: "ing_crevettes", name: "Crevettes / Fruits de mer", icon: "1F990", emoji: "🦐", category: "proteins", defaultUnit: "g", iconKeywords: ["crevette", "crevettes", "gambas", "moule", "moules", "saint jacques", "st jacques", "calamar", "fruits de mer"] },
  { id: "ing_tofu", name: "Tofu & alternatives végétales", icon: "1F371", emoji: "🍱", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 100, aliases: ["tofu", "seitan", "tempeh", "proteines de soja"] },

  // ==========================================
  // --- 5. PRODUITS LAITIERS & FROMAGES ---
  // ==========================================
  { id: "ing_beurre", name: "Beurre", icon: "1F9C8", emoji: "🧈", category: "proteins", defaultUnit: "g", aliases: ["beurre doux", "beurre demi sel", "beurre aop", "beurre sale", "margarine"] },
  { id: "ing_lait", name: "Lait", icon: "1F95B", emoji: "🥛", category: "proteins", defaultUnit: "ml", aliases: ["lait demi ecreme", "lait entier", "lait ecreme", "lait d amande", "lait d avoine", "lait de soja", "lait de coco"] },
  { id: "ing_creme", name: "Crème fraîche / Crème liquide", icon: "1F95B", emoji: "🥛", category: "proteins", defaultUnit: "ml", aliases: ["creme fraiche", "creme liquide", "creme entiere", "creme legere", "creme fluide"] },
  { id: "ing_yaourt", name: "Yaourt / Skyr / Fromage blanc", icon: "1F963", emoji: "🥣", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 125, aliases: ["yaourt", "yaourt nature", "yaourt grec", "skyr", "fromage blanc", "petit suisse"] },
  { id: "ing_mozzarella", name: "Mozzarella", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 125, aliases: ["boule de mozzarella", "mozzarella di bufala", "mozzarella di buffala"] },
  { id: "ing_burrata", name: "Burrata", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 150, aliases: ["burrata fraiche", "boule de burrata"] },
  { id: "ing_fromage_chevre", name: "Fromage de chèvre", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 30, aliases: ["chevre", "buche de chevre", "crottin de chavignol", "crottin"] },
  { id: "ing_camembert", name: "Camembert / Brie", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 250, aliases: ["camembert", "brie", "coulommiers", "reblochon"] },
  { id: "ing_fromage_pate_dure", name: "Comté / Emmental / Parmesan", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "g", aliases: ["comte", "emmental", "parmesan", "gruyere", "pecorino", "feta", "cheddar", "fromage rape", "fromage a raclette"] },
  { id: "ing_fromage_tranche", name: "Fromage en tranches", icon: "1F9C0", emoji: "🧀", category: "proteins", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 25, aliases: ["tranche de fromage", "cheddar en tranche", "emmental en tranches"] },

  // ==========================================
  // --- 6. PAINS, CÉRÉALES & FÉCULENTS ---
  // ==========================================
  { id: "ing_pain", name: "Pain / Baguette", icon: "1F35E", emoji: "🍞", category: "starches", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 35, aliases: ["baguette", "pain de campagne", "pain complet", "tranche de pain", "miche", "pain aux cereales"] },
  { id: "ing_pain_mie", name: "Pain de mie", icon: "1F35E", emoji: "🍞", category: "starches", defaultUnit: "tranche", countUnit: "tranche", gramsPerCountUnit: 30, aliases: ["pain de mie", "tranches de pain de mie", "toast"] },
  { id: "ing_pain_burger", name: "Pain burger / Bun", icon: "1F354", emoji: "🍔", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 60, aliases: ["pain burger", "bun", "pain a burger", "pains burger"] },
  { id: "ing_tortilla", name: "Wrap / Tortilla", icon: "1FAD3", emoji: "🫓", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 40, aliases: ["wrap", "tortilla", "galette de ble", "galette de mais", "tacos", "pita"] },
  { id: "ing_pate_tarte", name: "Pâte à tarte", icon: "1F967", emoji: "🥧", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 230, aliases: ["pate feuilletee", "pate brisee", "pate sablee", "rouleau de pate", "pate a pizza"] },
  { id: "ing_viennoiserie", name: "Brioche / Viennoiserie", icon: "1F950", emoji: "🥐", category: "starches", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 60, aliases: ["brioche", "croissant", "pain au chocolat"] },
  { id: "ing_pates", name: "Pâtes", icon: "1F35D", emoji: "🍝", category: "starches", defaultUnit: "g", aliases: ["spaghetti", "pates linguine", "linguine", "penne", "coquillettes", "tagliatelles", "nouilles", "lasagnes", "pasta"] },
  { id: "ing_riz", name: "Riz", icon: "1F35A", emoji: "🍚", category: "starches", defaultUnit: "g", aliases: ["riz basmati", "riz thai", "riz rond", "riz complet", "risotto"] },
  { id: "ing_cereales_sec", name: "Quinoa / Semoule / Féculents", icon: "1F33E", emoji: "🌾", category: "starches", defaultUnit: "g", aliases: ["quinoa", "semoule", "couscous", "boulgour", "polenta"] },
  { id: "ing_granola", name: "Granola / Flocons d'avoine / Céréales", icon: "1F963", emoji: "🥣", category: "starches", defaultUnit: "g", aliases: ["granola", "flocons d avoine", "avoine", "muesli", "cereales"] },
  { id: "ing_farine", name: "Farine / Fécule", icon: "1F33E", emoji: "🌾", category: "starches", defaultUnit: "g", aliases: ["farine t55", "farine de ble", "farine", "maizena", "fecule", "fecule de mais"] },
  { id: "ing_legumineuses", name: "Légumineuses (Pois chiches / Lentilles)", icon: "1FAD8", emoji: "🫘", category: "starches", defaultUnit: "g", aliases: ["pois chiches", "pois chiche", "lentilles", "lentilles corail", "lentilles vertes", "haricots rouges", "haricots blancs"] },

  // ==========================================
  // --- 7. ÉPICERIE, CONDIMENTS, HUILES & BOISSONS ---
  // ==========================================
  { id: "ing_huile_d_olive", name: "Huile d'olive", icon: "1FAD2", emoji: "🫒", category: "pantry", defaultUnit: "c_soupe", aliases: ["huile d olive", "huile olive", "huile d'olive", "olives", "olives noires", "olives vertes", "capres"] },
  
  { id: "ing_huile", name: "Huile (Tournesol / Neutre)", icon: "1F33B", emoji: "🌻", category: "pantry", defaultUnit: "c_soupe", aliases: ["huile de tournesol", "huile de colza", "huile de truffe", "huile de sesame", "huile", "huile de friture", "huile neutre"] },
  { id: "ing_champagne", name: "Champagne / Alcool / Boissons", icon: "1F37E", emoji: "🍾", category: "pantry", defaultUnit: "ml", aliases: ["champagne", "prosecco", "cremant", "cava", "mousseux", "alcool", "spiritueux", "vodka", "rhum", "gin", "whisky", "aperitif", "cocktail", "liqueur", "boisson alcoolisee"], iconKeywords: ["champagne", "alcool", "boisson", "boissons", "prosecco", "cremant", "spiritueux", "vodka", "rhum", "whisky", "gin", "aperitif", "cocktail", "liqueur"] },
  { id: "ing_sel_poivre", name: "Sel / Sucre", icon: "1F9C2", emoji: "🧂", category: "pantry", defaultUnit: "pincee", countUnit: "pincee", gramsPerCountUnit: 1, aliases: ["sel", "sucre", "sel et poivre", "sel &amp; poivre", "fleur de sel", "poivre", "gros sel", "sucre en poudre", "cassonade", "sucre roux", "sucre glace", "sucre vanille", "sachet de sucre vanille", "paprika", "paprika fume", "curry", "cumin", "curcuma", "cannelle", "epices", "epice"], iconKeywords: ["sel", "sucre", "poivre", "epice", "epices", "cassonade"] },
  { id: "ing_sauces", name: "Sauces & Condiments (Tomate, Soja, Moutarde)", icon: "1F96B", emoji: "🥫", category: "pantry", defaultUnit: "c_soupe", aliases: ["sauce tomate", "coulis de tomate", "concentre de tomate", "tomates pelees", "sauce soja", "moutarde", "mayonnaise", "ketchup", "harissa", "pesto", "vinaigre", "vinaigrette", "vinaigre balsamique", "vinaigre de cidre", "vinaigre de vin"] },
  { id: "ing_chocolat", name: "Chocolat / Cacao", icon: "1F36B", emoji: "🍫", category: "pantry", defaultUnit: "g", aliases: ["chocolat noir", "chocolat au lait", "chocolat patissier", "chocolat noir 70%", "chocolat noir 70 %", "cacao", "praline", "pepites de chocolat"] },
  { id: "ing_miel", name: "Miel / Confiture / Sucrants", icon: "1F36F", emoji: "🍯", category: "pantry", defaultUnit: "c_soupe", aliases: ["miel", "sirop d erable", "sirop d agave", "confiture", "marmelade", "pate a tartiner", "nutella"] },
  { id: "ing_biscuits", name: "Biscuits / Gâteaux", icon: "1F36A", emoji: "🍪", category: "pantry", defaultUnit: "piece", countUnit: "piece", gramsPerCountUnit: 20, aliases: ["biscuits", "gateaux", "cookies", "sables"] },
  { id: "ing_oleagineux", name: "Noix / Amandes / Graines", icon: "1F95C", emoji: "🥜", category: "pantry", defaultUnit: "g", aliases: ["noix", "amandes", "noisettes", "cacahuetes", "pignons de pin", "graines de chia", "graines de courge", "graines de sesame", "noix de cajou"] },
  { id: "ing_cafe", name: "Café", icon: "2615", emoji: "☕", category: "pantry", defaultUnit: "g", aliases: ["cafe", "cafe en grains", "cafe moulu", "capsules de cafe"] },
  { id: "ing_the", name: "Thé / Infusion", icon: "1FAD6", emoji: "🫖", category: "pantry", defaultUnit: "sachet", countUnit: "sachet", gramsPerCountUnit: 2, aliases: ["the", "infusion", "tisane", "the vert", "the noir"] },
  { id: "ing_boissons", name: "Eau / Eau gazeuse", icon: "1F4A7", emoji: "💧", category: "pantry", defaultUnit: "ml", aliases: ["eau", "eau gazeuse", "eau minerale", "eau plate"] },
  { id: "ing_glacons", name: "Glaçons", icon: "1F9CA", emoji: "🧊", category: "pantry", defaultUnit: "piece", countUnit: "piece", aliases: ["glacons", "glacon", "glaçons", "glaçon", "glace", "glace pilee", "sac de glacons", "poche de glacons", "cubes de glace"], iconKeywords: ["glacons", "glacon", "glaçons", "glaçon", "glace", "glace pilee"] },
  { id: "ing_jus", name: "Jus de fruits", icon: "1F9C3", emoji: "🧃", category: "pantry", defaultUnit: "ml", aliases: ["jus de pomme", "jus de fruits", "jus d ananas", "smoothie"] },
  { id: "ing_vin", name: "Vin", icon: "1F377", emoji: "🍷", category: "pantry", defaultUnit: "ml", aliases: ["vin blanc", "vin rouge", "vin rose"] },
  { id: "ing_biere", name: "Bière", icon: "1F37A", emoji: "🍺", category: "pantry", defaultUnit: "ml", aliases: ["biere", "cidre"] },
  { id: "ing_levure", name: "Levure", icon: "1F33E", emoji: "🌾", category: "pantry", defaultUnit: "sachet", countUnit: "sachet", gramsPerCountUnit: 11, aliases: ["levure chimique", "levure de boulanger", "sachet de levure", "levure seche"] },
  { id: "ing_shampoing", name: "Shampoing / Gel douche / Liquide vaisselle", icon: "1F9F4", emoji: "🧴", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["shampoing", "shampooing", "apres shampoing", "apres-shampoing", "gel douche", "liquide vaisselle", "savon", "savon de marseille", "savon noir"] },
  { id: "ing_lessive", name: "Lessive / Entretien", icon: "1F9F4", emoji: "🧴", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["lessive", "nettoyant", "javel", "detergent", "assouplissant", "adoucissant", "multi usages", "multi-usages"] },
  { id: "ing_eponge", name: "Éponge", icon: "1F9FD", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["eponge", "eponges"] },
  { id: "ing_papier_toilette", name: "Papier toilette / Essuie-tout", icon: "1F9FB", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["papier toilette", "pq", "papier absorbant", "sopalin", "essuie tout", "essuie-tout", "mouchoir", "mouchoirs"] },
  { id: "ing_brosse_dents", name: "Brosse à dents", icon: "1FAA5", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["brosse a dents"] },
  { id: "ing_dentifrice", name: "Dentifrice", icon: "1F9B7", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["dentifrice"] },
  { id: "ing_sac_poubelle", name: "Sac poubelle", icon: "1F5D1", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["sac poubelle", "sacs poubelle", "poubelle"] },
  { id: "ing_rasoir", name: "Rasoir", icon: "1FA92", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["rasoir", "coton tige", "cotons tiges"] },
  { id: "ing_pansements", name: "Pansements / Médicaments", icon: "E306", category: "maison_hygiene", defaultUnit: "piece", countUnit: "piece", aliases: ["pansement", "pansements", "pensement", "pensements", "medicament", "medicaments", "doliprane", "paracetamol", "aspirine", "sparadrap", "compresse", "compresses", "bande", "desinfectant", "antiseptique", "pharmacie", "thermomètre", "sirop toux"], iconKeywords: ["pansement", "pansements", "pensement", "pensements", "medicament", "medicaments", "doliprane", "paracetamol", "aspirine", "sparadrap", "compresse", "desinfectant", "pharmacie"] },
];

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
  "🍬": "1F36C",
  "☕": "2615",
  "🫖": "1FAD6",
  "🧃": "1F9C3",
  "💧": "1F4A7",
  "🍷": "1F377",
  "🍺": "1F37A",
  "🍪": "1F36A",
  "🧼": "1F9FC",
  "🧴": "1F9F4",
  "🫧": "1FAE7",
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
  "🍏": "1F34F",
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
  "🌱": "1F331",
  "🍃": "1F343",
  "🍽️": "1F37D",
  "🍽": "1F37D",
  "❓": "2753",
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

  // Si c'est déjà une chaîne hex valide (ex. 1F345, 2753, 1F336-FE0F)
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
