import { PlusIcon } from "@/components/icons";
import type { TabId } from "@/components/frigo/shared";

export function FridgeEmptyState({
  activeTab,
  query,
  onAdd,
}: {
  activeTab: TabId;
  query: string;
  onAdd: () => void;
}) {
  return (
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
          onClick={onAdd}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#EBF2EC] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-all hover:opacity-90"
        >
          <PlusIcon size={13} /> Ajouter un ingrédient
        </button>
      )}
    </div>
  );
}
