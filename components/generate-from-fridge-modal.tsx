"use client";

import { useEffect, useState } from "react";
import { SpinnerIcon, XIcon } from "@/components/icons";
import {
  GenerateFridgeForm,
  OPTION_COUNTS,
} from "@/components/planning/generate-fridge-form";
import { GenerateFridgePreview } from "@/components/planning/generate-fridge-preview";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { isoDateFromCalendar } from "@/lib/date-paris";
import {
  countUsableFridgeItems,
  getFridgeSnapshot,
  MIN_USABLE_FRIDGE_ITEMS,
  type FridgeSnapshotItem,
} from "@/lib/fridge";
import type { GenerateFromFridgeResult } from "@/lib/generate-from-fridge";
import { MEAL_TYPE_LABELS, type MealType } from "@/lib/meal-types";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";
import { addCustomRecipe, type Recipe } from "@/lib/recipes";

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

  useLockBodyScroll();

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
      className={MODAL_OVERLAY_CLASS}
      onClick={(e) => {
        if (e.target === e.currentTarget && !generating) onClose();
      }}
    >
      <div
        className={MODAL_PANEL_CLASS}
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
            className={MODAL_CLOSE_BTN_CLASS}
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {previewRecipes ? (
            <GenerateFridgePreview
              recipes={previewRecipes}
              selectedRecipeId={selectedRecipeId}
              onSelect={setSelectedRecipeId}
            />
          ) : (
            <GenerateFridgeForm
              inventoryReady={inventory.ready}
              fridgeBlocked={fridgeBlocked}
              usableCount={inventory.usableCount}
              targetDate={targetDate}
              mealType={mealType}
              optionCount={optionCount}
              error={error}
              onTargetDateChange={setTargetDate}
              onMealTypeChange={setMealType}
              onOptionCountChange={setOptionCount}
            />
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
