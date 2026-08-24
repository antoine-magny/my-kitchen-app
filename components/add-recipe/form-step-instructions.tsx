import { PlusIcon, TrashIcon } from "@/components/icons";
import { inputStyle } from "@/components/recipe-form-styles";

export function FormStepInstructions({
  instructions,
  setInstructions,
}: {
  instructions: string[];
  setInstructions: (updater: (prev: string[]) => string[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
          INSTRUCTIONS
        </label>
        <button
          type="button"
          onClick={() => setInstructions((prev) => [...prev, ""])}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
        >
          <PlusIcon size={12} /> Ajouter
        </button>
      </div>
      <div className="space-y-2">
        {instructions.map((stepText, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EBF2EC] text-xs font-extrabold text-[#4A7C59]">
              {idx + 1}
            </span>
            <textarea
              value={stepText}
              onChange={(e) =>
                setInstructions((prev) =>
                  prev.map((s, i) => (i === idx ? e.target.value : s)),
                )
              }
              placeholder="Décrivez l’étape…"
              rows={2}
              className="w-full resize-none rounded-xl bg-[#FAFBF9] px-3 py-2 text-base font-medium text-[#1C2B1E] outline-none"
              style={inputStyle}
            />
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => setInstructions((prev) => prev.filter((_, i) => i !== idx))}
                className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                aria-label="Supprimer l'étape"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
