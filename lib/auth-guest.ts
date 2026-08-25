import type { SupabaseClient, User } from "@supabase/supabase-js";

export const GUEST_DISPLAY_NAME = "Invité";
export const GUEST_SIGN_IN_PATH = "/auth/guest";
export const GUEST_AUTH_ERROR = "guest";
export const GUEST_AUTH_ERROR_MESSAGE =
  "La connexion invité a échoué. Réessayez.";

export function isAnonymousUser(user: User | null | undefined): boolean {
  return user?.is_anonymous === true;
}

export const GUEST_ACTIVE_SESSION_KEY = "guest_session_active";

export function isBrowserReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      return (navEntries[0] as PerformanceNavigationTiming).type === "reload";
    }
    // Fallback legacy navigation type
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return (window.performance?.navigation?.type as number | undefined) === 1;
  } catch {
    return false;
  }
}

export function shouldResetGuestSession(user: User | null | undefined): boolean {
  if (typeof window === "undefined" || !isAnonymousUser(user)) return false;
  const isReload = isBrowserReload();
  const hasActiveSession = window.sessionStorage.getItem(GUEST_ACTIVE_SESSION_KEY) === "1";
  return isReload || !hasActiveSession;
}

export const DEV_AUTO_GUEST_ATTEMPTED_COOKIE = "dev_auto_guest_attempted";

/** Auto-connexion invité uniquement en `next dev`, si `DEV_AUTO_GUEST=1`. */
export function isDevAutoGuestEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const flag = process.env.DEV_AUTO_GUEST?.trim().toLowerCase();
  return flag === "1" || flag === "true";
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

function isAuthUnreachable(error: { name?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.name === "AuthRetryableFetchError" ||
    message === "fetch failed" ||
    message.includes("unable to verify")
  );
}

/** `getUser()` contacte Auth ; si le serveur local n'atteint pas Supabase (certificat / antivirus), on lit le JWT cookie. */
export async function getUserPreferSession(supabase: SupabaseClient) {
  if (process.env.NODE_ENV === "development") {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) return session.user;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (user) return user;
  if (!isAuthUnreachable(error)) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}
