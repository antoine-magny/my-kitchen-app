import type { RecipeIngredient } from "@/lib/recipes";
import {
  classifyProduct,
  isShoppingCategoryId,
  type ShoppingCategoryId,
} from "@/lib/shopping-categories";

export type ShoppingListItem = {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  /** Rayon magasin — attribué automatiquement via classifyProduct. */
  category: ShoppingCategoryId;
};

const STORAGE_KEY = "my-kitchen-shopping-list";

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Unités canoniques pour l’addition des quantités. */
type SumUnit = "g" | "ml" | "cas" | "cac" | "unite" | "botte" | "gousse" | "feuille" | "pincee";

type ParsedQuantity =
  | { kind: "qty"; value: number; unit: SumUnit }
  | { kind: "text"; raw: string };

const UNIT_TO_BASE_FACTOR: Record<string, { unit: SumUnit; factor: number }> = {
  g: { unit: "g", factor: 1 },
  gr: { unit: "g", factor: 1 },
  gramme: { unit: "g", factor: 1 },
  grammes: { unit: "g", factor: 1 },
  kg: { unit: "g", factor: 1000 },
  kilo: { unit: "g", factor: 1000 },
  kilos: { unit: "g", factor: 1000 },
  ml: { unit: "ml", factor: 1 },
  millilitre: { unit: "ml", factor: 1 },
  millilitres: { unit: "ml", factor: 1 },
  l: { unit: "ml", factor: 1000 },
  litre: { unit: "ml", factor: 1000 },
  litres: { unit: "ml", factor: 1000 },
  cl: { unit: "ml", factor: 10 },
  dl: { unit: "ml", factor: 100 },
  "c.a.s": { unit: "cas", factor: 1 },
  "c.à.s": { unit: "cas", factor: 1 },
  cas: { unit: "cas", factor: 1 },
  "cuillere a soupe": { unit: "cas", factor: 1 },
  "cuilleres a soupe": { unit: "cas", factor: 1 },
  "c.a.c": { unit: "cac", factor: 1 },
  "c.à.c": { unit: "cac", factor: 1 },
  cac: { unit: "cac", factor: 1 },
  "cuillere a cafe": { unit: "cac", factor: 1 },
  "cuilleres a cafe": { unit: "cac", factor: 1 },
  piece: { unit: "unite", factor: 1 },
  pieces: { unit: "unite", factor: 1 },
  unite: { unit: "unite", factor: 1 },
  unites: { unit: "unite", factor: 1 },
  botte: { unit: "botte", factor: 1 },
  bottes: { unit: "botte", factor: 1 },
  gousse: { unit: "gousse", factor: 1 },
  gousses: { unit: "gousse", factor: 1 },
  feuille: { unit: "feuille", factor: 1 },
  feuilles: { unit: "feuille", factor: 1 },
  pincee: { unit: "pincee", factor: 1 },
  pincees: { unit: "pincee", factor: 1 },
};

