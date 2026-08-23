"use client";

import { useEffect, useState } from "react";
import { CheckIcon, TrashIcon } from "@/components/icons";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { UnitSelect } from "@/components/ui/unit-select";
import { coerceUnitCode } from "@/lib/units";
import type { ShoppingItem, ShoppingItemPatch } from "@/lib/shopping-list";

const inputNameClass =
  "w-full bg-transparent text-sm font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const inputAmountClass =
  "w-16 shrink-0 bg-transparent text-xs font-medium text-[#7A8F7D] outline-none rounded-lg px-1.5 py-0.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const unitSelectClass =
  "min-w-0 max-w-[7.5rem] truncate rounded-lg border border-transparent bg-transparent py-0.5 px-1.5 text-xs font-semibold text-[#7A8F7D] outline-none transition-colors hover:bg-[#F0F4EF] hover:text-[#1C2B1E] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] cursor-pointer text-left";

export function ShoppingItemRow({
  item,
  isLast,
  onToggle,
  onRemove,
  onUpdate,
}: {
  item: ShoppingItem;
  isLast: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: ShoppingItemPatch) => void;
}) {
  const [nameDraft, setNameDraft] = useState(item.customName);
  const [amountDraft, setAmountDraft] = useState(String(item.amount));

  useEffect(() => {
    setNameDraft(item.customName);
  }, [item.customName]);

  useEffect(() => {
    setAmountDraft(String(item.amount));
  }, [item.amount]);

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(item.customName);
      return;
    }
    if (trimmed !== item.customName) onUpdate(item.id, { customName: trimmed });
  }

  function commitAmount() {
    const raw = amountDraft.trim().replace(",", ".");
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) {
      setAmountDraft(String(item.amount));
      return;
    }
    if (amount !== item.amount) onUpdate(item.id, { amount });
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid #F0F4EF",
        opacity: item.isChecked ? 0.55 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95"
        style={{
          background: item.isChecked ? "#4A7C59" : "#F0F4EF",
          color: item.isChecked ? "#fff" : "transparent",
          border: item.isChecked ? "none" : "1.5px solid #C8E0CF",
        }}
        aria-label={item.isChecked ? `Décocher ${item.customName}` : `Cocher ${item.customName}`}
        aria-pressed={item.isChecked}
      >
        <CheckIcon size={14} />
      </button>

      <EmojiPickerPopover
        size="sm"
        currentIcon={item.icon}
        onSelectIcon={(newIcon) => {
          onUpdate(item.id, { icon: newIcon });
        }}
      />

      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setNameDraft(item.customName);
              e.currentTarget.blur();
            }
          }}
          className={`${inputNameClass} ${item.isChecked ? "line-through" : ""}`}
          aria-label={`Nom de ${item.customName}`}
        />
        <div className="mt-0.5 flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={amountDraft}
            onChange={(e) => setAmountDraft(e.target.value)}
            onBlur={commitAmount}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setAmountDraft(String(item.amount));
                e.currentTarget.blur();
              }
            }}
            placeholder="Qté"
            className={inputAmountClass}
            aria-label={`Quantité de ${item.customName}`}
          />
          <UnitSelect
            compact
            value={item.unit}
            ingredientName={item.customName}
            onChange={(unit) => {
              const next = coerceUnitCode(unit);
              if (next && next !== item.unit) onUpdate(item.id, { unit: next });
            }}
            className={unitSelectClass}
            aria-label={`Unité de ${item.customName}`}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] active:scale-95"
        aria-label={`Supprimer ${item.customName}`}
      >
        <TrashIcon size={14} />
      </button>
    </div>
  );
}
