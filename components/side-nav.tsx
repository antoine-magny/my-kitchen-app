"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  CalendarIcon,
  CartIcon,
  FridgeIcon,
  HomeIcon,
} from "@/components/icons";
import { isNavActive, NAV_ITEMS } from "@/components/nav-config";
import { createClient } from "@/lib/supabase/client";
import { initialFromName, resolveUserFirstName } from "@/lib/user-name";

const NAV_ICONS = {
  "/": HomeIcon,
  "/recettes": BookIcon,
  "/planning": CalendarIcon,
  "/frigo": FridgeIcon,
  "/courses": CartIcon,
} as const;

export function SideNav() {
  const pathname = usePathname();
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      setInitial(initialFromName(await resolveUserFirstName(supabase, user)));
    });
  }, []);

  const settingsActive = isNavActive(pathname, "/parametres");

  return (
    <nav
      className="fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar-width)] flex-col lg:flex"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid #E2EBE3",
        boxShadow: "4px 0 24px rgba(74,124,89,0.08)",
      }}
      aria-label="Navigation principale"
    >
      <div className="px-5 pt-8 pb-6">
        <Link href="/" className="font-lora text-xl font-bold text-[#1C2B1E]">
          My Kitchen
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = NAV_ICONS[item.href];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#EBF2EC] text-[#4A7C59]"
                  : "text-[#7A8F7D] hover:bg-[#F6F8F3] hover:text-[#1C2B1E]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 2} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-6">
        <Link
          href="/parametres"
          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            settingsActive
              ? "bg-[#EBF2EC] text-[#4A7C59]"
              : "text-[#7A8F7D] hover:bg-[#F6F8F3] hover:text-[#1C2B1E]"
          }`}
          aria-label="Profil et paramètres"
          aria-current={settingsActive ? "page" : undefined}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{
              background: "#1C2B1E",
              boxShadow: settingsActive ? "0 0 0 2.5px #4A7C59" : "none",
            }}
          >
            {initial}
          </span>
          Paramètres
        </Link>
      </div>
    </nav>
  );
}
