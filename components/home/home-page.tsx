"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpiringSection } from "@/components/home/expiring-section";
import { FridgeSuggestions } from "@/components/home/fridge-suggestions";
import { HomeHeader } from "@/components/home/home-header";
import { TodayMealCard } from "@/components/home/today-meal-card";
import { isAnonymousUser } from "@/lib/auth-guest";
import { parisCalendarDate } from "@/lib/date-paris";
import {
  getExpiringFridgeItems,
  getFridgeItems,
  type FridgeItem,
} from "@/lib/fridge";
import { suggestRecipesFromFridge } from "@/lib/generate-from-fridge";
import { getTodayMainMeal, type MealSlot } from "@/lib/planning";
import { getRecipeById, type Recipe } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/client";
import { resolveUserFirstName } from "@/lib/user-name";

const FALLBACK_FRIDGE_RECIPES = [getRecipeById(3)!, getRecipeById(4)!, getRecipeById(8)!].filter(
  Boolean,
) as Recipe[];

export function HomePage({ todayLabel }: { todayLabel: string }) {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const [fridgeItems, setFridgeItemsState] = useState<FridgeItem[]>([]);
  const [fridgeReady, setFridgeReady] = useState(false);
  const [todayMeal, setTodayMeal] = useState<{
    mealType: MealSlot;
    recipe?: Recipe;
    breakfast?: unknown;
  } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setFridgeItemsState(getFridgeItems());
    setTodayMeal(getTodayMainMeal(parisCalendarDate()));
    setFridgeReady(true);

    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      setFirstName(await resolveUserFirstName(supabase, user));
      setIsGuest(isAnonymousUser(user));
    });
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

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-4 pb-10 sm:max-w-2xl lg:max-w-5xl lg:px-10">
        <HomeHeader
          todayLabel={todayLabel}
          firstName={firstName}
          isGuest={isGuest}
          query={query}
          onQueryChange={setQuery}
        />
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="min-w-0">
            <TodayMealCard
              recipe={todayMeal?.recipe}
              saved={saved}
              onToggleSaved={() => setSaved(!saved)}
            />
            <FridgeSuggestions recipes={fridgeRecipes} />
          </div>
          <ExpiringSection items={expiring} />
        </div>
      </div>
    </div>
  );
}
