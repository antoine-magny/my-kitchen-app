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
  normalizeProductName,
  type ShoppingCategoryId,
} from "@/lib/shopping-categories";
import {
  coerceUnitCode,
  combineQuantities,
  DEFAULT_UNIT,
  formatAmount,
  parseAmount,
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
    const unit =
      typeof entry.unit === "string" ? coerceUnitCode(entry.unit) ?? DEFAULT_UNIT : DEFAULT_UNIT;
    return toShoppingItem({
      id: typeof entry.id === "string" ? entry.id : undefined,
      ingredientId: typeof entry.ingredientId === "string" ? entry.ingredientId : undefined,
      customName: name,
      amount: entry.amount,
      unit,
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

export function setShoppingList(items: ShoppingItem[]): ShoppingItem[] {
  writeList(items);
  return items;
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
  Pick<ShoppingItem, "customName" | "amount" | "unit" | "category" | "emoji">
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
      ...(patch.emoji ? { emoji: patch.emoji } : {}),
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

function matchesShoppingItem(
  item: ShoppingItem,
  ingredientId: string | undefined,
  cleanName: string,
): boolean {
  if (ingredientId && item.ingredientId && item.ingredientId === ingredientId) return true;
  return normalizeProductName(item.customName) === cleanName;
}

/**
 * Fusionne les ingrédients d'un même aliment en additionnant les quantités
 * compatibles. Le regroupement se fait sur `ingredientId`, jamais sur le nom :
 * « Tomate » et « tomates » deviennent une seule ligne.
 *
 * Deux unités incompatibles produisent deux lignes distinctes. Les quantités
 * « q.s. » sont absorbées dès qu'une quantité chiffrée existe.
 */
export function mergeIngredients(ingredients: RecipeIngredient[]): ShoppingItem[] {
  const items: ShoppingItem[] = [];

  for (const ing of ingredients) {
    const name = ing.name.trim();
    if (!name) continue;

    const cleanName = normalizeProductName(name);
    const existing = items.find(
      (item) =>
        !item.isChecked && matchesShoppingItem(item, ing.ingredientId, cleanName),
    );

    if (existing) {
      const combined = combineQuantities(
        existing.amount,
        existing.unit,
        ing.amount,
        ing.unit,
        ing.ingredientId || ing.name,
      );
      if (combined) {
        existing.amount = combined.amount;
        existing.unit = combined.unit;
        continue;
      }
    }

    items.push(
      toShoppingItem({
        ingredientId: ing.ingredientId,
        customName: name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category,
        emoji: ing.emoji,
      }),
    );
  }

  return items;
}

/**
 * Ajoute (ou fusionne) des ingrédients dans la liste existante.
 * Ne touche jamais aux articles déjà cochés.
 */
export function appendIngredientsToShoppingList(
  ingredients: RecipeIngredient[],
): ShoppingItem[] {
  const list = readList();

  for (const ing of ingredients) {
    const name = ing.name.trim();
    if (!name) continue;

    const cleanName = normalizeProductName(name);
    const existing = list.find(
      (item) =>
        !item.isChecked && matchesShoppingItem(item, ing.ingredientId, cleanName),
    );

    if (existing) {
      const combined = combineQuantities(
        existing.amount,
        existing.unit,
        ing.amount,
        ing.unit,
        ing.ingredientId || ing.name,
      );
      if (combined) {
        existing.amount = combined.amount;
        existing.unit = combined.unit;
        continue;
      }
      // Unités incompatibles → nouvelle ligne sans écraser l'existant.
    }

    list.push(
      toShoppingItem({
        ingredientId: ing.ingredientId,
        customName: name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category,
        emoji: ing.emoji,
      }),
    );
  }

  writeList(list);
  return list;
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

/**
 * Export Planning → Courses : fusionne dans la liste existante
 * (déduplication + conversion d'unités compatibles).
 * Conservé pour compatibilité d'appel ; préférer `appendIngredientsToShoppingList`.
 */
export function replaceShoppingListFromIngredients(
  ingredients: RecipeIngredient[],
): ShoppingItem[] {
  return appendIngredientsToShoppingList(ingredients);
}

/** Nombre d'articles réellement ajoutés ou fusionnés lors d'un export. */
export function countExportImpact(
  ingredients: RecipeIngredient[],
  existing: ShoppingItem[] = readList(),
): number {
  let count = 0;
  const working = existing.map((item) => ({ ...item }));

  for (const ing of ingredients) {
    const name = ing.name.trim();
    if (!name) continue;
    const cleanName = normalizeProductName(name);
    const match = working.find(
      (item) =>
        !item.isChecked && matchesShoppingItem(item, ing.ingredientId, cleanName),
    );
    if (match) {
      const combined = combineQuantities(
        match.amount,
        match.unit,
        ing.amount,
        ing.unit,
        ing.ingredientId || ing.name,
      );
      if (combined) {
        match.amount = combined.amount;
        match.unit = combined.unit;
        count += 1;
        continue;
      }
    }
    working.push(
      toShoppingItem({
        ingredientId: ing.ingredientId,
        customName: name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category,
        emoji: ing.emoji,
      }),
    );
    count += 1;
  }

  return count;
}
