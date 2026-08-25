"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, MinusIcon, PlusIcon, XIcon } from "@/components/icons";
import { IngredientIcon } from "@/components/ingredient-icon";
import { CenteredModal } from "@/components/ui/centered-modal";
import { MODAL_CLOSE_BTN_CLASS } from "@/components/ui/modal-layout";
import {
  consumeRecipeIngredients,
  findTodaySlotsForRecipe,
  loadFridgeInventory,
  matchRecipeIngredientsWithFridge,
  persistFridgeInventory,
  type FridgeDeductionPreview,
} from "@/lib/consume-recipe";
import { formatAmount, type UnitCode } from "@/lib/units";
import type { RecipeIngredient } from "@/types/inventory";

type RowState = FridgeDeductionPreview & { selected: boolean; suggestedDeduct: number };

function stepForUnit(unit: UnitCode): number {
  if (unit === "g" || unit === "ml") return 10;
  if (unit === "kg" || unit === "l") return 0.05;
  return 1;
}

function clampDeduct(amount: number, max: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.min(max, Math.round(amount * 1000) / 1000);
}

export function ConsumeRecipeBanner({
  plannedToday,
  onRemoveFromPlan,
  onDismiss,
}: {
  plannedToday: boolean;
  onRemoveFromPlan?: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-[#C8E0CF] bg-[#EBF2EC] px-4 py-3"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2E5C3A]">Frigo mis à jour !</p>
          {plannedToday ? (
            <p className="mt-1 text-sm font-medium text-[#5A6E5C]">
              Ce plat est au planning aujourd&apos;hui. Le retirer&nbsp;?
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-white/70"
          aria-label="Fermer"
        >
          <XIcon size={16} />
        </button>
      </div>
      {plannedToday && onRemoveFromPlan ? (
        <button
          type="button"
          onClick={onRemoveFromPlan}
          className="mt-3 w-full rounded-xl bg-[#4A7C59] px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
        >
          Retirer du planning
        </button>
      ) : null}
    </div>
  );
}

export function ConsumeRecipeModal({
  recipeId,
  recipeTitle,
  ingredients,
  onClose,
  onSuccess,
}: {
  recipeId: number;
  recipeTitle: string;
  ingredients: RecipeIngredient[];
  onClose: () => void;
  onSuccess: (info: { plannedToday: boolean }) => void;
}) {
  const [rows, setRows] = useState<RowState[] | null>(null);
  const [unmatchedNames, setUnmatchedNames] = useState<string[]>([]);

  useEffect(() => {
    const fridge = loadFridgeInventory();
    const match = matchRecipeIngredientsWithFridge(ingredients, fridge);
    setRows(
      match.deductions.map((row) => ({
        ...row,
        selected: true,
        suggestedDeduct: row.amountToDeduct,
      })),
    );
    setUnmatchedNames(match.unmatched.map((item) => item.name));
  }, [ingredients]);

  const selectedCount = useMemo(
    () => rows?.filter((row) => row.selected && row.amountToDeduct > 0).length ?? 0,
    [rows],
  );

  const updateRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => prev?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null);
  };

  const handleToggle = (row: RowState) => {
    if (row.selected) {
      updateRow(row.id, { selected: false, amountToDeduct: 0, remainingAfter: row.fridgeAmount });
      return;
    }
    const amountToDeduct = clampDeduct(row.suggestedDeduct, row.fridgeAmount);
    if (amountToDeduct <= 0) return;
    updateRow(row.id, {
      selected: true,
      amountToDeduct,
      remainingAfter: Math.round((row.fridgeAmount - amountToDeduct) * 1000) / 1000,
    });
  };

  const handleAdjust = (row: RowState, delta: number) => {
    const nextAmount = clampDeduct(row.amountToDeduct + delta, row.fridgeAmount);
    updateRow(row.id, {
      selected: nextAmount > 0,
      amountToDeduct: nextAmount,
      remainingAfter: Math.round((row.fridgeAmount - nextAmount) * 1000) / 1000,
    });
  };

  const handleConfirm = () => {
    const fridge = loadFridgeInventory();
    const itemsToDeduct = (rows ?? [])
      .filter((row) => row.selected && row.amountToDeduct > 0)
      .map((row) => ({ id: row.id, amountToDeduct: row.amountToDeduct }));
    const next = consumeRecipeIngredients(ingredients, itemsToDeduct, fridge, {
      recipeId,
      recipeTitle,
    });
    persistFridgeInventory(next);
    onSuccess({ plannedToday: findTodaySlotsForRecipe(recipeId).length > 0 });
    onClose();
  };

  return (
    <CenteredModal titleId="consume-recipe-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#4A7C59] uppercase">
            Consommation
          </p>
          <h2 id="consume-recipe-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
            Mettre à jour le frigo
          </h2>
          <p className="mt-1 text-sm font-medium text-[#7A8F7D]">
            {recipeTitle} — décochez ou ajustez ce que vous n&apos;avez pas utilisé.
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        {rows == null ? (
          <p className="py-6 text-center text-sm font-medium text-[#7A8F7D]">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl bg-[#F0F4EF] px-4 py-5 text-sm font-medium text-[#5A6E5C]">
            Aucun ingrédient de cette recette n&apos;a été trouvé dans le frigo.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-[#E2EBE3]">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className="flex items-start gap-3 px-3 py-3"
                style={{
                  borderBottom: index < rows.length - 1 ? "1px solid #F0F4EF" : "none",
                  opacity: row.selected ? 1 : 0.55,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(row)}
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95"
                  style={{
                    background: row.selected ? "#4A7C59" : "#F0F4EF",
                    color: row.selected ? "#fff" : "transparent",
                    border: row.selected ? "none" : "1.5px solid #C8E0CF",
                  }}
                  aria-label={
                    row.selected ? `Ne pas déduire ${row.name}` : `Déduire ${row.name}`
                  }
                  aria-pressed={row.selected}
                >
                  <CheckIcon size={14} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <IngredientIcon
                      name={row.name}
                      iconHex={row.icon}
                      size={20}
                      hideIfEmpty
                    />
                    <p className="truncate text-sm font-semibold text-[#1C2B1E]">{row.name}</p>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
                    {row.remainingAfter <= 0
                      ? "sera retiré du frigo"
                      : `reste ${formatAmount(row.remainingAfter, row.unit)}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdjust(row, -stepForUnit(row.unit))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F4EF] text-[#4A7C59] transition-all active:scale-95 disabled:opacity-40"
                      aria-label={`Diminuer ${row.name}`}
                      disabled={!row.selected || row.amountToDeduct <= 0}
                    >
                      <MinusIcon size={14} />
                    </button>
                    <p className="min-w-[4.5rem] text-center text-sm font-bold text-[#4A7C59]">
                      −{formatAmount(row.amountToDeduct, row.unit)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAdjust(row, stepForUnit(row.unit))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F4EF] text-[#4A7C59] transition-all active:scale-95 disabled:opacity-40"
                      aria-label={`Augmenter ${row.name}`}
                      disabled={!row.selected || row.amountToDeduct >= row.fridgeAmount}
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {unmatchedNames.length > 0 ? (
          <p className="mt-3 text-xs font-medium text-[#7A8F7D]">
            Non déduits : {unmatchedNames.join(", ")}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3 px-5 pt-2 pb-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] active:scale-[0.98]"
          style={{ border: "1.5px solid #E2EBE3" }}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={rows == null}
          className="flex-[1.4] rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
            boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
          }}
        >
          {selectedCount > 0 ? "Confirmer et vider du frigo" : "Confirmer"}
        </button>
      </div>
    </CenteredModal>
  );
}
