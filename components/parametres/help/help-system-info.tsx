"use client";

export function HelpSystemInfo() {
  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-[#F0F4EF] pt-3 text-center sm:flex-row sm:text-left">
      <div className="text-[11px] text-[#7A8F7D]">
        <span className="font-bold text-[#1C2B1E]">My Kitchen</span> · Version 0.1.0 · Mode hybride (Local &amp; Cloud)
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#4A7C59]">
        <span>🥑 Fait avec passion pour lutter contre le gaspillage</span>
      </div>
    </div>
  );
}
