"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, SpinnerIcon, XIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-password";

type EditProfileModalProps = {
  firstName: string;
  email: string;
  onSuccess?: (updated: { firstName: string; email: string }) => void;
  onClose: () => void;
};

function formatAuthError(error: unknown): string {
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

export function EditProfileModal({
  firstName: initialFirstName,
  email: initialEmail,
  onSuccess,
  onClose,
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const trimmedName = firstName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Veuillez indiquer un prénom ou un nom.");
      return;
    }

    if (!trimmedEmail) {
      setError("Veuillez indiquer une adresse e-mail.");
      return;
    }

    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
    }

    const nameChanged = trimmedName !== initialFirstName.trim();
    const emailChanged = trimmedEmail.toLowerCase() !== initialEmail.trim().toLowerCase();
    const passwordChanged = Boolean(password);

    if (!nameChanged && !emailChanged && !passwordChanged) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        throw new Error("Session utilisateur introuvable. Veuillez vous reconnecter.");
      }

      const userAttributes: {
        email?: string;
        password?: string;
        data?: Record<string, unknown>;
      } = {};

      if (nameChanged) {
        userAttributes.data = {
          ...(user.user_metadata || {}),
          full_name: trimmedName,
          name: trimmedName,
          given_name: trimmedName,
        };
      }

      if (emailChanged) {
        userAttributes.email = trimmedEmail;
      }

      if (passwordChanged) {
        userAttributes.password = password;
      }

      let updatedEmail = initialEmail;

      if (Object.keys(userAttributes).length > 0) {
        const { data: updateData, error: updateError } =
          await supabase.auth.updateUser(userAttributes);

        if (updateError) {
          throw updateError;
        }

        if (updateData.user?.email) {
          updatedEmail = updateData.user.email;
        }

        if (emailChanged && updateData.user?.new_email) {
          setSuccessInfo(
            "Un e-mail de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien pour valider le changement.",
          );
        }
      }

      // Synchronisation de la table `profiles`
      if (nameChanged) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Erreur lors de la mise à jour de la table profiles:", profileError);
        }
      }

      onSuccess?.({
        firstName: trimmedName,
        email: emailChanged && !successInfo ? trimmedEmail : updatedEmail,
      });

      router.refresh();

      if (!emailChanged || !userAttributes.email) {
        onClose();
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-full w-full flex-col rounded-t-3xl sm:max-h-[90vh] sm:w-[480px] sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        {/* En-tête */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5">
          <div>
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">
              Modifier mes informations
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
              Nom, adresse e-mail et mot de passe
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-semibold text-[#DC2626]">
                {error}
              </div>
            )}

            {successInfo && (
              <div className="rounded-xl bg-[#ECFDF5] px-3.5 py-2.5 text-xs font-semibold text-[#065F46]">
                {successInfo}
              </div>
            )}

            {/* Prénom / Nom */}
            <div>
              <label
                htmlFor="edit-firstName"
                className="mb-1.5 block text-xs font-bold text-[#1C2B1E]"
              >
                Prénom / Nom
              </label>
              <input
                ref={inputRef}
                id="edit-firstName"
                type="text"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex : Antoine"
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#F7FAF7] px-3.5 py-2.5 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-colors focus:border-[#4A7C59] focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="edit-email"
                className="mb-1.5 block text-xs font-bold text-[#1C2B1E]"
              >
                Adresse e-mail
              </label>
              <input
                id="edit-email"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#F7FAF7] px-3.5 py-2.5 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-colors focus:border-[#4A7C59] focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* Section Mot de passe */}
            <div className="pt-2">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold text-[#1C2B1E]">Changer de mot de passe</span>
                <span className="text-[11px] font-medium text-[#7A8F7D]">(optionnel)</span>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-3.5">
                {/* Nouveau mot de passe */}
                <div>
                  <label
                    htmlFor="edit-password"
                    className="mb-1 block text-xs font-semibold text-[#5A6B5C]"
                  >
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="edit-password"
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-colors focus:border-[#4A7C59] focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7A8F7D] hover:text-[#1C2B1E] disabled:opacity-40"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label
                    htmlFor="edit-confirm-password"
                    className="mb-1 block text-xs font-semibold text-[#5A6B5C]"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="edit-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-colors focus:border-[#4A7C59] focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7A8F7D] hover:text-[#1C2B1E] disabled:opacity-40"
                      aria-label={
                        showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"
                      }
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-[#7A8F7D]">
                  Laissez vide pour conserver votre mot de passe actuel.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="shrink-0 border-t border-[#F0F4EF] px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-2xl border border-[#E2EBE3] bg-white py-3 text-sm font-bold text-[#5A6B5C] transition-all hover:bg-[#F0F4EF] active:scale-[0.98] disabled:opacity-50"
              >
                {successInfo ? "Fermer" : "Annuler"}
              </button>
              {!successInfo && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.4] flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                    boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
                  }}
                >
                  {loading ? (
                    <>
                      <SpinnerIcon size={16} />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
