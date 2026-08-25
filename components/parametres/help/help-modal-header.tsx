"use client";

import { HelpCircleIcon, XIcon } from "@/components/icons";

type HelpModalHeaderProps = {
  activeTab: "faq" | "contact";
  onTabChange: (tab: "faq" | "contact") => void;
  onClose: () => void;
};

export function HelpModalHeader({
  activeTab,
  onTabChange,
  onClose,
}: HelpModalHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2EC] text-[#4A7C59]">
            <HelpCircleIcon size={20} />
          </div>
          <div>
            <h2 id="help-support-modal-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
              Aide &amp; Support
            </h2>
            <p className="mt-0.5 text-xs text-[#7A8F7D]">
              Guides, réponses à vos questions et assistance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E] cursor-pointer"
          aria-label="Fermer"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex rounded-2xl bg-[#F0F4EF] p-1">
        <button
          type="button"
          onClick={() => onTabChange("faq")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "faq"
              ? "bg-white text-[#2E5C3A] shadow-sm"
              : "text-[#7A8F7D] hover:text-[#1C2B1E]"
          }`}
        >
          📚 Guides &amp; FAQ
        </button>
        <button
          type="button"
          onClick={() => onTabChange("contact")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "contact"
              ? "bg-white text-[#2E5C3A] shadow-sm"
              : "text-[#7A8F7D] hover:text-[#1C2B1E]"
          }`}
        >
          ✉️ Nous contacter
        </button>
      </div>
    </div>
  );
}
