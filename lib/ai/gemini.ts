import "server-only";

import { GoogleGenAI } from "@google/genai";

/** Modèle par défaut pour la génération de recettes. */
export const GEMINI_FLASH_MODEL = "gemini-3.6-flash";

export function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_FLASH_MODEL;
}

/**
 * Client Gemini (clé serveur uniquement — jamais NEXT_PUBLIC_).
 */
export function createGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY manquant dans .env.local (clé serveur, sans préfixe NEXT_PUBLIC_).",
    );
  }
  return new GoogleGenAI({ apiKey });
}
