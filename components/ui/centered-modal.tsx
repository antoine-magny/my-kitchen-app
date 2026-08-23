"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/lib/lock-body-scroll";

export function CenteredModal({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
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
      className="fixed inset-0 z-[100] grid place-items-center px-4"
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
        className="scale-in relative mx-auto flex max-h-[90vh] w-full max-w-[400px] flex-col overflow-hidden rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
