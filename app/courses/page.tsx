"use client";

import { useEffect, useMemo, useState } from "react";
import { groupByShoppingCategory } from "@/lib/shopping-categories";
import {
  clearCheckedShoppingItems,
  clearShoppingList,
  getShoppingList,
  peekExportBanner,
  removeShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
  type ShoppingListItem,
} from "@/lib/shopping-list";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

const inputNameClass =
  "w-full bg-transparent text-sm font-bold text-[#1C2B1E] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";
const inputAmountClass =
  "mt-0.5 w-full bg-transparent text-xs font-medium text-[#7A8F7D] outline-none rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-[#F0F4EF] focus:bg-[#F0F4EF] focus:ring-2 focus:ring-[#C8E0CF]";

function ShoppingItemRow({
  item,
  isLast,
  onToggle,
  onRemove,
  onUpdate,
}: {
  item: ShoppingListItem;
  isLast: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<ShoppingListItem, "name" | "amount">>) => void;
}) {
  const [nameDraft, setNameDraft] = useState(item.name);
  const [amountDraft, setAmountDraft] = useState(item.amount);

  useEffect(() => {
    setNameDraft(item.name);
  }, [item.name]);

  useEffect(() => {
    setAmountDraft(item.amount);
  }, [item.amount]);

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(item.name);
      return;
    }
    if (trimmed !== item.name) onUpdate(item.id, { name: trimmed });
  }

  function commitAmount() {
    const next = amountDraft.trim();
    if (next !== item.amount) onUpdate(item.id, { amount: next });
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid #F0F4EF",
        opacity: item.checked ? 0.55 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95"
        style={{
          background: item.checked ? "#4A7C59" : "#F0F4EF",
          color: item.checked ? "#fff" : "transparent",
          border: item.checked ? "none" : "1.5px solid #C8E0CF",
        }}
        aria-label={item.checked ? `Décocher ${item.name}` : `Cocher ${item.name}`}
        aria-pressed={item.checked}
      >
        <CheckIcon />
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setNameDraft(item.name);
              e.currentTarget.blur();
            }
          }}
          className={`${inputNameClass} ${item.checked ? "line-through" : ""}`}
          aria-label={`Nom de ${item.name}`}
        />
        <input
          type="text"
          value={amountDraft}
          onChange={(e) => setAmountDraft(e.target.value)}
          onBlur={commitAmount}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setAmountDraft(item.amount);
              e.currentTarget.blur();
            }
          }}
          placeholder="Quantité"
          className={inputAmountClass}
          aria-label={`Quantité de ${item.name}`}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] active:scale-95"
        aria-label={`Supprimer ${item.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function CoursesPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    setItems(getShoppingList());
    setBanner(peekExportBanner());
    setReady(true);
  }, []);

  const remaining = useMemo(() => items.filter((i) => !i.checked).length, [items]);
  const checkedCount = items.length - remaining;
  const grouped = useMemo(() => groupByShoppingCategory(items), [items]);

  function handleToggle(id: string) {
    setItems(toggleShoppingItem(id));
  }

  function handleRemove(id: string) {
    setItems(removeShoppingItem(id));
  }

  function handleUpdate(id: string, patch: Partial<Pick<ShoppingListItem, "name" | "amount">>) {
    setItems(updateShoppingItem(id, patch));
  }

  function handleClearChecked() {
    setItems(clearCheckedShoppingItems());
  }

  function handleClearAll() {
    setItems(clearShoppingList());
    setBanner(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
          Liste
        </p>
        <h1 className="font-lora text-2xl font-bold text-[#1C2B1E]">Courses</h1>

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
            className="mt-6 rounded-3xl px-5 py-10 text-center"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
            }}
          >
            <p className="text-3xl" aria-hidden>
              🛒
            </p>
            <p className="font-lora mt-3 text-base font-bold text-[#1C2B1E]">Liste vide</p>
            <p className="mt-1.5 text-sm font-medium text-[#7A8F7D]">
              Exportez vos repas depuis le planning pour remplir la liste.
            </p>
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
                  <button
                    type="button"
                    onClick={handleClearChecked}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
                  >
                    Vider cochés
                  </button>
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
    </div>
  );
}
