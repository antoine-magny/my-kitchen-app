import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";

export function UrlStep({
  urlDraft,
  setUrlDraft,
  onSubmit,
  error,
}: {
  urlDraft: string;
  setUrlDraft: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
      <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
        URL DE LA RECETTE
      </label>
      <input
        value={urlDraft}
        onChange={(e) => setUrlDraft(e.target.value)}
        placeholder="https://www.marmiton.org/…"
        className={inputClass}
        style={inputStyle}
        autoFocus
      />
      <p className="text-xs font-medium text-[#7A8F7D]">
        Collez le lien d’un site de cuisine. L’IA extrait titre, ingrédients et étapes.
      </p>
      {error && (
        <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
          boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
        }}
      >
        Extraire la recette
      </button>
    </form>
  );
}
