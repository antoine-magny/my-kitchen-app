"use client";

import { SearchIcon, XIcon } from "@/components/icons";
import { FAQ_CATEGORIES, type FaqCategory } from "@/lib/help-data";

type HelpFaqSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: FaqCategory;
  onCategoryChange: (category: FaqCategory) => void;
  totalResults: number;
};

export function HelpFaqSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalResults,
}: HelpFaqSearchProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Barre de recherche */}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5 text-[#7A8F7D]">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une question (ex. DLC, Gemini, courses...)"
          className="w-full rounded-2xl border border-[#E2EBE3] bg-white py-2.5 pr-10 pl-10 text-xs font-medium text-[#1C2B1E] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[#7A8F7D] hover:bg-[#F0F4EF] hover:text-[#1C2B1E] cursor-pointer"
            aria-label="Effacer la recherche"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Catégories de filtres */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#2E5C3A] text-white shadow-sm"
                  : "bg-white border border-[#E2EBE3] text-[#7A8F7D] hover:bg-[#FAFBF9] hover:text-[#1C2B1E]"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Résumé nombre de résultats */}
      <div className="flex items-center justify-between text-[11px] font-medium text-[#7A8F7D]">
        <span>
          {totalResults === 1 ? "1 réponse trouvée" : `${totalResults} réponses trouvées`}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="text-[#4A7C59] font-bold hover:underline cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
