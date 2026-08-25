"use client";

import { GoogleIcon } from "@/components/icons";

export function LoginGoogleButton({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
    >
      <GoogleIcon size={18} />
      {loading ? "Redirection..." : "Continuer avec Google"}
    </button>
  );
}
