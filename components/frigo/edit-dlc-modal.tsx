"use client";

import { useEffect, useRef, useState } from "react";
import type { Ingredient } from "@/components/frigo/shared";
import { XIcon } from "@/components/icons";

export function EditDlcModal({
  item,
  onSave,
  onClose,
}: {
  item: Ingredient;
  onSave: (dlc: string | null) => void;
  onClose: () => void;
}) {
  const [dlc, setDlc] = useState(item.expirationDate ?? "");
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
              <h2 className="font-lora truncate text-xl font-bold text-[#1C2B1E]">
                {item.customName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon size={18} />
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
            {item.expirationDate && (
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
