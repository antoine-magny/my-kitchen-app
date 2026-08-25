"use client";

import {
  AuthPasswordField,
  AuthTextField,
} from "@/components/login/auth-fields";

export function LoginEmailForm({
  isSignup,
  busy,
  loadingEmail,
  firstName,
  email,
  password,
  showPassword,
  error,
  onFirstNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
}: {
  isSignup: boolean;
  busy: boolean;
  loadingEmail: boolean;
  firstName: string;
  email: string;
  password: string;
  showPassword: boolean;
  error: string | null;
  onFirstNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {isSignup && (
        <AuthTextField
          id="firstName"
          label="Prénom"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={onFirstNameChange}
        />
      )}

      <AuthTextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={onEmailChange}
      />

      <AuthPasswordField
        value={password}
        showPassword={showPassword}
        autoComplete={isSignup ? "new-password" : "current-password"}
        onChange={onPasswordChange}
        onToggleVisibility={onTogglePassword}
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={busy}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
      >
        {loadingEmail ? "..." : isSignup ? "S'inscrire" : "Se connecter"}
      </button>

      {!isSignup && (
        <div className="text-center">
          <button
            type="button"
            disabled={busy}
            onClick={onForgotPassword}
            className="text-sm font-medium text-[#2E5B3E] hover:text-[#23452f] hover:underline disabled:opacity-50"
          >
            Mot de passe oublié ?
          </button>
        </div>
      )}
    </form>
  );
}
