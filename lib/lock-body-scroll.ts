import { useEffect } from "react";

/** Bloque le scroll du document le temps qu’une modale est ouverte. */
export function useLockBodyScroll() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}
