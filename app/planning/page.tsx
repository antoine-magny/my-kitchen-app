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
  collectIngredientsFromDayOnward,
  type DayPlan,
  type MealSlot,
} from "@/lib/planning";
import { getRecipeById, type Recipe } from "@/lib/recipes";
import { replaceShoppingListFromIngredients, setExportBannerCount } from "@/lib/shopping-list";

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

function MacroBar({
  label,
  current,
  target,
  unit,
  color,
  track,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  track: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-[#1C2B1E]">{label}</span>
        <span className="text-xs font-semibold text-[#7A8F7D]">
          {current.toLocaleString("fr-FR")} / {target.toLocaleString("fr-FR")} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: track }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function PlanningPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => parisCalendarDate());
  const [plansByWeek, setPlansByWeek] = useState<Record<string, Record<string, DayPlan>>>({});
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
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

  function exportToShoppingList() {
    const ingredients = collectIngredientsFromDayOnward(
      selectedDay,
      weekStart,
      weekPlans,
      plansByWeek,
    );

    if (ingredients.length === 0) {
      setExportMessage("Aucun repas à exporter à partir de ce jour.");
      return;
    }

    const items = replaceShoppingListFromIngredients(ingredients);
    setExportBannerCount(items.length);
    setExportMessage(null);
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

        {/* Sélecteur de jours — 14 jours depuis aujourd'hui */}
        <section className="fade-up mb-6" style={{ animationDelay: "0.1s" }}>
          <div className="-mx-4 flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((day) => {
              const selected = sameDay(day, selectedDay);
              const isToday = sameDay(day, today);
              const hasMeals = dayHasMeals(planForDay(day));
              return (
                <button
                  key={dayKey(day)}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className="flex w-[58px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-all active:scale-95"
                  style={
                    selected
                      ? {
                          background: "linear-gradient(160deg, #2E5B3E, #4A7C59)",
                          boxShadow: "0 4px 14px rgba(46,91,62,0.28)",
                          color: "#fff",
                        }
                      : {
                          background: "#FFFFFF",
                          boxShadow: "0 2px 10px rgba(74,124,89,0.08)",
                          border: "1.5px solid #E2EBE3",
                          color: "#1C2B1E",
                        }
                  }
                  aria-pressed={selected}
                  aria-label={`${formatDayShortFr(day)} ${day.getUTCDate()}${isToday ? " (aujourd'hui)" : ""}`}
                >
                  <span
                    className={`text-[11px] font-semibold ${selected ? "text-white/80" : "text-[#7A8F7D]"}`}
                  >
                    {isToday ? "Auj." : formatDayShortFr(day)}
                  </span>
                  <span className="text-base font-extrabold leading-none">{day.getUTCDate()}</span>
                  {hasMeals && (
                    <span
                      className="mt-0.5 h-1.5 w-1.5 rounded-full"
                      style={{
                        background: selected ? "#A7F3D0" : "#4A7C59",
                        boxShadow: selected
                          ? "0 0 6px rgba(167,243,208,0.85)"
                          : "0 0 4px rgba(74,124,89,0.45)",
                      }}
                      aria-hidden
                    />
                  )}
                  {!hasMeals && isToday && (
                    <span
                      className="mt-0.5 h-1 w-1 rounded-full"
                      style={{ background: selected ? "#fff" : "#4A7C59" }}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>
        {/* Repas du jour */}
        <section className="fade-up mb-6 space-y-5" style={{ animationDelay: "0.14s" }}>
          {/* Petit-déjeuner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Petit-déjeuner</h2>
            {dayPlan.breakfast ? (
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
                    <p className="truncate text-sm font-bold text-[#1C2B1E]">{dayPlan.breakfast.name}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
                      {dayPlan.breakfast.detail} · {dayPlan.breakfast.calories} kcal · {dayPlan.breakfast.proteins}g prot.
                    </p>
                    <MissingIngredientsBadges names={breakfastRecipe?.missingIngredients} className="mt-2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => clearMeal("breakfast")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base transition-colors hover:bg-[#FEF2F2] active:scale-95"
                    aria-label="Supprimer le petit-déjeuner"
                  >
                    ❌
                  </button>
                </div>
                <div className="border-t border-[#F0F4EF] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPickerSlot("breakfast")}
                    className="btn-primary block w-full rounded-2xl py-3 text-center text-sm font-bold"
                  >
                    Remplacer
                  </button>
                </div>
              </div>
            ) : (
              <EmptyMealSlot label="Ajouter un petit-déjeuner" onClick={() => setPickerSlot("breakfast")} />
            )}
          </div>

          {/* Déjeuner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Déjeuner</h2>
            {lunch ? (
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 6px 32px rgba(74,124,89,0.13)",
                }}
              >
                <div className="relative h-44 bg-[#D4EDD9]">
                  <Link href={`/recettes/${lunch.id}`} className="absolute inset-0 block">
                    {lunch.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lunch.photo} alt={lunch.title} className="h-full w-full object-cover" />
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
                    onClick={() => clearMeal("lunch")}
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-sm backdrop-blur-sm transition-all active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.90)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                    aria-label="Supprimer le déjeuner"
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
                    <span className="text-xs font-bold text-[#1C2B1E]">{lunch.time}</span>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <Link href={`/recettes/${lunch.id}`}>
                    <h3 className="font-lora mb-3 text-base leading-snug font-bold text-[#1C2B1E]">
                      {lunch.title}
                    </h3>
                  </Link>
                  <MissingIngredientsBadges names={lunch.missingIngredients} className="mb-3" />

                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                      <span className="text-[#F97316]">
                        <FlameIcon size={13} />
                      </span>
                      <span className="text-xs font-bold text-[#C2410C]">{lunch.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                      <span className="text-[#4A7C59]">
                        <ProteinIcon size={13} />
                      </span>
                      <span className="text-xs font-bold text-[#2E5C3A]">{lunch.proteins}g protéines</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPickerSlot("lunch")}
                    className="btn-primary block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
                  >
                    Remplacer
                  </button>
                </div>
              </div>
            ) : (
              <EmptyMealSlot label="Ajouter une recette" onClick={() => setPickerSlot("lunch")} />
            )}
          </div>

          {/* Dîner */}
          <div>
            <h2 className="font-lora mb-2.5 text-lg font-bold text-[#1C2B1E]">Dîner</h2>
            {dinner ? (
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 6px 32px rgba(74,124,89,0.13)",
                }}
              >
                <div className="relative h-44 bg-[#D4EDD9]">
                  <Link href={`/recettes/${dinner.id}`} className="absolute inset-0 block">
                    {dinner.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dinner.photo} alt={dinner.title} className="h-full w-full object-cover" />
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
                    onClick={() => clearMeal("dinner")}
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-sm backdrop-blur-sm transition-all active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.90)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                    aria-label="Supprimer le dîner"
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
                    <span className="text-xs font-bold text-[#1C2B1E]">{dinner.time}</span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <Link href={`/recettes/${dinner.id}`}>
                    <h3 className="font-lora mb-3 text-base leading-snug font-bold text-[#1C2B1E]">
                      {dinner.title}
                    </h3>
                  </Link>
                  <MissingIngredientsBadges names={dinner.missingIngredients} className="mb-3" />

                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                      <span className="text-[#F97316]">
                        <FlameIcon size={13} />
                      </span>
                      <span className="text-xs font-bold text-[#C2410C]">{dinner.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                      <span className="text-[#4A7C59]">
                        <ProteinIcon size={13} />
                      </span>
                      <span className="text-xs font-bold text-[#2E5C3A]">{dinner.proteins}g protéines</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPickerSlot("dinner")}
                    className="btn-primary block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
                  >
                    Remplacer
                  </button>
                </div>
              </div>
            ) : (
              <EmptyMealSlot label="Ajouter une recette" onClick={() => setPickerSlot("dinner")} />
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="fade-up space-y-3" style={{ animationDelay: "0.18s" }}>
          <button
            type="button"
            onClick={exportToShoppingList}
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

function EmptyMealSlot({ label, onClick }: { label: string; onClick: () => void }) {
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
