"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon } from "@/components/icons";
import { QuizIngredientGrid } from "@/components/parametres/quiz-ingredient-grid";
import { QuizOptionList } from "@/components/parametres/quiz-option-list";
import { QuizTagInput } from "@/components/parametres/quiz-tag-input";
import { KITCHEN_EQUIPMENT, NUTRITION_GOALS, type NutritionGoalId } from "@/lib/profile";
import type { CookingLevel, DietType, UserProfile } from "@/lib/profile-store";
import {
  COOKING_LEVEL_OPTIONS,
  DEFAULT_QUIZ_ANSWERS,
  DIET_OPTIONS,
  QUIZ_STEPS,
  quizAnswersToProfilePatch,
  type QuizAnswers,
} from "@/lib/quiz";

type QuizModalProps = {
  onComplete: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
  initialAnswers?: Partial<QuizAnswers>;
};

export function QuizModal({ onComplete, onClose, initialAnswers }: QuizModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(() => ({
    ...DEFAULT_QUIZ_ANSWERS,
    ...initialAnswers,
  }));

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const currentStep = QUIZ_STEPS[step];
  const isLast = step === QUIZ_STEPS.length - 1;
  const progress = ((step + 1) / QUIZ_STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onComplete(quizAnswersToProfilePatch(answers));
    } else {
      setStep((s) => s + 1);
    }
  };

  const toggleArrayItem = (field: "allergyTags" | "favoriteTags" | "dislikedTags" | "equipmentIds", value: string) => {
    setAnswers((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      };
    });
  };

  const renderContent = () => {
    switch (currentStep.id) {
      case "diet":
        return (
          <QuizOptionList<DietType>
            options={DIET_OPTIONS}
            value={answers.diet}
            onChange={(diet) => setAnswers((a) => ({ ...a, diet }))}
          />
        );
      case "allergies":
        return (
          <QuizTagInput
            tags={answers.allergyTags}
            onChange={(allergyTags) => setAnswers((a) => ({ ...a, allergyTags }))}
          />
        );
      case "favorites":
        return (
          <QuizIngredientGrid
            selected={answers.favoriteTags}
            onToggle={(name) => toggleArrayItem("favoriteTags", name)}
          />
        );
      case "disliked":
        return (
          <QuizIngredientGrid
            selected={answers.dislikedTags}
            onToggle={(name) => toggleArrayItem("dislikedTags", name)}
          />
        );
      case "goal":
        return (
          <QuizOptionList<NutritionGoalId>
            options={NUTRITION_GOALS}
            value={answers.goal}
            onChange={(goal) => setAnswers((a) => ({ ...a, goal }))}
          />
        );
      case "level":
        return (
          <QuizOptionList<CookingLevel>
            options={COOKING_LEVEL_OPTIONS}
            value={answers.cookingLevel}
            onChange={(cookingLevel) => setAnswers((a) => ({ ...a, cookingLevel }))}
          />
        );
      case "equipment":
        return (
          <div className="grid grid-cols-2 gap-3">
            {KITCHEN_EQUIPMENT.map((eq) => {
              const active = answers.equipmentIds.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleArrayItem("equipmentIds", eq.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    active
                      ? "border-[#4A7C59] bg-[#EBF2EC]"
                      : "border-[#E2EBE3] bg-white hover:border-[#4A7C59]/50 hover:bg-[#FAFBF9]"
                  }`}
                >
                  <span className="text-xl">{eq.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-[#1C2B1E]">{eq.label}</span>
                  {active ? (
                    <CheckIcon size={20} className="text-[#4A7C59]" />
                  ) : (
                    <PlusIcon size={20} className="text-[#7A8F7D]" />
                  )}
                </button>
              );
            })}
          </div>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(18, 28, 20, 0.65)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
        aria-hidden
      />

      <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4">
        <div className="scale-in pointer-events-auto relative flex max-h-[min(92dvh,40rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl border border-[#E2EBE3]/80 bg-white shadow-[0_24px_64px_rgba(20,31,22,0.24)]">
          <div className="flex-none px-6 pt-6 pb-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF2EC] text-xl">
                  {currentStep.emoji}
                </span>
                <div>
                  <h2 id="quiz-title" className="text-base font-bold text-[#1C2B1E]">{currentStep.title}</h2>
                  <p className="text-xs text-[#7A8F7D]">{currentStep.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFBF9] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E]"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2EBE3]">
              <div
                className="h-full rounded-full bg-[#4A7C59] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">{renderContent()}</div>

          <div className="flex flex-none items-center gap-3 px-6 pt-4 pb-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border-2 border-[#E2EBE3] text-[#1C2B1E] transition-colors hover:border-[#4A7C59] disabled:opacity-40 disabled:hover:border-[#E2EBE3]"
            >
              <ChevronLeftIcon size={24} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] font-semibold text-white transition-colors hover:bg-[#3d6649] active:scale-[0.98]"
            >
              {isLast ? (
                <>Terminer <CheckIcon size={20} /></>
              ) : (
                <>Suivant <ChevronRightIcon size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
