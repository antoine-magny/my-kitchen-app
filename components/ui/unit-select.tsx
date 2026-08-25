"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@/components/icons";
import { UnitOptionRow } from "@/components/ui/unit-option-row";
import { usePopoverDismiss } from "@/components/ui/use-popover-dismiss";
import {
  ALL_COUNT_CODES,
  MASS_CODES,
  UNIT_DISPLAY_CONFIG,
  VOLUME_CODES,
} from "@/components/ui/unit-select-config";
import { getIngredientCountUnit } from "@/lib/ingredients";
import {
  clampPopoverLeft,
  POPOVER_BOTTOM_NAV,
  POPOVER_GAP,
  popoverMaxHeight,
  popoverOpensAbove,
} from "@/lib/popover-position";
import { UNIT_LIST, unitLabel, type UnitCode } from "@/lib/units";

export interface UnitSelectProps {
  value: string;
  onChange: (unit: string) => void;
  className?: string;
  id?: string;
  /** Nom de l'ingrédient pour adapter dynamiquement les unités de décompte. */
  ingredientName?: string;
  /** Unité de décompte forcée si connue. */
  countUnit?: UnitCode;
  /** Libellés courts (idéal pour les lignes courses / frigo). */
  compact?: boolean;
  "aria-label"?: string;
  /** Affiche les unités culinaires spécifiques aux recettes (c.a.c, c.a.s, verre). */
  allowCulinary?: boolean;
}

export function UnitSelect({
  value,
  onChange,
  className,
  id,
  ingredientName,
  countUnit,
  compact = false,
  allowCulinary = false,
  ...rest
}: UnitSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const mass = UNIT_LIST.filter((u) => MASS_CODES.has(u.code));
  const volume = UNIT_LIST.filter((u) => {
    if (!VOLUME_CODES.has(u.code)) return false;
    if (!allowCulinary && (u.code === "c_cafe" || u.code === "c_soupe" || u.code === "verre")) return false;
    return true;
  });

  let countCodes: string[] = ALL_COUNT_CODES;
  const targetCountUnit = countUnit ?? (ingredientName ? getIngredientCountUnit(ingredientName) : undefined);

  if (targetCountUnit) {
    const list: string[] = [targetCountUnit];
    if (targetCountUnit !== "piece") {
      list.push("piece");
    }
    if (value && !MASS_CODES.has(value) && !VOLUME_CODES.has(value) && value !== "qs" && !list.includes(value)) {
      list.push(value);
    }
    countCodes = list;
  }

  const count = UNIT_LIST.filter((u) => countCodes.includes(u.code));

  function openPopover() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPOVER_MAX_HEIGHT = 288;

    const width = Math.min(210, window.innerWidth - 16);
    const left = clampPopoverLeft(rect.left, width, window.innerWidth);

    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP - POPOVER_BOTTOM_NAV;
    const spaceAbove = rect.top - POPOVER_GAP;
    const openAbove = popoverOpensAbove(spaceBelow, spaceAbove, POPOVER_MAX_HEIGHT);
    const maxHeight = openAbove
      ? popoverMaxHeight(spaceAbove, POPOVER_MAX_HEIGHT)
      : popoverMaxHeight(spaceBelow, POPOVER_MAX_HEIGHT);

    setPopoverPos({
      left,
      width,
      maxHeight,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + POPOVER_GAP }
        : { top: rect.bottom + POPOVER_GAP }),
    });
    setIsOpen(true);
  }

  usePopoverDismiss({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef,
    popoverRef,
    restoreFocus: true,
  });

  const currentDisplay = UNIT_DISPLAY_CONFIG[value] ?? {
    label: unitLabel(value as UnitCode),
    shortLabel: unitLabel(value as UnitCode),
  };

  const selectedDisplayLabel = compact ? currentDisplay.shortLabel : currentDisplay.label;

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${compact ? "min-w-0" : "w-full"}`}
      style={{ isolation: "isolate" }}
    >
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "unit-select-listbox" : undefined}
        aria-label={rest["aria-label"] ?? "Choisir l'unité"}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) setIsOpen(false);
          else openPopover();
        }}
        className={
          className ||
          (compact
            ? "inline-flex items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] hover:text-[#1C2B1E] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] focus:outline-none"
            : "flex w-full items-center justify-between rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-base font-semibold text-[#1C2B1E] shadow-sm transition-all hover:border-[#4A7C59] focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 focus:outline-none")
        }
      >
        <span className={compact ? "whitespace-normal break-words text-left" : "truncate text-left"}>
          {selectedDisplayLabel}
        </span>
        {!compact && (
          <span
            className={`pointer-events-none ml-2 shrink-0 text-[#7A8F7D] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#4A7C59]" : ""
            }`}
          >
            <ChevronDownIcon size={14} />
          </span>
        )}
      </button>

      {isOpen && popoverPos && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          id="unit-select-listbox"
          aria-label="Unités de mesure"
          className="slide-down overflow-y-auto rounded-2xl border border-[#E2EBE3] bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all"
          style={{
            position: "fixed",
            top: popoverPos.top,
            bottom: popoverPos.bottom,
            left: popoverPos.left,
            width: popoverPos.width,
            maxHeight: popoverPos.maxHeight,
            zIndex: 9999,
            boxShadow: "0 12px 32px rgba(20, 31, 22, 0.16)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-0.5">
            {mass.map((u) => (
              <UnitOptionRow
                key={u.code}
                emoji="⚖️"
                info={UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code }}
                isSelected={value === u.code}
                onSelect={() => handleSelect(u.code)}
              />
            ))}
          </div>

          <div className="my-1 border-t border-[#F0F4EF]" />

          <div className="space-y-0.5">
            {volume.map((u) => (
              <UnitOptionRow
                key={u.code}
                emoji="💧"
                info={UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code }}
                isSelected={value === u.code}
                onSelect={() => handleSelect(u.code)}
              />
            ))}
          </div>

          <div className="my-1 border-t border-[#F0F4EF]" />

          <div className="space-y-0.5">
            {count.map((u) => (
              <UnitOptionRow
                key={u.code}
                emoji="🔢"
                info={UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code }}
                isSelected={value === u.code}
                onSelect={() => handleSelect(u.code)}
              />
            ))}
            <UnitOptionRow
              emoji="🪄"
              info={UNIT_DISPLAY_CONFIG.qs}
              isSelected={value === "qs"}
              onSelect={() => handleSelect("qs")}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
