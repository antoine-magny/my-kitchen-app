"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "🏠", label: "Accueil", href: "/" },
  { icon: "📖", label: "Recettes", href: "/recettes" },
  { icon: "📅", label: "Planning", href: "/planning" },
  { icon: "🧊", label: "Frigo", href: "/frigo" },
  { icon: "🛒", label: "Courses", href: "/courses" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center gap-1 px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid #E2EBE3",
        boxShadow: "0 -4px 24px rgba(74,124,89,0.08)",
      }}
      aria-label="Navigation principale"
    >
      <Link
        href="/parametres"
        className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white transition-transform active:scale-95"
        style={{
          background: "#1C2B1E",
          boxShadow: isActive("/parametres") ? "0 0 0 2.5px #4A7C59" : "none",
        }}
        aria-label="Profil et paramètres"
        aria-current={isActive("/parametres") ? "page" : undefined}
      >
        A
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1 transition-all"
              aria-current={active ? "page" : undefined}
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <span
                className={`text-xs font-semibold ${active ? "text-[#4A7C59]" : "text-[#7A8F7D]"}`}
              >
                {item.label}
              </span>
              <div
                className={`mt-0.5 h-1 w-1 rounded-full ${active ? "bg-[#4A7C59]" : "bg-transparent"}`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
