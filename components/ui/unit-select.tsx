"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { getIngredientCountUnit } from "@/lib/ingredients";
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
}

const MASS_CODES = new Set(["g", "kg"]);
const VOLUME_CODES = new Set(["ml", "cl", "l", "c_cafe", "c_soupe", "verre"]);
const ALL_COUNT_CODES = [
  "piece",
  "gousse",
  "tranche",
  "sachet",
  "pincee",
  "brin",
  "poignee",
  "botte",
  "feuille",
];

interface UnitDisplayInfo {
  label: string;
  shortLabel: string;
  detail?: string;
}

const UNIT_DISPLAY_CONFIG: Record<string, UnitDisplayInfo> = {
  g: { label: "Grammes", shortLabel: "g", detail: "g" },
  kg: { label: "Kilogrammes", shortLabel: "kg", detail: "kg" },
  ml: { label: "Millilitres", shortLabel: "ml", detail: "ml" },
  cl: { label: "Centilitres", shortLabel: "cl", detail: "cl" },
  l: { label: "Litres", shortLabel: "L", detail: "L" },
  c_cafe: { label: "Cuillère à café", shortLabel: "c.à.c", detail: "5 ml" },
  c_soupe: { label: "Cuillère à soupe", shortLabel: "c.à.s", detail: "15 ml" },
  verre: { label: "Verre", shortLabel: "verre", detail: "20 cl" },
  piece: { label: "Pièce", shortLabel: "Pièce", detail: "unité" },
  gousse: { label: "Gousse", shortLabel: "gousse" },
  tranche: { label: "Tranche", shortLabel: "tranche" },
  sachet: { label: "Sachet", shortLabel: "sachet" },
  pincee: { label: "Pincée", shortLabel: "pincée" },
  brin: { label: "Brin", shortLabel: "brin" },
  poignee: { label: "Poignée", shortLabel: "poignée" },
  botte: { label: "Botte", shortLabel: "botte" },
  feuille: { label: "Feuille", shortLabel: "feuille" },
  qs: { label: "Quantité suffisante", shortLabel: "Quantité suffisante", detail: "au goût" },
};

/**
 * Sélecteur d'unités moderne et élégant par familles (Masse / Volume / Décompte).
 * Remplace le select natif par un menu déroulant soigné avec animations et retour visuel clair.
 */
