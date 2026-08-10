"use client";

import Link from "next/link";
import { use, useState } from "react";
import { getRecipeById } from "@/lib/recipes";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
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

export default function RecipeStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const recipe = getRecipeById(Number(id));
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [tab, setTab] = useState<"ingredients" | "steps">("steps");

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(28,43,30,0.72) 0%, rgba(28,43,30,0.15) 45%, transparent 100%)",
            }}
          />

          <Link
            href="/recettes"
            className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl text-[#1C2B1E] transition-transform active:scale-95"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
            aria-label="Retour"
          >
            <BackIcon />
          </Link>

          {recipe.tagLabel && (
            <div className="absolute top-4 right-4 rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-wide text-white">
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
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={ing.name}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    borderBottom: idx < recipe.ingredients.length - 1 ? "1px solid #F0F4EF" : "none",
                  }}
                >
                  <span className="text-sm font-semibold text-[#1C2B1E]">{ing.name}</span>
                  <span className="text-sm font-bold text-[#4A7C59]">{ing.amount}</span>
                </div>
              ))}
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
    </div>
  );
}
