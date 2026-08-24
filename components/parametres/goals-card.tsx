"use client";

import { CheckIcon, EditIcon, PlusIcon } from "@/components/icons";
import { CalcGoalsModal } from "@/components/parametres/calc-goals-modal";
import { NUTRITION_GOALS, type NutritionGoalId } from "@/lib/profile";
import { useState } from "react";

type GoalsCardProps = {
  goal: NutritionGoalId;
  calories: number;
  proteins: number;
  weightKg?: number;
  heightCm?: number;
  onGoalChange: (goal: NutritionGoalId) => void;
  onCaloriesChange: (calories: number) => void;
  onProteinsChange: (proteins: number) => void;
  onCalculatedTargets: (result: {
    calories: number;
    proteins: number;
    weightKg: number;
    heightCm: number;
  }) => void;
};

export function GoalsCard({
  goal,
  calories,
  proteins,
  weightKg,
  heightCm,
  onGoalChange,
  onCaloriesChange,
  onProteinsChange,
  onCalculatedTargets,
}: GoalsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
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
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-bold text-[#1C2B1E]">Cibles journalières</h4>
          <div className="flex flex-wrap items-center gap-1.5">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setCalcOpen(true)}
                className="flex h-7 items-center gap-1 rounded-full bg-[#4A7C59] px-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#3D6649]"
                title="Calculer les cibles selon le poids et la taille"
              >
                <PlusIcon size={12} />
                Calcul des cibles
              </button>
            )}
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="flex h-7 items-center gap-1 rounded-full bg-[#4A7C59] px-2.5 text-[11px] font-bold text-white"
              >
                <CheckIcon size={12} />
                Enregistrer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraftCalories(calories.toString());
                  setDraftProteins(proteins.toString());
                  setIsEditing(true);
                }}
                className="flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-bold text-[#7A8F7D] shadow-sm hover:text-[#4A7C59]"
                title="Modifier manuellement les calories et les protéines"
              >
                <EditIcon size={12} />
                Modification manuelle
              </button>
            )}
          </div>
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

      {calcOpen && (
        <CalcGoalsModal
          goal={goal}
          initialWeightKg={weightKg}
          initialHeightCm={heightCm}
          onConfirm={(result) => {
            onCalculatedTargets(result);
            setIsEditing(false);
            setCalcOpen(false);
          }}
          onClose={() => setCalcOpen(false)}
        />
      )}
    </div>
  );
}
