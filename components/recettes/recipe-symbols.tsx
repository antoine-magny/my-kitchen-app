import { ChefHatIcon } from "@/components/icons";
import {
  DIFFICULTY_TOQUE_COUNT,
  RECIPE_COST_LABELS,
  RECIPE_COST_SYMBOLS,
  type RecipeCost,
  type RecipeDifficulty,
} from "@/lib/recipes";

export function RecipeDifficultyToques({
  difficulty,
  size = 14,
  decorative = false,
}: {
  difficulty: RecipeDifficulty;
  size?: number;
  decorative?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-px"
      title={difficulty}
      {...(decorative
        ? { "aria-hidden": true as const }
        : { "aria-label": `Difficulté : ${difficulty}` })}
    >
      {Array.from({ length: DIFFICULTY_TOQUE_COUNT[difficulty] }, (_, i) => (
        <ChefHatIcon key={i} size={size} />
      ))}
    </span>
  );
}

export function RecipeCostSymbol({
  cost,
  className = "text-xs font-bold tracking-wide",
  decorative = false,
}: {
  cost: RecipeCost;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span
      className={className}
      title={RECIPE_COST_LABELS[cost]}
      {...(decorative
        ? { "aria-hidden": true as const }
        : { "aria-label": `Budget : ${RECIPE_COST_LABELS[cost]}` })}
    >
      {RECIPE_COST_SYMBOLS[cost]}
    </span>
  );
}
