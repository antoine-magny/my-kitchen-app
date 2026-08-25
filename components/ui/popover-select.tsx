"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@/components/icons";
import { SelectOptionRow } from "@/components/ui/select-option-row";
import { usePopoverDismiss } from "@/components/ui/use-popover-dismiss";
import {
  clampPopoverLeft,
  POPOVER_BOTTOM_NAV,
  POPOVER_GAP,
  popoverMaxHeight,
  popoverOpensAbove,
} from "@/lib/popover-position";

export type PopoverSelectOption<T extends string> = {
  value: T;
  label: string;
  icon: ReactNode;
};

export function PopoverSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  className,
  style,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly PopoverSelectOption<T>[];
  ariaLabel: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  function openPopover() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const preferredHeight = 200;
    const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 16);
    const left = clampPopoverLeft(rect.left, width, window.innerWidth);
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP - POPOVER_BOTTOM_NAV;
    const spaceAbove = rect.top - POPOVER_GAP;
    const openAbove = popoverOpensAbove(spaceBelow, spaceAbove, preferredHeight);
    const maxHeight = openAbove
      ? popoverMaxHeight(spaceAbove, preferredHeight)
      : popoverMaxHeight(spaceBelow, preferredHeight);

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

  const handleSelect = (next: T) => {
    onChange(next);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="relative w-full" style={{ isolation: "isolate" }}>
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) setIsOpen(false);
          else openPopover();
        }}
        className={className}
        style={style}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        <span className="flex min-w-11 shrink-0 items-center justify-start text-[#4A7C59]">
            {selected?.icon}
          </span>
          <span className="truncate">{selected?.label}</span>
        </span>
        <span
          className={`pointer-events-none ml-2 shrink-0 text-[#7A8F7D] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#4A7C59]" : ""
          }`}
        >
          <ChevronDownIcon size={14} />
        </span>
      </button>

      {isOpen && popoverPos
        ? createPortal(
            <div
              ref={popoverRef}
              role="listbox"
              id={listboxId}
              aria-label={ariaLabel}
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
                {options.map((opt) => (
                  <SelectOptionRow
                    key={opt.value}
                    icon={
                      <span className="inline-flex min-w-11 items-center">{opt.icon}</span>
                    }
                    label={opt.label}
                    isSelected={value === opt.value}
                    onSelect={() => handleSelect(opt.value)}
                  />
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
