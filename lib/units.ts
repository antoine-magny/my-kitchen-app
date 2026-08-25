import { getIngredientEquivalence } from "@/lib/ingredients";
import {
  LEGACY_UNIT_MAP,
  PLURALIZED_UNITS,
  UNIT_ALIASES,
  UNIT_SHORT_LABELS,
  UNQUANTIFIED_MARKERS,
} from "@/lib/unit-aliases";

/**
 * Unités regroupées par familles (Masse, Volume, Décompte).
 * Les quantités compatibles peuvent être additionnées via `combineQuantities`.
 * Les codes correspondent au domaine Postgres `unit_domain`.
 */

export type UnitCategory = "mass" | "volume" | "count";

export interface UnitDefinition {
  code: string;
  label: string;
  category: UnitCategory;
  /** g pour mass, ml pour volume, 1 pour count. */
  baseRatio: number;
}

export const UNITS: Record<string, UnitDefinition> = {
  // --- MASSE (Base : g) ---
  g: { code: "g", label: "g (grammes)", category: "mass", baseRatio: 1 },
  kg: { code: "kg", label: "kg (kilos)", category: "mass", baseRatio: 1000 },

  // --- VOLUME (Base : ml) ---
  ml: { code: "ml", label: "ml (millilitres)", category: "volume", baseRatio: 1 },
  cl: { code: "cl", label: "cl (centilitres)", category: "volume", baseRatio: 10 },
  l: { code: "l", label: "L (litres)", category: "volume", baseRatio: 1000 },
  c_cafe: { code: "c_cafe", label: "c. à café (5 ml)", category: "volume", baseRatio: 5 },
  c_soupe: { code: "c_soupe", label: "c. à soupe (15 ml)", category: "volume", baseRatio: 15 },
  verre: { code: "verre", label: "verre (20 cl)", category: "volume", baseRatio: 200 },

  // --- DÉCOMPTE & UNITÉS (Base : unité) ---
  piece: { code: "piece", label: "Pièce", category: "count", baseRatio: 1 },
  gousse: { code: "gousse", label: "gousse(s)", category: "count", baseRatio: 1 },
  tranche: { code: "tranche", label: "tranche(s)", category: "count", baseRatio: 1 },
  sachet: { code: "sachet", label: "sachet(s)", category: "count", baseRatio: 1 },
  pincee: { code: "pincee", label: "pincée(s)", category: "count", baseRatio: 1 },
  brin: { code: "brin", label: "brin(s)", category: "count", baseRatio: 1 },
  poignee: { code: "poignee", label: "poignée(s)", category: "count", baseRatio: 1 },
  botte: { code: "botte", label: "botte(s)", category: "count", baseRatio: 1 },
  feuille: { code: "feuille", label: "feuille(s)", category: "count", baseRatio: 1 },
  /** Quantité non chiffrée (« Quantité suffisante ») — jamais additionnée avec une autre unité. */
  qs: { code: "qs", label: "Quantité suffisante", category: "count", baseRatio: 1 },
};

export type UnitCode = keyof typeof UNITS;

/** Liste ordonnée pour les sélecteurs UI. */
export const UNIT_LIST: readonly UnitDefinition[] = Object.values(UNITS);

export const DEFAULT_UNIT: UnitCode = "piece";

/** Marqueur « quantité suffisante » : le montant numérique n'a pas de sens. */
export const UNQUANTIFIED_UNIT: UnitCode = "qs";

export function isUnitCode(value: string): value is UnitCode {
  return value in UNITS;
}

/** Normalise un code (y compris alias legacy) vers un `UnitCode` connu. */
export function coerceUnitCode(value: string): UnitCode | null {
  if (isUnitCode(value)) return value;
  const legacy = LEGACY_UNIT_MAP[value];
  return legacy ?? null;
}

export function unitLabel(code: UnitCode): string {
  return UNIT_SHORT_LABELS[code] ?? UNITS[code]?.label ?? code;
}

export function getUnitCategory(code: string): UnitCategory | null {
  const unit = UNITS[coerceUnitCode(code) ?? ""];
  return unit?.category ?? null;
}

