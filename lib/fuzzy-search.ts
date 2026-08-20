/**
 * Utilitaire de recherche et correction orthographique tolérante (Fuzzy Search / Distance de Levenshtein).
 * Permet de reconnaître des aliments même avec des fautes de frappe ou d'orthographe (ex: « mozarella » → « Mozzarella »).
 */

/**
 * Réduit les consonnes doubles consécutives pour faciliter la comparaison phonétique.
 * Ex: « mozzzarella » → « mozarela », « courgette » → « courgete ».
 */
export function collapseRepeatedChars(str: string): string {
  return str.replace(/([a-z])\1+/gi, "$1");
}

/**
 * Calcule la distance de Levenshtein (nombre minimal d'insertions, suppressions ou substitutions).
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = row[j];
      row[j] = val;
    }
  }

  return row[b.length];
}

/**
 * Calcule un score de similarité entre 0 et 1 (1 = identique).
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / maxLen;
}

export interface MatchCandidate<T> {
  text: string;
  item: T;
}

/**
 * Recherche la meilleure correspondance parmi une liste de candidats avec tolérance aux fautes.
 */
export function findFuzzyMatch<T>(
  query: string,
  candidates: readonly MatchCandidate<T>[],
  options?: {
    minScore?: number;
    maxDistance?: number;
  },
): { item: T; text: string; score: number; distance: number } | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;

  const qCollapsed = collapseRepeatedChars(q);
  let best: { item: T; text: string; score: number; distance: number } | undefined = undefined;

  for (const cand of candidates) {
    const target = cand.text.toLowerCase();
    if (q === target) {
      return { item: cand.item, text: cand.text, score: 1, distance: 0 };
    }

    // Correspondance exacte avec consonnes condensées (ex: mozarella vs mozzarella)
    const targetCollapsed = collapseRepeatedChars(target);
    if (qCollapsed === targetCollapsed) {
      return { item: cand.item, text: cand.text, score: 0.95, distance: 1 };
    }

    const dist = levenshteinDistance(q, target);
    const score = 1 - dist / Math.max(q.length, target.length);

    // Seuil de distance adaptatif selon la longueur du mot
    const allowedDist =
      options?.maxDistance ??
      (q.length <= 3 ? 0 : q.length <= 6 ? 1 : q.length <= 10 ? 2 : 3);

    const minScore = options?.minScore ?? (q.length <= 4 ? 0.85 : 0.72);

    if (dist <= allowedDist && score >= minScore) {
      if (!best || dist < best.distance || (dist === best.distance && score > best.score)) {
        best = { item: cand.item, text: cand.text, score, distance: dist };
      }
    }
  }

  return best;
}
