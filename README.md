# My Kitchen App

Application de cuisine personnelle : inventaire du frigo, catalogue de recettes,
planning de repas hebdomadaire, liste de courses, et génération de recettes
assistée par IA à partir de ce qu'il reste dans le frigo.

Ce README est le **point d'entrée pour les futures requêtes IA** : il décrit
l'architecture, les conventions et les pièges du projet. À lire avant toute
modification.

---

## Tech stack

| Brique | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript strict, alias `@/*` vers la racine |
| UI | React 19 + Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Base de données | Supabase (PostgreSQL + RLS) |
| IA | Google Gemini via `@google/genai` |
| Hébergement | Vercel (+ un cron déclaré dans `vercel.json`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) : `lint` + `build` à chaque push sur `main` |

> Next.js 16 introduit des ruptures par rapport aux versions précédentes. En cas
> de doute sur une API du framework, consulter `node_modules/next/dist/docs/`
> plutôt que de se fier à ses souvenirs.

Commandes : `npm run dev` (serveur local), `npm run build`, `npm run lint`.
Pour un contrôle de types complet : `npx tsc --noEmit`.

---

## Architecture

### Arborescence

```
app/                    Routes App Router (une page par écran)
  layout.tsx            Shell global : polices Nunito/Lora + BottomNav
  page.tsx              Accueil : repas du jour, frigo en un coup d'œil
  frigo/                Inventaire frigo / congélateur / placards
  planning/             Planning hebdomadaire des repas
  recettes/             Liste des recettes + détail dynamique [id]
  courses/              Liste de courses (+ transfert vers le frigo)
  api/                  Route Handlers (voir plus bas)
components/             Composants React partagés
  icons.tsx             Toutes les icônes SVG de l'app (props size / strokeWidth)
  bottom-nav.tsx        Navigation fixe (5 onglets)
  ui/unit-select.tsx    Sélecteur d'unités par familles (Masse / Volume / Décompte)
  frigo/                Composants propres à la page frigo
  planning/             Modales propres au planning (export courses)
  generate-from-fridge-modal.tsx  Génération de recettes depuis le planning
  select-recipe-modal.tsx         Choix d'une recette du catalogue
lib/                    Logique métier, sans JSX
  units.ts              Familles d'unités + combineQuantities
  shopping-list.ts      Export Planning → Courses (fusion / déduplication)
  fridge.ts             Inventaire local + transfert Courses → Frigo
  ingredients.ts        Référentiel canonique (ingredientId)
  planning.ts           Construction de semaine + agrégation d'ingrédients
  ai/                   Client Gemini et prompts
  supabase/             Client admin + types générés du schéma
types/
  inventory.ts          RecipeIngredient / ShoppingItem / FridgeItem (Snapshot)
scripts/                Utilitaires ponctuels lancés à la main
.github/workflows/      CI GitHub Actions (lint + build)
```

### Séparation des responsabilités

La règle structurante du projet : **`lib/` ne contient jamais de JSX, `app/` ne
contient jamais de logique métier réutilisable.** Une page assemble des
composants et appelle des fonctions de `lib/`.

Quelques exemples de cette découpe, utiles comme modèles :

- `app/planning/page.tsx` ne fait que du rendu ; la construction d'une semaine et
  l'agrégation des ingrédients vivent dans `lib/planning.ts`.
- `app/frigo/page.tsx` orchestre l'état, mais les modales et la ligne
  d'ingrédient sont dans `components/frigo/`.
- Les deux modales de recette sont séparées : `components/recipe-form-modal.tsx`
  (formulaire d'édition) et `components/add-recipe-modal.tsx` (parcours d'ajout
  en 3 modes), avec les styles de champs communs dans
  `components/recipe-form-styles.ts`.
- `app/planning/page.tsx` délègue le choix de recette à
  `components/select-recipe-modal.tsx` et la génération IA à
  `components/generate-from-fridge-modal.tsx`.
- `app/courses/page.tsx` délègue fusion / transfert à `lib/shopping-list.ts` et
  `lib/fridge.ts` ; le bouton « Au frigo » appelle
  `transferCheckedShoppingItemsToFridge`.

### Icônes

Aucune icône ne doit être redéfinie localement dans une page ou un composant.
Tout passe par `components/icons.tsx`, qui expose des composants prenant `size`
et `strokeWidth`. Ajouter une nouvelle icône là, jamais ailleurs.

---

## Trialité des aliments (Snapshot à référence optionnelle)

