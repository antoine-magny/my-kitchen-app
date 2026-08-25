"use client";

import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { RecipeIngredientsPanel } from "@/components/recettes/recipe-ingredients-panel";
import { RecipeStepBar, RecipeStepsPanel } from "@/components/recettes/recipe-steps-panel";
import type { Recipe } from "@/lib/recipes";

type Tab = "ingredients" | "steps";

export function RecipeContent({
  recipe,
  tab,
  onTabChange,
  doneSteps,
  currentStep,
  onToggleStep,
  onNext,
  onCooked,
}: {
  recipe: Recipe;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  doneSteps: Set<number>;
  currentStep: number;
  onToggleStep: (index: number) => void;
  onNext: () => void;
  onCooked?: () => void;
}) {
  const total = recipe.steps.length;
  const doneCount = doneSteps.size;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;
  const allDone = total > 0 && doneCount === total;
  const showInlineCook = Boolean(onCooked) && !(tab === "steps" && allDone);

  return (
    <>
      <div className="px-5 pt-4 pb-28 lg:pb-24">
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
          <RecipeIngredientsPanel recipe={recipe} />
        ) : (
          <RecipeStepsPanel
            recipe={recipe}
            doneSteps={doneSteps}
            currentStep={currentStep}
            onToggleStep={onToggleStep}
          />
        )}

        {showInlineCook ? (
          <button
            type="button"
            onClick={() => onCooked?.()}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.28)",
            }}
          >
            J&apos;ai cuisiné ce plat 🎉
          </button>
        ) : null}
      </div>

      {tab === "steps" && (
        <RecipeStepBar
          recipe={recipe}
          doneSteps={doneSteps}
          currentStep={currentStep}
          onNext={onNext}
          onCooked={onCooked}
        />
      )}
    </>
  );
}
