"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_INGREDIENT_EMOJI, UNIQUE_EMOJI_INGREDIENTS } from "@/lib/ingredients";

interface EmojiPickerPopoverProps {
  currentEmoji?: string;
  onSelectEmoji: (emoji: string, defaultUnit?: string, defaultName?: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  buttonTitle?: string;
}

export function EmojiPickerPopover({
  currentEmoji = DEFAULT_INGREDIENT_EMOJI,
  onSelectEmoji,
  size = "md",
  className = "",
  buttonTitle = "Changer l'icône de l'ingrédient",
}: EmojiPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses =
    size === "lg"
      ? "h-14 w-14 text-2xl rounded-2xl border-2 bg-[#F6F8F3] hover:border-[#4A7C59]"
      : size === "sm"
      ? "h-7 w-7 text-lg rounded-lg hover:bg-[#EBF2EC]"
      : "h-9 w-9 text-xl rounded-xl hover:bg-[#EBF2EC]";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={buttonTitle}
        className={`flex items-center justify-center transition-all select-none cursor-pointer ${sizeClasses}`}
        style={{ borderColor: size === "lg" ? "#E2EBE3" : "transparent" }}
      >
        {currentEmoji || DEFAULT_INGREDIENT_EMOJI}
      </button>

      {isOpen && (
        <div
          className="slide-down absolute top-full left-0 z-50 mt-1 grid max-h-64 gap-1 overflow-y-auto rounded-2xl p-3"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 8px 32px rgba(20,31,22,0.18)",
            border: "1px solid #E2EBE3",
            gridTemplateColumns: "repeat(6, 1fr)",
            width: 216,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Visuel neutre (aucun ingrédient spécifique)"
            onClick={() => {
              onSelectEmoji(DEFAULT_INGREDIENT_EMOJI);
              setIsOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:bg-[#EBF2EC]"
            style={{
              background: currentEmoji === DEFAULT_INGREDIENT_EMOJI ? "#EBF2EC" : "transparent",
            }}
          >
            {DEFAULT_INGREDIENT_EMOJI}
          </button>
          {UNIQUE_EMOJI_INGREDIENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.name}
              onClick={() => {
                onSelectEmoji(item.emoji, item.defaultUnit, item.name);
                setIsOpen(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:bg-[#EBF2EC]"
              style={{ background: currentEmoji === item.emoji ? "#EBF2EC" : "transparent" }}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
