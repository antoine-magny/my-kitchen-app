import { dayKey, formatDayShortFr, sameDay } from "@/lib/date-paris";
import { type DayPlan } from "@/lib/planning";

interface DaySelectorProps {
  days: Date[];
  today: Date;
  selectedDay: Date;
  planForDay: (day: Date) => DayPlan;
  onSelectDay: (day: Date) => void;
}

function dayHasMeals(plan: DayPlan | undefined): boolean {
  if (!plan) return false;
  return plan.breakfast != null || plan.lunchId != null || plan.dinnerId != null;
}

export function DaySelector({
  days,
  today,
  selectedDay,
  planForDay,
  onSelectDay,
}: DaySelectorProps) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const selected = sameDay(day, selectedDay);
        const isToday = sameDay(day, today);
        const hasMeals = dayHasMeals(planForDay(day));
        return (
          <button
            key={dayKey(day)}
            type="button"
            onClick={() => onSelectDay(day)}
            className="flex w-[58px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-all active:scale-95"
            style={
              selected
                ? {
                    background: "linear-gradient(160deg, #2E5B3E, #4A7C59)",
                    boxShadow: "0 4px 14px rgba(46,91,62,0.28)",
                    color: "#fff",
                  }
                : {
                    background: "#FFFFFF",
                    boxShadow: "0 2px 10px rgba(74,124,89,0.08)",
                    border: "1.5px solid #E2EBE3",
                    color: "#1C2B1E",
                  }
            }
            aria-pressed={selected}
            aria-label={`${formatDayShortFr(day)} ${day.getUTCDate()}${isToday ? " (aujourd'hui)" : ""}`}
          >
            <span
              className={`text-[11px] font-semibold ${selected ? "text-white/80" : "text-[#7A8F7D]"}`}
            >
              {isToday ? "Auj." : formatDayShortFr(day)}
            </span>
            <span className="text-base font-extrabold leading-none">{day.getUTCDate()}</span>
            {hasMeals && (
              <span
                className="mt-0.5 h-1.5 w-1.5 rounded-full"
                style={{
                  background: selected ? "#A7F3D0" : "#4A7C59",
                  boxShadow: selected
                    ? "0 0 6px rgba(167,243,208,0.85)"
                    : "0 0 4px rgba(74,124,89,0.45)",
                }}
                aria-hidden
              />
            )}
            {!hasMeals && isToday && (
              <span
                className="mt-0.5 h-1 w-1 rounded-full"
                style={{ background: selected ? "#fff" : "#4A7C59" }}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
