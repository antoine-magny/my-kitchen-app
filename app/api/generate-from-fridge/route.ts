import { createRecipesFromFridge } from "@/lib/ai/create-recipes-from-fridge";
import {
  countUsableFridgeItems,
  MIN_USABLE_FRIDGE_ITEMS,
  type FridgeSnapshotItem,
} from "@/lib/fridge";
import { getSupabaseFridgeSnapshot } from "@/lib/fridge-supabase";
import { isMealType } from "@/lib/meal-types";
import {
  generateFromFridge,
  type GenerateFromFridgeRequest,
} from "@/lib/generate-from-fridge";
import { RECIPES } from "@/lib/recipes";

function clampMealCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 2;
  return Math.max(1, Math.min(4, Math.round(n)));
}

async function resolveInventory(
  clientItems: FridgeSnapshotItem[],
): Promise<{ items: FridgeSnapshotItem[]; source: "supabase" | "local" }> {
  try {
    const supabaseItems = await getSupabaseFridgeSnapshot();
    if (countUsableFridgeItems(supabaseItems) >= MIN_USABLE_FRIDGE_ITEMS) {
      return { items: supabaseItems, source: "supabase" };
    }
  } catch {
    // Fallback inventaire local envoyé par le client.
  }
  return { items: clientItems, source: "local" };
}

/**
 * POST /api/generate-from-fridge
 *
 * Body : GenerateFromFridgeRequest (items = snapshot frigo, mealType, mealCount, targetDate).
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

  const clientItems = Array.isArray(body?.items) ? body.items : [];
  const { items } = await resolveInventory(clientItems);

  if (countUsableFridgeItems(items) < MIN_USABLE_FRIDGE_ITEMS) {
    return Response.json(
      {
        error: "Remplissez votre frigo pour utiliser cette fonctionnalité",
      },
      { status: 400 },
    );
  }

  const mode = body.mode ?? "match_existing";
  const mealType = isMealType(body.mealType) ? body.mealType : "lunch";
  const targetDate =
    typeof body.targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)
      ? body.targetDate
      : undefined;

  const result = await generateFromFridge(
    {
      items,
      mode,
      mealCount: clampMealCount(body.mealCount),
      preferExpiring: body.preferExpiring ?? true,
      excludeDesserts: body.excludeDesserts ?? true,
      mealType,
      targetDate,
    },
    RECIPES,
    mode === "ai_create" ? { aiProvider: createRecipesFromFridge } : undefined,
  );

  return Response.json(result);
}
