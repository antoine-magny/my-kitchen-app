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
import { CalendarIcon } from "@/components/icons";
import { dlcStatus, sortPlannedMeals, weekdayLongFrFromIso } from "@/lib/fridge";
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
              {item.dlcEstimated ? (
                <span
                  className="text-[10px] font-medium text-[#9CA3AF]"
                  title="Date déduite du repas prévu en courses"
                >
                  estimée
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-xs font-medium text-[#9CA3AF]">Pas de date d&apos;expiration</span>
          )}
        </button>
        {item.plannedMeals && item.plannedMeals.length > 0 ? (
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {sortPlannedMeals(item.plannedMeals).map((meal) => (
              <li
                key={`${meal.date}|${meal.mealType}|${meal.recipeId ?? ""}|${meal.recipeTitle}`}
                className="inline-flex max-w-full items-start gap-1 rounded-2xl border border-[#D6D4E4] bg-[#F0F3F4] px-2 py-1 text-[11px] leading-tight font-medium text-[#4A5568] sm:items-center sm:rounded-full sm:py-0.5"
              >
                <CalendarIcon size={10} className="mt-0.5 shrink-0 text-[#6B5B7A] sm:mt-0" />
                <span className="min-w-0">
                  <span className="block truncate sm:inline">
                    Prévu pour : {meal.recipeTitle}
                  </span>
                  <span className="mt-0.5 block capitalize text-[#6B5B7A] sm:mt-0 sm:inline sm:text-inherit sm:normal-case">
                    <span className="hidden sm:inline"> (</span>
                    {weekdayLongFrFromIso(meal.date)}
                    <span className="hidden sm:inline">)</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </EditableItemFields>

      <IngredientRowMenu
        item={item}
        destinations={destinations}
        onEditDlc={onEditDlc}
        onMove={(category) => onMove(item.id, category)}
        onDelete={handleDelete}
      />
    </div>
  );
}
