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
| CI | GitHub Actions (`.github/workflows/ci.yml`) : `lint` + `build` à chaque push sur `main` (Node 22) |

> Next.js 16 introduit des ruptures par rapport aux versions précédentes. En cas
> de doute sur une API du framework, consulter `node_modules/next/dist/docs/`
> plutôt que de se fier à ses souvenirs.

Commandes : `npm run dev` (serveur local Cursor, port 3000), `npm run build`, `npm run lint`.
Pour un contrôle de types complet : `npx tsc --noEmit`.

---

## Dual-dev local (Cursor + Antigravity)

Deux clones du même dépôt : Cursor (`my-kitchen-app`, port 3000) et
Antigravity (`my-kitchen-app-antigravity`, port 3001). Jamais coder à deux
sur `main` ; travail parallèle OK si branches distinctes. Ne pas copier de
fichiers à la main d'un clone vers l'autre (sauf `.env.local` une fois).

Trois phrases à dire **dans l'éditeur concerné** (jamais toucher l'autre
dossier) : **synchro git** = photocopie de la branche + calage sur `main`
(pas de prod) ; **envoie en prod** = fusion de la branche courante vers
`main` → Vercel, puis « mets-toi à jour » chez l'autre ; **mets-toi à jour**
= ce dossier récupère `main`, sans merge ni déploiement.

---

## Architecture

### Arborescence

