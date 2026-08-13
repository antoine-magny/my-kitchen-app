export function MissingIngredientsBadges({
  names,
  className = "",
}: {
  names?: string[];
  className?: string;
}) {
  if (!names?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {names.map((name) => (
        <span
          key={name}
          className="inline-flex items-center rounded-lg bg-[#FFF7ED] px-2 py-1 text-[11px] font-bold text-[#C2410C]"
        >
          ⚠️ Manque : {name}
        </span>
      ))}
    </div>
  );
}
