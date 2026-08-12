import { createRecipesFromFridge } from "@/lib/ai/create-recipes-from-fridge";
import { generateFromFridge, type GenerateFromFridgeRequest } from "@/lib/generate-from-fridge";
import { RECIPES } from "@/lib/recipes";

/**
 * POST /api/generate-from-fridge
 *
 * Body : GenerateFromFridgeRequest (items = snapshot frigo).
 * Mode match_existing : matching sur le catalogue de recettes existantes.
 * Mode ai_create : Gemini 3.6 Flash (GEMINI_API_KEY) → recipeDraft (NewRecipeInput).
 * Fallback : si clé absente / erreur réseau Gemini → matching sur recettes existantes.
 */
export async function POST(request: Request) {
  let body: GenerateFromFridgeRequest;
  try {
    body = (await request.json()) as GenerateFromFridgeRequest;
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (!body || !Array.isArray(body.items)) {
    return Response.json(
      { error: "Le champ `items` (snapshot frigo) est requis." },
      { status: 400 },
    );
  }

  const mode = body.mode ?? "match_existing";

  const result = await generateFromFridge(
    {
      items: body.items,
      mode,
      mealCount: body.mealCount ?? 2,
      preferExpiring: body.preferExpiring ?? true,
      excludeDesserts: body.excludeDesserts ?? true,
    },
    RECIPES,
    mode === "ai_create" ? { aiProvider: createRecipesFromFridge } : undefined,
  );

  return Response.json(result);
}
