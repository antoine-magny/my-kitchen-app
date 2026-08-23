"use client";

import { useState } from "react";
import {
  dlcLabel,
  STATUS_STYLE,
  TABS,
  type Ingredient,
  type TabId,
} from "@/components/frigo/shared";
import { IngredientRowMenu } from "@/components/frigo/ingredient-row-menu";
import { TrashIcon } from "@/components/icons";
import { dlcStatus } from "@/lib/fridge";
import type { UnitCode } from "@/lib/units";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { EditableItemFields } from "@/components/ui/editable-item-fields";

export function IngredientRow({
  item,
  isLast,
  onChangeAmount,
  onChangeUnit,
  onChangeIcon,
  onDelete,
  onEditDlc,
  onMove,
  onRename,
  isNew,
}: {
  item: Ingredient;
  isLast: boolean;
  onChangeAmount: (id: string, amount: number) => void;
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
  const destinations = TABS.filter((tab) => tab.id !== item.category);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => onDelete(item.id), 260);
  };

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid #F0F4EF",
        opacity: deleting ? 0 : 1,
        transform: deleting ? "translateX(20px)" : "none",
        transition: "opacity 0.26s ease, transform 0.26s ease",
        animation: isNew ? "slideDown 0.22s ease both" : "none",
      }}
    >
      <EmojiPickerPopover
        size="sm"
        className="shrink-0"
        currentIcon={item.icon}
        onSelectIcon={(newIcon) => {
          onChangeIcon?.(item.id, newIcon);
        }}
      />

      <EditableItemFields
        name={item.customName}
        amount={item.amount}
        unit={item.unit}
        onCommitName={(customName) => onRename(item.id, customName)}
        onCommitAmount={(amount) => onChangeAmount(item.id, amount)}
        onChangeUnit={(unit) => onChangeUnit(item.id, unit)}
      >
        <button
          type="button"
          onClick={() => onEditDlc(item.id)}
          className="mt-0.5 flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 -mx-1.5 text-left transition-colors hover:bg-[#F0F4EF]"
        >
          {item.expirationDate ? (
            <>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: style.dot }} />
              <span className="text-xs font-medium" style={{ color: style.color }}>
                {dlcLabel(item.expirationDate)}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-[#9CA3AF]">Pas de date d&apos;expiration</span>
          )}
        </button>
      </EditableItemFields>

      <IngredientRowMenu
        item={item}
        destinations={destinations}
        onEditDlc={onEditDlc}
        onMove={(category) => onMove(item.id, category)}
      />

      <button
        type="button"
        onClick={handleDelete}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] active:scale-95"
        aria-label={`Supprimer ${item.customName}`}
      >
        <TrashIcon size={14} />
      </button>
    </div>
  );
}
