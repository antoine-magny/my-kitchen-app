"use client";

import { useState } from "react";
import { DAILY_TARGETS, NUTRITION_GOALS, type NutritionGoalId } from "@/lib/profile";

export function GoalsCard() {
  const [goal, setGoal] = useState<NutritionGoalId>("balance");
  const [calories, setCalories] = useState(String(DAILY_TARGETS.calories));
  const [proteins, setProteins] = useState(String(DAILY_TARGETS.proteins));

  return (
    <div
      className="rounded-3xl px-5 py-4"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none" aria-hidden>
          🎯
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C2B1E]">Objectifs nutritionnels</p>
          <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
            Ajuste les portions et les recettes proposées
          </p>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {NUTRITION_GOALS.map((option) => {
          const active = option.id === goal;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setGoal(option.id)}
              aria-pressed={active}
              className={`rounded-2xl border px-2 py-3 text-center transition-all active:scale-95 ${
                active ? "border-[#4A7C59] bg-[#EBF2EC]" : "border-[#E2EBE3] bg-[#FAFBF9]"
              }`}
            >
              <span className="block text-lg leading-none" aria-hidden>
                {option.emoji}
              </span>
              <span
                className={`mt-1.5 block text-xs leading-tight font-bold ${
                  active ? "text-[#2E5C3A]" : "text-[#1C2B1E]"
                }`}
              >
                {option.label}
              </span>
              <span className="mt-0.5 block text-[10px] font-medium text-[#7A8F7D]">{option.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <TargetField label="Calories / jour" suffix="kcal" value={calories} onChange={setCalories} />
        <TargetField label="Protéines / jour" suffix="g" value={proteins} onChange={setProteins} />
      </div>
    </div>
  );
}

function TargetField({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#7A8F7D]">{label}</span>
      <span className="mt-1.5 flex items-center gap-1.5 rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-3.5 py-2.5">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          className="w-full min-w-0 bg-transparent text-sm font-bold text-[#1C2B1E] outline-none"
        />
        <span className="shrink-0 text-xs font-bold text-[#7A8F7D]">{suffix}</span>
      </span>
    </label>
  );
}