Modèle central du domaine. Un aliment traverse **trois états séparés**, liés
par un `ingredientId` optionnel (référentiel `lib/ingredients.ts`) :

| État | Type (`types/inventory.ts`) | Éditable ? | Rôle |
| --- | --- | --- | --- |
| Recette | `RecipeIngredient` | Non (immuable) | Référence écrite dans la recette |
| Courses | `ShoppingItem` | Oui (`customName`, `amount`, `unit`) | Copie éphémère pour les courses |
| Frigo | `FridgeItem` | Oui | Inventaire réel (stock + DLC) |

Chaque entrée courses / frigo a son propre UUID (`id`). Éditer le nom, l'unité
ou la quantité **ne modifie jamais** la recette d'origine et **ne supprime
jamais** l'`ingredientId` : le lien canonique survit au renommage
(« Tomate » → « Tomates cerises bio »).

### Unités & conversions (`lib/units.ts`)

Les unités sont regroupées en 3 familles (`UnitCategory`) :

| Famille | Base | Codes |
| --- | --- | --- |
| Masse | g | `g`, `kg` |
| Volume | ml | `ml`, `cl`, `l`, `c_cafe` (5 ml), `c_soupe` (15 ml), `verre` (200 ml) |
| Décompte | 1 | `piece`, `gousse`, `tranche`, `sachet`, `pincee`, `brin`, `poignee`, `botte`, `feuille`, `qs` |

`combineQuantities(a1, u1, a2, u2)` :

- masse / volume compatibles → addition en base, puis remontée (`≥ 1000 g` → kg,
  `≥ 1000 ml` → L) ;
- décompte → addition seulement si le code est **strictement identique** ;
- incompatible ou `qs` non absorbable → `null` (deux lignes séparées).

Alias legacy (`unite` → `piece`, `cas` → `c_soupe`, `cac` → `c_cafe`) via
`coerceUnitCode` / `normalizeUnit`. Le domaine Postgres `unit_domain` est aligné
sur ces codes.

Sélecteur UI partagé : `components/ui/unit-select.tsx` (optgroups par famille),
branché partout où une unité est éditable : ajout / édition de recette, ajout
frigo, ligne d'inventaire frigo, et liste de courses (mode `compact`).

### Flux Planning → Courses

1. L’utilisateur ouvre `ExportShoppingModal`
   (`components/planning/export-shopping-modal.tsx`) depuis
   `app/planning/page.tsx` et choisit les repas à exporter (créneau par créneau,
   jour entier, ou toute la semaine).
2. `collectIngredientsFromSelectedMeals` (`lib/planning.ts`) produit la liste
   plate d’ingrédients des repas cochés.
3. `appendIngredientsToShoppingList` (`lib/shopping-list.ts`) fusionne dans la
   liste existante :
   - pour chaque ingrédient, normaliser le nom (`normalizeProductName`) ;
   - chercher un `ShoppingItem` **non coché** par `ingredientId` **ou** nom
     normalisé ;
   - si trouvé : tenter `combineQuantities` ; si compatible, mettre à jour
     `amount`/`unit` ; sinon créer une nouvelle ligne ;
   - si non trouvé : créer un `ShoppingItem` (UUID, `ingredientId`, `customName`,
     qty, unit).
4. Persister dans `localStorage` (`my-kitchen-shopping-list-v2`).

Le bandeau d’export utilise `countExportImpact` + `sessionStorage`
(`my-kitchen-shopping-export-banner`).

`collectIngredientsFromDayOnward` reste disponible pour un export « à partir
d’un jour », mais l’UI passe désormais par la sélection granulaire.

### Flux Courses → Frigo

Fonction : `transferCheckedShoppingItemsToFridge` (`lib/fridge.ts`), déclenchée
par le bouton « Au frigo » sur `app/courses/page.tsx`.

1. Isoler les articles `isChecked: true`.
2. Pour chacun : matcher un `FridgeItem` par `ingredientId` ou nom normalisé ;
   si compatible → additionner ; sinon / absent → créer une entrée avec
   `addedAt` du jour (emplacement par défaut : `fridge`).
3. Supprimer **uniquement** les articles cochés de la liste
   (`clearCheckedShoppingItems`).
4. Persister le frigo (`my-kitchen-fridge-items-v2`).

---

## Persistance : le modèle hybride

C'est le point le plus important à comprendre avant de toucher au code.

