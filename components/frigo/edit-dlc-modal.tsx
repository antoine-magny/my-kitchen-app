"use client";

import { useState } from "react";
import type { Ingredient } from "@/components/frigo/shared";
import { XIcon } from "@/components/icons";
import { IngredientIcon } from "@/components/ingredient-icon";
import { DlcDatePicker } from "@/components/frigo/dlc-date-picker";
import { CenteredModal } from "@/components/ui/centered-modal";

export function EditDlcModal({
  item,
  onSave,
  onClose,
}: {
  item: Ingredient;
  onSave: (dlc: string | null) => void;
  onClose: () => void;
}) {
  const [dlc, setDlc] = useState(item.expirationDate ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dlc || null);
    onClose();
  };

  return (
    <CenteredModal titleId="edit-dlc-title" onClose={onClose} maxWidthClass="max-w-[340px]">
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center select-none">
            {item.icon ? <IngredientIcon iconHex={item.icon} size={24} hideIfEmpty /> : null}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7A8F7D] uppercase">Date d&apos;expiration</p>
            <h2 id="edit-dlc-title" className="font-lora truncate text-base font-bold text-[#1C2B1E]">
              {item.customName}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
        >
          <XIcon size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="px-4">
          <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
            DATE LIMITE DE CONSOMMATION
          </label>
          <DlcDatePicker value={dlc} onChange={setDlc} />
        </div>

        <div className="flex gap-2.5 px-4 pt-2 pb-3">
          {item.expirationDate && (
            <button
              type="button"
              onClick={() => {
                onSave(null);
                onClose();
              }}
              className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] active:scale-[0.98]"
              style={{ border: "1.5px solid #E2EBE3" }}
            >
              Retirer la date
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
            }}
          >
            Enregistrer
          </button>
        </div>
      </form>
    </CenteredModal>
  );
}
