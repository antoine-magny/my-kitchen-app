"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon, SpinnerIcon, XIcon } from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { isoDateFromCalendar } from "@/lib/date-paris";
import {
  countUsableFridgeItems,
  getFridgeSnapshot,
  MIN_USABLE_FRIDGE_ITEMS,
  type FridgeSnapshotItem,
} from "@/lib/fridge";
import type { GenerateFromFridgeResult } from "@/lib/generate-from-fridge";
import { MEAL_TYPE_LABELS, MEAL_TYPES, type MealType } from "@/lib/meal-types";
import { addCustomRecipe, type Recipe } from "@/lib/recipes";

const inputClass =
  "w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]";
const inputStyle = { border: "1.5px solid #E2EBE3" } as const;
const labelClass = "mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]";

const OPTION_COUNTS = [1, 2, 3] as const;

type InventoryState = {
  ready: boolean;
  items: FridgeSnapshotItem[];
  usableCount: number;
};

export function GenerateFromFridgeModal({
  defaultDate,
  defaultMealType = "lunch",
  onClose,
  onGenerated,
}: {
  defaultDate: Date;
  defaultMealType?: MealType;
  onClose: () => void;
  onGenerated: (payload: { dateIso: string; mealType: MealType; recipes: Recipe[] }) => void;
}) {
  const [targetDate, setTargetDate] = useState(() => isoDateFromCalendar(defaultDate));
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [optionCount, setOptionCount] = useState<(typeof OPTION_COUNTS)[number]>(2);
  const [inventory, setInventory] = useState<InventoryState>({
    ready: false,
    items: [],
    usableCount: 0,
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRecipes, setPreviewRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      let supabaseItems: FridgeSnapshotItem[] = [];
      try {
        const response = await fetch("/api/fridge-inventory");
        if (response.ok) {
          const data = (await response.json()) as { items?: FridgeSnapshotItem[] };
          supabaseItems = Array.isArray(data.items) ? data.items : [];
        }
      } catch {
        supabaseItems = [];
      }

      const localItems = getFridgeSnapshot();
      const chosen =
        countUsableFridgeItems(supabaseItems) >= MIN_USABLE_FRIDGE_ITEMS
          ? supabaseItems
          : localItems;

      if (!cancelled) {
        setInventory({
          ready: true,
          items: chosen,
          usableCount: countUsableFridgeItems(chosen),
        });
      }
    }

    void loadInventory();
    return () => {
      cancelled = true;
    };
  }, []);

  const fridgeBlocked = inventory.ready && inventory.usableCount < MIN_USABLE_FRIDGE_ITEMS;
  const canGenerate = inventory.ready && !fridgeBlocked && !generating && Boolean(targetDate);

  async function handleGenerate() {
    if (!canGenerate) return;
    setError(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-from-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: inventory.items,
          mode: "ai_create",
          mealCount: optionCount,
          mealType,
          targetDate,
          preferExpiring: true,
          excludeDesserts: mealType !== "breakfast",
        }),
      });

      const result = (await response.json()) as GenerateFromFridgeResult & { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Impossible de générer le menu.");
        return;
      }

      if (result.aiUnavailable || !result.suggestions.some((s) => s.source === "ai")) {
        setError(
          result.message?.includes("GEMINI_API_KEY")
            ? "Clé Gemini manquante ou invalide."
            : (result.message ?? "IA indisponible pour le moment."),
        );
        return;
      }

      const created: Recipe[] = [];
      for (const suggestion of result.suggestions) {
        if (suggestion.source === "ai" && suggestion.recipeDraft) {
          created.push(addCustomRecipe(suggestion.recipeDraft));
        }
      }

      if (created.length === 0) {
        setError(result.message ?? "Aucune recette générée.");
        return;
      }

      if (created.length === 1) {
        onGenerated({ dateIso: targetDate, mealType, recipes: created });
        return;
      }

      setPreviewRecipes(created);
      setSelectedRecipeId(null);
    } catch {
      setError("Impossible de générer le menu.");
    } finally {
      setGenerating(false);
    }
  }

  function confirmSelectedRecipe() {
    const recipe = previewRecipes?.find((item) => item.id === selectedRecipeId);
    if (!recipe) return;
    onGenerated({ dateIso: targetDate, mealType, recipes: [recipe] });
  }

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !generating) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-[85vh] w-full flex-col rounded-t-3xl sm:max-h-[88vh] sm:w-auto sm:min-w-[420px] sm:max-w-md sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-fridge-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-5 py-4">
          <div>
            <h2 id="generate-fridge-title" className="font-lora text-lg font-bold text-[#1C2B1E]">
              {previewRecipes ? "Choisissez une option" : "Générer selon mon frigo"}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
              {previewRecipes
                ? `${previewRecipes.length} propositions pour le ${MEAL_TYPE_LABELS[mealType].toLowerCase()}`
                : "Configurez le repas à inventer"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-50"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {previewRecipes ? (
            <ul className="space-y-2.5">
              {previewRecipes.map((recipe) => {
                const selected = recipe.id === selectedRecipeId;
                return (
                  <li key={recipe.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all active:scale-[0.99]"
                      style={{
                        background: selected ? "#EBF2EC" : "#FAFBF9",
                        border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1C2B1E]">{recipe.title}</p>
                        <p className="mt-1 text-xs font-medium text-[#7A8F7D]">
                          {recipe.time} · {recipe.calories} kcal · {recipe.proteins}g prot.
                        </p>
                        <MissingIngredientsBadges names={recipe.missingIngredients} className="mt-2" />
                      </div>
                      {selected ? (
                        <span
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: "#4A7C59" }}
                          aria-hidden
                        >
                          <CheckIcon size={14} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-4">
              {!inventory.ready ? (
                <p className="text-sm font-medium text-[#7A8F7D]">Vérification du frigo…</p>
              ) : fridgeBlocked ? (
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
                >
                  <p className="text-sm font-bold text-[#B91C1C]">
                    Remplissez votre frigo pour utiliser cette fonctionnalité
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#7A8F7D]">
                    Au moins {MIN_USABLE_FRIDGE_ITEMS} ingrédients exploitables sont requis.{" "}
                    <Link href="/frigo" className="font-bold text-[#4A7C59] underline-offset-2 hover:underline">
                      Ouvrir le frigo
                    </Link>
                  </p>
                </div>
              ) : (
                <p className="text-xs font-semibold text-[#2E5C3A]">
                  {inventory.usableCount} ingrédient{inventory.usableCount > 1 ? "s" : ""} exploitable
                  {inventory.usableCount > 1 ? "s" : ""} dans le frigo
                </p>
              )}

              <div>
                <label className={labelClass} htmlFor="generate-target-date">
                  Date du repas
                </label>
                <input
                  id="generate-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <p className={labelClass}>Type de repas</p>
                <div className="grid grid-cols-3 gap-2">
                  {MEAL_TYPES.map((type) => {
                    const selected = mealType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className="rounded-xl px-2 py-2.5 text-xs font-bold transition-all"
                        style={{
                          background: selected ? "#4A7C59" : "#FAFBF9",
                          color: selected ? "#FFFFFF" : "#1C2B1E",
                          border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                        }}
                      >
                        {MEAL_TYPE_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={labelClass}>Nombre d&apos;options</p>
                <div className="grid grid-cols-3 gap-2">
                  {OPTION_COUNTS.map((count) => {
                    const selected = optionCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setOptionCount(count)}
                        className="rounded-xl px-2 py-2.5 text-xs font-bold transition-all"
                        style={{
                          background: selected ? "#EBF2EC" : "#FAFBF9",
                          color: selected ? "#2E5C3A" : "#1C2B1E",
                          border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                        }}
                      >
                        Générer {count} option{count > 1 ? "s" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-center text-xs font-semibold text-[#C2410C]">{error}</p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#F0F4EF] px-5 py-4">
          {previewRecipes ? (
            <button
              type="button"
              onClick={confirmSelectedRecipe}
              disabled={selectedRecipeId == null}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Choisir
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={!canGenerate}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <SpinnerIcon size={16} />
                  Génération en cours…
                </>
              ) : (
                "Générer le menu"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
