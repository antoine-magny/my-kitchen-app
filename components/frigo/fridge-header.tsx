import { PlusIcon } from "@/components/icons";

export function FridgeHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
          Inventaire
        </p>
        <h1 className="font-lora text-2xl font-bold text-[#1C2B1E]">Mon Frigo &amp; Placards</h1>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
          boxShadow: "0 4px 18px rgba(74,124,89,0.30)",
        }}
      >
        <PlusIcon size={16} />
        <span className="hidden sm:inline">Ajouter un ingrédient</span>
        <span className="sm:hidden">Ajouter</span>
      </button>
    </div>
  );
}
