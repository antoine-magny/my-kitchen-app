/**
 * Codes autorisés par le domaine Postgres `unit_domain`.
 * Toute autre valeur est rejetée à l'insertion par la contrainte CHECK.
 */
export const UNITS = [
  { code: "g", label: "g" },
  { code: "kg", label: "kg" },
  { code: "ml", label: "mL" },
  { code: "l", label: "L" },
  { code: "unite", label: "unités" },
  { code: "cas", label: "c.à.s" },
  { code: "cac", label: "c.à.c" },
  { code: "pincee", label: "pincée" },
  { code: "tranche", label: "tranche" },
  { code: "botte", label: "botte" },
  { code: "gousse", label: "gousse" },
  { code: "feuille", label: "feuille" },
  { code: "qs", label: "q.s." },
] as const;

export type UnitCode = (typeof UNITS)[number]["code"];

export const DEFAULT_UNIT: UnitCode = "unite";

/** Marqueur « quantité suffisante » : le montant numérique n'a pas de sens. */
export const UNQUANTIFIED_UNIT: UnitCode = "qs";

export function isUnitCode(value: string): value is UnitCode {
  return UNITS.some((unit) => unit.code === value);
}

export function unitLabel(code: UnitCode): string {
  return UNITS.find((u) => u.code === code)?.label ?? code;
}

/**
 * Unité de référence pour additionner deux quantités.
 * Les masses se ramènent au gramme, les volumes au millilitre.
 */
const BASE_UNIT: Record<UnitCode, { unit: UnitCode; factor: number }> = {
  g: { unit: "g", factor: 1 },
  kg: { unit: "g", factor: 1000 },
  ml: { unit: "ml", factor: 1 },
  l: { unit: "ml", factor: 1000 },
  unite: { unit: "unite", factor: 1 },
  cas: { unit: "cas", factor: 1 },
  cac: { unit: "cac", factor: 1 },
  pincee: { unit: "pincee", factor: 1 },
  tranche: { unit: "tranche", factor: 1 },
  botte: { unit: "botte", factor: 1 },
  gousse: { unit: "gousse", factor: 1 },
  feuille: { unit: "feuille", factor: 1 },
  qs: { unit: "qs", factor: 1 },
};

/** Ramène une quantité à son unité de base (kg → g, L → mL). */
export function toBaseQuantity(
  amount: number,
  unit: UnitCode,
): { amount: number; unit: UnitCode } {
  const base = BASE_UNIT[unit] ?? BASE_UNIT.unite;
  return { amount: amount * base.factor, unit: base.unit };
}

/** Deux quantités ne sont additionnables que si elles partagent la même unité de base. */
export function areUnitsCompatible(a: UnitCode, b: UnitCode): boolean {
  return BASE_UNIT[a].unit === BASE_UNIT[b].unit;
}

/** Unités dénombrables qui prennent un « s » au pluriel à l'affichage. */
const PLURALIZED_UNITS: Partial<Record<UnitCode, string>> = {
  pincee: "pincée",
  tranche: "tranche",
  botte: "botte",
  gousse: "gousse",
  feuille: "feuille",
};

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
  if (unit === "qs") return "q.s.";

  if (unit === "g" && amount >= 1000) return `${formatNumber(amount / 1000)} kg`;
  if (unit === "ml") {
    if (amount >= 1000) return `${formatNumber(amount / 1000)} L`;
    if (amount >= 10 && amount % 10 === 0) return `${formatNumber(amount / 10)} cl`;
  }

  if (unit === "unite") return formatNumber(amount);

  const plural = PLURALIZED_UNITS[unit];
  if (plural) return `${formatNumber(amount)} ${plural}${amount > 1 ? "s" : ""}`;

  return `${formatNumber(amount)} ${unitLabel(unit)}`;
}

const UNIT_ALIASES: Record<string, { unit: UnitCode; factor: number }> = {
  g: { unit: "g", factor: 1 },
  gr: { unit: "g", factor: 1 },
  gramme: { unit: "g", factor: 1 },
  grammes: { unit: "g", factor: 1 },
  kg: { unit: "kg", factor: 1 },
  kilo: { unit: "kg", factor: 1 },
  kilos: { unit: "kg", factor: 1 },
  ml: { unit: "ml", factor: 1 },
  millilitre: { unit: "ml", factor: 1 },
  millilitres: { unit: "ml", factor: 1 },
  cl: { unit: "ml", factor: 10 },
  dl: { unit: "ml", factor: 100 },
  l: { unit: "l", factor: 1 },
  litre: { unit: "l", factor: 1 },
  litres: { unit: "l", factor: 1 },
  cas: { unit: "cas", factor: 1 },
  "c a s": { unit: "cas", factor: 1 },
  "cuillere a soupe": { unit: "cas", factor: 1 },
  "cuilleres a soupe": { unit: "cas", factor: 1 },
  tbsp: { unit: "cas", factor: 1 },
  cac: { unit: "cac", factor: 1 },
  "c a c": { unit: "cac", factor: 1 },
  "cuillere a cafe": { unit: "cac", factor: 1 },
  "cuilleres a cafe": { unit: "cac", factor: 1 },
  tsp: { unit: "cac", factor: 1 },
  unite: { unit: "unite", factor: 1 },
  unites: { unit: "unite", factor: 1 },
  piece: { unit: "unite", factor: 1 },
  pieces: { unit: "unite", factor: 1 },
  pce: { unit: "unite", factor: 1 },
  pc: { unit: "unite", factor: 1 },
  pot: { unit: "unite", factor: 1 },
  pots: { unit: "unite", factor: 1 },
  portion: { unit: "unite", factor: 1 },
  portions: { unit: "unite", factor: 1 },
  sachet: { unit: "unite", factor: 1 },
  sachets: { unit: "unite", factor: 1 },
  brin: { unit: "unite", factor: 1 },
  brins: { unit: "unite", factor: 1 },
  pincee: { unit: "pincee", factor: 1 },
  pincees: { unit: "pincee", factor: 1 },
  tranche: { unit: "tranche", factor: 1 },
  tranches: { unit: "tranche", factor: 1 },
  botte: { unit: "botte", factor: 1 },
  bottes: { unit: "botte", factor: 1 },
  gousse: { unit: "gousse", factor: 1 },
  gousses: { unit: "gousse", factor: 1 },
  feuille: { unit: "feuille", factor: 1 },
  feuilles: { unit: "feuille", factor: 1 },
  qs: { unit: "qs", factor: 1 },
};

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
  if (isUnitCode(token)) return token;
  const compact = token.replace(/\s/g, "");
  if (isUnitCode(compact)) return compact;
  return (UNIT_ALIASES[token] ?? UNIT_ALIASES[compact])?.unit ?? DEFAULT_UNIT;
}

const UNQUANTIFIED_MARKERS = [
  "qs",
  "q s",
  "quelques",
  "au gout",
  "a volonte",
  "selon gout",
] as const;

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
  if (!unitPart) return { amount, unit: "unite" };

  const token = normalizeUnitToken(unitPart);
  const alias = UNIT_ALIASES[token] ?? UNIT_ALIASES[token.replace(/\s/g, "")];
  if (!alias) return { amount, unit: "unite" };

  return { amount: amount * alias.factor, unit: alias.unit };
}
