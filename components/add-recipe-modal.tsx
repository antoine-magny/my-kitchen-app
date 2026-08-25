"use client";

import { AddRecipeLoading } from "@/components/add-recipe/add-recipe-loading";
import { AddRecipeShell } from "@/components/add-recipe/add-recipe-shell";
import { FormStep } from "@/components/add-recipe/form-step";
import { MenuStep } from "@/components/add-recipe/menu-step";
import { PhotoStep } from "@/components/add-recipe/photo-step";
import { UrlStep } from "@/components/add-recipe/url-step";
import { useAddRecipeForm } from "@/components/add-recipe/use-add-recipe-form";
import type { NewRecipeInput } from "@/lib/recipes";

/**
 * Modal d’ajout : menu à 3 modes (manuel / photo / URL) → formulaire unique → Supabase.
 */
export function AddRecipeModal({
  onAdd,
  onClose,
}: {
  onAdd: (recipe: NewRecipeInput) => void;
  onClose: () => void;
}) {
  const form = useAddRecipeForm({ onAdd, onClose });

  if (form.loadingMessage) {
    return (
      <AddRecipeShell heading="Analyse en cours" showBack={false} {...form.shellProps}>
        <AddRecipeLoading message={form.loadingMessage} />
      </AddRecipeShell>
    );
  }

  if (form.step === "menu") {
    return (
      <AddRecipeShell heading="Nouvelle recette" showBack={false} {...form.shellProps}>
        <MenuStep onSelect={form.goToStep} error={form.error} />
      </AddRecipeShell>
    );
  }

  if (form.step === "photo") {
    return (
      <AddRecipeShell heading="Scanner une recette" showBack {...form.shellProps}>
        <PhotoStep onFileSelect={form.handleImageFile} error={form.error} />
      </AddRecipeShell>
    );
  }

  if (form.step === "url") {
    return (
      <AddRecipeShell heading="Importer depuis un lien" showBack {...form.shellProps}>
        <UrlStep
          urlDraft={form.urlDraft}
          setUrlDraft={form.setUrlDraft}
          onSubmit={form.handleUrlSubmit}
          error={form.error}
        />
      </AddRecipeShell>
    );
  }

  return (
    <AddRecipeShell heading="Vérifier la recette" showBack {...form.shellProps}>
      <FormStep
        title={form.title} setTitle={form.setTitle}
        prepTime={form.prepTime} setPrepTime={form.setPrepTime}
        cookTime={form.cookTime} setCookTime={form.setCookTime}
        servings={form.servings} setServings={form.setServings}
        calories={form.calories} setCalories={form.setCalories}
        proteins={form.proteins} setProteins={form.setProteins}
        difficulty={form.difficulty} setDifficulty={form.setDifficulty}
        tags={form.tags} setTags={form.setTags}
        cost={form.cost} setCost={form.setCost}
        ingredients={form.ingredients} setIngredients={form.setIngredients} updateIngredient={form.updateIngredient}
        instructions={form.instructions} setInstructions={form.setInstructions}
        importPhotoDataUrl={form.importPhotoDataUrl}
        error={form.error} saving={form.saving} onSubmit={form.handleSave} titleRef={form.titleRef}
      />
    </AddRecipeShell>
  );
}
