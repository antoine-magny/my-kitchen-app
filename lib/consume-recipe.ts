/**
 * Consommation d'une recette : matching frigo ↔ ingrédients, déduction des
 * quantités, libération des réservations `plannedMeals` du jour.
 * Aucun JSX — testable. La persistance localStorage est exposée à part pour
 * que l'UI reste maîtresse de l'écriture.
 */

import {
  dayKey,
  isoDateFromCalendar,
  parisCalendarDate,
  startOfWeek,
} from "@/lib/date-paris";
import { findFuzzyMatch } from "@/lib/fuzzy-search";
import {
  FRIDGE_STORAGE_KEY,
  getFridgeItems,
  isFridgeStorageLocation,
} from "@/lib/fridge";
import { getIngredientEquivalence, resolveIngredientId } from "@/lib/ingredients";
import { isMealType } from "@/lib/meal-types";
import {
  breakfastRecipeId,
  EMPTY_DAY_PLAN,
  getPlanForDay,
  getStoredMealPlans,
  saveMealPlans,
  type MealSlot,
} from "@/lib/planning";
import { normalizeProductName } from "@/lib/shopping-categories";
import {
  coerceUnitCode,
  DEFAULT_UNIT,
  UNITS,
  UNQUANTIFIED_UNIT,
  type UnitCode,
} from "@/lib/units";
import type { FridgeItem, PlannedMealRef, RecipeIngredient } from "@/types/inventory";

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const NAME_STOPWORDS = new Set(["des", "les", "une", "aux", "avec", "pour", "dans"]);

export type FridgeDeduction = {
  id: string;
  amountToDeduct: number;
};

/** Ligne prête pour la checklist de confirmation (unité = celle du frigo). */
export type FridgeDeductionPreview = {
  id: string;
  name: string;
  icon?: string;
  unit: UnitCode;
  fridgeAmount: number;
  amountToDeduct: number;
  remainingAfter: number;
  recipeNames: string[];
};

export type RecipeFridgeMatch = {
  deductions: FridgeDeductionPreview[];
  unmatched: RecipeIngredient[];
};

export type ConsumeRecipeOptions = {
  recipeId: number;
  recipeTitle?: string;
  /** YYYY-MM-DD, défaut : jour calendaire Paris. */
  todayIso?: string;
};

function roundAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value * 1000) / 1000;
  return rounded < 0.001 ? 0 : rounded;
}

function significantTokens(name: string): string[] {
  return normalizeProductName(name)
    .split(" ")
    .filter((token) => token.length >= 3 && !NAME_STOPWORDS.has(token));
}

function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

/** Matching de noms : égalité, mot entier, inclusion (mots ≥ 4 lettres), tokens, fuzzy. */
function namesMatch(recipeName: string, fridgeName: string): boolean {
  const recipeNorm = normalizeProductName(recipeName);
  const fridgeNorm = normalizeProductName(fridgeName);
  if (!recipeNorm || !fridgeNorm) return false;
  if (recipeNorm === fridgeNorm) return true;

  const shorter = recipeNorm.length <= fridgeNorm.length ? recipeNorm : fridgeNorm;
  const longer = recipeNorm.length <= fridgeNorm.length ? fridgeNorm : recipeNorm;
  if (shorter.length >= 3 && hasWord(longer, shorter)) return true;
  if (shorter.length >= 4 && longer.includes(shorter)) return true;

  const recipeTokens = new Set(significantTokens(recipeName));
  if (recipeTokens.size > 0) {
    const hit = significantTokens(fridgeName).some(
      (token) => token.length >= 3 && recipeTokens.has(token),
    );
    if (hit) return true;
  }

  return findFuzzyMatch(recipeNorm, [{ text: fridgeNorm, item: true }]) != null;
}

export function fridgeItemMatchesIngredient(
  item: FridgeItem,
  ingredient: RecipeIngredient,
): boolean {
  if (item.amount <= 0) return false;
  if (ingredient.ingredientId && item.ingredientId === ingredient.ingredientId) return true;
  if (ingredient.ingredientId && resolveIngredientId(item.customName) === ingredient.ingredientId) {
    return true;
  }
  if (item.ingredientId && resolveIngredientId(ingredient.name) === item.ingredientId) {
    return true;
  }
  return namesMatch(ingredient.name, item.customName);
}

/**
 * Convertit une quantité vers une autre unité (même famille, ou équivalence
 * catalogue pièce ↔ g / ml). `null` si inconvertible.
 */
