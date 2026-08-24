/** Overlay / panneau des modales : centrés, marges, coins arrondis, flou d’arrière-plan. */

export const MODAL_OVERLAY_CLASS =
  "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(20,31,22,0.55)] backdrop-blur-[4px]";

export const MODAL_OVERLAY_ABOVE_NAV_CLASS =
  "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[rgba(20,31,22,0.55)] backdrop-blur-[4px]";

export const MODAL_CENTERED_OVERLAY_CLASS =
  "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(20,31,22,0.55)] backdrop-blur-[4px]";

export const MODAL_PANEL_BASE_CLASS =
  "scale-in relative flex min-h-0 max-h-[min(85dvh,100%)] w-full flex-col overflow-y-auto rounded-3xl bg-white shadow-[0_24px_64px_rgba(20,31,22,0.22)]";

export const MODAL_PANEL_CLASS =
  "scale-in relative flex min-h-0 max-h-[min(85dvh,100%)] w-full max-w-md flex-col overflow-y-auto rounded-3xl bg-white shadow-[0_24px_64px_rgba(20,31,22,0.22)]";

export const MODAL_PANEL_WIDE_CLASS =
  "scale-in relative flex min-h-0 max-h-[min(85dvh,100%)] w-full max-w-xl flex-col overflow-y-auto rounded-3xl bg-white shadow-[0_24px_64px_rgba(20,31,22,0.22)]";

export const MODAL_CLOSE_BTN_CLASS =
  "flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40";
