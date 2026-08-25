import type { SupabaseClient } from "@supabase/supabase-js";
import { safeAuthNextPath } from "@/lib/auth-google";

export const APPLE_AUTH_ERROR_MESSAGE =
  "La connexion Apple a échoué. Réessayez.";

export function appleAuthErrorMessage(error: { message: string } | null): string {
  const message = error?.message.toLowerCase() ?? "";
  if (message.includes("provider") || message.includes("unsupported")) {
    return "La connexion Apple n'est pas encore configurée.";
  }
  return APPLE_AUTH_ERROR_MESSAGE;
}

export function appleCallbackUrl(origin: string) {
  return `${origin}/auth/callback`;
}

export async function signInWithApple(supabase: SupabaseClient, origin: string) {
  return supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: appleCallbackUrl(origin),
    },
  });
}