export function UnitSelect({
  value,
  onChange,
  className,
  id,
  ingredientName,
  countUnit,
  compact = false,
  ...rest
}: UnitSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Filtrage des unités
  const mass = UNIT_LIST.filter((u) => MASS_CODES.has(u.code));
  const volume = UNIT_LIST.filter((u) => VOLUME_CODES.has(u.code));

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
    const GAP = 6;
    const BOTTOM_NAV_HEIGHT = 80; // Marge pour la barre de navigation
    const POPOVER_MAX_HEIGHT = 288;

    let width = compact ? 210 : Math.max(240, rect.width);
    let top = rect.bottom + GAP + window.scrollY;
    let left = compact ? rect.right - width + window.scrollX : rect.left + window.scrollX;
    
    // Empêcher débordement à droite
    if (left + width > window.innerWidth - 8) {
      left = window.innerWidth - width - 8;
    }

    let maxHeight = POPOVER_MAX_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - GAP - BOTTOM_NAV_HEIGHT;
    const spaceAbove = rect.top - GAP;

    if (spaceBelow < POPOVER_MAX_HEIGHT && spaceAbove > spaceBelow) {
      maxHeight = Math.min(POPOVER_MAX_HEIGHT, spaceAbove - 8);
      top = rect.top - maxHeight - GAP + window.scrollY;
    } else {
      maxHeight = Math.min(POPOVER_MAX_HEIGHT, Math.max(120, spaceBelow - 8));
    }

    setPopoverPos({ top, left, width, maxHeight });
    setIsOpen(true);
  }

  // Fermeture au clic extérieur et au scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleScroll(event: Event) {
      // Si le scroll vient de l'intérieur du popover, on le laisse passer
      if (popoverRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    const handleResize = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

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
      className={`relative ${compact ? "inline-block" : "w-full"}`}
      style={{ isolation: "isolate" }}
    >
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
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
            : "flex w-full items-center justify-between rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] shadow-sm transition-all hover:border-[#4A7C59] focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 focus:outline-none")
        }
      >
        <span className="truncate text-left">{selectedDisplayLabel}</span>
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
          aria-label="Unités de mesure"
          className="slide-down overflow-y-auto rounded-2xl border border-[#E2EBE3] bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all"
          style={{
            position: "fixed",
            top: popoverPos.top - window.scrollY,
            left: popoverPos.left - window.scrollX,
            width: popoverPos.width,
            maxHeight: popoverPos.maxHeight,
            zIndex: 9999,
            boxShadow: "0 12px 32px rgba(20, 31, 22, 0.16)",
            scrollbarWidth: "thin",
            scrollbarColor: "#C8E0CF transparent",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Groupe Masse */}
          <div>
            <div className="flex items-center gap-1 px-2.5 pt-1.5 pb-1 text-[10px] font-extrabold tracking-wider text-[#7A8F7D] uppercase">
              <span>⚖️</span>
              <span>Masse</span>
            </div>
            <div className="space-y-0.5">
              {mass.map((u) => {
                const info = UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code };
                const isSelected = value === u.code;
                return (
                  <button
                    key={u.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(u.code)}
                    className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF3ED] text-[#2E5B3E] font-bold"
                        : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{info.label}</span>
                      {info.detail && (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-[#4A7C59]" : "text-[#9CA3AF] group-hover:text-[#4A7C59]"
                          }`}
                        >
                          ({info.detail})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-[#2E5B3E]">
                        <CheckIcon size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Séparateur */}
          <div className="my-1 border-t border-[#F0F4EF]" />

          {/* Groupe Volume */}
          <div>
            <div className="flex items-center gap-1 px-2.5 pt-1 pb-1 text-[10px] font-extrabold tracking-wider text-[#7A8F7D] uppercase">
              <span>💧</span>
              <span>Volume</span>
            </div>
            <div className="space-y-0.5">
              {volume.map((u) => {
                const info = UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code };
                const isSelected = value === u.code;
                return (
                  <button
                    key={u.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(u.code)}
                    className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF3ED] text-[#2E5B3E] font-bold"
                        : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{info.label}</span>
                      {info.detail && (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-[#4A7C59]" : "text-[#9CA3AF] group-hover:text-[#4A7C59]"
                          }`}
                        >
                          ({info.detail})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-[#2E5B3E]">
                        <CheckIcon size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Séparateur */}
          <div className="my-1 border-t border-[#F0F4EF]" />

          {/* Groupe Décompte */}
          <div>
            <div className="flex items-center gap-1 px-2.5 pt-1 pb-1 text-[10px] font-extrabold tracking-wider text-[#7A8F7D] uppercase">
              <span>🔢</span>
              <span>Décompte</span>
            </div>
            <div className="space-y-0.5">
              {count.map((u) => {
                const info = UNIT_DISPLAY_CONFIG[u.code] || { label: u.label, shortLabel: u.code };
                const isSelected = value === u.code;
                return (
                  <button
                    key={u.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(u.code)}
                    className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF3ED] text-[#2E5B3E] font-bold"
                        : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{info.label}</span>
                      {info.detail && (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-[#4A7C59]" : "text-[#9CA3AF] group-hover:text-[#4A7C59]"
                          }`}
                        >
                          ({info.detail})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-[#2E5B3E]">
                        <CheckIcon size={13} />
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Option Quantité suffisante */}
              {(() => {
                const info = UNIT_DISPLAY_CONFIG.qs;
                const isSelected = value === "qs";
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect("qs")}
                    className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF3ED] text-[#2E5B3E] font-bold"
                        : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{info.label}</span>
                      {info.detail && (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-[#4A7C59]" : "text-[#9CA3AF] group-hover:text-[#4A7C59]"
                          }`}
                        >
                          ({info.detail})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-[#2E5B3E]">
                        <CheckIcon size={13} />
                      </span>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
