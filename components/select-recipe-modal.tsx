"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ClockIcon, SearchIcon, XIcon } from "@/components/icons";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";
import { getAllRecipes, type Recipe } from "@/lib/recipes";

const SLOT_LABELS = {
  breakfast: "petit-déjeuner",
  lunch: "déjeuner",
  dinner: "dîner",
} as const;

export function SelectRecipeModal({
  slot,
  currentRecipeId,
  onSelect,
  onClose,
}: {
  slot: "breakfast" | "lunch" | "dinner";
  currentRecipeId: number | null;
  onSelect: (recipeId: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useLockBodyScroll();

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.tagLabel ?? "").toLowerCase().includes(q) ||
        (r.tag ?? "").toLowerCase().includes(q),
    );
  }, [recipes, query]);

  const title = currentRecipeId != null ? "Remplacer la recette" : "Choisir une recette";

  return (
    <div
      className={MODAL_OVERLAY_CLASS}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={MODAL_PANEL_CLASS}
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-recipe-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-5 py-4">
          <div>
            <h2 id="select-recipe-title" className="font-lora text-lg font-bold text-[#1C2B1E]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
              Pour le {SLOT_LABELS[slot]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_BTN_CLASS}
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="shrink-0 px-5 pt-4 pb-3">
          <div
            className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
            style={{
              background: "#FAFBF9",
              border: "1.5px solid #E2EBE3",
            }}
          >
            <span className="text-[#7A8F7D]">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une recette…"
              className="flex-1 bg-transparent text-base font-medium text-[#1C2B1E] outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-[#7A8F7D]">
              Aucune recette ne correspond.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map((recipe) => {
                const selected = recipe.id === currentRecipeId;
                return (
                  <li key={recipe.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(recipe.id)}
                      className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all active:scale-[0.99]"
                      style={{
                        background: selected ? "#EBF2EC" : "#FAFBF9",
                        border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                      }}
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#D4EDD9]">
                        {recipe.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={recipe.photo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#1C2B1E]">{recipe.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#7A8F7D]">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon size={12} />
                            {recipe.time}
                          </span>
                          <span>·</span>
                          <span>{recipe.calories} kcal</span>
                          <span>·</span>
                          <span>{recipe.proteins}g prot.</span>
                        </div>
                      </div>
                      {selected ? (
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: "#4A7C59" }}
                          aria-hidden
                        >
                          <CheckIcon size={14} />
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs font-bold text-[#4A7C59]">Choisir</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
