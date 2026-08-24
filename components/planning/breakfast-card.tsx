import { XIcon } from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { type Recipe } from "@/lib/recipes";

interface BreakfastCardProps {
  breakfast: {
    id: string;
    name: string;
    detail: string;
    calories: number;
    proteins: number;
  };
  recipe?: Recipe;
  onClear: () => void;
  onReplace: () => void;
}

export function BreakfastCard({
  breakfast,
  recipe,
  onClear,
  onReplace,
}: BreakfastCardProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 3px 16px rgba(74,124,89,0.09)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: "#EBF2EC" }}
          aria-hidden
        >
          🥣
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#1C2B1E]">{breakfast.name}</p>
          <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
            {breakfast.detail} · {breakfast.calories} kcal · {breakfast.proteins}g prot.
          </p>
          <MissingIngredientsBadges names={recipe?.missingIngredients} className="mt-2" />
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base transition-colors hover:bg-[#FEF2F2] active:scale-95"
          aria-label="Supprimer le petit-déjeuner"
        >
          <XIcon size={16} className="text-[#DC2626]" />
        </button>
      </div>
      <div className="border-t border-[#F0F4EF] px-4 py-3">
        <button
          type="button"
          onClick={onReplace}
          className="btn-primary block w-full rounded-2xl py-3 text-center text-sm font-bold"
        >
          Remplacer
        </button>
      </div>
    </div>
  );
}

export function EmptyMealSlot({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
    >
      {label.startsWith("+") ? label : `+ ${label}`}
    </button>
  );
}
