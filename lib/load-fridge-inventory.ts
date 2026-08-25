import {
  countUsableFridgeItems,
  getFridgeSnapshot,
  MIN_USABLE_FRIDGE_ITEMS,
  type FridgeSnapshotItem,
} from "@/lib/fridge";

export type FridgeInventorySnapshot = {
  items: FridgeSnapshotItem[];
  usableCount: number;
};

/** Inventaire Supabase si assez riche, sinon snapshot localStorage. */
export async function loadPreferredFridgeInventory(): Promise<FridgeInventorySnapshot> {
  let supabaseItems: FridgeSnapshotItem[] = [];
  try {
    const response = await fetch("/api/fridge-inventory");
    if (response.ok) {
      const data = (await response.json()) as { items?: FridgeSnapshotItem[] };
      supabaseItems = Array.isArray(data.items) ? data.items : [];
    }
  } catch {
    supabaseItems = [];
  }

  const localItems = getFridgeSnapshot();
  const chosen =
    countUsableFridgeItems(supabaseItems) >= MIN_USABLE_FRIDGE_ITEMS
      ? supabaseItems
      : localItems;

  return {
    items: chosen,
    usableCount: countUsableFridgeItems(chosen),
  };
}
