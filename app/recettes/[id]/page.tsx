"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  EditIcon,
  FlameIcon,
  MoreIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { RecipeFormModal } from "@/components/recipe-form-modal";
import {
  deleteRecipe,
  getRecipeById,
  updateRecipe,
  type NewRecipeInput,
  type Recipe,
} from "@/lib/recipes";

const FAVORITES_KEY = "my-kitchen-favorite-recipes";

function removeFromFavorites(id: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed)) return;
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(parsed.filter((favId) => favId !== id)),
    );
  } catch {
    /* ignore */
  }
}

function RecipeActionsMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setMenuOpen(false);
      setMenuPos(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMenuPos(null);
      }
    };
    const close = () => {
      setMenuOpen(false);
      setMenuPos(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [menuOpen]);

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPos(null);
      return;
    }
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setMenuOpen(true);
  }

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1C2B1E] transition-transform active:scale-95"
        style={{
          background: menuOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Options de la recette"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <MoreIcon size={16} />
      </button>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[60] min-w-[200px] overflow-hidden rounded-2xl py-1.5"
            style={{
              top: menuPos.top,
              right: menuPos.right,
              background: "#FFFFFF",
              boxShadow: "0 10px 36px rgba(20,31,22,0.16)",
              border: "1px solid #E2EBE3",
            }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setMenuPos(null);
                onEdit();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
            >
              <span className="text-[#4A7C59]">
                <EditIcon size={15} />
              </span>
              Modifier la recette
            </button>
            <div className="mx-3 my-1 h-px bg-[#F0F4EF]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setMenuPos(null);
                onDelete();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
            >
              <TrashIcon size={15} />
              Supprimer la recette
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function RecipeStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const recipeId = Number(id);
  const [recipe, setRecipe] = useState<Recipe | undefined>(() => getRecipeById(recipeId));
  const [showEditModal, setShowEditModal] = useState(false);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [tab, setTab] = useState<"ingredients" | "steps">("steps");

  useEffect(() => {
    setRecipe(getRecipeById(recipeId));
  }, [recipeId]);

  const handleUpdate = (input: NewRecipeInput) => {
    const updated = updateRecipe(recipeId, input);
    setRecipe(updated);
    setDoneSteps(new Set());
    setCurrentStep(0);
  };

  const handleDelete = () => {
    const title = recipe?.title ?? "cette recette";
    const confirmed = window.confirm(
      `Supprimer « ${title} » ? Cette action est définitive.`,
    );
    if (!confirmed) return;
    deleteRecipe(recipeId);
    removeFromFavorites(recipeId);
    router.push("/recettes");
  };

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F8F3] px-6">
        <p className="font-lora text-lg font-bold text-[#1C2B1E]">Recette introuvable</p>
        <Link href="/recettes" className="mt-4 text-sm font-semibold text-[#4A7C59]">
          Retour aux recettes
        </Link>
      </div>
    );
  }

  const total = recipe.steps.length;
  const doneCount = doneSteps.size;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;
  const allDone = doneCount === total;

  const toggleStep = (index: number) => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setCurrentStep(index);
  };

  const goNext = () => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    if (currentStep < total - 1) setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="relative mx-auto max-w-md overflow-hidden sm:max-w-lg">
        <div className="relative h-64 bg-[#D4EDD9] sm:h-72">
          {recipe.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🍽️</div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(28,43,30,0.72) 0%, rgba(28,43,30,0.15) 45%, transparent 100%)",
            }}
          />

          <Link
            href="/recettes"
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-[#1C2B1E] transition-transform active:scale-95"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={18} strokeWidth={2.4} />
          </Link>

          <RecipeActionsMenu
            onEdit={() => setShowEditModal(true)}
            onDelete={handleDelete}
          />

          {recipe.tagLabel && (
            <div className="absolute top-4 right-16 z-10 rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-wide text-white">
              {recipe.tagLabel}
            </div>
          )}

          <div className="absolute right-0 bottom-0 left-0 px-5 pb-5">
            <h1 className="font-lora text-2xl leading-tight font-bold text-white">{recipe.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-white/85">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <ClockIcon size={14} strokeWidth={2.4} /> {recipe.time}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <FlameIcon size={14} /> {recipe.calories} kcal
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <UsersIcon size={14} /> {recipe.servings} pers.
              </span>
              <span className="rounded-lg bg-white/15 px-2 py-0.5 text-xs font-bold backdrop-blur-sm">
                {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

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
                  onClick={() => setTab(item.id)}
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
                  key={ing.name}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                  style={{
                    borderBottom: idx < recipe.ingredients.length - 1 ? "1px solid #F0F4EF" : "none",
                    background: missing ? "#FFF7ED" : undefined,
                  }}
                >
                  <span className="text-sm font-semibold text-[#1C2B1E]">{ing.name}</span>
                  <span className="shrink-0 text-right">
                    {missing ? (
                      <span className="mr-2 text-[11px] font-bold text-[#C2410C]">⚠️ Manque</span>
                    ) : null}
                    <span className="text-sm font-bold text-[#4A7C59]">{ing.amount}</span>
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
                      onClick={() => toggleStep(index)}
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
          <div
            className="fixed right-0 bottom-20 left-0 z-40 px-4"
          >
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
                  onClick={goNext}
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
      </div>

      {showEditModal && (
        <RecipeFormModal
          recipe={recipe}
          onSave={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
