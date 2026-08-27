"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@/components/icons";
import { HelpSupportModal } from "@/components/parametres/help-support-modal";
import { NotificationsModal } from "@/components/parametres/notifications-modal";
import { SETTINGS_ENTRIES } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { applyTheme, getInitialTheme, getStoredTheme, type ThemeId } from "@/lib/theme";

const THEMES: { id: ThemeId; emoji: string; label: string }[] = [
  { id: "light", emoji: "☀️", label: "Clair" },
  { id: "dark", emoji: "🌙", label: "Sombre" },
];

export function SettingsMenu() {
  // Lecture paresseuse : reste cohérent avec l'attribut déjà posé par le
  // script d'initialisation dans app/layout.tsx (voir lib/theme.ts).
  const [theme, setTheme] = useState<ThemeId>(() => getInitialTheme());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Re-applique la préférence stockée après le double rendu de Strict Mode
  // en dev, qui réinitialise sinon l'attribut data-theme (no-op en prod).
  useLayoutEffect(() => {
    const stored = getStoredTheme();
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
  };

  const handleLogout = async () => {
    window.localStorage.clear();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleEntryClick = (label: string) => {
    if (label === "Notifications") {
      setIsNotificationsOpen(true);
    } else if (label === "Aide & support") {
      setIsHelpOpen(true);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      {SETTINGS_ENTRIES.map((entry) => (
        <div key={entry.label}>
          <button
            type="button"
            onClick={() => handleEntryClick(entry.label)}
            className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#F7FAF7] active:bg-[#EDF3EC] cursor-pointer"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F4EF] text-base"
              aria-hidden
            >
              {entry.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#1C2B1E]">{entry.label}</span>
              <span className="mt-0.5 block text-xs font-medium text-[#7A8F7D]">{entry.hint}</span>
            </span>
            <span className="shrink-0 text-[#7A8F7D]">
              <ChevronRightIcon size={16} />
            </span>
          </button>
          <div className="h-px bg-[#F0F4EF]" />
        </div>
      ))}

      {/* Thème */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-3.5">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F4EF] text-base"
            aria-hidden
          >
            🌙
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#1C2B1E]">Thème</p>
            <p className="mt-0.5 truncate text-xs font-medium text-[#7A8F7D]">
              Apparence de l&apos;application
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl bg-[#F0F4EF] p-1 sm:ml-auto sm:shrink-0">
          {THEMES.map((option) => {
            const active = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleThemeChange(option.id)}
                aria-pressed={active}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  active ? "bg-white text-[#2E5C3A] shadow-sm" : "text-[#7A8F7D]"
                }`}
              >
                <span aria-hidden>{option.emoji}</span> {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#F0F4EF]" />

      {/* Déconnexion */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#FEF2F2] cursor-pointer"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-base"
          aria-hidden
        >
          🚪
        </span>
        <span className="flex-1 text-sm font-bold text-[#DC2626]">Déconnexion</span>
      </button>

      {/* Modales Milestone 1 */}
      {isNotificationsOpen && (
        <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
      )}
      {isHelpOpen && (
        <HelpSupportModal onClose={() => setIsHelpOpen(false)} />
      )}
    </div>
  );
}

