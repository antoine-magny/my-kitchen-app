import { PlusIcon, TrashIcon } from "@/components/icons";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import { UnitSelect } from "@/components/ui/unit-select";
import { emptyIngredientRow, type RecipeFormIngredientRow } from "@/lib/recipe-import";

export function FormStep({
  title, setTitle,
  prepTime, setPrepTime,
  cookTime, setCookTime,
  servings, setServings,
  calories, setCalories,
  proteins, setProteins,
  ingredients, setIngredients, updateIngredient,
  instructions, setInstructions,
  importPhotoDataUrl,
  error, saving, onSubmit, titleRef
}: {
  title: string; setTitle: (val: string) => void;
  prepTime: string; setPrepTime: (val: string) => void;
  cookTime: string; setCookTime: (val: string) => void;
  servings: string; setServings: (val: string) => void;
  calories: string; setCalories: (val: string) => void;
  proteins: string; setProteins: (val: string) => void;
  ingredients: RecipeFormIngredientRow[];
  setIngredients: (updater: (prev: RecipeFormIngredientRow[]) => RecipeFormIngredientRow[]) => void;
  updateIngredient: (index: number, field: keyof RecipeFormIngredientRow, value: string) => void;
  instructions: string[];
  setInstructions: (updater: (prev: string[]) => string[]) => void;
  importPhotoDataUrl: string | null;
  error: string;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  titleRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
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
                  allowCulinary={true}
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
    </form>
  );
}
