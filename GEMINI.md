# Règles du Projet

## RÈGLES DE CONVERSATION
- Réponds toujours par défaut en français.
- Sois concis, direct et pédagogique dans tes explications.

## RÈGLES D'ENVIRONNEMENT & ÉDITEUR
- Travaille toujours en arrière-plan sans forcer l'ouverture ou le focus des fichiers dans l'éditeur de l'utilisateur.
- Maintiens `"explorer.autoReveal": false` dans la configuration VS Code pour éviter de dérouler l'arborescence de l'explorateur sur son écran.

## RÈGLES D'AUTONOMIE & ACTIONS COURANTES SÉCURISÉES
Tu es pleinement mandaté pour exécuter proactivement et sans validation préalable toutes les actions courantes et sans risque pour produire du code :
1. **Inspection & Recherche** : `view_file` (lecture), `grep_search` (recherche), `list_dir` (arborescence), consultation de docs web.
2. **Écriture & Édition** : `replace_file_content` et `multi_replace_file_content` (modifications ciblées de code), `write_to_file` (création de fichiers du workspace).
3. **Validation & Contrôle** : exécution de tests locaux (`npx tsx scripts/...`), vérification de types (`npx tsc --noEmit`), linters et builds de test.
4. **Commandes Git & Synchronisation** : `git status`, `git diff`, `git log`, `git add .`, `git commit`, `git pull --rebase`, `git push` (entièrement pré-autorisées sans confirmation).
*Seules les opérations destructives irréversibles (ex. DROP table, suppression de données de production) nécessitent une confirmation explicite.*

## RÈGLES DE QUALITÉ DU CODE & ARCHITECTURE
- Écris un code clair, minimaliste (DRY - Don't Repeat Yourself) et facile à maintenir.
- Respecte strictement la stack technique du projet : Next.js 16 (App Router), React 19, Tailwind CSS v4, Supabase et Google Gemini.
- Respecte la séparation des responsabilités : le dossier `lib/` ne doit jamais contenir de JSX. Le dossier `app/` orchestre le rendu mais délègue la logique métier complexe à `lib/`.
- Utilise toujours l'alias `@/` pour les imports absolus depuis la racine.
- Priorise le `localStorage` pour l'état applicatif hybride (inventaire, listes) avant de synchroniser avec Supabase en arrière-plan. N'essaie pas de "corriger" les avertissements ESLint liés à ce pattern d'hydratation.
- Ne crée pas de nouvelles icônes SVG à la volée. Utilise ou enrichis exclusivement le composant centralisé `components/icons.tsx`.
- **RÈGLE EMOJIS & CATALOGUE :** Un même emoji peut représenter plusieurs ingrédients distincts (ex. 🥒 pour Courgette et Concombre). Toute grille/sélecteur d'emojis dans l'interface doit obligatoirement utiliser `UNIQUE_EMOJI_INGREDIENTS` de `@/lib/ingredients` (ou filtrer par `Set`) afin d'éliminer les doublons d'icônes identiques côte à côte.
- Ajoute la directive `'use client'` uniquement lorsque c'est strictly nécessaire (utilisation de hooks comme useState, useEffect ou d'événements interactifs).

## RÈGLE : MAINTENANCE DU README (DOCUMENTATION AUTOMATIQUE)
- Le fichier `README.md` est le manuel d'architecture du projet.
- Si notre conversation aboutit à la création d'une nouvelle table Supabase, d'une nouvelle variable d'environnement, ou d'une modification structurelle majeure (ex: refactoring important, nouvelle route API logicielle) : mets automatiquement à jour le fichier `README.md` à la fin de ta réponse pour refléter ces changements, sans que j'aie besoin de te le demander.

## RÈGLE : COLLABORATION MULTI-IA
- Ce dépôt GitHub unique est modifié en parallèle par **Cursor** et **Antigravity**, chacun dans son clone local (voir « ENVIRONNEMENTS LOCAUX DUAL-AGENT »). Aucun agent n'est le seul auteur des fichiers.
- Ne jamais partir du principe d'être le seul à avoir touché le code : vérifier `git status` / historique distant avant d'écraser ou de « corriger » du travail.
- Trois phrases-clés Git : « synchro git » (sauvegarde, pas de prod), « envoie en prod » (fusion de **ta** branche vers `main` → Vercel), « mets-toi à jour » (ce dossier se cale sur `main`, pas de prod). `pull --rebase` obligatoire ; jamais de force-push ; en cas de conflit, s'arrêter et demander à l'utilisateur. Ne merger automatiquement que sur « envoie en prod ».

