import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

export function SelectOptionRow({
  icon,
  label,
  detail,
  isSelected,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  detail?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`group flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2.5 text-xs font-semibold transition-all ${
        isSelected
          ? "bg-[#EBF3ED] font-bold text-[#2E5B3E]"
          : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex shrink-0 items-center justify-start">{icon}</span>
        <span className="truncate">{label}</span>
        {detail ? (
          <span
            className={`text-[10px] font-medium ${
              isSelected ? "text-[#4A7C59]" : "text-[#9CA3AF] group-hover:text-[#4A7C59]"
            }`}
          >
            ({detail})
          </span>
        ) : null}
      </div>
      {isSelected ? (
        <span className="shrink-0 text-[#2E5B3E]">
          <CheckIcon size={13} />
        </span>
      ) : null}
    </button>
  );
}
