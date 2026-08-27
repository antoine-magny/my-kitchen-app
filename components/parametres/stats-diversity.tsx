"use client";

import type { DiversityStats } from "@/lib/nutrition-insights";

/** Repère qualitatif de l'indice, calé sur 6 familles protéiques possibles. */
function diversityVerdict(avg: number): { label: string; color: string } {
  if (avg >= 3) return { label: "Excellente", color: "#16a34a" };
  if (avg >= 2) return { label: "Correcte", color: "#4A7C59" };
  if (avg >= 1) return { label: "Limitée", color: "#e9a23b" };
  return { label: "À enrichir", color: "#dc2626" };
}

export function StatsDiversity({ stats }: { stats: DiversityStats }) {
  const verdict = diversityVerdict(stats.avgSources);
  const activeFamilies = stats.families.filter((family) => family.days > 0);

  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-[#1C2B1E]">🌈 Diversité nutritionnelle</h3>

      <div className="flex items-center gap-4 rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] p-3">
        <div className="text-center">
          <p className="font-lora text-2xl leading-none font-bold text-[#2E5B3E]">
            {stats.avgSources.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#7A8F7D]">sources / jour</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold" style={{ color: verdict.color }}>
            {verdict.label}
          </p>
          <p className="mt-0.5 text-[11px] text-[#7A8F7D]">
            Sources de protéines différentes consommées en moyenne chaque jour sur{" "}
            {stats.windowDays} jours, parmi {stats.totalFamilies} familles.
          </p>
        </div>
      </div>

      {stats.daysWithData === 0 ? (
        <p className="mt-3 text-[11px] text-[#7A8F7D]">
          Planifiez des repas pour révéler votre diversité protéique.
        </p>
      ) : (
        <>
          <p className="mt-3 mb-2 text-[10px] font-semibold tracking-[0.08em] text-[#7A8F7D] uppercase">
            {stats.familiesCovered}/{stats.totalFamilies} familles sur {stats.daysWithData} jour
            {stats.daysWithData > 1 ? "s" : ""} renseigné{stats.daysWithData > 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-2">
            {stats.families.map((family) => (
              <div key={family.id} className="flex items-center gap-2.5">
                <span className="text-sm leading-none" aria-hidden>
                  {family.emoji}
                </span>
                <span
                  className={`w-32 shrink-0 truncate text-[11px] font-bold ${
                    family.days > 0 ? "text-[#1C2B1E]" : "text-[#A9B8AB]"
                  }`}
                >
                  {family.label}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F4EF]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.round((family.days / Math.max(1, stats.daysWithData)) * 100)}%`,
                      background: "linear-gradient(90deg, #4A7C59, #6FAE82)",
                    }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-[10px] font-bold text-[#7A8F7D]">
                  {family.days} j
                </span>
              </div>
            ))}
          </div>
          {activeFamilies.length < stats.totalFamilies && (
            <p className="mt-2.5 text-[10px] text-[#7A8F7D]">
              Piste : ajouter{" "}
              {stats.families
                .filter((family) => family.days === 0)
                .slice(0, 2)
                .map((family) => family.label.toLowerCase())
                .join(" ou ")}{" "}
              élargirait votre indice.
            </p>
          )}
        </>
      )}
    </div>
  );
}
