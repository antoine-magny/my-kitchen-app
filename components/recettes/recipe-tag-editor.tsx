"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import { RecipeTagPills } from "@/components/recipe-form/tag-pills";
import { CenteredModal } from "@/components/ui/centered-modal";
import { MODAL_CLOSE_BTN_CLASS } from "@/components/ui/modal-layout";
import {
  RECIPE_TAG_COLORS,
  recipeBadgeTags,
  tagToLabel,
  EXPRESS_MAX_MINUTES,
  HIGH_PROTEIN_MIN_G,
  withDerivedTags,
  type RecipeTag,
} from "@/lib/recipes";

export function RecipeTagEditor({
  tags,
  time,
  proteins,
  title,
  maxBadges = 2,
  className,
  onSave,
}: {
  tags: RecipeTag[];
  time: string;
  proteins: number;
  title: string;
  maxBadges?: number;
  className?: string;
  onSave: (tags: RecipeTag[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RecipeTag[]>(tags);
  const badges = recipeBadgeTags({ tags }, maxBadges);

  function openEditor() {
    setDraft(tags);
    setOpen(true);
  }

  function handleSave() {
    onSave(withDerivedTags(draft, time, proteins));
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className={`flex max-w-full flex-wrap items-center gap-1.5 text-left ${className ?? ""}`}
        aria-label={`Modifier les étiquettes de ${title}`}
      >
        {badges.length > 0 ? (
          badges.map((tag) => {
            const cfg = RECIPE_TAG_COLORS[tag];
            return (
              <span
                key={tag}
                className="max-w-full truncate rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide backdrop-blur-[4px]"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                {tagToLabel(tag)}
              </span>
            );
          })
        ) : (
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-[4px]"
            style={{ background: "rgba(255,255,255,0.88)", color: "#4A7C59" }}
          >
            + Étiquettes
          </span>
        )}
      </button>

      {open ? (
        <CenteredModal
          titleId="edit-tags-title"
          onClose={() => setOpen(false)}
          maxWidthClass="max-w-[340px]"
        >
          <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7A8F7D] uppercase">
                Étiquettes
              </p>
              <h2
                id="edit-tags-title"
                className="font-lora truncate text-base font-bold text-[#1C2B1E]"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={MODAL_CLOSE_BTN_CLASS}
              aria-label="Fermer"
            >
              <XIcon size={14} />
            </button>
          </div>

          <div className="px-4 pt-2">
            <RecipeTagPills selected={draft} onChange={setDraft} />
            <p className="mt-3 text-xs font-medium text-[#7A8F7D]">
              Express : ≤ {EXPRESS_MAX_MINUTES} min. Riche en protéines : ≥ {HIGH_PROTEIN_MIN_G} g
              par portion.
            </p>
          </div>

          <div className="flex gap-2.5 px-4 pt-3 pb-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-[#7A8F7D] transition-all hover:bg-[#F0F4EF] active:scale-[0.98]"
              style={{ border: "1.5px solid #E2EBE3" }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                boxShadow: "0 4px 16px rgba(74,124,89,0.28)",
              }}
            >
              Enregistrer
            </button>
          </div>
        </CenteredModal>
      ) : null}
    </>
  );
}
