"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GenerateFromFridgeModal } from "@/components/generate-from-fridge-modal";
import {
  ClockIcon,
  FlameIcon,
  ProteinIcon,
} from "@/components/icons";
import { MissingIngredientsBadges } from "@/components/missing-ingredients-badges";
import { ExportShoppingModal } from "@/components/planning/export-shopping-modal";
import { SelectRecipeModal } from "@/components/select-recipe-modal";
import {
  addDays,
  calendarDateFromIso,
  dayKey,
  formatDayShortFr,
  parisCalendarDate,
  sameDay,
  startOfWeek,
} from "@/lib/date-paris";
import { MEAL_TYPE_LABELS, type MealType } from "@/lib/meal-types";
import {
  buildInitialPlans,
  collectIngredientsFromSelectedMeals,
  type DayPlan,
  type MealSlot,
  type SelectedMealTarget,
} from "@/lib/planning";
import { getRecipeById, type Recipe } from "@/lib/recipes";
import {
  appendIngredientsToShoppingList,
  countExportImpact,
  setExportBannerCount,
} from "@/lib/shopping-list";

const HORIZON_DAYS = 14;
const EMPTY_DAY_PLAN: DayPlan = {
  breakfast: null,
  lunchId: null,
  dinnerId: null,
};

function dayHasMeals(plan: DayPlan | undefined): boolean {
  if (!plan) return false;
  return plan.breakfast != null || plan.lunchId != null || plan.dinnerId != null;
}

import { MacroBar } from "@/components/planning/macro-bar";
import { DaySelector } from "@/components/planning/day-selector";
import { BreakfastCard, EmptyMealSlot } from "@/components/planning/breakfast-card";
import { RecipeCard } from "@/components/planning/recipe-card";


