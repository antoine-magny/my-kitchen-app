"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookmarkIcon,
  ChevronRightIcon,
  ClockIcon,
  FlameIcon,
  ProteinIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/icons";
import { formatTodayLongFr } from "@/lib/date-paris";
import {
  daysUntilDlc,
  dlcStatus,
  getExpiringFridgeItems,
  getFridgeItems,
  type FridgeItem,
} from "@/lib/fridge";
import { suggestRecipesFromFridge } from "@/lib/generate-from-fridge";
import { getRecipeById, type Recipe } from "@/lib/recipes";

const MAIN_MEAL = getRecipeById(6)!;
const FALLBACK_FRIDGE_RECIPES = [getRecipeById(3)!, getRecipeById(4)!, getRecipeById(8)!].filter(
  Boolean,
) as Recipe[];

type Urgency = "red" | "orange" | "green";

function fridgeUrgency(item: FridgeItem): Urgency {
  const status = dlcStatus(item.expirationDate);
  if (status === "urgent") return "red";
  if (status === "soon") return "orange";
  return "green";
}

function fridgeDetail(item: FridgeItem): string {
  if (!item.expirationDate) return "Sans DLC";
  const days = daysUntilDlc(item.expirationDate);
  if (days < 0) {
    const n = Math.abs(days);
    return `Périmé depuis ${n} jour${n > 1 ? "s" : ""}`;
  }
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return "Expire demain";
  return `Expire dans ${days} jours`;
}

