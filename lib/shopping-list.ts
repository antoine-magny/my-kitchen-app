/**
 * Liste de courses : copies éphémères et éditables des ingrédients planifiés.
 *
 * Chaque article garde l'`ingredientId` de l'ingrédient d'origine. Renommer un
 * article (« Tomate » → « Tomates cerises bio ») ne touche donc jamais la
 * recette, mais conserve le lien nécessaire à la fusion et au rangement au frigo.
 */

import { describeIngredient } from "@/lib/ingredients";
import {
  classifyProduct,
  isShoppingCategoryId,
  type ShoppingCategoryId,
} from "@/lib/shopping-categories";
import {
  DEFAULT_UNIT,
  formatAmount,
  isUnitCode,
  parseAmount,
  toBaseQuantity,
  UNQUANTIFIED_UNIT,
  type UnitCode,
} from "@/lib/units";
import type { RecipeIngredient, ShoppingItem } from "@/types/inventory";

export type { ShoppingItem };

const STORAGE_KEY = "my-kitchen-shopping-list-v2";
/** Ancien format : `{ id, name, amount: string, checked, category }`. */
const LEGACY_STORAGE_KEY = "my-kitchen-shopping-list";

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `shop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toShoppingItem(input: {
  id?: string;
  ingredientId?: string;
  customName: string;
  amount: number;
  unit: UnitCode;
  category?: string;
  emoji?: string;
  isChecked?: boolean;
  createdAt?: string;
}): ShoppingItem {
  const customName = input.customName.trim();
  const identity = describeIngredient(customName);
  const category =
    input.category && isShoppingCategoryId(input.category)
      ? input.category
      : classifyProduct(customName);
  const emoji = input.emoji ?? identity.emoji;

  return {
    id: input.id ?? createId(),
    ingredientId: input.ingredientId ?? identity.ingredientId,
    customName,
    amount: Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0,
    unit: input.unit,
    category,
    ...(emoji ? { emoji } : {}),
    isChecked: input.isChecked ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

function sanitizeItem(raw: unknown): ShoppingItem | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<ShoppingItem> & { name?: unknown; checked?: unknown; amount?: unknown };

  // Format courant.
  if (typeof entry.customName === "string" && typeof entry.amount === "number") {
    const name = entry.customName.trim();
    if (!name) return null;
    return toShoppingItem({
      id: typeof entry.id === "string" ? entry.id : undefined,
      ingredientId: typeof entry.ingredientId === "string" ? entry.ingredientId : undefined,
      customName: name,
      amount: entry.amount,
      unit: typeof entry.unit === "string" && isUnitCode(entry.unit) ? entry.unit : DEFAULT_UNIT,
      category: typeof entry.category === "string" ? entry.category : undefined,
      emoji: typeof entry.emoji === "string" ? entry.emoji : undefined,
      isChecked: Boolean(entry.isChecked),
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : undefined,
    });
  }

  // Format hérité : nom + quantité en toutes lettres.
  const legacyName = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!legacyName) return null;
  const { amount, unit } = parseAmount(typeof entry.amount === "string" ? entry.amount : "");
  return toShoppingItem({
    id: typeof entry.id === "string" ? entry.id : undefined,
    customName: legacyName,
    amount,
    unit,
    category: typeof entry.category === "string" ? entry.category : undefined,
    isChecked: Boolean(entry.checked),
  });
}

function parseStoredList(raw: string | null): ShoppingItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeItem).filter((item): item is ShoppingItem => item != null);
  } catch {
    return [];
  }
}

function readList(): ShoppingItem[] {
  if (typeof window === "undefined") return [];

  const current = window.localStorage.getItem(STORAGE_KEY);
  if (current != null) return parseStoredList(current);

  // Migration unique depuis l'ancien format, puis on ne relit plus jamais v1.
  const legacy = parseStoredList(window.localStorage.getItem(LEGACY_STORAGE_KEY));
  if (legacy.length > 0) {
    writeList(legacy);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
  return legacy;
}

function writeList(items: ShoppingItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getShoppingList(): ShoppingItem[] {
  return readList();
}

export function toggleShoppingItem(id: string): ShoppingItem[] {
  const next = readList().map((item) =>
    item.id === id ? { ...item, isChecked: !item.isChecked } : item,
  );
  writeList(next);
  return next;
}

export function removeShoppingItem(id: string): ShoppingItem[] {
  const next = readList().filter((item) => item.id !== id);
  writeList(next);
  return next;
}

export type ShoppingItemPatch = Partial<
  Pick<ShoppingItem, "customName" | "amount" | "unit" | "category">
>;

/**
 * Édition libre d'un article. Le rayon est reclassé automatiquement lorsque le
 * nom change, mais `ingredientId` reste figé : le lien vers la recette survit
 * au renommage.
 */
export function updateShoppingItem(id: string, patch: ShoppingItemPatch): ShoppingItem[] {
  const next = readList().map((item) => {
    if (item.id !== id) return item;

    const customName = patch.customName?.trim() || item.customName;
    const renamed = customName !== item.customName;
    const category = patch.category ?? (renamed ? classifyProduct(customName) : item.category);

    return {
      ...item,
      customName,
      amount: patch.amount ?? item.amount,
      unit: patch.unit ?? item.unit,
      category,
    };
  });
  writeList(next);
  return next;
}

export function clearCheckedShoppingItems(): ShoppingItem[] {
  const next = readList().filter((item) => !item.isChecked);
  writeList(next);
  return next;
}

export function clearShoppingList(): ShoppingItem[] {
  writeList([]);
  return [];
}

/** Quantité affichable d'un article (« 400 g », « q.s. »). */
export function formatShoppingAmount(item: Pick<ShoppingItem, "amount" | "unit">): string {
  return formatAmount(item.amount, item.unit);
}

/**
 * Fusionne les ingrédients d'un même aliment en additionnant les quantités
 * compatibles. Le regroupement se fait sur `ingredientId`, jamais sur le nom :
 * « Tomate » et « tomates » deviennent une seule ligne.
 *
 * Deux unités incompatibles (3 c.à.s d'huile et 20 mL d'huile) produisent deux
 * lignes distinctes plutôt qu'une addition fausse. Les quantités « q.s. » sont
 * absorbées dès qu'une quantité chiffrée existe pour le même aliment.
 */
export function mergeIngredients(ingredients: RecipeIngredient[]): ShoppingItem[] {
  const groups = new Map<
    string,
    { name: string; category: ShoppingCategoryId; emoji?: string; byUnit: Map<UnitCode, number> }
  >();

  for (const ing of ingredients) {
    const name = ing.name.trim();
    if (!name) continue;

    const group = groups.get(ing.ingredientId) ?? {
      name,
      category: ing.category,
      emoji: ing.emoji,
      byUnit: new Map<UnitCode, number>(),
    };

    const base = toBaseQuantity(ing.amount, ing.unit);
    group.byUnit.set(base.unit, (group.byUnit.get(base.unit) ?? 0) + base.amount);
    groups.set(ing.ingredientId, group);
  }

  const items: ShoppingItem[] = [];
  for (const [ingredientId, group] of groups) {
    const quantified = [...group.byUnit.entries()].filter(([unit]) => unit !== UNQUANTIFIED_UNIT);
    const units = quantified.length > 0 ? quantified : [...group.byUnit.entries()];

    for (const [unit, amount] of units) {
      items.push(
        toShoppingItem({
          ingredientId,
          customName: group.name,
          amount,
          unit,
          category: group.category,
          emoji: group.emoji,
        }),
      );
    }
  }

  return items;
}

const EXPORT_BANNER_KEY = "my-kitchen-shopping-export-banner";

export function setExportBannerCount(count: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(EXPORT_BANNER_KEY, String(count));
}

export function peekExportBanner(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(EXPORT_BANNER_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(EXPORT_BANNER_KEY);
  const count = Number(raw);
  if (!Number.isFinite(count) || count <= 0) return null;
  return count === 1
    ? "1 article exporté depuis le planning."
    : `${count} articles exportés depuis le planning.`;
}

/** Remplace la liste par un nouvel export planning. */
export function replaceShoppingListFromIngredients(
  ingredients: RecipeIngredient[],
): ShoppingItem[] {
  const items = mergeIngredients(ingredients);
  writeList(items);
  return items;
}
