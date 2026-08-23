export const MASS_CODES = new Set(["g", "kg"]);
export const VOLUME_CODES = new Set(["ml", "cl", "l", "c_cafe", "c_soupe", "verre"]);
export const ALL_COUNT_CODES = [
  "piece",
  "gousse",
  "tranche",
  "sachet",
  "pincee",
  "brin",
  "poignee",
  "botte",
  "feuille",
];

export interface UnitDisplayInfo {
  label: string;
  shortLabel: string;
  detail?: string;
}

export const UNIT_DISPLAY_CONFIG: Record<string, UnitDisplayInfo> = {
  g: { label: "Grammes", shortLabel: "g", detail: "g" },
  kg: { label: "Kilogrammes", shortLabel: "kg", detail: "kg" },
  ml: { label: "Millilitres", shortLabel: "ml", detail: "ml" },
  cl: { label: "Centilitres", shortLabel: "cl", detail: "cl" },
  l: { label: "Litres", shortLabel: "L", detail: "L" },
  c_cafe: { label: "Cuillère à café", shortLabel: "c.à.c", detail: "5 ml" },
  c_soupe: { label: "Cuillère à soupe", shortLabel: "c.à.s", detail: "15 ml" },
  verre: { label: "Verre", shortLabel: "verre", detail: "20 cl" },
  piece: { label: "Pièce", shortLabel: "Pièce", detail: "unité" },
  gousse: { label: "Gousse", shortLabel: "gousse" },
  tranche: { label: "Tranche", shortLabel: "tranche" },
  sachet: { label: "Sachet", shortLabel: "sachet" },
  pincee: { label: "Pincée", shortLabel: "pincée" },
  brin: { label: "Brin", shortLabel: "brin" },
  poignee: { label: "Poignée", shortLabel: "poignée" },
  botte: { label: "Botte", shortLabel: "botte" },
  feuille: { label: "Feuille", shortLabel: "feuille" },
  qs: { label: "Quantité suffisante", shortLabel: "Quantité suffisante", detail: "q.s." },
};
