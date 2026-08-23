import { SpinnerIcon } from "@/components/icons";

export function EditProfileActions({
  loading,
  successInfo,
  onClose,
}: {
  loading: boolean;
  successInfo: string | null;
  onClose: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-[#F0F4EF] px-6 py-4 bg-[#FAFBF9]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 rounded-2xl border border-[#E2EBE3] bg-white py-3.5 text-sm font-bold text-[#5A6B5C] transition-all hover:bg-[#F0F4EF] active:scale-[0.98] disabled:opacity-50 shadow-sm"
        >
          {successInfo ? "Fermer" : "Annuler"}
        </button>
        {!successInfo && (
          <button
            type="submit"
            disabled={loading}
            className="flex-[1.4] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 16px rgba(74,124,89,0.25)",
            }}
          >
            {loading ? (
              <>
                <SpinnerIcon size={16} />
                <span>Enregistrement...</span>
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
