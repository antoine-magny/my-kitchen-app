"use client";

import { useEffect, useRef, useState } from "react";
import type { ParsedRecipe } from "@/lib/recipe-import";
import {
  emptyIngredientRow,
  type RecipeFormIngredientRow,
} from "@/lib/recipe-import";
import {
  DIFFICULTIES,
  RECIPE_TAGS,
  tagToLabel,
  type NewRecipeInput,
  type Recipe,
  type RecipeFilter,
  type RecipeIngredient,
  type RecipeStep,
} from "@/lib/recipes";
import { UNITS, type UnitCode } from "@/lib/units";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]";
const inputStyle = { border: "1.5px solid #E2EBE3" } as const;
const labelClass = "mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]";

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
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients.length ? recipe.ingredients.map((ing) => ({ ...ing })) : [{ name: "", amount: "" }],
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

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
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
      .map((ing) => ({ name: ing.name.trim(), amount: ing.amount.trim() || "q.s." }))
      .filter((ing) => ing.name.length > 0);

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
            <XIcon />
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
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-8"
                  style={{ background: "#FAFBF9", border: "1.5px dashed #C8E0CF" }}
                >
                  <span className="text-[#7A8F7D]">
                    <ImageIcon />
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
                    <ChevronDownIcon />
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
                    <ChevronDownIcon />
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
                        <TrashIcon />
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
                          <TrashIcon />
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

