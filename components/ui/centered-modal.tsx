"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MODAL_CENTERED_OVERLAY_CLASS,
  MODAL_PANEL_BASE_CLASS,
} from "@/components/ui/modal-layout";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";

export function CenteredModal({
  titleId,
  onClose,
  children,
  maxWidthClass = "max-w-md",
}: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}) {
  useLockBodyScroll();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className={MODAL_CENTERED_OVERLAY_CLASS}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${MODAL_PANEL_BASE_CLASS} mx-auto ${maxWidthClass}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
