"use client";

import Link from "next/link";
import { BookmarkIcon, ChevronRightIcon, ClockIcon, FlameIcon, ProteinIcon, StarIcon } from "@/components/icons";
import type { Recipe } from "@/lib/recipes";

export function TodayMealCard({
  recipe,
  saved,
  onToggleSaved,
}: {
  recipe?: Recipe;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <section className="fade-up mb-7" style={{ animationDelay: "0.08s" }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Au menu aujourd&apos;hui</h2>
        <Link href="/recettes" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
          Modifier <ChevronRightIcon size={16} />
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 6px 32px rgba(74,124,89,0.13)",
        }}
      >
        {recipe ? (
          <>
            <div className="relative h-52 bg-[#D4EDD9]">
              <Link href={`/recettes/${recipe.id}`} className="absolute inset-0 block">
                {recipe.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(28,43,30,0.55) 0%, transparent 55%)",
                  }}
                />
              </Link>
              <button
                type="button"
                onClick={onToggleSaved}
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-sm transition-all"
                style={{
                  background: saved ? "#4A7C59" : "rgba(255,255,255,0.82)",
                  color: saved ? "#fff" : "#4A7C59",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
                aria-label="Sauvegarder la recette"
              >
                <BookmarkIcon filled={saved} size={15} />
              </button>

              <div
                className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)" }}
              >
                <span className="text-[#4A7C59]">
                  <ClockIcon size={13} />
                </span>
                <span className="text-xs font-bold text-[#1C2B1E]">{recipe.time}</span>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-[#F59E0B]"><StarIcon size={12} /></span>
                <span className="text-[#F59E0B]"><StarIcon size={12} /></span>
                <span className="text-[#F59E0B]"><StarIcon size={12} /></span>
                <span className="text-[#F59E0B]"><StarIcon size={12} /></span>
                <span className="text-[#D1D5DB]"><StarIcon size={12} /></span>
                <span className="ml-1 text-xs font-medium text-[#7A8F7D]">
                  4.2 • {recipe.servings} pers.
                </span>
              </div>

              <Link href={`/recettes/${recipe.id}`}>
                <h3 className="font-lora mb-4 text-base leading-snug font-bold text-[#1C2B1E]">{recipe.title}</h3>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                  <span className="text-[#F97316]"><FlameIcon size={13} /></span>
                  <span className="text-xs font-bold text-[#C2410C]">{recipe.calories} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                  <span className="text-[#4A7C59]"><ProteinIcon size={13} /></span>
                  <span className="text-xs font-bold text-[#2E5C3A]">{recipe.proteins}g protéines</span>
                </div>
              </div>

              <Link
                href={`/recettes/${recipe.id}`}
                className="btn-primary mt-4 block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
              >
                Voir la recette complète
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF2EC] text-3xl">
              🍽️
            </div>
            <h3 className="font-lora mb-2 text-lg font-bold text-[#1C2B1E]">Aucun repas planifié</h3>
            <p className="mb-5 text-sm font-medium text-[#7A8F7D]">
              Rien n&apos;est prévu pour ce midi ou ce soir. Que diriez-vous de choisir une recette ?
            </p>
            <Link href="/planning" className="btn-primary w-full rounded-2xl px-6 py-3.5 text-sm font-bold">
              Planifier un repas
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
