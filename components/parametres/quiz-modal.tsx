"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon } from "@/components/icons";
import { UNIQUE_EMOJI_INGREDIENTS } from "@/lib/ingredients";
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

// ─── Props ──────────────────────────────────────────────────────────────────

type QuizModalProps = {
  onComplete: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
  initialAnswers?: Partial<QuizAnswers>;
};

// ─── Constantes internes ────────────────────────────────────────────────────

const COMMON_ALLERGIES = [
  "Gluten", "Lactose", "Arachides", "Fruits à coque",
  "Œufs", "Soja", "Fruits de mer", "Sésame",
];

const INGREDIENT_CATEGORIES = ["vegetables", "fruits", "proteins", "starches"] as const;
const GRID_ITEMS = UNIQUE_EMOJI_INGREDIENTS.filter(
  (item) => item.category && (INGREDIENT_CATEGORIES as readonly string[]).includes(item.category),
).slice(0, 40);

// ─── Sous-composant : saisie de tags ────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const value = raw.trim();
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onChange([...tags, value]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-sm font-medium text-[#B91C1C]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-black/5"
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(input); }
        }}
        onBlur={() => input && addTag(input)}
        placeholder="Ajouter une allergie…"
        className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-[#1C2B1E] outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
      />

      <div>
        <p className="mb-2 text-sm font-medium text-[#7A8F7D]">Suggestions :</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.filter((a) => !tags.includes(a)).map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => addTag(allergy)}
              className="rounded-full border border-[#E2EBE3] bg-white px-3 py-1.5 text-sm text-[#7A8F7D] hover:border-[#4A7C59] hover:text-[#4A7C59]"
            >
              + {allergy}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composant : grille d'ingrédients ──────────────────────────────────

function IngredientGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleAddCustom = () => {
    const value = input.trim();
    if (value && !selected.includes(value)) onToggle(value);
    setInput("");
  };

  const customItems = selected.filter((s) => !GRID_ITEMS.some((g) => g.name === s));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {GRID_ITEMS.map((item) => {
          const isSelected = selected.includes(item.name);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.name)}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition-colors ${
                isSelected
                  ? "border-[#4A7C59] bg-[#EBF2EC]"
                  : "border-[#E2EBE3] bg-[#FAFBF9] hover:bg-[#EBF2EC]/50"
              }`}
            >
              <span className="text-2xl">{item.emoji || "🍽️"}</span>
              <span className="w-full truncate text-center text-[10px] font-medium text-[#1C2B1E]">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
          }}
          placeholder="Ajouter un aliment…"
          className="flex-1 rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm text-[#1C2B1E] outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          className="flex items-center justify-center rounded-2xl bg-[#EBF2EC] px-4 text-[#4A7C59] transition-colors hover:bg-[#4A7C59] hover:text-white"
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customItems.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 rounded-full border border-[#4A7C59] bg-[#EBF2EC] px-3 py-1.5 text-sm font-medium text-[#4A7C59]"
            >
              {name}
              <button type="button" onClick={() => onToggle(name)} className="rounded-full p-0.5 hover:bg-black/5">
                <XIcon size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sous-composant : sélection unique ──────────────────────────────────────

function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; emoji: string; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
              active
                ? "border-[#4A7C59] bg-[#EBF2EC]"
                : "border-[#E2EBE3] bg-white hover:border-[#4A7C59]/50 hover:bg-[#FAFBF9]"
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <div>
              <h4 className="font-semibold text-[#1C2B1E]">{option.label}</h4>
              {option.hint && <p className="mt-1 text-sm text-[#7A8F7D]">{option.hint}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

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
          <OptionList<DietType>
            options={DIET_OPTIONS}
            value={answers.diet}
            onChange={(diet) => setAnswers((a) => ({ ...a, diet }))}
          />
        );
      case "allergies":
        return (
          <TagInput
            tags={answers.allergyTags}
            onChange={(allergyTags) => setAnswers((a) => ({ ...a, allergyTags }))}
          />
        );
      case "favorites":
        return (
          <IngredientGrid
            selected={answers.favoriteTags}
            onToggle={(name) => toggleArrayItem("favoriteTags", name)}
          />
        );
      case "disliked":
        return (
          <IngredientGrid
            selected={answers.dislikedTags}
            onToggle={(name) => toggleArrayItem("dislikedTags", name)}
          />
        );
      case "goal":
        return (
          <OptionList<NutritionGoalId>
            options={NUTRITION_GOALS}
            value={answers.goal}
            onChange={(goal) => setAnswers((a) => ({ ...a, goal }))}
          />
        );
      case "level":
        return (
          <OptionList<CookingLevel>
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
          {/* Header */}
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

            {/* Barre de progression */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2EBE3]">
              <div
                className="h-full rounded-full bg-[#4A7C59] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-2">{renderContent()}</div>

          {/* Footer : navigation */}
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
