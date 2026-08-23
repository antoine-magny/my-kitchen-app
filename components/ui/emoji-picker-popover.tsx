"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_INGREDIENT_ICON, UNIQUE_EMOJI_INGREDIENTS } from "@/lib/ingredients";
import { IngredientIcon } from "@/components/ingredient-icon";

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
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calcule la position du popover par rapport au bouton déclencheur
  function openPopover() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const POPOVER_WIDTH = 282;
    const POPOVER_MAX_HEIGHT = 256;
    const GAP = 6;
    const BOTTOM_NAV_HEIGHT = 80; // Marge pour la barre de navigation

    let top = rect.bottom + GAP + window.scrollY;
    let left = rect.left + window.scrollX;
    let maxHeight = POPOVER_MAX_HEIGHT;

    // Empêcher débordement à droite
    if (left + POPOVER_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - POPOVER_WIDTH - 8;
    }

    // Calcul de l'espace avec sécurité pour la barre du bas
    const spaceBelow = window.innerHeight - rect.bottom - GAP - BOTTOM_NAV_HEIGHT;
    const spaceAbove = rect.top - GAP;

    // Ouvrir vers le haut si pas assez de place en bas ET plus de place en haut
    if (spaceBelow < POPOVER_MAX_HEIGHT && spaceAbove > spaceBelow) {
      maxHeight = Math.min(POPOVER_MAX_HEIGHT, spaceAbove - 8);
      top = rect.top - maxHeight - GAP + window.scrollY;
    } else {
      // Sinon on ouvre vers le bas, mais on restreint la hauteur si l'écran est petit
      maxHeight = Math.min(POPOVER_MAX_HEIGHT, Math.max(120, spaceBelow - 8));
    }

    setPopoverPos({ top, left, maxHeight });
    setIsOpen(true);
  }

  // Ferme au clic extérieur
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Ferme au scroll EXTÉRIEUR ou resize pour éviter un popover désynchronisé.
  // Le scroll INTERNE au popover (grille d'emojis) ne doit PAS fermer le popover.
  useEffect(() => {
    if (!isOpen) return;

    function handleScroll(event: Event) {
      // Si le scroll vient de l'intérieur du popover, on le laisse passer
      if (popoverRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    const handleResize = () => setIsOpen(false);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const sizeClasses =
    size === "lg"
      ? "h-14 w-14 text-2xl rounded-2xl border-2 bg-[#F6F8F3] hover:border-[#4A7C59]"
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
              top: popoverPos.top - window.scrollY,
              left: popoverPos.left - window.scrollX,
              zIndex: 9999,
              background: "#FFFFFF",
              boxShadow: "0 10px 36px rgba(20,31,22,0.22)",
              border: "1px solid #E2EBE3",
              gridTemplateColumns: "repeat(6, 1fr)",
              width: 282,
              maxHeight: popoverPos.maxHeight,
              overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "#C8E0CF transparent",
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
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-[#EBF2EC] active:scale-90 select-none cursor-pointer"
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
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-[#EBF2EC] active:scale-90 select-none cursor-pointer"
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
          <IngredientIcon iconHex={currentIcon || DEFAULT_INGREDIENT_ICON} size={32} />
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
