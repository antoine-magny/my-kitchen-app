"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";

const COMMON_ALLERGIES = [
  "Gluten", "Lactose", "Arachides", "Fruits à coque",
  "Œufs", "Soja", "Fruits de mer", "Sésame",
];

export function QuizTagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const value = raw.trim();
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onChange([...tags, value]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-sm font-medium text-[#B91C1C]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-black/5"
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(input); }
        }}
        onBlur={() => input && addTag(input)}
        placeholder="Ajouter une allergie…"
        className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-[#1C2B1E] outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
      />

      <div>
        <p className="mb-2 text-sm font-medium text-[#7A8F7D]">Suggestions :</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.filter((a) => !tags.includes(a)).map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => addTag(allergy)}
              className="rounded-full border border-[#E2EBE3] bg-white px-3 py-1.5 text-sm text-[#7A8F7D] hover:border-[#4A7C59] hover:text-[#4A7C59]"
            >
              + {allergy}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
