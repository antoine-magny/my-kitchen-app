"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { DEFAULT_EQUIPMENT_IDS, KITCHEN_EQUIPMENT } from "@/lib/profile";

export function EquipmentCard() {
  const [selected, setSelected] = useState(() => new Set(DEFAULT_EQUIPMENT_IDS));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const plural = selected.size > 1 ? "s" : "";

  return (
    <div
      className="rounded-3xl px-5 py-4"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none" aria-hidden>
          🍳
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C2B1E]">Équipements de cuisine</p>
          <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">
            Sert à filtrer les recettes générées par l&apos;IA
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {KITCHEN_EQUIPMENT.map((equipment) => {
          const active = selected.has(equipment.id);
          return (
            <button
              key={equipment.id}
              type="button"
              onClick={() => toggle(equipment.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                active
                  ? "border-[#4A7C59] bg-[#EBF2EC] text-[#2E5C3A]"
                  : "border-[#E2EBE3] bg-[#FAFBF9] text-[#7A8F7D]"
              }`}
            >
              <span aria-hidden>{equipment.emoji}</span>
              {equipment.label}
              <span className={active ? "text-[#4A7C59]" : "text-[#C4CFC5]"}>
                {active ? <CheckIcon size={12} /> : <PlusIcon size={12} />}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3.5 text-xs font-medium text-[#7A8F7D]">
        {selected.size} équipement{plural} disponible{plural} sur {KITCHEN_EQUIPMENT.length}
      </p>
    </div>
  );
}
