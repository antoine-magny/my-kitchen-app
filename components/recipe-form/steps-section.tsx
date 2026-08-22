import { PlusIcon, TrashIcon } from "@/components/icons";
import { inputStyle } from "@/components/recipe-form-styles";
import type { RecipeStep } from "@/lib/recipes";

export function StepsSection({
  steps,
  setSteps,
  updateStep,
}: {
  steps: RecipeStep[];
  setSteps: React.Dispatch<React.SetStateAction<RecipeStep[]>>;
  updateStep: (index: number, field: keyof RecipeStep, value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
          ÉTAPES
        </label>
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, { title: "", detail: "", duration: "" }])}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
        >
          <PlusIcon size={12} /> Ajouter
        </button>
      </div>
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-3"
            style={{ background: "#FAFBF9", border: "1.5px solid #E2EBE3" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EBF2EC] text-xs font-extrabold text-[#4A7C59]">
                {idx + 1}
              </span>
              <input
                value={step.title}
                onChange={(e) => updateStep(idx, "title", e.target.value)}
                placeholder="Titre de l'étape"
                className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1C2B1E] outline-none"
                style={inputStyle}
              />
              <input
                value={step.duration ?? ""}
                onChange={(e) => updateStep(idx, "duration", e.target.value)}
                placeholder="5 min"
                className="w-20 shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1C2B1E] outline-none"
                style={inputStyle}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                  aria-label="Supprimer l'étape"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
            <textarea
              value={step.detail}
              onChange={(e) => updateStep(idx, "detail", e.target.value)}
              placeholder="Description de l'étape…"
              rows={2}
              className="w-full resize-none rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#1C2B1E] outline-none"
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
