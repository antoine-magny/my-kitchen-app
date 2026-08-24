"use client";

import Link from "next/link";
import { SearchIcon, SettingsIcon } from "@/components/icons";
import { initialFromName } from "@/lib/user-name";

export function HomeHeader({
  todayLabel,
  firstName,
  isGuest,
  query,
  onQueryChange,
}: {
  todayLabel: string;
  firstName: string;
  isGuest: boolean;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="fade-up pt-10 pb-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
            {todayLabel}
          </p>
          <h1 className="font-lora mt-0.5 text-2xl leading-tight font-bold text-[#1C2B1E]">
            Bonjour{firstName && !isGuest ? ` ${firstName}` : ""} !<br />
            <span className="text-[#4A7C59]">Prêt à cuisiner ?</span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/parametres"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#4A7C59] transition-all hover:opacity-80 active:scale-95 sm:flex"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2EBE3",
              boxShadow: "0 2px 12px rgba(74,124,89,0.10)",
            }}
            aria-label="Profil et paramètres"
          >
            <SettingsIcon size={19} />
          </Link>
          <Link
            href="/parametres"
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-md transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
            aria-label="Mon profil"
          >
            {initialFromName(firstName)}
          </Link>
        </div>
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 2px 14px rgba(74,124,89,0.10)",
          border: "1.5px solid #E2EBE3",
        }}
      >
        <span className="text-[#7A8F7D]">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher une recette, un ingrédient…"
          className="flex-1 bg-transparent text-base font-medium text-[#1C2B1E] outline-none"
        />
      </div>
    </div>
  );
}
