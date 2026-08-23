"use client";

import { EyeIcon, EyeOffIcon } from "@/components/icons";

export const AUTH_INPUT_CLASS =
  "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm";

export function AuthModeToggle({
  isSignup,
  onLogin,
  onSignup,
}: {
  isSignup: boolean;
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-md bg-gray-100 p-1">
      <button
        type="button"
        onClick={onLogin}
        className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
          !isSignup ? "bg-white text-[#2E5B3E] shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Connexion
      </button>
      <button
        type="button"
        onClick={onSignup}
        className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
          isSignup ? "bg-white text-[#2E5B3E] shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Inscription
      </button>
    </div>
  );
}

export function AuthTextField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: "text" | "email";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={AUTH_INPUT_CLASS}
        />
      </div>
    </div>
  );
}

export function AuthPasswordField({
  value,
  showPassword,
  autoComplete,
  onChange,
  onToggleVisibility,
}: {
  value: string;
  showPassword: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
        Mot de passe
      </label>
      <div className="mt-1 relative">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${AUTH_INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-2 text-gray-500">ou</span>
      </div>
    </div>
  );
}
