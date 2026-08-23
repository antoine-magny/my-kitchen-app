"use client";

import { useMemo, useState } from "react";
import { XIcon } from "@/components/icons";
import {
  ExportDaySection,
  MEAL_SLOTS,
  mealKey,
  type MealKey,
} from "@/components/planning/export-day-section";
import { addDays, dayKey } from "@/lib/date-paris";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";
import {
  mealSlotTitle,
  type DayPlan,
  type MealSlot,
  type SelectedMealTarget,
} from "@/lib/planning";

function parseMealKey(key: MealKey): SelectedMealTarget {
  const [date, mealType] = key.split(":") as [string, MealSlot];
  return { date, mealType };
}

export function ExportShoppingModal({
  weekStart,
  weekPlans,
  onClose,
  onConfirm,
}: {
  weekStart: Date;
  weekPlans: Record<string, DayPlan>;
  onClose: () => void;
  onConfirm: (selected: SelectedMealTarget[]) => void;
}) {
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const availableKeys = useMemo(() => {
    const keys: MealKey[] = [];
    for (const day of weekDays) {
      const date = dayKey(day);
      const plan = weekPlans[date];
      if (!plan) continue;
      for (const slot of MEAL_SLOTS) {
        if (mealSlotTitle(plan, slot)) keys.push(mealKey(date, slot));
      }
    }
    return keys;
  }, [weekDays, weekPlans]);

  const [selected, setSelected] = useState<Set<MealKey>>(() => new Set(availableKeys));

  useLockBodyScroll();

  function toggleMeal(key: MealKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function dayMealKeys(date: string): MealKey[] {
    return availableKeys.filter((key) => key.startsWith(`${date}:`));
  }

  function toggleDay(date: string) {
    const keys = dayMealKeys(date);
    if (keys.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = keys.every((k) => next.has(k));
      for (const k of keys) {
        if (allSelected) next.delete(k);
        else next.add(k);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(availableKeys));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  const selectedCount = selected.size;
  const allSelected = availableKeys.length > 0 && selectedCount === availableKeys.length;

  function handleExport() {
    if (selectedCount === 0) return;
    onConfirm([...selected].map(parseMealKey));
  }

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
        aria-labelledby="export-shopping-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-5 py-4">
          <h2 id="export-shopping-title" className="font-lora text-lg font-bold text-[#1C2B1E]">
            <span aria-hidden>🛒 </span>
            Exporter vers les courses
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex shrink-0 gap-2 border-b border-[#F0F4EF] px-5 py-3">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected || availableKeys.length === 0}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#2E5B3E] transition-colors hover:bg-[#EBF2EC] disabled:opacity-40"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={deselectAll}
            disabled={selectedCount === 0}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40"
          >
            Tout désélectionner
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4" style={{ background: "#F7F9F6" }}>
          {availableKeys.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-[#7A8F7D]">
              Aucun repas planifié cette semaine.
            </p>
          ) : (
            <div className="space-y-3">
              {weekDays.map((day, index) => {
                const date = dayKey(day);
                const plan = weekPlans[date];
                const keys = dayMealKeys(date);
                if (!plan || keys.length === 0) return null;

                return (
                  <ExportDaySection
                    key={date}
                    day={day}
                    index={index}
                    date={date}
                    plan={plan}
                    selected={selected}
                    onToggleDay={toggleDay}
                    onToggleMeal={toggleMeal}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t border-[#F0F4EF] px-5 py-4">
          <p className="text-center text-xs font-semibold text-[#7A8F7D]">
            {selectedCount === 0
              ? "Aucun repas sélectionné"
              : selectedCount === 1
                ? "1 repas sélectionné"
                : `${selectedCount} repas sélectionnés`}
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={selectedCount === 0}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exporter vers la liste de courses
          </button>
        </div>
      </div>
    </div>
  );
}
