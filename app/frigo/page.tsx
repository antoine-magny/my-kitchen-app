"use client";

import { useEffect, useMemo, useState } from "react";
import { AddModal } from "@/components/frigo/add-modal";
import { ClearAllModal } from "@/components/frigo/clear-all-modal";
import { EditDlcModal } from "@/components/frigo/edit-dlc-modal";
import { ExpiredModal } from "@/components/frigo/expired-modal";
import { FridgeEmptyState } from "@/components/frigo/fridge-empty-state";
import { FridgeHeader } from "@/components/frigo/fridge-header";
import { FridgeTabs } from "@/components/frigo/fridge-tabs";
import { FridgeToolbar } from "@/components/frigo/fridge-toolbar";
import { IngredientRow } from "@/components/frigo/ingredient-row";
import { GroupedItemSection } from "@/components/ui/grouped-item-section";
import { TABS, type Ingredient, type NewFridgeItem, type TabId } from "@/components/frigo/shared";
import { DLC_GROUPS, groupByDlcStatus, groupIdForItem, type DlcGroupId } from "@/lib/fridge-dlc-groups";
import { createFridgeItem, dlcStatus, getFridgeItems, setFridgeItems } from "@/lib/fridge";
import { describeIngredient, resolveStoredIngredientIcon } from "@/lib/ingredients";

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);
  const [clearGroupId, setClearGroupId] = useState<DlcGroupId | null>(null);
  const [showExpired, setShowExpired] = useState(false);
  const [editingDlcId, setEditingDlcId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(getFridgeItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setFridgeItems(items);
  }, [items, ready]);

  const tabItems = items.filter((i) => i.category === activeTab);
  const filtered = tabItems.filter((i) =>
    i.customName.toLowerCase().includes(query.toLowerCase()),
  );
  const editingItem = editingDlcId != null ? items.find((i) => i.id === editingDlcId) ?? null : null;
  const expiredItems = tabItems.filter((i) => dlcStatus(i.expirationDate) === "urgent");
  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  const grouped = useMemo(() => groupByDlcStatus(filtered), [filtered]);
  const clearGroup = clearGroupId ? (DLC_GROUPS.find((g) => g.id === clearGroupId) ?? null) : null;
  const clearGroupCount = clearGroupId
    ? tabItems.filter((i) => groupIdForItem(i.expirationDate) === clearGroupId).length
    : 0;

  const tabCounts = Object.fromEntries(
    TABS.map((tab) => [tab.id, items.filter((i) => i.category === tab.id).length]),
  ) as Record<TabId, number>;
  const urgentCounts = Object.fromEntries(
    TABS.map((tab) => [
      tab.id,
      items.filter((i) => i.category === tab.id && dlcStatus(i.expirationDate) === "urgent").length,
    ]),
  ) as Record<TabId, number>;
  const soonCount = (tab: TabId) =>
    items.filter((i) => {
      if (i.category !== tab) return false;
      const status = dlcStatus(i.expirationDate);
      return status === "urgent" || status === "soon";
    }).length;

  const handleChangeAmount = (id: string, amount: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, amount: Math.max(0, amount) } : i)),
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMove = (id: string, category: TabId) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, category } : i)));
    setActiveTab(category);
    setNewIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      setTimeout(() => {
        setNewIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }, 600);
      return s;
    });
  };

  const handleRename = (id: string, customName: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, customName } : i)));
  };

  const handleChangeUnit = (id: string, unit: Ingredient["unit"]) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unit } : i)));
  };

  const handleChangeIcon = (id: string, icon: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, icon: resolveStoredIngredientIcon(icon, describeIngredient(i.customName).icon) }
          : i,
      ),
    );
  };

  const handleUpdateDlc = (id: string, expirationDate: string | null) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i };
        if (expirationDate) next.expirationDate = expirationDate;
        else delete next.expirationDate;
        return next;
      }),
    );
  };

  const handleClearAll = () => {
    setItems((prev) => prev.filter((i) => i.category !== activeTab));
  };

  const handleClearGroup = (groupId: DlcGroupId) => {
    setItems((prev) =>
      prev.filter((i) => i.category !== activeTab || groupIdForItem(i.expirationDate) !== groupId),
    );
  };

  const handleAdd = (draft: NewFridgeItem) => {
    const item = createFridgeItem(draft);
    setItems((prev) => [...prev, item]);
    const id = item.id;
    setNewIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      setTimeout(() => {
        setNewIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        });
      }, 600);
      return s;
    });
    setActiveTab(draft.category);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <FridgeHeader onAdd={() => setShowModal(true)} />

        <FridgeTabs
          activeTab={activeTab}
          tabCounts={tabCounts}
          urgentCounts={urgentCounts}
          onSelect={(tab) => {
            setActiveTab(tab);
            setQuery("");
          }}
        />

        <div className="mt-4">
          <FridgeToolbar
            activeTab={activeTab}
            query={query}
            urgentCount={urgentCounts[activeTab]}
            soonCount={soonCount(activeTab)}
            onQueryChange={setQuery}
            onShowExpired={() => setShowExpired(true)}
          />

          {filtered.length === 0 ? (
            <div
              className="overflow-hidden rounded-3xl bg-white"
              style={{ boxShadow: "0 4px 20px rgba(74,124,89,0.09)" }}
            >
              <FridgeEmptyState
                activeTab={activeTab}
                query={query}
                onAdd={() => setShowModal(true)}
              />
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
                      onClick={() => setClearGroupId(group.id)}
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
                      onChangeAmount={handleChangeAmount}
                      onChangeUnit={handleChangeUnit}
                      onChangeIcon={handleChangeIcon}
                      onDelete={handleDelete}
                      onEditDlc={setEditingDlcId}
                      onMove={handleMove}
                      onRename={handleRename}
                      isNew={newIds.has(item.id)}
                    />
                  ))}
                </GroupedItemSection>
              ))}
            </div>
          )}

          {tabItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAll(true)}
              className="mt-4 flex w-full items-center justify-center rounded-3xl bg-white px-4 py-3.5 text-sm font-bold text-[#B91C1C] shadow-[0_4px_20px_rgba(74,124,89,0.09)] transition-colors hover:bg-[#FEF2F2] active:scale-[0.99]"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AddModal activeTab={activeTab} onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}

      {showClearAll && tabItems.length > 0 && (
        <ClearAllModal
          description={`Supprimer tous les éléments du ${activeTabLabel.toLowerCase()} ?`}
          itemCount={tabItems.length}
          onConfirm={handleClearAll}
          onClose={() => setShowClearAll(false)}
        />
      )}

      {clearGroup && clearGroupCount > 0 && (
        <ClearAllModal
          title="Vider la catégorie"
          description={
            clearGroup.id === "urgent"
              ? `Supprimer tous les éléments périmés du ${activeTabLabel.toLowerCase()} ?`
              : `Supprimer tous les éléments « ${clearGroup.title} » du ${activeTabLabel.toLowerCase()} ?`
          }
          itemCount={clearGroupCount}
          confirmLabel="Vider"
          onConfirm={() => handleClearGroup(clearGroup.id)}
          onClose={() => setClearGroupId(null)}
        />
      )}

      {showExpired && expiredItems.length > 0 && (
        <ExpiredModal
          items={expiredItems}
          tabLabel={activeTabLabel}
          onClose={() => setShowExpired(false)}
          onEditDlc={setEditingDlcId}
        />
      )}

      {editingItem && (
        <EditDlcModal
          item={editingItem}
          onSave={(dlc) => handleUpdateDlc(editingItem.id, dlc)}
          onClose={() => setEditingDlcId(null)}
        />
      )}
    </div>
  );
}
