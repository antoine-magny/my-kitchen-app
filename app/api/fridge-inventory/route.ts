import { countUsableFridgeItems } from "@/lib/fridge";
import { getSupabaseFridgeSnapshot } from "@/lib/fridge-supabase";

/**
 * GET /api/fridge-inventory
 * Inventaire persisté (pantry_items) pour le modal de génération.
 */
export async function GET() {
  try {
    const items = await getSupabaseFridgeSnapshot();
    return Response.json({
      source: "supabase",
      items,
      usableCount: countUsableFridgeItems(items),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Inventaire Supabase indisponible.";
    return Response.json(
      {
        source: "supabase",
        items: [],
        usableCount: 0,
        message,
      },
      { status: 200 },
    );
  }
}
