"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import type { Recipe } from "@/lib/recipes";

export function RecipeStepsPanel({
  recipe,
  doneSteps,
  currentStep,
  onToggleStep,
}: {
  recipe: Recipe;
  doneSteps: Set<number>;
  currentStep: number;
  onToggleStep: (index: number) => void;
}) {
  return (
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
  );
}

export function RecipeStepBar({
  recipe,
  doneSteps,
  currentStep,
  onNext,
}: {
  recipe: Recipe;
  doneSteps: Set<number>;
  currentStep: number;
  onNext: () => void;
}) {
  const total = recipe.steps.length;
  const allDone = doneSteps.size === total;

  return (
    <div className="fixed right-0 bottom-[var(--nav-offset)] left-0 z-40 px-4 lg:left-[var(--sidebar-width)]">
      <div
        className="mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 sm:max-w-2xl lg:max-w-5xl"
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
  );
}
