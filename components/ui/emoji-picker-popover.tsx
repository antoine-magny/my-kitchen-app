"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_INGREDIENT_ICON, UNIQUE_EMOJI_INGREDIENTS } from "@/lib/ingredients";
import {
  clampPopoverLeft,
  POPOVER_BOTTOM_NAV,
  POPOVER_GAP,
  popoverMaxHeight,
  popoverOpensAbove,
} from "@/lib/popover-position";
import { IngredientIcon } from "@/components/ingredient-icon";
import { usePopoverDismiss } from "@/components/ui/use-popover-dismiss";

interface EmojiPickerPopoverProps {
  currentIcon?: string;
  onSelectIcon: (icon: string, defaultUnit?: string, defaultName?: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  buttonTitle?: string;
}

export function EmojiPickerPopover({
  currentIcon = DEFAULT_INGREDIENT_ICON,
  onSelectIcon,
  size = "md",
  className = "",
  buttonTitle = "Changer l'icône de l'ingrédient",
}: EmojiPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    maxHeight: number;
    width: number;
    sheet: boolean;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calcule la position du popover par rapport au bouton déclencheur
  function openPopover() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const POPOVER_MAX_HEIGHT = 256;
    const width = Math.min(282, window.innerWidth - 16);
    const sheet = window.innerWidth < 400;

    if (sheet) {
      setPopoverPos({
        top: 0,
        left: 8,
        maxHeight: Math.min(POPOVER_MAX_HEIGHT, Math.round(window.innerHeight * 0.5)),
        width,
        sheet: true,
      });
      setIsOpen(true);
      return;
    }

    const left = clampPopoverLeft(rect.left + window.scrollX, width, window.innerWidth);
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP - POPOVER_BOTTOM_NAV;
    const spaceAbove = rect.top - POPOVER_GAP;

    let top = rect.bottom + POPOVER_GAP + window.scrollY;
    let maxHeight = POPOVER_MAX_HEIGHT;

    if (popoverOpensAbove(spaceBelow, spaceAbove, POPOVER_MAX_HEIGHT)) {
      maxHeight = Math.min(POPOVER_MAX_HEIGHT, spaceAbove - 8);
      top = rect.top - maxHeight - POPOVER_GAP + window.scrollY;
    } else {
      maxHeight = popoverMaxHeight(spaceBelow, POPOVER_MAX_HEIGHT);
    }

    setPopoverPos({ top, left, maxHeight, width, sheet: false });
    setIsOpen(true);
  }

  usePopoverDismiss({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef: buttonRef,
    popoverRef,
    closeOnEscape: false,
  });

  const sizeClasses =
    size === "lg"
      ? "h-12 w-12 text-xl rounded-2xl border-2 bg-[#F6F8F3] hover:border-[#4A7C59]"
      : size === "sm"
      ? "h-7 w-7 text-lg rounded-lg hover:bg-[#EBF2EC]"
      : "h-9 w-9 text-xl rounded-xl hover:bg-[#EBF2EC]";

  const isDefaultOrEmpty =
    !currentIcon ||
    currentIcon === DEFAULT_INGREDIENT_ICON ||
    currentIcon === "2205" ||
    currentIcon === "∅" ||
    currentIcon === "Ø" ||
    currentIcon === "ø";

  const popover =
    isOpen && popoverPos
      ? createPortal(
          <div
            ref={popoverRef}
            className="slide-down grid max-h-64 gap-1.5 overflow-y-auto rounded-2xl p-2.5"
            style={{
              position: "fixed",
              ...(popoverPos.sheet
                ? {
                    top: "auto",
                    bottom: 8,
                    left: 8,
                    right: 8,
                    width: popoverPos.width,
                  }
                : {
                    top: popoverPos.top - window.scrollY,
                    left: popoverPos.left - window.scrollX,
                    width: popoverPos.width,
                  }),
              zIndex: 9999,
              background: "#FFFFFF",
              boxShadow: "0 10px 36px rgba(20,31,22,0.22)",
              border: "1px solid #E2EBE3",
              gridTemplateColumns: "repeat(auto-fill, minmax(2.75rem, 1fr))",
              maxHeight: popoverPos.maxHeight,
              overflowX: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              title="Sans icône (ensemble vide)"
              onClick={() => {
                onSelectIcon(DEFAULT_INGREDIENT_ICON);
                setIsOpen(false);
              }}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-all hover:bg-[#EBF2EC] active:scale-90 select-none cursor-pointer"
              style={{
                background: isDefaultOrEmpty ? "#EBF2EC" : "transparent",
              }}
            >
              <IngredientIcon iconHex={DEFAULT_INGREDIENT_ICON} size={24} />
            </button>
            {UNIQUE_EMOJI_INGREDIENTS.map((item) => {
              const visual = item.emoji || item.icon;
              return (
              <button
                key={item.id}
                type="button"
                title={item.name}
                onClick={() => {
                  onSelectIcon(visual, item.defaultUnit, item.name);
                  setIsOpen(false);
                }}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-all hover:bg-[#EBF2EC] active:scale-90 select-none cursor-pointer"
                style={{ background: currentIcon === visual ? "#EBF2EC" : "transparent" }}
              >
                <IngredientIcon iconHex={visual} size={24} />
              </button>
            )})}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            openPopover();
          }
        }}
        title={buttonTitle}
        className={`flex items-center justify-center transition-all select-none cursor-pointer ${sizeClasses}`}
        style={{ borderColor: size === "lg" ? "#E2EBE3" : "transparent" }}
      >
        {size === "lg" ? (
          <IngredientIcon iconHex={currentIcon || DEFAULT_INGREDIENT_ICON} size={26} />
        ) : isDefaultOrEmpty ? (
          <span className="h-full w-full rounded-lg transition-colors group-hover:bg-[#F0F4EF]" />
        ) : (
          <IngredientIcon iconHex={currentIcon} size={size === "sm" ? 18 : 24} />
        )}
      </button>

      {popover}
    </div>
  );
}
