"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function FridgeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="5" y1="10" x2="19" y2="10" />
      <line x1="10" y1="7" x2="10" y2="10" />
      <line x1="10" y1="14" x2="10" y2="18" />
    </svg>
  );
}

function CartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function TipIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const NAV = [
  { label: "Accueil", href: "/", Icon: HomeIcon },
  { label: "Recettes", href: "/recettes", Icon: BookIcon },
  { label: "Frigo", href: "/frigo", Icon: FridgeIcon },
  { label: "Courses", href: null, Icon: CartIcon },
  { label: "Astuces", href: null, Icon: TipIcon },
] as const;

interface AppSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="border-b px-6 pt-8 pb-6" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A7C59] text-lg">🍃</div>
          <div>
            <p className="font-lora text-base leading-tight font-extrabold text-white">Cucina</p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: "rgba(255,255,255,0.38)" }}>
              Ma cuisine
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        {NAV.map(({ label, href, Icon }) => {
          const active = isActive(href);
          const className =
            "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200";
          const style = {
            background: active ? "#4A7C59" : "transparent",
            color: active ? "#FFF" : "rgba(255,255,255,0.50)",
          };

          if (href) {
            return (
              <Link key={label} href={href} onClick={onClose} className={className} style={style}>
                <Icon active={active} />
                {label}
              </Link>
            );
          }

          return (
            <button key={label} type="button" className={className} style={style} disabled>
              <Icon active={false} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 pb-7">
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Antoine</p>
            <p className="truncate text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Pro · 42 recettes
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppSidebar({ isMobile, onClose }: AppSidebarProps) {
  if (isMobile) {
    return (
      <aside
        className="fixed top-0 left-0 z-40 flex h-full flex-col"
        style={{ width: 220, background: "#141F16", minHeight: "100vh" }}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    );
  }

  return (
    <aside className="hidden min-h-screen flex-col lg:flex" style={{ width: 220, background: "#141F16" }}>
      <SidebarContent />
    </aside>
  );
}

export function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
