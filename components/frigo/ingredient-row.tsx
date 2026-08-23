"use client";

import { useEffect, useState } from "react";
import {
  dlcLabel,
  STATUS_STYLE,
  TABS,
  type Ingredient,
  type TabId,
} from "@/components/frigo/shared";
import { IngredientRowMenu } from "@/components/frigo/ingredient-row-menu";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { dlcStatus } from "@/lib/fridge";
import { coerceUnitCode, type UnitCode } from "@/lib/units";
import { UnitSelect } from "@/components/ui/unit-select";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";

export function IngredientRow({
  item,
  onAdjust,
  onChangeUnit,
  onChangeIcon,
  onDelete,
  onEditDlc,
  onMove,
  onRename,
  isNew,
}: {
  item: Ingredient;
  onAdjust: (id: string, delta: number) => void;
  onChangeUnit: (id: string, unit: UnitCode) => void;
  onChangeIcon?: (id: string, icon: string) => void;
  onDelete: (id: string) => void;
  onEditDlc: (id: string) => void;
  onMove: (id: string, category: TabId) => void;
  onRename: (id: string, customName: string) => void;
  isNew: boolean;
}) {
  const status = dlcStatus(item.expirationDate);
  const style = STATUS_STYLE[status];
  const [deleting, setDeleting] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.customName);
  const destinations = TABS.filter((tab) => tab.id !== item.category);

  useEffect(() => {
    setNameDraft(item.customName);
  }, [item.customName]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(item.customName);
      return;
    }
    if (trimmed !== item.customName) onRename(item.id, trimmed);
  };

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-[#FAFBF9] sm:gap-4 sm:px-5"
      style={{
        opacity: deleting ? 0 : 1,
        transform: deleting ? "translateX(20px)" : "none",
        transition: "opacity 0.26s ease, transform 0.26s ease, background 0.15s",
        animation: isNew ? "slideDown 0.22s ease both" : "none",
      }}
    >
      <EmojiPickerPopover
        size="sm"
        currentIcon={item.icon}
        onSelectIcon={(newIcon) => {
          onChangeIcon?.(item.id, newIcon);
        }}
      />

      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setNameDraft(item.customName);
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent text-sm font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]"
          aria-label={`Nom de ${item.customName}`}
        />
        {item.expirationDate ? (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: style.dot }} />
            <span className="text-xs font-medium" style={{ color: style.color }}>
              {dlcLabel(item.expirationDate)}
            </span>
          </div>
        ) : (
          <p className="mt-0.5 text-xs font-medium text-[#9CA3AF]">Pas de date d&apos;expiration</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0 overflow-hidden rounded-xl" style={{ border: "1.5px solid #E2EBE3" }}>
        <button
          type="button"
          onClick={() => onAdjust(item.id, -1)}
          disabled={item.amount <= 0}
          className="flex h-8 w-8 items-center justify-center text-[#4A7C59] transition-all hover:bg-[#EBF2EC] disabled:opacity-30"
          aria-label="Diminuer"
        >
          <MinusIcon size={14} />
        </button>
        <span
          className="w-12 border-x text-center text-sm font-extrabold text-[#1C2B1E]"
          style={{ borderColor: "#E2EBE3", lineHeight: "2rem" }}
        >
          {item.amount}
        </span>
        <button
          type="button"
          onClick={() => onAdjust(item.id, 1)}
          className="flex h-8 w-8 items-center justify-center text-[#4A7C59] transition-all hover:bg-[#EBF2EC]"
          aria-label="Augmenter"
        >
          <PlusIcon size={13} />
        </button>
      </div>

      <UnitSelect
        compact
        value={item.unit}
        ingredientName={item.customName}
        onChange={(unit) => {
          const next = coerceUnitCode(unit);
          if (next && next !== item.unit) onChangeUnit(item.id, next);
        }}
        className="hidden max-w-[6.5rem] shrink-0 truncate rounded-lg border border-transparent bg-transparent py-1 px-1.5 text-right text-xs font-semibold text-[#7A8F7D] outline-none hover:bg-[#F0F4EF] hover:text-[#1C2B1E] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] sm:block cursor-pointer transition-all"
        aria-label={`Unité de ${item.customName}`}
      />

      <IngredientRowMenu
        item={item}
        destinations={destinations}
        onEditDlc={onEditDlc}
        onMove={(category) => onMove(item.id, category)}
        onDelete={() => {
          setDeleting(true);
          setTimeout(() => onDelete(item.id), 260);
        }}
      />
    </div>
  );
}
