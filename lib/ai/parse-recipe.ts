import "server-only";

import { Type } from "@google/genai";
import {
  createGeminiClient,
  getGeminiApiKey,
  getGeminiModel,
} from "@/lib/ai/gemini";
import {
  coerceRecipeCost,
  coerceRecipeDifficulty,
  coerceRecipeTags,
  EXPRESS_MAX_MINUTES,
  HIGH_PROTEIN_MIN_G,
  RECIPE_COSTS,
  RECIPE_TAG_CODES_HINT,
  RECIPE_TAGS,
  withDerivedTags,
} from "@/lib/recipe-model";
import type { ParsedRecipe } from "@/lib/recipe-import";
import { normalizeUnit, UNIT_LIST } from "@/lib/units";

export type { ParsedRecipe } from "@/lib/recipe-import";
export { normalizeUnit } from "@/lib/units";

export class ParseRecipeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseRecipeError";
  }
}

const UNIT_CODES_HINT = UNIT_LIST.map((u) => u.code).join(" | ");

const PARSE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    prep_time: { type: Type.STRING, description: 'Ex. "15 min"' },
    cook_time: { type: Type.STRING, description: 'Ex. "20 min"' },
    servings: { type: Type.NUMBER },
    calories_per_serving: { type: Type.NUMBER },
    protein_per_serving: { type: Type.NUMBER },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          unit: {
            type: Type.STRING,
            description: UNIT_CODES_HINT,
          },
        },
        required: ["name", "amount", "unit"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tags: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        enum: [...RECIPE_TAGS],
      },
      description:
        `Un ou plusieurs tags parmi ${RECIPE_TAG_CODES_HINT}. express si ≤${EXPRESS_MAX_MINUTES} min. riche_en_proteines si ≥${HIGH_PROTEIN_MIN_G} g de protéines par portion.`,
    },
    difficulty: {
      type: Type.STRING,
      enum: ["Facile", "Moyen", "Difficile"],
    },
    cost: {
      type: Type.STRING,
      enum: [...RECIPE_COSTS],
      description: "economique | moyen | premium selon les ingrédients.",
    },
  },
  required: [
    "title",
    "prep_time",
    "cook_time",
    "servings",
    "calories_per_serving",
    "protein_per_serving",
    "ingredients",
    "instructions",
    "tags",
    "difficulty",
    "cost",
  ],
} as const;

const SYSTEM_INSTRUCTION = [
  "Tu es un assistant culinaire expert. Extrais une recette complète et structurée.",
  "Réponds uniquement en JSON strict (pas de markdown).",
  "Langue : français.",
  "prep_time et cook_time : chaînes courtes du type \"15 min\". Si inconnu, estime raisonnablement.",
  `ingredients.unit doit être l’un de : ${UNIT_CODES_HINT}. Pour les liquides utilise ml, cl, l, c_soupe ou c_cafe. Pour les solides au poids utilise g ou kg. Pour les décomptes utilise l'unité naturelle (ex: gousse pour l'ail, tranche pour le melon/pain, feuille pour les herbes) ou « piece » par défaut pour tout ingrédient dénombrable ou inconnu.`,
  "amount est un nombre positif (pas de fraction textuelle).",
  "Utilise l’unité « qs » avec amount 0 pour les quantités non chiffrables (sel, poivre, herbes à volonté).",
  "instructions : liste ordonnée d’étapes actionnables (une phrase claire par étape).",
  "calories_per_serving et protein_per_serving : estimations réalistes si absentes de la source.",
  `tags : tableau d’un ou plusieurs codes parmi ${RECIPE_TAG_CODES_HINT} uniquement. Inclus toujours au moins un type de plat (entree/plat/dessert). Interdiction d’inventer un autre code ou un libellé libre. express uniquement si le temps total estimé est ≤ ${EXPRESS_MAX_MINUTES} min. riche_en_proteines uniquement si protein_per_serving ≥ ${HIGH_PROTEIN_MIN_G} g.`,
  "difficulty : Facile, Moyen ou Difficile.",
  "cost : economique (ingrédients basiques), moyen, ou premium (produits nobles, hors-saison, truffe, filet, etc.).",
].join(" ");

