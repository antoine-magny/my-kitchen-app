/** Constantes et helpers de positionnement des popovers portal (sans JSX). */

export const POPOVER_GAP = 6;
export const POPOVER_BOTTOM_NAV = 80;

export function clampPopoverLeft(left: number, width: number, viewportWidth: number): number {
  let next = Math.max(8, left);
  if (next + width > viewportWidth - 8) {
    next = Math.max(8, viewportWidth - width - 8);
  }
  return next;
}

export function popoverOpensAbove(spaceBelow: number, spaceAbove: number, preferredHeight: number): boolean {
  return spaceBelow < preferredHeight && spaceAbove > spaceBelow;
}

export function popoverMaxHeight(space: number, preferredHeight: number, minHeight = 120): number {
  return Math.min(preferredHeight, Math.max(minHeight, space - 8));
}
