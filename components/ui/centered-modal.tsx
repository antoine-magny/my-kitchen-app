"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MODAL_CENTERED_OVERLAY_CLASS,
  MODAL_PANEL_CLASS,
} from "@/components/ui/modal-layout";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";

export function CenteredModal({
  titleId,
  onClose,
  children,
  maxWidthClass = "max-w-[400px]",
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
    >
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`${MODAL_PANEL_CLASS} mx-auto ${maxWidthClass}`}
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
