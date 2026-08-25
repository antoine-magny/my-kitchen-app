/**
 * Base de données du centre d'aide & support : FAQ, guides et contact.
 * Fichier 100% pur TypeScript (zéro JSX).
 */

export type FaqCategory = "all" | "frigo" | "recettes" | "planning" | "courses" | "compte";

export type FaqCategoryDef = {
  id: FaqCategory;
  label: string;
  emoji: string;
};

export type FaqItem = {
  id: string;
  category: Exclude<FaqCategory, "all">;
  question: string;
  answer: string;
  keywords: string[];
};

export type QuickGuideItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  route: string;
};

export type ContactTopicId = "bug" | "suggestion" | "question" | "other";

export type ContactTopic = {
  id: ContactTopicId;
  label: string;
  emoji: string;
};

export const SUPPORT_EMAIL = "contact@my-kitchen-app.local";

export const FAQ_CATEGORIES: readonly FaqCategoryDef[] = [
  { id: "all", label: "Toutes", emoji: "✨" },
  { id: "frigo", label: "Frigo & DLC", emoji: "🧊" },
  { id: "recettes", label: "Recettes & IA", emoji: "🍳" },
  { id: "planning", label: "Planning", emoji: "📅" },
  { id: "courses", label: "Courses", emoji: "🛒" },
  { id: "compte", label: "Compte & Données", emoji: "👤" },
] as const;

export const QUICK_GUIDES: readonly QuickGuideItem[] = [
  {
    id: "guide-frigo",
    title: "Remplir mon inventaire",
    description: "Ajoutez vos aliments et fixez leurs DLC pour éviter le gaspillage.",
    emoji: "🧊",
    route: "/frigo",
  },
  {
    id: "guide-recettes",
    title: "Générer avec l'IA",
    description: "Laissez l'IA inventer des recettes sur mesure selon vos restes.",
    emoji: "✨",
    route: "/recettes",
  },
  {
    id: "guide-planning",
    title: "Organiser ma semaine",
    description: "Planifiez vos repas et suivez vos calories et protéines au jour le jour.",
    emoji: "📅",
    route: "/planning",
  },
  {
    id: "guide-courses",
    title: "Optimiser mes courses",
    description: "Générez votre liste depuis le planning et rangez tout au frigo en un clic.",
    emoji: "🛒",
    route: "/courses",
  },
] as const;

