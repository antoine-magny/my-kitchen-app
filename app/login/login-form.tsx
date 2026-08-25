"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import {
  AuthDivider,
  AuthModeToggle,
} from "@/components/login/auth-fields";
import { LoginEmailForm } from "@/components/login/login-email-form";
import { LoginGoogleButton } from "@/components/login/login-google-button";
import { LoginAppleButton } from "@/components/login/login-apple-button";
import { LoginGuestButton } from "@/components/login/login-guest-button";
import { isExistingAccountSignUp } from "@/lib/auth-signup";
import {
  GOOGLE_AUTH_ERROR_MESSAGE,
  googleAuthErrorMessage,
  loginOAuthErrorMessage,
  signInWithGoogle,
} from "@/lib/auth-google";
import {
  APPLE_AUTH_ERROR_MESSAGE,
  appleAuthErrorMessage,
  signInWithApple,
} from "@/lib/auth-apple";
import {
  GUEST_ACTIVE_SESSION_KEY,
  guestAuthErrorMessage,
  guestQueryErrorMessage,
  isAnonymousUser,
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
  const [loading, setLoading] = useState<"email" | "google" | "apple" | "guest" | null>(null);
  const [error, setError] = useState<React.ReactNode>(
    loginOAuthErrorMessage(oauthError, oauthEmail) ??
      passwordRecoveryErrorMessage(oauthError) ??
      guestQueryErrorMessage(oauthError),
  );
  const router = useRouter();
  const supabase = createClient();

  const isSignup = mode === "signup";
  const busy = loading !== null;

  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (currentUser && isAnonymousUser(currentUser)) {
        window.sessionStorage.removeItem(GUEST_ACTIVE_SESSION_KEY);
        void supabase.auth.signOut();
        return;
      }
      if (currentUser && !isAnonymousUser(currentUser)) {
        window.location.assign("/");
      }
    };
    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session?.user &&
        !isAnonymousUser(session.user) &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        isMounted
      ) {
        window.location.assign("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGuestAuth = async () => {
    setLoading("guest");
    setError(null);
    try {
      window.sessionStorage.setItem(GUEST_ACTIVE_SESSION_KEY, "1");
      const { error: guestError } = await signInAsGuest(supabase);
      if (guestError) {
        window.sessionStorage.removeItem(GUEST_ACTIVE_SESSION_KEY);
        throw guestError;
      }
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

  const handleAppleAuth = async () => {
    setLoading("apple");
    setError(null);
    try {
      const { error: appleError } = await signInWithApple(supabase, window.location.origin);
      if (appleError) throw appleError;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? appleAuthErrorMessage(err)
          : APPLE_AUTH_ERROR_MESSAGE,
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
            setError(
              <span>
                Vous avez déjà un compte. Vous avez oublié votre mot de passe ?{" "}
                <Link
                  href={`${REQUEST_RESET_PATH}?email=${encodeURIComponent(email)}`}
                  className="underline font-semibold hover:text-red-700"
                >
                  Cliquez-ici !
                </Link>
              </span>
            );
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

      <div className="flex flex-col gap-3">
        <LoginGoogleButton
          loading={loading === "google"}
          disabled={busy}
          onClick={() => void handleGoogleAuth()}
        />

        {/* 
          TODO: Bouton Apple masqué temporairement en attendant la configuration
          côté Apple Developer et Supabase. À réactiver quand prêt.
        <LoginAppleButton
          loading={loading === "apple"}
          disabled={busy}
          onClick={() => void handleAppleAuth()}
        /> 
        */}
      </div>

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
