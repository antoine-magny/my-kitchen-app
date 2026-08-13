import "server-only";

import {
  daysUntilDlc,
  dlcStatus,
  isFridgeStorageLocation,
  type FridgeSnapshotItem,
} from "@/lib/fridge";
import { resolveIngredientId } from "@/lib/ingredients";
import { createAdminClient, getOwnerId } from "@/lib/supabase/admin";
import { DEFAULT_UNIT, isUnitCode } from "@/lib/units";

function ingredientNameFromJoin(value: unknown): string | undefined {
  if (!value) return undefined;
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return undefined;
  const name = (row as { name?: unknown }).name;
  if (typeof name !== "string") return undefined;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Inventaire frigo / placards persisté (pantry_items + ingredients).
 * Clé serveur uniquement — jamais depuis le navigateur.
 */
export async function getSupabaseFridgeSnapshot(): Promise<FridgeSnapshotItem[]> {
  const supabase = createAdminClient();
  const ownerId = getOwnerId();
  const now = new Date();

  const { data, error } = await supabase
    .from("pantry_items")
    .select("quantity, unit, storage_location, expiration_date, ingredients(name)")
    .eq("user_id", ownerId)
    .gt("quantity", 0);

  if (error) {
    throw new Error(`Inventaire Supabase indisponible : ${error.message}`);
  }

  const items: FridgeSnapshotItem[] = [];
  for (const row of data ?? []) {
    const name = ingredientNameFromJoin(row.ingredients);
    if (!name) continue;

    const location = isFridgeStorageLocation(row.storage_location)
      ? row.storage_location
      : "fridge";
    const unit = isUnitCode(row.unit) ? row.unit : DEFAULT_UNIT;
    const expiresOn = row.expiration_date;
    const urgency = dlcStatus(expiresOn, now);

    items.push({
      name,
      ingredientId: resolveIngredientId(name),
      quantity: row.quantity,
      unit,
      location,
      expiresOn,
      daysUntilExpiry: expiresOn ? daysUntilDlc(expiresOn, now) : null,
      urgency,
    });
  }

  return items;
}
