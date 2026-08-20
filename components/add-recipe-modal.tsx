"use client";

import { useEffect, useRef, useState } from "react";
import {
  CameraIcon,
  ChevronDownIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
  SpinnerBrandIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import {
  emptyIngredientRow,
  type ParsedRecipe,
  type RecipeFormIngredientRow,
} from "@/lib/recipe-import";
import { getIngredientDefaultUnit } from "@/lib/ingredients";
import type { NewRecipeInput } from "@/lib/recipes";
import { coerceUnitCode, type UnitCode } from "@/lib/units";
import { UnitSelect } from "@/components/ui/unit-select";

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
      <div className="space-y-3 px-6 py-6">
        <p className="mb-2 text-sm font-medium text-[#7A8F7D]">
          Comment souhaitez-vous ajouter cette recette ?
        </p>
        {(
          [
            {
              id: "manual" as const,
              icon: <EditIcon size={22} strokeWidth={1.8} />,
              title: "Saisie manuelle",
              desc: "Remplir le formulaire vous-même",
              onClick: () => {
                setError("");
                setStep("form");
              },
            },
            {
              id: "photo" as const,
              icon: <CameraIcon size={22} />,
              title: "Scanner une recette",
              desc: "Photo ou galerie — l’IA préremplit le formulaire",
              onClick: () => {
                setError("");
                setStep("photo");
              },
            },
            {
              id: "url" as const,
              icon: <LinkIcon size={22} />,
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
            <CameraIcon size={22} />
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
                <UnitSelect
                  value={ing.unit}
                  ingredientName={ing.name}
                  onChange={(unit) => updateIngredient(idx, "unit", unit)}
                  className={`${inputClass} flex items-center justify-between pr-3.5`}
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
                    <TrashIcon size={14} />
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
