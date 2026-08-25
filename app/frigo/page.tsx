"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { FridgeHeader } from "@/components/frigo/fridge-header";
import { FridgeList } from "@/components/frigo/fridge-list";
import { FridgeModals } from "@/components/frigo/fridge-modals";
import { FridgeTabs } from "@/components/frigo/fridge-tabs";
import { FridgeToolbar } from "@/components/frigo/fridge-toolbar";
import { TABS, type Ingredient, type NewFridgeItem, type TabId } from "@/components/frigo/shared";
import { groupByDlcStatus, groupIdForItem, type DlcGroupId } from "@/lib/fridge-dlc-groups";
import { createFridgeItem, dlcStatus, getFridgeItems, setFridgeItems } from "@/lib/fridge";
import { describeIngredient, resolveStoredIngredientIcon } from "@/lib/ingredients";

function flashNewId(setNewIds: Dispatch<SetStateAction<Set<string>>>, id: string) {
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
}

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);
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
    flashNewId(setNewIds, id);
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
    flashNewId(setNewIds, item.id);
    setActiveTab(draft.category);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:pb-10">
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

          <FridgeList
            filtered={filtered}
            grouped={grouped}
            query={query}
            activeTab={activeTab}
            activeTabLabel={activeTabLabel}
            tabItemsCount={tabItems.length}
            newIds={newIds}
            onAdd={() => setShowModal(true)}
            onClearGroup={handleClearGroup}
            onClearAll={() => setShowClearAll(true)}
            onChangeAmount={handleChangeAmount}
            onChangeUnit={handleChangeUnit}
            onChangeIcon={handleChangeIcon}
            onDelete={handleDelete}
            onEditDlc={setEditingDlcId}
            onMove={handleMove}
            onRename={handleRename}
          />
        </div>
      </div>

      <FridgeModals
        showModal={showModal}
        showClearAll={showClearAll}
        showExpired={showExpired}
        editingItem={editingItem}
        activeTab={activeTab}
        activeTabLabel={activeTabLabel}
        tabItemsCount={tabItems.length}
        expiredItems={expiredItems}
        onAdd={handleAdd}
        onCloseModal={() => setShowModal(false)}
        onConfirmClearAll={handleClearAll}
        onCloseClearAll={() => setShowClearAll(false)}
        onCloseExpired={() => setShowExpired(false)}
        onEditDlc={setEditingDlcId}
        onSaveDlc={(dlc) => editingItem && handleUpdateDlc(editingItem.id, dlc)}
        onCloseDlc={() => setEditingDlcId(null)}
      />
    </div>
  );
}
