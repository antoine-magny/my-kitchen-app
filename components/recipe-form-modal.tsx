"use client";

import { FormFooter } from "@/components/recipe-form/form-footer";
import { RecipeFormShell } from "@/components/recipe-form/form-shell";
import { ImageSection } from "@/components/recipe-form/image-section";
import { RecipeIngredientsFields } from "@/components/recipe-form/recipe-ingredients-fields";
import { RecipeMetaFields } from "@/components/recipe-form/recipe-meta-fields";
import { StepsSection } from "@/components/recipe-form/steps-section";
import { useRecipeForm } from "@/components/recipe-form/use-recipe-form";
import type { NewRecipeInput, Recipe } from "@/lib/recipes";

export function RecipeFormModal({
  recipe,
  onSave,
  onClose,
}: {
  recipe?: Recipe;
  onSave: (input: NewRecipeInput) => void;
  onClose: () => void;
}) {
  const form = useRecipeForm({ recipe, onSave, onClose });

  return (
    <RecipeFormShell
      title={form.isEditing ? "Modifier la recette" : "Nouvelle recette"}
      onClose={onClose}
    >
      <form onSubmit={form.handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <ImageSection
            photo={form.photo}
            setPhoto={form.setPhoto}
            showUrlInput={form.showUrlInput}
            setShowUrlInput={form.setShowUrlInput}
            photoUrlDraft={form.photoUrlDraft}
            setPhotoUrlDraft={form.setPhotoUrlDraft}
            fileRef={form.fileRef}
            handleFileChange={form.handleFileChange}
            applyPhotoUrl={form.applyPhotoUrl}
          />

          <RecipeMetaFields
            timeMode="single"
            titleRef={form.titleRef}
            title={form.title} setTitle={form.setTitle}
            time={form.time} setTime={form.setTime}
            servings={form.servings} setServings={form.setServings}
            calories={form.calories} setCalories={form.setCalories}
            proteins={form.proteins} setProteins={form.setProteins}
            difficulty={form.difficulty} setDifficulty={form.setDifficulty}
            tags={form.tags} setTags={form.setTags}
            cost={form.cost} setCost={form.setCost}
          />

          <RecipeIngredientsFields
            ingredients={form.ingredients}
            setIngredients={form.setIngredients}
            updateIngredient={form.updateIngredient}
            namePlaceholder="Ex : Myrtilles"
            amountPlaceholder="200"
          />

          <StepsSection
            steps={form.steps}
            setSteps={form.setSteps}
            updateStep={form.updateStep}
          />
        </div>

        <FormFooter error={form.error} isEditing={form.isEditing} />
      </form>
    </RecipeFormShell>
  );
}
