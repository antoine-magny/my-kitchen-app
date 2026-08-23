export const REQUEST_RESET_PATH = "/login/mot-de-passe-oublie";
export const UPDATE_PASSWORD_PATH = "/nouveau-mot-de-passe";

export const PASSWORD_RECOVERY_ERROR = "recovery";
export const PASSWORD_RECOVERY_ERROR_MESSAGE =
  "Le lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau.";

export const RESET_EMAIL_SENT_MESSAGE =
  "Si un compte existe pour cette adresse, un e-mail de réinitialisation a été envoyé.";

export const MIN_PASSWORD_LENGTH = 6;

export function passwordRecoveryErrorMessage(error: string | undefined): string | null {
  if (error === PASSWORD_RECOVERY_ERROR) return PASSWORD_RECOVERY_ERROR_MESSAGE;
  return null;
}

/** URL de retour après le clic sur le lien e-mail (PKCE via `/auth/callback`). */
export function passwordResetCallbackUrl(origin: string): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", UPDATE_PASSWORD_PATH);
  return url.toString();
}
