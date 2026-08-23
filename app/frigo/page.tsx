"use client";

import { useEffect, useState } from "react";
import { AddModal } from "@/components/frigo/add-modal";
import { EditDlcModal } from "@/components/frigo/edit-dlc-modal";
import { ExpiredModal } from "@/components/frigo/expired-modal";
import { FridgeEmptyState } from "@/components/frigo/fridge-empty-state";
import { FridgeHeader } from "@/components/frigo/fridge-header";
import { FridgeLegend } from "@/components/frigo/fridge-legend";
import { FridgeTabs } from "@/components/frigo/fridge-tabs";
import { FridgeToolbar } from "@/components/frigo/fridge-toolbar";
import { IngredientRow } from "@/components/frigo/ingredient-row";
import { TABS, type Ingredient, type NewFridgeItem, type TabId } from "@/components/frigo/shared";
import { createFridgeItem, dlcStatus, getFridgeItems, setFridgeItems } from "@/lib/fridge";

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const priorityOrder = { urgent: 0, soon: 1, ok: 2, none: 3 };
  const sorted = [...filtered].sort(
    (a, b) =>
      priorityOrder[dlcStatus(a.expirationDate)] - priorityOrder[dlcStatus(b.expirationDate)],
  );

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

  const handleAdjust = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, amount: Math.max(0, i.amount + delta) } : i)),
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
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, icon } : i)));
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col sm:max-w-2xl lg:max-w-3xl">
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

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 lg:px-8">
            <FridgeToolbar
              activeTab={activeTab}
              query={query}
              urgentCount={urgentCounts[activeTab]}
              soonCount={soonCount(activeTab)}
              onQueryChange={setQuery}
              onShowExpired={() => setShowExpired(true)}
            />

            <div
              className="overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white"
              style={{ boxShadow: "0 1px 12px rgba(28,43,30,0.06)" }}
            >
              {sorted.length === 0 ? (
                <FridgeEmptyState
                  activeTab={activeTab}
                  query={query}
                  onAdd={() => setShowModal(true)}
                />
              ) : (
                sorted.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <div className="ml-14 h-px bg-[#F0F4EF]" />}
                    <IngredientRow
                      item={item}
                      onAdjust={handleAdjust}
                      onChangeUnit={handleChangeUnit}
                      onChangeIcon={handleChangeIcon}
                      onDelete={handleDelete}
                      onEditDlc={setEditingDlcId}
                      onMove={handleMove}
                      onRename={handleRename}
                      isNew={newIds.has(item.id)}
                    />
                  </div>
                ))
              )}
            </div>

            {sorted.length > 0 && <FridgeLegend />}
          </div>
        </div>
      </main>

      {showModal && (
        <AddModal activeTab={activeTab} onAdd={handleAdd} onClose={() => setShowModal(false)} />
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
