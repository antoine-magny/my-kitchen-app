"use client";

import { PlusIcon } from "@/components/icons";

export function CoursesHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
          Liste
        </p>
        <h1 className="font-lora text-2xl font-bold text-[#1C2B1E]">Courses</h1>
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
        <span className="hidden sm:inline">Ajouter un article</span>
        <span className="sm:hidden">Ajouter</span>
      </button>
    </div>
  );
}

export function CoursesBanner({ banner }: { banner: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-[#C8E0CF] bg-[#EBF2EC] px-4 py-3" role="status">
      <p className="text-sm font-semibold text-[#2E5C3A]">{banner}</p>
    </div>
  );
}

export function CoursesEmpty({ onAdd }: { onAdd: () => void }) {
  return (
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
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-[#F0F4EF] px-4 py-2.5 text-sm font-bold text-[#4A7C59] transition-colors hover:bg-[#E2EBE3]"
      >
        <PlusIcon size={16} />
        Ajouter un article
      </button>
    </div>
  );
}

export function CoursesActions({
  remaining,
  checkedCount,
  onTransferToFridge,
  onClearChecked,
  onClearAll,
}: {
  remaining: number;
  checkedCount: number;
  onTransferToFridge: () => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium text-[#7A8F7D]">
        <span className="font-bold text-[#1C2B1E]">{remaining}</span> restant
        {remaining > 1 ? "s" : ""}
        {checkedCount > 0 ? ` · ${checkedCount} coché${checkedCount > 1 ? "s" : ""}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {checkedCount > 0 && (
          <>
            <button
              type="button"
              onClick={onTransferToFridge}
              className="min-h-11 rounded-xl bg-[#2E5B3E] px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#254A32]"
            >
              Au frigo
            </button>
            <button
              type="button"
              onClick={onClearChecked}
              className="min-h-11 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#4A7C59] transition-colors hover:bg-[#EBF2EC]"
            >
              Vider cochés
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-11 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
        >
          Tout effacer
        </button>
      </div>
    </div>
  );
}
