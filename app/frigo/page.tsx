"use client";

import { useEffect, useRef, useState } from "react";

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

type TabId = "fridge" | "freezer" | "pantry";

interface Ingredient {
  id: number;
  emoji: string;
  name: string;
  quantity: number;
  unit: string;
  dlc: string | null;
  category: TabId;
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysFrom(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}

let nextId = 100;

const INITIAL: Ingredient[] = [
  { id: 1, emoji: "🥚", name: "Œufs", quantity: 6, unit: "unités", dlc: daysFrom(7), category: "fridge" },
  { id: 2, emoji: "🥛", name: "Lait demi-écrémé", quantity: 1, unit: "L", dlc: daysFrom(2), category: "fridge" },
  { id: 3, emoji: "🧀", name: "Comté", quantity: 150, unit: "g", dlc: daysFrom(14), category: "fridge" },
  { id: 4, emoji: "🥩", name: "Poulet fermier", quantity: 500, unit: "g", dlc: daysFrom(0), category: "fridge" },
  { id: 5, emoji: "🍅", name: "Tomates cerises", quantity: 250, unit: "g", dlc: daysFrom(1), category: "fridge" },
  { id: 6, emoji: "🥕", name: "Carottes", quantity: 4, unit: "unités", dlc: daysFrom(6), category: "fridge" },
  { id: 7, emoji: "🧈", name: "Beurre AOP", quantity: 250, unit: "g", dlc: daysFrom(21), category: "fridge" },
  { id: 8, emoji: "🥗", name: "Mesclun bio", quantity: 100, unit: "g", dlc: daysFrom(2), category: "fridge" },
  { id: 9, emoji: "🍋", name: "Citrons", quantity: 3, unit: "unités", dlc: daysFrom(8), category: "fridge" },
  { id: 10, emoji: "🐟", name: "Filets de saumon", quantity: 2, unit: "pièces", dlc: daysFrom(60), category: "freezer" },
  { id: 11, emoji: "🥦", name: "Brocolis surgelés", quantity: 400, unit: "g", dlc: daysFrom(90), category: "freezer" },
  { id: 12, emoji: "🍦", name: "Sorbet citron", quantity: 500, unit: "g", dlc: daysFrom(45), category: "freezer" },
  { id: 13, emoji: "🍖", name: "Bœuf haché 5%", quantity: 300, unit: "g", dlc: daysFrom(-2), category: "freezer" },
  { id: 14, emoji: "🫛", name: "Petits pois", quantity: 800, unit: "g", dlc: daysFrom(120), category: "freezer" },
  { id: 15, emoji: "🍝", name: "Pâtes linguine", quantity: 500, unit: "g", dlc: null, category: "pantry" },
  { id: 16, emoji: "🍚", name: "Riz basmati", quantity: 800, unit: "g", dlc: null, category: "pantry" },
  { id: 17, emoji: "🫒", name: "Huile d'olive", quantity: 750, unit: "mL", dlc: daysFrom(180), category: "pantry" },
  { id: 18, emoji: "🧂", name: "Fleur de sel", quantity: 200, unit: "g", dlc: null, category: "pantry" },
  { id: 19, emoji: "🌶️", name: "Paprika fumé", quantity: 50, unit: "g", dlc: daysFrom(300), category: "pantry" },
  { id: 20, emoji: "🍫", name: "Chocolat noir 70%", quantity: 200, unit: "g", dlc: daysFrom(60), category: "pantry" },
  { id: 21, emoji: "🧁", name: "Farine T55", quantity: 1, unit: "kg", dlc: daysFrom(180), category: "pantry" },
  { id: 22, emoji: "☕", name: "Café en grains", quantity: 250, unit: "g", dlc: daysFrom(90), category: "pantry" },
];

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "fridge", label: "Réfrigérateur", emoji: "🧊" },
  { id: "freezer", label: "Congélateur", emoji: "❄️" },
  { id: "pantry", label: "Placards", emoji: "🏺" },
];

const EMOJI_SUGGESTIONS = [
  "🥚", "🥛", "🧀", "🥩", "🍅", "🥕", "🧈", "🥗", "🍋", "🫐", "🍎", "🍊",
  "🥦", "🥬", "🧅", "🥔", "🫑", "🍞", "🐟", "🍖", "🥑", "🍇", "🫚", "🧄",
];

