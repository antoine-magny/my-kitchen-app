"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddShoppingItemModal } from "@/components/courses/add-shopping-item-modal";
import {
  CoursesActions,
  CoursesBanner,
  CoursesEmpty,
  CoursesHeader,
} from "@/components/courses/courses-chrome";
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
      <div className="mx-auto max-w-md px-5 pt-10 pb-28 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:pb-10">
        <CoursesHeader onAdd={() => setIsAddModalOpen(true)} />

        {banner && <CoursesBanner banner={banner} />}

        {!ready ? (
          <p className="mt-6 text-sm font-medium text-[#7A8F7D]">Chargement…</p>
        ) : items.length === 0 ? (
          <CoursesEmpty onAdd={() => setIsAddModalOpen(true)} />
        ) : (
          <>
            <CoursesActions
              remaining={remaining}
              checkedCount={checkedCount}
              onTransferToFridge={handleTransferToFridge}
              onClearChecked={handleClearChecked}
              onClearAll={handleClearAll}
            />

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
