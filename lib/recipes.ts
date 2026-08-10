export type RecipeFilter = "Tout" | "Express" | "Végétarien" | "Riche en protéines" | "Desserts";

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  title: string;
  detail: string;
  duration?: string;
}

export interface Recipe {
  id: number;
  title: string;
  photo: string;
  time: string;
  calories: number;
  proteins: number;
  servings: number;
  difficulty: "Facile" | "Moyen" | "Difficile";
  tag: RecipeFilter | null;
  tagLabel?: string;
  featured?: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Filet de bœuf, jus de truffe & légumes racines",
    photo: "https://images.unsplash.com/photo-1663530761401-15eefb544889?w=900&h=560&fit=crop&auto=format",
    time: "45 min",
    calories: 680,
    proteins: 52,
    servings: 2,
    difficulty: "Difficile",
    tag: "Riche en protéines",
    tagLabel: "Signature",
    featured: true,
    ingredients: [
      { name: "Filet de bœuf", amount: "400 g" },
      { name: "Huile de truffe", amount: "1 c.à.s" },
      { name: "Carottes", amount: "2" },
      { name: "Panais", amount: "1" },
      { name: "Beurre", amount: "30 g" },
      { name: "Bouillon de bœuf", amount: "20 cl" },
      { name: "Sel & poivre", amount: "q.s." },
    ],
    steps: [
      {
        title: "Préparer les légumes",
        detail: "Épluchez et coupez les carottes et le panais en bâtonnets réguliers. Réservez.",
        duration: "8 min",
      },
      {
        title: "Saisir le filet",
        detail: "Faites chauffer une poêle bien chaude. Salez le filet, puis saisissez-le 2 min de chaque côté jusqu’à obtenir une croûte dorée.",
        duration: "5 min",
      },
      {
        title: "Cuire les légumes",
        detail: "Dans la même poêle, faites revenir les légumes avec le beurre à feu moyen jusqu’à ce qu’ils soient tendres et caramélisés.",
        duration: "12 min",
      },
      {
        title: "Monter le jus",
        detail: "Déglacez avec le bouillon, réduisez de moitié, puis terminez avec l’huile de truffe hors du feu.",
        duration: "8 min",
      },
      {
        title: "Dresser",
        detail: "Tranchez le filet, disposez les légumes, nappez de jus de truffe et servez immédiatement.",
        duration: "3 min",
      },
    ],
  },
  {
    id: 2,
    title: "Dos de cabillaud, vierge d'herbes & fenouil braisé",
    photo: "https://images.unsplash.com/photo-1676471926534-d5c9771909fa?w=600&h=400&fit=crop&auto=format",
    time: "30 min",
    calories: 380,
    proteins: 34,
    servings: 2,
    difficulty: "Moyen",
    tag: "Riche en protéines",
    tagLabel: "Léger",
    ingredients: [
      { name: "Dos de cabillaud", amount: "2 pièces" },
      { name: "Fenouil", amount: "1" },
      { name: "Tomates cerises", amount: "150 g" },
      { name: "Huile d'olive", amount: "3 c.à.s" },
      { name: "Basilic & ciboulette", amount: "1 botte" },
      { name: "Citron", amount: "1" },
    ],
    steps: [
      {
        title: "Préparer la vierge",
        detail: "Coupez les tomates en quartiers, ciselez les herbes, mélangez avec l’huile d’olive et le zeste de citron.",
        duration: "5 min",
      },
      {
        title: "Braiser le fenouil",
        detail: "Émincez le fenouil et faites-le revenir à feu doux avec un filet d’huile jusqu’à ce qu’il soit fondant.",
        duration: "12 min",
      },
      {
        title: "Cuire le cabillaud",
        detail: "Poêlez le poisson peau vers le bas 4 min, puis retournez 2 min. Salez légèrement.",
        duration: "6 min",
      },
      {
        title: "Assembler",
        detail: "Déposez le fenouil, le cabillaud, puis nappez généreusement de vierge d’herbes. Un trait de citron et c’est prêt.",
        duration: "2 min",
      },
    ],
  },
  {
    id: 3,
    title: "Salade de burrata, tomates rôties & basilic",
    photo: "https://images.unsplash.com/photo-1771759441598-0105381b2e70?w=600&h=400&fit=crop&auto=format",
    time: "15 min",
    calories: 280,
    proteins: 12,
    servings: 2,
    difficulty: "Facile",
    tag: "Végétarien",
    tagLabel: "Express",
    ingredients: [
      { name: "Burrata", amount: "1" },
      { name: "Tomates cerises", amount: "250 g" },
      { name: "Basilic frais", amount: "10 feuilles" },
      { name: "Huile d'olive", amount: "2 c.à.s" },
      { name: "Vinaigre balsamique", amount: "1 c.à.c" },
      { name: "Fleur de sel", amount: "q.s." },
    ],
    steps: [
      {
        title: "Rôtir les tomates",
        detail: "Disposez les tomates sur une plaque, arrosez d’huile, enfournez 10 min à 200 °C jusqu’à ce qu’elles éclatent légèrement.",
        duration: "10 min",
      },
      {
        title: "Préparer l’assiette",
        detail: "Placez la burrata au centre, entourez des tomates encore tièdes.",
        duration: "2 min",
      },
      {
        title: "Assaisonner",
        detail: "Ajoutez le basilic, un filet de balsamique, de l’huile d’olive et de la fleur de sel.",
        duration: "1 min",
      },
    ],
  },
  {
    id: 4,
    title: "Buddha bowl quinoa, avocat & pois chiches croustillants",
    photo: "https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=600&h=400&fit=crop&auto=format",
    time: "20 min",
    calories: 420,
    proteins: 18,
    servings: 2,
    difficulty: "Facile",
    tag: "Végétarien",
    tagLabel: "Végétarien",
    ingredients: [
      { name: "Quinoa", amount: "120 g" },
      { name: "Pois chiches", amount: "200 g" },
      { name: "Avocat", amount: "1" },
      { name: "Concombre", amount: "1/2" },
      { name: "Yaourt grec", amount: "3 c.à.s" },
      { name: "Citron", amount: "1/2" },
      { name: "Paprika", amount: "1 c.à.c" },
    ],
    steps: [
      {
        title: "Cuire le quinoa",
        detail: "Rincez le quinoa, puis faites-le cuire 12 min dans deux volumes d’eau salée. Égouttez et laissez tiédir.",
        duration: "12 min",
      },
      {
        title: "Pois chiches croustillants",
        detail: "Égouttez les pois chiches, assaisonnez de paprika et d’huile, puis faites-les dorer à la poêle 6 min.",
        duration: "6 min",
      },
      {
        title: "Sauce citronnée",
        detail: "Mélangez le yaourt avec le jus de citron, une pincée de sel et un filet d’huile.",
        duration: "2 min",
      },
      {
        title: "Composer le bowl",
        detail: "Disposez quinoa, avocat, concombre et pois chiches. Terminez avec la sauce.",
        duration: "2 min",
      },
    ],
  },
  {
    id: 5,
    title: "Saumon fumé mi-cuit, crème citronnée & câpres",
    photo: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&auto=format",
    time: "25 min",
    calories: 450,
    proteins: 42,
    servings: 2,
    difficulty: "Moyen",
    tag: "Riche en protéines",
    tagLabel: "Protéines",
    ingredients: [
      { name: "Pavés de saumon", amount: "2" },
      { name: "Crème fraîche", amount: "10 cl" },
      { name: "Citron", amount: "1" },
      { name: "Câpres", amount: "2 c.à.s" },
      { name: "Aneth", amount: "quelques brins" },
      { name: "Beurre", amount: "20 g" },
    ],
    steps: [
      {
        title: "Saisir le saumon",
        detail: "Poêlez les pavés dans le beurre 3 min côté peau, puis 2 min de l’autre côté pour un cœur mi-cuit.",
        duration: "5 min",
      },
      {
        title: "Préparer la crème",
        detail: "Dans la poêle, ajoutez crème, zeste et jus de citron. Laissez épaissir 2 min à feu doux.",
        duration: "3 min",
      },
      {
        title: "Finir la sauce",
        detail: "Incorporez les câpres et l’aneth ciselé. Rectifiez l’assaisonnement.",
        duration: "2 min",
      },
      {
        title: "Servir",
        detail: "Nappez le saumon de crème citronnée et servez avec un accompagnement de saison.",
        duration: "1 min",
      },
    ],
  },
  {
    id: 6,
    title: "Poulet rôti, jus corsé & pommes de terre grenaille",
    photo: "https://images.unsplash.com/photo-1539735257177-0d3949225f96?w=600&h=400&fit=crop&auto=format",
    time: "18 min",
    calories: 510,
    proteins: 38,
    servings: 2,
    difficulty: "Facile",
    tag: "Express",
    tagLabel: "Express",
    ingredients: [
      { name: "Hauts de cuisse de poulet", amount: "4" },
      { name: "Pommes de terre grenaille", amount: "400 g" },
      { name: "Thym & romarin", amount: "quelques brins" },
      { name: "Ail", amount: "3 gousses" },
      { name: "Huile d'olive", amount: "2 c.à.s" },
      { name: "Bouillon de volaille", amount: "10 cl" },
    ],
    steps: [
      {
        title: "Préchauffer",
        detail: "Préchauffez le four à 210 °C. Lavez les pommes de terre et séchez-les bien.",
        duration: "2 min",
      },
      {
        title: "Assaisonner",
        detail: "Mélangez poulet, pommes de terre, herbes, ail et huile sur une plaque. Salez et poivrez.",
        duration: "3 min",
      },
      {
        title: "Rôtir",
        detail: "Enfournez 35–40 min jusqu’à ce que le poulet soit doré et les pommes de terre croustillantes.",
        duration: "10 min",
      },
      {
        title: "Jus corsé",
        detail: "Déglacez la plaque avec le bouillon, récupérez le jus, nappez et servez.",
        duration: "3 min",
      },
    ],
  },
  {
    id: 7,
    title: "Moelleux au chocolat noir, cœur coulant praliné",
    photo: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&auto=format",
    time: "35 min",
    calories: 520,
    proteins: 8,
    servings: 4,
    difficulty: "Moyen",
    tag: "Desserts",
    tagLabel: "Dessert",
    ingredients: [
      { name: "Chocolat noir 70 %", amount: "150 g" },
      { name: "Beurre", amount: "100 g" },
      { name: "Œufs", amount: "3" },
      { name: "Sucre", amount: "80 g" },
      { name: "Farine", amount: "40 g" },
      { name: "Praliné", amount: "60 g" },
    ],
    steps: [
      {
        title: "Faire fondre",
        detail: "Faites fondre le chocolat et le beurre au bain-marie jusqu’à obtenir un mélange lisse.",
        duration: "5 min",
      },
      {
        title: "Mélanger",
        detail: "Incorporez les œufs battus avec le sucre, puis la farine. Ne travaillez pas trop la pâte.",
        duration: "5 min",
      },
      {
        title: "Former les cœurs",
        detail: "Versez la moitié de la pâte dans des ramequins beurrés, ajoutez une noix de praliné, recouvrez.",
        duration: "5 min",
      },
      {
        title: "Cuire",
        detail: "Enfournez 10–12 min à 180 °C : le centre doit rester fondant. Démoulez et servez chaud.",
        duration: "12 min",
      },
    ],
  },
  {
    id: 8,
    title: "Grande salade fraîche, vinaigrette miel & moutarde",
    photo: "https://images.unsplash.com/photo-1778690103044-88ad0e274e32?w=600&h=400&fit=crop&auto=format",
    time: "12 min",
    calories: 240,
    proteins: 10,
    servings: 2,
    difficulty: "Facile",
    tag: "Express",
    tagLabel: "Express",
    ingredients: [
      { name: "Mesclun", amount: "120 g" },
      { name: "Concombre", amount: "1/2" },
      { name: "Radis", amount: "6" },
      { name: "Feta", amount: "80 g" },
      { name: "Miel", amount: "1 c.à.c" },
      { name: "Moutarde", amount: "1 c.à.c" },
      { name: "Huile d'olive", amount: "3 c.à.s" },
    ],
    steps: [
      {
        title: "Laver et couper",
        detail: "Lavez le mesclun. Tranchez finement le concombre et les radis.",
        duration: "4 min",
      },
      {
        title: "Vinaigrette",
        detail: "Émulsionnez miel, moutarde, huile d’olive et une pincée de sel jusqu’à ce que la sauce soit homogène.",
        duration: "2 min",
      },
      {
        title: "Assembler",
        detail: "Mélangez les légumes, ajoutez la feta émiettée, arrosez de vinaigrette et servez aussitôt.",
        duration: "2 min",
      },
    ],
  },
  {
    id: 9,
    title: "Sauce poisson maison, légumes poêlés",
    photo: "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf9?w=600&h=400&fit=crop&auto=format",
    time: "40 min",
    calories: 390,
    proteins: 29,
    servings: 2,
    difficulty: "Moyen",
    tag: "Végétarien",
    tagLabel: "Gastronomique",
    ingredients: [
      { name: "Filets de poisson blanc", amount: "300 g" },
      { name: "Courgette", amount: "1" },
      { name: "Poivron rouge", amount: "1" },
      { name: "Oignon", amount: "1" },
      { name: "Crème liquide", amount: "15 cl" },
      { name: "Vin blanc", amount: "8 cl" },
      { name: "Persil", amount: "1 c.à.s" },
    ],
    steps: [
      {
        title: "Préparer les légumes",
        detail: "Émincez l’oignon, coupez la courgette et le poivron en dés. Réservez.",
        duration: "8 min",
      },
      {
        title: "Poêler les légumes",
        detail: "Faites revenir l’oignon, puis les légumes 8 min à feu moyen jusqu’à ce qu’ils soient tendres.",
        duration: "10 min",
      },
      {
        title: "Cuire le poisson",
        detail: "Ajoutez le poisson sur les légumes, déglacez au vin blanc, couvrez 6 min.",
        duration: "8 min",
      },
      {
        title: "Lier la sauce",
        detail: "Incorporez la crème, laissez épaissir 3 min, parsemez de persil et servez.",
        duration: "5 min",
      },
    ],
  },
];

export function getRecipeById(id: number): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
