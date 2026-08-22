export function TasteTestBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-5 py-5"
      style={{
        background: "linear-gradient(135deg, #2E5B3E 0%, #4A7C59 55%, #6FAE82 100%)",
        boxShadow: "0 6px 28px rgba(46,91,62,0.28)",
      }}
    >
      <span
        className="pointer-events-none absolute -top-5 -right-4 text-8xl opacity-15 select-none"
        aria-hidden
      >
        🎯
      </span>

      <p className="text-xs font-semibold tracking-[0.1em] text-white/70 uppercase">Profil culinaire</p>
      <h3 className="font-lora mt-1 max-w-[80%] text-xl leading-snug font-bold text-white">
        Découvrez vos plats préférés&nbsp;!
      </h3>
      <p className="mt-2 max-w-[85%] text-xs leading-relaxed font-medium text-white/80">
        Quelques questions rapides pour affiner les recettes que l&apos;IA vous propose chaque jour.
      </p>

      <button
        type="button"
        className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#2E5B3E] shadow-sm transition-all hover:opacity-90 active:scale-95"
      >
        Lancer le test rapide
        <span aria-hidden>🎯</span>
      </button>
    </div>
  );
}
