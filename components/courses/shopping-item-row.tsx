"use client";

import { CheckIcon, TrashIcon } from "@/components/icons";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { EditableItemFields } from "@/components/ui/editable-item-fields";
import type { ShoppingItem, ShoppingItemPatch } from "@/lib/shopping-list";

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

      <EditableItemFields
        name={item.customName}
        amount={item.amount}
        unit={item.unit}
        nameClassName={item.isChecked ? "line-through" : undefined}
        onCommitName={(customName) => onUpdate(item.id, { customName })}
        onCommitAmount={(amount) => onUpdate(item.id, { amount })}
        onChangeUnit={(unit) => onUpdate(item.id, { unit })}
      />

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
