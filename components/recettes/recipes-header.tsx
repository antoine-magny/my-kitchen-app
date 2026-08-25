"use client";

import { PlusIcon, SearchIcon } from "@/components/icons";

export function RecipesHeader({
  query,
  onQueryChange,
  onAdd,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Collection</p>
        <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">Mes Recettes</h1>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2EBE3",
            boxShadow: "0 2px 12px rgba(28,43,30,0.06)",
          }}
        >
          <span className="shrink-0 text-[#7A8F7D]">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Titre ou ingrédient…"
            className="min-w-0 flex-1 truncate bg-transparent text-base font-medium text-[#1C2B1E] outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold sm:px-5"
        >
          <PlusIcon size={14} />
          <span className="hidden sm:inline">Ajouter une recette</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>
    </div>
  );
}
