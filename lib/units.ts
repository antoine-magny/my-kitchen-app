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
] as const;

export type UnitCode = (typeof UNITS)[number]["code"];

export const DEFAULT_UNIT: UnitCode = "unite";

export function isUnitCode(value: string): value is UnitCode {
  return UNITS.some((unit) => unit.code === value);
}

export function unitLabel(code: UnitCode): string {
  return UNITS.find((u) => u.code === code)?.label ?? code;
}