export function convertToUnit(
  amount: number,
  fromUnit: UnitCode,
  toUnit: UnitCode,
  ingredientNameOrId?: string,
): number | null {
  if (!Number.isFinite(amount)) return null;
  if (fromUnit === toUnit) return amount;
  if (fromUnit === UNQUANTIFIED_UNIT || toUnit === UNQUANTIFIED_UNIT) return null;

  const from = UNITS[fromUnit];
  const to = UNITS[toUnit];
  if (!from || !to) return null;

  if (from.category === to.category) {
    return (amount * from.baseRatio) / to.baseRatio;
  }

  const identity = ingredientNameOrId?.trim();
  const eq = getIngredientEquivalence(identity);
  if (from.category === "mass" && to.category === "count" && eq?.gramsPerCountUnit) {
    return (amount * from.baseRatio) / eq.gramsPerCountUnit;
  }
  if (from.category === "count" && to.category === "mass" && eq?.gramsPerCountUnit) {
    return (amount * eq.gramsPerCountUnit) / to.baseRatio;
  }
  if (from.category === "volume" && to.category === "count" && eq?.mlPerCountUnit) {
    return (amount * from.baseRatio) / eq.mlPerCountUnit;
  }
  if (from.category === "count" && to.category === "volume" && eq?.mlPerCountUnit) {
    return (amount * eq.mlPerCountUnit) / to.baseRatio;
  }
  return null;
}

function expirationSortKey(item: FridgeItem): number {
  if (!item.expirationDate) return Number.POSITIVE_INFINITY;
  const ts = Date.parse(item.expirationDate);
  return Number.isFinite(ts) ? ts : Number.POSITIVE_INFINITY;
}

function mergePreview(
  existing: FridgeDeductionPreview,
  extra: FridgeDeductionPreview,
): FridgeDeductionPreview {
  const amountToDeduct = roundAmount(existing.amountToDeduct + extra.amountToDeduct);
  const remainingAfter = roundAmount(existing.fridgeAmount - amountToDeduct);
  const recipeNames = [...existing.recipeNames];
  for (const name of extra.recipeNames) {
    if (!recipeNames.includes(name)) recipeNames.push(name);
  }
  return { ...existing, amountToDeduct, remainingAfter, recipeNames };
}

/**
 * Identifie les aliments du frigo correspondant à la recette (`ingredientId`
 * puis nom) et calcule les quantités à déduire / restantes.
 */
export function matchRecipeIngredientsWithFridge(
  recipeIngredients: RecipeIngredient[],
  fridgeItems: FridgeItem[],
): RecipeFridgeMatch {
  const remaining = new Map(fridgeItems.map((item) => [item.id, item.amount]));
  const byId = new Map(fridgeItems.map((item) => [item.id, item]));
  const merged = new Map<string, FridgeDeductionPreview>();
  const unmatched: RecipeIngredient[] = [];

  for (const ingredient of recipeIngredients) {
    const neededStart =
      ingredient.unit === UNQUANTIFIED_UNIT || ingredient.amount <= 0 ? 0 : ingredient.amount;
    if (neededStart <= 0) continue;

    const identity = ingredient.ingredientId || ingredient.name;
    const candidates = fridgeItems
      .filter((item) => fridgeItemMatchesIngredient(item, ingredient))
      .filter((item) => (remaining.get(item.id) ?? 0) > 0)
      .sort((a, b) => expirationSortKey(a) - expirationSortKey(b));

    let needed = neededStart;
    let deductedSomething = false;

    for (const item of candidates) {
      if (needed <= 0) break;
      const stock = remaining.get(item.id) ?? 0;
      if (stock <= 0) continue;

      const stockInRecipeUnit = convertToUnit(stock, item.unit, ingredient.unit, identity);
      if (stockInRecipeUnit == null || stockInRecipeUnit <= 0) continue;

      const takeRecipeUnit = Math.min(needed, stockInRecipeUnit);
      const takeFridgeUnit = convertToUnit(takeRecipeUnit, ingredient.unit, item.unit, identity);
      if (takeFridgeUnit == null || takeFridgeUnit <= 0) continue;

      const actualTake = roundAmount(Math.min(takeFridgeUnit, stock));
      if (actualTake <= 0) continue;

      remaining.set(item.id, roundAmount(stock - actualTake));
      const consumedRecipe = convertToUnit(actualTake, item.unit, ingredient.unit, identity);
      needed = roundAmount(needed - (consumedRecipe ?? takeRecipeUnit));
      deductedSomething = true;

      const preview: FridgeDeductionPreview = {
        id: item.id,
        name: item.customName,
        ...(item.icon ? { icon: item.icon } : {}),
        unit: item.unit,
        fridgeAmount: item.amount,
        amountToDeduct: actualTake,
        remainingAfter: roundAmount(item.amount - actualTake),
        recipeNames: [ingredient.name],
      };
      const previous = merged.get(item.id);
      merged.set(item.id, previous ? mergePreview(previous, preview) : preview);
    }

    if (!deductedSomething) unmatched.push(ingredient);
  }

  const deductions = [...merged.values()].map((row) => {
    const item = byId.get(row.id);
    const fridgeAmount = item?.amount ?? row.fridgeAmount;
    const amountToDeduct = roundAmount(Math.min(row.amountToDeduct, fridgeAmount));
    return {
      ...row,
      fridgeAmount,
      amountToDeduct,
      remainingAfter: roundAmount(fridgeAmount - amountToDeduct),
    };
  });

  return { deductions, unmatched };
}

