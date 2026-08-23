import { BreakfastCard, EmptyMealSlot } from "@/components/planning/breakfast-card";
import { RecipeCard } from "@/components/planning/recipe-card";
import type { DayPlan, MealSlot } from "@/lib/planning";
import type { Recipe } from "@/lib/recipes";

export function PlanningMeals({
  dayPlan,
  lunch,
  dinner,
  breakfastRecipe,
  onClear,
  onReplace,
}: {
  dayPlan: DayPlan;
  lunch: Recipe | null;
  dinner: Recipe | null;
  breakfastRecipe?: Recipe;
  onClear: (slot: MealSlot) => void;
  onReplace: (slot: MealSlot) => void;
}) {
  return (
    <section className="fade-up mb-6 space-y-5" style={{ animationDelay: "0.14s" }}>
      <div>
        <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Petit-déjeuner</h2>
        {dayPlan.breakfast ? (
          <BreakfastCard
            breakfast={dayPlan.breakfast}
            recipe={breakfastRecipe}
            onClear={() => onClear("breakfast")}
            onReplace={() => onReplace("breakfast")}
          />
        ) : (
          <EmptyMealSlot label="Ajouter un petit-déjeuner" onClick={() => onReplace("breakfast")} />
        )}
      </div>

      <div>
        <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Déjeuner</h2>
        {lunch ? (
          <RecipeCard
            recipe={lunch}
            slotName="déjeuner"
            onClear={() => onClear("lunch")}
            onReplace={() => onReplace("lunch")}
          />
        ) : (
          <EmptyMealSlot label="Ajouter une recette" onClick={() => onReplace("lunch")} />
        )}
      </div>

      <div>
        <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Dîner</h2>
        {dinner ? (
          <RecipeCard
            recipe={dinner}
            slotName="dîner"
            onClear={() => onClear("dinner")}
            onReplace={() => onReplace("dinner")}
          />
        ) : (
          <EmptyMealSlot label="Ajouter une recette" onClick={() => onReplace("dinner")} />
        )}
      </div>
    </section>
  );
}
