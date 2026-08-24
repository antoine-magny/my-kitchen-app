import { TABS, type TabId } from "@/components/frigo/shared";

const SHORT_LABELS: Record<TabId, string> = {
  fridge: "Frigo",
  freezer: "Congél.",
  pantry: "Placard",
};

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
    <div className="mt-3 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-end border-b border-[#E8EDE9]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const urgent = urgentCounts[tab.id];
          const tabTotal = tabCounts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              className="relative -mb-px flex min-h-11 shrink-0 items-center justify-center gap-1 px-3 py-2.5 text-[11px] font-bold whitespace-nowrap transition-all duration-200 sm:gap-1.5 sm:px-4 sm:text-xs"
              style={{
                color: isActive ? "#1C2B1E" : "#7A8F7D",
                borderBottom: isActive ? "2px solid #1C2B1E" : "2px solid transparent",
              }}
            >
              <span className="text-sm leading-none">{tab.icon}</span>
              <span>{SHORT_LABELS[tab.id]}</span>
              <span
                className="shrink-0 rounded-md px-1 py-px text-[10px] font-semibold"
                style={{
                  background: isActive ? "#EBF2EC" : "#F0F4EF",
                  color: isActive ? "#4A7C59" : "#9CA3AF",
                }}
              >
                {tabTotal}
              </span>
              {urgent > 0 && (
                <span
                  className="absolute top-1.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]"
                  title={`${urgent} expiré(s)`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
