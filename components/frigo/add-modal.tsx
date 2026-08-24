"use client";

import { useEffect, useRef, useState } from "react";
import type { NewFridgeItem, TabId } from "@/components/frigo/shared";
import { XIcon } from "@/components/icons";
import { getIngredientDefaultUnit, DEFAULT_INGREDIENT_ICON, resolveIcon } from "@/lib/ingredients";
import { DlcDatePicker } from "@/components/frigo/dlc-date-picker";
import { CenteredModal } from "@/components/ui/centered-modal";
import { UnitSelect } from "@/components/ui/unit-select";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { DEFAULT_UNIT, type UnitCode } from "@/lib/units";

export function AddModal({
  activeTab,
  onAdd,
  onClose,
}: {
  activeTab: TabId;
  onAdd: (item: NewFridgeItem) => void;
  onClose: () => void;
}) {
  const [icon, setIcon] = useState(DEFAULT_INGREDIENT_ICON);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<UnitCode>(DEFAULT_UNIT);
  const [dlc, setDlc] = useState("");
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) nameRef.current?.focus();
  }, [mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      icon,
      customName: name.trim(),
      amount: Number(qty) || 1,
      unit,
      expirationDate: dlc || null,
      category: activeTab,
    });
    onClose();
  };

  if (!mounted) return null;

  return (
    <CenteredModal titleId="add-ingredient-title" onClose={onClose} maxWidthClass="max-w-[340px]">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <h2 id="add-ingredient-title" className="font-lora text-base font-bold text-[#1C2B1E]">
            Nouvel ingrédient
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-1.5 px-4">
            <div className="flex items-center gap-2.5">
              <EmojiPickerPopover
                size="lg"
                currentIcon={icon}
                onSelectIcon={(selectedIcon, defaultUnit, itemName) => {
                  setIcon(selectedIcon);
                  if (itemName && !name.trim()) {
                    setName(itemName);
                  }
                  if (defaultUnit) {
                    setUnit(defaultUnit as UnitCode);
                  }
                }}
              />
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                  NOM DE L&apos;INGRÉDIENT
                </label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const prevDefault = getIngredientDefaultUnit(name);
                    if (unit === prevDefault || unit === "piece") {
                      setUnit(getIngredientDefaultUnit(newName));
                    }
                    const resolvedIcon = resolveIcon(newName);
                    setIcon(resolvedIcon ?? DEFAULT_INGREDIENT_ICON);
                    setName(newName);
                  }}
                  placeholder="Ex : Tomates cerises"
                  required
                  className="w-full rounded-lg bg-[#FAFBF9] px-3 py-2 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                  style={{ border: "1.5px solid #E2EBE3" }}
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                  QUANTITÉ
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full rounded-lg bg-[#FAFBF9] px-3 py-1.5 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                  style={{ border: "1.5px solid #E2EBE3" }}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                  UNITÉ
                </label>
                <UnitSelect
                  value={unit}
                  ingredientName={name}
                  onChange={(next) => setUnit(next as UnitCode)}
                  className="w-full flex items-center justify-between rounded-lg border-[1.5px] border-[#E2EBE3] bg-[#FAFBF9] py-1.5 px-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all hover:border-[#4A7C59] focus:border-[#4A7C59]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                DATE LIMITE DE CONSOMMATION <span className="font-medium normal-case opacity-60">(optionnelle)</span>
              </label>
              <DlcDatePicker value={dlc} onChange={setDlc} />
            </div>
          </div>

          <div className="px-4 pt-2 pb-3">
            <button
              type="submit"
              className="w-full rounded-2xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
              }}
            >
              Ajouter l&apos;ingrédient
            </button>
          </div>
        </form>
    </CenteredModal>
  );
}
