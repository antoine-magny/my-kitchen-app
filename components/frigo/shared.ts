import {
  daysUntilDlc,
  FRIDGE_TABS,
  type FridgeItem,
  type FridgeStorageLocation,
} from "@/lib/fridge";
import type { UnitCode } from "@/lib/units";

export type TabId = FridgeStorageLocation;
export type Ingredient = FridgeItem;

/** Saisie du modal d'ajout : l'identité canonique est dérivée à la création. */
export type NewFridgeItem = {
  customName: string;
  amount: number;
  unit: UnitCode;
  category: TabId;
  icon?: string;
  expirationDate?: string | null;
};

export const TABS = FRIDGE_TABS;

export function dlcLabel(dlc: string | null | undefined): string {
  if (!dlc) return "";
  const diff = daysUntilDlc(dlc);
  if (diff < 0) {
    const days = Math.abs(diff);
    return `Périmé depuis ${days} jour${days > 1 ? "s" : ""}`;
  }
  if (diff === 0) return "Expire aujourd'hui";
  if (diff === 1) return "Expire demain";
  return `DLC ${new Date(dlc).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

export function expiredSinceLabel(dlc: string): string {
  const diff = daysUntilDlc(dlc);
  if (diff < 0) {
    const days = Math.abs(diff);
    return `Périmé depuis ${days} jour${days > 1 ? "s" : ""}`;
  }
  if (diff === 0) return "Expire aujourd'hui";
  return dlcLabel(dlc);
}

export const STATUS_STYLE = {
  urgent: { color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  soon: { color: "#C2410C", bg: "#FFF7ED", dot: "#F97316" },
  ok: { color: "#6B7280", bg: "transparent", dot: "#9CA3AF" },
  none: { color: "#9CA3AF", bg: "transparent", dot: "#D1D5DB" },
};
