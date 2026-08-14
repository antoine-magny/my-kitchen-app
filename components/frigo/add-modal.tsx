"use client";

import { useEffect, useRef, useState } from "react";
import type { NewFridgeItem, TabId } from "@/components/frigo/shared";
import { ChevronDownIcon, XIcon } from "@/components/icons";
import { INGREDIENTS } from "@/lib/ingredients";
import { UnitSelect } from "@/components/ui/unit-select";
import { DEFAULT_UNIT, type UnitCode } from "@/lib/units";

export function AddModal({
  activeTab,
  onAdd,
  onClose,
}: {
  activeTab: TabId;
  onAdd: (item: NewFridgeItem) => void;
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
      customName: name.trim(),
      amount: Number(qty) || 1,
      unit,
      expirationDate: dlc || null,
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
            <XIcon size={18} />
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
                <UnitSelect
                  value={unit}
                  onChange={(next) => setUnit(next as UnitCode)}
                  className="w-full appearance-none rounded-xl border-[1.5px] border-[#E2EBE3] bg-[#FAFBF9] py-3 pr-10 pl-4 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                />
                <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
                  <ChevronDownIcon size={14} />
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
