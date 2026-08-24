"use client";

import { CheckIcon, PlusIcon } from "@/components/icons";
import { KITCHEN_EQUIPMENT } from "@/lib/profile";

type EquipmentCardProps = {
  selected: Set<string>;
  onToggle: (id: string) => void;
};

export function EquipmentCard({ selected, onToggle }: EquipmentCardProps) {
  return (
    <div className="rounded-3xl border border-[#E2EBE3] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#1C2B1E]">Matériel possédé</h3>
          <p className="text-xs text-[#7A8F7D]">Pour filtrer les recettes réalisables</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F4EF] text-lg">
          🍳
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {KITCHEN_EQUIPMENT.map((eq) => {
          const isActive = selected.has(eq.id);
          return (
            <button
              key={eq.id}
              type="button"
              onClick={() => onToggle(eq.id)}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors ${
                isActive
                  ? "border-[#4A7C59] bg-[#EBF2EC]"
                  : "border-[#E2EBE3] bg-[#FAFBF9] hover:bg-[#EBF2EC]/50"
              }`}
            >
              <span className="text-lg">{eq.emoji}</span>
              <span className="flex-1 text-xs font-medium text-[#1C2B1E]">{eq.label}</span>
              {isActive ? (
                <CheckIcon size={16} className="text-[#4A7C59]" />
              ) : (
                <PlusIcon size={16} className="text-[#7A8F7D]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
