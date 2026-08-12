"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SelectRecipeModal } from "@/components/select-recipe-modal";
import {
  addDays,
  dayKey,
  formatWeekLabel,
  mondayBasedIndex,
  parisCalendarDate,
  sameDay,
  startOfWeek,
} from "@/lib/date-paris";
import type { GenerateFromFridgeResult } from "@/lib/generate-from-fridge";
import { getFridgeSnapshot } from "@/lib/fridge";
import {
  addCustomRecipe,
  getRecipeById,
  type RecipeIngredient,
} from "@/lib/recipes";
import { replaceShoppingListFromIngredients, setExportBannerCount } from "@/lib/shopping-list";

const LUNCH_RECIPE = getRecipeById(6)!;

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

type MealSlot = "breakfast" | "lunch" | "dinner";

type BreakfastItem = {
  id: string;
  name: string;
  detail: string;
  calories: number;
  proteins: number;
};

type DayPlan = {
  breakfast: BreakfastItem | null;
  lunchId: number | null;
  dinnerId: number | null;
};

function parseDayKey(key: string): Date | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

function buildInitialPlans(weekStart: Date): Record<string, DayPlan> {
  const isCurrentWeek = sameDay(weekStart, startOfWeek(parisCalendarDate()));
  const seedIndex = isCurrentWeek ? mondayBasedIndex(parisCalendarDate()) : -1;
  const plans: Record<string, DayPlan> = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const key = dayKey(day);
    const seeded = i === seedIndex;
    plans[key] = {
      breakfast: seeded
        ? {
            id: "bf-yaourt",
            name: "Yaourt grec & granola",
            detail: "Maison · 5 min",
            calories: 320,
            proteins: 18,
          }
        : null,
      lunchId: seeded ? LUNCH_RECIPE.id : null,
      dinnerId: null,
    };
  }
  return plans;
}

function ingredientsFromDayPlan(plan: DayPlan): RecipeIngredient[] {
  const items: RecipeIngredient[] = [];

  if (plan.breakfast) {
    if (plan.breakfast.id.startsWith("recipe-")) {
      const recipeId = Number(plan.breakfast.id.slice("recipe-".length));
      const recipe = Number.isFinite(recipeId) ? getRecipeById(recipeId) : undefined;
      if (recipe) items.push(...recipe.ingredients);
      else items.push({ name: plan.breakfast.name, amount: "1 portion" });
    } else if (plan.breakfast.id === "bf-yaourt") {
      items.push(
        { name: "Yaourt grec", amount: "1 pot" },
        { name: "Granola", amount: "40 g" },
      );
    } else {
      items.push({ name: plan.breakfast.name, amount: "1 portion" });
    }
  }

  for (const recipeId of [plan.lunchId, plan.dinnerId]) {
    if (recipeId == null) continue;
    const recipe = getRecipeById(recipeId);
    if (recipe) items.push(...recipe.ingredients);
  }

  return items;
}