function parsePlannedMealRef(raw: unknown): PlannedMealRef | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<PlannedMealRef>;
  if (typeof entry.recipeTitle !== "string" || !entry.recipeTitle.trim()) return null;
  if (typeof entry.date !== "string" || !ISO_CALENDAR_DATE.test(entry.date)) return null;
  if (!isMealType(entry.mealType)) return null;
  return {
    ...(typeof entry.recipeId === "number" && Number.isFinite(entry.recipeId)
      ? { recipeId: entry.recipeId }
      : {}),
    recipeTitle: entry.recipeTitle.trim(),
    date: entry.date,
    mealType: entry.mealType,
  };
}

function parsePlannedMeals(raw: unknown): PlannedMealRef[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const meals = raw.map(parsePlannedMealRef).filter((ref): ref is PlannedMealRef => ref != null);
  return meals.length > 0 ? meals : undefined;
}

function reservationMatchesRecipe(
  ref: PlannedMealRef,
  recipeId: number,
  recipeTitle: string | undefined,
  todayIso: string,
): boolean {
  if (ref.date !== todayIso) return false;
  if (ref.recipeId != null) return ref.recipeId === recipeId;
  if (recipeTitle) return ref.recipeTitle === recipeTitle;
  return false;
}

function releaseTodayReservations(
  meals: PlannedMealRef[] | undefined,
  recipeId: number,
  recipeTitle: string | undefined,
  todayIso: string,
): PlannedMealRef[] | undefined {
  if (!meals?.length) return undefined;
  const kept = meals.filter((ref) => !reservationMatchesRecipe(ref, recipeId, recipeTitle, todayIso));
  return kept.length > 0 ? kept : undefined;
}

function allowedFridgeIds(
  recipeIngredients: RecipeIngredient[],
  fridgeItems: FridgeItem[],
): Set<string> {
  const ids = new Set<string>();
  for (const ingredient of recipeIngredients) {
    for (const item of fridgeItems) {
      if (fridgeItemMatchesIngredient(item, ingredient)) ids.add(item.id);
    }
  }
  return ids;
}

/**
 * Applique les déductions et libère les `plannedMeals` du jour pour cette
 * recette (les réservations d'autres recettes / d'autres jours sont conservées).
 * Retourne un nouvel inventaire — n'écrit pas le localStorage.
 */
export function consumeRecipeIngredients(
  recipeIngredients: RecipeIngredient[],
  itemsToDeduct: FridgeDeduction[],
  fridgeItems: FridgeItem[],
  options: ConsumeRecipeOptions,
): FridgeItem[] {
  const todayIso = options.todayIso ?? isoDateFromCalendar(parisCalendarDate());
  const allowed = allowedFridgeIds(recipeIngredients, fridgeItems);
  const deductById = new Map<string, number>();
  for (const entry of itemsToDeduct) {
    if (!allowed.has(entry.id)) continue;
    if (!Number.isFinite(entry.amountToDeduct) || entry.amountToDeduct <= 0) continue;
    deductById.set(entry.id, (deductById.get(entry.id) ?? 0) + entry.amountToDeduct);
  }

  const next: FridgeItem[] = [];
  for (const item of fridgeItems) {
    const deduct = roundAmount(Math.min(deductById.get(item.id) ?? 0, item.amount));
    const amount = roundAmount(item.amount - deduct);
    const plannedMeals = releaseTodayReservations(
      item.plannedMeals,
      options.recipeId,
      options.recipeTitle,
      todayIso,
    );

    if (amount <= 0) continue;

    const updated: FridgeItem = { ...item, amount };
    if (plannedMeals) updated.plannedMeals = plannedMeals;
    else delete updated.plannedMeals;
    next.push(updated);
  }
  return next;
}

