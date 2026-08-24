"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";
import { PREFERENCE_STYLE, type PreferenceGroup } from "@/lib/profile";

/** Bloc de tags éditables : ajout via un champ inline, retrait via la croix. */
export function PreferenceCard({ group }: { group: PreferenceGroup }) {
  const [tags, setTags] = useState(group.tags);
  const [draft, setDraft] = useState<string | null>(null);
  const style = PREFERENCE_STYLE[group.kind];

  const confirmDraft = () => {
    const value = draft?.trim();
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTags([...tags, value]);
    }
    setDraft(null);
  };

  return (
    <div
      className="rounded-3xl px-5 py-4"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none" aria-hidden>
          {group.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C2B1E]">{group.title}</p>
          <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">{group.hint}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
          >
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="opacity-55 transition-opacity hover:opacity-100"
              aria-label={`Retirer ${tag}`}
            >
              <XIcon size={12} strokeWidth={2.6} />
            </button>
          </span>
        ))}

        {draft === null ? (
          <button
            type="button"
            onClick={() => setDraft("")}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#C8E0CF] px-3 py-1.5 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#F0F7F2]"
          >
            <PlusIcon size={12} />
            Ajouter
          </button>
        ) : (
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={confirmDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmDraft();
              if (e.key === "Escape") setDraft(null);
            }}
            placeholder="Nom de l'aliment…"
            className="w-36 rounded-xl border border-[#C8E0CF] bg-[#FAFBF9] px-3 py-1.5 text-base font-semibold text-[#1C2B1E] outline-none"
          />
        )}
      </div>
    </div>
  );
}
