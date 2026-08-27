import { InlineScript } from "@/components/ui/inline-script";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// Doit rester cohérent avec lib/theme.ts (getInitialTheme/applyTheme).
const THEME_INIT_HTML = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export function ThemeInitScript() {
  return <InlineScript html={THEME_INIT_HTML} />;
}
