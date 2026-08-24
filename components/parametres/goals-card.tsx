"use client";

import { CheckIcon, ChevronRightIcon, Edit2Icon, SaveIcon } from "@/components/icons";
import { NUTRITION_GOALS, type NutritionGoalId } from "@/lib/profile";
import { useState } from "react";

type GoalsCardProps = {
  goal: NutritionGoalId;
  calories: number;
  proteins: number;
  onGoalChange: (goal: NutritionGoalId) => void;
  onCaloriesChange: (calories: number) => void;
  onProteinsChange: (proteins: number) => void;
};

export function GoalsCard({
  goal,
  calories,
  proteins,
  onGoalChange,
  onCaloriesChange,
  onProteinsChange,
}: GoalsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCalories, setDraftCalories] = useState(calories.toString());
  const [draftProteins, setDraftProteins] = useState(proteins.toString());

  const handleSave = () => {
    const c = parseInt(draftCalories, 10);
    const p = parseInt(draftProteins, 10);
    if (!isNaN(c) && c > 0) onCaloriesChange(c);
    if (!isNaN(p) && p > 0) onProteinsChange(p);
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl border border-[#E2EBE3] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#1C2B1E]">Objectif nutritionnel</h3>
          <p className="text-xs text-[#7A8F7D]">Oriente les recommandations de l'IA</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F4EF] text-lg">
          🎯
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        {NUTRITION_GOALS.map((g) => {
          const isActive = g.id === goal;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onGoalChange(g.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                isActive
                  ? "border-[#4A7C59] bg-[#EBF2EC]"
                  : "border-[#E2EBE3] bg-[#FAFBF9] hover:bg-[#EBF2EC]/50"
              }`}
            >
              <span className="text-xl">{g.emoji}</span>
              <div className="flex-1">
                <span className="block text-sm font-bold text-[#1C2B1E]">{g.label}</span>
                <span className="block text-xs text-[#7A8F7D]">{g.hint}</span>
              </div>
              {isActive && <CheckIcon size={20} className="text-[#4A7C59]" />}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#FAFBF9] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1C2B1E]">Cibles journalières</h4>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4A7C59] text-white"
            >
              <SaveIcon size={14} />
            </button>
          ) : (
            <button
              onClick={() => {
                setDraftCalories(calories.toString());
                setDraftProteins(proteins.toString());
                setIsEditing(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#7A8F7D] shadow-sm hover:text-[#4A7C59]"
            >
              <Edit2Icon size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E2EBE3] bg-white p-3">
            <span className="block text-[10px] font-bold tracking-wider text-[#7A8F7D] uppercase">
              Calories
            </span>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  value={draftCalories}
                  onChange={(e) => setDraftCalories(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-[#1C2B1E] outline-none"
                />
                <span className="text-xs text-[#7A8F7D]">kcal</span>
              </div>
            ) : (
              <span className="mt-1 block text-lg font-bold text-[#1C2B1E]">
                {calories} <span className="text-xs font-medium text-[#7A8F7D]">kcal</span>
              </span>
            )}
          </div>

          <div className="rounded-xl border border-[#E2EBE3] bg-white p-3">
            <span className="block text-[10px] font-bold tracking-wider text-[#7A8F7D] uppercase">
              Protéines
            </span>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  value={draftProteins}
                  onChange={(e) => setDraftProteins(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-[#1C2B1E] outline-none"
                />
                <span className="text-xs text-[#7A8F7D]">g</span>
              </div>
            ) : (
              <span className="mt-1 block text-lg font-bold text-[#1C2B1E]">
                {proteins} <span className="text-xs font-medium text-[#7A8F7D]">g</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
