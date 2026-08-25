"use client";

import { FridgeEmptyState } from "@/components/frigo/fridge-empty-state";
import { IngredientRow } from "@/components/frigo/ingredient-row";
import type { Ingredient, TabId } from "@/components/frigo/shared";
import { GroupedItemSection } from "@/components/ui/grouped-item-section";
import { type DlcGroup, type DlcGroupId } from "@/lib/fridge-dlc-groups";

type FridgeListProps = {
  filtered: Ingredient[];
  grouped: { group: DlcGroup; items: Ingredient[] }[];
  query: string;
  activeTab: TabId;
  activeTabLabel: string;
  tabItemsCount: number;
  newIds: Set<string>;
  onAdd: () => void;
  onClearGroup: (groupId: DlcGroupId) => void;
  onClearAll: () => void;
  onChangeAmount: (id: string, amount: number) => void;
  onChangeUnit: (id: string, unit: Ingredient["unit"]) => void;
  onChangeIcon: (id: string, icon: string) => void;
  onDelete: (id: string) => void;
  onEditDlc: (id: string) => void;
  onMove: (id: string, category: TabId) => void;
  onRename: (id: string, customName: string) => void;
};

export function FridgeList({
  filtered,
  grouped,
  query,
  activeTab,
  activeTabLabel,
  tabItemsCount,
  newIds,
  onAdd,
  onClearGroup,
  onClearAll,
  onChangeAmount,
  onChangeUnit,
  onChangeIcon,
  onDelete,
  onEditDlc,
  onMove,
  onRename,
}: FridgeListProps) {
  return (
    <>
      {filtered.length === 0 ? (
        <div
          className="overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
        >
          <FridgeEmptyState activeTab={activeTab} query={query} onAdd={onAdd} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(({ group, items: sectionItems }) => (
            <GroupedItemSection
              key={group.id}
              id={group.id}
              title={group.title}
              dot={group.dot}
              action={
                <button
                  type="button"
                  onClick={() => onClearGroup(group.id)}
                  className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
                  aria-label={
                    group.id === "urgent"
                      ? `Vider les éléments périmés du ${activeTabLabel.toLowerCase()}`
                      : `Vider ${group.title}`
                  }
                >
                  Vider
                </button>
              }
            >
              {sectionItems.map((item, idx) => (
                <IngredientRow
                  key={item.id}
                  item={item}
                  isLast={idx === sectionItems.length - 1}
                  onChangeAmount={onChangeAmount}
                  onChangeUnit={onChangeUnit}
                  onChangeIcon={onChangeIcon}
                  onDelete={onDelete}
                  onEditDlc={onEditDlc}
                  onMove={onMove}
                  onRename={onRename}
                  isNew={newIds.has(item.id)}
                />
              ))}
            </GroupedItemSection>
          ))}
        </div>
      )}

      {tabItemsCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="mt-4 flex w-full items-center justify-center rounded-3xl bg-white px-4 py-3.5 text-sm font-bold text-[#B91C1C] shadow-[0_4px_20px_rgba(74,124,89,0.09)] transition-colors hover:bg-[#FEF2F2] active:scale-[0.99]"
        >
          Tout effacer
        </button>
      )}
    </>
  );
}
