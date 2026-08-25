"use client";

import { AppleIcon } from "@/components/icons";

export function LoginAppleButton({
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
      className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-black rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
    >
      <AppleIcon size={18} />
      {loading ? "Redirection..." : "Continuer avec Apple"}
    </button>
  );
}
