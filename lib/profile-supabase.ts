import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/profile-store";

/**
 * Synchronise les données du profil utilisateur vers la table `profiles` de Supabase.
 * Exécuté en arrière-plan (fire-and-forget).
 */
export async function syncProfileToSupabase(profile: UserProfile) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Ne synchronise que si l'utilisateur est connecté et non anonyme
    if (!session?.user || session.user.is_anonymous) {
      return;
    }

    const preferences = {
      diet: profile.diet,
      cookingLevel: profile.cookingLevel,
      favoriteTags: profile.favoriteTags,
      dislikedTags: profile.dislikedTags,
      allergyTags: profile.allergyTags,
      equipmentIds: profile.equipmentIds,
      quizCompletedAt: profile.quizCompletedAt,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        daily_calories_target: profile.calories,
        daily_protein_target_g: profile.proteins,
        // @ts-expect-error : La colonne 'preferences' (JSONB) doit être ajoutée côté Supabase
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      console.warn("Échec de la synchronisation Supabase du profil:", error.message);
    }
  } catch (err) {
    console.error("Erreur inattendue lors de la sync du profil:", err);
  }
}
