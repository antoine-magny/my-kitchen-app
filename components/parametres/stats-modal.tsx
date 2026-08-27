"use client";

import { useMemo } from "react";
import { ChartIcon, XIcon } from "@/components/icons";
import { StatsDiversity } from "@/components/parametres/stats-diversity";
import { StatsNutritionChart } from "@/components/parametres/stats-nutrition-chart";
import { StatsRecipes } from "@/components/parametres/stats-recipes";
import { StatsTopFoods } from "@/components/parametres/stats-top-foods";
import { CenteredModal } from "@/components/ui/centered-modal";
import {
  buildDiversityStats,
  buildRecipeStats,
  buildTopFoods,
  buildWeeklyHighlights,
} from "@/lib/nutrition-insights";
import type { NutritionStatsData } from "@/lib/use-nutrition-stats";

const TOP_FOODS_WINDOW_DAYS = 30;

type StatsModalProps = {
  onClose: () => void;
  stats: NutritionStatsData;
};

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const { history, targets, ready } = stats;

  const highlights = useMemo(() => buildWeeklyHighlights(history), [history]);
  const diversity = useMemo(() => buildDiversityStats(history), [history]);
  const recipeStats = useMemo(() => buildRecipeStats(history), [history]);
  const topFoods = useMemo(() => buildTopFoods(history, TOP_FOODS_WINDOW_DAYS), [history]);

  return (
    <CenteredModal titleId="stats-modal-title" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
            >
              <ChartIcon size={20} />
            </div>
            <div>
              <h2 id="stats-modal-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
                Mes statistiques
              </h2>
              <p className="mt-0.5 text-xs text-[#7A8F7D]">
                Calculées sur votre planning, conservées 1 an
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E] cursor-pointer"
            aria-label="Fermer"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {highlights.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-3 text-center"
            >
              <p className="font-lora text-lg font-bold text-[#2E5B3E]">{ready ? stat.value : "—"}</p>
              <p className="mt-0.5 text-[10px] leading-tight font-medium text-[#7A8F7D]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <StatsNutritionChart history={history} targets={targets} />
        <StatsDiversity stats={diversity} />
        <StatsRecipes stats={recipeStats} />
        <StatsTopFoods foods={topFoods} windowDays={TOP_FOODS_WINDOW_DAYS} />

        <div className="flex justify-end border-t border-[#F0F4EF] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#4A7C59] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#3d6849] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </CenteredModal>
  );
}
