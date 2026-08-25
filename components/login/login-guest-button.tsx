"use client";

import { UsersIcon } from "@/components/icons";

export function LoginGuestButton({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
      >
        <UsersIcon size={18} />
        {loading ? "Connexion..." : "Se connecter en tant qu'invité"}
      </button>
      <p className="mt-3 text-center text-xs text-gray-500">
        Sans e-mail, la session disparaît si vous vous déconnectez.
      </p>
    </>
  );
}
