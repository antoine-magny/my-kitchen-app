import Link from "next/link";
import { MIN_USABLE_FRIDGE_ITEMS } from "@/lib/fridge";
import { MEAL_TYPE_LABELS, MEAL_TYPES, type MealType } from "@/lib/meal-types";

const inputClass =
  "w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]";
const inputStyle = { border: "1.5px solid #E2EBE3" } as const;
const labelClass = "mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]";

const OPTION_COUNTS = [1, 2, 3] as const;

export function GenerateFridgeForm({
  inventoryReady,
  fridgeBlocked,
  usableCount,
  targetDate,
  mealType,
  optionCount,
  error,
  onTargetDateChange,
  onMealTypeChange,
  onOptionCountChange,
}: {
  inventoryReady: boolean;
  fridgeBlocked: boolean;
  usableCount: number;
  targetDate: string;
  mealType: MealType;
  optionCount: (typeof OPTION_COUNTS)[number];
  error: string | null;
  onTargetDateChange: (value: string) => void;
  onMealTypeChange: (value: MealType) => void;
  onOptionCountChange: (value: (typeof OPTION_COUNTS)[number]) => void;
}) {
  return (
    <div className="space-y-4">
      {!inventoryReady ? (
        <p className="text-sm font-medium text-[#7A8F7D]">Vérification du frigo…</p>
      ) : fridgeBlocked ? (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
        >
          <p className="text-sm font-bold text-[#B91C1C]">
            Remplissez votre frigo pour utiliser cette fonctionnalité
          </p>
          <p className="mt-1 text-xs font-medium text-[#7A8F7D]">
            Au moins {MIN_USABLE_FRIDGE_ITEMS} ingrédients exploitables sont requis.{" "}
            <Link href="/frigo" className="font-bold text-[#4A7C59] underline-offset-2 hover:underline">
              Ouvrir le frigo
            </Link>
          </p>
        </div>
      ) : (
        <p className="text-xs font-semibold text-[#2E5C3A]">
          {usableCount} ingrédient{usableCount > 1 ? "s" : ""} exploitable
          {usableCount > 1 ? "s" : ""} dans le frigo
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="generate-target-date">
          Date du repas
        </label>
        <input
          id="generate-target-date"
          type="date"
          value={targetDate}
          onChange={(e) => onTargetDateChange(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <p className={labelClass}>Type de repas</p>
        <div className="grid grid-cols-3 gap-2">
          {MEAL_TYPES.map((type) => {
            const selected = mealType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onMealTypeChange(type)}
                className="rounded-xl px-2 py-2.5 text-xs font-bold transition-all"
                style={{
                  background: selected ? "#4A7C59" : "#FAFBF9",
                  color: selected ? "#FFFFFF" : "#1C2B1E",
                  border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                }}
              >
                {MEAL_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={labelClass}>Nombre d&apos;options</p>
        <div className="grid grid-cols-3 gap-2">
          {OPTION_COUNTS.map((count) => {
            const selected = optionCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onOptionCountChange(count)}
                className="rounded-xl px-2 py-2.5 text-xs font-bold transition-all"
                style={{
                  background: selected ? "#EBF2EC" : "#FAFBF9",
                  color: selected ? "#2E5C3A" : "#1C2B1E",
                  border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
                }}
              >
                Générer {count} option{count > 1 ? "s" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-center text-xs font-semibold text-[#C2410C]">{error}</p>}
    </div>
  );
}

export { OPTION_COUNTS };