/**
 * Combine deux quantités d'un même ingrédient si leurs unités sont compatibles.
 * - Masse : ramené en g, additionné, converti en kg si >= 1000g.
 * - Volume : ramené en ml, additionné, converti en L si >= 1000ml.
 * - Décompte : additionné si unité strictement identique, ou converti via le ratio d'équivalence.
 * - Incompatible / q.s. : retourne null pour forcer 2 lignes séparées.
 */
export function combineQuantities(
  amount1: number,
  unitCode1: string,
  amount2: number,
  unitCode2: string,
  ingredientNameOrId?: string,
): { amount: number; unit: UnitCode } | null {
  const code1 = coerceUnitCode(unitCode1);
  const code2 = coerceUnitCode(unitCode2);

  if (!code1 || !code2) {
    if (unitCode1 === unitCode2) {
      return { amount: amount1 + amount2, unit: (unitCode1 as UnitCode) || DEFAULT_UNIT };
    }
    return null;
  }

  const u1 = UNITS[code1];
  const u2 = UNITS[code2];

  // q.s. n'est jamais additionnable (sauf deux q.s. → reste q.s.).
  if (code1 === UNQUANTIFIED_UNIT || code2 === UNQUANTIFIED_UNIT) {
    if (code1 === UNQUANTIFIED_UNIT && code2 === UNQUANTIFIED_UNIT) {
      return { amount: 0, unit: UNQUANTIFIED_UNIT };
    }
    // Une quantité chiffrée absorbe le q.s. du même aliment.
    if (code1 === UNQUANTIFIED_UNIT) return { amount: amount2, unit: code2 };
    return { amount: amount1, unit: code1 };
  }

  if (code1 === code2) {
    if (u1.category === "mass") {
      const total = amount1 + amount2;
      if (code1 === "g" && total >= 1000) {
        return { amount: Number((total / 1000).toFixed(2)), unit: "kg" };
      }
      return { amount: total, unit: code1 };
    }
    if (u1.category === "volume") {
      const total = amount1 + amount2;
      if (code1 === "ml" && total >= 1000) {
        return { amount: Number((total / 1000).toFixed(2)), unit: "l" };
      }
      return { amount: total, unit: code1 };
    }
    if (u1.category === "count") {
      return { amount: amount1 + amount2, unit: code1 };
    }
  }

  if (u1.category === "mass" && u2.category === "mass") {
    const totalGrams = amount1 * u1.baseRatio + amount2 * u2.baseRatio;
    if (totalGrams >= 1000) {
      return { amount: Number((totalGrams / 1000).toFixed(2)), unit: "kg" };
    }
    return { amount: Math.round(totalGrams), unit: "g" };
  }

  if (u1.category === "volume" && u2.category === "volume") {
    const totalMl = amount1 * u1.baseRatio + amount2 * u2.baseRatio;
    if (totalMl >= 1000) {
      return { amount: Number((totalMl / 1000).toFixed(2)), unit: "l" };
    }
    return { amount: Math.round(totalMl), unit: "ml" };
  }

  // Équivalence masse/volume <-> décompte si un ratio est connu pour l'ingrédient
  if (ingredientNameOrId) {
    const eq = getIngredientEquivalence(ingredientNameOrId);
    if (eq?.gramsPerCountUnit && eq.gramsPerCountUnit > 0) {
      if (u1.category === "mass" && u2.category === "count") {
        const grams1 = amount1 * u1.baseRatio;
        const countFromGrams = grams1 / eq.gramsPerCountUnit;
        const total = Math.round((amount2 + countFromGrams) * 100) / 100;
        return { amount: total, unit: code2 };
      }
      if (u1.category === "count" && u2.category === "mass") {
        const grams2 = amount2 * u2.baseRatio;
        const countFromGrams = grams2 / eq.gramsPerCountUnit;
        const total = Math.round((amount1 + countFromGrams) * 100) / 100;
        return { amount: total, unit: code1 };
      }
    }

    if (eq?.mlPerCountUnit && eq.mlPerCountUnit > 0) {
      if (u1.category === "volume" && u2.category === "count") {
        const ml1 = amount1 * u1.baseRatio;
        const countFromMl = ml1 / eq.mlPerCountUnit;
        const total = Math.round((amount2 + countFromMl) * 100) / 100;
        return { amount: total, unit: code2 };
      }
      if (u1.category === "count" && u2.category === "volume") {
        const ml2 = amount2 * u2.baseRatio;
        const countFromMl = ml2 / eq.mlPerCountUnit;
        const total = Math.round((amount1 + countFromMl) * 100) / 100;
        return { amount: total, unit: code1 };
      }
    }
  }

  return null;
}