function collectIngredientsFromDayOnward(
  fromDay: Date,
  currentWeekStart: Date,
  currentWeekPlans: Record<string, DayPlan>,
  plansByWeek: Record<string, Record<string, DayPlan>>,
): RecipeIngredient[] {
  const weeks: Record<string, Record<string, DayPlan>> = {
    ...plansByWeek,
    [dayKey(currentWeekStart)]: currentWeekPlans,
  };

  const collected: RecipeIngredient[] = [];
  const fromTs = fromDay.getTime();

  for (const plans of Object.values(weeks)) {
    for (const [key, plan] of Object.entries(plans)) {
      const day = parseDayKey(key);
      if (!day || day.getTime() < fromTs) continue;
      collected.push(...ingredientsFromDayPlan(plan));
    }
  }

  return collected;
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ProteinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12M12 12C12 12 8 10 8 6a4 4 0 0 1 8 0c0 4-4 6-4 6z" />
      <path d="M8 22h8" />
    </svg>
  );
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(() => mondayBasedIndex(parisCalendarDate()));
  const [plansByWeek, setPlansByWeek] = useState<Record<string, Record<string, DayPlan>>>({});
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const today = parisCalendarDate();
  const todayKey = dayKey(today);

  const weekStart = useMemo(() => {
    return addDays(startOfWeek(today), weekOffset * 7);
    // todayKey force le recalcul si le jour calendaire Paris change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, todayKey]);

  const weekId = dayKey(weekStart);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const selectedDay = days[selectedIndex];
  const selectedKey = dayKey(selectedDay);

  const weekPlans = useMemo(() => {
    return plansByWeek[weekId] ?? buildInitialPlans(weekStart);
  }, [plansByWeek, weekId, weekStart]);

  const dayPlan = weekPlans[selectedKey] ?? {
    breakfast: null,
    lunchId: null,
    dinnerId: null,
  };

  const lunch = dayPlan.lunchId != null ? getRecipeById(dayPlan.lunchId) : null;
  const dinner = dayPlan.dinnerId != null ? getRecipeById(dayPlan.dinnerId) : null;

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

  function selectRecipeForSlot(slot: MealSlot, recipeId: number) {
    if (slot === "breakfast") {
      const recipe = getRecipeById(recipeId);
      if (!recipe) return;
      updateDayPlan({
        breakfast: {
          id: `recipe-${recipe.id}`,
          name: recipe.title,
          detail: `${recipe.difficulty} · ${recipe.time}`,
          calories: recipe.calories,
          proteins: recipe.proteins,
        },
      });
    }
    if (slot === "lunch") updateDayPlan({ lunchId: recipeId });
    if (slot === "dinner") updateDayPlan({ dinnerId: recipeId });
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

  function shiftWeek(delta: number) {
    const nextOffset = weekOffset + delta;
    setWeekOffset(nextOffset);
    setSelectedIndex(nextOffset === 0 ? mondayBasedIndex(parisCalendarDate()) : 0);
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

  async function generateFromFridgeForDay() {
    setExportMessage(null);
    setGenerating(true);
    try {
      const snapshot = getFridgeSnapshot();
      if (snapshot.length === 0) {
        setGenerateMessage("Votre frigo est vide — ajoutez des ingrédients d’abord.");
        return;
      }

      const response = await fetch("/api/generate-from-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: snapshot,
          mode: "ai_create",
          mealCount: 2,
          preferExpiring: true,
          excludeDesserts: true,
        }),
      });

      if (!response.ok) {
        openManualMealPicker("Impossible de générer — choisissez une recette.");
        return;
      }

      const result = (await response.json()) as GenerateFromFridgeResult;

      // IA KO → même menu que « Remplacer », sans auto-remplir le fallback.
      if (result.aiUnavailable || !result.suggestions.some((s) => s.source === "ai")) {
        const detail = result.message?.includes("GEMINI_API_KEY")
          ? "Clé Gemini manquante ou invalide — choisissez une recette."
          : "IA indisponible — choisissez une recette pour ce repas.";
        openManualMealPicker(detail);
        return;
      }

      const recipeIds: number[] = [];
      const titles: string[] = [];

      for (const suggestion of result.suggestions) {
        if (suggestion.source === "ai" && suggestion.recipeDraft) {
          const recipe = addCustomRecipe(suggestion.recipeDraft);
          recipeIds.push(recipe.id);
          titles.push(recipe.title);
        }
      }

      const lunchId = recipeIds[0] ?? null;
      const dinnerId = recipeIds[1] ?? recipeIds[0] ?? null;

      if (lunchId == null && dinnerId == null) {
        openManualMealPicker(
          result.message ?? "Aucune recette générée — choisissez manuellement.",
        );
        return;
      }

      updateDayPlan({
        lunchId: lunchId ?? dayPlan.lunchId,
        dinnerId: dinnerId ?? dayPlan.dinnerId,
      });

      setGenerateMessage(
        titles.length === 1
          ? `Recette créée — ${titles[0]}`
          : `Recettes créées — ${titles.slice(0, 2).join(" · ")}`,
      );
    } catch {
      openManualMealPicker("Impossible de générer — choisissez une recette.");
    } finally {
      setGenerating(false);
    }
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

          <div
            className="mt-4 flex items-center justify-between gap-2 rounded-2xl px-2 py-2"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 2px 14px rgba(74,124,89,0.10)",
              border: "1.5px solid #E2EBE3",
            }}
          >
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#4A7C59] transition-colors hover:bg-[#EBF2EC] active:scale-95"
              aria-label="Semaine précédente"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <p className="min-w-0 flex-1 text-center text-sm font-bold text-[#1C2B1E]">
              {formatWeekLabel(weekStart, MONTHS_FR)}
            </p>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#4A7C59] transition-colors hover:bg-[#EBF2EC] active:scale-95"
              aria-label="Semaine suivante"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
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
                {DAY_SHORT[selectedIndex]} {selectedDay.getUTCDate()}
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

        {/* Jours de la semaine */}
        <section className="fade-up mb-6" style={{ animationDelay: "0.1s" }}>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((day, index) => {
              const selected = index === selectedIndex;
              const isToday = sameDay(day, today);
              return (
                <button
                  key={dayKey(day)}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className="flex w-[58px] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-all active:scale-95"
                  style={
                    selected
                      ? {
                          background: "linear-gradient(160deg, #2E5C3A, #4A7C59)",
                          boxShadow: "0 4px 14px rgba(46,92,58,0.28)",
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
                >
                  <span
                    className={`text-[11px] font-semibold ${selected ? "text-white/80" : "text-[#7A8F7D]"}`}
                  >
                    {DAY_SHORT[index]}
                  </span>
                  <span className="text-base font-extrabold leading-none">{day.getUTCDate()}</span>
                  {isToday && (
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lunch.photo} alt={lunch.title} className="h-full w-full object-cover" />
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
                      <ClockIcon />
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

                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                      <span className="text-[#F97316]">
                        <FlameIcon />
                      </span>
                      <span className="text-xs font-bold text-[#C2410C]">{lunch.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                      <span className="text-[#4A7C59]">
                        <ProteinIcon />
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dinner.photo} alt={dinner.title} className="h-full w-full object-cover" />
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
                      <ClockIcon />
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

                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                      <span className="text-[#F97316]">
                        <FlameIcon />
                      </span>
                      <span className="text-xs font-bold text-[#C2410C]">{dinner.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                      <span className="text-[#4A7C59]">
                        <ProteinIcon />
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
            onClick={generateFromFridgeForDay}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#C8E0CF] bg-white py-3.5 text-sm font-bold text-[#2E5C3A] transition-all hover:bg-[#EBF2EC] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            <span aria-hidden>🎲</span>
            {generating ? "Génération…" : "Générer automatiquement selon mon frigo"}
          </button>

          {generateMessage && (
            <p className="text-center text-xs font-semibold text-[#2E5C3A]">{generateMessage}</p>
          )}
        </section>
      </div>

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
