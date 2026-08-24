"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { UnitSelect } from "@/components/ui/unit-select";
import { coerceUnitCode, type UnitCode } from "@/lib/units";

const ITEM_NAME_CLASS =
  "block w-full resize-none overflow-hidden bg-transparent text-base leading-snug font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] break-words";
const ITEM_AMOUNT_CLASS =
  "w-16 shrink-0 bg-transparent text-base font-medium text-[#7A8F7D] outline-none rounded-lg px-1.5 py-0.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const ITEM_UNIT_CLASS =
  "min-w-0 max-w-full whitespace-normal break-words rounded-lg border border-transparent bg-transparent py-0.5 px-1.5 text-xs leading-snug font-semibold text-[#7A8F7D] outline-none transition-colors hover:bg-[#F0F4EF] hover:text-[#1C2B1E] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] cursor-pointer text-left";

export function EditableItemFields({
  name,
  amount,
  unit,
  nameClassName,
  onCommitName,
  onCommitAmount,
  onChangeUnit,
  children,
}: {
  name: string;
  amount: number;
  unit: string;
  nameClassName?: string;
  onCommitName: (name: string) => void;
  onCommitAmount: (amount: number) => void;
  onChangeUnit: (unit: UnitCode) => void;
  children?: ReactNode;
}) {
  const [nameDraft, setNameDraft] = useState(name);
  const [amountDraft, setAmountDraft] = useState(String(amount));
  const nameRef = useRef<HTMLTextAreaElement>(null);

  function syncNameHeight() {
    const el = nameRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    setNameDraft(name);
  }, [name]);

  useEffect(() => {
    setAmountDraft(String(amount));
  }, [amount]);

  useLayoutEffect(() => {
    const el = nameRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const observer = new ResizeObserver(() => syncNameHeight());
    observer.observe(parent);
    syncNameHeight();
    return () => observer.disconnect();
  }, [nameDraft]);

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(name);
      return;
    }
    if (trimmed !== name) onCommitName(trimmed);
  }

  function commitAmount() {
    const raw = amountDraft.trim().replace(",", ".");
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0) {
      setAmountDraft(String(amount));
      return;
    }
    if (next !== amount) onCommitAmount(next);
  }

  return (
    <div className="min-w-0 flex-1">
      <textarea
        ref={nameRef}
        rows={1}
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value.replace(/\n/g, " "))}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            setNameDraft(name);
            e.currentTarget.blur();
          }
        }}
        className={`${ITEM_NAME_CLASS} ${nameClassName ?? ""}`}
        aria-label={`Nom de ${name}`}
      />
      <div className="mt-0.5 flex min-w-0 items-start gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={amountDraft}
          onChange={(e) => setAmountDraft(e.target.value)}
          onBlur={commitAmount}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setAmountDraft(String(amount));
              e.currentTarget.blur();
            }
          }}
          placeholder="Qté"
          className={ITEM_AMOUNT_CLASS}
          aria-label={`Quantité de ${name}`}
        />
        <UnitSelect
          compact
          value={unit}
          ingredientName={name}
          onChange={(nextUnit) => {
            const next = coerceUnitCode(nextUnit);
            if (next && next !== unit) onChangeUnit(next);
          }}
          className={ITEM_UNIT_CLASS}
          aria-label={`Unité de ${name}`}
        />
      </div>
      {children}
    </div>
  );
}
