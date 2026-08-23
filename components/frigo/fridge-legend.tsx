const LEGEND = [
  { dot: "#EF4444", label: "Urgent / Périmé" },
  { dot: "#F97316", label: "Dans les 3 jours" },
  { dot: "#9CA3AF", label: "OK" },
] as const;

export function FridgeLegend() {
  return (
    <div className="mt-4 flex items-center gap-5 px-1">
      {LEGEND.map(({ dot, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
          <span className="text-xs font-medium text-[#9CA3AF]">{label}</span>
        </div>
      ))}
    </div>
  );
}
