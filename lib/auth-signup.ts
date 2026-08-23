import type { User } from "@supabase/supabase-js";

export const EXISTING_ACCOUNT_MESSAGE = "Vous avez déjà un compte";

type SignUpErrorLike = {
  message: string;
  code?: string;
} | null;

export function isExistingAccountSignUp(
  error: SignUpErrorLike,
  user: User | null | undefined,
): boolean {
  if (error) {
    const code = error.code ?? "";
    const message = error.message.toLowerCase();
    return (
      code === "user_already_exists" ||
      message.includes("already registered") ||
      message.includes("already been registered") ||
      message.includes("user already exists")
    );
  }

  // Confirmation d'email active : Supabase masque le doublon (user sans identities).
  return Boolean(user && (user.identities?.length ?? 0) === 0);
}
