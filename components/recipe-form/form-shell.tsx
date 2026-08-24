import { XIcon } from "@/components/icons";
import {
  MODAL_CLOSE_BTN_CLASS,
  MODAL_OVERLAY_CLASS,
  MODAL_PANEL_WIDE_CLASS,
} from "@/components/ui/modal-layout";

export function RecipeFormShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={MODAL_OVERLAY_CLASS}
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={MODAL_PANEL_WIDE_CLASS}
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0F4EF] px-6 py-5">
          <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
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