**L'essentiel de l'état applicatif vit dans le `localStorage` du navigateur**,
pas dans Supabase. Supabase sert de stockage complémentaire côté serveur pour
les recettes enregistrées et un instantané d'inventaire (`pantry_items`) lu
par l'IA — l'app **n'écrit jamais** l'inventaire UI vers cette table.

Clés `localStorage` utilisées :

| Clé | Contenu | Module |
| --- | --- | --- |
| `my-kitchen-fridge-items-v2` | Inventaire frigo/congélateur/placards (snapshot) | `lib/fridge.ts` |
| `my-kitchen-shopping-list-v2` | Liste de courses (snapshot) | `lib/shopping-list.ts` |
| `my-kitchen-custom-recipes` | Recettes créées par l'utilisateur | `lib/recipes.ts` |
| `my-kitchen-recipe-overrides` | Modifications des recettes livrées | `lib/recipes.ts` |
| `my-kitchen-deleted-recipes` | Recettes livrées masquées | `lib/recipes.ts` |
| `my-kitchen-favorite-recipes` | Favoris | pages `app/recettes` |

Migration automatique depuis les clés legacy (`my-kitchen-fridge-items`,
`my-kitchen-shopping-list`) au premier chargement.

Deux exceptions au modèle `localStorage` :

- Le bandeau « X articles exportés » (`my-kitchen-shopping-export-banner`) vit
  dans le **`sessionStorage`** (`lib/shopping-list.ts`).
- Le **planning n'est pas persisté** : il reste dans l'état React de
  `app/planning/page.tsx` et disparaît au rechargement. La table
  `meal_plan_entries` existe dans le schéma mais n'est pas utilisée.

### Le pattern d'hydratation — à ne pas « corriger »

Les pages lisent le `localStorage` dans un `useEffect` vide et appellent
`setState` immédiatement :

```tsx
useEffect(() => {
  setItems(getFridgeItems());
  setReady(true);
}, []);
```

ESLint signale ces appels via `react-hooks/set-state-in-effect` (9 occurrences
actuellement). **Ces avertissements sont assumés et ne doivent pas être
« corrigés ».** L'état initial doit rester vide pour que le rendu serveur et le
premier rendu client concordent ; le `localStorage` n'est lisible qu'après
montage. Le drapeau `ready` évite d'écraser le stockage avec un état vide au
premier passage de l'effet d'écriture.

Les recettes livrées avec l'app sont un tableau en dur (`RECIPES` dans
`lib/recipes.ts`), fusionné à l'exécution avec les créations, modifications et
suppressions stockées côté client.

---

## Supabase

### Accès aux données

**L'application n'a pas d'écran de connexion.** Tous les accès passent par le
serveur avec la clé secrète, épinglés sur un unique utilisateur propriétaire
identifié par `KITCHEN_OWNER_ID`. La RLS reste active côté base et continue de
bloquer tout accès direct depuis le navigateur.

Le seul point d'entrée est `lib/supabase/admin.ts` :

- `createAdminClient()` — client Supabase typé, clé secrète, sans session ;
- `getOwnerId()` — UUID du propriétaire, requis pour toute écriture.

Les deux modules sont marqués `server-only` : les importer depuis un composant
client fait échouer le build, ce qui est voulu.

Pour initialiser le propriétaire sur une nouvelle base :
`node scripts/setup-owner.mjs` crée l'utilisateur et affiche l'UUID à recopier
dans `KITCHEN_OWNER_ID`.

### Schéma

