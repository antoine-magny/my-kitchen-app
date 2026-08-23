"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { IngredientIcon } from "@/components/ingredient-icon";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import type { Recipe } from "@/lib/recipes";
import { formatAmount } from "@/lib/units";

type Tab = "ingredients" | "steps";

export function RecipeContent({
  recipe,
  tab,
  onTabChange,
  doneSteps,
  currentStep,
  onToggleStep,
  onNext,
}: {
  recipe: Recipe;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  doneSteps: Set<number>;
  currentStep: number;
  onToggleStep: (index: number) => void;
  onNext: () => void;
}) {
  const total = recipe.steps.length;
  const doneCount = doneSteps.size;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;
  const allDone = doneCount === total;

  return (
    <>
      <div className="px-5 pt-4 pb-28">
        <MissingIngredientsBadges names={recipe.missingIngredients} className="mb-4" />
        <div
          className="mb-5 overflow-hidden rounded-2xl"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 14px rgba(74,124,89,0.08)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <p className="text-xs font-bold tracking-wide text-[#7A8F7D] uppercase">Progression</p>
            <p className="text-xs font-bold text-[#4A7C59]">
              {doneCount}/{total} étapes
            </p>
          </div>
          <div className="mx-4 mb-3.5 h-2 overflow-hidden rounded-full bg-[#EBF2EC]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #4A7C59, #6FAE82)",
              }}
            />
          </div>
        </div>

        <div
          className="mb-5 flex rounded-2xl p-1"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(28,43,30,0.06)" }}
        >
          {(
            [
              { id: "steps" as const, label: "Étapes" },
              { id: "ingredients" as const, label: "Ingrédients" },
            ] as const
          ).map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
                style={{
                  background: active ? "#1C2B1E" : "transparent",
                  color: active ? "#FFFFFF" : "#7A8F7D",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "ingredients" ? (
          <div
            className="overflow-hidden rounded-3xl"
            style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
          >
            {recipe.ingredients.map((ing, idx) => {
              const missing = (recipe.missingIngredients ?? []).some(
                (name) => name.toLowerCase() === ing.name.toLowerCase(),
              );
              return (
                <div
                  key={`${ing.ingredientId}-${idx}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                  style={{
                    borderBottom: idx < recipe.ingredients.length - 1 ? "1px solid #F0F4EF" : "none",
                    background: missing ? "#FFF7ED" : undefined,
                  }}
                >
                  <span className="flex items-center text-sm font-semibold text-[#1C2B1E]">
                    {ing.icon && ing.icon !== "2205" && ing.icon !== "2753" && ing.icon !== "∅" ? (
                      <div className="mr-2 flex items-center justify-center">
                        <IngredientIcon iconHex={ing.icon} size={20} />
                      </div>
                    ) : null}
                    {ing.name}
                  </span>
                  <span className="shrink-0 text-right">
                    {missing ? (
                      <span className="mr-2 text-[11px] font-bold text-[#C2410C]">⚠️ Manque</span>
                    ) : null}
                    <span className="text-sm font-bold text-[#4A7C59]">
                      {formatAmount(ing.amount, ing.unit)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {recipe.steps.map((step, index) => {
              const done = doneSteps.has(index);
              const current = currentStep === index;
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => onToggleStep(index)}
                    className="w-full rounded-3xl px-4 py-4 text-left transition-all active:scale-[0.99]"
                    style={{
                      background: done ? "#EBF2EC" : "#FFFFFF",
                      boxShadow: current
                        ? "0 0 0 2px #4A7C59, 0 6px 24px rgba(74,124,89,0.14)"
                        : "0 3px 16px rgba(74,124,89,0.08)",
                    }}
                  >
                    <div className="flex gap-3.5">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors"
                        style={{
                          background: done ? "#4A7C59" : current ? "#1C2B1E" : "#EBF2EC",
                          color: done || current ? "#FFFFFF" : "#4A7C59",
                        }}
                      >
                        {done ? <CheckIcon size={14} strokeWidth={3} /> : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h2
                            className={`font-lora text-base leading-snug font-bold ${done ? "text-[#4A7C59] line-through decoration-[#4A7C59]/40" : "text-[#1C2B1E]"}`}
                          >
                            {step.title}
                          </h2>
                          {step.duration && (
                            <span className="shrink-0 rounded-lg bg-[#F0F4EF] px-2 py-0.5 text-[11px] font-bold text-[#7A8F7D]">
                              {step.duration}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed font-medium ${done ? "text-[#7A8F7D]" : "text-[#5A6E5C]"}`}>
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {tab === "steps" && (
        <div className="fixed right-0 bottom-20 left-0 z-40 px-4">
          <div
            className="mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 sm:max-w-lg"
            style={{
              background: "rgba(28,43,30,0.94)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(28,43,30,0.28)",
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-white/55 uppercase">
                {allDone ? "Terminé" : `Étape ${currentStep + 1} sur ${total}`}
              </p>
              <p className="truncate text-sm font-bold text-white">
                {allDone ? "Bravo, recette terminée !" : recipe.steps[currentStep]?.title}
              </p>
            </div>
            {!allDone ? (
              <button
                type="button"
                onClick={onNext}
                className="shrink-0 rounded-xl bg-[#4A7C59] px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
              >
                {currentStep === total - 1 ? "Terminer" : "Suivant"}
              </button>
            ) : (
              <Link
                href="/recettes"
                className="shrink-0 rounded-xl bg-[#4A7C59] px-4 py-2.5 text-sm font-bold text-white"
              >
                OK
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
