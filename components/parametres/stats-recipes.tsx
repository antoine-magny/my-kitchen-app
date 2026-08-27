"use client";

import { calendarDateFromIso, formatWeekdayDayMonthFr } from "@/lib/date-paris";
import type { RecipeStats } from "@/lib/nutrition-insights";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatLastCooked(iso: string): string {
  const date = calendarDateFromIso(iso);
  return date ? formatWeekdayDayMonthFr(date) : iso;
}

export function StatsRecipes({ stats }: { stats: RecipeStats }) {
  const maxCount = Math.max(1, ...stats.top.map((recipe) => recipe.count));

  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
      <h3 className="mb-1 text-sm font-bold text-[#1C2B1E]">🍳 Recettes les plus réalisées</h3>
      <p className="mb-3 text-[10px] text-[#7A8F7D]">Sur les {stats.windowDays} derniers jours</p>

      {stats.top.length === 0 ? (
        <p className="text-[11px] text-[#7A8F7D]">
          Aucune recette réalisée pour le moment. Planifiez vos repas pour alimenter ce classement.
        </p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-3 gap-3">
            {[
              { value: String(stats.totalMeals), label: "repas au total" },
              { value: String(stats.distinctRecipes), label: "recettes différentes" },
              { value: `${stats.varietyPercent}%`, label: "de variété" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] p-2.5 text-center"
              >
                <p className="font-lora text-base font-bold text-[#2E5B3E]">{kpi.value}</p>
                <p className="mt-0.5 text-[10px] leading-tight font-medium text-[#7A8F7D]">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {stats.top.map((recipe, index) => (
              <div key={recipe.title} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center text-sm leading-none" aria-hidden>
                  {MEDALS[index] ?? `${index + 1}.`}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#1C2B1E]">{recipe.title}</p>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#F0F4EF]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.round((recipe.count / maxCount) * 100)}%`,
                        background: "linear-gradient(90deg, #4A7C59, #6FAE82)",
                      }}
                    />
                  </span>
                  <p className="mt-1 text-[10px] text-[#7A8F7D]">
                    Dernière fois : {formatLastCooked(recipe.lastIso)}
                  </p>
                </div>
                <div className="w-14 shrink-0 text-right">
                  <p className="text-xs font-bold text-[#2E5B3E]">
                    {recipe.count}×
                  </p>
                  <p className="text-[10px] text-[#7A8F7D]">{recipe.share}%</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
