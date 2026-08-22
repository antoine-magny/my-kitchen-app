import Link from "next/link";
import { ClockIcon, FlameIcon, ProteinIcon } from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { type Recipe } from "@/lib/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  slotName: string;
  onClear: () => void;
  onReplace: () => void;
}

export function RecipeCard({
  recipe,
  slotName,
  onClear,
  onReplace,
}: RecipeCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 6px 32px rgba(74,124,89,0.13)",
      }}
    >
      <div className="relative h-44 bg-[#D4EDD9]">
        <Link href={`/recettes/${recipe.id}`} className="absolute inset-0 block">
          {recipe.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(28,43,30,0.55) 0%, transparent 55%)",
            }}
          />
        </Link>
        <button
          type="button"
          onClick={onClear}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-sm backdrop-blur-sm transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.90)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
          aria-label={`Supprimer le ${slotName}`}
        >
          ❌
        </button>
        <div
          className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)" }}
        >
          <span className="text-[#4A7C59]">
            <ClockIcon size={13} />
          </span>
          <span className="text-xs font-bold text-[#1C2B1E]">{recipe.time}</span>
        </div>
      </div>

      <div className="px-5 py-4">
        <Link href={`/recettes/${recipe.id}`}>
          <h3 className="font-lora mb-3 text-base leading-snug font-bold text-[#1C2B1E]">
            {recipe.title}
          </h3>
        </Link>
        <MissingIngredientsBadges names={recipe.missingIngredients} className="mb-3" />

        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
            <span className="text-[#F97316]">
              <FlameIcon size={13} />
            </span>
            <span className="text-xs font-bold text-[#C2410C]">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
            <span className="text-[#4A7C59]">
              <ProteinIcon size={13} />
            </span>
            <span className="text-xs font-bold text-[#2E5C3A]">{recipe.proteins}g protéines</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplace}
          className="btn-primary block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
        >
          Remplacer
        </button>
      </div>
    </div>
  );
}
