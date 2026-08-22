import Link from "next/link";
import { ClockIcon, FlameIcon, HeartIcon, MuscleIcon } from "@/components/icons";
import type { Recipe } from "@/lib/recipes";

export function FeaturedCard({
  recipe,
  onToggleFav,
  isFav,
}: {
  recipe: Recipe;
  onToggleFav: (id: number) => void;
  isFav: boolean;
}) {
  return (
    <div
      className="group relative mb-8 overflow-hidden rounded-3xl bg-[#1C2B1E]"
      style={{
        height: 340,
        boxShadow: "0 12px 48px rgba(28,43,30,0.20)",
      }}
    >
      <Link href={`/recettes/${recipe.id}`} className="absolute inset-0 block">
        {recipe.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.photo}
            alt={recipe.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#2A3D2C] text-6xl">🍽️</div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(10,20,12,0.85) 0%, rgba(10,20,12,0.30) 50%, transparent 100%)",
          }}
        />
      </Link>

      <div className="pointer-events-none absolute top-5 left-5 flex items-center gap-2">
        <div className="rounded-xl bg-[#4A7C59] px-3 py-1.5 text-xs font-extrabold tracking-[0.08em] text-white">
          RECETTE DU JOUR
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleFav(recipe.id)}
        className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          background: isFav ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
          backdropFilter: "blur(6px)",
        }}
        aria-label="Ajouter aux favoris"
      >
        <HeartIcon filled={isFav} light />
      </button>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-6 py-5">
        <h2
          className="font-lora mb-3 text-2xl leading-tight font-bold text-white"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
        >
          {recipe.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/75">
            <ClockIcon size={12} />
            <span className="text-xs font-semibold">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <FlameIcon size={12} />
            <span className="text-xs font-semibold">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <MuscleIcon size={12} />
            <span className="text-xs font-semibold">{recipe.proteins}g protéines</span>
          </div>
          <Link
            href={`/recettes/${recipe.id}`}
            className="pointer-events-auto ml-auto flex items-center gap-2 rounded-xl bg-[#4A7C59] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105"
          >
            Voir les étapes
          </Link>
        </div>
      </div>
    </div>
  );
}
