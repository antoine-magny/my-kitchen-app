"use client";

import { ChartIcon, XIcon } from "@/components/icons";
import { CenteredModal } from "@/components/ui/centered-modal";
import { TOP_CONSUMED_FOODS, WEEKLY_HIGHLIGHTS } from "@/lib/profile";
import {
  CALORIE_TARGET,
  DAILY_CALORIES,
  MACRO_BREAKDOWN,
  WEEKLY_TRENDS,
} from "@/lib/stats-data";

type StatsModalProps = {
  onClose: () => void;
};

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  const config = {
    up: { text: "↑", className: "text-[#16a34a] bg-[#dcfce7]" },
    down: { text: "↓", className: "text-[#dc2626] bg-[#fef2f2]" },
    stable: { text: "→", className: "text-[#7A8F7D] bg-[#F0F4EF]" },
  };
  const c = config[trend];
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${c.className}`}>
      {c.text}
    </span>
  );
}

export function StatsModal({ onClose }: StatsModalProps) {
  const maxCal = Math.max(...DAILY_CALORIES.map((d) => d.calories), CALORIE_TARGET);

  return (
    <CenteredModal titleId="stats-modal-title" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
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
              <p className="mt-0.5 text-xs text-[#7A8F7D]">Résumé de votre semaine</p>
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

        {/* Corps défilable */}
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          {/* Résumé hebdo */}
          <div className="grid grid-cols-3 gap-3">
            {WEEKLY_HIGHLIGHTS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-3 text-center"
              >
                <p className="font-lora text-lg font-bold text-[#2E5B3E]">{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-medium text-[#7A8F7D]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Graphe calories journalières */}
          <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-[#1C2B1E]">📊 Calories quotidiennes</h3>
            <div className="flex items-end gap-2">
              {DAILY_CALORIES.map((entry) => {
                const heightPercent = (entry.calories / maxCal) * 100;
                const isAboveTarget = entry.calories > CALORIE_TARGET;
                return (
                  <div key={entry.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-[#7A8F7D]">{entry.calories}</span>
                    <div className="w-full overflow-hidden rounded-lg bg-[#F0F4EF]" style={{ height: "100px" }}>
                      <div
                        className="w-full rounded-lg transition-all"
                        style={{
                          height: `${heightPercent}%`,
                          marginTop: `${100 - heightPercent}%`,
                          background: isAboveTarget
                            ? "linear-gradient(180deg, #e9a23b, #f0c674)"
                            : "linear-gradient(180deg, #4A7C59, #6FAE82)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A8F7D]">{entry.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#7A8F7D]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#4A7C59]" />
              Sous la cible ({CALORIE_TARGET} kcal)
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#e9a23b]" />
              Au-dessus
            </div>
          </div>

          {/* Répartition macronutriments */}
          <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-[#1C2B1E]">🥗 Macronutriments (moy./jour)</h3>
            <div className="flex flex-col gap-2.5">
              {MACRO_BREAKDOWN.map((macro) => (
                <div key={macro.label} className="flex items-center gap-2.5">
                  <span className="text-base" aria-hidden>{macro.emoji}</span>
                  <span className="w-20 shrink-0 text-xs font-bold text-[#1C2B1E]">{macro.label}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F4EF]">
                    <span
                      className="block h-full rounded-full transition-all"
                      style={{ width: `${macro.percent}%`, backgroundColor: macro.color }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right text-xs font-bold text-[#7A8F7D]">
                    {macro.grams}g ({macro.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top aliments consommés */}
          <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
              Top aliments · 30 jours
            </h3>
            <div className="flex flex-col gap-2.5">
              {TOP_CONSUMED_FOODS.map((food) => (
                <div key={food.label} className="flex items-center gap-2.5">
                  <span className="text-base leading-none" aria-hidden>{food.emoji}</span>
                  <span className="w-20 shrink-0 truncate text-xs font-bold text-[#1C2B1E]">{food.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F4EF]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${food.share}%`,
                        background: "linear-gradient(90deg, #4A7C59, #6FAE82)",
                      }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs font-bold text-[#7A8F7D]">{food.share}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tendances */}
          <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-[#1C2B1E]">📈 Tendances</h3>
            <div className="grid grid-cols-2 gap-3">
              {WEEKLY_TRENDS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] p-3"
                >
                  <span className="text-lg" aria-hidden>{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#1C2B1E]">{item.value} <span className="font-medium text-[#7A8F7D]">{item.label}</span></p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <TrendBadge trend={item.trend} />
                      <span className="text-[10px] text-[#7A8F7D]">{item.trendLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end border-t border-[#F0F4EF] pt-3">
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
