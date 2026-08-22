import { CameraIcon, EditIcon, LinkIcon } from "@/components/icons";

export function MenuStep({
  onSelect,
  error,
}: {
  onSelect: (step: "form" | "photo" | "url") => void;
  error?: string;
}) {
  const options = [
    {
      id: "manual" as const,
      icon: <EditIcon size={22} strokeWidth={1.8} />,
      title: "Saisie manuelle",
      desc: "Remplir le formulaire vous-même",
      onClick: () => onSelect("form"),
    },
    {
      id: "photo" as const,
      icon: <CameraIcon size={22} />,
      title: "Scanner une recette",
      desc: "Photo ou galerie — l’IA préremplit le formulaire",
      onClick: () => onSelect("photo"),
    },
    {
      id: "url" as const,
      icon: <LinkIcon size={22} />,
      title: "Importer depuis un lien",
      desc: "Marmiton, blogs… extraction automatique",
      onClick: () => onSelect("url"),
    },
  ];

  return (
    <div className="space-y-3 px-6 py-6">
      <p className="mb-2 text-sm font-medium text-[#7A8F7D]">
        Comment souhaitez-vous ajouter cette recette ?
      </p>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={opt.onClick}
          className="flex w-full items-start gap-4 rounded-2xl px-4 py-4 text-left transition-all hover:bg-[#FAFBF9]"
          style={{ border: "1.5px solid #E2EBE3" }}
        >
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF2EC] text-[#4A7C59]">
            {opt.icon}
          </span>
          <span>
            <span className="block text-sm font-bold text-[#1C2B1E]">{opt.title}</span>
            <span className="mt-0.5 block text-xs font-medium text-[#7A8F7D]">{opt.desc}</span>
          </span>
        </button>
      ))}
      {error && (
        <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  );
}
