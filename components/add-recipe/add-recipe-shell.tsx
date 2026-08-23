import { XIcon } from "@/components/icons";

export function AddRecipeShell({
  heading,
  showBack,
  closeDisabled,
  onBack,
  onClose,
  children,
}: {
  heading: string;
  showBack: boolean;
  closeDisabled: boolean;
  onBack: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 bottom-20 z-[60] flex items-end justify-center sm:inset-0 sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div
        className="scale-in flex max-h-full w-full flex-col rounded-t-3xl sm:max-h-[92vh] sm:w-auto sm:min-w-[520px] sm:max-w-xl sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={onBack}
                className="mr-1 rounded-lg px-2 py-1 text-xs font-bold text-[#4A7C59] hover:bg-[#EBF2EC]"
              >
                ← Retour
              </button>
            )}
            <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">{heading}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF] disabled:opacity-40"
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
