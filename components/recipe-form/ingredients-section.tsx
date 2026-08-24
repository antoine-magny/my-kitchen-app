import { PlusIcon, TrashIcon } from "@/components/icons";
import { inputClass, inputStyle } from "@/components/recipe-form-styles";
import { UnitSelect } from "@/components/ui/unit-select";
import { emptyIngredientRow, type RecipeFormIngredientRow } from "@/lib/recipe-import";

export function IngredientsSection({
  ingredients,
  setIngredients,
  updateIngredient,
}: {
  ingredients: RecipeFormIngredientRow[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeFormIngredientRow[]>>;
  updateIngredient: (index: number, field: keyof RecipeFormIngredientRow, value: string) => void;
}) {
  return (
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
      <div className="mb-2 hidden gap-2 px-0.5 sm:grid sm:grid-cols-[1fr_4.5rem_5.5rem_auto]">
        <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Nom</span>
        <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Qté</span>
        <span className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">Unité</span>
        <span className="w-10" />
      </div>
      <div className="space-y-2">
        {ingredients.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[1fr_4.5rem_5.5rem_auto]"
          >
            <input
              value={row.name}
              onChange={(e) => updateIngredient(idx, "name", e.target.value)}
              placeholder="Ex : Myrtilles"
              className={`${inputClass} col-span-3 sm:col-span-1`}
              style={inputStyle}
            />
            <input
              value={row.amount}
              onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
              placeholder="200"
              inputMode="decimal"
              className={inputClass}
              style={inputStyle}
            />
            <UnitSelect
              value={row.unit}
              ingredientName={row.name}
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
  );
}
