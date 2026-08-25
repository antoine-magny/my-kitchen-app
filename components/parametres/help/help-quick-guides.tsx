"use client";

import { ChevronRightIcon } from "@/components/icons";
import { QUICK_GUIDES } from "@/lib/help-data";

type HelpQuickGuidesProps = {
  onNavigate: (route: string) => void;
};

export function HelpQuickGuides({ onNavigate }: HelpQuickGuidesProps) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#7A8F7D]">
        Démarrage rapide
      </h3>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {QUICK_GUIDES.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => onNavigate(guide.route)}
            className="flex items-start gap-3 rounded-2xl border border-[#E2EBE3] bg-white p-3.5 text-left transition hover:border-[#4A7C59]/40 hover:bg-[#FAFBF9] cursor-pointer"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F4EF] text-lg" aria-hidden>
              {guide.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-xs font-bold text-[#1C2B1E]">
                <span>{guide.title}</span>
                <ChevronRightIcon size={14} className="text-[#7A8F7D]" />
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#7A8F7D]">
                {guide.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
