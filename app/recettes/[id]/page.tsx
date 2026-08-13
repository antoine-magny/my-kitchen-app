"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RecipeFormModal } from "@/components/add-recipe-modal";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import {
  deleteRecipe,
  getRecipeById,
  updateRecipe,
  type NewRecipeInput,
  type Recipe,
} from "@/lib/recipes";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

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
        <MoreIcon />
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
                <EditIcon />
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
              <TrashIcon />
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
            <BackIcon />
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
                <ClockIcon /> {recipe.time}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <FlameIcon /> {recipe.calories} kcal
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <UsersIcon /> {recipe.servings} pers.
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
                          {done ? <CheckIcon /> : index + 1}
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
