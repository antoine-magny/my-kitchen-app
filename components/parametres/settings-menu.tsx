"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { SETTINGS_ENTRIES } from "@/lib/profile";

const THEMES = [
  { id: "light", emoji: "☀️", label: "Clair" },
  { id: "dark", emoji: "🌙", label: "Sombre" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function SettingsMenu() {
  const [theme, setTheme] = useState<ThemeId>("light");

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      {SETTINGS_ENTRIES.map((entry) => (
        <div key={entry.label}>
          <button
            type="button"
            className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#F7FAF7]"
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

      <div className="flex items-center gap-3.5 px-5 py-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F4EF] text-base"
          aria-hidden
        >
          🌙
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C2B1E]">Thème</p>
          <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">Apparence de l&apos;application</p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-xl bg-[#F0F4EF] p-1">
          {THEMES.map((option) => {
            const active = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={active}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
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

      <button
        type="button"
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#FEF2F2]"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-base"
          aria-hidden
        >
          🚪
        </span>
        <span className="flex-1 text-sm font-bold text-[#DC2626]">Déconnexion</span>
      </button>
    </div>
  );
}
