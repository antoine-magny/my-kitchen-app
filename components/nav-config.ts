export const NAV_ITEMS = [
  { emoji: "🏠", label: "Accueil", href: "/" },
  { emoji: "📖", label: "Recettes", href: "/recettes" },
  { emoji: "📅", label: "Planning", href: "/planning" },
  { emoji: "🧊", label: "Frigo", href: "/frigo" },
  { emoji: "🛒", label: "Courses", href: "/courses" },
] as const;

export function isAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/nouveau-mot-de-passe") ||
    pathname.startsWith("/auth")
  );
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
