"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/icons";
import { emptyIngredientRow, type RecipeFormIngredientRow } from "@/lib/recipe-import";
import {
  DIFFICULTIES,
  ing,
  tagToLabel,
  type NewRecipeInput,
  type Recipe,
  type RecipeFilter,
  type RecipeStep,
} from "@/lib/recipes";
import { getIngredientDefaultUnit } from "@/lib/ingredients";
import { coerceUnitCode, DEFAULT_UNIT } from "@/lib/units";

import { ImageSection } from "./recipe-form/image-section";
import { MetaSection } from "./recipe-form/meta-section";
import { IngredientsSection } from "./recipe-form/ingredients-section";
import { StepsSection } from "./recipe-form/steps-section";

type IngredientRow = RecipeFormIngredientRow;

type Difficulty = (typeof DIFFICULTIES)[number];

function toDifficulty(value: string): Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value) ? (value as Difficulty) : "Facile";
}

function toTag(value: RecipeFilter | null | undefined): Exclude<RecipeFilter, "Tout"> | "" {
  if (!value || value === "Tout") return "";
  return value;
}

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export function RecipeFormModal({
  recipe,
  onSave,
  onClose,
}: {
  recipe?: Recipe;
  onSave: (input: NewRecipeInput) => void;
  onClose: () => void;
}) {
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [photo, setPhoto] = useState(recipe?.photo ?? "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [photoUrlDraft, setPhotoUrlDraft] = useState("");
  const [time, setTime] = useState(recipe?.time ?? "30 min");
  const [calories, setCalories] = useState(String(recipe?.calories ?? 400));
  const [proteins, setProteins] = useState(String(recipe?.proteins ?? 20));
  const [servings, setServings] = useState(String(recipe?.servings ?? 2));
  const [difficulty, setDifficulty] = useState<Difficulty>(toDifficulty(recipe?.difficulty ?? "Facile"));
  const [tag, setTag] = useState<Exclude<RecipeFilter, "Tout"> | "">(toTag(recipe?.tag));
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients.length
      ? recipe.ingredients.map((row) => ({
          name: row.name,
          amount: String(row.amount),
          unit: row.unit,
        }))
      : [emptyIngredientRow()],
  );
  const [steps, setSteps] = useState<RecipeStep[]>(
    recipe?.steps.length
      ? recipe.steps.map((step) => ({ ...step, duration: step.duration ?? "" }))
      : [{ title: "", detail: "", duration: "" }],
  );
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const updateIngredient = (index: number, field: keyof IngredientRow, value: string) => {
    setIngredients((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "unit") {
          return { ...row, unit: coerceUnitCode(value) ?? DEFAULT_UNIT };
        }
        const updated = { ...row, [field]: value };
        if (field === "name" && value.trim()) {
          const prevDefault = getIngredientDefaultUnit(row.name);
          if (row.unit === prevDefault || row.unit === "piece") {
            updated.unit = getIngredientDefaultUnit(value);
          }
        }
        return updated;
      }),
    );
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: string) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choisissez un fichier image (JPG, PNG, WebP…).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("L'image est trop lourde (max. 1,5 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setShowUrlInput(false);
        setError("");
      }
    };
    reader.onerror = () => setError("Impossible de lire l'image.");
    reader.readAsDataURL(file);
  };

  const applyPhotoUrl = () => {
    const url = photoUrlDraft.trim();
    if (!url) {
      setError("Collez une URL d'image valide.");
      return;
    }
    setPhoto(url);
    setShowUrlInput(false);
    setPhotoUrlDraft("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Indiquez un titre pour la recette.");
      return;
    }

    const cleanedIngredients = ingredients
      .filter((row) => row.name.trim().length > 0)
      .map((row) => {
        const unit = coerceUnitCode(row.unit) ?? DEFAULT_UNIT;
        const amount =
          unit === "qs" ? 0 : Number(String(row.amount).trim().replace(",", ".")) || 0;
        return ing(row.name.trim(), amount, unit);
      });

    const cleanedSteps = steps
      .map((step) => ({
        title: step.title.trim(),
        detail: step.detail.trim(),
        ...(step.duration?.trim() ? { duration: step.duration.trim() } : {}),
      }))
      .filter((step) => step.title.length > 0 && step.detail.length > 0);

    if (cleanedIngredients.length === 0) {
      setError("Ajoutez au moins un ingrédient (nom obligatoire, quantité optionnelle).");
      return;
    }

    if (cleanedSteps.length === 0) {
      setError("Ajoutez au moins une étape avec un titre et une description.");
      return;
    }

    const selectedTag = tag || null;
    onSave({
      title: title.trim(),
      photo: photo.trim(),
      time: time.trim() || "30 min",
      calories: Number(calories) || 0,
      proteins: Number(proteins) || 0,
      servings: Math.max(1, Number(servings) || 1),
      difficulty,
      tag: selectedTag,
      tagLabel: tagToLabel(selectedTag) ?? recipe?.tagLabel,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      missingIngredients: recipe?.missingIngredients,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-full w-full flex-col rounded-t-3xl sm:max-h-[92vh] sm:w-auto sm:min-w-[520px] sm:max-w-xl sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5">
          <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">
            {isEditing ? "Modifier la recette" : "Nouvelle recette"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <ImageSection
              photo={photo}
              setPhoto={setPhoto}
              showUrlInput={showUrlInput}
              setShowUrlInput={setShowUrlInput}
              photoUrlDraft={photoUrlDraft}
              setPhotoUrlDraft={setPhotoUrlDraft}
              fileRef={fileRef}
              handleFileChange={handleFileChange}
              applyPhotoUrl={applyPhotoUrl}
            />

            <MetaSection
              titleRef={titleRef}
              title={title} setTitle={setTitle}
              time={time} setTime={setTime}
              servings={servings} setServings={setServings}
              calories={calories} setCalories={setCalories}
              proteins={proteins} setProteins={setProteins}
              difficulty={difficulty} setDifficulty={setDifficulty}
              tag={tag} setTag={setTag}
            />

            <IngredientsSection
              ingredients={ingredients}
              setIngredients={setIngredients}
              updateIngredient={updateIngredient}
            />

            <StepsSection
              steps={steps}
              setSteps={setSteps}
              updateStep={updateStep}
            />
          </div>

          <div className="shrink-0 border-t border-[#F0F4EF] px-6 py-4">
            {error && (
              <p className="mb-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
              }}
            >
              {isEditing ? "Enregistrer les modifications" : "Enregistrer la recette"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
