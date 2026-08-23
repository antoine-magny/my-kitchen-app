# Snapshot — emojis & icônes (23 août 2026)

Copie figée du système visuel **avant** d’éventuelles modifications Antigravity.
Commit de référence : `5e31386`.

Ce dossier n’est **pas** importé par l’application. Pour restaurer, recoller
les fichiers de `sources/` à leur emplacement d’origine (voir plus bas).

---

## Comment c’est stocké

Deux couches distinctes :

| Couche | Nature | Où |
|---|---|---|
| **Icônes UI** | SVG React, jamais redéfinies ailleurs | `components/icons.tsx` |
| **Emojis aliments** | Caractères Unicode dans le catalogue | `lib/ingredients.ts` → champ `emoji` |

### Catalogue (source de vérité)

Chaque entrée de `INGREDIENTS` a un `emoji`. Plusieurs aliments peuvent
partager le même glyphe (ex. 🥒 = Courgette **et** Concombre).

- `UNIQUE_EMOJI_INGREDIENTS` : 1 seul item par emoji, **obligatoire** dans
  toute grille / sélecteur UI.
- `DEFAULT_INGREDIENT_EMOJI` = `🍽️` (neutre, si rien n’est reconnu).
- `emojiKeywords` : mots-clés **visuels seulement** — ils choisissent
  l’emoji d’un nom libre, sans fusionner l’identité (`ingredientId`).
- `resolveEmoji(name)` : exact → mots-clés → fallbacks sémantiques.
- `describeIngredient(name)` : produit `{ ingredientId, name, category, emoji }`.

Au 23/08/2026 : **113** ingrédients, **72** emojis uniques.
Liste plate : `catalogue-emojis.json`.

### Persistance (localStorage, puis Supabase)

L’emoji est un champ **optionnel recopié** sur chaque état de l’aliment
(`types/inventory.ts`) :

- `RecipeIngredient.emoji`
- `ShoppingItem.emoji`
- `FridgeItem.emoji`
- `IngredientIdentity.emoji`

À la création (`createFridgeItem` / `createShoppingItem`) :

1. Si l’utilisateur a choisi un emoji **différent** de `🍽️`, on le garde.
2. Sinon on dérive via `describeIngredient(customName)`.
3. Frigo : fallback final `🍽️`. Courses : le champ peut rester absent.

Renommage d’un article : si l’emoji était neutre / absent, il est
recalculé ; un emoji choisi à la main est conservé.

Les autres emojis (nav, frigo, profil) sont des **constantes de code**,
pas des données utilisateur :

- Navigation : `components/bottom-nav.tsx`
- Onglets frigo : `lib/fridge.ts` → `FRIDGE_TABS`
- Profil / réglages : `lib/profile.ts`

---

## Design figé

Voir `design.md` pour les tokens (tailles, couleurs, grille).

Résumé :

- **SVG** : `viewBox` 24×24, `currentColor`, trait rond. Props `size` +
  `strokeWidth`. Exceptions : `StarIcon` / `MoreIcon` (plein), `HeartIcon`
  (rose `#E85D75`), `SpinnerBrandIcon` (vert marque).
- **Sélecteur d’emojis** : portal `document.body`, grille 6 colonnes,
  256×256 px max, fond blanc, ombre `0 10px 36px rgba(20,31,22,0.22)`,
  hover `#EBF2EC`.
- **Nav** : emojis `text-xl`, label `#7A8F7D` / actif `#4A7C59`.

---

## Restaurer plus tard

Recopier depuis `sources/` vers la racine du projet :

```
sources/icons.tsx                 →  components/icons.tsx
sources/emoji-picker-popover.tsx  →  components/ui/emoji-picker-popover.tsx
sources/ingredients.ts            →  lib/ingredients.ts
sources/inventory.ts              →  types/inventory.ts
sources/bottom-nav.tsx            →  components/bottom-nav.tsx
sources/profile.ts                →  lib/profile.ts
sources/fridge.ts                 →  lib/fridge.ts
sources/shopping-list.ts          →  lib/shopping-list.ts
```

**Attention** : `ingredients.ts`, `fridge.ts`, `shopping-list.ts` et
`profile.ts` contiennent aussi de la logique métier. Ne les restaurer
en entier que si tu veux aussi revenir à leur logique du 23/08/2026.
Pour ne récupérer que les visuels, extraire les champs `emoji` /
composants SVG à la main depuis ces copies.
