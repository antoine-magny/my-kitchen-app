"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { EditProfileActions } from "@/components/parametres/edit-profile-actions";
import { EditProfileFields } from "@/components/parametres/edit-profile-fields";
import { EditProfileHeader } from "@/components/parametres/edit-profile-header";
import { EditProfilePasswordFields } from "@/components/parametres/edit-profile-password-fields";
import { formatAuthError } from "@/components/parametres/format-auth-error";
import { createClient } from "@/lib/supabase/client";
import {
  AccountProfileError,
  isGuestAccountLabel,
  profileEmailCallbackUrlFromWindow,
  updateAccountProfile,
} from "@/lib/update-profile";

type EditProfileModalProps = {
  firstName: string;
  email: string;
  isAnonymous?: boolean;
  onSuccess?: (updated: { firstName: string; email: string }) => void;
  onClose: () => void;
};

export function EditProfileModal({
  firstName: initialFirstName,
  email: initialEmail,
  isAnonymous = false,
  onSuccess,
  onClose,
}: EditProfileModalProps) {
  const isGuestAccount = isAnonymous || isGuestAccountLabel(initialEmail);

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted, onClose, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);
    setLoading(true);

    try {
      const result = await updateAccountProfile(createClient(), {
        firstName,
        email,
        password,
        confirmPassword,
        initialFirstName,
        initialEmail,
        emailRedirectTo: profileEmailCallbackUrlFromWindow(),
      });

      if ("unchanged" in result) {
        onClose();
        return;
      }

      onSuccess?.({
        firstName: result.firstName,
        email: result.email,
      });
      router.refresh();

      if (result.emailConfirmationPending) {
        setSuccessInfo(
          "Un e-mail de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien pour valider le changement.",
        );
        return;
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof AccountProfileError ? err.message : formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(18, 28, 20, 0.65)",
          backdropFilter: "blur(6px)",
        }}
        onClick={() => {
          if (!loading) onClose();
        }}
        aria-hidden
      />

      <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="scale-in pointer-events-auto relative flex max-h-[min(92dvh,40rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl border border-[#E2EBE3]/80 bg-white shadow-[0_24px_64px_rgba(20,31,22,0.24)]">
          <EditProfileHeader
            displayName={firstName || initialFirstName}
            loading={loading}
            onClose={onClose}
          />

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

              <EditProfileFields
                firstName={firstName}
                email={email}
                isGuestAccount={isGuestAccount}
                loading={loading}
                nameInputRef={inputRef}
                onFirstNameChange={setFirstName}
                onEmailChange={setEmail}
              />

              <EditProfilePasswordFields
                isGuestAccount={isGuestAccount}
                loading={loading}
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <EditProfileActions
              loading={loading}
              successInfo={successInfo}
              onClose={onClose}
            />
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
