"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, SpinnerIcon, XIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-password";
import { initialFromName } from "@/lib/user-name";

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
  const isGuestAccount =
    !initialEmail ||
    initialEmail === "Compte invité" ||
    initialEmail.toLowerCase().includes("guest");

  const [firstName, setFirstName] = useState(
    initialFirstName === "Invité" ? "" : initialFirstName,
  );
  const [email, setEmail] = useState(isGuestAccount ? "" : initialEmail);
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
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

    if (!isGuestAccount && !trimmedEmail) {
      setError("Veuillez indiquer une adresse e-mail valide.");
      return;
    }

    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
        return;
      }
      if (password !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
    }

    const nameChanged = trimmedName !== initialFirstName.trim();
    const emailChanged = !isGuestAccount
      ? trimmedEmail.toLowerCase() !== initialEmail.trim().toLowerCase()
      : Boolean(trimmedEmail);
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

      if (emailChanged && trimmedEmail) {
        userAttributes.email = trimmedEmail;
      }

      if (passwordChanged) {
        userAttributes.password = password;
      }

      let updatedEmail = isGuestAccount ? "Compte invité" : initialEmail;

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        background: "rgba(18, 28, 20, 0.65)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="scale-in relative flex max-h-[92vh] w-full max-w-[440px] flex-col rounded-3xl bg-white shadow-[0_24px_64px_rgba(20,31,22,0.24)] border border-[#E2EBE3]/80 overflow-hidden my-auto"
      >
        {/* En-tête */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
              aria-hidden
            >
              {initialFromName(firstName || initialFirstName || "?")}
            </div>
            <div>
              <h2 id="edit-profile-title" className="font-lora text-lg font-bold text-[#1C2B1E] leading-tight">
                Modifier mon profil
              </h2>
              <p className="text-xs font-medium text-[#7A8F7D]">
                Informations &amp; sécurité du compte
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] hover:text-[#1C2B1E] disabled:opacity-40"
            aria-label="Fermer la fenêtre"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-xs font-semibold text-[#DC2626] leading-relaxed">
                {error}
              </div>
            )}

            {successInfo && (
              <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] px-4 py-3 text-xs font-semibold text-[#065F46] leading-relaxed">
                {successInfo}
              </div>
            )}

            {isGuestAccount && (
              <div className="flex items-start gap-3 rounded-2xl bg-[#F0F4EF] border border-[#E2EBE3] p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm" aria-hidden>
                  👤
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1C2B1E]">Mode Invité</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#7A8F7D]">
                    Renseignez un e-mail et un mot de passe pour enregistrer définitivement votre compte.
                  </p>
                </div>
              </div>
            )}

            {/* Prénom / Nom */}
            <div>
              <label
                htmlFor="edit-firstName"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5A6B5C]"
              >
                Prénom ou Nom
              </label>
              <input
                ref={inputRef}
                id="edit-firstName"
                type="text"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isGuestAccount ? "Votre prénom (ex : Antoine)" : "Ex : Antoine"}
                className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:bg-white focus:ring-4 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="edit-email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5A6B5C]"
              >
                Adresse e-mail
              </label>
              <input
                id="edit-email"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isGuestAccount ? "ex : nom@domaine.fr" : "votre.email@exemple.com"}
                className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:bg-white focus:ring-4 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* Section Mot de passe */}
            <div className="pt-1">
              <div className="rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C2B1E]">
                    {isGuestAccount ? "Créer un mot de passe" : "Changer de mot de passe"}
                  </span>
                  <span className="text-[11px] font-medium text-[#7A8F7D] bg-white px-2 py-0.5 rounded-md border border-[#E2EBE3]">
                    optionnel
                  </span>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label
                    htmlFor="edit-password"
                    className="mb-1 block text-xs font-medium text-[#5A6B5C]"
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
                      className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#7A8F7D] hover:bg-[#F0F4EF] hover:text-[#1C2B1E] transition-colors disabled:opacity-40"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label
                    htmlFor="edit-confirm-password"
                    className="mb-1 block text-xs font-medium text-[#5A6B5C]"
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
                      className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#7A8F7D] hover:bg-[#F0F4EF] hover:text-[#1C2B1E] transition-colors disabled:opacity-40"
                      aria-label={
                        showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"
                      }
                    >
                      {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-[#7A8F7D]">
                  {isGuestAccount
                    ? "Permettra de vous reconnecter plus tard avec cet identifiant."
                    : "Laissez vide pour conserver votre mot de passe actuel."}
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="shrink-0 border-t border-[#F0F4EF] px-6 py-4 bg-[#FAFBF9]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-2xl border border-[#E2EBE3] bg-white py-3.5 text-sm font-bold text-[#5A6B5C] transition-all hover:bg-[#F0F4EF] active:scale-[0.98] disabled:opacity-50 shadow-sm"
              >
                {successInfo ? "Fermer" : "Annuler"}
              </button>
              {!successInfo && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.4] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                    boxShadow: "0 4px 16px rgba(74,124,89,0.25)",
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
