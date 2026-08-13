import "server-only";

import { Type } from "@google/genai";
import type { FridgeSnapshotItem } from "@/lib/fridge";
import {
  createGeminiClient,
  getGeminiApiKey,
  getGeminiModel,
} from "@/lib/ai/gemini";
import {
  MEAL_TYPE_LABELS,
  type MealType,
} from "@/lib/meal-types";
import {
  DIFFICULTIES,
  RECIPE_TAGS,
  type NewRecipeInput,
  type RecipeFilter,
} from "@/lib/recipes";

export type AiRecipeCreation = {
  draft: NewRecipeInput;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
};

const MEAL_TYPE_PROMPT: Record<MealType, string> = {
  breakfast:
    "EXIGENCE STRICTE sur la typologie : tu dois UNIQUEMENT proposer des recettes de petit-déjeuner (porridge, granola, yaourt, pancakes, gaufres, œufs brouillés, omelette légère, smoothie, tartines, porridge salé doux, granola bowls). Interdiction formelle des plats de déjeuner ou de dîner (poulet rôti, pâtes en plat, steaks, gratins, poissons en plat principal, currys, tajines, etc.).",
  lunch:
    "EXIGENCE STRICTE sur la typologie : tu dois UNIQUEMENT proposer des recettes de déjeuner, plats complets adaptés au midi (salades composées, bowls, poêlées, viandes/poissons avec accompagnement, tartes salées). Pas de petit-déjeuner (pancakes, granola) ni de dessert.",
  dinner:
    "EXIGENCE STRICTE sur la typologie : tu dois UNIQUEMENT proposer des recettes de dîner, plats du soir (mijotés, poêlées, gratins, poissons, viandes, légumes). Pas de petit-déjeuner. Pas de dessert.",
};

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=560&fit=crop&auto=format";

const DIFFICULTY_SET = new Set<string>(DIFFICULTIES);
const TAG_SET = new Set<string>(RECIPE_TAGS);

const RECIPE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          time: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          proteins: { type: Type.NUMBER },
          servings: { type: Type.NUMBER },
          difficulty: {
            type: Type.STRING,
            enum: ["Facile", "Moyen", "Difficile"],
          },
          tag: {
            type: Type.STRING,
            nullable: true,
            description: "Express | Végétarien | Riche en protéines | Desserts | null",
          },
          tagLabel: { type: Type.STRING, nullable: true },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
              },
              required: ["name", "amount"],
            },
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                duration: { type: Type.STRING, nullable: true },
              },
              required: ["title", "detail"],
            },
          },
          matchedIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missingIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missing_ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "1 ou 2 basiques absents du frigo maximum (œufs, farine, crème, épices). Tableau vide si tout est disponible.",
          },
          reason: { type: Type.STRING },
        },
        required: [
          "title",
          "time",
          "calories",
          "proteins",
          "servings",
          "difficulty",
          "ingredients",
          "steps",
          "matchedIngredients",
          "missing_ingredients",
          "reason",
        ],
      },
    },
  },
  required: ["recipes"],
} as const;

export class AiRecipesUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRecipesUnavailableError";
  }
}

/**
 * Génère des brouillons NewRecipeInput via Gemini 3.6 Flash.
 * Clé serveur : GEMINI_API_KEY (jamais NEXT_PUBLIC_).
 */
export async function createRecipesFromFridge(
  items: FridgeSnapshotItem[],
  options: {
    mealCount: number;
    preferExpiring: boolean;
    excludeDesserts: boolean;
    mealType: MealType;
    targetDate?: string;
  },
): Promise<AiRecipeCreation[]> {
  if (!getGeminiApiKey()) {
    throw new AiRecipesUnavailableError(
      "GEMINI_API_KEY manquant dans .env.local (clé serveur, sans préfixe NEXT_PUBLIC_).",
    );
  }

  if (items.length === 0) {
    throw new AiRecipesUnavailableError("Le frigo est vide — impossible de générer des recettes.");
  }

  const mealCount = Math.max(1, Math.min(4, options.mealCount));
  const mealType = options.mealType;
  const mealLabel = MEAL_TYPE_LABELS[mealType];
  const inventory = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    location: item.location,
    expiresOn: item.expiresOn,
    urgency: item.urgency,
  }));

  const systemInstruction = [
    "Tu es un chef français. Tu crées des recettes concrètes à partir d’un inventaire de cuisine.",
    "Réponds uniquement avec un JSON strict (pas de markdown).",
    `Retourne exactement ${mealCount} recette${mealCount > 1 ? "s" : ""} distincte${mealCount > 1 ? "s" : ""} dans le tableau recipes.`,
    "Chaque recette doit inclure title, time, calories, proteins, servings, difficulty,",
    "tag (Express|Végétarien|Riche en protéines|Desserts|null), tagLabel optionnel,",
    "ingredients[{name,amount}], steps[{title,detail,duration?}]",
    "matchedIngredients, missing_ingredients et reason.",
    MEAL_TYPE_PROMPT[mealType],
    "Tu dois proposer des recettes réalisables avec les ingrédients actuels du frigo.",
    "Cependant, tu es autorisé à proposer une recette où il manque 1 ou 2 ingrédients MAXIMUM,",
    "à condition que ces ingrédients soient des basiques faciles à trouver (ex: œufs, farine, crème, épices).",
    "Si tu utilises un ingrédient manquant, tu dois le signaler explicitement dans missing_ingredients.",
    "missing_ingredients est un tableau de 0, 1 ou 2 noms (jamais plus). Tableau vide si tout est dans le frigo.",
    "N’invente pas de produits rares, de viandes ou de légumes absents du frigo dans missing_ingredients.",
    "matchedIngredients = noms d’ingrédients de la recette couverts par le frigo.",
    "Priorise les produits urgency=urgent puis soon. Quantités réalistes. Étapes actionnables.",
    options.excludeDesserts && mealType !== "breakfast" ? "N’inclus aucun dessert." : "",
    options.preferExpiring ? "Favorise l’usage des produits bientôt périmés." : "",
  ]
    .filter(Boolean)
    .join(" ");

  const userPrompt = JSON.stringify({
    mealCount,
    mealType,
    mealLabel,
    targetDate: options.targetDate ?? null,
    inventory,
    language: "fr",
    outputShape: `{ recipes: NewRecipeInput[] } — exactement ${mealCount} éléments`,
  });

  try {
    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: RECIPE_RESPONSE_SCHEMA,
      },
    });

    const content = response.text?.trim();
    if (!content) {
      throw new AiRecipesUnavailableError("Réponse Gemini vide.");
    }

    return parseAiRecipesPayload(content, mealCount);
  } catch (error) {
    if (error instanceof AiRecipesUnavailableError) throw error;
    const detail =
      error instanceof Error && error.message
        ? error.message.slice(0, 240)
        : "erreur réseau";
    throw new AiRecipesUnavailableError(`Provider Gemini indisponible : ${detail}`);
  }
}

