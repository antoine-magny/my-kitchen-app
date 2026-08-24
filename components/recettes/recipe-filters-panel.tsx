"use client";

import { XIcon } from "@/components/icons";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";
import {
  TIME_FILTERS,
  type TimeFilterId,
} from "@/lib/recipe-filters";
import {
  DIFFICULTIES,
  RECIPE_COST_LABELS,
  RECIPE_COSTS,
  type RecipeCost,
  type RecipeDifficulty,
} from "@/lib/recipes";

export function RecipeFiltersPanel({
  timeFilter,
  difficulties,
  costs,
  onTimeFilter,
  onToggleDifficulty,
  onToggleCost,
  onReset,
  onClose,
}: {
  timeFilter: TimeFilterId | null;
  difficulties: RecipeDifficulty[];
  costs: RecipeCost[];
  onTimeFilter: (id: TimeFilterId | null) => void;
  onToggleDifficulty: (value: RecipeDifficulty) => void;
  onToggleCost: (value: RecipeCost) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useLockBodyScroll();

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
        aria-labelledby="recipe-filters-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-5 py-4">
          <h2 id="recipe-filters-title" className="font-lora text-lg font-bold text-[#1C2B1E]">
            Filtres
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_BTN_CLASS}
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <fieldset>
            <legend className="mb-2.5 text-xs font-bold tracking-wide text-[#7A8F7D] uppercase">
              Temps de préparation
            </legend>
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map((item) => {
                const active = timeFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTimeFilter(active ? null : item.id)}
                    className="rounded-full px-3.5 py-2 text-sm font-bold transition-all"
                    style={{
                      background: active ? "#1C2B1E" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#4A7C59",
                      border: active ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-xs font-bold tracking-wide text-[#7A8F7D] uppercase">
              Difficulté
            </legend>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((item) => {
                const active = difficulties.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onToggleDifficulty(item)}
                    className="rounded-full px-3.5 py-2 text-sm font-bold transition-all"
                    style={{
                      background: active ? "#1C2B1E" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#4A7C59",
                      border: active ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-xs font-bold tracking-wide text-[#7A8F7D] uppercase">
              Coût
            </legend>
            <div className="flex flex-wrap gap-2">
              {RECIPE_COSTS.map((item) => {
                const active = costs.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onToggleCost(item)}
                    className="rounded-full px-3.5 py-2 text-sm font-bold transition-all"
                    style={{
                      background: active ? "#1C2B1E" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#4A7C59",
                      border: active ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
                    }}
                  >
                    {RECIPE_COST_LABELS[item]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#F0F4EF] px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-xl bg-[#EBF2EC] px-4 py-3 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary flex-1 rounded-xl px-4 py-3 text-sm font-bold"
          >
            Voir les recettes
          </button>
        </div>
      </div>
    </div>
  );
}