Le schéma complet est typé dans `lib/supabase/database.types.ts` (fichier
généré — ne pas l'éditer à la main, le régénérer depuis Supabase). Tables
disponibles : `profiles`, `recipes`, `ingredients`, `recipe_ingredients`,
`recipe_tags`, `tags`, `pantry_items`, `meal_plan_entries`,
`shopping_list_items`, `aisles`, `seasonal_produce`, `cooking_tips`, plus la vue
`v_recipe_nutrition`.

Le domaine `unit_domain` accepte les codes familles (masse / volume / décompte)
listés plus haut. Les anciennes valeurs `unite` / `cas` / `cac` ont été migrées
vers `piece` / `c_soupe` / `c_cafe`.

Tables réellement lues ou écrites aujourd'hui :

- `recipes` et `recipe_ingredients` — enregistrement d'une recette
  (`lib/save-recipe.ts`) ;
- `ingredients` — résolution ou création d'un ingrédient au passage ;
- `pantry_items` — **lecture seule** de l'inventaire côté serveur
  (`lib/fridge-supabase.ts`). L'écran Frigo, lui, ne touche qu'au
  `localStorage`.

`meal_plan_entries` et `shopping_list_items` existent dans le schéma mais le
planning et la liste de courses restent 100 % côté client.

---

## Routes API

| Route | Rôle |
| --- | --- |
| `POST /api/recipes` | Enregistre une recette dans Supabase |
| `GET /api/fridge-inventory` | Lit l'inventaire (`pantry_items`) côté serveur |
| `POST /api/generate-from-fridge` | Génère des recettes à partir du frigo (Gemini) |
| `POST /api/parse-recipe` | Extrait une recette depuis une photo ou une URL (Gemini) |
| `GET /api/keep-alive` | Ping quotidien de la base — voir ci-dessous |

La génération (`/api/generate-from-fridge` et le modal associé) **préfère
`pantry_items`** s'il contient au moins `MIN_USABLE_FRIDGE_ITEMS` ingrédients
exploitables ; sinon elle retombe sur le snapshot `localStorage` envoyé par le
client. Les deux sources ne sont pas synchronisées.

`/api/keep-alive` n'a aucune fonction applicative. Un projet Supabase gratuit se
met en pause après une période d'inactivité ; le cron déclaré dans `vercel.json`
(tous les jours à minuit) appelle cette route, qui lit une ligne de `recipes`
pour remettre le compteur à zéro. Un service externe comme cron-job.org peut
jouer le même rôle.

---

## IA (Gemini)

Le client vit dans `lib/ai/gemini.ts`, marqué `server-only` : la clé API ne doit
jamais transiter par le navigateur, donc jamais de préfixe `NEXT_PUBLIC_`.

Deux usages, chacun avec son module de prompt et de parsing :

- `lib/ai/create-recipes-from-fridge.ts` — propose des recettes réalisables avec
  l'inventaire disponible ;
- `lib/ai/parse-recipe.ts` — transforme une photo ou une page web en recette
  structurée.

Le module `lib/generate-from-fridge.ts` fait le tri en amont : il commence par
chercher des correspondances dans le catalogue local et ne sollicite l'IA que si
nécessaire. `MIN_USABLE_FRIDGE_ITEMS` (dans `lib/fridge.ts`) fixe le nombre
minimum d'ingrédients exploitables avant de lancer une génération — les
basiques comme le sel ou l'huile ne comptent pas.

---

## Variables d'environnement

À définir dans `.env.local` en local, et dans les réglages du projet Vercel en
production.

| Variable | Requise | Utilité |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL du projet Supabase |
| `SUPABASE_SECRET_KEY` | oui | Clé secrète serveur (Project Settings → API Keys). Contourne la RLS, ne jamais l'exposer au client |
| `KITCHEN_OWNER_ID` | oui | UUID du profil propriétaire, fourni par `scripts/setup-owner.mjs` |
| `GEMINI_API_KEY` | pour l'IA | Clé Google Gemini. Sans elle, les routes de génération et d'import renvoient une erreur explicite, le reste de l'app fonctionne |
| `GEMINI_MODEL` | non | Force un modèle précis. Par défaut `gemini-3.6-flash` (`GEMINI_FLASH_MODEL`) |

`NEXT_PUBLIC_SUPABASE_ANON_KEY` peut encore figurer dans `.env.local` mais n'est
plus référencée nulle part dans le code.

---

## Conventions

- Le code, les commentaires et les libellés d'interface sont en français.
- Les commentaires expliquent une intention ou une contrainte non évidente,
  jamais ce que le code fait déjà lisiblement.
- Les imports internes passent par l'alias `@/`, jamais par des chemins relatifs
  remontants.
- Les dates et le calendrier passent par `lib/date-paris.ts`, qui ancre tout sur
  le fuseau Europe/Paris. Ne pas utiliser `new Date()` directement pour du
  calcul de jour ou de semaine.
- Les unités de mesure sont un ensemble fermé (`UnitCode` dans `lib/units.ts`),
  par familles masse / volume / décompte. Fusion via `combineQuantities` ;
  code invalide rejeté par Postgres `unit_domain` à l'insertion.
- **Protection des recettes** : toute édition dans courses ou frigo porte sur le
  snapshot local uniquement ; `ingredientId` reste figé
  (`updateShoppingItem`, renommage frigo, transfert).
- Couleurs de référence UI : vert `#2E5B3E`, fonds proches de `#F6F8F3` /
  `#F7F9F6`, cartes `rounded-2xl` / `rounded-3xl`.
