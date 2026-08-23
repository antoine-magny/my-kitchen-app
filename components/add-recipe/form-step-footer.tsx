export function FormStepFooter({ error, saving }: { error: string; saving: boolean }) {
  return (
    <div className="shrink-0 border-t border-[#F0F4EF] px-6 py-4">
      {error && (
        <p className="mb-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
          boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
        }}
      >
        {saving ? "Enregistrement…" : "Enregistrer la recette"}
      </button>
    </div>
  );
}
