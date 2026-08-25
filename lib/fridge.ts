/**
 * Inventaire frigo / congélateur / placards — source partagée
 * pour l’UI Frigo, le planning et la génération de recettes.
 *
 * Un article de frigo est un snapshot éditable : `customName` et `amount`
 * appartiennent à l'utilisateur, tandis que `ingredientId` conserve le lien vers
 * l'aliment canonique pour le matching avec les recettes et les courses.
 */

import { describeIngredient, resolveStoredIngredientIcon } from "@/lib/ingredients";
import { matchesInventoryIdentity } from "@/lib/inventory-match";
import { normalizeProductName } from "@/lib/shopping-categories";
import { calendarDateFromIso } from "@/lib/date-paris";
import {
  coerceUnitCode,
  combineQuantities,
  DEFAULT_UNIT,
  type UnitCode,
} from "@/lib/units";
import type {
  FridgeItem,
  FridgeStorageLocation,
  PlannedMealRef,
  ShoppingItem,
} from "@/types/inventory";
import { clearCheckedShoppingItems, getShoppingList } from "@/lib/shopping-list";

export type { FridgeItem, FridgeStorageLocation };

export const FRIDGE_STORAGE_LOCATIONS = [
  "fridge",
  "freezer",
  "pantry",
] as const satisfies readonly FridgeStorageLocation[];

/** Payload sérialisable pour API / prompts LLM. */
export type FridgeSnapshotItem = {
  name: string;
  ingredientId?: string;
  quantity: number;
  unit: UnitCode;
  location: FridgeStorageLocation;
  expiresOn: string | null;
  daysUntilExpiry: number | null;
  urgency: "urgent" | "soon" | "ok" | "none";
};

export const FRIDGE_STORAGE_KEY = "my-kitchen-fridge-items-v2";
/** Ancien format : `{ id: number, name, quantity, dlc }`. */
const LEGACY_FRIDGE_STORAGE_KEY = "my-kitchen-fridge-items";

/** Minimum d’ingrédients exploitables pour lancer une génération IA. */
export const MIN_USABLE_FRIDGE_ITEMS = 3;

const NON_EXPLOITABLE_STAPLES = [
  "sel",
  "poivre",
  "fleur de sel",
  "huile",
  "huile d olive",
  "eau",
] as const;

export function isExploitableFridgeItem(item: { name: string; quantity: number }): boolean {
  if (item.quantity <= 0) return false;
  const normalized = normalizeProductName(item.name);
  if (!normalized) return false;
  return !NON_EXPLOITABLE_STAPLES.some(
    (staple) => normalized === staple || normalized.startsWith(`${staple} `),
  );
}

export function countUsableFridgeItems(items: Array<{ name: string; quantity: number }>): number {
  return items.filter(isExploitableFridgeItem).length;
}

type TabDefinition = {
  id: FridgeStorageLocation;
  label: string;
  icon: string;
};

export const FRIDGE_TABS: TabDefinition[] = [
  { id: "fridge", label: "Réfrigérateur", icon: "❄️" },
  { id: "freezer", label: "Congélateur", icon: "🧊" },
  { id: "pantry", label: "Placard", icon: "🥫" },
];

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MEAL_SLOT_ORDER = { breakfast: 0, lunch: 1, dinner: 2 } as const;

