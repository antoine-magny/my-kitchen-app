"use client";

import Link from "next/link";
import { ChevronRightIcon, ClockIcon } from "@/components/icons";
import type { Recipe } from "@/lib/recipes";

export function FridgeSuggestions({ recipes }: { recipes: Recipe[] }) {
  return (
    <section className="fade-up mb-7" style={{ animationDelay: "0.16s" }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Que faire avec votre frigo&nbsp;?</h2>
        <Link href="/recettes" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
          Tout voir <ChevronRightIcon size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recettes/${recipe.id}`}
            className="overflow-hidden rounded-2xl text-left transition-transform hover:shadow-lg active:scale-95"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 3px 16px rgba(74,124,89,0.09)",
            }}
          >
            <div className="relative h-24 bg-[#D4EDD9]">
              {recipe.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(28,43,30,0.35) 0%, transparent 60%)" }}
              />
            </div>
            <div className="px-2.5 py-2.5">
              <p className="mb-1.5 text-xs leading-tight font-bold text-[#1C2B1E]">{recipe.title}</p>
              <div className="flex items-center gap-1 text-[#7A8F7D]">
                <ClockIcon size={13} />
                <span className="text-xs font-medium">{recipe.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
