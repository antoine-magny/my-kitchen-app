import { SelectOptionRow } from "@/components/ui/select-option-row";
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
    <SelectOptionRow
      icon={<span className="text-sm">{emoji}</span>}
      label={info.label}
      detail={info.detail}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}
