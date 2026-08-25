"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { FaqItem } from "@/lib/help-data";

type HelpFaqAccordionProps = {
  items: readonly FaqItem[];
  searchQuery: string;
  onResetFilters: () => void;
};

export function HelpFaqAccordion({
  items,
  searchQuery,
  onResetFilters,
}: HelpFaqAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    items.length > 0 ? items[0].id : null,
  );

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D1DDD2] bg-[#FAFBF9] p-6 text-center">
        <span className="text-2xl" aria-hidden>
          🔍
        </span>
        <p className="mt-2 text-xs font-bold text-[#1C2B1E]">Aucune réponse trouvée</p>
        <p className="mt-1 text-[11px] text-[#7A8F7D]">
          {searchQuery
            ? `Aucun résultat pour « ${searchQuery} ». Essayez d'autres mots-clés.`
            : "Aucune question dans cette catégorie pour le moment."}
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-3 rounded-xl bg-[#EBF2EC] px-3.5 py-1.5 text-xs font-bold text-[#2E5C3A] transition hover:bg-[#DCE7DE] cursor-pointer"
        >
          Afficher toutes les questions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-[#E2EBE3] bg-white transition"
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isExpanded}
              className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:bg-[#FAFBF9] cursor-pointer"
            >
              <span className="text-xs font-bold text-[#1C2B1E] leading-snug">
                {item.question}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-transform duration-200 ${
                  isExpanded ? "rotate-180 text-[#2E5C3A]" : ""
                }`}
              >
                <ChevronDownIcon size={12} />
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-[#F0F4EF] bg-[#FAFBF9]/60 px-3.5 py-3 text-xs leading-relaxed text-[#526355]">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
