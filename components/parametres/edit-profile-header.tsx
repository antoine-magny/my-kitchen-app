import { XIcon } from "@/components/icons";
import { initialFromName } from "@/lib/user-name";

export function EditProfileHeader({
  displayName,
  loading,
  onClose,
}: {
  displayName: string;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5 bg-white">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
          aria-hidden
        >
          {initialFromName(displayName || "?")}
        </div>
        <div>
          <h2 id="edit-profile-title" className="font-lora text-lg font-bold text-[#1C2B1E] leading-tight">
            Modifier mon profil
          </h2>
          <p className="text-xs font-medium text-[#7A8F7D]">
            Informations &amp; sécurité du compte
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] hover:text-[#1C2B1E] disabled:opacity-40"
        aria-label="Fermer la fenêtre"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
}
