"use client";

import { UNIT_LIST, unitLabel, type UnitCode } from "@/lib/units";

interface UnitSelectProps {
  value: string;
  onChange: (unit: string) => void;
  className?: string;
  id?: string;
  /** Libellés courts (idéal pour les lignes courses / frigo). */
  compact?: boolean;
  "aria-label"?: string;
}

const MASS_CODES = new Set(["g", "kg"]);
const VOLUME_CODES = new Set(["ml", "cl", "l", "c_cafe", "c_soupe", "verre"]);
const COUNT_CODES = new Set([
  "piece",
  "gousse",
  "tranche",
  "sachet",
  "pincee",
  "brin",
  "poignee",
  "botte",
  "feuille",
]);

const FULL_LABELS: Record<string, string> = {
  g: "Grammes (g)",
  kg: "Kilogrammes (kg)",
  ml: "Millilitres (ml)",
  cl: "Centilitres (cl)",
  l: "Litres (L)",
  c_cafe: "Cuillère à café (5 ml)",
  c_soupe: "Cuillère à soupe (15 ml)",
  verre: "Verre (20 cl)",
  piece: "Pièce(s)",
  gousse: "Gousse(s)",
  tranche: "Tranche(s)",
  sachet: "Sachet(s)",
  pincee: "Pincée(s)",
  brin: "Brin(s)",
  poignee: "Poignée(s)",
  botte: "Botte(s)",
  feuille: "Feuille(s)",
  qs: "q.s. (quantité suffisante)",
};

const DEFAULT_CLASS =
  "w-full rounded-xl border border-[#E2EBE3] bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5B3E]";

/**
 * Sélecteur d'unités par familles (Masse / Volume / Décompte).
 * Réutilisable dans Recettes, Frigo et Courses.
 */
export function UnitSelect({
  value,
  onChange,
  className,
  id,
  compact = false,
  ...rest
}: UnitSelectProps) {
  const mass = UNIT_LIST.filter((u) => MASS_CODES.has(u.code));
  const volume = UNIT_LIST.filter((u) => VOLUME_CODES.has(u.code));
  const count = UNIT_LIST.filter((u) => COUNT_CODES.has(u.code));

  const labelOf = (code: string) =>
    compact ? unitLabel(code as UnitCode) : (FULL_LABELS[code] ?? unitLabel(code as UnitCode));

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className || DEFAULT_CLASS}
      aria-label={rest["aria-label"] ?? "Unité"}
    >
      <optgroup label="Masse">
        {mass.map((u) => (
          <option key={u.code} value={u.code}>
            {labelOf(u.code)}
          </option>
        ))}
      </optgroup>
      <optgroup label="Volume">
        {volume.map((u) => (
          <option key={u.code} value={u.code}>
            {labelOf(u.code)}
          </option>
        ))}
      </optgroup>
      <optgroup label="Décompte">
        {count.map((u) => (
          <option key={u.code} value={u.code}>
            {labelOf(u.code)}
          </option>
        ))}
        <option value="qs">{labelOf("qs")}</option>
      </optgroup>
    </select>
  );
}