```
app/                    Routes App Router (une page par écran)
  layout.tsx            Shell global : polices Nunito/Lora + AppShell (BottomNav / SideNav)
  page.tsx              Accueil : date du jour (SSR) + repas / frigo (client)
  login/                Connexion / inscription (email, Google, Apple, invité)
  login/mot-de-passe-oublie/  Demande de réinitialisation du mot de passe
  nouveau-mot-de-passe/ Choix du nouveau mot de passe (après le lien e-mail)
  auth/callback/        Échange PKCE (OAuth Google + réinitialisation mot de passe)
  auth/guest/           Page de connexion anonyme (bouton invité + auto-login local)
  frigo/                Inventaire frigo / congélateur / placards
  planning/             Planning hebdomadaire des repas
  recettes/             Liste des recettes + détail dynamique [id]
  courses/              Liste de courses (+ transfert vers le frigo)
  parametres/           Profil & réglages (préférences, objectifs, équipements)
  api/                  Route Handlers (voir plus bas)
components/             Composants React partagés
  icons.tsx             Toutes les icônes SVG de l'app (props size / strokeWidth ; Eye, Google, Users…)
  auth-card.tsx         Carte partagée des écrans d'authentification (`/login`, mot de passe oublié, invité)
  bottom-nav.tsx        AppShell + barre du bas (< lg, 5 onglets + avatar)
  side-nav.tsx          Navigation latérale desktop (lg+)
  nav-config.ts         Onglets partagés + détection des pages auth
  ui/modal-layout.ts    Classes overlay / panneau des modales (centré + flou)
  ui/centered-modal.tsx Portail de modale compacte (nouvel ingrédient, DLC, courses)
  ui/unit-select.tsx    Sélecteur d'unités par familles (Masse / Volume / Décompte)
  ui/use-popover-dismiss.ts  Fermeture partagée des popovers portal
  home/                 Accueil : en-tête, repas du jour, suggestions, DLC
  frigo/                Composants propres à la page frigo (liste, modales, ligne)
  planning/             Header, board, modales + hook inventaire frigo
  parametres/           Cartes Profil + quiz (modal, tags, grille, options)
  recipe-form/          Champs partagés + hook `use-recipe-form.ts` (édition)
  add-recipe/           Parcours d'ajout (étapes) + hook `use-add-recipe-form.ts`
  login/                Champs + boutons Google / e-mail / invité
  recettes/             Header, grille, onglets ingrédients / étapes
  courses/              En-tête, bannière, actions de la liste
  generate-from-fridge-modal.tsx  Génération de recettes depuis le planning
  select-recipe-modal.tsx         Choix d'une recette du catalogue
lib/                    Logique métier, sans JSX
  units.ts              Familles d'unités + combineQuantities
  unit-aliases.ts       Alias / libellés d'unités (sans combineQuantities)
  format-auth-error.ts  Messages d'erreur Auth (profil)
  load-fridge-inventory.ts  Choix inventaire Supabase vs localStorage
  popover-position.ts   Clamp / placement vertical des popovers
  ingredient-icons.ts   Émojis, hex OpenMoji, mots-clés visuels
  profile.ts            Données du profil utilisateur (démo, non persistées)
  user-name.ts          Prénom affiché (métadonnées Auth, puis `profiles.full_name`)
  update-profile.ts     Enregistrement du profil (Auth + table `profiles`)
  auth-signup.ts        Détection d'un compte email déjà existant
  auth-google.ts        OAuth Google, sanitization du `next`, refus de liaison à un compte email
  auth-password.ts      Réinitialisation du mot de passe (chemins, messages, URL de callback)
  auth-guest.ts         Connexion anonyme (invité), auto-login en `next dev`
  shopping-list.ts      Export Planning → Courses (fusion / déduplication)
  fridge.ts             Inventaire local + transfert Courses → Frigo
  ingredients.ts        Référentiel canonique (ingredientId)
  planning.ts           Construction de semaine + agrégation d'ingrédients
  recipe-model.ts       Types Recipe : tags multiples, coût, difficulté
  recipe-filters.ts     Filtrage du catalogue (tags, temps, difficulté, coût, recherche)
  recipe-time.ts        parseMinutes (filtres, save-recipe, planning)
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

- `app/planning/page.tsx` hydrate / persiste le localStorage (`getStoredMealPlans` /
  `saveMealPlans`) puis délègue l'UI à `components/planning/planning-board.tsx`.
  La construction d'une semaine et l'agrégation d'ingrédients vivent dans
  `lib/planning.ts`.
- `app/frigo/page.tsx` hydrate / persiste le localStorage puis délègue liste et
  modales à `components/frigo/`.
- Les deux modales de recette restent séparées : `recipe-form-modal.tsx`
  (édition, état dans `recipe-form/use-recipe-form.ts`) et `add-recipe-modal.tsx`
  (ajout en 3 modes, état dans `add-recipe/use-add-recipe-form.ts`). Elles
  partagent `recipe-form/recipe-meta-fields.tsx` et
  `recipe-form/recipe-ingredients-fields.tsx`.
- `app/planning/page.tsx` délègue le choix de recette à
  `components/select-recipe-modal.tsx` et la génération IA à
  `components/generate-from-fridge-modal.tsx` (via `planning-modals.tsx`).
  L'inventaire affiché est chargé par `lib/load-fridge-inventory.ts`.
- `app/recettes/page.tsx` orchestre la liste ; le filtrage (multi-tags, temps,
  difficulté, coût, recherche titre + ingrédients) vit dans
  `lib/recipe-filters.ts`. Header, grille, pilules et panneau sont dans
  `components/recettes/`.
- `app/courses/page.tsx` délègue fusion / transfert à `lib/shopping-list.ts` et
  `lib/fridge.ts` ; le chrome UI est dans `components/courses/courses-chrome.tsx`.
- Les écrans d'auth (`login-form`, mot de passe oublié, nouveau mot de passe,
  invité) partagent `components/auth-card.tsx` ; la logique vit dans
  `lib/auth-google.ts`, `lib/auth-signup.ts`, `lib/auth-password.ts` et
  `lib/auth-guest.ts` et `lib/auth-apple.ts`. Les boutons du formulaire de login sont dans
  `components/login/`.

### Modales

Toutes les feuilles (frigo, courses, planning, recettes) passent par
`components/ui/modal-layout.ts` : overlay **centré** (`items-center`, `p-4`),
carte `rounded-3xl` avec `max-w-md` / `max-w-xl`, `max-h-[85dvh]` et
`overflow-y-auto`, flou d’arrière-plan identique au desktop
(`bg-[rgba(20,31,22,0.55)]` + `backdrop-blur-[4px]`). Pas de bottom sheet
(`items-end`, `rounded-t-3xl`, pleine largeur collée aux bords). Z-index
inchangés : 60 / 70 / 100.

### Icônes

Aucune icône ne doit être redéfinie localement dans une page ou un composant.
Tout passe par `components/icons.tsx`, qui expose des composants prenant `size`
et `strokeWidth`. Ajouter une nouvelle icône là, jamais ailleurs.

### Emojis ingrédients (`lib/ingredients.ts` → `components/ui/emoji-picker-popover.tsx`)

Chaque ingrédient du catalogue possède un emoji visuel (🍅, 🧀, 🥕…). Plusieurs
ingrédients peuvent partager le même emoji (ex. 🥒 → Courgette *et* Concombre).

**`UNIQUE_EMOJI_INGREDIENTS`** (`lib/ingredients.ts`) : liste dédupliquée du
catalogue, un seul ingrédient par emoji visuel unique. **Obligatoire** dans tout
sélecteur ou grille d'emojis afin d'éliminer les icônes identiques côte à côte.

**`DEFAULT_INGREDIENT_ICON`** (`2205` / ∅) : icône neutre par défaut quand aucun
ingrédient n'est reconnu ou quand l'utilisateur reset le choix.

Le composant partagé **`EmojiPickerPopover`** (`components/ui/emoji-picker-popover.tsx`)
affiche la grille de sélection. Points d'architecture :

- **Rendu via `createPortal`** dans `document.body` pour échapper aux
  `overflow: hidden` et contextes d'empilement des parents.
- **Position `fixed`** calculée dynamiquement via `getBoundingClientRect()` au
  clic, avec anti-débordement droite et ouverture vers le haut si nécessaire.
- **Scroll interne préservé** : le listener `scroll` (capture) distingue le
  scroll intérieur à la grille (autorisé) du scroll extérieur (ferme le popover).
- Fermeture automatique au clic extérieur, scroll extérieur et resize.
- Utilisé dans : `app/courses/page.tsx`, `components/frigo/ingredient-row.tsx`,
  `components/frigo/add-modal.tsx`.

### Profil & Paramètres (`/parametres`)

Écran de réglages accessible depuis l'engrenage de l'en-tête d'accueil. **À ce
stade, l'interface seule est en place** : aucune valeur n'est persistée ni
envoyée à Supabase.

- `app/parametres/page.tsx` est un **Server Component** : il assemble les
  sections sans état propre.
- Les données affichées (préférences, objectifs, équipements, entrées de menu)
  sont des constantes de démonstration dans `lib/profile.ts`.
- Seules les cartes réellement interactives sont `'use client'` :
  `preference-card.tsx` (tags), `goals-card.tsx` (objectif + kcal/protéines),
  `equipment-card.tsx` (matériel disponible) et `settings-menu.tsx` (thème).
  Chacune garde son état dans un `useState` local, perdu au rechargement.
- **Déconnexion** (`settings-menu.tsx`) : `localStorage.clear()` puis
  `supabase.auth.signOut()`, redirection vers `/login`.
- Boutons encore inertes, en attente de la logique métier : statistiques, test
  de profil culinaire, gestion du compte, notifications, aide, thème.

Quand la persistance des préférences arrivera, elle devra suivre le modèle
hybride du projet : `localStorage` d'abord, Supabase en arrière-plan.

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

### Unités & conversions (`lib/units.ts` & `lib/ingredients.ts`)

Les unités sont regroupées en 3 familles (`UnitCategory`) :

| Famille | Base | Codes |
| --- | --- | --- |
| Masse | g | `g`, `kg` |
| Volume | ml | `ml`, `cl`, `l`, `c_cafe` (5 ml), `c_soupe` (15 ml), `verre` (200 ml) |
| Décompte | 1 | `piece`, `gousse`, `tranche`, `sachet`, `pincee`, `brin`, `poignee`, `botte`, `feuille`, `qs` |

**Unités variables par aliment & Règle par défaut :**
- Chaque aliment du référentiel (`lib/ingredients.ts`) possède une unité par défaut `defaultUnit` (ex: `gousse` pour Ail, `g` pour Farine/Viande, `ml` pour Lait, `tranche` pour Melon/Pain) et une unité de décompte dédiée `countUnit`.
- Si un ingrédient ou une unité n'est pas reconnu par l'IA ou la saisie libre, l'application et l'IA attribuent par défaut l'unité **`piece`** (`DEFAULT_UNIT = "piece"`).
- Les équivalences nutritionnelles moyennes (`gramsPerCountUnit`, `mlPerCountUnit`) permettent la conversion automatique (ex: `1 gousse d'ail = 5 g`).
- **Correction orthographique intelligente (`lib/fuzzy-search.ts`) :** Algorithme hybride basé sur la distance de Levenshtein et la réduction des consonnes doubles pour matcher les aliments même avec des fautes de frappe ou d'orthographe (ex: « mozarella » → `Mozzarella`, « courgete » → `Courgette`, « echalotte » → `Échalote`).

