/**
 * Inventaire frigo / congélateur / placards — source partagée
 * pour l’UI Frigo, le planning et la génération de recettes.
 */

import { DEFAULT_UNIT, type UnitCode } from "@/lib/units";

export const FRIDGE_STORAGE_LOCATIONS = ["fridge", "freezer", "pantry"] as const;

export type FridgeStorageLocation = (typeof FRIDGE_STORAGE_LOCATIONS)[number];

export type FridgeItem = {
  id: number;
  emoji: string;
  name: string;
  quantity: number;
  unit: UnitCode;
  /** ISO date YYYY-MM-DD, ou null si pas de DLC. */
  dlc: string | null;
  category: FridgeStorageLocation;
};

/** Payload sérialisable pour API / prompts LLM. */
export type FridgeSnapshotItem = {
  name: string;
  quantity: number;
  unit: UnitCode;
  location: FridgeStorageLocation;
  expiresOn: string | null;
  daysUntilExpiry: number | null;
  urgency: "urgent" | "soon" | "ok" | "none";
};

export const FRIDGE_STORAGE_KEY = "my-kitchen-fridge-items";

export const FRIDGE_TABS: {
  id: FridgeStorageLocation;
  label: string;
  emoji: string;
}[] = [
  { id: "fridge", label: "Réfrigérateur", emoji: "🧊" },
  { id: "freezer", label: "Congélateur", emoji: "❄️" },
  { id: "pantry", label: "Placards", emoji: "🏺" },
];

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysFrom(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}

/** Seed utilisé à la première visite (avant toute persistance). */
export function createDefaultFridgeItems(): FridgeItem[] {
  return [
    { id: 1, emoji: "🥚", name: "Œufs", quantity: 6, unit: "unite", dlc: daysFrom(7), category: "fridge" },
    { id: 2, emoji: "🥛", name: "Lait demi-écrémé", quantity: 1, unit: "l", dlc: daysFrom(2), category: "fridge" },
    { id: 3, emoji: "🧀", name: "Comté", quantity: 150, unit: "g", dlc: daysFrom(14), category: "fridge" },
    { id: 4, emoji: "🥩", name: "Poulet fermier", quantity: 500, unit: "g", dlc: daysFrom(0), category: "fridge" },
    { id: 5, emoji: "🍅", name: "Tomates cerises", quantity: 250, unit: "g", dlc: daysFrom(1), category: "fridge" },
    { id: 6, emoji: "🥕", name: "Carottes", quantity: 4, unit: "unite", dlc: daysFrom(6), category: "fridge" },
    { id: 7, emoji: "🧈", name: "Beurre AOP", quantity: 250, unit: "g", dlc: daysFrom(21), category: "fridge" },
    { id: 8, emoji: "🥗", name: "Mesclun bio", quantity: 100, unit: "g", dlc: daysFrom(2), category: "fridge" },
    { id: 9, emoji: "🍋", name: "Citrons", quantity: 3, unit: "unite", dlc: daysFrom(8), category: "fridge" },
    { id: 10, emoji: "🐟", name: "Filets de saumon", quantity: 2, unit: "unite", dlc: daysFrom(60), category: "freezer" },
    { id: 11, emoji: "🥦", name: "Brocolis surgelés", quantity: 400, unit: "g", dlc: daysFrom(90), category: "freezer" },
    { id: 12, emoji: "🍦", name: "Sorbet citron", quantity: 500, unit: "g", dlc: daysFrom(45), category: "freezer" },
    { id: 13, emoji: "🍖", name: "Bœuf haché 5%", quantity: 300, unit: "g", dlc: daysFrom(-2), category: "freezer" },
    { id: 14, emoji: "🫛", name: "Petits pois", quantity: 800, unit: "g", dlc: daysFrom(120), category: "freezer" },
    { id: 15, emoji: "🍝", name: "Pâtes linguine", quantity: 500, unit: "g", dlc: null, category: "pantry" },
    { id: 16, emoji: "🍚", name: "Riz basmati", quantity: 800, unit: "g", dlc: null, category: "pantry" },
    { id: 17, emoji: "🫒", name: "Huile d'olive", quantity: 750, unit: "ml", dlc: daysFrom(180), category: "pantry" },
    { id: 18, emoji: "🧂", name: "Fleur de sel", quantity: 200, unit: "g", dlc: null, category: "pantry" },
    { id: 19, emoji: "🌶️", name: "Paprika fumé", quantity: 50, unit: "g", dlc: daysFrom(300), category: "pantry" },
    { id: 20, emoji: "🍫", name: "Chocolat noir 70%", quantity: 200, unit: "g", dlc: daysFrom(60), category: "pantry" },
    { id: 21, emoji: "🧁", name: "Farine T55", quantity: 1, unit: "kg", dlc: daysFrom(180), category: "pantry" },
    { id: 22, emoji: "☕", name: "Café en grains", quantity: 250, unit: "g", dlc: daysFrom(90), category: "pantry" },
  ];
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
  dlc: string | null,
  now: Date = new Date(),
): "urgent" | "soon" | "ok" | "none" {
  if (!dlc) return "none";
  const diff = daysUntilDlc(dlc, now);
  if (diff <= 0) return "urgent";
  if (diff <= 3) return "soon";
  return "ok";
}

