"use client";

import { DERIVED_TAGS, RECIPE_TAG_LABELS, RECIPE_TAGS, type RecipeTag } from "@/lib/recipes";

export function RecipeTagPills({
  selected,
  onChange,
  exclude = DERIVED_TAGS,
}: {
  selected: RecipeTag[];
  onChange: (tags: RecipeTag[]) => void;
  exclude?: readonly RecipeTag[];
}) {
  const toggle = (tag: RecipeTag) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {RECIPE_TAGS.filter((tag) => !exclude.includes(tag)).map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className="rounded-full px-3 py-1.5 text-xs font-bold transition-all"
            aria-pressed={active}
            style={{
              background: active ? "#1C2B1E" : "#FFFFFF",
              color: active ? "#FFFFFF" : "#4A7C59",
              border: active ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
            }}
          >
            {RECIPE_TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}