`combineQuantities(a1, u1, a2, u2, ingredientNameOrId?)` :

- unités identiques → addition directe (avec auto-conversion `≥ 1000 g` → kg, `≥ 1000 ml` → L) ;
- masse / volume compatibles → addition en base ml / g ;
- décompte $\leftrightarrow$ masse/volume → conversion automatique sans doublon si l'aliment a une équivalence connue (ex: 10g d'ail + 1 gousse = 3 gousses d'ail) ;
- incompatible ou `qs` non absorbable → `null` (deux lignes séparées).

Alias legacy (`unite` → `piece`, `cas` → `c_soupe`, `cac` → `c_cafe`) via
`coerceUnitCode` / `normalizeUnit`. Le domaine Postgres `unit_domain` est aligné
sur ces codes.

Sélecteur UI partagé : `components/ui/unit-select.tsx` (menu déroulant interactif stylisé avec popover par familles Masse / Volume / Décompte),
qui adapte dynamiquement la section **Décompte** à l'ingrédient actif (proposant son unité naturelle + `Pièce` + `Quantité suffisante`). Auto-sélection intelligente de l'unité lors de la saisie d'un ingrédient dans l'ajout/édition de recette et le frigo.

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
| `my-kitchen-meal-plans-v1` | Planning hebdomadaire des repas | `lib/planning.ts` |
| `my-kitchen-profile-v1` | Préférences, objectifs, équipements et réponses au quiz culinaire | `lib/profile-store.ts` |
| `my-kitchen-custom-recipes` | Recettes créées par l'utilisateur | `lib/recipes.ts` |
| `my-kitchen-recipe-overrides` | Modifications des recettes livrées | `lib/recipes.ts` |
| `my-kitchen-deleted-recipes` | Recettes livrées masquées | `lib/recipes.ts` |
| `my-kitchen-favorite-recipes` | Favoris | pages `app/recettes` |