type AddStep = "menu" | "photo" | "url" | "form";

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#C8E0CF" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4A7C59" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
          unit: (UNITS.some((u) => u.code === ing.unit) ? ing.unit : "g") as UnitCode,
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
  const fileRef = useRef<HTMLInputElement>(null);
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
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
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
                  setStep(step === "form" ? "menu" : "menu");
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
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  if (loadingMessage) {
    return shell(
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
        <SpinnerIcon />
        <p className="text-center text-sm font-semibold text-[#1C2B1E]">{loadingMessage}</p>
        <p className="text-center text-xs font-medium text-[#7A8F7D]">Cela peut prendre quelques secondes</p>
      </div>,
      "Analyse en cours",
    );
  }

  if (step === "menu") {
    return shell(
      <div className="space-y-3 px-6 py-6">
        <p className="mb-2 text-sm font-medium text-[#7A8F7D]">
          Comment souhaitez-vous ajouter cette recette ?
        </p>
        {(
          [
            {
              id: "manual" as const,
              icon: <PenIcon />,
              title: "Saisie manuelle",
              desc: "Remplir le formulaire vous-même",
              onClick: () => {
                setError("");
                setStep("form");
              },
            },
            {
              id: "photo" as const,
              icon: <CameraIcon />,
              title: "Scanner une recette",
              desc: "Photo ou galerie — l’IA préremplit le formulaire",
              onClick: () => {
                setError("");
                setStep("photo");
              },
            },
            {
              id: "url" as const,
              icon: <LinkIcon />,
              title: "Importer depuis un lien",
              desc: "Marmiton, blogs… extraction automatique",
              onClick: () => {
                setError("");
                setStep("url");
              },
            },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={opt.onClick}
            className="flex w-full items-start gap-4 rounded-2xl px-4 py-4 text-left transition-all hover:bg-[#FAFBF9]"
            style={{ border: "1.5px solid #E2EBE3" }}
          >
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF2EC] text-[#4A7C59]">
              {opt.icon}
            </span>
            <span>
              <span className="block text-sm font-bold text-[#1C2B1E]">{opt.title}</span>
              <span className="mt-0.5 block text-xs font-medium text-[#7A8F7D]">{opt.desc}</span>
            </span>
          </button>
        ))}
        {error && (
          <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">{error}</p>
        )}
      </div>,
      "Nouvelle recette",
    );
  }

  if (step === "photo") {
    return shell(
      <div className="space-y-4 px-6 py-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            handleImageFile(file);
          }}
        />
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-10"
          style={{ background: "#FAFBF9", border: "1.5px dashed #C8E0CF" }}
        >
          <span className="text-[#4A7C59]">
            <CameraIcon />
          </span>
          <p className="text-center text-sm font-semibold text-[#1C2B1E]">Photo ou capture d’écran</p>
          <p className="text-center text-xs font-medium text-[#7A8F7D]">
            L’IA lit la recette et préremplit le formulaire pour validation.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 3px 12px rgba(74,124,89,0.25)",
            }}
          >
            Choisir une image
          </button>
        </div>
        {error && (
          <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">{error}</p>
        )}
      </div>,
      "Scanner une recette",
    );
  }

  if (step === "url") {
    return shell(
      <form onSubmit={handleUrlSubmit} className="space-y-4 px-6 py-6">
        <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
          URL DE LA RECETTE
        </label>
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="https://www.marmiton.org/…"
          className={inputClass}
          style={inputStyle}
          autoFocus
        />
        <p className="text-xs font-medium text-[#7A8F7D]">
          Collez le lien d’un site de cuisine. L’IA extrait titre, ingrédients et étapes.
        </p>
        {error && (
          <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
            boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
          }}
        >
          Extraire la recette
        </button>
      </form>,
      "Importer depuis un lien",
    );
  }

  // step === "form"
  return shell(
    <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {importPhotoDataUrl && (
          <div className="overflow-hidden rounded-2xl" style={{ border: "1.5px solid #E2EBE3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={importPhotoDataUrl} alt="Source scannée" className="h-36 w-full object-cover" />
          </div>
        )}

        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            TITRE
          </label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Poulet rôti aux herbes"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
              PRÉPARATION
            </label>
            <input
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="15 min"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
              CUISSON
            </label>
            <input
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="20 min"
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
              KCAL / PORTION
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
              PROTÉINES / PORTION (g)
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
              INGRÉDIENTS
            </label>
            <button
              type="button"
              onClick={() => setIngredients((prev) => [...prev, emptyIngredientRow()])}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
            >
              <PlusIcon size={12} /> Ajouter
            </button>
          </div>
          <div className="mb-2 grid grid-cols-[1fr_4.5rem_5.5rem_auto] gap-2 px-0.5">
            <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Nom</span>
            <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Qté</span>
            <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Unité</span>
            <span className="w-10" />
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_4.5rem_5.5rem_auto] items-center gap-2">
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                  placeholder="Poulet"
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  value={ing.amount}
                  onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                  placeholder="500"
                  inputMode="decimal"
                  className={inputClass}
                  style={inputStyle}
                />
                <div className="relative">
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                    className={`${inputClass} appearance-none pr-7`}
                    style={inputStyle}
                  >
                    {UNITS.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#7A8F7D]">
                    <ChevronDownIcon />
                  </span>
                </div>
                {ingredients.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== idx))}
                    className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                    aria-label="Supprimer l'ingrédient"
                  >
                    <TrashIcon />
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
              INSTRUCTIONS
            </label>
            <button
              type="button"
              onClick={() => setInstructions((prev) => [...prev, ""])}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
            >
              <PlusIcon size={12} /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {instructions.map((stepText, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EBF2EC] text-xs font-extrabold text-[#4A7C59]">
                  {idx + 1}
                </span>
                <textarea
                  value={stepText}
                  onChange={(e) =>
                    setInstructions((prev) =>
                      prev.map((s, i) => (i === idx ? e.target.value : s)),
                    )
                  }
                  placeholder="Décrivez l’étape…"
                  rows={2}
                  className="w-full resize-none rounded-xl bg-[#FAFBF9] px-3 py-2 text-sm font-medium text-[#1C2B1E] outline-none"
                  style={inputStyle}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setInstructions((prev) => prev.filter((_, i) => i !== idx))}
                    className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                    aria-label="Supprimer l'étape"
                  >
                    <TrashIcon />
                  </button>
                )}
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
          disabled={saving}
          className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
            boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer la recette"}
        </button>
      </div>
    </form>,
    "Vérifier la recette",
  );
}
