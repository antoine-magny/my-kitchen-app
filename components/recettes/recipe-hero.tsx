"use client";

import Link from "next/link";
import { ChevronLeftIcon, ClockIcon, FlameIcon, UsersIcon } from "@/components/icons";
import { RecipeActionsMenu } from "@/components/recettes/recipe-actions-menu";
import { RecipeCostSymbol, RecipeDifficultyToques } from "@/components/recettes/recipe-symbols";
import { recipeBadgeLabels, type Recipe } from "@/lib/recipes";

export function RecipeHero({
  recipe,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badges = recipeBadgeLabels(recipe, 3);

  return (
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

      <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2 px-4 pt-4">
        <Link
          href="/recettes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#1C2B1E] transition-transform active:scale-95"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
          aria-label="Retour"
        >
          <ChevronLeftIcon size={18} strokeWidth={2.4} />
        </Link>

        {badges.length > 0 ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 self-center">
            {badges.map((label) => (
              <span
                key={label}
                className="max-w-full truncate rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-wide text-white"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <RecipeActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

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
          <RecipeDifficultyToques difficulty={recipe.difficulty} />
          <RecipeCostSymbol cost={recipe.cost} />
        </div>
      </div>
    </div>
  );
}
