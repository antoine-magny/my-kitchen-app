"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EditIcon, MoreIcon, TrashIcon } from "@/components/icons";

export function RecipeActionsMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    const close = () => {
      setMenuOpen(false);
      setMenuPos(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [menuOpen]);

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      setMenuPos(null);
      return;
    }
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setMenuOpen(true);
  }

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1C2B1E] transition-transform active:scale-95"
        style={{
          background: menuOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Options de la recette"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <MoreIcon size={16} />
      </button>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[60] min-w-[200px] overflow-hidden rounded-2xl py-1.5"
            style={{
              top: menuPos.top,
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
                setMenuOpen(false);
                setMenuPos(null);
                onEdit();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
            >
              <span className="text-[#4A7C59]">
                <EditIcon size={15} />
              </span>
              Modifier la recette
            </button>
            <div className="mx-3 my-1 h-px bg-[#F0F4EF]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setMenuPos(null);
                onDelete();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
            >
              <TrashIcon size={15} />
              Supprimer la recette
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
