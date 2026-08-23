import { CheckIcon, MinusIcon } from "@/components/icons";
import { MONTHS_FR, mealSlotTitle, type DayPlan, type MealSlot } from "@/lib/planning";

const MEAL_SLOTS: readonly MealSlot[] = ["breakfast", "lunch", "dinner"];

const MEAL_META: Record<MealSlot, { emoji: string; label: string }> = {
  breakfast: { emoji: "🍳", label: "Petit-déjeuner" },
  lunch: { emoji: "🥗", label: "Déjeuner" },
  dinner: { emoji: "🍲", label: "Dîner" },
};

const DAY_LONG = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export type MealKey = `${string}:${MealSlot}`;

export function mealKey(date: string, mealType: MealSlot): MealKey {
  return `${date}:${mealType}`;
}

export function formatDayHeader(day: Date, index: number): string {
  return `${DAY_LONG[index]} ${day.getUTCDate()} ${MONTHS_FR[day.getUTCMonth()]}`;
}

export function ExportCheckbox({
  checked,
  indeterminate,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label?: string;
}) {
  return (
    <span
      role="presentation"
      aria-hidden={!label}
      aria-label={label}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors"
      style={{
        background: checked || indeterminate ? "#2E5B3E" : "#FFFFFF",
        border: checked || indeterminate ? "1.5px solid #2E5B3E" : "1.5px solid #C8D5CA",
      }}
    >
      {(checked || indeterminate) &&
        (indeterminate ? (
          <MinusIcon size={12} className="text-white" strokeWidth={3} />
        ) : (
          <CheckIcon size={12} className="text-white" strokeWidth={3} />
        ))}
    </span>
  );
}

export function ExportDaySection({
  day,
  index,
  date,
  plan,
  selected,
  onToggleDay,
  onToggleMeal,
}: {
  day: Date;
  index: number;
  date: string;
  plan: DayPlan;
  selected: Set<MealKey>;
  onToggleDay: (date: string) => void;
  onToggleMeal: (key: MealKey) => void;
}) {
  const keys = MEAL_SLOTS.filter((slot) => mealSlotTitle(plan, slot)).map((slot) =>
    mealKey(date, slot),
  );
  const selectedInDay = keys.filter((k) => selected.has(k)).length;
  const dayChecked = selectedInDay === keys.length;
  const dayIndeterminate = selectedInDay > 0 && !dayChecked;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2EBE3] bg-white">
      <div className="flex items-center gap-3 border-b border-[#F0F4EF] px-4 py-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={dayIndeterminate ? "mixed" : dayChecked}
          aria-label={`Sélectionner ${formatDayHeader(day, index)}`}
          onClick={() => onToggleDay(date)}
          className="flex items-center gap-3"
        >
          <ExportCheckbox checked={dayChecked} indeterminate={dayIndeterminate} />
          <span className="text-sm font-bold text-[#1C2B1E]">{formatDayHeader(day, index)}</span>
        </button>
      </div>

      <ul className="divide-y divide-[#F0F4EF]">
        {MEAL_SLOTS.map((slot) => {
          const title = mealSlotTitle(plan, slot);
          const meta = MEAL_META[slot];
          if (!title) {
            return (
              <li key={slot} className="flex items-center gap-3 px-4 py-2.5 opacity-40">
                <div
                  className="h-5 w-5 shrink-0 rounded-md"
                  style={{ border: "1.5px solid #C8D5CA", background: "#F7F9F6" }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#7A8F7D]">
                    <span aria-hidden>{meta.emoji} </span>
                    {meta.label}
                  </p>
                  <p className="truncate text-xs text-[#A0B0A3]">Non planifié</p>
                </div>
              </li>
            );
          }

          const key = mealKey(date, slot);
          const isOn = selected.has(key);
          return (
            <li key={slot}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={() => onToggleMeal(key)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F7F9F6]"
              >
                <ExportCheckbox checked={isOn} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#7A8F7D]">
                    <span aria-hidden>{meta.emoji} </span>
                    {meta.label}
                  </p>
                  <p className="truncate text-sm font-bold text-[#1C2B1E]">{title}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { MEAL_SLOTS };
