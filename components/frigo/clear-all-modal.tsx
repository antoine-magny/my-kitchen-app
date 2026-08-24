"use client";

import { XIcon } from "@/components/icons";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_ABOVE_NAV_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";

export function ClearAllModal({
  title = "Tout effacer",
  description,
  itemCount,
  confirmLabel = "Tout supprimer",
  onConfirm,
  onClose,
}: {
  title?: string;
  description: string;
  itemCount: number;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useLockBodyScroll();

  return (
    <div
      className={MODAL_OVERLAY_ABOVE_NAV_CLASS}
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${MODAL_PANEL_CLASS} p-7`}
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-[#DC2626] uppercase">
              Attention
            </p>
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">{title}</h2>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_BTN_CLASS}
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <p className="mb-6 text-sm font-medium text-[#1C2B1E]">
          {itemCount > 1
            ? `${itemCount} ingrédients seront définitivement retirés.`
            : "1 ingrédient sera définitivement retiré."}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] active:scale-[0.98]"
            style={{ border: "1.5px solid #E2EBE3" }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #DC2626, #EF4444)",
              boxShadow: "0 4px 16px rgba(220,38,38,0.28)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