export default function PlanningPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => parisCalendarDate());
  const [plansByWeek, setPlansByWeek] = useState<Record<string, Record<string, DayPlan>>>({});
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const today = parisCalendarDate();
  const todayKey = dayKey(today);

  const days = useMemo(
    () => Array.from({ length: HORIZON_DAYS }, (_, i) => addDays(today, i)),
    // todayKey force le recalcul si le jour calendaire Paris change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayKey],
  );

  const selectedDay = useMemo(() => {
    const match = days.find((d) => sameDay(d, selectedDate));
    return match ?? days[0]!;
  }, [days, selectedDate]);

  const weekStart = startOfWeek(selectedDay);
  const weekId = dayKey(weekStart);
  const selectedKey = dayKey(selectedDay);

  const weekPlans = useMemo(() => {
    return plansByWeek[weekId] ?? buildInitialPlans(weekStart);
  }, [plansByWeek, weekId, weekStart]);

  const dayPlan = weekPlans[selectedKey] ?? EMPTY_DAY_PLAN;

  function planForDay(day: Date): DayPlan {
    const ws = startOfWeek(day);
    const plans = plansByWeek[dayKey(ws)] ?? buildInitialPlans(ws);
    return plans[dayKey(day)] ?? EMPTY_DAY_PLAN;
  }

  const lunch = dayPlan.lunchId != null ? getRecipeById(dayPlan.lunchId) : null;
  const dinner = dayPlan.dinnerId != null ? getRecipeById(dayPlan.dinnerId) : null;
  const breakfastRecipe =
    dayPlan.breakfast?.id.startsWith("recipe-")
      ? getRecipeById(Number(dayPlan.breakfast.id.slice("recipe-".length)))
      : undefined;

  const totals = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    if (dayPlan.breakfast) {
      calories += dayPlan.breakfast.calories;
      proteins += dayPlan.breakfast.proteins;
    }
    if (lunch) {
      calories += lunch.calories;
      proteins += lunch.proteins;
    }
    if (dinner) {
      calories += dinner.calories;
      proteins += dinner.proteins;
    }
    return { calories, proteins };
  }, [dayPlan.breakfast, lunch, dinner]);

  const CALORIE_GOAL = 2000;
  const PROTEIN_GOAL = 130;

  function updateDayPlan(patch: Partial<DayPlan>) {
    setPlansByWeek((prev) => {
      const currentWeek = prev[weekId] ?? buildInitialPlans(weekStart);
      return {
        ...prev,
        [weekId]: {
          ...currentWeek,
          [selectedKey]: { ...currentWeek[selectedKey], ...patch },
        },
      };
    });
  }

  function clearMeal(slot: MealSlot) {
    if (slot === "breakfast") updateDayPlan({ breakfast: null });
    if (slot === "lunch") updateDayPlan({ lunchId: null });
    if (slot === "dinner") updateDayPlan({ dinnerId: null });
  }

  function assignRecipeToDate(date: Date, slot: MealSlot, recipeId: number) {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;

    const targetWeekStart = startOfWeek(date);
    const targetWeekId = dayKey(targetWeekStart);
    const key = dayKey(date);

    setPlansByWeek((prev) => {
      const currentWeek = prev[targetWeekId] ?? buildInitialPlans(targetWeekStart);
      const currentDay = currentWeek[key] ?? { ...EMPTY_DAY_PLAN };
      const nextDay: DayPlan = { ...currentDay };
      if (slot === "breakfast") {
        nextDay.breakfast = {
          id: `recipe-${recipe.id}`,
          name: recipe.title,
          detail: `${recipe.difficulty} · ${recipe.time}`,
          calories: recipe.calories,
          proteins: recipe.proteins,
        };
      }
      if (slot === "lunch") nextDay.lunchId = recipe.id;
      if (slot === "dinner") nextDay.dinnerId = recipe.id;
      return {
        ...prev,
        [targetWeekId]: {
          ...currentWeek,
          [key]: nextDay,
        },
      };
    });

    setSelectedDate(date);
  }

  function selectRecipeForSlot(slot: MealSlot, recipeId: number) {
    assignRecipeToDate(selectedDay, slot, recipeId);
    setPickerSlot(null);
  }

  function currentPickerRecipeId(): number | null {
    if (pickerSlot === "lunch") return dayPlan.lunchId;
    if (pickerSlot === "dinner") return dayPlan.dinnerId;
    if (pickerSlot === "breakfast" && dayPlan.breakfast?.id.startsWith("recipe-")) {
      const parsed = Number(dayPlan.breakfast.id.slice("recipe-".length));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  function exportSelectedMeals(selectedMeals: SelectedMealTarget[]) {
    const ingredients = collectIngredientsFromSelectedMeals(
      selectedMeals,
      weekPlans,
      plansByWeek,
    );

    if (ingredients.length === 0) {
      setExportMessage("Aucun ingrédient à exporter pour ces repas.");
      setExportModalOpen(false);
      return;
    }

    const impact = countExportImpact(ingredients);
    appendIngredientsToShoppingList(ingredients);
    setExportBannerCount(impact);
    setExportMessage(null);
    setExportModalOpen(false);
    router.push("/courses");
  }

  function openManualMealPicker(reason?: string) {
    const slot: MealSlot =
      dayPlan.lunchId == null ? "lunch" : dayPlan.dinnerId == null ? "dinner" : "lunch";
    setGenerateMessage(
      reason ?? "IA indisponible — choisissez une recette manuellement.",
    );
    setPickerSlot(slot);
  }

  function defaultGenerateMealType(): MealType {
    if (dayPlan.lunchId == null) return "lunch";
    if (dayPlan.dinnerId == null) return "dinner";
    if (dayPlan.breakfast == null) return "breakfast";
    return "lunch";
  }

  function handleGeneratedFromFridge({
    dateIso,
    mealType,
    recipes,
  }: {
    dateIso: string;
    mealType: MealType;
    recipes: Recipe[];
  }) {
    const date = calendarDateFromIso(dateIso);
    const recipe = recipes[0];
    setGenerateModalOpen(false);
    if (!date || !recipe) {
      openManualMealPicker("Aucune recette générée — choisissez manuellement.");
      return;
    }
    assignRecipeToDate(date, mealType, recipe.id);
    setGenerateMessage(
      recipes.length === 1
        ? `Recette créée — ${recipe.title}`
        : `Option retenue — ${recipe.title} (${MEAL_TYPE_LABELS[mealType].toLowerCase()})`,
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-4 pb-10">
        {/* En-tête */}
        <header className="fade-up pt-10 pb-5">
          <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
            Planificateur
          </p>
          <h1 className="font-lora text-2xl leading-tight font-bold text-[#1C2B1E]">
            Planning de la semaine
          </h1>
        </header>

        {/* Objectifs macro */}
        <section className="fade-up mb-5" style={{ animationDelay: "0.06s" }}>
          <div
            className="rounded-3xl px-5 py-4"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-lora text-base font-bold text-[#1C2B1E]">Objectifs du jour</h2>
              <span className="rounded-lg bg-[#EBF2EC] px-2.5 py-1 text-xs font-bold text-[#2E5C3A]">
                {formatDayShortFr(selectedDay)} {selectedDay.getUTCDate()}
              </span>
            </div>
            <div className="space-y-3.5">
              <MacroBar
                label="Calories"
                current={totals.calories}
                target={CALORIE_GOAL}
                unit="kcal"
                color="linear-gradient(90deg, #F97316, #FB923C)"
                track="#FFF7ED"
              />
              <MacroBar
                label="Protéines"
                current={totals.proteins}
                target={PROTEIN_GOAL}
                unit="g"
                color="linear-gradient(90deg, #4A7C59, #6FAE82)"
                track="#EBF2EC"
              />
            </div>
          </div>
        </section>

        <section className="fade-up mb-6" style={{ animationDelay: "0.1s" }}>
          <DaySelector
            days={days}
            today={today}
            selectedDay={selectedDay}
            planForDay={planForDay}
            onSelectDay={setSelectedDate}
          />
        </section>
        {/* Repas du jour */}
        <section className="fade-up mb-6 space-y-5" style={{ animationDelay: "0.14s" }}>
          {/* Petit-déjeuner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Petit-déjeuner</h2>
            {dayPlan.breakfast ? (
              <BreakfastCard
                breakfast={dayPlan.breakfast}
                recipe={breakfastRecipe}
                onClear={() => clearMeal("breakfast")}
                onReplace={() => setPickerSlot("breakfast")}
              />
            ) : (
              <EmptyMealSlot label="Ajouter un petit-déjeuner" onClick={() => setPickerSlot("breakfast")} />
            )}
          </div>

          {/* Déjeuner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Déjeuner</h2>
            {lunch ? (
              <RecipeCard
                recipe={lunch}
                slotName="déjeuner"
                onClear={() => clearMeal("lunch")}
                onReplace={() => setPickerSlot("lunch")}
              />
            ) : (
              <EmptyMealSlot label="Ajouter une recette" onClick={() => setPickerSlot("lunch")} />
            )}
          </div>

          {/* Dîner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Dîner</h2>
            {dinner ? (
              <RecipeCard
                recipe={dinner}
                slotName="dîner"
                onClear={() => clearMeal("dinner")}
                onReplace={() => setPickerSlot("dinner")}
              />
            ) : (
              <EmptyMealSlot label="Ajouter une recette" onClick={() => setPickerSlot("dinner")} />
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="fade-up space-y-3" style={{ animationDelay: "0.18s" }}>
          <button
            type="button"
            onClick={() => {
              setExportMessage(null);
              setExportModalOpen(true);
            }}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-center text-sm font-bold"
          >
            <span aria-hidden>🛒</span>
            Exporter vers la liste de courses
          </button>

          {exportMessage && (
            <p className="text-center text-xs font-semibold text-[#C2410C]">{exportMessage}</p>
          )}

          <button
            type="button"
            onClick={() => {
              setExportMessage(null);
              setGenerateMessage(null);
              setGenerateModalOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#C8E0CF] bg-white py-3.5 text-sm font-bold text-[#2E5C3A] transition-all hover:bg-[#EBF2EC] active:scale-[0.98]"
          >
            <span aria-hidden>🎲</span>
            Générer automatiquement selon mon frigo
          </button>

          {generateMessage && (
            <p className="text-center text-xs font-semibold text-[#2E5C3A]">{generateMessage}</p>
          )}
        </section>
      </div>

      {exportModalOpen && (
        <ExportShoppingModal
          weekStart={weekStart}
          weekPlans={weekPlans}
          onClose={() => setExportModalOpen(false)}
          onConfirm={exportSelectedMeals}
        />
      )}

      {generateModalOpen && (
        <GenerateFromFridgeModal
          defaultDate={selectedDay}
          defaultMealType={defaultGenerateMealType()}
          onClose={() => setGenerateModalOpen(false)}
          onGenerated={handleGeneratedFromFridge}
        />
      )}

      {pickerSlot && (
        <SelectRecipeModal
          slot={pickerSlot}
          currentRecipeId={currentPickerRecipeId()}
          onSelect={(recipeId) => selectRecipeForSlot(pickerSlot, recipeId)}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
}

