import { TABS, type TabId } from "@/components/frigo/shared";

export function FridgeTabs({
  activeTab,
  tabCounts,
  urgentCounts,
  onSelect,
}: {
  activeTab: TabId;
  tabCounts: Record<TabId, number>;
  urgentCounts: Record<TabId, number>;
  onSelect: (tab: TabId) => void;
}) {
  return (
    <div className="flex shrink-0 items-end gap-0 border-b border-[#E8EDE9] px-5 lg:px-8">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const urgent = urgentCounts[tab.id];
        const tabTotal = tabCounts[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="relative -mb-px flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all duration-200"
            style={{
              color: isActive ? "#1C2B1E" : "#7A8F7D",
              borderBottom: isActive ? "2px solid #1C2B1E" : "2px solid transparent",
            }}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className="rounded-md px-1.5 py-0.5 text-xs font-semibold"
              style={{
                background: isActive ? "#EBF2EC" : "#F0F4EF",
                color: isActive ? "#4A7C59" : "#9CA3AF",
              }}
            >
              {tabTotal}
            </span>
            {urgent > 0 && (
              <span
                className="absolute top-2 right-1 h-2 w-2 rounded-full bg-[#EF4444]"
                title={`${urgent} expiré(s)`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