function normalizeUnitToken(unit: string): string {
  return unit
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumberToken(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(t);
  if (fraction) {
    const a = Number(fraction[1]);
    const b = Number(fraction[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Parse une quantité libre (« 150 g », « 1/2 », « 2 c.à.s », « q.s. »). */
export function parseQuantity(amount: string): ParsedQuantity {
  const raw = amount.trim();
  if (!raw) return { kind: "text", raw: "" };

  const lowered = raw.toLowerCase();
  if (
    lowered === "q.s." ||
    lowered === "qs" ||
    lowered === "q.s" ||
    lowered.startsWith("quelques") ||
    lowered === "au goût" ||
    lowered === "au gout"
  ) {
    return { kind: "text", raw };
  }

  const match =
    /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|\d+\s*\/\s*\d+)\s*([a-zA-Zàâäéèêëïîôùûüç.%°].*)?$/u.exec(
      raw,
    );
  if (!match) return { kind: "text", raw };

  const value = parseNumberToken(match[1]);
  if (value == null) return { kind: "text", raw };

  const unitRaw = (match[2] ?? "").trim();
  if (!unitRaw) {
    return { kind: "qty", value, unit: "unite" };
  }

  const stripped = normalizeUnitToken(unitRaw);
  const compact = stripped.replace(/\s*\.\s*/g, ".").replace(/\s+/g, " ").trim();
  const noSpaces = compact.replace(/\s/g, "");

  // c.à.s / c.a.s / cas
  let lookup = compact;
  if (/^c\.?a\.?s\.?$/.test(noSpaces) || noSpaces === "cas") lookup = "c.a.s";
  else if (/^c\.?a\.?c\.?$/.test(noSpaces) || noSpaces === "cac") lookup = "c.a.c";
  else if (noSpaces === "pieces" || noSpaces === "piece") lookup = "piece";

  const candidates = [lookup, compact, noSpaces, stripped];
  for (const candidate of candidates) {
    const mapped = UNIT_TO_BASE_FACTOR[candidate];
    if (mapped) {
      return { kind: "qty", value: value * mapped.factor, unit: mapped.unit };
    }
  }

  return { kind: "text", raw };
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  if (Math.abs(rounded - 0.5) < 1e-9) return "1/2";
  if (Math.abs(rounded - 0.25) < 1e-9) return "1/4";
  if (Math.abs(rounded - 0.75) < 1e-9) return "3/4";
  if (Number.isInteger(rounded)) return String(rounded);
  return String(Math.round(rounded * 10) / 10).replace(".", ",");
}

function formatQuantity(value: number, unit: SumUnit): string {
  if (unit === "g") {
    if (value >= 1000) return `${formatNumber(value / 1000)} kg`;
    return `${formatNumber(value)} g`;
  }
  if (unit === "ml") {
    if (value >= 1000) return `${formatNumber(value / 1000)} L`;
    if (value >= 10 && value % 10 === 0) return `${formatNumber(value / 10)} cl`;
    return `${formatNumber(value)} ml`;
  }
  if (unit === "cas") return `${formatNumber(value)} c.à.s`;
  if (unit === "cac") return `${formatNumber(value)} c.à.c`;
  if (unit === "botte") return `${formatNumber(value)} botte${value > 1 ? "s" : ""}`;
  if (unit === "gousse") return `${formatNumber(value)} gousse${value > 1 ? "s" : ""}`;
  if (unit === "feuille") return `${formatNumber(value)} feuille${value > 1 ? "s" : ""}`;
  if (unit === "pincee") return `${formatNumber(value)} pincée${value > 1 ? "s" : ""}`;
  return formatNumber(value);
}

/**
 * Additionne des quantités compatibles.
 * Ex. ["150 g", "250 g"] → "400 g" ; ["2 c.à.s", "1 c.à.s"] → "3 c.à.s".
 * Si unités incompatibles : concatène avec « + ».
 */
export function sumAmountStrings(amounts: string[]): string {
  const cleaned = amounts.map((a) => a.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];

  const parsed = cleaned.map(parseQuantity);
  const byUnit = new Map<SumUnit, number>();
  const texts: string[] = [];
  const seenText = new Set<string>();

  for (const p of parsed) {
    if (p.kind === "qty") {
      byUnit.set(p.unit, (byUnit.get(p.unit) ?? 0) + p.value);
    } else if (p.raw) {
      const key = p.raw.toLowerCase();
      if (!seenText.has(key)) {
        seenText.add(key);
        texts.push(p.raw);
      }
    }
  }

  const parts: string[] = [];
  for (const [unit, value] of byUnit) {
    if (value > 0) parts.push(formatQuantity(value, unit));
  }
  parts.push(...texts);

  return parts.join(" + ");
}

function withCategory(item: Omit<ShoppingListItem, "category"> & { category?: string }): ShoppingListItem {
  const category =
    item.category && isShoppingCategoryId(item.category)
      ? item.category
      : classifyProduct(item.name);
  return {
    id: item.id,
    name: item.name,
    amount: item.amount,
    checked: item.checked,
    category,
  };
}

function readList(): ShoppingListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => {
      const item = entry as Partial<ShoppingListItem>;
      return withCategory({
        id: String(item.id ?? `shop-${Date.now()}`),
        name: String(item.name ?? ""),
        amount: String(item.amount ?? ""),
        checked: Boolean(item.checked),
        category: item.category,
      });
    });
  } catch {
    return [];
  }
}

function writeList(items: ShoppingListItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getShoppingList(): ShoppingListItem[] {
  return readList();
}

export function toggleShoppingItem(id: string): ShoppingListItem[] {
  const next = readList().map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item,
  );
  writeList(next);
  return next;
}

export function removeShoppingItem(id: string): ShoppingListItem[] {
  const next = readList().filter((item) => item.id !== id);
  writeList(next);
  return next;
}

export function updateShoppingItem(
  id: string,
  patch: Partial<Pick<ShoppingListItem, "name" | "amount" | "category">>,
): ShoppingListItem[] {
  const next = readList().map((item) => {
    if (item.id !== id) return item;
    const name = patch.name !== undefined ? patch.name : item.name;
    const amount = patch.amount !== undefined ? patch.amount : item.amount;
    const category =
      patch.category !== undefined
        ? patch.category
        : patch.name !== undefined
          ? classifyProduct(name)
          : item.category;
    return withCategory({ ...item, name, amount, category });
  });
  writeList(next);
  return next;
}

export function clearCheckedShoppingItems(): ShoppingListItem[] {
  const next = readList().filter((item) => !item.checked);
  writeList(next);
  return next;
}

export function clearShoppingList(): ShoppingListItem[] {
  writeList([]);
  return [];
}

/** Fusionne les ingrédients homonymes en additionnant les quantités compatibles. */
export function mergeIngredients(ingredients: RecipeIngredient[]): ShoppingListItem[] {
  const map = new Map<string, { name: string; amounts: string[] }>();

  for (const ing of ingredients) {
    const name = ing.name.trim();
    if (!name) continue;
    const key = normalizeName(name);
    const amount = ing.amount.trim();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { name, amounts: amount ? [amount] : [] });
    } else if (amount) {
      existing.amounts.push(amount);
    }
  }

  return [...map.values()].map((entry, index) =>
    withCategory({
      id: `shop-${Date.now()}-${index}-${normalizeName(entry.name).replace(/\W+/g, "-")}`,
      name: entry.name,
      amount: sumAmountStrings(entry.amounts),
      checked: false,
    }),
  );
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
): ShoppingListItem[] {
  const items = mergeIngredients(ingredients);
  writeList(items);
  return items;
}