/**
 * Analyse une photo de recette (base64, avec ou sans préfixe data URL).
 */
export async function parseRecipeFromImage(imageBase64: string): Promise<ParsedRecipe> {
  ensureApiKey();
  const { mimeType, data } = splitDataUrl(imageBase64);
  if (!data) {
    throw new ParseRecipeError("Image base64 invalide ou vide.");
  }

  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data } },
          {
            text: "Extrais la recette visible sur cette image (livre, capture d’écran, photo de carnet…).",
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: PARSE_RESPONSE_SCHEMA,
    },
  });

  return coerceParsedRecipe(response.text);
}

/**
 * Récupère le HTML d’une URL de cuisine, puis demande à Gemini d’en extraire la recette.
 */
export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  ensureApiKey();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ParseRecipeError("URL invalide.");
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ParseRecipeError("Seules les URL http(s) sont acceptées.");
  }

  const html = await fetchPageHtml(parsedUrl.toString());
  const textContent = htmlToPlainText(html).slice(0, 80_000);
  if (textContent.trim().length < 80) {
    throw new ParseRecipeError(
      "La page a bien été téléchargée, mais son contenu n’est pas exploitable (protection du site ou page trop pauvre). Essayez d’importer une photo de la recette.",
    );
  }

  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              `Source : ${parsedUrl.toString()}`,
              "Extrais la recette principale de ce contenu de page web :",
              textContent,
            ].join("\n\n"),
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: PARSE_RESPONSE_SCHEMA,
    },
  });

  return coerceParsedRecipe(response.text);
}

function ensureApiKey() {
  if (!getGeminiApiKey()) {
    throw new ParseRecipeError(
      "GEMINI_API_KEY manquant dans .env.local (clé serveur, sans préfixe NEXT_PUBLIC_).",
    );
  }
}

function splitDataUrl(raw: string): { mimeType: string; data: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/i);
  if (match) {
    return { mimeType: match[1] || "image/jpeg", data: match[2] };
  }
  return { mimeType: "image/jpeg", data: trimmed.replace(/\s/g, "") };
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.128 Safari/537.36";

const FETCH_TIMEOUT_MS = 12_000;
const FETCH_RETRY_LIMIT = 2;
const FETCH_RETRY_DELAY_MS = 400;
const RETRYABLE_HTTP = new Set([429, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (current instanceof Error) {
      parts.push(current.name, current.message);
      const code = (current as Error & { code?: string }).code;
      if (code) parts.push(code);
      current = current.cause;
      continue;
    }
    parts.push(String(current));
    break;
  }
  return parts.join(" ").toLowerCase();
}

function isRetryableNetworkError(error: unknown): boolean {
  const message = collectErrorText(error);
  if (message.includes("unable_to_verify") || message.includes("certificate")) {
    return false;
  }
  if (!(error instanceof Error)) return true;
  return (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("timeout")
  );
}

function networkFailureMessage(error: unknown): string {
  const message = collectErrorText(error);
  if (message.includes("unable_to_verify") || message.includes("certificate")) {
    return "Impossible de télécharger la page (certificat HTTPS / antivirus local). Importez la recette depuis une photo.";
  }
  if (
    message.includes("timeout") ||
    message.includes("aborted") ||
    message.includes("timeouterror")
  ) {
    return "Le site met trop de temps à répondre. Réessayez, ou importez la recette depuis une photo.";
  }
  return "Impossible de télécharger la page (réseau ou site inaccessible). Vérifiez le lien, ou importez depuis une photo.";
}

