import { CalendarIcon, SearchIcon } from "@/components/icons";
import { TABS, type TabId } from "@/components/frigo/shared";

export function FridgeToolbar({
  activeTab,
  query,
  urgentCount,
  soonCount,
  onQueryChange,
  onShowExpired,
}: {
  activeTab: TabId;
  query: string;
  urgentCount: number;
  soonCount: number;
  onQueryChange: (value: string) => void;
  onShowExpired: () => void;
}) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div
        className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
        style={{ background: "#FFFFFF", border: "1.5px solid #E2EBE3" }}
      >
        <span className="shrink-0 text-[#9CA3AF]">
          <SearchIcon size={15} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Rechercher dans les ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}…`}
          className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
        />
      </div>

      {soonCount > 0 && (
        <button
          type="button"
          onClick={() => {
            if (urgentCount > 0) onShowExpired();
          }}
          disabled={urgentCount === 0}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all ${
            urgentCount > 0
              ? "border-[#FECACA] bg-[#FEF2F2] active:scale-95 hover:bg-[#FEE2E2]"
              : "cursor-default border-[#FED7AA] bg-[#FFF7ED]"
          }`}
          aria-label={
            urgentCount > 0
              ? `Voir les ${urgentCount} ingrédient${urgentCount > 1 ? "s" : ""} expiré${urgentCount > 1 ? "s" : ""}`
              : undefined
          }
        >
          <CalendarIcon size={14} />
          <span
            className={`text-xs font-bold ${
              urgentCount > 0 ? "text-[#DC2626]" : "text-[#C2410C]"
            }`}
          >
            {urgentCount > 0
              ? `${urgentCount} expiré${urgentCount > 1 ? "s" : ""}`
              : `${soonCount} bientôt`}
          </span>
        </button>
      )}
    </div>
  );
}
