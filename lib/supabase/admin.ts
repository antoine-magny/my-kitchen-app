import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * L'app n'a pas d'écran de connexion : tout l'accès aux données passe par le
 * serveur avec la clé secrète, épinglé sur un unique utilisateur propriétaire.
 * La RLS reste active et continue de bloquer l'accès direct depuis le navigateur.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local");
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY manquant dans .env.local (Project Settings > API Keys > secret key)",
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getOwnerId() {
  const ownerId = process.env.KITCHEN_OWNER_ID;

  if (!ownerId) {
    throw new Error(
      "KITCHEN_OWNER_ID manquant dans .env.local — lancez `node scripts/setup-owner.mjs`",
    );
  }

  return ownerId;
}
