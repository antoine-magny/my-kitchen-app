/**
 * Catalogue global des ingrédients disponibles dans l'app.
 * Utilisé notamment pour le sélecteur d'emoji à l'ajout d'un item frigo.
 */

export const INGREDIENT_CATEGORIES = [
  "vegetables",
  "fruits",
  "proteins",
  "starches",
  "pantry",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface IngredientCatalogItem {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
}

/**
 * Ingrédients déjà présents dans le sélecteur (conservés tels quels côté emoji).
 * Puis enrichissement demandé (légumes, fruits, protéines, féculents, épicerie).
 */
export const INGREDIENTS = [
  // --- Existants (sélecteur frigo) ---
  { id: "egg", name: "Œuf", emoji: "🥚", category: "proteins" },
  { id: "milk", name: "Lait", emoji: "🥛", category: "proteins" },
  { id: "cheese", name: "Fromage", emoji: "🧀", category: "proteins" },
  { id: "beef", name: "Bœuf / Steak", emoji: "🥩", category: "proteins" },
  { id: "tomato", name: "Tomate", emoji: "🍅", category: "vegetables" },
  { id: "carrot", name: "Carotte", emoji: "🥕", category: "vegetables" },
  { id: "butter", name: "Beurre", emoji: "🧈", category: "proteins" },
  { id: "salad", name: "Salade", emoji: "🥗", category: "vegetables" },
  { id: "lemon", name: "Citron", emoji: "🍋", category: "fruits" },
  { id: "blueberry", name: "Myrtilles", emoji: "🫐", category: "fruits" },
  { id: "apple", name: "Pomme", emoji: "🍎", category: "fruits" },
  { id: "orange", name: "Orange", emoji: "🍊", category: "fruits" },
  { id: "broccoli", name: "Brocoli", emoji: "🥦", category: "vegetables" },
  { id: "lettuce", name: "Laitue", emoji: "🥬", category: "vegetables" },
  { id: "onion", name: "Oignon", emoji: "🧅", category: "vegetables" },
  { id: "potato", name: "Pomme de terre", emoji: "🥔", category: "vegetables" },
  { id: "bell_pepper", name: "Poivron", emoji: "🫑", category: "vegetables" },
  { id: "bread", name: "Pain", emoji: "🍞", category: "starches" },
  { id: "fish", name: "Poisson", emoji: "🐟", category: "proteins" },
  { id: "meat", name: "Viande", emoji: "🍖", category: "proteins" },
  { id: "avocado", name: "Avocat", emoji: "🥑", category: "vegetables" },
  { id: "grapes", name: "Raisin", emoji: "🍇", category: "fruits" },
  { id: "ginger", name: "Gingembre", emoji: "🫚", category: "vegetables" },
  { id: "garlic", name: "Ail", emoji: "🧄", category: "vegetables" },

  // --- Légumes & herbes ---
  { id: "mushroom", name: "Champignon", emoji: "🍄", category: "vegetables" },
  { id: "cucumber", name: "Concombre / Courgette", emoji: "🥒", category: "vegetables" },
  { id: "chili_pepper", name: "Piment", emoji: "🌶️", category: "vegetables" },
  { id: "eggplant", name: "Aubergine", emoji: "🍆", category: "vegetables" },
  { id: "corn", name: "Maïs", emoji: "🌽", category: "vegetables" },
  { id: "peas", name: "Petits pois", emoji: "🫛", category: "vegetables" },
  { id: "olive", name: "Olive", emoji: "🫒", category: "vegetables" },
  { id: "herbs", name: "Herbes fraîches", emoji: "🌿", category: "vegetables" },
  { id: "sweet_potato", name: "Patate douce", emoji: "🍠", category: "vegetables" },

  // --- Fruits ---
  { id: "banana", name: "Banane", emoji: "🍌", category: "fruits" },
  { id: "strawberry", name: "Fraise", emoji: "🍓", category: "fruits" },
  { id: "watermelon", name: "Pastèque", emoji: "🍉", category: "fruits" },
  { id: "peach", name: "Pêche", emoji: "🍑", category: "fruits" },
  { id: "pear", name: "Poire", emoji: "🍐", category: "fruits" },
  { id: "pineapple", name: "Ananas", emoji: "🍍", category: "fruits" },
  { id: "kiwi", name: "Kiwi", emoji: "🥝", category: "fruits" },
  { id: "cherry", name: "Cerise", emoji: "🍒", category: "fruits" },

  // --- Protéines & laitiers ---
  { id: "bacon", name: "Bacon / Porc", emoji: "🥓", category: "proteins" },
  { id: "shrimp", name: "Crevette", emoji: "🦐", category: "proteins" },
  { id: "yogurt", name: "Yaourt / Crème", emoji: "🥣", category: "proteins" },
  { id: "tofu", name: "Tofu", emoji: "🧊", category: "proteins" },

  // --- Féculents & céréales ---
  { id: "rice", name: "Riz", emoji: "🍚", category: "starches" },
  { id: "pasta", name: "Pâtes", emoji: "🍝", category: "starches" },
  { id: "flour", name: "Farine", emoji: "🌾", category: "starches" },
  { id: "beans", name: "Légumineuses / Haricots", emoji: "🫘", category: "starches" },
  { id: "nuts", name: "Fruits à coque / Noix", emoji: "🥜", category: "starches" },
  { id: "oats", name: "Flocons d'avoine", emoji: "🥣", category: "starches" },

  // --- Épicerie & condiments ---
  { id: "oil", name: "Huile", emoji: "🫗", category: "pantry" },
  { id: "salt_pepper", name: "Sel & Poivre", emoji: "🧂", category: "pantry" },
  { id: "honey", name: "Miel", emoji: "🍯", category: "pantry" },
  { id: "sugar", name: "Sucre", emoji: "🍬", category: "pantry" },
  { id: "sauce", name: "Sauce / Vinaigre", emoji: "🥢", category: "pantry" },
  { id: "canned_food", name: "Boîte de conserve", emoji: "🥫", category: "pantry" },
] as const satisfies readonly IngredientCatalogItem[];