## RÈGLE : SYNCHRONISATION GITHUB (« synchro git »)
Quand l'utilisateur écrit "synchro git", "synchro", ou "met à jour github" :
But : photocopie de sécurité + ce dossier se cale sur `main`. **Pas** de production.
1. S'il y a des changements locaux : exécute `git add .` puis analyse les fichiers modifiés pour rédiger un message de commit concis et clair en français (ex: "Ajout de la page frigo"). Ajoute la date et l'heure à la fin du message (fuseau horaire : Paris). Puis exécute : `git commit -m "Message de commit généré"`. Ne crée pas de commit vide si le working tree est propre.
2. Exécute : `git fetch origin`
3. Exécute : `git pull --rebase origin main` (ce dossier se cale sur le cahier officiel). Si des conflits apparaissent : arrête-toi, liste les fichiers en conflit, et demande à l'utilisateur avant de continuer. N'utilise jamais `--force`, `--force-with-lease`, `--no-verify` ni `--no-gpg-sign`.
4. Une fois le code aligné et sans conflit, exécute : `git push -u origin HEAD` (sauvegarde **ta** branche sur GitHub).
5. Confirme : le travail est sauvé sur GitHub sur **cette** branche ; ce dossier est à jour par rapport à `main` ; **pas** déployé en prod. Rappeler : pour la prod, dire « envoie en prod ». Rappeler : l'autre agent (Cursor) doit entendre « mets-toi à jour » dans **son** dossier — tu ne touches JAMAIS au clone Cursor (`C:\Users\Antoine\my-kitchen-app`).

## RÈGLE : ENVOI EN PRODUCTION (« envoie en prod »)
Quand l'utilisateur écrit "envoie en prod", "envoie en production", ou "fusion vers main" :
Bouton rouge. Fusion de **ta branche courante** vers `main` → Vercel.
Si le working tree est sale : d'abord exécuter la procédure « synchro git » ci-dessus, puis enchaîner.
1. Vérifier qu'on n'est PAS déjà sur `main`. Si on est sur `main` : refuser, demander une branche de travail.
2. `git fetch origin` puis `git pull --rebase origin main`. Conflits : STOP, lister les fichiers, demander à l'utilisateur. Jamais `--force`, `--force-with-lease`, `--no-verify`, `--no-gpg-sign`.
3. `git push -u origin HEAD`
4. Fusion vers `main` de préférence via GitHub CLI : créer une PR si besoin puis la merger (`gh pr create` / `gh pr merge`). Sinon : `git checkout main`, `git pull --rebase origin main`, `git merge --no-ff <branche>`, `git push origin main`. Jamais de force-push.
5. Revenir sur **ta** branche de travail (ne pas rester à coder sur `main`).
6. Confirme : `main` est à jour, Vercel va déployer. Dire à l'utilisateur d'ouvrir **Cursor** et de taper « mets-toi à jour ». Ne jamais modifier `C:\Users\Antoine\my-kitchen-app` (toi = Antigravity).

## RÈGLE : MISE À JOUR DU DOSSIER (« mets-toi à jour »)
Quand l'utilisateur écrit "mets-toi à jour" ou "mets toi à jour" :
Uniquement pour CE dossier (`C:\Users\Antoine\my-kitchen-app-antigravity`). Pas de merge vers `main`. Pas de prod.
1. Si le working tree est sale : d'abord commit comme « synchro git » (pas de perte).
2. Puis : `git fetch origin` + `git pull --rebase origin main`. Conflits : STOP, lister les fichiers, demander à l'utilisateur. Jamais `--force`, `--force-with-lease`, `--no-verify`, `--no-gpg-sign`.
3. Push de la branche si elle a divergé (`git push`). Jamais de force-push.
4. Confirme : ce dossier a récupéré `main`. Pas de déploiement.

## RÈGLE : OPTIMISATION ET REFACTORING SUR DEMANDE
Quand l'utilisateur écrit le mot-clé "optimisation", "optimise le code" ou "refactoring" :
Tu dois adopter le rôle d'un Architecte Logiciel Senior chargé d'auditer et de nettoyer le projet en profondeur.

Objectif : Faire une restructuration et une optimisation profonde de la base de code de l'application, SANS modifier aucune fonctionnalité existante ("Zéro Régression"). Le but est de rendre le code le plus lisible, modulaire et concis possible (DRY) pour économiser la fenêtre de contexte IA.

