import { formatDayShortFr } from "@/lib/date-paris";
import { MacroBar } from "@/components/planning/macro-bar";

export function PlanningGoals({
  selectedDay,
  calories,
  proteins,
  calorieGoal,
  proteinGoal,
}: {
  selectedDay: Date;
  calories: number;
  proteins: number;
  calorieGoal: number;
  proteinGoal: number;
}) {
  return (
    <section className="fade-up mb-5" style={{ animationDelay: "0.06s" }}>
      <div
        className="rounded-3xl px-5 py-4"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-lora text-base font-bold text-[#1C2B1E]">Objectifs du jour</h2>
          <span className="rounded-lg bg-[#EBF2EC] px-2.5 py-1 text-xs font-bold text-[#2E5C3A]">
            {formatDayShortFr(selectedDay)} {selectedDay.getUTCDate()}
          </span>
        </div>
        <div className="space-y-3.5">
          <MacroBar
            label="Calories"
            current={calories}
            target={calorieGoal}
            unit="kcal"
            color="linear-gradient(90deg, #F97316, #FB923C)"
            track="#FFF7ED"
          />
          <MacroBar
            label="Protéines"
            current={proteins}
            target={proteinGoal}
            unit="g"
            color="linear-gradient(90deg, #4A7C59, #6FAE82)"
            track="#EBF2EC"
          />
        </div>
      </div>
    </section>
  );
}
