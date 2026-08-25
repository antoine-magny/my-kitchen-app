"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Ferme un popover au clic extérieur, Escape, scroll hors panneau, ou resize. */
export function usePopoverDismiss({
  isOpen,
  onClose,
  triggerRef,
  popoverRef,
  closeOnEscape = true,
  restoreFocus = false,
  ignoreScrollInside = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  restoreFocus?: boolean;
  ignoreScrollInside?: boolean;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      onCloseRef.current();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!closeOnEscape || event.key !== "Escape") return;
      onCloseRef.current();
      if (restoreFocus) triggerRef.current?.focus();
    }

    function handleScroll(event: Event) {
      if (ignoreScrollInside && popoverRef.current?.contains(event.target as Node)) return;
      onCloseRef.current();
    }

    const handleResize = () => onCloseRef.current();

    document.addEventListener("mousedown", handleClickOutside);
    if (closeOnEscape) document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeOnEscape) document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, triggerRef, popoverRef, closeOnEscape, restoreFocus, ignoreScrollInside]);
}
