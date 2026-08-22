import { ImageIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import React from "react";

export function ImageSection({
  photo,
  setPhoto,
  showUrlInput,
  setShowUrlInput,
  photoUrlDraft,
  setPhotoUrlDraft,
  fileRef,
  handleFileChange,
  applyPhotoUrl,
}: {
  photo: string;
  setPhoto: (val: string) => void;
  showUrlInput: boolean;
  setShowUrlInput: React.Dispatch<React.SetStateAction<boolean>>;
  photoUrlDraft: string;
  setPhotoUrlDraft: (val: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyPhotoUrl: () => void;
}) {
  return (
    <div>
      <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
        IMAGE
      </label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {photo ? (
        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1.5px solid #E2EBE3" }}
        >
          <div className="relative h-40 bg-[#D4EDD9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Aperçu de la recette" className="h-full w-full object-cover" />
          </div>
          <div className="flex gap-2 bg-[#FAFBF9] p-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EBF2EC] py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:opacity-90"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput((v) => !v);
                setPhotoUrlDraft(photo.startsWith("data:") ? "" : photo);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C8E0CF] bg-white py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:border-[#4A7C59]"
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoto("");
                setShowUrlInput(false);
                setPhotoUrlDraft("");
              }}
              className="flex items-center justify-center rounded-xl px-3 py-2.5 text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
              aria-label="Retirer l'image"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-8"
          style={{ background: "#FAFBF9", border: "1.5px dashed #C8E0CF" }}
        >
          <span className="text-[#7A8F7D]">
            <ImageIcon size={22} />
          </span>
          <p className="text-center text-xs font-medium text-[#7A8F7D]">Aucune image — optionnel</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                boxShadow: "0 3px 12px rgba(74,124,89,0.25)",
              }}
            >
              <PlusIcon size={12} /> Ajouter une image
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput((v) => !v)}
              className="rounded-xl border border-[#C8E0CF] bg-white px-4 py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:border-[#4A7C59]"
            >
              Depuis une URL
            </button>
          </div>
        </div>
      )}

      {showUrlInput && (
        <div className="mt-3 flex gap-2">
          <input
            value={photoUrlDraft}
            onChange={(e) => setPhotoUrlDraft(e.target.value)}
            placeholder="https://…"
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={applyPhotoUrl}
            className="shrink-0 rounded-xl bg-[#EBF2EC] px-4 text-xs font-bold text-[#4A7C59] transition-all hover:opacity-90"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
