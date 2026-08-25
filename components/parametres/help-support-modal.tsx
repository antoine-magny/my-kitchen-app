"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CenteredModal } from "@/components/ui/centered-modal";
import { type FaqCategory, searchFaqItems } from "@/lib/help-data";
import { HelpContactForm } from "./help/help-contact-form";
import { HelpFaqAccordion } from "./help/help-faq-accordion";
import { HelpFaqSearch } from "./help/help-faq-search";
import { HelpModalHeader } from "./help/help-modal-header";
import { HelpQuickGuides } from "./help/help-quick-guides";
import { HelpSystemInfo } from "./help/help-system-info";

export type HelpSupportModalProps = {
  onClose: () => void;
  initialTab?: "faq" | "contact";
  userEmail?: string;
};

export function HelpSupportModal({
  onClose,
  initialTab = "faq",
  userEmail = "",
}: HelpSupportModalProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "contact">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
  const router = useRouter();

  const filteredFaqItems = useMemo(() => {
    return searchFaqItems(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <CenteredModal
      titleId="help-support-modal-title"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="p-5 sm:p-6">
        <HelpModalHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        {/* Corps de la modale */}
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          {activeTab === "faq" ? (
            <div className="flex flex-col gap-5">
              {!searchQuery && selectedCategory === "all" && (
                <HelpQuickGuides onNavigate={handleNavigate} />
              )}

              <HelpFaqSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                totalResults={filteredFaqItems.length}
              />

              <HelpFaqAccordion
                items={filteredFaqItems}
                searchQuery={searchQuery}
                onResetFilters={handleResetFilters}
              />
            </div>
          ) : (
            <HelpContactForm userEmail={userEmail} onClose={onClose} />
          )}
        </div>

        {/* Footer système */}
        <div className="mt-5">
          <HelpSystemInfo />
        </div>
      </div>
    </CenteredModal>
  );
}
