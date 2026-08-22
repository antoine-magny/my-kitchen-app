export function MacroBar({
  label,
  current,
  target,
  unit,
  color,
  track,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  track: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-[#1C2B1E]">{label}</span>
        <span className="text-xs font-semibold text-[#7A8F7D]">
          {current.toLocaleString("fr-FR")} / {target.toLocaleString("fr-FR")} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: track }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
