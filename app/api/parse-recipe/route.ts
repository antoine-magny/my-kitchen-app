import { ParseRecipeError, parseRecipeFromImage, parseRecipeFromUrl } from "@/lib/ai/parse-recipe";

/**
 * POST /api/parse-recipe
 *
 * Body : `{ imageBase64: string }` | `{ url: string }`
 * → ParsedRecipe (JSON strict pour préremplir le formulaire).
 */
export async function POST(request: Request) {
  let body: { imageBase64?: unknown; url?: unknown };
  try {
    body = (await request.json()) as { imageBase64?: unknown; url?: unknown };
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }

  const imageBase64 =
    typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (imageBase64 && url) {
    return Response.json(
      { error: "Fournissez soit `imageBase64`, soit `url`, pas les deux." },
      { status: 400 },
    );
  }

  if (!imageBase64 && !url) {
    return Response.json(
      { error: "Le champ `imageBase64` ou `url` est requis." },
      { status: 400 },
    );
  }

  try {
    const recipe = imageBase64
      ? await parseRecipeFromImage(imageBase64)
      : await parseRecipeFromUrl(url);
    return Response.json({ recipe });
  } catch (error) {
    if (error instanceof ParseRecipeError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    const detail =
      error instanceof Error && error.message
        ? error.message.slice(0, 240)
        : "erreur inconnue";
    return Response.json(
      {
        error: `La page a été récupérée, mais l’analyse IA a échoué : ${detail}. Réessayez, ou importez depuis une photo.`,
      },
      { status: 502 },
    );
  }
}