function httpFailureMessage(status: number): string {
  if (status === 401 || status === 403 || status === 451) {
    return `Le site a bloqué le téléchargement (HTTP ${status}). Importez la recette depuis une photo.`;
  }
  if (RETRYABLE_HTTP.has(status)) {
    return `Le site est temporairement indisponible (HTTP ${status}). Réessayez, ou importez depuis une photo.`;
  }
  return `La page a répondu HTTP ${status}. Essayez un autre lien, ou importez depuis une photo.`;
}

async function fetchPageHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= FETCH_RETRY_LIMIT; attempt++) {
    if (attempt > 0) await delay(FETCH_RETRY_DELAY_MS * attempt);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (RETRYABLE_HTTP.has(response.status)) {
        lastError = new ParseRecipeError(httpFailureMessage(response.status));
        continue;
      }

      if (!response.ok) {
        throw new ParseRecipeError(httpFailureMessage(response.status));
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        contentType &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml")
      ) {
        throw new ParseRecipeError(
          "L’URL ne pointe pas vers une page HTML. Importez plutôt une photo de la recette.",
        );
      }

      return response.text();
    } catch (error) {
      if (error instanceof ParseRecipeError) throw error;
      lastError = error;
      if (!isRetryableNetworkError(error) || attempt === FETCH_RETRY_LIMIT) {
        throw new ParseRecipeError(networkFailureMessage(error));
      }
    }
  }

  if (lastError instanceof ParseRecipeError) throw lastError;
  throw new ParseRecipeError(networkFailureMessage(lastError));
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function coerceParsedRecipe(raw: string | undefined): ParsedRecipe {
  if (!raw?.trim()) {
    throw new ParseRecipeError("Réponse Gemini vide.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    throw new ParseRecipeError("JSON Gemini invalide.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new ParseRecipeError("Schéma Gemini inattendu.");
  }

  const row = parsed as Record<string, unknown>;
  const title = asNonEmptyString(row.title);
  if (!title) throw new ParseRecipeError("Titre manquant dans la réponse IA.");

  const ingredientsRaw = Array.isArray(row.ingredients) ? row.ingredients : [];
  const ingredients: ParsedRecipe["ingredients"] = [];
  for (const item of ingredientsRaw) {
    if (!item || typeof item !== "object") continue;
    const ing = item as Record<string, unknown>;
    const name = asNonEmptyString(ing.name);
    if (!name) continue;
    const unit = normalizeUnit(ing.unit);
    const amount = unit === "qs" ? 0 : asPositiveNumber(ing.amount, 1);
    ingredients.push({ name, amount, unit });
  }

  const instructionsRaw = Array.isArray(row.instructions) ? row.instructions : [];
  const instructions = instructionsRaw
    .map((step) => (typeof step === "string" ? step.trim() : ""))
    .filter(Boolean);

  if (ingredients.length === 0) {
    throw new ParseRecipeError("Aucun ingrédient exploitable dans la réponse IA.");
  }
  if (instructions.length === 0) {
    throw new ParseRecipeError("Aucune étape exploitable dans la réponse IA.");
  }

  const timeHint = [asNonEmptyString(row.prep_time), asNonEmptyString(row.cook_time)]
    .filter(Boolean)
    .join(" ");
  const proteinPerServing = Math.round(asPositiveNumber(row.protein_per_serving, 20));

  return {
    title,
    prep_time: asNonEmptyString(row.prep_time) ?? "15 min",
    cook_time: asNonEmptyString(row.cook_time) ?? "20 min",
    servings: Math.max(1, Math.round(asPositiveNumber(row.servings, 4))),
    calories_per_serving: Math.round(asPositiveNumber(row.calories_per_serving, 400)),
    protein_per_serving: proteinPerServing,
    ingredients,
    instructions,
    tags: withDerivedTags(coerceRecipeTags(row.tags, row.tag), timeHint, proteinPerServing),
    difficulty: coerceRecipeDifficulty(row.difficulty),
    cost: coerceRecipeCost(row.cost),
  };
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asPositiveNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

