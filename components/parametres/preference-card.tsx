"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";
import { PREFERENCE_STYLE, type PreferenceGroup } from "@/lib/profile";

type PreferenceCardProps = {
  group: PreferenceGroup;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

export function PreferenceCard({ group, tags, onTagsChange }: PreferenceCardProps) {
  const [draft, setDraft] = useState("");
  const style = PREFERENCE_STYLE[group.kind];

  const handleAdd = () => {
    const value = draft.trim();
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onTagsChange([...tags, value]);
    }
    setDraft("");
  };

  const handleRemove = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="rounded-3xl border border-[#E2EBE3] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#1C2B1E]">{group.title}</h3>
          <p className="text-xs text-[#7A8F7D]">{group.hint}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F4EF] text-lg">
          {group.emoji}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tags.length === 0 && (
          <span className="text-sm italic text-[#9CA3AF]">Aucun ingrédient ajouté</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              className="rounded-full p-0.5 hover:bg-black/5"
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Ajouter..."
          className="flex-1 rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-2.5 text-sm outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
        />
        <button
          onClick={handleAdd}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-2xl bg-[#4A7C59] text-white hover:bg-[#3d6649]"
        >
          <PlusIcon size={20} />
        </button>
      </div>
    </div>
  );
}
