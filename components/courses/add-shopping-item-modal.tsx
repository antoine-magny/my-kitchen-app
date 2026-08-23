"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon, ChevronDownIcon } from "@/components/icons";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { UnitSelect } from "@/components/ui/unit-select";
import { getIngredientDefaultUnit, resolveIcon, DEFAULT_INGREDIENT_ICON } from "@/lib/ingredients";
import { classifyProduct, SHOPPING_CATEGORIES, type ShoppingCategoryId } from "@/lib/shopping-categories";
import { coerceUnitCode, type UnitCode } from "@/lib/units";

interface AddShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    customName: string;
    amount: number;
    unit: UnitCode;
    category?: ShoppingCategoryId;
    icon?: string;
  }) => void;
}

export function AddShoppingItemModal({ isOpen, onClose, onAdd }: AddShoppingItemModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<UnitCode>("piece");
  const [icon, setIcon] = useState(DEFAULT_INGREDIENT_ICON);
  const [category, setCategory] = useState<ShoppingCategoryId | "">("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAmount("1");
      setUnit("piece");
      setIcon(DEFAULT_INGREDIENT_ICON);
      setCategory("");
      // setTimeout pour laisser le temps au rendu avant de focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // Auto-complétion de l'icône et de l'unité
    if (newName.trim()) {
      const autoIcon = resolveIcon(newName);
      if (autoIcon) setIcon(autoIcon);

      const autoUnit = getIngredientDefaultUnit(newName);
      setUnit(autoUnit);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAmount = Number(amount.replace(",", "."));
    const finalAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 1;

    onAdd({
      customName: name.trim(),
      amount: finalAmount,
      unit,
      category: category === "" ? undefined : category,
      icon: icon !== DEFAULT_INGREDIENT_ICON ? icon : undefined,
    });
  };

  const autoCategoryId = classifyProduct(name || "Article");
  const autoCategoryTitle =
    SHOPPING_CATEGORIES.find((c) => c.id === autoCategoryId)?.title ?? "Épicerie & Féculents";

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative flex w-full flex-col bg-white p-5 pb-8 sm:w-[440px] sm:rounded-3xl sm:pb-5 rounded-t-3xl"
        style={{ boxShadow: "0 4px 24px rgba(20,31,22,0.12)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-item-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
            Ajouter un article
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E]"
            aria-label="Fermer"
          >
            <XIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom & Icône */}
          <div className="flex gap-3">
            <div className="shrink-0 pt-1">
              <EmojiPickerPopover size="lg" currentIcon={icon} onSelectIcon={setIcon} />
            </div>
            <div className="flex-1">
              <label htmlFor="item-name" className="mb-1 block text-xs font-semibold text-[#7A8F7D]">
                Nom de l&apos;article
              </label>
              <input
                id="item-name"
                ref={inputRef}
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Lait d'avoine, Courgettes..."
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20"
                required
              />
            </div>
          </div>

          {/* Quantité & Unité */}
          <div className="flex gap-3">
            <div className="w-1/3 shrink-0">
              <label htmlFor="item-qty" className="mb-1 block text-xs font-semibold text-[#7A8F7D]">
                Quantité
              </label>
              <input
                id="item-qty"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20"
              />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="item-unit" className="mb-1 block text-xs font-semibold text-[#7A8F7D]">
                Unité
              </label>
              <UnitSelect
                id="item-unit"
                value={unit}
                ingredientName={name}
                onChange={(u) => {
                  const next = coerceUnitCode(u);
                  if (next) setUnit(next);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all hover:border-[#4A7C59] focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20"
              />
            </div>
          </div>

          {/* Rayon / Catégorie */}
          <div>
            <label
              htmlFor="item-category"
              className="mb-1 block text-xs font-semibold text-[#7A8F7D]"
            >
              Rayon (Optionnel)
            </label>
            <div className="relative">
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ShoppingCategoryId | "")}
                className="w-full appearance-none rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 pr-10 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20"
              >
                <option value="">Automatique ({autoCategoryTitle})</option>
                {SHOPPING_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#7A8F7D]">
                <ChevronDownIcon size={14} />
              </div>
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#4A7C59] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#3D6649] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
            }}
          >
            Ajouter à la liste
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
