"use client";

import { useEffect, useRef, useState } from "react";
import type { RecipeFormIngredientRow } from "@/lib/recipe-import";
import {
  ing,
  withDerivedTags,
  type NewRecipeInput,
  type Recipe,
  type RecipeCost,
  type RecipeStep,
  type RecipeTag,
} from "@/lib/recipes";
import { getIngredientDefaultUnit } from "@/lib/ingredients";
import { coerceUnitCode, DEFAULT_UNIT } from "@/lib/units";
import {
  initialIngredientRows,
  initialSteps,
  toCost,
  toDifficulty,
  toTags,
  type Difficulty,
} from "@/components/recipe-form/form-state";

type IngredientRow = RecipeFormIngredientRow;

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export function useRecipeForm({
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
  const [tags, setTags] = useState<RecipeTag[]>(toTags(recipe));
  const [cost, setCost] = useState<RecipeCost>(toCost(recipe));
  const [ingredients, setIngredients] = useState<IngredientRow[]>(initialIngredientRows(recipe));
  const [steps, setSteps] = useState<RecipeStep[]>(initialSteps(recipe));
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

    const selectedTags = withDerivedTags(
      tags,
      time.trim() || "30 min",
      Number(proteins) || 0,
    );
    onSave({
      title: title.trim(),
      photo: photo.trim(),
      time: time.trim() || "30 min",
      calories: Number(calories) || 0,
      proteins: Number(proteins) || 0,
      servings: Math.max(1, Number(servings) || 1),
      difficulty,
      tags: selectedTags,
      cost,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      missingIngredients: recipe?.missingIngredients,
    });
    onClose();
  };

  return {
    isEditing,
    title, setTitle,
    photo, setPhoto,
    showUrlInput, setShowUrlInput,
    photoUrlDraft, setPhotoUrlDraft,
    time, setTime,
    calories, setCalories,
    proteins, setProteins,
    servings, setServings,
    difficulty, setDifficulty,
    tags, setTags,
    cost, setCost,
    ingredients, setIngredients,
    steps, setSteps,
    error,
    titleRef,
    fileRef,
    updateIngredient,
    updateStep,
    handleFileChange,
    applyPhotoUrl,
    handleSubmit,
  };
}
