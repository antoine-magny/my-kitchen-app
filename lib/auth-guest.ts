import type { SupabaseClient, User } from "@supabase/supabase-js";

export const GUEST_DISPLAY_NAME = "Invité";
export const GUEST_SIGN_IN_PATH = "/auth/guest";
export const GUEST_AUTH_ERROR = "guest";
export const GUEST_AUTH_ERROR_MESSAGE =
  "La connexion invité a échoué. Réessayez.";

export function isAnonymousUser(user: User | null | undefined): boolean {
  return user?.is_anonymous === true;
}

/** Auto-connexion invité uniquement en `next dev`. Désactiver avec `DEV_AUTO_GUEST=0`. */
export function isDevAutoGuestEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const flag = process.env.DEV_AUTO_GUEST?.trim().toLowerCase();
  return flag !== "0" && flag !== "false";
}

export function guestQueryErrorMessage(error: string | undefined): string | null {
  if (error === GUEST_AUTH_ERROR) return GUEST_AUTH_ERROR_MESSAGE;
  return null;
}

export function guestAuthErrorMessage(err: { message: string } | null): string {
  const message = err?.message.toLowerCase() ?? "";
  if (
    message.includes("anonymous") &&
    (message.includes("disabled") || message.includes("not enabled"))
  ) {
    return "La connexion invité n'est pas encore activée dans Supabase.";
  }
  return GUEST_AUTH_ERROR_MESSAGE;
}

export function userAccountLabel(user: User | null | undefined): string {
  if (!user) return "";
  if (isAnonymousUser(user)) return "Compte invité";
  return user.email ?? "";
}

export async function signInAsGuest(supabase: SupabaseClient) {
  return supabase.auth.signInAnonymously({
    options: {
      data: { full_name: GUEST_DISPLAY_NAME },
    },
  });
}
