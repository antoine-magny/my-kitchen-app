"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { formatAuthError } from "@/lib/format-auth-error";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_RECOVERY_ERROR_MESSAGE,
  REQUEST_RESET_PATH,
} from "@/lib/auth-password";

const inputClass =
  "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (isMounted) {
          setSessionValid(Boolean(user));
        }
      } catch {
        if (isMounted) {
          setSessionValid(false);
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      window.location.assign("/");
    } catch (err: unknown) {
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <AuthCard title="My Kitchen App" subtitle="Vérification en cours...">
        <div className="py-6 text-center text-sm text-gray-500">Chargement de votre session...</div>
      </AuthCard>
    );
  }

  if (!sessionValid) {
    return (
      <AuthCard title="My Kitchen App" subtitle="Session invalide ou expirée">
        <div className="space-y-6">
          <p className="text-center text-sm text-gray-700">{PASSWORD_RECOVERY_ERROR_MESSAGE}</p>
          <Link
            href={REQUEST_RESET_PATH}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E]"
          >
            Demander un nouveau lien
          </Link>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2E5B3E] hover:text-[#23452f] hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="My Kitchen App" subtitle="Choisissez votre nouveau mot de passe">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={
                showConfirmPassword
                  ? "Masquer la confirmation du mot de passe"
                  : "Afficher la confirmation du mot de passe"
              }
            >
              {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
        >
          {loading ? "..." : "Enregistrer"}
        </button>
      </form>
    </AuthCard>
  );
}

