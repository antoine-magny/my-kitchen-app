"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";
import { UNIQUE_EMOJI_INGREDIENTS } from "@/lib/ingredients";

const INGREDIENT_CATEGORIES = ["vegetables", "fruits", "proteins", "starches"] as const;
const GRID_ITEMS = UNIQUE_EMOJI_INGREDIENTS.filter(
  (item) => item.category && (INGREDIENT_CATEGORIES as readonly string[]).includes(item.category),
).slice(0, 40);

export function QuizIngredientGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleAddCustom = () => {
    const value = input.trim();
    if (value && !selected.includes(value)) onToggle(value);
    setInput("");
  };

  const customItems = selected.filter((s) => !GRID_ITEMS.some((g) => g.name === s));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {GRID_ITEMS.map((item) => {
          const isSelected = selected.includes(item.name);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.name)}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition-colors ${
                isSelected
                  ? "border-[#4A7C59] bg-[#EBF2EC]"
                  : "border-[#E2EBE3] bg-[#FAFBF9] hover:bg-[#EBF2EC]/50"
              }`}
            >
              <span className="text-2xl">{item.emoji || "🍽️"}</span>
              <span className="w-full truncate text-center text-[10px] font-medium text-[#1C2B1E]">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
          }}
          placeholder="Ajouter un aliment…"
          className="flex-1 rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm text-[#1C2B1E] outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          className="flex items-center justify-center rounded-2xl bg-[#EBF2EC] px-4 text-[#4A7C59] transition-colors hover:bg-[#4A7C59] hover:text-white"
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customItems.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 rounded-full border border-[#4A7C59] bg-[#EBF2EC] px-3 py-1.5 text-sm font-medium text-[#4A7C59]"
            >
              {name}
              <button type="button" onClick={() => onToggle(name)} className="rounded-full p-0.5 hover:bg-black/5">
                <XIcon size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