function parseFridgeItem(raw: unknown): FridgeItem | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<FridgeItem> & { name?: unknown; quantity?: unknown };
  if (typeof entry.id !== "string" || !entry.id) return null;

  const customName =
    typeof entry.customName === "string" && entry.customName.trim()
      ? entry.customName.trim()
      : typeof entry.name === "string"
        ? entry.name.trim()
        : "";
  if (!customName) return null;

  const amount =
    typeof entry.amount === "number"
      ? entry.amount
      : typeof entry.quantity === "number"
        ? entry.quantity
        : 0;

  const item: FridgeItem = {
    id: entry.id,
    customName,
    amount: Number.isFinite(amount) ? Math.max(0, amount) : 0,
    unit: typeof entry.unit === "string" ? coerceUnitCode(entry.unit) ?? DEFAULT_UNIT : DEFAULT_UNIT,
    category:
      typeof entry.category === "string" && isFridgeStorageLocation(entry.category)
        ? entry.category
        : "fridge",
    addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date().toISOString(),
  };
  if (typeof entry.ingredientId === "string" && entry.ingredientId) {
    item.ingredientId = entry.ingredientId;
  }
  if (typeof entry.icon === "string" && entry.icon) item.icon = entry.icon;
  if (typeof entry.expirationDate === "string" && ISO_CALENDAR_DATE.test(entry.expirationDate)) {
    item.expirationDate = entry.expirationDate;
  }
  if (entry.dlcEstimated === true) item.dlcEstimated = true;
  const plannedMeals = parsePlannedMeals(entry.plannedMeals);
  if (plannedMeals) item.plannedMeals = plannedMeals;
  return item;
}

/**
 * Lecture de l'inventaire en conservant `plannedMeals` / `dlcEstimated`.
 * Ne passe pas par `setFridgeItems` (sanitize actuelle sans ces champs).
 */
export function loadFridgeInventory(): FridgeItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(FRIDGE_STORAGE_KEY);
  if (raw == null) return getFridgeItems();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseFridgeItem).filter((item): item is FridgeItem => item != null);
  } catch {
    return [];
  }
}

export function persistFridgeInventory(items: FridgeItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(items));
}

export function findTodaySlotsForRecipe(
  recipeId: number,
  today: Date = parisCalendarDate(),
): MealSlot[] {
  const plan = getPlanForDay(today);
  const slots: MealSlot[] = [];
  if (breakfastRecipeId(plan.breakfast) === recipeId) slots.push("breakfast");
  if (plan.lunchId === recipeId) slots.push("lunch");
  if (plan.dinnerId === recipeId) slots.push("dinner");
  return slots;
}

export function isRecipePlannedToday(
  recipeId: number,
  today: Date = parisCalendarDate(),
): boolean {
  return findTodaySlotsForRecipe(recipeId, today).length > 0;
}

/** Retire cette recette des créneaux d'aujourd'hui. `false` si elle n'y figurait pas. */
export function removeRecipeFromTodayPlan(
  recipeId: number,
  today: Date = parisCalendarDate(),
): boolean {
  const slots = findTodaySlotsForRecipe(recipeId, today);
  if (slots.length === 0) return false;

  const allPlans = getStoredMealPlans();
  const weekKey = dayKey(startOfWeek(today));
  const dateKey = dayKey(today);
  const weekPlans = allPlans[weekKey] ?? {};
  const plan = weekPlans[dateKey] ?? { ...EMPTY_DAY_PLAN };
  const next = { ...plan };

  for (const slot of slots) {
    if (slot === "breakfast") next.breakfast = null;
    if (slot === "lunch") next.lunchId = null;
    if (slot === "dinner") next.dinnerId = null;
  }

  saveMealPlans({
    ...allPlans,
    [weekKey]: { ...weekPlans, [dateKey]: next },
  });
  return true;
}
