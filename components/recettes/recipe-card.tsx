import Link from "next/link";
import { ClockIcon, FlameIcon, HeartIcon, MuscleIcon } from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { recipeBadgeLabels, type Recipe } from "@/lib/recipes";

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Signature: { bg: "rgba(28,43,30,0.72)", text: "#E8F5EC" },
  Entrée: { bg: "rgba(74,124,89,0.82)", text: "#FFF" },
  Plat: { bg: "rgba(28,43,30,0.72)", text: "#E8F5EC" },
  Dessert: { bg: "rgba(219,85,108,0.85)", text: "#FFF" },
  Encas: { bg: "rgba(161,124,61,0.85)", text: "#FFF" },
  Express: { bg: "rgba(249,115,22,0.88)", text: "#FFF" },
  Végétarien: { bg: "rgba(74,124,89,0.82)", text: "#FFF" },
  "Riche en protéines": { bg: "rgba(59,130,246,0.80)", text: "#FFF" },
  Léger: { bg: "rgba(74,124,89,0.82)", text: "#FFF" },
  Gastronomique: { bg: "rgba(161,124,61,0.85)", text: "#FFF" },
};

export function RecipeCard({
  recipe,
  onToggleFav,
  isFav,
}: {
  recipe: Recipe;
  onToggleFav: (id: number) => void;
  isFav: boolean;
}) {
  const badges = recipeBadgeLabels(recipe);

  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 2px 16px rgba(28,43,30,0.07)",
      }}
    >
      <Link href={`/recettes/${recipe.id}`} className="block">
        <div className="relative overflow-hidden bg-[#D4EDD9]" style={{ height: 200 }}>
          {recipe.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photo}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(28,43,30,0.48) 0%, transparent 55%)" }}
          />
          {badges.length > 0 ? (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {badges.map((label) => {
                const cfg = TAG_COLORS[label] ?? TAG_COLORS.Signature;
                return (
                  <div
                    key={label}
                    className="rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-[4px]"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="px-4 pt-3.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/recettes/${recipe.id}`}>
            <h3 className="font-lora line-clamp-2 min-h-10 text-sm leading-snug font-bold text-[#1C2B1E]">
              {recipe.title}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => onToggleFav(recipe.id)}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
            style={{ background: isFav ? "#FEE2E8" : "#F0F4EF" }}
            aria-label="Ajouter aux favoris"
          >
            <HeartIcon filled={isFav} />
          </button>
        </div>

        <MissingIngredientsBadges names={recipe.missingIngredients} className="mb-3" />

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#4A7C59]">
            <ClockIcon size={12} />
            <span className="text-xs font-semibold text-[#4A7C59]">{recipe.time}</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#F97316]">
            <FlameIcon size={12} />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.calories} kcal</span>
          </div>
          <div className="h-3 w-px rounded-full bg-[#E2EBE3]" />
          <div className="flex items-center gap-1.5 text-[#3B82F6]">
            <MuscleIcon size={12} />
            <span className="text-xs font-semibold text-[#7A8F7D]">{recipe.proteins}g</span>
          </div>
        </div>

        <Link
          href={`/recettes/${recipe.id}`}
          className="flex w-full items-center justify-center rounded-xl bg-[#4A7C59] py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
        >
          Voir les étapes
        </Link>
      </div>
    </div>
  );
}
