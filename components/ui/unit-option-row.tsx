import { CheckIcon } from "@/components/icons";
import type { UnitDisplayInfo } from "@/components/ui/unit-select-config";

export function UnitOptionRow({
  emoji,
  info,
  isSelected,
  onSelect,
}: {
  emoji: string;
  info: UnitDisplayInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
        isSelected
          ? "bg-[#EBF3ED] text-[#2E5B3E] font-bold"
          : "text-[#1C2B1E] hover:bg-[#F0F5F1] hover:text-[#2E5B3E]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
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
}
