import { saveRecipeToSupabase, type RecipeFormPayload } from "@/lib/save-recipe";

/**
 * POST /api/recipes
 *
 * Body : RecipeFormPayload (formulaire validé côté client).
 * Persiste dans Supabase (recipes + recipe_ingredients) et renvoie aussi
 * un NewRecipeInput pour synchroniser le store local.
 */
export async function POST(request: Request) {
  let body: RecipeFormPayload;
  try {
    body = (await request.json()) as RecipeFormPayload;
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (!body || typeof body.title !== "string") {
    return Response.json({ error: "Payload de recette invalide." }, { status: 400 });
  }

  try {
    const result = await saveRecipeToSupabase(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message.slice(0, 300)
        : "Échec de l’enregistrement.";
    const status =
      message.includes("obligatoire") ||
      message.includes("au moins") ||
      message.includes("Ajoutez")
        ? 400
        : 500;
    return Response.json({ error: message }, { status });
  }
}