/** Ramène une quantité à son unité de base (kg → g, L → ml, c.à.s → ml). */
export function toBaseQuantity(
  amount: number,
  unit: UnitCode,
): { amount: number; unit: UnitCode } {
  const def = UNITS[unit] ?? UNITS[DEFAULT_UNIT];
  if (def.category === "mass") return { amount: amount * def.baseRatio, unit: "g" };
  if (def.category === "volume") return { amount: amount * def.baseRatio, unit: "ml" };
  return { amount, unit };
}

/** Deux quantités ne sont additionnables que si `combineQuantities` réussirait. */
export function areUnitsCompatible(a: UnitCode, b: UnitCode, ingredientNameOrId?: string): boolean {
  return combineQuantities(1, a, 1, b, ingredientNameOrId) != null;
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

/**
 * Rendu lisible d'une quantité structurée.
 * Ex. (400, "g") → « 400 g » ; (0, "qs") → « q.s. » ; (3, "gousse") → « 3 gousses ».
 */
export function formatAmount(amount: number, unit: UnitCode): string {
  const code = coerceUnitCode(unit) ?? unit;
  if (code === "qs") return "Quantité suffisante";

  if (code === "g" && amount >= 1000) return `${formatNumber(amount / 1000)} kg`;
  if (code === "ml") {
    if (amount >= 1000) return `${formatNumber(amount / 1000)} L`;
    if (amount >= 10 && amount % 10 === 0) return `${formatNumber(amount / 10)} cl`;
  }

  if (code === "piece") return formatNumber(amount);

  const plural = PLURALIZED_UNITS[code];
  if (plural) return `${formatNumber(amount)} ${plural}${amount > 1 ? "s" : ""}`;

  return `${formatNumber(amount)} ${UNIT_SHORT_LABELS[code] ?? unitLabel(code)}`;
}

/** Minuscules, sans accents ni ponctuation d'abréviation (« c.à.s » → « c a s »). */
function normalizeUnitToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalise une unité libre (IA, saisie utilisateur) vers un code `unit_domain`. */
export function normalizeUnit(value: unknown): UnitCode {
  if (typeof value !== "string") return DEFAULT_UNIT;
  const token = normalizeUnitToken(value);
  if (!token) return DEFAULT_UNIT;

  const coerced = coerceUnitCode(token) ?? coerceUnitCode(token.replace(/\s/g, ""));
  if (coerced) return coerced;

  const compact = token.replace(/\s/g, "");
  return (UNIT_ALIASES[token] ?? UNIT_ALIASES[compact])?.unit ?? DEFAULT_UNIT;
}

function parseNumberToken(raw: string): number | null {
  const token = raw.trim().replace(",", ".");
  if (!token) return null;
  const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(token);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

/**
 * Convertit une quantité écrite en toutes lettres vers le modèle structuré.
 * Ex. « 150 g » → { amount: 150, unit: "g" } ; « q.s. » → { amount: 0, unit: "qs" }.
 */
export function parseAmount(raw: string): { amount: number; unit: UnitCode } {
  const trimmed = raw.trim();
  if (!trimmed) return { amount: 0, unit: UNQUANTIFIED_UNIT };

  const normalized = normalizeUnitToken(trimmed);
  if (UNQUANTIFIED_MARKERS.some((marker) => normalized === marker || normalized.startsWith(`${marker} `))) {
    return { amount: 0, unit: UNQUANTIFIED_UNIT };
  }

  const match =
    /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|\d+\s*\/\s*\d+)\s*(.*)$/u.exec(trimmed);
  if (!match) return { amount: 0, unit: UNQUANTIFIED_UNIT };

  const amount = parseNumberToken(match[1]);
  if (amount == null) return { amount: 0, unit: UNQUANTIFIED_UNIT };

  const unitPart = match[2].trim();
  if (!unitPart) return { amount, unit: "piece" };

  const token = normalizeUnitToken(unitPart);
  const alias = UNIT_ALIASES[token] ?? UNIT_ALIASES[token.replace(/\s/g, "")];
  if (!alias) return { amount, unit: "piece" };

  return { amount: amount * alias.factor, unit: alias.unit };
}
