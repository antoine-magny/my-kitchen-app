/** Overlay / panneau des modales : plein écran utile, collé en haut, pas de bottom-20. */

export const MODAL_OVERLAY_CLASS =
  "fixed inset-x-0 top-0 z-[60] flex h-dvh items-end justify-center sm:inset-0 sm:items-center";

export const MODAL_OVERLAY_ABOVE_NAV_CLASS =
  "fixed inset-x-0 top-0 z-[70] flex h-dvh items-end justify-center sm:inset-0 sm:items-center";

export const MODAL_CENTERED_OVERLAY_CLASS =
  "fixed inset-x-0 top-0 z-[100] flex h-dvh items-end justify-center sm:items-center sm:px-4";

export const MODAL_PANEL_CLASS =
  "scale-in relative flex max-h-[min(92dvh,100%)] w-full flex-col overflow-hidden rounded-t-3xl sm:max-h-[88vh] sm:w-full sm:max-w-md sm:rounded-3xl";

export const MODAL_PANEL_WIDE_CLASS =
  "scale-in relative flex max-h-[min(92dvh,100%)] w-full flex-col overflow-hidden rounded-t-3xl sm:max-h-[92vh] sm:w-full sm:max-w-xl sm:rounded-3xl";

export const MODAL_CLOSE_BTN_CLASS =
  "flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40";
