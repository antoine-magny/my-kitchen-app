import { XIcon } from "@/components/icons";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_CLASS,
  MODAL_PANEL_WIDE_CLASS,
} from "@/components/ui/modal-layout";

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
      className={MODAL_OVERLAY_CLASS}
      onClick={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div className={MODAL_PANEL_WIDE_CLASS}>
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
            className={MODAL_CLOSE_BTN_CLASS}
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
