"use client";

import { expiredSinceLabel, type Ingredient } from "@/components/frigo/shared";
import { XIcon } from "@/components/icons";
import { IngredientIcon } from "@/components/ingredient-icon";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_ABOVE_NAV_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { daysUntilDlc } from "@/lib/fridge";
import { unitLabel } from "@/lib/units";

export function ExpiredModal({
  items,
  tabLabel,
  onClose,
  onEditDlc,
}: {
  items: Ingredient[];
  tabLabel: string;
  onClose: () => void;
  onEditDlc: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => {
    const da = a.expirationDate ? daysUntilDlc(a.expirationDate) : 0;
    const db = b.expirationDate ? daysUntilDlc(b.expirationDate) : 0;
    return da - db;
  });

  return (
    <div
      className={MODAL_OVERLAY_ABOVE_NAV_CLASS}
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${MODAL_PANEL_CLASS} overflow-y-auto p-7`}
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-[#DC2626] uppercase">Attention</p>
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">
              {sorted.length} expiré{sorted.length > 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">
              Dans le {tabLabel.toLowerCase()}
            </p>
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

        <div
          className="overflow-hidden rounded-2xl border border-[#FECACA] bg-[#FEF2F2]"
        >
          {sorted.map((item, idx) => (
            <div key={item.id}>
              {idx > 0 && <div className="mx-4 h-px bg-[#FECACA]/40" />}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDlc(item.id);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FEE2E2]"
              >
                <div className="flex h-8 w-8 items-center justify-center text-2xl select-none" aria-hidden>
                  {item.icon ? <IngredientIcon iconHex={item.icon} size={28} hideIfEmpty /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1C2B1E]">{item.customName}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#DC2626]">
                    {item.expirationDate ? expiredSinceLabel(item.expirationDate) : "Date inconnue"}
                  </p>
                  {item.expirationDate && (
                    <p className="mt-0.5 text-xs font-medium text-[#9CA3AF]">
                      DLC&nbsp;:{" "}
                      {new Date(item.expirationDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#7A8F7D]">
                  {item.amount} {unitLabel(item.unit)}
                </span>
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs font-medium text-[#9CA3AF]">
          Appuyez sur un ingrédient pour modifier sa date
        </p>
      </div>
    </div>
  );
}
