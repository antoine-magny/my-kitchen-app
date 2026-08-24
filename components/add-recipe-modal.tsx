"use client";

import { useEffect, useRef, useState } from "react";
import { AddRecipeLoading } from "@/components/add-recipe/add-recipe-loading";
import { AddRecipeShell } from "@/components/add-recipe/add-recipe-shell";
import { FormStep } from "@/components/add-recipe/form-step";
import { MenuStep } from "@/components/add-recipe/menu-step";
import { parsedToFormState } from "@/components/add-recipe/parsed-to-form";
import { PhotoStep } from "@/components/add-recipe/photo-step";
import { UrlStep } from "@/components/add-recipe/url-step";
import { emptyIngredientRow, type ParsedRecipe, type RecipeFormIngredientRow } from "@/lib/recipe-import";
import { getIngredientDefaultUnit } from "@/lib/ingredients";
import type { NewRecipeInput, RecipeCost, RecipeDifficulty, RecipeTag } from "@/lib/recipes";

type AddStep = "menu" | "photo" | "url" | "form";

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
  const [step, setStep] = useState<AddStep>("menu");
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [prepTime, setPrepTime] = useState("15 min");
  const [cookTime, setCookTime] = useState("20 min");
  const [servings, setServings] = useState("4");
  const [calories, setCalories] = useState("400");
  const [proteins, setProteins] = useState("20");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>("Facile");
  const [tags, setTags] = useState<RecipeTag[]>(["plat"]);
  const [cost, setCost] = useState<RecipeCost>("moyen");
  const [ingredients, setIngredients] = useState<RecipeFormIngredientRow[]>([emptyIngredientRow()]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [importPhotoDataUrl, setImportPhotoDataUrl] = useState<string | null>(null);

  const [urlDraft, setUrlDraft] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "form") titleRef.current?.focus();
  }, [step]);

  const applyParsed = (recipe: ParsedRecipe, photoDataUrl?: string | null) => {
    const next = parsedToFormState(recipe);
    setTitle(next.title);
    setPrepTime(next.prepTime);
    setCookTime(next.cookTime);
    setServings(next.servings);
    setCalories(next.calories);
    setProteins(next.proteins);
    setDifficulty(next.difficulty);
    setTags(next.tags);
    setCost(next.cost);
    setIngredients(next.ingredients);
    setInstructions(next.instructions);
    setImportPhotoDataUrl(photoDataUrl ?? null);
    setError("");
    setStep("form");
  };

  const parseViaApi = async (
    body: { imageBase64: string } | { url: string },
    loadingText: string,
    photoDataUrl?: string | null,
  ) => {
    setLoadingMessage(loadingText);
    setError("");
    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { recipe?: ParsedRecipe; error?: string };
      if (!res.ok || !data.recipe) {
        throw new Error(data.error || "Analyse impossible.");
      }
      applyParsed(data.recipe, photoDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse impossible.");
      setStep(body && "url" in body ? "url" : "photo");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez un fichier image (JPG, PNG, WebP…).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("L'image est trop lourde (max. 4 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Impossible de lire l'image.");
        return;
      }
      void parseViaApi(
        { imageBase64: reader.result },
        "L'IA analyse votre photo…",
        reader.result,
      );
    };
    reader.onerror = () => setError("Impossible de lire l'image.");
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlDraft.trim();
    if (!url) {
      setError("Collez l’URL d’une page de recette.");
      return;
    }
    void parseViaApi({ url }, "L'IA extrait la recette du site…");
  };

  const updateIngredient = (index: number, field: keyof RecipeFormIngredientRow, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing;
        const updated = { ...ing, [field]: value };
        if (field === "name" && value.trim()) {
          const prevDefault = getIngredientDefaultUnit(ing.name);
          if (ing.unit === prevDefault || ing.unit === "piece") {
            updated.unit = getIngredientDefaultUnit(value);
          }
        }
        return updated;
      }),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Indiquez un titre pour la recette.");
      return;
    }

    const cleanedIngredients = ingredients
      .map((ing) => ({
        name: ing.name.trim(),
        amount: Number(String(ing.amount).replace(",", ".")) || 0,
        unit: ing.unit,
      }))
      .filter((ing) => ing.name.length > 0);

    const cleanedInstructions = instructions.map((s) => s.trim()).filter(Boolean);

    if (cleanedIngredients.length === 0) {
      setError("Ajoutez au moins un ingrédient.");
      return;
    }
    if (cleanedInstructions.length === 0) {
      setError("Ajoutez au moins une étape d’instructions.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          prep_time: prepTime.trim() || "15 min",
          cook_time: cookTime.trim() || "0 min",
          servings: Math.max(1, Number(servings) || 1),
          calories_per_serving: Number(calories) || 0,
          protein_per_serving: Number(proteins) || 0,
          ingredients: cleanedIngredients,
          instructions: cleanedInstructions,
          photo_url: importPhotoDataUrl?.startsWith("http") ? importPhotoDataUrl : null,
          difficulty,
          tags,
          cost,
        }),
      });
      const data = (await res.json()) as {
        local?: NewRecipeInput;
        error?: string;
      };
      if (!res.ok || !data.local) {
        throw new Error(data.error || "Enregistrement impossible.");
      }

      // Conserve l’aperçu local (data URL) si pas d’URL http persistée.
      const local: NewRecipeInput = {
        ...data.local,
        photo: data.local.photo || importPhotoDataUrl || "",
      };
      onAdd(local);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const closeDisabled = Boolean(loadingMessage) || saving;
  const shellProps = {
    closeDisabled,
    onBack: () => {
      setError("");
      setStep("menu");
    },
    onClose,
  };

  if (loadingMessage) {
    return (
      <AddRecipeShell heading="Analyse en cours" showBack={false} {...shellProps}>
        <AddRecipeLoading message={loadingMessage} />
      </AddRecipeShell>
    );
  }

  if (step === "menu") {
    return (
      <AddRecipeShell heading="Nouvelle recette" showBack={false} {...shellProps}>
        <MenuStep
          onSelect={(newStep) => {
            setError("");
            setStep(newStep);
          }}
          error={error}
        />
      </AddRecipeShell>
    );
  }

  if (step === "photo") {
    return (
      <AddRecipeShell heading="Scanner une recette" showBack {...shellProps}>
        <PhotoStep onFileSelect={handleImageFile} error={error} />
      </AddRecipeShell>
    );
  }

  if (step === "url") {
    return (
      <AddRecipeShell heading="Importer depuis un lien" showBack {...shellProps}>
        <UrlStep
          urlDraft={urlDraft}
          setUrlDraft={setUrlDraft}
          onSubmit={handleUrlSubmit}
          error={error}
        />
      </AddRecipeShell>
    );
  }

  return (
    <AddRecipeShell heading="Vérifier la recette" showBack {...shellProps}>
      <FormStep
        title={title} setTitle={setTitle}
        prepTime={prepTime} setPrepTime={setPrepTime}
        cookTime={cookTime} setCookTime={setCookTime}
        servings={servings} setServings={setServings}
        calories={calories} setCalories={setCalories}
        proteins={proteins} setProteins={setProteins}
        difficulty={difficulty} setDifficulty={setDifficulty}
        tags={tags} setTags={setTags}
        cost={cost} setCost={setCost}
        ingredients={ingredients} setIngredients={setIngredients} updateIngredient={updateIngredient}
        instructions={instructions} setInstructions={setInstructions}
        importPhotoDataUrl={importPhotoDataUrl}
        error={error} saving={saving} onSubmit={handleSave} titleRef={titleRef}
      />
    </AddRecipeShell>
  );
}
