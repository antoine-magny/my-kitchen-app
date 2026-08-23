import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAnonymousUser, userAccountLabel } from "@/lib/auth-guest";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-password";
import type { Database } from "@/lib/supabase/database.types";

export const PROFILE_SETTINGS_PATH = "/parametres";

export type AccountProfileInput = {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
  initialFirstName: string;
  initialEmail: string;
  emailRedirectTo: string;
};

export type AccountProfileUpdate = {
  firstName: string;
  email: string;
  emailConfirmationPending: boolean;
};

export class AccountProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountProfileError";
  }
}

export function profileEmailCallbackUrl(origin: string): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", PROFILE_SETTINGS_PATH);
  return url.toString();
}

export function isGuestAccountLabel(email: string): boolean {
  const trimmed = email.trim();
  return !trimmed || trimmed === "Compte invité" || trimmed.toLowerCase().includes("guest");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function displayEmail(user: User, fallback: string): string {
  return user.email || userAccountLabel(user) || fallback;
}

export function profileEmailCallbackUrlFromWindow(): string {
  if (typeof window === "undefined") return PROFILE_SETTINGS_PATH;
  return profileEmailCallbackUrl(window.location.origin);
}

type PreparedChanges = {
  trimmedName: string;
  trimmedEmail: string;
  nameChanged: boolean;
  emailChanged: boolean;
  passwordChanged: boolean;
};

export function prepareAccountProfileChanges(
  input: AccountProfileInput,
  user: User,
): PreparedChanges {
  const isGuest = isAnonymousUser(user) || isGuestAccountLabel(input.initialEmail);
  const trimmedName = input.firstName.trim();
  const trimmedEmail = input.email.trim();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!trimmedName) {
    throw new AccountProfileError("Veuillez indiquer un prénom ou un nom.");
  }

  if (isGuest) {
    if (trimmedEmail && !password) {
      throw new AccountProfileError(
        "Pour enregistrer définitivement votre compte, indiquez aussi un mot de passe.",
      );
    }
    if (password && !trimmedEmail) {
      throw new AccountProfileError(
        "Pour enregistrer définitivement votre compte, indiquez aussi une adresse e-mail.",
      );
    }
  } else if (!trimmedEmail) {
    throw new AccountProfileError("Veuillez indiquer une adresse e-mail valide.");
  }

  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    throw new AccountProfileError("L'adresse e-mail n'est pas valide.");
  }

  if (password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AccountProfileError(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
      );
    }
    if (password !== confirmPassword) {
      throw new AccountProfileError("Les deux mots de passe ne correspondent pas.");
    }
  }

  const initialName = input.initialFirstName.trim();
  const nameChanged = trimmedName !== initialName && trimmedName !== "Invité";
  const emailChanged = isGuest
    ? Boolean(trimmedEmail)
    : trimmedEmail.toLowerCase() !== input.initialEmail.trim().toLowerCase();
  const passwordChanged = Boolean(password);

  return { trimmedName, trimmedEmail, nameChanged, emailChanged, passwordChanged };
}

async function syncProfileFullName(
  supabase: SupabaseClient<Database>,
  userId: string,
  fullName: string,
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: updatedAt })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (updateError) throw updateError;
  if (data) return;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    user_id: userId,
    full_name: fullName,
    updated_at: updatedAt,
  });

  if (insertError) throw insertError;
}

export async function updateAccountProfile(
  supabase: SupabaseClient<Database>,
  input: AccountProfileInput,
): Promise<AccountProfileUpdate | { unchanged: true }> {
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    throw new AccountProfileError(
      "Session utilisateur introuvable. Veuillez vous reconnecter.",
    );
  }

  const changes = prepareAccountProfileChanges(input, user);
  if (!changes.nameChanged && !changes.emailChanged && !changes.passwordChanged) {
    return { unchanged: true };
  }

  const userAttributes: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  } = {};

  if (changes.nameChanged) {
    userAttributes.data = {
      ...(user.user_metadata || {}),
      full_name: changes.trimmedName,
      name: changes.trimmedName,
      given_name: changes.trimmedName,
    };
  }

  if (changes.emailChanged && changes.trimmedEmail) {
    userAttributes.email = changes.trimmedEmail;
  }

  if (changes.passwordChanged) {
    userAttributes.password = input.password;
  }

  let updatedUser = user;
  let emailConfirmationPending = false;

  if (Object.keys(userAttributes).length > 0) {
    const { data, error } = await supabase.auth.updateUser(userAttributes, {
      emailRedirectTo: input.emailRedirectTo,
    });

    if (error) throw error;
    if (data.user) updatedUser = data.user;
    emailConfirmationPending = Boolean(data.user?.new_email);
  }

  if (changes.nameChanged) {
    await syncProfileFullName(supabase, user.id, changes.trimmedName);
  }

  const confirmedEmail = emailConfirmationPending
    ? displayEmail(updatedUser, input.initialEmail)
    : changes.emailChanged
      ? changes.trimmedEmail
      : displayEmail(updatedUser, input.initialEmail);

  return {
    firstName: changes.trimmedName,
    email: confirmedEmail,
    emailConfirmationPending,
  };
}
