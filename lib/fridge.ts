/**
 * Inventaire frigo / congélateur / placards — source partagée
 * pour l’UI Frigo, le planning et la génération de recettes.
 *
 * Un article de frigo est un snapshot éditable : `customName` et `amount`
 * appartiennent à l'utilisateur, tandis que `ingredientId` conserve le lien vers
 * l'aliment canonique pour le matching avec les recettes et les courses.
 */

import { describeIngredient, DEFAULT_INGREDIENT_ICON } from "@/lib/ingredients";
import { normalizeProductName } from "@/lib/shopping-categories";
import {
  coerceUnitCode,
  combineQuantities,
  DEFAULT_UNIT,
  type UnitCode,
} from "@/lib/units";
import type { FridgeItem, FridgeStorageLocation, ShoppingItem } from "@/types/inventory";
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
  { id: "pantry", label: "Placards", icon: "🥫" },
];

export function createFridgeItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `fridge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
}): FridgeItem {
  const customName = input.customName.trim();
  const identity = describeIngredient(customName);
  const isInputHex = input.icon ? /^[0-9A-Fa-f]{2,6}(-[0-9A-Fa-f]{2,6})*$/.test(input.icon.trim()) : false;
  let icon = DEFAULT_INGREDIENT_ICON;
  if (input.icon && input.icon !== DEFAULT_INGREDIENT_ICON && !isInputHex) {
    icon = input.icon;
  } else if (identity.icon) {
    icon = identity.icon;
  } else if (input.icon && input.icon !== DEFAULT_INGREDIENT_ICON) {
    icon = input.icon;
  }

  return {
    id: input.id ?? createFridgeItemId(),
    ingredientId: input.ingredientId ?? identity.ingredientId,
    customName,
    amount: Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0,
    unit: input.unit,
    category: input.category,
    icon,
    addedAt: input.addedAt ?? new Date().toISOString(),
    ...(input.expirationDate ? { expirationDate: input.expirationDate } : {}),
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
    { icon: "1F368", customName: "Sorbet citron", amount: 500, unit: "g", expirationDate: daysFrom(45), category: "freezer" },
    { icon: "1F969", customName: "Bœuf haché 5%", amount: 300, unit: "g", expirationDate: daysFrom(-2), category: "freezer" },
    { icon: "1FAD6", customName: "Petits pois", amount: 800, unit: "g", expirationDate: daysFrom(120), category: "freezer" },
    { icon: "1F35D", customName: "Pâtes linguine", amount: 500, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1F35A", customName: "Riz basmati", amount: 800, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1FAD4", customName: "Huile d'olive", amount: 750, unit: "ml", expirationDate: daysFrom(180), category: "pantry" },
    { icon: "1F9C2", customName: "Fleur de sel", amount: 200, unit: "g", expirationDate: null, category: "pantry" },
    { icon: "1F336-FE0F", customName: "Paprika fumé", amount: 50, unit: "g", expirationDate: daysFrom(300), category: "pantry" },
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
        : typeof (entry as any).emoji === "string" && (entry as any).emoji
        ? (entry as any).emoji
        : undefined,
    expirationDate: rawExpiration && /^\d{4}-\d{2}-\d{2}$/.test(rawExpiration) ? rawExpiration : null,
    addedAt: typeof entry.addedAt === "string" ? entry.addedAt : undefined,
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

export function getFridgeItems(): FridgeItem[] {
  const stored = readRaw();
  if (stored && stored.length > 0) return stored;
  const seed = createDefaultFridgeItems();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(seed));
  }
  return seed;
}

export function setFridgeItems(items: FridgeItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(items));
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
  if (ingredientId && item.ingredientId && item.ingredientId === ingredientId) return true;
  return normalizeProductName(item.customName) === cleanName;
}

/**
 * Transfert Courses → Frigo : fusionne les articles cochés dans l'inventaire,
 * puis les retire de la liste de courses. `ingredientId` est conservé.
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
        continue;
      }
    }

    fridge.push(
      createFridgeItem({
        customName: shop.customName,
        amount: shop.amount,
        unit: shop.unit,
        category: location,
        icon: shop.icon,
        ingredientId: shop.ingredientId,
      }),
    );
  }

  setFridgeItems(fridge);
  clearCheckedShoppingItems();
  return { fridge, transferred: source.length };
}