const urgencyConfig: Record<Urgency, { dot: string; bg: string; text: string; label: string }> = {
  red: { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", label: "Urgent" },
  orange: { dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", label: "Bientôt" },
  green: { dot: "#4A7C59", bg: "#F0F7F2", text: "#2E5C3A", label: "OK" },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const [fridgeItems, setFridgeItemsState] = useState<FridgeItem[]>([]);
  const [fridgeReady, setFridgeReady] = useState(false);

  useEffect(() => {
    setFridgeItemsState(getFridgeItems());
    setFridgeReady(true);
  }, []);

  const fridgeRecipes = useMemo(() => {
    if (!fridgeReady) return FALLBACK_FRIDGE_RECIPES;
    const result = suggestRecipesFromFridge({
      mealCount: 3,
      preferExpiring: true,
      items: fridgeItems,
    });
    const matched = result.suggestions
      .map((s) => (s.recipeId != null ? getRecipeById(s.recipeId) : undefined))
      .filter((r): r is Recipe => r != null);
    if (matched.length >= 3) return matched.slice(0, 3);
    const ids = new Set(matched.map((r) => r.id));
    return [...matched, ...FALLBACK_FRIDGE_RECIPES.filter((r) => !ids.has(r.id))].slice(0, 3);
  }, [fridgeItems, fridgeReady]);

  const expiring = useMemo(() => {
    if (!fridgeReady) return [];
    return getExpiringFridgeItems(5, fridgeItems).slice(0, 5);
  }, [fridgeItems, fridgeReady]);
  const todayLabel = useMemo(() => formatTodayLongFr(), []);

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-4 pb-10">
        <div className="fade-up pt-10 pb-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#7A8F7D]" style={{ letterSpacing: "0.04em" }}>
                {todayLabel}
              </p>
              <h1 className="font-lora mt-0.5 text-2xl leading-tight font-bold text-[#1C2B1E]">
                Bonjour Antoine !<br />
                <span className="text-[#4A7C59]">Prêt à cuisiner ?</span>
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Link
                href="/parametres"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#4A7C59] transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E2EBE3",
                  boxShadow: "0 2px 12px rgba(74,124,89,0.10)",
                }}
                aria-label="Profil et paramètres"
              >
                <SettingsIcon size={19} />
              </Link>
              <Link
                href="/parametres"
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-md transition-transform active:scale-95"
                style={{ background: "linear-gradient(135deg, #4A7C59, #6FAE82)" }}
                aria-label="Mon profil"
              >
                A
              </Link>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 2px 14px rgba(74,124,89,0.10)",
              border: "1.5px solid #E2EBE3",
            }}
          >
            <span className="text-[#7A8F7D]">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une recette, un ingrédient…"
              className="flex-1 bg-transparent text-sm font-medium text-[#1C2B1E] outline-none"
            />
          </div>
        </div>

        <section className="fade-up mb-7" style={{ animationDelay: "0.08s" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Au menu aujourd&apos;hui</h2>
            <Link href="/recettes" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
              Modifier <ChevronRightIcon size={16} />
            </Link>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 6px 32px rgba(74,124,89,0.13)",
            }}
          >
            <div className="relative h-52 bg-[#D4EDD9]">
              <Link href={`/recettes/${MAIN_MEAL.id}`} className="absolute inset-0 block">
                {MAIN_MEAL.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={MAIN_MEAL.photo} alt={MAIN_MEAL.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(28,43,30,0.55) 0%, transparent 55%)",
                  }}
                />
              </Link>
              <button
                type="button"
                onClick={() => setSaved(!saved)}
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-sm transition-all"
                style={{
                  background: saved ? "#4A7C59" : "rgba(255,255,255,0.82)",
                  color: saved ? "#fff" : "#4A7C59",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
                aria-label="Sauvegarder la recette"
              >
                <BookmarkIcon filled={saved} size={15} />
              </button>

              <div
                className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)" }}
              >
                <span className="text-[#4A7C59]">
                  <ClockIcon size={13} />
                </span>
                <span className="text-xs font-bold text-[#1C2B1E]">{MAIN_MEAL.time}</span>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-[#F59E0B]">
                  <StarIcon size={12} />
                </span>
                <span className="text-[#F59E0B]">
                  <StarIcon size={12} />
                </span>
                <span className="text-[#F59E0B]">
                  <StarIcon size={12} />
                </span>
                <span className="text-[#F59E0B]">
                  <StarIcon size={12} />
                </span>
                <span className="text-[#D1D5DB]">
                  <StarIcon size={12} />
                </span>
                <span className="ml-1 text-xs font-medium text-[#7A8F7D]">
                  4.2 • {MAIN_MEAL.servings} pers.
                </span>
              </div>

              <Link href={`/recettes/${MAIN_MEAL.id}`}>
                <h3 className="font-lora mb-4 text-base leading-snug font-bold text-[#1C2B1E]">{MAIN_MEAL.title}</h3>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3 py-1.5">
                  <span className="text-[#F97316]">
                    <FlameIcon size={13} />
                  </span>
                  <span className="text-xs font-bold text-[#C2410C]">{MAIN_MEAL.calories} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-[#EBF2EC] px-3 py-1.5">
                  <span className="text-[#4A7C59]">
                    <ProteinIcon size={13} />
                  </span>
                  <span className="text-xs font-bold text-[#2E5C3A]">{MAIN_MEAL.proteins}g protéines</span>
                </div>
              </div>

              <Link
                href={`/recettes/${MAIN_MEAL.id}`}
                className="btn-primary mt-4 block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
              >
                Voir la recette complète
              </Link>
            </div>
          </div>
        </section>

        <section className="fade-up mb-7" style={{ animationDelay: "0.16s" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Que faire avec votre frigo&nbsp;?</h2>
            <Link href="/recettes" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
              Tout voir <ChevronRightIcon size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {fridgeRecipes.map((recipe) => (
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

        <section className="fade-up" style={{ animationDelay: "0.24s" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Ingrédients bientôt périmés</h2>
            <Link href="/frigo" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
              Gérer <ChevronRightIcon size={16} />
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-3xl"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
            }}
          >
            {expiring.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-medium text-[#7A8F7D]">
                  Rien d’urgent pour le moment — votre frigo est sous contrôle.
                </p>
              </div>
            ) : (
              expiring.map((item, idx) => {
                const urgency = fridgeUrgency(item);
                const cfg = urgencyConfig[urgency];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4 transition-colors"
                    style={{
                      borderBottom: idx < expiring.length - 1 ? "1px solid #F0F4EF" : "none",
                    }}
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.bg}` }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1C2B1E]">{item.customName}</p>
                      <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">{fridgeDetail(item)}</p>
                    </div>

                    <span
                      className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#C8E0CF] bg-[#EBF2EC] px-4 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4A7C59] text-base">
              <span className="text-base">💡</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#2E5C3A]">Conseil du jour</p>
              <p className="mt-0.5 text-xs leading-relaxed font-medium text-[#4A7C59]">
                Utilisez vos tomates cerises dans une salade caprese ou une bruschetta avant demain !
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
