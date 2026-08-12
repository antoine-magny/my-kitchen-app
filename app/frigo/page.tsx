"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  dlcStatus,
  daysUntilDlc,
  FRIDGE_TABS,
  getFridgeItems,
  nextFridgeItemId,
  setFridgeItems,
  type FridgeItem,
  type FridgeStorageLocation,
} from "@/lib/fridge";
import { INGREDIENTS } from "@/lib/ingredients";
import { DEFAULT_UNIT, UNITS, unitLabel, type UnitCode } from "@/lib/units";

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l-3 3 3 3" />
      <path d="M9 5l3-3 3 3" />
      <path d="M15 19l3 3 3-3" />
      <path d="M19 9l3 3-3 3" />
      <path d="M2 12h20" />
      <path d="M12 2v20" />
    </svg>
  );
}

type TabId = FridgeStorageLocation;
type Ingredient = FridgeItem;

const TABS = FRIDGE_TABS;

function dlcLabel(dlc: string | null): string {
  if (!dlc) return "";
  const diff = daysUntilDlc(dlc);
  if (diff < 0) {
    const days = Math.abs(diff);
    return `Périmé depuis ${days} jour${days > 1 ? "s" : ""}`;
  }
  if (diff === 0) return "Expire aujourd'hui";
  if (diff === 1) return "Expire demain";
  return `DLC ${new Date(dlc).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function expiredSinceLabel(dlc: string): string {
  const diff = daysUntilDlc(dlc);
  if (diff < 0) {
    const days = Math.abs(diff);
    return `Périmé depuis ${days} jour${days > 1 ? "s" : ""}`;
  }
  if (diff === 0) return "Expire aujourd'hui";
  return dlcLabel(dlc);
}

const STATUS_STYLE = {
  urgent: { color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  soon: { color: "#C2410C", bg: "#FFF7ED", dot: "#F97316" },
  ok: { color: "#6B7280", bg: "transparent", dot: "#9CA3AF" },
  none: { color: "#9CA3AF", bg: "transparent", dot: "#D1D5DB" },
};

function AddModal({
  activeTab,
  onAdd,
  onClose,
}: {
  activeTab: TabId;
  onAdd: (item: Omit<Ingredient, "id">) => void;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState("🥚");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<UnitCode>(DEFAULT_UNIT);
  const [dlc, setDlc] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      emoji,
      name: name.trim(),
      quantity: Number(qty) || 1,
      unit,
      dlc: dlc || null,
      category: activeTab,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in w-full rounded-t-3xl p-7 sm:w-auto sm:min-w-[440px] sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">Nouvel ingrédient</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPicker((p) => !p)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 bg-[#F6F8F3] text-2xl transition-all hover:border-[#4A7C59]"
                style={{ borderColor: "#E2EBE3" }}
              >
                {emoji}
              </button>
              {showPicker && (
                <div
                  className="slide-down absolute top-16 left-0 z-10 grid max-h-64 gap-1 overflow-y-auto rounded-2xl p-3"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 8px 32px rgba(20,31,22,0.14)",
                    border: "1px solid #E2EBE3",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    width: 216,
                  }}
                >
                  {INGREDIENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.name}
                      onClick={() => {
                        setEmoji(item.emoji);
                        setName((current) => (current.trim() ? current : item.name));
                        setShowPicker(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:bg-[#EBF2EC]"
                      style={{ background: emoji === item.emoji ? "#EBF2EC" : "transparent" }}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                NOM DE L&apos;INGRÉDIENT
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Tomates cerises"
                required
                className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                style={{ border: "1.5px solid #E2EBE3" }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                QUANTITÉ
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                style={{ border: "1.5px solid #E2EBE3" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                UNITÉ
              </label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitCode)}
                  className="w-full appearance-none rounded-xl bg-[#FAFBF9] py-3 pr-10 pl-4 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                  style={{ border: "1.5px solid #E2EBE3" }}
                >
                  {UNITS.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
              DATE LIMITE DE CONSOMMATION <span className="font-medium normal-case opacity-60">(optionnelle)</span>
            </label>
            <input
              type="date"
              value={dlc}
              onChange={(e) => setDlc(e.target.value)}
              className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
              style={{ border: "1.5px solid #E2EBE3" }}
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
            }}
          >
            Ajouter l&apos;ingrédient
          </button>
        </form>
      </div>
    </div>
  );
}

function ExpiredModal({
  items,
  tabLabel,
  onClose,
  onEditDlc,
}: {
  items: Ingredient[];
  tabLabel: string;
  onClose: () => void;
  onEditDlc: (id: number) => void;
}) {
  const sorted = [...items].sort((a, b) => {
    const da = a.dlc ? daysUntilDlc(a.dlc) : 0;
    const db = b.dlc ? daysUntilDlc(b.dlc) : 0;
    return da - db;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in w-full max-h-[85vh] overflow-y-auto rounded-t-3xl p-7 sm:w-auto sm:min-w-[420px] sm:max-w-md sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-[#DC2626] uppercase">Attention</p>
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">
              {sorted.length} expiré{sorted.length > 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm font-medium text-[#7A8F7D]">
              Dans {tabLabel.toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
            aria-label="Fermer"
          >
            <XIcon />
          </button>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-[#FECACA] bg-[#FEF2F2]"
        >
          {sorted.map((item, idx) => (
            <div key={item.id}>
              {idx > 0 && <div className="mx-4 h-px bg-[#FECACA]/40" />}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDlc(item.id);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FEE2E2]"
              >
                <span className="text-2xl select-none" aria-hidden>
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1C2B1E]">{item.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#DC2626]">
                    {item.dlc ? expiredSinceLabel(item.dlc) : "Date inconnue"}
                  </p>
                  {item.dlc && (
                    <p className="mt-0.5 text-xs font-medium text-[#9CA3AF]">
                      DLC&nbsp;:{" "}
                      {new Date(item.dlc).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#7A8F7D]">
                  {item.quantity} {unitLabel(item.unit)}
                </span>
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs font-medium text-[#9CA3AF]">
          Appuyez sur un ingrédient pour modifier sa date
        </p>
      </div>
    </div>
  );
}

function EditDlcModal({
  item,
  onSave,
  onClose,
}: {
  item: Ingredient;
  onSave: (dlc: string | null) => void;
  onClose: () => void;
}) {
  const [dlc, setDlc] = useState(item.dlc ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dlc || null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in w-full rounded-t-3xl p-7 sm:w-auto sm:min-w-[400px] sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-2xl select-none">{item.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#7A8F7D] uppercase">Date d&apos;expiration</p>
              <h2 className="font-lora truncate text-xl font-bold text-[#1C2B1E]">{item.name}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
              DATE LIMITE DE CONSOMMATION
            </label>
            <input
              ref={inputRef}
              type="date"
              value={dlc}
              onChange={(e) => setDlc(e.target.value)}
              className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
              style={{ border: "1.5px solid #E2EBE3" }}
            />
          </div>

          <div className="flex gap-3">
            {item.dlc && (
              <button
                type="button"
                onClick={() => {
                  onSave(null);
                  onClose();
                }}
                className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] active:scale-[0.98]"
                style={{ border: "1.5px solid #E2EBE3" }}
              >
                Retirer la date
              </button>
            )}
            <button
              type="submit"
              className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
              }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IngredientRow({
  item,
  onAdjust,
  onDelete,
  onEditDlc,
  onMove,
  onRename,
  isNew,
}: {
  item: Ingredient;
  onAdjust: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
  onEditDlc: (id: number) => void;
  onMove: (id: number, category: TabId) => void;
  onRename: (id: number, name: string) => void;
  isNew: boolean;
}) {
  const status = dlcStatus(item.dlc);
  const style = STATUS_STYLE[status];
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [nameDraft, setNameDraft] = useState(item.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const destinations = TABS.filter((tab) => tab.id !== item.category);

  useEffect(() => {
    setNameDraft(item.name);
  }, [item.name]);

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
      setNameDraft(item.name);
      return;
    }
    if (trimmed !== item.name) onRename(item.id, trimmed);
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
              setNameDraft(item.name);
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent text-sm font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]"
          aria-label={`Nom de ${item.name}`}
        />
        {item.dlc ? (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: style.dot }} />
            <span className="text-xs font-medium" style={{ color: style.color }}>
              {dlcLabel(item.dlc)}
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
          disabled={item.quantity <= 0}
          className="flex h-8 w-8 items-center justify-center text-[#4A7C59] transition-all hover:bg-[#EBF2EC] disabled:opacity-30"
          aria-label="Diminuer"
        >
          <MinusIcon />
        </button>
        <span
          className="w-12 border-x text-center text-sm font-extrabold text-[#1C2B1E]"
          style={{ borderColor: "#E2EBE3", lineHeight: "2rem" }}
        >
          {item.quantity}
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
          <MoreIcon />
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
                  <CalendarIcon />
                </span>
                {item.dlc ? "Modifier la date d'expiration" : "Ajouter une date d'expiration"}
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
                    <MoveIcon />
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
                <TrashIcon />
                Supprimer
              </button>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [editingDlcId, setEditingDlcId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setItems(getFridgeItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setFridgeItems(items);
  }, [items, ready]);

  const tabItems = items.filter((i) => i.category === activeTab);
  const filtered = tabItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
  const editingItem = editingDlcId != null ? items.find((i) => i.id === editingDlcId) ?? null : null;
  const expiredItems = tabItems.filter((i) => dlcStatus(i.dlc) === "urgent");
  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  const priorityOrder = { urgent: 0, soon: 1, ok: 2, none: 3 };
  const sorted = [...filtered].sort(
    (a, b) => priorityOrder[dlcStatus(a.dlc)] - priorityOrder[dlcStatus(b.dlc)],
  );

  const urgentCount = (tab: TabId) =>
    items.filter((i) => i.category === tab && dlcStatus(i.dlc) === "urgent").length;
  const soonCount = (tab: TabId) =>
    items.filter((i) => i.category === tab && (dlcStatus(i.dlc) === "urgent" || dlcStatus(i.dlc) === "soon")).length;

  const handleAdjust = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)),
    );
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMove = (id: number, category: TabId) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, category } : i)));
    setActiveTab(category);
    setNewIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      setTimeout(() => {
        setNewIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }, 600);
      return s;
    });
  };

  const handleRename = (id: number, name: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  };

  const handleUpdateDlc = (id: number, dlc: string | null) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, dlc } : i)));
  };

  const handleAdd = (item: Omit<Ingredient, "id">) => {
    const id = nextFridgeItemId(items);
    setItems((prev) => [...prev, { ...item, id }]);
    setNewIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      setTimeout(() => {
        setNewIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }, 600);
      return s;
    });
    setActiveTab(item.category);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <main className="mx-auto flex min-h-screen max-w-md flex-col sm:max-w-2xl lg:max-w-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8EDE9] px-5 py-5 lg:px-8 lg:py-7">
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Inventaire</p>
            <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">
              Mon Frigo &amp; Placards
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
            }}
          >
            <PlusIcon size={14} />
            <span className="hidden sm:inline">Ajouter un ingrédient</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        <div className="flex shrink-0 items-end gap-0 border-b border-[#E8EDE9] px-5 lg:px-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const urgent = urgentCount(tab.id);
            const tabTotal = items.filter((i) => i.category === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                className="relative -mb-px flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all duration-200"
                style={{
                  color: isActive ? "#1C2B1E" : "#7A8F7D",
                  borderBottom: isActive ? "2px solid #1C2B1E" : "2px solid transparent",
                }}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: isActive ? "#EBF2EC" : "#F0F4EF",
                    color: isActive ? "#4A7C59" : "#9CA3AF",
                  }}
                >
                  {tabTotal}
                </span>
                {urgent > 0 && (
                  <span
                    className="absolute top-2 right-1 h-2 w-2 rounded-full bg-[#EF4444]"
                    title={`${urgent} expiré(s)`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 lg:px-8">
            <div className="mb-5 flex items-center gap-4">
              <div
                className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ background: "#FFFFFF", border: "1.5px solid #E2EBE3" }}
              >
                <span className="shrink-0 text-[#9CA3AF]">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Rechercher dans les ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}…`}
                  className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
                />
              </div>

              {soonCount(activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (urgentCount(activeTab) > 0) setShowExpired(true);
                  }}
                  disabled={urgentCount(activeTab) === 0}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all ${
                    urgentCount(activeTab) > 0
                      ? "border-[#FECACA] bg-[#FEF2F2] active:scale-95 hover:bg-[#FEE2E2]"
                      : "cursor-default border-[#FED7AA] bg-[#FFF7ED]"
                  }`}
                  aria-label={
                    urgentCount(activeTab) > 0
                      ? `Voir les ${urgentCount(activeTab)} ingrédient${urgentCount(activeTab) > 1 ? "s" : ""} expiré${urgentCount(activeTab) > 1 ? "s" : ""}`
                      : undefined
                  }
                >
                  <CalendarIcon />
                  <span
                    className={`text-xs font-bold ${
                      urgentCount(activeTab) > 0 ? "text-[#DC2626]" : "text-[#C2410C]"
                    }`}
                  >
                    {urgentCount(activeTab) > 0
                      ? `${urgentCount(activeTab)} expiré${urgentCount(activeTab) > 1 ? "s" : ""}`
                      : `${soonCount(activeTab)} bientôt`}
                  </span>
                </button>
              )}
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white"
              style={{ boxShadow: "0 1px 12px rgba(28,43,30,0.06)" }}
            >
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <div className="mb-4 text-5xl">
                    {activeTab === "fridge" ? "🧊" : activeTab === "freezer" ? "❄️" : "🏺"}
                  </div>
                  <p className="font-lora mb-1 text-base font-bold text-[#1C2B1E]">
                    {query ? "Aucun résultat" : "C'est vide ici !"}
                  </p>
                  <p className="text-sm font-medium text-[#7A8F7D]">
                    {query ? "Essayez un autre mot-clé" : "Ajoutez votre premier ingrédient"}
                  </p>
                  {!query && (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
                    >
                      <PlusIcon size={13} /> Ajouter un ingrédient
                    </button>
                  )}
                </div>
              ) : (
                sorted.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <div className="ml-14 h-px bg-[#F0F4EF]" />}
                    <IngredientRow
                      item={item}
                      onAdjust={handleAdjust}
                      onDelete={handleDelete}
                      onEditDlc={setEditingDlcId}
                      onMove={handleMove}
                      onRename={handleRename}
                      isNew={newIds.has(item.id)}
                    />
                  </div>
                ))
              )}
            </div>

            {sorted.length > 0 && (
              <div className="mt-4 flex items-center gap-5 px-1">
                {[
                  { dot: "#EF4444", label: "Urgent / Périmé" },
                  { dot: "#F97316", label: "Dans les 3 jours" },
                  { dot: "#9CA3AF", label: "OK" },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-medium text-[#9CA3AF]">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <AddModal activeTab={activeTab} onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}

      {showExpired && expiredItems.length > 0 && (
        <ExpiredModal
          items={expiredItems}
          tabLabel={activeTabLabel}
          onClose={() => setShowExpired(false)}
          onEditDlc={setEditingDlcId}
        />
      )}

      {editingItem && (
        <EditDlcModal
          item={editingItem}
          onSave={(dlc) => handleUpdateDlc(editingItem.id, dlc)}
          onClose={() => setEditingDlcId(null)}
        />
      )}
    </div>
  );
}
