import Link from "next/link";
import { ChevronLeftIcon, EditIcon } from "@/components/icons";
import { initialFromName } from "@/lib/user-name";

type ProfileHeaderProps = {
  firstName: string;
  email: string;
};

export function ProfileHeader({ firstName, email }: ProfileHeaderProps) {
  return (
    <div className="pt-10 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#4A7C59] transition-all hover:opacity-80 active:scale-95"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2EBE3",
            boxShadow: "0 2px 12px rgba(74,124,89,0.10)",
          }}
          aria-label="Retour à l'accueil"
        >
          <ChevronLeftIcon size={18} />
        </Link>
        <p className="text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">Mon profil</p>
        <div className="w-10" aria-hidden />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
          aria-hidden
        >
          {initialFromName(firstName)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-lora truncate text-2xl leading-tight font-bold text-[#1C2B1E]">
            {firstName || "Mon profil"}
          </h1>
          <p className="mt-0.5 truncate text-sm font-medium text-[#7A8F7D]">{email}</p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3.5 py-2.5 text-xs font-bold text-[#4A7C59] transition-all hover:opacity-90 active:scale-95"
        >
          <EditIcon size={13} />
          Modifier
        </button>
      </div>
    </div>
  );
}
