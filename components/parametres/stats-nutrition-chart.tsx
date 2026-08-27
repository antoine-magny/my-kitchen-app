"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { NutritionHistory } from "@/lib/nutrition-history";
import {
  buildNutritionPeriod,
  MIN_PERIOD_OFFSET,
  type PeriodMode,
} from "@/lib/nutrition-stats";

const CALORIE_FILL = "linear-gradient(180deg, #6FAE82, #4A7C59)";
const PROTEIN_FILL = "linear-gradient(180deg, #E9A23B, #C2853B)";

/** Marge minimale au-dessus de la cible pour que la ligne repère reste lisible. */
const MIN_CEILING_RATIO = 1.15;

type StatsNutritionChartProps = {
  history: NutritionHistory;
  targets: { calories: number; proteins: number };
};

function AverageTile({
  emoji,
  value,
  unit,
  target,
}: {
  emoji: string;
  value: number;
  unit: string;
  target: number;
}) {
  return (
    <div className="rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] p-3">
      <p className="text-[10px] font-medium text-[#7A8F7D]">
        <span aria-hidden>{emoji}</span> Moyenne / jour
      </p>
      <p className="font-lora text-lg font-bold text-[#2E5B3E]">
        {value.toLocaleString("fr-FR")} {unit}
      </p>
      <p className="text-[10px] text-[#7A8F7D]">Cible {target.toLocaleString("fr-FR")} {unit}</p>
    </div>
  );
}

export function StatsNutritionChart({ history, targets }: StatsNutritionChartProps) {
  const [mode, setMode] = useState<PeriodMode>("week");
  const [offset, setOffset] = useState(0);

  const period = useMemo(
    () => buildNutritionPeriod(history, mode, offset),
    [history, mode, offset],
  );

  const calorieTarget = Math.max(1, targets.calories);
  const proteinTarget = Math.max(1, targets.proteins);
  const ceiling = Math.max(
    MIN_CEILING_RATIO,
    ...period.bars.flatMap((bar) =>
      bar.hasData ? [bar.calories / calorieTarget, bar.proteins / proteinTarget] : [],
    ),
  );
  const barHeight = (value: number, target: number) =>
    value <= 0 ? 0 : Math.max(3, Math.min(100, (value / target / ceiling) * 100));

  const switchMode = (next: PeriodMode) => {
    setMode(next);
    setOffset(0);
  };

  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#1C2B1E]">📊 Calories & protéines</h3>
        <div className="flex shrink-0 rounded-full bg-[#F0F4EF] p-0.5">
          {(["week", "month"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              aria-pressed={mode === value}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                mode === value ? "bg-white text-[#2E5B3E] shadow-sm" : "text-[#7A8F7D]"
              }`}
            >
              {value === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOffset((current) => current - 1)}
          disabled={offset <= MIN_PERIOD_OFFSET[mode]}
          aria-label="Période précédente"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          <ChevronLeftIcon size={14} />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-[#1C2B1E]">
          {period.title}
        </p>
        <button
          type="button"
          onClick={() => setOffset((current) => current + 1)}
          disabled={offset >= 0}
          aria-label="Période suivante"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          <ChevronRightIcon size={14} />
        </button>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] border-b border-[#E2EBE3]" aria-hidden>
          <div
            className="absolute inset-x-0 border-t border-dashed border-[#C8D8CB]"
            style={{ bottom: `${(1 / ceiling) * 100}%` }}
          />
        </div>
        <div className="flex items-end gap-1.5">
          {period.bars.map((bar) => (
            <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="flex h-[120px] w-full items-end justify-center gap-[3px]"
                title={
                  bar.hasData
                    ? `${bar.calories.toLocaleString("fr-FR")} kcal · ${bar.proteins} g de protéines`
                    : "Aucun repas"
                }
              >
                <span
                  className="w-1/2 max-w-[14px] rounded-t-md transition-all"
                  style={{ height: `${barHeight(bar.calories, calorieTarget)}%`, background: CALORIE_FILL }}
                />
                <span
                  className="w-1/2 max-w-[14px] rounded-t-md transition-all"
                  style={{ height: `${barHeight(bar.proteins, proteinTarget)}%`, background: PROTEIN_FILL }}
                />
              </div>
              <span className="truncate text-[10px] font-bold text-[#5A6B5C]">{bar.label}</span>
              <span className="truncate text-[9px] text-[#7A8F7D]">{bar.caption}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#7A8F7D]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: CALORIE_FILL }} />
          Calories
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: PROTEIN_FILL }} />
          Protéines
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 border-t border-dashed border-[#C8D8CB]" />
          Cible quotidienne
        </span>
        {mode === "month" && <span>Chaque barre = moyenne journalière de la semaine</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <AverageTile emoji="🔥" value={period.avgCalories} unit="kcal" target={calorieTarget} />
        <AverageTile emoji="💪" value={period.avgProteins} unit="g" target={proteinTarget} />
      </div>
      <p className="mt-2 text-[10px] text-[#7A8F7D]">
        {period.daysWithData > 0
          ? `Moyennes calculées sur ${period.daysWithData} jour${period.daysWithData > 1 ? "s" : ""} renseigné${period.daysWithData > 1 ? "s" : ""}.`
          : "Aucun repas planifié sur cette période."}
      </p>
    </div>
  );
}
