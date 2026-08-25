"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
  ConsumeRecipeBanner,
  ConsumeRecipeModal,
} from "@/components/recettes/consume-recipe-modal";
import { RecipeContent } from "@/components/recettes/recipe-content";
import { RecipeHero } from "@/components/recettes/recipe-hero";
import { RecipeFormModal } from "@/components/recipe-form-modal";
import { removeRecipeFromTodayPlan } from "@/lib/consume-recipe";
import { removeFromFavorites } from "@/lib/favorites";
import {
  deleteRecipe,
  getRecipeById,
  updateRecipe,
  updateRecipeTags,
  type NewRecipeInput,
  type Recipe,
  type RecipeTag,
} from "@/lib/recipes";

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
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [banner, setBanner] = useState<{ plannedToday: boolean } | null>(null);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [tab, setTab] = useState<"ingredients" | "steps">("steps");

  useEffect(() => {
    setRecipe(getRecipeById(recipeId));
  }, [recipeId]);

  useEffect(() => {
    if (!banner || banner.plannedToday) return;
    const timer = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const handleUpdate = (input: NewRecipeInput) => {
    const updated = updateRecipe(recipeId, input);
    setRecipe(updated);
    setDoneSteps(new Set());
    setCurrentStep(0);
  };

  const handleTagsChange = (tags: RecipeTag[]) => {
    const updated = updateRecipeTags(recipeId, tags);
    if (updated) setRecipe(updated);
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
    const isLastStep = currentStep >= recipe.steps.length - 1;
    setDoneSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    if (!isLastStep) setCurrentStep(currentStep + 1);
    else setShowConsumeModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="relative mx-auto max-w-md overflow-hidden sm:max-w-2xl lg:max-w-5xl">
        <RecipeHero
          recipe={recipe}
          onEdit={() => setShowEditModal(true)}
          onDelete={handleDelete}
          onTagsChange={handleTagsChange}
        />
        {banner ? (
          <div className="px-5 pt-4">
            <ConsumeRecipeBanner
              plannedToday={banner.plannedToday}
              onDismiss={() => setBanner(null)}
              onRemoveFromPlan={
                banner.plannedToday
                  ? () => {
                      removeRecipeFromTodayPlan(recipe.id);
                      setBanner({ plannedToday: false });
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
        <RecipeContent
          recipe={recipe}
          tab={tab}
          onTabChange={setTab}
          doneSteps={doneSteps}
          currentStep={currentStep}
          onToggleStep={toggleStep}
          onNext={goNext}
          onCooked={() => setShowConsumeModal(true)}
        />
      </div>

      {showEditModal && (
        <RecipeFormModal
          recipe={recipe}
          onSave={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {showConsumeModal && (
        <ConsumeRecipeModal
          recipeId={recipe.id}
          recipeTitle={recipe.title}
          ingredients={recipe.ingredients}
          onClose={() => setShowConsumeModal(false)}
          onSuccess={(info) => setBanner(info)}
        />
      )}
    </div>
  );
}
