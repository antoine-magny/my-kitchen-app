"use client";

import { useMemo, useState } from "react";
import { ChartIcon, ChevronRightIcon } from "@/components/icons";
import { StatsModal } from "@/components/parametres/stats-modal";
import { StatsTopFoods } from "@/components/parametres/stats-top-foods";
import { buildTopFoods, buildWeeklyHighlights } from "@/lib/nutrition-insights";
import { useNutritionStats } from "@/lib/use-nutrition-stats";

const TOP_FOODS_WINDOW_DAYS = 30;

export function StatsCard() {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const stats = useNutritionStats();

  const highlights = useMemo(() => buildWeeklyHighlights(stats.history), [stats.history]);
  const topFoods = useMemo(
    () => buildTopFoods(stats.history, TOP_FOODS_WINDOW_DAYS),
    [stats.history],
  );

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      <button
        type="button"
        onClick={() => setIsStatsOpen(true)}
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#F7FAF7] active:bg-[#EDF3EC] cursor-pointer"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
        >
          <ChartIcon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#1C2B1E]">📊 Voir mes statistiques</span>
          <span className="mt-0.5 block text-xs font-medium text-[#7A8F7D]">
            Calories et protéines par semaine ou par mois, diversité, top recettes…
          </span>
        </span>
        <span className="shrink-0 text-[#7A8F7D]">
          <ChevronRightIcon size={16} />
        </span>
      </button>

      <div className="h-px bg-[#F0F4EF]" />

      <div className="grid grid-cols-3">
        {highlights.map((stat, idx) => (
          <div
            key={stat.label}
            className="px-1.5 py-3 text-center sm:px-3 sm:py-4"
            style={{ borderLeft: idx > 0 ? "1px solid #F0F4EF" : "none" }}
          >
            <p className="font-lora text-base leading-none font-bold text-[#2E5B3E] sm:text-lg">
              {stats.ready ? stat.value : "—"}
            </p>
            <p className="mt-1 text-[10px] leading-tight font-medium text-[#7A8F7D] sm:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="h-px bg-[#F0F4EF]" />

      <StatsTopFoods foods={topFoods} windowDays={TOP_FOODS_WINDOW_DAYS} variant="plain" />

      {isStatsOpen && <StatsModal onClose={() => setIsStatsOpen(false)} stats={stats} />}
    </div>
  );
}