Migration automatique depuis les clés legacy (`my-kitchen-fridge-items`,
`my-kitchen-shopping-list`) au premier chargement.

Deux exceptions au modèle `localStorage` :

- Le bandeau « X articles exportés » (`my-kitchen-shopping-export-banner`) vit
  dans le **`sessionStorage`** (`lib/shopping-list.ts`).
- Le **planning est désormais persisté** localement. Il est conservé dans le
  `localStorage` via la clé `my-kitchen-meal-plans-v1` et partagé avec
  l'accueil pour afficher le repas du jour. La table `meal_plan_entries` 
  existe dans le schéma Supabase mais n'est pas encore utilisée.

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
`lib/recipes-data.ts`), fusionné à l'exécution avec les créations, modifications et
suppressions stockées côté client (`lib/recipes.ts`).

Chaque recette a **plusieurs tags** (`entree`, `plat`, `dessert`, `encas`,
`express` si ≤ 15 min, `vegetarien`, `riche_en_proteines`) et un **coût**
(`economique` | `moyen` | `premium`). L'ancien champ unique `tag` (libellés
français) est encore lu au chargement du `localStorage` et migré vers `tags[]`.
Les favoris restent à part (`lib/favorites.ts`). La recherche du catalogue porte
sur le titre **et** les noms d'ingrédients.

---

## Supabase

### Accès aux données & Sécurité (Multi-utilisateurs)

L'application est multi-utilisateurs. Toutes les routes hors `/login` et `/auth/*`
sont protégées par `middleware.ts` (session Supabase via cookies).
`/nouveau-mot-de-passe` exige une session de recovery (posée par `/auth/callback`).
La barre de navigation est masquée sur `/login`, `/nouveau-mot-de-passe` et `/auth`.
En dessous de `lg`, c'est la barre du bas (`BottomNav`, `fixed bottom`, offset
`--nav-offset` avec safe-area). Dès `lg`, une barre latérale gauche (`SideNav`,
largeur `--sidebar-width`) remplace la tab bar ; le contenu a `lg:pl-[var(--sidebar-width)]`
et `--nav-offset` redevient un petit padding bas.

