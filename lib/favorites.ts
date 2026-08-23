/**
 * Favoris recettes — même clé et même comportement que l’UI existante.
 * Ne pas modifier la logique d’hydratation localStorage.
 */

export const FAVORITES_KEY = "my-kitchen-favorite-recipes";
export const DEFAULT_FAVORITES = [1, 5];

export function readFavorites(): Set<number> {
  if (typeof window === "undefined") return new Set(DEFAULT_FAVORITES);
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set(DEFAULT_FAVORITES);
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? new Set(parsed) : new Set(DEFAULT_FAVORITES);
  } catch {
    return new Set(DEFAULT_FAVORITES);
  }
}

export function writeFavorites(favorites: Set<number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

export function removeFromFavorites(id: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed)) return;
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(parsed.filter((favId) => favId !== id)),
    );
  } catch {
    /* ignore */
  }
}
