"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllRecipes, type Recipe } from "@/lib/recipes";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
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
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-[85vh] w-full flex-col rounded-t-3xl sm:max-h-[88vh] sm:w-auto sm:min-w-[420px] sm:max-w-md sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
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
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
            aria-label="Fermer"
          >
            <XIcon />
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
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une recette…"
              className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
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
                            <ClockIcon />
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
                          <CheckIcon />
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