function dlcStatus(dlc: string | null): "urgent" | "soon" | "ok" | "none" {
  if (!dlc) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((new Date(dlc).getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return "urgent";
  if (diff <= 3) return "soon";
  return "ok";
}

function dlcLabel(dlc: string | null): string {
  if (!dlc) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((new Date(dlc).getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `Périmé (${Math.abs(diff)}j)`;
  if (diff === 0) return "Expire aujourd'hui";
  if (diff === 1) return "Expire demain";
  return `DLC ${new Date(dlc).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

const STATUS_STYLE = {
  urgent: { color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  soon: { color: "#C2410C", bg: "#FFF7ED", dot: "#F97316" },
  ok: { color: "#6B7280", bg: "transparent", dot: "#9CA3AF" },
  none: { color: "#9CA3AF", bg: "transparent", dot: "#D1D5DB" },
};

function AddModal({
  activeTab,
  onAdd,
  onClose,
}: {
  activeTab: TabId;
  onAdd: (item: Omit<Ingredient, "id">) => void;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState("🥚");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("unités");
  const [dlc, setDlc] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      emoji,
      name: name.trim(),
      quantity: Number(qty) || 1,
      unit: unit.trim() || "unités",
      dlc: dlc || null,
      category: activeTab,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(20,31,22,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="scale-in w-full rounded-t-3xl p-7 sm:w-auto sm:min-w-[440px] sm:rounded-3xl"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(20,31,22,0.22)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-lora text-xl font-bold text-[#1C2B1E]">Nouvel ingrédient</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A8F7D] transition-colors hover:bg-[#F0F4EF]"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPicker((p) => !p)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 bg-[#F6F8F3] text-2xl transition-all hover:border-[#4A7C59]"
                style={{ borderColor: "#E2EBE3" }}
              >
                {emoji}
              </button>
              {showPicker && (
                <div
                  className="slide-down absolute top-16 left-0 z-10 grid gap-1 rounded-2xl p-3"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 8px 32px rgba(20,31,22,0.14)",
                    border: "1px solid #E2EBE3",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    width: 216,
                  }}
                >
                  {EMOJI_SUGGESTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setShowPicker(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:bg-[#EBF2EC]"
                      style={{ background: emoji === e ? "#EBF2EC" : "transparent" }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                NOM DE L&apos;INGRÉDIENT
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Tomates cerises"
                required
                className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                style={{ border: "1.5px solid #E2EBE3" }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                QUANTITÉ
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                style={{ border: "1.5px solid #E2EBE3" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                UNITÉ
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="g, mL, unités…"
                className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
                style={{ border: "1.5px solid #E2EBE3" }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
              DATE LIMITE DE CONSOMMATION <span className="font-medium normal-case opacity-60">(optionnelle)</span>
            </label>
            <input
              type="date"
              value={dlc}
              onChange={(e) => setDlc(e.target.value)}
              className="w-full rounded-xl bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] outline-none transition-all focus:border-[#4A7C59]"
              style={{ border: "1.5px solid #E2EBE3" }}
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
              boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
            }}
          >
            Ajouter l&apos;ingrédient
          </button>
        </form>
      </div>
    </div>
  );
}

function IngredientRow({
  item,
  onAdjust,
  onDelete,
  isNew,
}: {
  item: Ingredient;
  onAdjust: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
  isNew: boolean;
}) {
  const status = dlcStatus(item.dlc);
  const style = STATUS_STYLE[status];
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => onDelete(item.id), 260);
  };

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-[#FAFBF9] sm:gap-4 sm:px-5"
      style={{
        opacity: deleting ? 0 : 1,
        transform: deleting ? "translateX(20px)" : "none",
        transition: "opacity 0.26s ease, transform 0.26s ease, background 0.15s",
        animation: isNew ? "slideDown 0.22s ease both" : "none",
      }}
    >
      <span className="w-8 shrink-0 text-center text-xl select-none">{item.emoji}</span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1C2B1E]">{item.name}</p>
        {item.dlc && (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: style.dot }} />
            <span className="text-xs font-medium" style={{ color: style.color }}>
              {dlcLabel(item.dlc)}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0 overflow-hidden rounded-xl" style={{ border: "1.5px solid #E2EBE3" }}>
        <button
          type="button"
          onClick={() => onAdjust(item.id, -1)}
          disabled={item.quantity <= 0}
          className="flex h-8 w-8 items-center justify-center text-[#4A7C59] transition-all hover:bg-[#EBF2EC] disabled:opacity-30"
          aria-label="Diminuer"
        >
          <MinusIcon />
        </button>
        <span
          className="w-12 border-x text-center text-sm font-extrabold text-[#1C2B1E]"
          style={{ borderColor: "#E2EBE3", lineHeight: "2rem" }}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onAdjust(item.id, 1)}
          className="flex h-8 w-8 items-center justify-center text-[#4A7C59] transition-all hover:bg-[#EBF2EC]"
          aria-label="Augmenter"
        >
          <PlusIcon size={13} />
        </button>
      </div>

      <span className="hidden w-12 shrink-0 text-right text-xs font-semibold text-[#9CA3AF] sm:block">{item.unit}</span>

      <button
        type="button"
        onClick={handleDelete}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#FEF2F2] hover:text-[#EF4444]"
        aria-label="Supprimer"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function FrigoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fridge");
  const [items, setItems] = useState<Ingredient[]>(INITIAL);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());

  const tabItems = items.filter((i) => i.category === activeTab);
  const filtered = tabItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

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

  const handleAdd = (item: Omit<Ingredient, "id">) => {
    const id = ++nextId;
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
                  <SearchIcon />
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
                <div
                  className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 sm:flex"
                >
                  <CalendarIcon />
                  <span className="text-xs font-bold text-[#C2410C]">
                    {urgentCount(activeTab) > 0
                      ? `${urgentCount(activeTab)} expiré${urgentCount(activeTab) > 1 ? "s" : ""}`
                      : `${soonCount(activeTab)} bientôt`}
                  </span>
                </div>
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
    </div>
  );
}
