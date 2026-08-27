"use client";

import type { TopFood } from "@/lib/nutrition-insights";

const CONTAINER_CLASS = {
  card: "rounded-2xl border border-[#E2EBE3] bg-white p-4",
  plain: "px-5 py-4",
} as const;

export function StatsTopFoods({
  foods,
  windowDays,
  variant = "card",
}: {
  foods: TopFood[];
  windowDays: number;
  variant?: keyof typeof CONTAINER_CLASS;
}) {
  return (
    <div className={CONTAINER_CLASS[variant]}>
      <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
        Top aliments · {windowDays} jours
      </h3>
      {foods.length === 0 ? (
        <p className="text-[11px] text-[#7A8F7D]">Aucun ingrédient cuisiné sur cette période.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {foods.map((food) => (
            <div key={food.id} className="flex items-center gap-2.5">
              <span className="w-5 shrink-0 text-center text-base leading-none" aria-hidden>
                {food.emoji ?? "🍽️"}
              </span>
              <span
                className="w-28 shrink-0 truncate text-xs font-bold text-[#1C2B1E] sm:w-36"
                title={food.label}
              >
                {food.label}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F4EF]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${food.share}%`,
                    background: "linear-gradient(90deg, #4A7C59, #6FAE82)",
                  }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-xs font-bold text-[#7A8F7D]">
                {food.share}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
