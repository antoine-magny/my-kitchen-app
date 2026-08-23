import type { SupabaseClient, User } from "@supabase/supabase-js";
import { EXISTING_ACCOUNT_MESSAGE } from "@/lib/auth-signup";

export const GOOGLE_AUTH_ERROR_MESSAGE =
  "La connexion Google a échoué. Réessayez.";

/** Query `?error=` renvoyée par `/auth/callback` si Google vise un compte email déjà existant. */
export const GOOGLE_EXISTING_ACCOUNT_ERROR = "account_exists";

const IDENTITY_CREATED_AFTER_MS = 10_000;

function identityCreatedAtMs(value: string | undefined): number {
  if (!value) return Number.NaN;
  return Date.parse(value);
}

/**
 * True si Google vient d'être rattaché à un compte créé en email / mot de passe.
 * Un compte Google d'origine (éventuellement enrichi d'un mot de passe plus tard) n'est pas rejeté.
 */
export function isGoogleLinkedToExistingEmailAccount(
  user: User | null | undefined,
): boolean {
  if (!user) return false;

  const identities = user.identities ?? [];
  const providers = user.app_metadata?.providers ?? [];
  const googleIdentity = identities.find((identity) => identity.provider === "google");
  const emailIdentity = identities.find((identity) => identity.provider === "email");
  const hasEmail = providers.includes("email") || Boolean(emailIdentity);
  const hasGoogle = providers.includes("google") || Boolean(googleIdentity);

  if (!hasEmail || !hasGoogle) return false;

  const googleCreated = identityCreatedAtMs(googleIdentity?.created_at);
  const emailCreated = identityCreatedAtMs(emailIdentity?.created_at ?? user.created_at);
  if (!Number.isFinite(googleCreated) || !Number.isFinite(emailCreated)) return true;

  return googleCreated > emailCreated + IDENTITY_CREATED_AFTER_MS;
}

export function loginOAuthErrorMessage(error: string | undefined, email?: string): string | null {
  if (error === "google") return GOOGLE_AUTH_ERROR_MESSAGE;
  if (error === GOOGLE_EXISTING_ACCOUNT_ERROR) {
    if (email) {
      return `Vous avez déjà un compte sur cette adresse mail : ${email}. Si vous avez perdu votre mot de passe, veuillez consulter la page "Mot de passe oublié".`;
    }
    return EXISTING_ACCOUNT_MESSAGE;
  }
  return null;
}

export async function rejectGoogleLinkedToEmailAccount(
  supabase: SupabaseClient,
  user: User | null,
): Promise<boolean> {
  if (!isGoogleLinkedToExistingEmailAccount(user)) return false;

  const googleIdentity = user?.identities?.find((identity) => identity.provider === "google");
  try {
    if (googleIdentity) {
      await supabase.auth.unlinkIdentity(googleIdentity);
    }
  } catch {
    // Session fermée quand même : un lien restant sera re-détecté au prochain essai.
  }
  await supabase.auth.signOut();
  return true;
}

export function googleCallbackUrl(origin: string) {
  return `${origin}/auth/callback`;
}

/** Empêche une redirection ouverte via le paramètre `next`. */
export function safeAuthNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export function googleAuthErrorMessage(error: { message: string } | null): string {
  const message = error?.message.toLowerCase() ?? "";
  if (message.includes("provider") || message.includes("unsupported")) {
    return "La connexion Google n'est pas encore configurée.";
  }
  return GOOGLE_AUTH_ERROR_MESSAGE;
}

export async function signInWithGoogle(supabase: SupabaseClient, origin: string) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: googleCallbackUrl(origin),
      queryParams: { prompt: "select_account" },
    },
  });
}