export function parseAiRecipesPayload(raw: string, mealCount: number): AiRecipeCreation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    throw new AiRecipesUnavailableError("JSON Gemini invalide.");
  }

  const recipesRaw = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { recipes?: unknown }).recipes)
      ? (parsed as { recipes: unknown[] }).recipes
      : null;

  if (!recipesRaw) {
    throw new AiRecipesUnavailableError("Schéma Gemini inattendu (champ recipes manquant).");
  }

  const creations: AiRecipeCreation[] = [];
  for (const entry of recipesRaw) {
    const creation = coerceAiRecipe(entry);
    if (creation) creations.push(creation);
    if (creations.length >= mealCount) break;
  }

  if (creations.length === 0) {
    throw new AiRecipesUnavailableError("Aucune recette exploitable dans la réponse Gemini.");
  }

  return creations;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function coerceAiRecipe(entry: unknown): AiRecipeCreation | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;

  const title = asNonEmptyString(raw.title);
  if (!title) return null;

  const ingredients = coerceIngredients(raw.ingredients);
  const steps = coerceSteps(raw.steps);
  if (ingredients.length === 0 || steps.length === 0) return null;

  const difficulty = asDifficulty(raw.difficulty);
  const tag = asTag(raw.tag);
  const tagLabel =
    asNonEmptyString(raw.tagLabel) ??
    (tag === "Riche en protéines" ? "Protéines" : tag === "Desserts" ? "Dessert" : tag ?? undefined);

  const matchedIngredients = asStringArray(raw.matchedIngredients);
  const missingIngredients = asStringArray(raw.missing_ingredients).length
    ? asStringArray(raw.missing_ingredients)
    : asStringArray(raw.missingIngredients);
  const cappedMissing = missingIngredients.slice(0, 2);
  const reason =
    asNonEmptyString(raw.reason) ??
    (matchedIngredients.length > 0
      ? `Basée sur ${matchedIngredients.slice(0, 3).join(", ")}`
      : "Recette générée à partir de votre frigo");

  const draft: NewRecipeInput = {
    title,
    photo: asHttpUrl(raw.photo) ?? DEFAULT_PHOTO,
    time: asNonEmptyString(raw.time) ?? "30 min",
    calories: asPositiveInt(raw.calories, 400),
    proteins: asPositiveInt(raw.proteins, 20),
    servings: asPositiveInt(raw.servings, 2),
    difficulty,
    tag,
    tagLabel,
    ingredients,
    steps,
    missingIngredients: cappedMissing,
  };

  return { draft, matchedIngredients, missingIngredients: cappedMissing, reason };
}

function coerceIngredients(value: unknown): NewRecipeInput["ingredients"] {
  if (!Array.isArray(value)) return [];
  const out: NewRecipeInput["ingredients"] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = asNonEmptyString(row.name);
    const amount = asNonEmptyString(row.amount) ?? "q.s.";
    if (name) out.push({ name, amount });
  }
  return out;
}

function coerceSteps(value: unknown): NewRecipeInput["steps"] {
  if (!Array.isArray(value)) return [];
  const out: NewRecipeInput["steps"] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = asNonEmptyString(row.title);
    const detail = asNonEmptyString(row.detail);
    if (!title || !detail) continue;
    const duration = asNonEmptyString(row.duration);
    out.push(duration ? { title, detail, duration } : { title, detail });
  }
  return out;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asPositiveInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

function asDifficulty(value: unknown): NewRecipeInput["difficulty"] {
  if (typeof value === "string" && DIFFICULTY_SET.has(value)) {
    return value as NewRecipeInput["difficulty"];
  }
  return "Facile";
}

function asTag(value: unknown): Exclude<RecipeFilter, "Tout"> | null {
  if (value == null || value === "" || value === "Tout") return null;
  if (typeof value === "string" && TAG_SET.has(value)) {
    return value as Exclude<RecipeFilter, "Tout">;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

function asHttpUrl(value: unknown): string | undefined {
  const s = asNonEmptyString(value);
  if (!s) return undefined;
  try {
    const url = new URL(s);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return s;
  } catch {
    return undefined;
  }
}