function isUnitCode(value: string): value is UnitCode {
  return (
    value === "g" ||
    value === "kg" ||
    value === "ml" ||
    value === "l" ||
    value === "unite" ||
    value === "cas" ||
    value === "cac" ||
    value === "pincee" ||
    value === "tranche" ||
    value === "botte"
  );
}

function sanitizeItem(raw: unknown, index: number): FridgeItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<FridgeItem>;
  const name = typeof item.name === "string" ? item.name.trim() : "";
  if (!name) return null;
  const category =
    typeof item.category === "string" && isFridgeStorageLocation(item.category)
      ? item.category
      : "fridge";
  const unit = typeof item.unit === "string" && isUnitCode(item.unit) ? item.unit : DEFAULT_UNIT;
  const id = typeof item.id === "number" && Number.isFinite(item.id) ? item.id : index + 1;
  const quantity =
    typeof item.quantity === "number" && Number.isFinite(item.quantity)
      ? Math.max(0, item.quantity)
      : 1;
  const dlc =
    typeof item.dlc === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.dlc) ? item.dlc : null;
  const emoji = typeof item.emoji === "string" && item.emoji ? item.emoji : "🥗";
  return { id, emoji, name, quantity, unit, dlc, category };
}

function readRaw(): FridgeItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FRIDGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const items = parsed
      .map((entry, index) => sanitizeItem(entry, index))
      .filter((item): item is FridgeItem => item != null);
    return items;
  } catch {
    return null;
  }
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

export function nextFridgeItemId(items: FridgeItem[] = getFridgeItems()): number {
  const max = items.reduce((acc, item) => Math.max(acc, item.id), 0);
  return max + 1;
}

export function toFridgeSnapshotItem(
  item: FridgeItem,
  now: Date = new Date(),
): FridgeSnapshotItem {
  const urgency = dlcStatus(item.dlc, now);
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    location: item.category,
    expiresOn: item.dlc,
    daysUntilExpiry: item.dlc ? daysUntilDlc(item.dlc, now) : null,
    urgency,
  };
}

/** Snapshot prêt pour matching local ou prompt LLM. */
export function getFridgeSnapshot(
  items: FridgeItem[] = getFridgeItems(),
  now: Date = new Date(),
): FridgeSnapshotItem[] {
  return items
    .filter((item) => item.quantity > 0)
    .map((item) => toFridgeSnapshotItem(item, now));
}

export function getExpiringFridgeItems(
  withinDays = 5,
  items: FridgeItem[] = getFridgeItems(),
  now: Date = new Date(),
): FridgeItem[] {
  return items
    .filter((item) => {
      if (!item.dlc || item.quantity <= 0) return false;
      const days = daysUntilDlc(item.dlc, now);
      return days <= withinDays;
    })
    .sort((a, b) => {
      const da = a.dlc ? daysUntilDlc(a.dlc, now) : 999;
      const db = b.dlc ? daysUntilDlc(b.dlc, now) : 999;
      return da - db;
    });
}