### Règles d'or absolues de l'optimisation
1. **NE RIEN CASSER (Zéro Régression)** : L'application doit fonctionner de manière 100% identique. Ne modifie JAMAIS la logique du `localStorage` (hydratation), le fonctionnement de l'API Gemini, les requêtes Supabase, ni les règles complexes de fusion des listes de courses.
2. **CONCIS & MODULAIRE** : Divise les fichiers trop longs (idéalement pas plus de 150/200 lignes). Si une page contient des modales ou des sections indépendantes, extrais-les dans des composants dédiés dans `components/`.
3. **SÉPARATION DES RESPONSABILITÉS** : Respecte l'architecture du projet. Le dossier `app/` ne doit faire que du rendu UI. Toute logique complexe, calcul, ou transformation de données doit être isolée dans `lib/`. Le dossier `lib/` ne doit jamais contenir de JSX.
4. **NETTOYAGE STRICT** : Élimine impitoyablement le code mort, les variables non lues, les fonctions non appelées, les commentaires obsolètes et les imports orphelins.

### Plan d'exécution interactif
N'applique JAMAIS toutes les modifications d'un coup. Procède obligatoirement ainsi :
- **Étape 1 (Audit)** : Parcours l'ensemble du projet et liste-moi brièvement (en français) les fichiers qui nécessitent un découpage, une restructuration ou un nettoyage selon toi.
- **Étape 2 (Validation)** : Arrête-toi et attends mon feu vert ("Go pour l'étape X"). Ne génère aucun code avant ma réponse.
- **Étape 3 (Action)** : Exécute le refactoring progressivement, fichier par fichier.
- **Étape 4 (Sauvegarde)** : Une fois le nettoyage terminé avec succès, propose-moi de faire un "synchro git".


## RÈGLE : ENVIRONNEMENTS LOCAUX DUAL-AGENT (2 DOSSIERS)
Deux agents dans un seul dossier plantent le cache `.next` et bloquent Git (un working tree = une branche à la fois). Deux dossiers physiques indépendants = chacun son `.next`, son `node_modules`, sa branche.

| Agent | Dossier | Commande | Port |
| --- | --- | --- | --- |
| Antigravity (toi) | `C:\Users\Antoine\my-kitchen-app-antigravity` | `npm run dev -- -p 3001` | **3001** |
| Cursor | `C:\Users\Antoine\my-kitchen-app` | `npm run dev` | **3000** |

- Même dépôt GitHub unique. Chacun sa branche. Fusions sur `main` → Vercel.
- Tu travailles EXCLUSIVEMENT dans `C:\Users\Antoine\my-kitchen-app-antigravity`.
- Tu ne dois JAMAIS ouvrir, modifier, ni lancer un serveur dans `C:\Users\Antoine\my-kitchen-app` (clone Cursor).
- Ne pas copier des fichiers à la main d'un dossier vers l'autre (sauf `.env.local` une fois à l'install).
- `.env.local` est gitignoré : il existe déjà dans ce clone, ne jamais le committer.
- N'ajoute pas de script `dev:3001` dans `package.json` : le flag `-p 3001` reste local à tes commandes.

## RÈGLE DE COHABITATION avec Cursor (LOCALHOST ET GIT)
Cursor et toi travaillez en parallèle dans 2 clones locaux distincts. Le travail parallèle est autorisé SI chacun est sur sa propre branche.

1. PORT LOCALHOST DÉDIÉ (3001) :
   - Le port `3000` est formellement réservé à Cursor. Tu n'as pas le droit de l'utiliser.
   - Lorsque tu lances le serveur Next.js, tu dois OBLIGATOIREMENT le forcer sur le port `3001` : `npm run dev -- -p 3001`.
   - Interdiction de lancer un serveur dans le dossier Cursor.

2. GIT — BRANCHES PARALLÈLES :
   - Jamais coder à deux sur `main`. Jamais coder sur `main` : crée une branche (`git checkout -b feature/antigravity-...`).
   - Un agent = une branche. Interdiction de modifier les mêmes fichiers en même temps sur la même branche.
   - Travail parallèle OK seulement si branches différentes.
   - « synchro git » = sauvegarde de ta branche, calage sur `main`, pas de prod.
   - « envoie en prod » = seul chemin vers `main` / Vercel (fusion de **ta** branche courante).
   - « mets-toi à jour » = ce dossier récupère `main`, sans merge ni déploiement. Cursor s'aligne uniquement si l'utilisateur tape la même phrase **dans Cursor**.
   - Jamais `--force`, `--force-with-lease`, `--no-verify`.
   - En cas de conflit : s'arrêter, lister les fichiers, demander à l'utilisateur. Ne pas résoudre seul si Cursor a probablement touché les mêmes fichiers.
   