#### Écran `/login`

Onglets Connexion / Inscription, puis dans l'ordre :

1. **Google et Apple** — des boutons pour l'inscription et la connexion (`signInWithGoogle`, `signInWithApple`).
2. **Email / mot de passe** — à l'inscription, le prénom va dans les métadonnées
   Auth (`full_name`). Affichage / masquage du mot de passe (`EyeIcon` /
   `EyeOffIcon`). Lien « Mot de passe oublié ? » (préremplit l'e-mail s'il est
   déjà saisi).
3. **Invité** — `signInAnonymously()` (voir plus bas).

Les messages d'erreur sont personnalisés (`lib/auth-google.ts`,
`lib/auth-signup.ts`). Si l'adresse existe déjà côté Google mais pas en email,
`getUserProviders` (`app/login/actions.ts`, via le client admin) affiche
« Veuillez vous connecter avec Google » plutôt qu'un générique
« Invalid login credentials ».

#### Modes d'authentification

- **Email / mot de passe** : `signUp` / `signInWithPassword`.
- **Google / Apple** : `signInWithOAuth({ provider: "google" | "apple" })` → `/auth/callback`
  (`exchangeCodeForSession`, cookies). `prompt=select_account` pour Google.
- **Invité** : utilisateur temporaire `is_anonymous`, même RLS (`auth.uid()`),
  pas d'e-mail. Prénom affiché « Invité », libellé profil « Compte invité ».
  Session perdue à la déconnexion, au nettoyage du navigateur, ou sur un autre
  appareil. Connexion côté **navigateur** (`/auth/guest` + bouton login).
  Le middleware valide la session via Auth ; si Supabase est injoignable
  depuis Node (certificat local / antivirus), il lit le JWT cookie.
  La modale « Modifier mon profil » convertit le compte via `updateUser`
  (e-mail + mot de passe) et synchronise `profiles.full_name`.
- **Auto-login local** : désactivé par défaut (même flux qu'en production :
  page `/login`). En `next dev`, `DEV_AUTO_GUEST=1` redirige une visite hors
  `/login`, `/auth/*` et `/nouveau-mot-de-passe` sans session vers
  `/auth/guest` (un seul essai, puis `/login` pour éviter une boucle). Jamais
  actif en production.
