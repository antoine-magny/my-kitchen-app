/**
 * Catalogue canonique des aliments (données uniquement).
 */
import type { UnitCode } from "@/lib/units";

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
