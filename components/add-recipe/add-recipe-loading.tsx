import { SpinnerBrandIcon } from "@/components/icons";

export function AddRecipeLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
      <SpinnerBrandIcon size={28} />
      <p className="text-center text-sm font-semibold text-[#1C2B1E]">{message}</p>
      <p className="text-center text-xs font-medium text-[#7A8F7D]">Cela peut prendre quelques secondes</p>
    </div>
  );
}