- **Mot de passe oublié** : `/login/mot-de-passe-oublie` →
  `resetPasswordForEmail` (ne révèle pas si l'adresse existe). Le lien e-mail
  revient sur `/auth/callback?next=/nouveau-mot-de-passe`, puis
  `updateUser({ password })` (minimum 6 caractères).
- **Pas de double compte** : `isExistingAccountSignUp` (erreur
  `user_already_exists`, ou utilisateur « fantôme » sans `identities`). Si
  Google tente de se lier à un compte email déjà existant, `/auth/callback`
  refuse (`rejectGoogleLinkedToEmailAccount` : unlink + signOut) et renvoie
  vers `/login?error=account_exists`.

Le trigger `handle_new_user` recopie `full_name` (repli `name` / `given_name`
pour Google, « Invité » pour l'anonyme) dans `profiles.full_name`.

**Activation dashboard (pas de variable d'environnement Next.js pour OAuth)** :

1. [Google Auth Platform](https://console.cloud.google.com/auth/clients/create) → client OAuth **Web** :
   - origines JS : `http://localhost:3000` et `https://my-kitchen-app-liard.vercel.app` ;
   - URI de redirection : `https://flzelbbjtzyuorpeaofe.supabase.co/auth/v1/callback`.
2. [Fournisseur Google](https://supabase.com/dashboard/project/flzelbbjtzyuorpeaofe/auth/providers?provider=Google) : activer et coller Client ID + Client Secret.
3. [URL Configuration](https://supabase.com/dashboard/project/flzelbbjtzyuorpeaofe/auth/url-configuration) → Redirect URLs :
   `http://localhost:3000/auth/callback` et `https://my-kitchen-app-liard.vercel.app/auth/callback`.
4. [Fournisseurs Auth](https://supabase.com/dashboard/project/flzelbbjtzyuorpeaofe/auth/providers) → activer **Anonymous Sign-Ins** (requis pour le bouton invité).
5. [Fournisseur Apple](https://supabase.com/dashboard/project/flzelbbjtzyuorpeaofe/auth/providers?provider=Apple) : nécessitera l'identifiant de service (Service ID) et la clé secrète depuis Apple Developer.

**Sécurité (RLS)** : chaque utilisateur ne lit / écrit / supprime que ses
propres lignes (`user_id` = `auth.uid()`). Côté serveur, le client
`@supabase/ssr` (`lib/supabase/server.ts`) applique l'identité de la session.

Le client administrateur (`createAdminClient`, clé secrète) sert uniquement à :

- le ping keep-alive (`/api/keep-alive`) ;
- `getUserProviders` (détection du fournisseur d'un e-mail déjà inscrit).

Il ne doit jamais être importé depuis un composant client.

**Isolation des données locales** :
À la déconnexion, le `localStorage` est entièrement effacé pour qu'aucune
donnée (frigo, courses, recettes locales) ne fuite entre deux sessions sur
le même appareil.

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

- `profiles` — prénom / nom du compte (`lib/update-profile.ts`, déclenché par la modale « Modifier mon profil ») ainsi que les **préférences du profil (objectifs, quiz, tags)** via la synchronisation d'arrière-plan (`lib/profile-supabase.ts`). *Note : la colonne `preferences` (JSONB) doit être ajoutée manuellement à la table.*
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
| `GET /auth/callback` | Échange le code PKCE (OAuth Google ou réinitialisation mot de passe) contre une session (cookies) |
| `/auth/guest` | Page de connexion anonyme (`signInAnonymously` côté navigateur), puis redirection vers `next` |
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Clé publique anonyme (pour l'authentification client) |
| `SUPABASE_SECRET_KEY` | oui | Clé secrète serveur. Contourne la RLS (keep-alive + détection des fournisseurs Auth) |
| `GEMINI_API_KEY` | pour l'IA | Clé Google Gemini. Sans elle, les routes de génération et d'import renvoient une erreur explicite, le reste de l'app fonctionne |
| `GEMINI_MODEL` | non | Force un modèle précis. Par défaut `gemini-3.6-flash` (`GEMINI_FLASH_MODEL`) |
| `DEV_AUTO_GUEST` | non | Uniquement en local. `1` / `true` active l'auto-connexion invité (`next dev` la laisse désactivée par défaut) |

La CI GitHub Actions n'a pas les secrets Vercel. Le workflow injecte des valeurs
factices pour `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` afin
que `next build` puisse pré-rendre les pages client qui instancient le client
navigateur (ex. `/nouveau-mot-de-passe`). Ces valeurs ne sont pas utilisées en
production.



---

## Conventions

- Le code, les commentaires et les libellés d'interface sont en français.
- Les commentaires expliquent une intention ou une contrainte non évidente,
  jamais ce que le code fait déjà lisiblement.
- Les imports internes passent par l'alias `@/`, jamais par des chemins relatifs
  remontants.
- Les dates et le calendrier passent par `lib/date-paris.ts`, qui ancre tout sur
  le fuseau Europe/Paris. Ne pas utiliser `new Date()` directement pour du
  calcul de jour ou de semaine. Les libellés affichés (ex. « Dimanche 23 août »)
  sont construits avec des tableaux FR, sans `toLocaleDateString`, pour éviter
  un mismatch d'hydratation Node vs navigateur.
- Les unités de mesure sont un ensemble fermé (`UnitCode` dans `lib/units.ts`),
  par familles masse / volume / décompte. Fusion via `combineQuantities` ;
  code invalide rejeté par Postgres `unit_domain` à l'insertion.
- **Protection des recettes** : toute édition dans courses ou frigo porte sur le
  snapshot local uniquement ; `ingredientId` reste figé
  (`updateShoppingItem`, renommage frigo, transfert).
- Couleurs de référence UI : vert `#2E5B3E`, fonds proches de `#F6F8F3` /
  `#F7F9F6`, cartes `rounded-2xl` / `rounded-3xl`.
