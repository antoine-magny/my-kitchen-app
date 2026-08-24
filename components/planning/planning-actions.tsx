export function PlanningActions({
  exportMessage,
  generateMessage,
  onExport,
  onGenerate,
}: {
  exportMessage: string | null;
  generateMessage: string | null;
  onExport: () => void;
  onGenerate: () => void;
}) {
  return (
    <section className="fade-up space-y-3" style={{ animationDelay: "0.18s" }}>
      <button
        type="button"
        onClick={onExport}
        className="btn-primary flex w-full flex-wrap items-center justify-center gap-2 rounded-2xl px-4 py-4 text-center text-sm leading-snug font-bold"
      >
        <span aria-hidden>🛒</span>
        Exporter vers les courses
      </button>

      {exportMessage && (
        <p className="text-center text-xs font-semibold text-[#C2410C]">{exportMessage}</p>
      )}

      <button
        type="button"
        onClick={onGenerate}
        className="flex w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-[#C8E0CF] bg-white px-4 py-3.5 text-sm leading-snug font-bold text-[#2E5C3A] transition-all hover:bg-[#EBF2EC] active:scale-[0.98]"
      >
        <span aria-hidden>🎲</span>
        Générer selon mon frigo
      </button>

      {generateMessage && (
        <p className="text-center text-xs font-semibold text-[#2E5C3A]">{generateMessage}</p>
      )}
    </section>
  );
}
