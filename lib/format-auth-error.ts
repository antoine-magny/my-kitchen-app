import { MIN_PASSWORD_LENGTH } from "@/lib/auth-password";

export function formatAuthError(error: unknown): string {
  if (!error) return "Une erreur est survenue lors de la mise à jour.";
  const msg = (error as { message?: string }).message?.toLowerCase() ?? "";

  if (msg.includes("password should be at least") || msg.includes("weak_password")) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (msg.includes("same_password") || msg.includes("should be different")) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "L'adresse e-mail n'est pas valide.";
  }
  if (
    msg.includes("already registered") ||
    msg.includes("email_exists") ||
    msg.includes("user already exists")
  ) {
    return "Cette adresse e-mail est déjà associée à un autre compte.";
  }
  if (msg.includes("reauthentication") || msg.includes("requires recent login")) {
    return "Par sécurité, veuillez vous reconnecter avant de modifier ces informations.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Trop de tentatives. Veuillez patienter quelques instants.";
  }

  return (error as { message?: string }).message || "Une erreur est survenue lors de la mise à jour.";
}
