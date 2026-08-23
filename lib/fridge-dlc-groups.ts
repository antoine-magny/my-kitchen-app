import { daysUntilDlc, dlcStatus } from "@/lib/fridge";

export const DLC_GROUP_IDS = ["urgent", "soon", "ok"] as const;
export type DlcGroupId = (typeof DLC_GROUP_IDS)[number];

export type DlcGroup = {
  id: DlcGroupId;
  title: string;
  dot: string;
};

/** Ordre d'affichage des sections DLC, calqué sur la légende du frigo. */
export const DLC_GROUPS: readonly DlcGroup[] = [
  { id: "urgent", title: "Urgent / Périmé", dot: "#EF4444" },
  { id: "soon", title: "Dans les 3 jours", dot: "#F97316" },
  { id: "ok", title: "OK", dot: "#9CA3AF" },
];

const GROUP_BY_ID = Object.fromEntries(DLC_GROUPS.map((group) => [group.id, group])) as Record<
  DlcGroupId,
  DlcGroup
>;

export function groupIdForItem(expirationDate: string | null | undefined): DlcGroupId {
  const status = dlcStatus(expirationDate);
  return status === "none" ? "ok" : status;
}

/**
 * Regroupe les aliments par urgence de DLC.
 * Les sections vides sont omises. Sans date → section OK.
 */
export function groupByDlcStatus<T extends { expirationDate?: string | null }>(
  items: T[],
): { group: DlcGroup; items: T[] }[] {
  const buckets = Object.fromEntries(DLC_GROUP_IDS.map((id) => [id, [] as T[]])) as Record<
    DlcGroupId,
    T[]
  >;

  for (const item of items) {
    buckets[groupIdForItem(item.expirationDate)].push(item);
  }

  for (const id of DLC_GROUP_IDS) {
    buckets[id].sort((a, b) => {
      const da = a.expirationDate ? daysUntilDlc(a.expirationDate) : Number.POSITIVE_INFINITY;
      const db = b.expirationDate ? daysUntilDlc(b.expirationDate) : Number.POSITIVE_INFINITY;
      return da - db;
    });
  }

  return DLC_GROUP_IDS.filter((id) => buckets[id].length > 0).map((id) => ({
    group: GROUP_BY_ID[id],
    items: buckets[id],
  }));
}
