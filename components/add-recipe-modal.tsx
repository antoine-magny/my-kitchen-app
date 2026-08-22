"use client";

import { useEffect, useRef, useState } from "react";
import { SpinnerBrandIcon, XIcon } from "@/components/icons";
import {
  emptyIngredientRow,
  type ParsedRecipe,
  type RecipeFormIngredientRow,
} from "@/lib/recipe-import";
import { getIngredientDefaultUnit } from "@/lib/ingredients";
import type { NewRecipeInput } from "@/lib/recipes";
import { coerceUnitCode, type UnitCode } from "@/lib/units";
import { MenuStep } from "./add-recipe/menu-step";
import { PhotoStep } from "./add-recipe/photo-step";
import { UrlStep } from "./add-recipe/url-step";
import { FormStep } from "./add-recipe/form-step";

type AddStep = "menu" | "photo" | "url" | "form";

function parsedToFormState(recipe: ParsedRecipe) {
  return {
    title: recipe.title,
    prepTime: recipe.prep_time || "15 min",
    cookTime: recipe.cook_time || "20 min",
    servings: String(recipe.servings || 4),
    calories: String(recipe.calories_per_serving || 400),
    proteins: String(recipe.protein_per_serving || 20),
    ingredients: recipe.ingredients.length
      ? recipe.ingredients.map((ing) => ({
          name: ing.name,
          amount: String(ing.amount ?? ""),
          unit: (coerceUnitCode(ing.unit) ?? "g") as UnitCode,
        }))
      : [emptyIngredientRow()],
    instructions: recipe.instructions.length ? recipe.instructions : [""],
  };
}

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
          difficulty: "Facile" as const,
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

  const shell = (children: React.ReactNode, heading: string) => (
    <div
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loadingMessage && !saving) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-full w-full flex-col rounded-t-3xl sm:max-h-[92vh] sm:w-auto sm:min-w-[520px] sm:max-w-xl sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5">
          <div className="flex items-center gap-2">
            {step !== "menu" && !loadingMessage && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("menu");
                }}
                className="mr-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] hover:bg-[#EBF2EC]"
              >
                ← Retour
              </button>
            )}
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">{heading}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(loadingMessage) || saving}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40"
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  if (loadingMessage) {
    return shell(
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
        <SpinnerBrandIcon size={28} />
        <p className="text-center text-sm font-semibold text-[#1C2B1E]">{loadingMessage}</p>
        <p className="text-center text-xs font-medium text-[#7A8F7D]">Cela peut prendre quelques secondes</p>
      </div>,
      "Analyse en cours",
    );
  }

  if (step === "menu") {
    return shell(
      <MenuStep
        onSelect={(newStep) => {
          setError("");
          setStep(newStep);
        }}
        error={error}
      />,
      "Nouvelle recette",
    );
  }

  if (step === "photo") {
    return shell(
      <PhotoStep onFileSelect={handleImageFile} error={error} />,
      "Scanner une recette",
    );
  }

  if (step === "url") {
    return shell(
      <UrlStep
        urlDraft={urlDraft}
        setUrlDraft={setUrlDraft}
        onSubmit={handleUrlSubmit}
        error={error}
      />,
      "Importer depuis un lien",
    );
  }

  // step === "form"
  return shell(
    <FormStep
      title={title} setTitle={setTitle}
      prepTime={prepTime} setPrepTime={setPrepTime}
      cookTime={cookTime} setCookTime={setCookTime}
      servings={servings} setServings={setServings}
      calories={calories} setCalories={setCalories}
      proteins={proteins} setProteins={setProteins}
      ingredients={ingredients} setIngredients={setIngredients} updateIngredient={updateIngredient}
      instructions={instructions} setInstructions={setInstructions}
      importPhotoDataUrl={importPhotoDataUrl}
      error={error} saving={saving} onSubmit={handleSave} titleRef={titleRef}
    />,
    "Vérifier la recette",
  );
}
