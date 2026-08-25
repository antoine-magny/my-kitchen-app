"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import {
  AuthDivider,
  AuthModeToggle,
} from "@/components/login/auth-fields";
import { LoginEmailForm } from "@/components/login/login-email-form";
import { LoginGoogleButton } from "@/components/login/login-google-button";
import { LoginGuestButton } from "@/components/login/login-guest-button";
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
    <AuthCard
      title="My Kitchen App"
      subtitle={
        isSignup
          ? "Créez votre compte pour commencer"
          : "Vous avez déjà un compte ? Connectez-vous !"
      }
    >
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

      <LoginGoogleButton
        loading={loading === "google"}
        disabled={busy}
        onClick={() => void handleGoogleAuth()}
      />

      <AuthDivider />

      <LoginEmailForm
        isSignup={isSignup}
        busy={busy}
        loadingEmail={loading === "email"}
        firstName={firstName}
        email={email}
        password={password}
        showPassword={showPassword}
        error={error}
        onFirstNameChange={setFirstName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={() => void handleAuth()}
        onForgotPassword={() => {
          const trimmed = email.trim();
          const query = trimmed ? `?email=${encodeURIComponent(trimmed)}` : "";
          router.push(`${REQUEST_RESET_PATH}${query}`);
        }}
      />

      <AuthDivider />

      <LoginGuestButton
        loading={loading === "guest"}
        disabled={busy}
        onClick={() => void handleGuestAuth()}
      />
    </AuthCard>
  );
}
