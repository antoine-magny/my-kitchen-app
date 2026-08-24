"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarIcon, MoreIcon, MoveIcon, TrashIcon } from "@/components/icons";
import type { Ingredient, TabId } from "@/components/frigo/shared";

export function IngredientRowMenu({
  item,
  destinations,
  onEditDlc,
  onMove,
  onDelete,
}: {
  item: Ingredient;
  destinations: { id: TabId; icon: string; label: string }[];
  onEditDlc: (id: string) => void;
  onMove: (category: TabId) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setMenuOpen(false);
      setMenuPos(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMenuPos(null);
      }
    };
    const handleReposition = () => {
      setMenuOpen(false);
      setMenuPos(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPos(null);
      return;
    }
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_HEIGHT = 48 + destinations.length * 44 + 80;
    const GAP = 8;
    const BOTTOM_NAV_SAFE = 88;

    let clipBottom = window.innerHeight - BOTTOM_NAV_SAFE;
    let el: HTMLElement | null = buttonRef.current.parentElement;
    while (el && el !== document.body) {
      const { overflow, overflowY } = getComputedStyle(el);
      if (
        overflow === "hidden" ||
        overflow === "auto" ||
        overflow === "scroll" ||
        overflowY === "hidden" ||
        overflowY === "auto" ||
        overflowY === "scroll"
      ) {
        clipBottom = Math.min(clipBottom, el.getBoundingClientRect().bottom);
      }
      el = el.parentElement;
    }

    const openUp = clipBottom - rect.bottom < MENU_HEIGHT + GAP;
    setMenuPos({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + GAP }
        : { top: rect.bottom + GAP }),
    });
    setMenuOpen(true);
  };

  function close() {
    setMenuOpen(false);
    setMenuPos(null);
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#9CA3AF] transition-all hover:bg-[#F0F4EF] hover:text-[#1C2B1E]"
        style={{ background: menuOpen ? "#F0F4EF" : "transparent", color: menuOpen ? "#1C2B1E" : undefined }}
        aria-label="Options de l'ingrédient"
        aria-expanded={menuOpen}
      >
        <MoreIcon size={16} />
      </button>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="slide-down fixed z-[60] min-w-[200px] overflow-hidden rounded-xl py-1"
            style={{
              top: menuPos.top,
              bottom: menuPos.bottom,
              right: menuPos.right,
              background: "#FFFFFF",
              boxShadow: "0 10px 36px rgba(20,31,22,0.16)",
              border: "1px solid #E2EBE3",
            }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onEditDlc(item.id);
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
            >
              <span className="text-[#4A7C59]">
                <CalendarIcon size={13} />
              </span>
              {item.expirationDate
                ? "Modifier la date d'expiration"
                : "Ajouter une date d'expiration"}
            </button>

            <div className="mx-2.5 my-0.5 h-px bg-[#F0F4EF]" />

            <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase">
              Déplacer vers
            </p>
            {destinations.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onMove(tab.id);
                }}
                className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
              >
                <span className="flex w-3.5 items-center justify-center text-[#4A7C59]" aria-hidden>
                  <MoveIcon size={13} />
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}

            <div className="mx-2.5 my-0.5 h-px bg-[#F0F4EF]" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onDelete();
              }}
              className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
            >
              <span className="text-[#B91C1C]">
                <TrashIcon size={13} />
              </span>
              Supprimer
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
