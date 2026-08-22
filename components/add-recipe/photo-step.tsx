import { useRef } from "react";
import { CameraIcon } from "@/components/icons";

export function PhotoStep({
  onFileSelect,
  error,
}: {
  onFileSelect: (file: File | undefined) => void;
  error?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 px-6 py-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          onFileSelect(file);
        }}
      />
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-10"
        style={{ background: "#FAFBF9", border: "1.5px dashed #C8E0CF" }}
      >
        <span className="text-[#4A7C59]">
          <CameraIcon size={22} />
        </span>
        <p className="text-center text-sm font-semibold text-[#1C2B1E]">Photo ou capture d’écran</p>
        <p className="text-center text-xs font-medium text-[#7A8F7D]">
          L’IA lit la recette et préremplit le formulaire pour validation.
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
            boxShadow: "0 3px 12px rgba(74,124,89,0.25)",
          }}
        >
          Choisir une image
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  );
}
