import { ChartIcon, ChevronRightIcon } from "@/components/icons";
import { TOP_CONSUMED_FOODS, WEEKLY_HIGHLIGHTS } from "@/lib/profile";

export function StatsCard() {
  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-[#F7FAF7]"
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
            Aliments les plus consommés, moyenne de calories par jour…
          </span>
        </span>
        <span className="shrink-0 text-[#7A8F7D]">
          <ChevronRightIcon size={16} />
        </span>
      </button>

      <div className="h-px bg-[#F0F4EF]" />

      <div className="grid grid-cols-3">
        {WEEKLY_HIGHLIGHTS.map((stat, idx) => (
          <div
            key={stat.label}
            className="px-1.5 py-3 text-center sm:px-3 sm:py-4"
            style={{ borderLeft: idx > 0 ? "1px solid #F0F4EF" : "none" }}
          >
            <p className="font-lora text-base leading-none font-bold text-[#2E5B3E] sm:text-lg">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] leading-tight font-medium text-[#7A8F7D] sm:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="h-px bg-[#F0F4EF]" />

      <div className="px-5 py-4">
        <p className="mb-3 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
          Top aliments · 30 jours
        </p>
        <div className="flex flex-col gap-2.5">
          {TOP_CONSUMED_FOODS.map((food) => (
            <div key={food.label} className="flex items-center gap-2.5">
              <span className="text-base leading-none" aria-hidden>
                {food.emoji}
              </span>
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
    </div>
  );
}
