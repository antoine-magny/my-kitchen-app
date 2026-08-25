export function QuizOptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; emoji: string; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
              active
                ? "border-[#4A7C59] bg-[#EBF2EC]"
                : "border-[#E2EBE3] bg-white hover:border-[#4A7C59]/50 hover:bg-[#FAFBF9]"
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <div>
              <h4 className="font-semibold text-[#1C2B1E]">{option.label}</h4>
              {option.hint && <p className="mt-1 text-sm text-[#7A8F7D]">{option.hint}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
