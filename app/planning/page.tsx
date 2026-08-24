"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GenerateFromFridgeModal } from "@/components/generate-from-fridge-modal";
import { DaySelector } from "@/components/planning/day-selector";
import { ExportShoppingModal } from "@/components/planning/export-shopping-modal";
import { PlanningActions } from "@/components/planning/planning-actions";
import { PlanningGoals } from "@/components/planning/planning-goals";
import { PlanningMeals } from "@/components/planning/planning-meals";
import { SelectRecipeModal } from "@/components/select-recipe-modal";
import {
  addDays,
  calendarDateFromIso,
  dayKey,
  parisCalendarDate,
  sameDay,
  startOfWeek,
} from "@/lib/date-paris";
import { MEAL_TYPE_LABELS, type MealType } from "@/lib/meal-types";
import {
  applyRecipeToDay,
  breakfastRecipeId,
  buildInitialPlans,
  collectIngredientsFromSelectedMeals,
  EMPTY_DAY_PLAN,
  getStoredMealPlans,
  saveMealPlans,
  type DayPlan,
  type MealSlot,
  type SelectedMealTarget,
} from "@/lib/planning";
import { useProfile } from "@/lib/use-profile";
import { getRecipeById, type Recipe } from "@/lib/recipes";
import {
  appendIngredientsToShoppingList,
  countExportImpact,
  setExportBannerCount,
} from "@/lib/shopping-list";

const HORIZON_DAYS = 14;

export default function PlanningPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState(() => parisCalendarDate());
  const [plansByWeek, setPlansByWeek] = useState<Record<string, Record<string, DayPlan>>>({});
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlansByWeek(getStoredMealPlans());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveMealPlans(plansByWeek);
    }
  }, [plansByWeek, ready]);

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

  const lunch = dayPlan.lunchId != null ? getRecipeById(dayPlan.lunchId) ?? null : null;
  const dinner = dayPlan.dinnerId != null ? getRecipeById(dayPlan.dinnerId) ?? null : null;
  const breakfastId = breakfastRecipeId(dayPlan.breakfast);
  const breakfastRecipe = breakfastId != null ? getRecipeById(breakfastId) : undefined;

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
      return {
        ...prev,
        [targetWeekId]: {
          ...currentWeek,
          [key]: applyRecipeToDay(currentDay, slot, recipe),
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
    if (pickerSlot === "breakfast") return breakfastRecipeId(dayPlan.breakfast);
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
      <div className="mx-auto max-w-md px-4 pb-10 sm:max-w-2xl lg:max-w-5xl lg:px-10">
        <header className="fade-up pt-10 pb-5">
          <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
            Planificateur
          </p>
          <h1 className="font-lora text-2xl leading-tight font-bold text-[#1C2B1E]">
            Planning de la semaine
          </h1>
        </header>

        <PlanningGoals
          selectedDay={selectedDay}
          calories={totals.calories}
          proteins={totals.proteins}
          calorieGoal={profile.calories}
          proteinGoal={profile.proteins}
        />

        <section className="fade-up mb-6" style={{ animationDelay: "0.1s" }}>
          <DaySelector
            days={days}
            today={today}
            selectedDay={selectedDay}
            planForDay={planForDay}
            onSelectDay={setSelectedDate}
          />
        </section>

        <PlanningMeals
          dayPlan={dayPlan}
          lunch={lunch}
          dinner={dinner}
          breakfastRecipe={breakfastRecipe}
          onClear={clearMeal}
          onReplace={setPickerSlot}
        />

        <PlanningActions
          exportMessage={exportMessage}
          generateMessage={generateMessage}
          onExport={() => {
            setExportMessage(null);
            setExportModalOpen(true);
          }}
          onGenerate={() => {
            setExportMessage(null);
            setGenerateMessage(null);
            setGenerateModalOpen(true);
          }}
        />
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
