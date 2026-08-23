"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon, UsersIcon } from "@/components/icons";
import {
  AuthDivider,
  AuthModeToggle,
  AuthPasswordField,
  AuthTextField,
} from "@/components/login/auth-fields";
import { EXISTING_ACCOUNT_MESSAGE, isExistingAccountSignUp } from "@/lib/auth-signup";
import {
  GOOGLE_AUTH_ERROR_MESSAGE,
  googleAuthErrorMessage,
  loginOAuthErrorMessage,
  signInWithGoogle,
} from "@/lib/auth-google";
import {
  guestAuthErrorMessage,
  guestQueryErrorMessage,
  signInAsGuest,
} from "@/lib/auth-guest";
import { passwordRecoveryErrorMessage, REQUEST_RESET_PATH } from "@/lib/auth-password";
import { createClient } from "@/lib/supabase/client";
import { getUserProviders } from "./actions";

type LoginFormProps = {
  oauthError?: string;
  oauthEmail?: string;
};

export function LoginForm({ oauthError, oauthEmail }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "guest" | null>(null);
  const [error, setError] = useState<string | null>(
    loginOAuthErrorMessage(oauthError, oauthEmail) ??
      passwordRecoveryErrorMessage(oauthError) ??
      guestQueryErrorMessage(oauthError),
  );
  const router = useRouter();
  const supabase = createClient();

  const isSignup = mode === "signup";
  const busy = loading !== null;

  const handleGuestAuth = async () => {
    setLoading("guest");
    setError(null);
    try {
      const { error: guestError } = await signInAsGuest(supabase);
      if (guestError) throw guestError;
      window.location.assign("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? guestAuthErrorMessage(err) : guestAuthErrorMessage(null),
      );
      setLoading(null);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading("google");
    setError(null);
    try {
      const { error: googleError } = await signInWithGoogle(supabase, window.location.origin);
      if (googleError) throw googleError;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? googleAuthErrorMessage(err)
          : GOOGLE_AUTH_ERROR_MESSAGE,
      );
      setLoading(null);
    }
  };

  const handleAuth = async () => {
    const trimmedName = firstName.trim();
    if (isSignup && !trimmedName) {
      setError("Veuillez indiquer votre prénom");
      return;
    }

    setLoading("email");
    setError(null);

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: trimmedName },
          },
        });
        if (isExistingAccountSignUp(signUpError, data.user)) {
          const providers = await getUserProviders(email);
          if (providers && providers.includes("google") && !providers.includes("email")) {
            setError(`Vous avez déjà un compte sur cette adresse mail : ${email}. Veuillez vous connecter avec google.`);
          } else {
            setError(EXISTING_ACCOUNT_MESSAGE);
          }
          return;
        }
        if (signUpError) throw signUpError;
        alert("Vérifiez vos emails pour confirmer l'inscription (si nécessaire), sinon vous pouvez vous connecter directement si auto-confirmé.");
        setMode("login");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          if (signInError.message === "Invalid login credentials") {
            const providers = await getUserProviders(email);
            if (providers && providers.includes("google") && !providers.includes("email")) {
              setError(`Vous avez déjà un compte sur cette adresse mail : ${email}. Veuillez vous connecter avec google.`);
              return;
            }
          }
          throw signInError;
        }
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2E5B3E]">
          My Kitchen App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignup
            ? "Créez votre compte pour commencer"
            : "Vous avez déjà un compte ? Connectez-vous !"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthModeToggle
            isSignup={isSignup}
            onLogin={() => {
              setMode("login");
              setError(null);
            }}
            onSignup={() => {
              setMode("signup");
              setError(null);
            }}
          />

          <button
            type="button"
            onClick={() => void handleGoogleAuth()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
          >
            <GoogleIcon size={18} />
            {loading === "google" ? "Redirection..." : "Continuer avec Google"}
          </button>

          <AuthDivider />

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleAuth();
            }}
          >
            {isSignup && (
              <AuthTextField
                id="firstName"
                label="Prénom"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={setFirstName}
              />
            )}

            <AuthTextField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />

            <AuthPasswordField
              value={password}
              showPassword={showPassword}
              autoComplete={isSignup ? "new-password" : "current-password"}
              onChange={setPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
            >
              {loading === "email" ? "..." : isSignup ? "S'inscrire" : "Se connecter"}
            </button>

            {!isSignup && (
              <div className="text-center">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const trimmed = email.trim();
                    const query = trimmed ? `?email=${encodeURIComponent(trimmed)}` : "";
                    router.push(`${REQUEST_RESET_PATH}${query}`);
                  }}
                  className="text-sm font-medium text-[#2E5B3E] hover:text-[#23452f] hover:underline disabled:opacity-50"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>

          <AuthDivider />

          <button
            type="button"
            onClick={() => void handleGuestAuth()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
          >
            <UsersIcon size={18} />
            {loading === "guest" ? "Connexion..." : "Se connecter en tant qu'invité"}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Sans e-mail, la session disparaît si vous vous déconnectez.
          </p>
        </div>
      </div>
    </div>
  );
}
