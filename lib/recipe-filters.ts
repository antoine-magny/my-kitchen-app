import {
  ATTRIBUTE_TAGS,
  MEAL_TAGS,
  type Recipe,
  type RecipeCost,
  type RecipeDifficulty,
  type RecipeTag,
} from "@/lib/recipe-model";
import { parseMinutes } from "@/lib/recipe-time";

export type TimeFilterId = "15" | "30" | "45" | "60" | "over60";

export const TIME_FILTERS: { id: TimeFilterId; label: string }[] = [
  { id: "15", label: "≤ 15 min" },
  { id: "30", label: "≤ 30 min" },
  { id: "45", label: "≤ 45 min" },
  { id: "60", label: "≤ 1 h" },
  { id: "over60", label: "> 1 h" },
];

export type RecipeCatalogQuery = {
  selectedTags: RecipeTag[];
  favoritesOnly: boolean;
  favoriteIds: ReadonlySet<number>;
  timeFilter: TimeFilterId | null;
  difficulties: RecipeDifficulty[];
  costs: RecipeCost[];
  query: string;
  excludeId?: number;
};

export function emptyCatalogQuery(
  favoriteIds: ReadonlySet<number> = new Set(),
): RecipeCatalogQuery {
  return {
    selectedTags: [],
    favoritesOnly: false,
    favoriteIds,
    timeFilter: null,
    difficulties: [],
    costs: [],
    query: "",
  };
}

export function countAdvancedFilters(query: RecipeCatalogQuery): number {
  return (
    (query.timeFilter ? 1 : 0) +
    query.difficulties.length +
    query.costs.length
  );
}

export function hasActiveCatalogFilters(query: RecipeCatalogQuery): boolean {
  return (
    query.selectedTags.length > 0 ||
    query.favoritesOnly ||
    countAdvancedFilters(query) > 0 ||
    query.query.trim().length > 0
  );
}

export function recipeMatchesQuery(recipe: Recipe, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (recipe.title.toLowerCase().includes(q)) return true;
  return recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q));
}

export function recipeMatchesTags(recipeTags: RecipeTag[], selected: RecipeTag[]): boolean {
  if (selected.length === 0) return true;
  const meal = selected.filter((tag) => (MEAL_TAGS as readonly string[]).includes(tag));
  const attrs = selected.filter((tag) => (ATTRIBUTE_TAGS as readonly string[]).includes(tag));
  const mealOk = meal.length === 0 || meal.some((tag) => recipeTags.includes(tag));
  const attrsOk = attrs.every((tag) => recipeTags.includes(tag));
  return mealOk && attrsOk;
}

export function recipeMatchesTime(time: string, filter: TimeFilterId | null): boolean {
  if (!filter) return true;
  const minutes = parseMinutes(time);
  if (minutes == null) return false;
  if (filter === "over60") return minutes > 60;
  return minutes <= Number(filter);
}

export function filterRecipes(recipes: Recipe[], query: RecipeCatalogQuery): Recipe[] {
  return recipes.filter((recipe) => {
    if (query.excludeId != null && recipe.id === query.excludeId) return false;
    if (query.favoritesOnly && !query.favoriteIds.has(recipe.id)) return false;
    if (!recipeMatchesTags(recipe.tags, query.selectedTags)) return false;
    if (!recipeMatchesTime(recipe.time, query.timeFilter)) return false;
    if (query.difficulties.length > 0 && !query.difficulties.includes(recipe.difficulty)) {
      return false;
    }
    if (query.costs.length > 0 && !query.costs.includes(recipe.cost)) return false;
    return recipeMatchesQuery(recipe, query.query);
  });
}

export function countRecipesByTag(recipes: Recipe[], tag: RecipeTag): number {
  return recipes.filter((recipe) => recipe.tags.includes(tag)).length;
}
