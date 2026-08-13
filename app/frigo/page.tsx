"use client";

import { useEffect, useState } from "react";
import { AddModal } from "@/components/frigo/add-modal";
import { EditDlcModal } from "@/components/frigo/edit-dlc-modal";
import { ExpiredModal } from "@/components/frigo/expired-modal";
import { IngredientRow } from "@/components/frigo/ingredient-row";
import { TABS, type Ingredient, type TabId } from "@/components/frigo/shared";
import { CalendarIcon, PlusIcon, SearchIcon } from "@/components/icons";
import {
  dlcStatus,
  getFridgeItems,
  nextFridgeItemId,
  setFridgeItems,
} from "@/lib/fridge";

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [editingDlcId, setEditingDlcId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setItems(getFridgeItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setFridgeItems(items);
  }, [items, ready]);

  const tabItems = items.filter((i) => i.category === activeTab);
  const filtered = tabItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
  const editingItem = editingDlcId != null ? items.find((i) => i.id === editingDlcId) ?? null : null;
  const expiredItems = tabItems.filter((i) => dlcStatus(i.dlc) === "urgent");
  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  const priorityOrder = { urgent: 0, soon: 1, ok: 2, none: 3 };
  const sorted = [...filtered].sort(
    (a, b) => priorityOrder[dlcStatus(a.dlc)] - priorityOrder[dlcStatus(b.dlc)],
  );

  const urgentCount = (tab: TabId) =>
    items.filter((i) => i.category === tab && dlcStatus(i.dlc) === "urgent").length;
  const soonCount = (tab: TabId) =>
    items.filter((i) => i.category === tab && (dlcStatus(i.dlc) === "urgent" || dlcStatus(i.dlc) === "soon")).length;

  const handleAdjust = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)),
    );
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMove = (id: number, category: TabId) => {
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

  const handleRename = (id: number, name: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  };

  const handleUpdateDlc = (id: number, dlc: string | null) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, dlc } : i)));
  };

  const handleAdd = (item: Omit<Ingredient, "id">) => {
    const id = nextFridgeItemId(items);
    setItems((prev) => [...prev, { ...item, id }]);
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
    setActiveTab(item.category);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <main className="mx-auto flex min-h-screen max-w-md flex-col sm:max-w-2xl lg:max-w-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8EDE9] px-5 py-5 lg:px-8 lg:py-7">
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Inventaire</p>
            <h1 className="font-lora text-2xl leading-none font-bold text-[#1C2B1E] lg:text-3xl">
              Mon Frigo &amp; Placards
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
            }}
          >
            <PlusIcon size={14} />
            <span className="hidden sm:inline">Ajouter un ingrédient</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        <div className="flex shrink-0 items-end gap-0 border-b border-[#E8EDE9] px-5 lg:px-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const urgent = urgentCount(tab.id);
            const tabTotal = items.filter((i) => i.category === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                className="relative -mb-px flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all duration-200"
                style={{
                  color: isActive ? "#1C2B1E" : "#7A8F7D",
                  borderBottom: isActive ? "2px solid #1C2B1E" : "2px solid transparent",
                }}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
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

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 lg:px-8">
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
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Rechercher dans les ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}…`}
                  className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
                />
              </div>

              {soonCount(activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (urgentCount(activeTab) > 0) setShowExpired(true);
                  }}
                  disabled={urgentCount(activeTab) === 0}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all ${
                    urgentCount(activeTab) > 0
                      ? "border-[#FECACA] bg-[#FEF2F2] active:scale-95 hover:bg-[#FEE2E2]"
                      : "cursor-default border-[#FED7AA] bg-[#FFF7ED]"
                  }`}
                  aria-label={
                    urgentCount(activeTab) > 0
                      ? `Voir les ${urgentCount(activeTab)} ingrédient${urgentCount(activeTab) > 1 ? "s" : ""} expiré${urgentCount(activeTab) > 1 ? "s" : ""}`
                      : undefined
                  }
                >
                  <CalendarIcon size={14} />
                  <span
                    className={`text-xs font-bold ${
                      urgentCount(activeTab) > 0 ? "text-[#DC2626]" : "text-[#C2410C]"
                    }`}
                  >
                    {urgentCount(activeTab) > 0
                      ? `${urgentCount(activeTab)} expiré${urgentCount(activeTab) > 1 ? "s" : ""}`
                      : `${soonCount(activeTab)} bientôt`}
                  </span>
                </button>
              )}
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white"
              style={{ boxShadow: "0 1px 12px rgba(28,43,30,0.06)" }}
            >
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <div className="mb-4 text-5xl">
                    {activeTab === "fridge" ? "🧊" : activeTab === "freezer" ? "❄️" : "🏺"}
                  </div>
                  <p className="font-lora mb-1 text-base font-bold text-[#1C2B1E]">
                    {query ? "Aucun résultat" : "C'est vide ici !"}
                  </p>
                  <p className="text-sm font-medium text-[#7A8F7D]">
                    {query ? "Essayez un autre mot-clé" : "Ajoutez votre premier ingrédient"}
                  </p>
                  {!query && (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
                    >
                      <PlusIcon size={13} /> Ajouter un ingrédient
                    </button>
                  )}
                </div>
              ) : (
                sorted.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <div className="ml-14 h-px bg-[#F0F4EF]" />}
                    <IngredientRow
                      item={item}
                      onAdjust={handleAdjust}
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

            {sorted.length > 0 && (
              <div className="mt-4 flex items-center gap-5 px-1">
                {[
                  { dot: "#EF4444", label: "Urgent / Périmé" },
                  { dot: "#F97316", label: "Dans les 3 jours" },
                  { dot: "#9CA3AF", label: "OK" },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-medium text-[#9CA3AF]">{label}</span>
                  </div>
                ))}
              </div>
            )}
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
