"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  dlcLabel,
  STATUS_STYLE,
  TABS,
  type Ingredient,
  type TabId,
} from "@/components/frigo/shared";
import {
  CalendarIcon,
  MinusIcon,
  MoreIcon,
  MoveIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { dlcStatus } from "@/lib/fridge";
import { unitLabel } from "@/lib/units";

export function IngredientRow({
  item,
  onAdjust,
  onDelete,
  onEditDlc,
  onMove,
  onRename,
  isNew,
}: {
  item: Ingredient;
  onAdjust: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onEditDlc: (id: string) => void;
  onMove: (id: string, category: TabId) => void;
  onRename: (id: string, customName: string) => void;
  isNew: boolean;
}) {
  const status = dlcStatus(item.expirationDate);
  const style = STATUS_STYLE[status];
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [nameDraft, setNameDraft] = useState(item.customName);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const destinations = TABS.filter((tab) => tab.id !== item.category);

  useEffect(() => {
    setNameDraft(item.customName);
  }, [item.customName]);

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
    const MENU_HEIGHT = 56 + destinations.length * 44 + 56;
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

  const handleDelete = () => {
    setMenuOpen(false);
    setMenuPos(null);
    setDeleting(true);
    setTimeout(() => onDelete(item.id), 260);
  };

  const handleMove = (category: TabId) => {
    setMenuOpen(false);
    setMenuPos(null);
    onMove(item.id, category);
  };

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
      <span className="w-8 shrink-0 text-center text-xl select-none">{item.emoji}</span>

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

      <span className="hidden w-12 shrink-0 text-right text-xs font-semibold text-[#9CA3AF] sm:block">{unitLabel(item.unit)}</span>

      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#9CA3AF] transition-all hover:bg-[#F0F4EF] hover:text-[#1C2B1E]"
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
              className="slide-down fixed z-[60] min-w-[240px] overflow-hidden rounded-2xl py-1.5"
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
                  setMenuOpen(false);
                  setMenuPos(null);
                  onEditDlc(item.id);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
              >
                <span className="text-[#4A7C59]">
                  <CalendarIcon size={14} />
                </span>
                {item.expirationDate
                  ? "Modifier la date d'expiration"
                  : "Ajouter une date d'expiration"}
              </button>

              <div className="mx-3 my-1 h-px bg-[#F0F4EF]" />

              <p className="px-4 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase">
                Déplacer vers
              </p>
              {destinations.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleMove(tab.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#1C2B1E] transition-colors hover:bg-[#F6F8F3]"
                >
                  <span className="flex w-3.5 items-center justify-center text-[#4A7C59]" aria-hidden>
                    <MoveIcon size={14} />
                  </span>
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{tab.emoji}</span>
                    {tab.label}
                  </span>
                </button>
              ))}

              <div className="mx-3 my-1 h-px bg-[#F0F4EF]" />
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
              >
                <TrashIcon size={15} />
                Supprimer
              </button>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
