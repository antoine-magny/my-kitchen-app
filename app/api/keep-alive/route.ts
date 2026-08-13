import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/keep-alive — maintien en éveil de la base Supabase.
 *
 * Contexte : les projets Supabase du plan gratuit sont automatiquement mis en
 * pause après une période d'inactivité. Cette route est appelée régulièrement
 * par un service externe (Vercel Cron — voir la section `crons` de
 * `vercel.json` — ou cron-job.org) uniquement pour effectuer un « ping » sur la
 * base et remettre à zéro ce compteur d'inactivité.
 *
 * Elle ne fait donc rien de fonctionnel pour l'application : la requête lit une
 * seule colonne d'une seule ligne, le résultat est volontairement ignoré. Seul
 * le fait que la base ait répondu compte.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("recipes").select("id").limit(1);

    if (error) {
      console.error("Erreur Supabase Ping:", error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Ping Supabase réussi ! Base de données maintenue active.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ping Supabase impossible.";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
