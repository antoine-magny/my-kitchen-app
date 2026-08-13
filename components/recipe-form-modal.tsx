"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import {
  DIFFICULTIES,
  ingFromText,
  RECIPE_TAGS,
  tagToLabel,
  type NewRecipeInput,
  type Recipe,
  type RecipeFilter,
  type RecipeStep,
} from "@/lib/recipes";
import { formatAmount } from "@/lib/units";

/**
 * Ligne d'édition : la quantité reste une saisie libre (« 200 g », « q.s. »),
 * convertie vers { amount, unit } à l'enregistrement.
 */
type IngredientRow = { name: string; amount: string };

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
      ? recipe.ingredients.map((ing) => ({
          name: ing.name,
          amount: formatAmount(ing.amount, ing.unit),
        }))
      : [{ name: "", amount: "" }],
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
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
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
      .map((row) => ingFromText(row.name.trim(), row.amount.trim()));

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
            <div>
              <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                IMAGE
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {photo ? (
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ border: "1.5px solid #E2EBE3" }}
                >
                  <div className="relative h-40 bg-[#D4EDD9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="Aperçu de la recette" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex gap-2 bg-[#FAFBF9] p-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EBF2EC] py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:opacity-90"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUrlInput((v) => !v);
                        setPhotoUrlDraft(photo.startsWith("data:") ? "" : photo);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C8E0CF] bg-white py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:border-[#4A7C59]"
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto("");
                        setShowUrlInput(false);
                        setPhotoUrlDraft("");
                      }}
                      className="flex items-center justify-center rounded-xl px-3 py-2.5 text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                      aria-label="Retirer l'image"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-8"
                  style={{ background: "#FAFBF9", border: "1.5px dashed #C8E0CF" }}
                >
                  <span className="text-[#7A8F7D]">
                    <ImageIcon size={22} />
                  </span>
                  <p className="text-center text-xs font-medium text-[#7A8F7D]">Aucune image — optionnel</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                        boxShadow: "0 3px 12px rgba(74,124,89,0.25)",
                      }}
                    >
                      <PlusIcon size={12} /> Ajouter une image
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((v) => !v)}
                      className="rounded-xl border border-[#C8E0CF] bg-white px-4 py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:border-[#4A7C59]"
                    >
                      Depuis une URL
                    </button>
                  </div>
                </div>
              )}

              {showUrlInput && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={photoUrlDraft}
                    onChange={(e) => setPhotoUrlDraft(e.target.value)}
                    placeholder="https://…"
                    className={inputClass}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={applyPhotoUrl}
                    className="shrink-0 rounded-xl bg-[#EBF2EC] px-4 text-xs font-bold text-[#4A7C59] transition-all hover:opacity-90"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                TITRE
              </label>
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Salade de quinoa aux légumes"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  TEMPS
                </label>
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="30 min"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  PORTIONS
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  KCAL
                </label>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  PROTÉINES (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  DIFFICULTÉ
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className={`${inputClass} appearance-none pr-10`}
                    style={inputStyle}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
                  CATÉGORIE
                </label>
                <div className="relative">
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value as Exclude<RecipeFilter, "Tout"> | "")}
                    className={`${inputClass} appearance-none pr-10`}
                    style={inputStyle}
                  >
                    <option value="">Aucune</option>
                    {RECIPE_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                  INGRÉDIENTS
                </label>
                <button
                  type="button"
                  onClick={() => setIngredients((prev) => [...prev, { name: "", amount: "" }])}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
                >
                  <PlusIcon size={12} /> Ajouter
                </button>
              </div>
              <div className="mb-2 grid grid-cols-[1fr_7.5rem_auto] gap-2 px-0.5">
                <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Nom</span>
                <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Quantité</span>
                <span className="w-10" />
              </div>
              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_7.5rem_auto] items-center gap-2">
                    <input
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                      placeholder="Ex : Myrtilles"
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                      placeholder="200 g"
                      className={inputClass}
                      style={inputStyle}
                    />
                    {ingredients.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== idx))}
                        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                        aria-label="Supprimer l'ingrédient"
                      >
                        <TrashIcon size={14} />
                      </button>
                    ) : (
                      <span className="w-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                  ÉTAPES
                </label>
                <button
                  type="button"
                  onClick={() => setSteps((prev) => [...prev, { title: "", detail: "", duration: "" }])}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
                >
                  <PlusIcon size={12} /> Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-3"
                    style={{ background: "#FAFBF9", border: "1.5px solid #E2EBE3" }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EBF2EC] text-xs font-extrabold text-[#4A7C59]">
                        {idx + 1}
                      </span>
                      <input
                        value={step.title}
                        onChange={(e) => updateStep(idx, "title", e.target.value)}
                        placeholder="Titre de l'étape"
                        className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1C2B1E] outline-none"
                        style={inputStyle}
                      />
                      <input
                        value={step.duration ?? ""}
                        onChange={(e) => updateStep(idx, "duration", e.target.value)}
                        placeholder="5 min"
                        className="w-20 shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1C2B1E] outline-none"
                        style={inputStyle}
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                          aria-label="Supprimer l'étape"
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={step.detail}
                      onChange={(e) => updateStep(idx, "detail", e.target.value)}
                      placeholder="Description de l'étape…"
                      rows={2}
                      className="w-full resize-none rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#1C2B1E] outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
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
