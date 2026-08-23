"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, TrashIcon, PlusIcon } from "@/components/icons";
import { UnitSelect } from "@/components/ui/unit-select";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { AddShoppingItemModal } from "@/components/courses/add-shopping-item-modal";
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
import { coerceUnitCode } from "@/lib/units";

const inputNameClass =
  "w-full bg-transparent text-sm font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const inputAmountClass =
  "w-16 shrink-0 bg-transparent text-xs font-medium text-[#7A8F7D] outline-none rounded-lg px-1.5 py-0.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const unitSelectClass =
  "min-w-0 max-w-[7.5rem] truncate rounded-lg border border-transparent bg-transparent py-0.5 px-1.5 text-xs font-semibold text-[#7A8F7D] outline-none transition-colors hover:bg-[#F0F4EF] hover:text-[#1C2B1E] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF] cursor-pointer text-left";

function ShoppingItemRow({
  item,
  isLast,
  onToggle,
  onRemove,
  onUpdate,
}: {
  item: ShoppingItem;
  isLast: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: ShoppingItemPatch) => void;
}) {
  const [nameDraft, setNameDraft] = useState(item.customName);
  const [amountDraft, setAmountDraft] = useState(String(item.amount));

  useEffect(() => {
    setNameDraft(item.customName);
  }, [item.customName]);

  useEffect(() => {
    setAmountDraft(String(item.amount));
  }, [item.amount]);

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(item.customName);
      return;
    }
    if (trimmed !== item.customName) onUpdate(item.id, { customName: trimmed });
  }

  function commitAmount() {
    const raw = amountDraft.trim().replace(",", ".");
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) {
      setAmountDraft(String(item.amount));
      return;
    }
    if (amount !== item.amount) onUpdate(item.id, { amount });
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid #F0F4EF",
        opacity: item.isChecked ? 0.55 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95"
        style={{
          background: item.isChecked ? "#4A7C59" : "#F0F4EF",
          color: item.isChecked ? "#fff" : "transparent",
          border: item.isChecked ? "none" : "1.5px solid #C8E0CF",
        }}
        aria-label={item.isChecked ? `Décocher ${item.customName}` : `Cocher ${item.customName}`}
        aria-pressed={item.isChecked}
      >
        <CheckIcon size={14} />
      </button>

      <EmojiPickerPopover
        size="sm"
        currentIcon={item.icon}
        onSelectIcon={(newIcon) => {
          onUpdate(item.id, { icon: newIcon });
        }}
      />

      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setNameDraft(item.customName);
              e.currentTarget.blur();
            }
          }}
          className={`${inputNameClass} ${item.isChecked ? "line-through" : ""}`}
          aria-label={`Nom de ${item.customName}`}
        />
        <div className="mt-0.5 flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={amountDraft}
            onChange={(e) => setAmountDraft(e.target.value)}
            onBlur={commitAmount}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setAmountDraft(String(item.amount));
                e.currentTarget.blur();
              }
            }}
            placeholder="Qté"
            className={inputAmountClass}
            aria-label={`Quantité de ${item.customName}`}
          />
          <UnitSelect
            compact
            value={item.unit}
            ingredientName={item.customName}
            onChange={(unit) => {
              const next = coerceUnitCode(unit);
              if (next && next !== item.unit) onUpdate(item.id, { unit: next });
            }}
            className={unitSelectClass}
            aria-label={`Unité de ${item.customName}`}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] active:scale-95"
        aria-label={`Supprimer ${item.customName}`}
      >
        <TrashIcon size={14} />
      </button>
    </div>
  );
}

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
                <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                  <h2
                    id={`cat-${category.id}`}
                    className="mb-2 px-1 text-sm font-bold text-[#1C2B1E]"
                  >
                    {category.title}
                  </h2>
                  <div
                    className="overflow-hidden rounded-3xl"
                    style={{
                      background: "#FFFFFF",
                      boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
                    }}
                  >
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
                  </div>
                </section>
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
