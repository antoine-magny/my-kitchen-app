export const REQUEST_RESET_PATH = "/login/mot-de-passe-oublie";
export const UPDATE_PASSWORD_PATH = "/nouveau-mot-de-passe";

export const PASSWORD_RECOVERY_ERROR = "recovery";
export const PASSWORD_RECOVERY_ERROR_MESSAGE =
  "Le lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau. Si vous avez cliqué plusieurs fois d'affilé sur \"envoyer le lien\", le lien valide est le dernier que vous ayez reçu.";


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

/** Détermine l'URL du webmail ou client mail à partir de l'adresse e-mail. */
export function getEmailWebmailUrl(email: string): { url: string; label: string } {
  const domain = email.trim().split("@")[1]?.toLowerCase();
  if (!domain) {
    return { url: "mailto:", label: "Ouvrir ma boîte mail" };
  }

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { url: "https://mail.google.com/mail/u/0/#inbox", label: "Ouvrir Gmail" };
  }
  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "msn.com" ||
    domain === "outlook.fr" ||
    domain === "hotmail.fr"
  ) {
    return { url: "https://outlook.live.com/mail/", label: "Ouvrir Outlook" };
  }
  if (domain === "yahoo.com" || domain === "yahoo.fr") {
    return { url: "https://mail.yahoo.com", label: "Ouvrir Yahoo Mail" };
  }
  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return { url: "https://www.icloud.com/mail", label: "Ouvrir iCloud Mail" };
  }
  if (domain === "proton.me" || domain === "protonmail.com") {
    return { url: "https://mail.proton.me", label: "Ouvrir Proton Mail" };
  }
  if (domain === "orange.fr" || domain === "wanadoo.fr") {
    return { url: "https://messagerie.orange.fr", label: "Ouvrir Orange Mail" };
  }
  if (domain === "free.fr") {
    return { url: "https://webmail.free.fr", label: "Ouvrir Free Webmail" };
  }
  if (domain === "sfr.fr" || domain === "neuf.fr") {
    return { url: "https://webmail.sfr.fr", label: "Ouvrir SFR Mail" };
  }
  if (domain === "laposte.net") {
    return { url: "https://www.laposte.net/accueil", label: "Ouvrir La Poste" };
  }

  return { url: `https://${domain}`, label: "Ouvrir ma boîte mail" };
}

