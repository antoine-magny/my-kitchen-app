import { CheckIcon } from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import type { Recipe } from "@/lib/recipes";

export function GenerateFridgePreview({
  recipes,
  selectedRecipeId,
  onSelect,
}: {
  recipes: Recipe[];
  selectedRecipeId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {recipes.map((recipe) => {
        const selected = recipe.id === selectedRecipeId;
        return (
          <li key={recipe.id}>
            <button
              type="button"
              onClick={() => onSelect(recipe.id)}
              className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all active:scale-[0.99]"
              style={{
                background: selected ? "#EBF2EC" : "#FAFBF9",
                border: selected ? "1.5px solid #4A7C59" : "1.5px solid #E2EBE3",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1C2B1E]">{recipe.title}</p>
                <p className="mt-1 text-xs font-medium text-[#7A8F7D]">
                  {recipe.time} · {recipe.calories} kcal · {recipe.proteins}g prot.
                </p>
                <MissingIngredientsBadges names={recipe.missingIngredients} className="mt-2" />
              </div>
              {selected ? (
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "#4A7C59" }}
                  aria-hidden
                >
                  <CheckIcon size={14} />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
