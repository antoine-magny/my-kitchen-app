"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@/components/icons";
import { AddShoppingItemModal } from "@/components/courses/add-shopping-item-modal";
import { ShoppingItemRow } from "@/components/courses/shopping-item-row";
import { GroupedItemSection } from "@/components/ui/grouped-item-section";
import { transferCheckedShoppingItemsToFridge } from "@/lib/fridge";
import { groupByShoppingCategory } from "@/lib/shopping-categories";
import {
  clearCheckedShoppingItems,
  clearShoppingList,
  getShoppingList,
  peekExportBanner,
  removeShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
  addShoppingItem,
  type ShoppingItem,
  type ShoppingItemPatch,
} from "@/lib/shopping-list";

export default function CoursesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setItems(getShoppingList());
    setBanner(peekExportBanner());
    setReady(true);
  }, []);

  const remaining = useMemo(() => items.filter((i) => !i.isChecked).length, [items]);
  const checkedCount = items.length - remaining;
  const grouped = useMemo(() => groupByShoppingCategory(items), [items]);

  function handleToggle(id: string) {
    setItems(toggleShoppingItem(id));
  }

  function handleAddItem(item: Parameters<typeof addShoppingItem>[0]) {
    setItems(addShoppingItem(item));
    setIsAddModalOpen(false);
  }

  function handleRemove(id: string) {
    setItems(removeShoppingItem(id));
  }

  function handleUpdate(id: string, patch: ShoppingItemPatch) {
    setItems(updateShoppingItem(id, patch));
  }

  function handleClearChecked() {
    setItems(clearCheckedShoppingItems());
  }

  function handleTransferToFridge() {
    const { transferred } = transferCheckedShoppingItemsToFridge("fridge");
    setItems(getShoppingList());
    if (transferred > 0) {
      setBanner(
        transferred === 1
          ? "1 article transféré au frigo."
          : `${transferred} articles transférés au frigo.`,
      );
      router.push("/frigo");
    }
  }

  function handleClearAll() {
    setItems(clearShoppingList());
    setBanner(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
              Liste
            </p>
            <h1 className="font-lora text-2xl font-bold text-[#1C2B1E]">Courses</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
            }}
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Ajouter un article</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        {banner && (
          <div
            className="mt-4 rounded-2xl border border-[#C8E0CF] bg-[#EBF2EC] px-4 py-3"
            role="status"
          >
            <p className="text-sm font-semibold text-[#2E5C3A]">{banner}</p>
          </div>
        )}

        {!ready ? (
          <p className="mt-6 text-sm font-medium text-[#7A8F7D]">Chargement…</p>
        ) : items.length === 0 ? (
          <div
            className="mt-6 flex flex-col items-center rounded-3xl px-5 py-10 text-center"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
            }}
          >
            <p className="text-3xl" aria-hidden>
              🛒
            </p>
            <p className="font-lora mt-3 text-base font-bold text-[#1C2B1E]">Liste vide</p>
            <p className="mt-1.5 max-w-[250px] text-sm font-medium text-[#7A8F7D]">
              Exportez vos repas depuis le planning ou ajoutez un article manuellement.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#F0F4EF] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-colors hover:bg-[#E2EBE3]"
            >
              <PlusIcon size={16} />
              Ajouter un article
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#7A8F7D]">
                <span className="font-bold text-[#1C2B1E]">{remaining}</span> restant
                {remaining > 1 ? "s" : ""}
                {checkedCount > 0 ? ` · ${checkedCount} coché${checkedCount > 1 ? "s" : ""}` : ""}
              </p>
              <div className="flex items-center gap-2">
                {checkedCount > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleTransferToFridge}
                      className="rounded-xl bg-[#2E5B3E] px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#254A32]"
                    >
                      Au frigo
                    </button>
                    <button
                      type="button"
                      onClick={handleClearChecked}
                      className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
                    >
                      Vider cochés
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
                >
                  Tout effacer
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {grouped.map(({ category, items: sectionItems }) => (
                <GroupedItemSection key={category.id} id={category.id} title={category.title}>
                  {sectionItems.map((item, index) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      isLast={index === sectionItems.length - 1}
                      onToggle={handleToggle}
                      onRemove={handleRemove}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </GroupedItemSection>
              ))}
            </div>
          </>
        )}
      </div>

      <AddShoppingItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}
