"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";
import {
  RESET_EMAIL_SENT_MESSAGE,
  passwordResetCallbackUrl,
} from "@/lib/auth-password";

const inputClass =
  "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm";

type ForgotPasswordFormProps = {
  initialEmail?: string;
};

export function ForgotPasswordForm({ initialEmail = "" }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: passwordResetCallbackUrl(window.location.origin),
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="My Kitchen App"
      subtitle="Entrez votre e-mail pour recevoir un lien de réinitialisation"
    >
      {sent ? (
        <div className="space-y-6">
          <p className="text-sm text-gray-700">{RESET_EMAIL_SENT_MESSAGE}</p>
          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E]"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
          >
            {loading ? "..." : "Envoyer le lien"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2E5B3E] hover:text-[#23452f] hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