export function createFridgeItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `fridge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isMealType(value: unknown): value is PlannedMealRef["mealType"] {
  return value === "breakfast" || value === "lunch" || value === "dinner";
}

function sanitizePlannedMealRef(raw: unknown): PlannedMealRef | null {
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

function sanitizePlannedMeals(raw: unknown): PlannedMealRef[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const meals = raw
    .map(sanitizePlannedMealRef)
    .filter((ref): ref is PlannedMealRef => ref != null);
  return meals.length > 0 ? meals : undefined;
}

/** Identité stable : date + créneau + recipeId (sinon titre). */
function plannedMealKey(ref: PlannedMealRef): string {
  const identity =
    ref.recipeId != null ? `id:${ref.recipeId}` : `title:${ref.recipeTitle}`;
  return `${ref.date}|${ref.mealType}|${identity}`;
}

function mergePlannedMeals(
  existing?: PlannedMealRef[],
  incoming?: PlannedMealRef[],
): PlannedMealRef[] | undefined {
  if (!existing?.length && !incoming?.length) return undefined;
  const seen = new Set<string>();
  const merged: PlannedMealRef[] = [];
  for (const ref of [...(existing ?? []), ...(incoming ?? [])]) {
    const key = plannedMealKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ref);
  }
  return merged.length > 0 ? merged : undefined;
}

function earliestMealDate(meals?: PlannedMealRef[]): string | undefined {
  if (!meals?.length) return undefined;
  return meals.reduce((min, meal) => (meal.date < min ? meal.date : min), meals[0].date);
}

function shoppingExplicitExpiration(shop: ShoppingItem): string | undefined {
  const raw = (shop as ShoppingItem & { expirationDate?: unknown }).expirationDate;
  return typeof raw === "string" && ISO_CALENDAR_DATE.test(raw) ? raw : undefined;
}

function shoppingTargetDate(shop: ShoppingItem): string | undefined {
  if (shop.targetDate && ISO_CALENDAR_DATE.test(shop.targetDate)) return shop.targetDate;
  return earliestMealDate(shop.plannedMeals);
}

/**
 * DLC à appliquer lors du transfert.
 * Une date déjà saisie (courses ou frigo) n'est jamais écrasée par une estimation.
 */
function resolveTransferDlc(shop: ShoppingItem, existing?: FridgeItem): {
  expirationDate?: string;
  dlcEstimated?: boolean;
} {
  const explicitShop = shoppingExplicitExpiration(shop);
  const existingIsEstimated = existing?.dlcEstimated === true;

  if (existing?.expirationDate && !existingIsEstimated) {
    return { expirationDate: existing.expirationDate };
  }

  if (explicitShop) {
    return { expirationDate: explicitShop };
  }

  if (existing?.expirationDate) {
    return {
      expirationDate: existing.expirationDate,
      ...(existingIsEstimated ? { dlcEstimated: true } : {}),
    };
  }

  if (shop.dlcValidated) {
    const target = shoppingTargetDate(shop);
    if (target) return { expirationDate: target, dlcEstimated: true };
  }

  return {};
}

function applyTransferDlc(item: FridgeItem, dlc: ReturnType<typeof resolveTransferDlc>) {
  if (dlc.expirationDate) item.expirationDate = dlc.expirationDate;
  else delete item.expirationDate;
  if (dlc.dlcEstimated) item.dlcEstimated = true;
  else delete item.dlcEstimated;
}

export function sortPlannedMeals(meals: PlannedMealRef[]): PlannedMealRef[] {
  return [...meals].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return MEAL_SLOT_ORDER[a.mealType] - MEAL_SLOT_ORDER[b.mealType];
  });
}

/** Jour de la semaine en français (ex. « lundi ») depuis YYYY-MM-DD. */
export function weekdayLongFrFromIso(iso: string): string {
  const date = calendarDateFromIso(iso);
  if (!date) return iso;
  return date.toLocaleDateString("fr-FR", { weekday: "long", timeZone: "UTC" });
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysFrom(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}

/** Construit un article de frigo en dérivant l'identité canonique du nom. */
export function createFridgeItem(input: {
  customName: string;
  amount: number;
  unit: UnitCode;
  category: FridgeStorageLocation;
  icon?: string;
  expirationDate?: string | null;
  ingredientId?: string;
  id?: string;
  addedAt?: string;
  plannedMeals?: PlannedMealRef[];
  dlcEstimated?: boolean;
}): FridgeItem {
  const customName = input.customName.trim();
  const identity = describeIngredient(customName);
  const icon = resolveStoredIngredientIcon(input.icon, identity.icon);
  const plannedMeals = sanitizePlannedMeals(input.plannedMeals);
  const expirationDate =
    typeof input.expirationDate === "string" && ISO_CALENDAR_DATE.test(input.expirationDate)
      ? input.expirationDate
      : undefined;

  return {
    id: input.id ?? createFridgeItemId(),
    ingredientId: input.ingredientId ?? identity.ingredientId,
    customName,
    amount: Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0,
    unit: input.unit,
    category: input.category,
    icon,
    addedAt: input.addedAt ?? new Date().toISOString(),
    ...(expirationDate ? { expirationDate } : {}),
    ...(plannedMeals ? { plannedMeals } : {}),
    ...(input.dlcEstimated && expirationDate ? { dlcEstimated: true } : {}),
  };
}

/** Seed utilisé à la première visite (avant toute persistance). */
export function createDefaultFridgeItems(): FridgeItem[] {
  const seed: Array<{
    icon: string;
    customName: string;
    amount: number;
    unit: UnitCode;
    expirationDate: string | null;
    category: FridgeStorageLocation;
  }> = [
    { icon: "1F95A", customName: "Œufs", amount: 6, unit: "piece", expirationDate: daysFrom(7), category: "fridge" },
    { icon: "1F95B", customName: "Lait demi-écrémé", amount: 1, unit: "l", expirationDate: daysFrom(2), category: "fridge" },
    { icon: "1F9C0", customName: "Comté", amount: 150, unit: "g", expirationDate: daysFrom(14), category: "fridge" },
    { icon: "1F357", customName: "Poulet fermier", amount: 500, unit: "g", expirationDate: daysFrom(0), category: "fridge" },
    { icon: "1F345", customName: "Tomates cerises", amount: 250, unit: "g", expirationDate: daysFrom(1), category: "fridge" },
    { icon: "1F955", customName: "Carottes", amount: 4, unit: "piece", expirationDate: daysFrom(6), category: "fridge" },
    { icon: "1F9C8", customName: "Beurre AOP", amount: 250, unit: "g", expirationDate: daysFrom(21), category: "fridge" },
    { icon: "1F957", customName: "Mesclun bio", amount: 100, unit: "g", expirationDate: daysFrom(2), category: "fridge" },
    { icon: "1F34B", customName: "Citrons", amount: 3, unit: "piece", expirationDate: daysFrom(8), category: "fridge" },
    { icon: "1F41F", customName: "Filets de saumon", amount: 2, unit: "piece", expirationDate: daysFrom(60), category: "freezer" },
    { icon: "1F966", customName: "Brocolis surgelés", amount: 400, unit: "g", expirationDate: daysFrom(90), category: "freezer" },
    { icon: "1F9CA", customName: "Sorbet citron", amount: 500, unit: "g", expirationDate: daysFrom(45), category: "freezer" },
    { icon: "1F969", customName: "Bœuf haché 5%", amount: 300, unit: "g", expirationDate: daysFrom(-2), category: "freezer" },
    { icon: "1FADB", customName: "Petits pois", amount: 800, unit: "g", expirationDate: daysFrom(120), category: "freezer" },
    { icon: "1F35D", customName: "Pâtes linguine", amount: 500, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1F35A", customName: "Riz basmati", amount: 800, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1FAD2", customName: "Huile d'olive", amount: 750, unit: "ml", expirationDate: daysFrom(180), category: "pantry" },
    { icon: "1F9C2", customName: "Fleur de sel", amount: 200, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1F336", customName: "Paprika fumé", amount: 50, unit: "g", expirationDate: daysFrom(300), category: "pantry" },
    { icon: "1F36B", customName: "Chocolat noir 70%", amount: 200, unit: "g", expirationDate: daysFrom(60), category: "pantry" },
    { icon: "1F33E", customName: "Farine T55", amount: 1, unit: "kg", expirationDate: daysFrom(180), category: "pantry" },
    { icon: "2615", customName: "Café en grains", amount: 250, unit: "g", expirationDate: daysFrom(90), category: "pantry" },
  ];

  return seed.map((item) => createFridgeItem(item));
}

export function isFridgeStorageLocation(value: string): value is FridgeStorageLocation {
  return (FRIDGE_STORAGE_LOCATIONS as readonly string[]).includes(value);
}

export function daysUntilDlc(dlc: string, now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.floor((new Date(dlc).getTime() - today.getTime()) / 86400000);
}

export function dlcStatus(
  dlc: string | null | undefined,
  now: Date = new Date(),
): "urgent" | "soon" | "ok" | "none" {
  if (!dlc) return "none";
  const diff = daysUntilDlc(dlc, now);
  if (diff <= 0) return "urgent";
  if (diff <= 3) return "soon";
  return "ok";
}

function sanitizeItem(raw: unknown): FridgeItem | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<FridgeItem> & {
    name?: unknown;
    quantity?: unknown;
    dlc?: unknown;
  };

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
        : 1;

  const rawExpiration =
    typeof entry.expirationDate === "string"
      ? entry.expirationDate
      : typeof entry.dlc === "string"
        ? entry.dlc
        : null;

  return createFridgeItem({
    id: typeof entry.id === "string" ? entry.id : undefined,
    ingredientId: typeof entry.ingredientId === "string" ? entry.ingredientId : undefined,
    customName,
    amount,
    unit:
      typeof entry.unit === "string" ? coerceUnitCode(entry.unit) ?? DEFAULT_UNIT : DEFAULT_UNIT,
    category:
      typeof entry.category === "string" && isFridgeStorageLocation(entry.category)
        ? entry.category
        : "fridge",
    icon:
      typeof entry.icon === "string" && entry.icon
        ? entry.icon
        : typeof (entry as Record<string, unknown>).emoji === "string" && (entry as Record<string, unknown>).emoji
        ? ((entry as Record<string, unknown>).emoji as string)
        : undefined,
    expirationDate: rawExpiration && ISO_CALENDAR_DATE.test(rawExpiration) ? rawExpiration : null,
    addedAt: typeof entry.addedAt === "string" ? entry.addedAt : undefined,
    plannedMeals: sanitizePlannedMeals(entry.plannedMeals),
    dlcEstimated: entry.dlcEstimated === true,
  });
}

function parseStoredItems(raw: string | null): FridgeItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeItem).filter((item): item is FridgeItem => item != null);
  } catch {
    return [];
  }
}

function readRaw(): FridgeItem[] | null {
  if (typeof window === "undefined") return null;

  const current = window.localStorage.getItem(FRIDGE_STORAGE_KEY);
  if (current != null) return parseStoredItems(current);

  // Migration unique depuis l'ancien format (id numériques, name, quantity, dlc).
  const legacy = parseStoredItems(window.localStorage.getItem(LEGACY_FRIDGE_STORAGE_KEY));
  if (legacy.length > 0) {
    setFridgeItems(legacy);
    window.localStorage.removeItem(LEGACY_FRIDGE_STORAGE_KEY);
    return legacy;
  }
  return null;
}

function persistNormalizedIcons(rawJson: string, items: FridgeItem[]) {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!Array.isArray(parsed)) return;
    const dirty = items.some((item, index) => {
      const entry = parsed[index] as { icon?: unknown; emoji?: unknown } | undefined;
      const previous =
        typeof entry?.icon === "string" && entry.icon
          ? entry.icon
          : typeof entry?.emoji === "string"
            ? entry.emoji
            : "";
      return previous !== item.icon;
    });
    if (dirty) setFridgeItems(items);
  } catch {
    /* ignore */
  }
}

export function getFridgeItems(): FridgeItem[] {
  const stored = readRaw();
  if (stored && stored.length > 0) {
    if (typeof window !== "undefined") {
      const current = window.localStorage.getItem(FRIDGE_STORAGE_KEY);
      if (current) persistNormalizedIcons(current, stored);
    }
    return stored;
  }
  const seed = createDefaultFridgeItems();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(seed));
  }
  return seed;
}

export function setFridgeItems(items: FridgeItem[]) {
  if (typeof window === "undefined") return;
  const sanitized = items.map((item) =>
    createFridgeItem({
      id: item.id,
      ingredientId: item.ingredientId,
      customName: item.customName,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      icon: item.icon,
      expirationDate: item.expirationDate ?? null,
      addedAt: item.addedAt,
      plannedMeals: item.plannedMeals,
      dlcEstimated: item.dlcEstimated,
    }),
  );
  window.localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(sanitized));
}

/** Sanitizer unique : conserve `plannedMeals` et `dlcEstimated`. */
export function sanitizeFridgeItem(raw: unknown): FridgeItem | null {
  return sanitizeItem(raw);
}

export function toFridgeSnapshotItem(
  item: FridgeItem,
  now: Date = new Date(),
): FridgeSnapshotItem {
  const expiresOn = item.expirationDate ?? null;
  return {
    name: item.customName,
    ...(item.ingredientId ? { ingredientId: item.ingredientId } : {}),
    quantity: item.amount,
    unit: item.unit,
    location: item.category,
    expiresOn,
    daysUntilExpiry: expiresOn ? daysUntilDlc(expiresOn, now) : null,
    urgency: dlcStatus(expiresOn, now),
  };
}

/** Snapshot prêt pour matching local ou prompt LLM. */
export function getFridgeSnapshot(
  items: FridgeItem[] = getFridgeItems(),
  now: Date = new Date(),
): FridgeSnapshotItem[] {
  return items.filter((item) => item.amount > 0).map((item) => toFridgeSnapshotItem(item, now));
}

export function getExpiringFridgeItems(
  withinDays = 5,
  items: FridgeItem[] = getFridgeItems(),
  now: Date = new Date(),
): FridgeItem[] {
  return items
    .filter((item) => {
      if (!item.expirationDate || item.amount <= 0) return false;
      return daysUntilDlc(item.expirationDate, now) <= withinDays;
    })
    .sort((a, b) => {
      const da = a.expirationDate ? daysUntilDlc(a.expirationDate, now) : 999;
      const db = b.expirationDate ? daysUntilDlc(b.expirationDate, now) : 999;
      return da - db;
    });
}

function matchesFridgeItem(
  item: FridgeItem,
  ingredientId: string | undefined,
  cleanName: string,
): boolean {
  return matchesInventoryIdentity(
    { ingredientId: item.ingredientId, name: item.customName },
    { ingredientId, name: cleanName },
  );
}

function applyShoppingMemory(item: FridgeItem, shop: ShoppingItem, existing?: FridgeItem) {
  const meals = mergePlannedMeals(existing?.plannedMeals, shop.plannedMeals);
  if (meals) item.plannedMeals = meals;
  else delete item.plannedMeals;
  applyTransferDlc(item, resolveTransferDlc(shop, existing));
}

/**
 * Transfert Courses → Frigo : fusionne les articles cochés dans l'inventaire,
 * puis les retire de la liste de courses. `ingredientId` est conservé.
 * Transfère `plannedMeals` (dédupliqués) et, si `dlcValidated` sans DLC
 * explicite, pose `targetDate` comme `expirationDate` estimée.
 *
 * @param location Emplacement par défaut pour les nouveaux articles.
 */
export function transferCheckedShoppingItemsToFridge(
  location: FridgeStorageLocation = "fridge",
  checkedItems?: ShoppingItem[],
): { fridge: FridgeItem[]; transferred: number } {
  const source = checkedItems ?? getShoppingList().filter((item) => item.isChecked);
  if (source.length === 0) {
    return { fridge: getFridgeItems(), transferred: 0 };
  }

  const fridge = [...getFridgeItems()];

  for (const shop of source) {
    const cleanName = normalizeProductName(shop.customName);
    if (!cleanName) continue;

    const existing = fridge.find((item) =>
      matchesFridgeItem(item, shop.ingredientId, cleanName),
    );

    if (existing) {
      const combined = combineQuantities(
        existing.amount,
        existing.unit,
        shop.amount,
        shop.unit,
        shop.ingredientId || shop.customName,
      );
      if (combined) {
        existing.amount = combined.amount;
        existing.unit = combined.unit;
        applyShoppingMemory(existing, shop, existing);
        continue;
      }
    }

    const created = createFridgeItem({
      customName: shop.customName,
      amount: shop.amount,
      unit: shop.unit,
      category: location,
      icon: shop.icon,
      ingredientId: shop.ingredientId,
      plannedMeals: shop.plannedMeals,
    });
    applyShoppingMemory(created, shop);
    fridge.push(created);
  }

  setFridgeItems(fridge);
  clearCheckedShoppingItems();
  return { fridge, transferred: source.length };
}
