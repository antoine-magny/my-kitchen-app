"use client";

import { useMemo, useState } from "react";
import { XIcon } from "@/components/icons";
import { CenteredModal } from "@/components/ui/centered-modal";
import type { NutritionGoalId } from "@/lib/profile";
import { NUTRITION_GOALS } from "@/lib/profile";
import {
  calculateDailyTargets,
  parseHeightCm,
  parseWeightKg,
} from "@/lib/nutrition-targets";

type CalcGoalsModalProps = {
  goal: NutritionGoalId;
  initialWeightKg?: number;
  initialHeightCm?: number;
  onConfirm: (result: {
    calories: number;
    proteins: number;
    weightKg: number;
    heightCm: number;
  }) => void;
  onClose: () => void;
};

export function CalcGoalsModal({
  goal,
  initialWeightKg,
  initialHeightCm,
  onConfirm,
  onClose,
}: CalcGoalsModalProps) {
  const [weight, setWeight] = useState(initialWeightKg?.toString() ?? "");
  const [height, setHeight] = useState(initialHeightCm?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const goalLabel = NUTRITION_GOALS.find((g) => g.id === goal)?.label ?? "Équilibre";

  const preview = useMemo(() => {
    const weightKg = parseWeightKg(weight);
    const heightCm = parseHeightCm(height);
    if (weightKg === null || heightCm === null) return null;
    return {
      weightKg,
      heightCm,
      ...calculateDailyTargets(weightKg, heightCm, goal),
    };
  }, [weight, height, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      setError("Indiquez un poids (kg) et une taille (cm) valides.");
      return;
    }
    onConfirm(preview);
  };

  return (
    <CenteredModal titleId="calc-goals-title" onClose={onClose} maxWidthClass="max-w-[380px]">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="calc-goals-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
              Calculer mes cibles
            </h2>
            <p className="mt-1 text-xs text-[#7A8F7D]">
              Estimation selon votre poids, votre taille et l&apos;objectif « {goalLabel} ».
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E]"
            aria-label="Fermer"
          >
            <XIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="calc-weight"
                className="mb-1.5 block text-[10px] font-bold tracking-wider text-[#7A8F7D] uppercase"
              >
                Poids
              </label>
              <div className="flex items-center rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2.5 focus-within:border-[#4A7C59] focus-within:ring-2 focus-within:ring-[#4A7C59]/20">
                <input
                  id="calc-weight"
                  type="number"
                  inputMode="decimal"
                  min={30}
                  max={250}
                  step={0.1}
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setError(null);
                  }}
                  placeholder="70"
                  autoFocus
                  className="w-full bg-transparent text-lg font-bold text-[#1C2B1E] outline-none placeholder:font-medium placeholder:text-[#C5D0C6]"
                />
                <span className="ml-1 text-xs font-medium text-[#7A8F7D]">kg</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="calc-height"
                className="mb-1.5 block text-[10px] font-bold tracking-wider text-[#7A8F7D] uppercase"
              >
                Taille
              </label>
              <div className="flex items-center rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2.5 focus-within:border-[#4A7C59] focus-within:ring-2 focus-within:ring-[#4A7C59]/20">
                <input
                  id="calc-height"
                  type="number"
                  inputMode="decimal"
                  min={120}
                  max={230}
                  step={1}
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setError(null);
                  }}
                  placeholder="175"
                  className="w-full bg-transparent text-lg font-bold text-[#1C2B1E] outline-none placeholder:font-medium placeholder:text-[#C5D0C6]"
                />
                <span className="ml-1 text-xs font-medium text-[#7A8F7D]">cm</span>
              </div>
            </div>
          </div>

          {preview ? (
            <div className="rounded-2xl bg-[#EBF2EC] p-3.5">
              <p className="mb-2 text-[10px] font-bold tracking-wider text-[#4A7C59] uppercase">
                Aperçu des cibles
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-bold text-[#1C2B1E]">
                  {preview.calories}{" "}
                  <span className="text-xs font-medium text-[#7A8F7D]">kcal</span>
                </p>
                <p className="text-sm font-bold text-[#1C2B1E]">
                  {preview.proteins}{" "}
                  <span className="text-xs font-medium text-[#7A8F7D]">g prot.</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-[#7A8F7D]">
              Saisissez votre poids et votre taille pour voir l&apos;estimation.
            </p>
          )}

          {error && (
            <p className="text-xs font-medium text-[#B91C1C]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!preview}
            className="flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
            }}
          >
            Appliquer ces cibles
          </button>
        </form>
      </div>
    </CenteredModal>
  );
}
