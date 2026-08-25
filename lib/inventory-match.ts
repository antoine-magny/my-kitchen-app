/**
 * Matching d'identité partagé courses / frigo / consommation.
 * `ingredientId` d'abord, sinon nom normalisé exact — pas de fuzzy ni de
 * token isolé (évite « poulet fermier » ≈ « hauts de cuisse »).
 * Aucun JSX.
 */

import { normalizeProductName } from "@/lib/shopping-categories";

export function matchesInventoryIdentity(
  left: { ingredientId?: string; name: string },
  right: { ingredientId?: string; name: string },
): boolean {
  if (left.ingredientId && right.ingredientId && left.ingredientId === right.ingredientId) {
    return true;
  }
  const leftName = normalizeProductName(left.name);
  const rightName = normalizeProductName(right.name);
  return Boolean(leftName) && leftName === rightName;
}