export const CONTACT_TOPICS: readonly ContactTopic[] = [
  { id: "bug", label: "Signaler un bug", emoji: "🐛" },
  { id: "suggestion", label: "Idée / Suggestion", emoji: "💡" },
  { id: "question", label: "Question d'utilisation", emoji: "❓" },
  { id: "other", label: "Autre demande", emoji: "💬" },
] as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  // --- FRIGO & DLC ---
  {
    id: "frigo-add",
    category: "frigo",
    question: "Comment ajouter des aliments dans mon frigo ?",
    answer: "Rendez-vous dans l'onglet Frigo puis cliquez sur le bouton « + » ou utilisez la barre de recherche rapide. Vous pouvez renseigner le nom, la quantité, l'emplacement (Frigo, Congélateur, Placard) et la date limite de consommation (DLC).",
    keywords: ["ajouter", "stock", "inventaire", "nouvel aliment", "frigo", "placard", "congélateur"],
  },
  {
    id: "frigo-dlc-colors",
    category: "frigo",
    question: "Comment fonctionne le code couleur des DLC ?",
    answer: "Les pastilles colorées indiquent l'urgence : Rouge pour les aliments périmés ou à consommer sous 48h, Orange pour ceux à consommer sous 3 à 5 jours, et Vert pour les aliments à longue conservation.",
    keywords: ["dlc", "couleur", "pastille", "urgence", "périmé", "expiration", "anti-gaspillage"],
  },
  {
    id: "frigo-storage-zones",
    category: "frigo",
    question: "À quoi servent les 3 zones (Frigo, Congélateur, Placard) ?",
    answer: "Elles permettent de compartimenter vos stocks. Le Frigo et le Placard sont prioritaires pour la détection anti-gaspillage, tandis que le Congélateur permet une conservation longue durée.",
    keywords: ["zones", "compartiments", "congélateur", "placard", "rangement", "conservation"],
  },

  // --- RECETTES & IA ---
  {
    id: "recettes-ia-generation",
    category: "recettes",
    question: "Comment fonctionne la génération de recettes par IA ?",
    answer: "Dans l'onglet Recettes, cliquez sur « Générer avec mon frigo ». L'IA Gemini analyse les ingrédients présents dans votre inventaire, priorise les DLC proches et compose des recettes équilibrées.",
    keywords: ["ia", "gemini", "générer", "magique", "suggestion", "recette frigo", "anti-gaspi"],
  },
  {
    id: "recettes-custom-add",
    category: "recettes",
    question: "Puis-je créer et enregistrer mes propres recettes ?",
    answer: "Oui ! Cliquez sur le bouton « + » dans l'onglet Recettes pour ouvrir le créateur et renseigner vos ingrédients, macros et étapes.",
    keywords: ["créer", "ajouter", "personnalisée", "recette maison", "mes recettes"],
  },

  // --- PLANNING ---
  {
    id: "planning-weekly-setup",
    category: "planning",
    question: "Comment organiser mes repas sur la semaine ?",
    answer: "Dans l'onglet Planning, sélectionnez un jour et attribuez une recette pour le Déjeuner ou le Dîner parmi vos favoris, le catalogue ou vos recettes personnalisées.",
    keywords: ["planning", "semaine", "repas", "déjeuner", "dîner", "organisation", "menu"],
  },
  {
    id: "planning-missing-to-shop",
    category: "planning",
    question: "Comment exporter les ingrédients manquants vers les courses ?",
    answer: "L'application compare les ingrédients de vos recettes planifiées avec le stock réel de votre frigo et vous permet d'ajouter les ingrédients manquants en un clic à votre liste de courses.",
    keywords: ["manquant", "export", "courses", "synchroniser", "ingrédients manquants"],
  },

  // --- COURSES ---
  {
    id: "courses-auto-merge",
    category: "courses",
    question: "Comment fonctionne la fusion intelligente des ingrédients ?",
    answer: "Si plusieurs repas planifiés nécessitent le même ingrédient (ex. 200g puis 300g de tomates), l'application additionne automatiquement les quantités pour créer une seule ligne de 500g dans vos courses.",
    keywords: ["fusion", "quantité", "addition", "regroupement", "doublons", "courses"],
  },
  {
    id: "courses-store-to-fridge",
    category: "courses",
    question: "Comment transférer mes articles achetés vers le frigo ?",
    answer: "Cochez vos articles achetés au fur et à mesure dans votre liste puis cliquez sur « Ranger au frigo » pour les basculer instantanément dans votre inventaire.",
    keywords: ["ranger", "transférer", "cocher", "acheté", "inventaire", "basculer"],
  },

  // --- COMPTE & DONNÉES ---
  {
    id: "compte-offline-local",
    category: "compte",
    question: "Puis-je utiliser l'application sans compte ou hors-ligne ?",
    answer: "Oui ! My Kitchen fonctionne en mode local prioritaire avec sauvegarde dans votre navigateur (localStorage). Dès que vous vous connectez, vos données locales sont rattachées à votre compte Supabase.",
    keywords: ["hors-ligne", "invité", "compte", "localstorage", "sauvegarde", "connexion"],
  },
  {
    id: "compte-calc-goals",
    category: "compte",
    question: "Comment calculer mes besoins caloriques et protéiques ?",
    answer: "Dans Paramètres > Ma cuisine & objectifs, cliquez sur « Calculer mes cibles ». Renseignez votre profil pour une estimation personnalisée instantanée.",
    keywords: ["calcul", "cibles", "poids", "taille", "métabolisme", "besoins"],
  },
] as const;

/**
 * Filtre et recherche dans la FAQ avec scoring textuel et support multi-mots clés.
 */
export function searchFaqItems(
  query: string,
  category: FaqCategory = "all",
): FaqItem[] {
  const cleanQuery = query.trim().toLowerCase();

  return FAQ_ITEMS.filter((item) => {
    // 1. Filtrage par catégorie
    if (category !== "all" && item.category !== category) {
      return false;
    }

    // 2. Recherche textuelle
    if (!cleanQuery) return true;

    const normalizedQuestion = item.question.toLowerCase();
    const normalizedAnswer = item.answer.toLowerCase();
    const matchesKeywords = item.keywords.some((kw) =>
      kw.toLowerCase().includes(cleanQuery),
    );

    return (
      normalizedQuestion.includes(cleanQuery) ||
      normalizedAnswer.includes(cleanQuery) ||
      matchesKeywords
    );
  });
}

/** Alias pour compatibilité */
export const searchFaq = searchFaqItems;

