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
- Ce dépôt est modifié en parallèle par **Cursor** et **Antigravity** (local + GitHub). Aucun agent n'est le seul auteur des fichiers.
- Ne jamais partir du principe d'être le seul à avoir touché le code : vérifier `git status` / historique distant avant d'écraser ou de « corriger » du travail.
- En synchro : `pull --rebase` obligatoire ; jamais de force-push ; en cas de conflit, s'arrêter et demander à l'utilisateur.

## RÈGLES DE SYNCHRONISATION GIT & DÉPLOIEMENT

### A) "synchro git" (alias : "synchro", "met à jour github")
But : photocopie de sécurité + CE dossier se cale sur main. PAS de production.
1. S'il y a des changements locaux : exécute `git add .` puis analyse les fichiers pour rédiger un message de commit concis en français (avec date/heure Paris). Puis exécute `git commit -m "..."`. Ne crée pas de commit vide.
2. Exécute `git fetch origin` puis `git pull --rebase origin main`.
3. Conflits : STOP, liste les fichiers en conflit, et demande à l'utilisateur. Jamais de `--force`, `--force-with-lease`, `--no-verify`, ni `--no-gpg-sign`.
4. Exécute `git push -u origin HEAD` (sauvegarde TA branche sur GitHub).
5. Confirme : le travail est sauvé sur GitHub sur CETTE branche, ce dossier est à jour vs main, PAS déployé en prod.
6. Rappelle à l'utilisateur : pour la prod, il faut dire "envoie en prod".
7. Rappelle à l'utilisateur : Cursor doit entendre "mets-toi à jour" dans SON dossier — tu ne touches JAMAIS au clone Cursor.

### B) "envoie en prod" (alias : "envoie en production", "fusion vers main")
Bouton rouge. Fusion de TA branche courante vers main → Vercel. Ne merger automatiquement QUE sur cette phrase. Si le working tree est sale : effectue d'abord un "synchro git" (A), puis cette action (B).
1. Refuse si tu es déjà sur `main` ; demande à être sur une branche.
2. Exécute `git fetch origin` puis `git pull --rebase origin main`. Conflits : STOP.
3. Exécute `git push -u origin HEAD`.
4. Fusion vers main : de préférence via `gh pr create` / `gh pr merge`. Sinon, `git checkout main`, `git pull --rebase origin main`, `git merge --no-ff <branche>`, `git push origin main`. Jamais de force-push.
5. Reviens sur TA branche de travail (ne reste pas à coder sur `main`).
6. Confirme : `main` est à jour, Vercel va déployer. Dis à l'utilisateur d'ouvrir Cursor et de taper "mets-toi à jour". Ne modifie jamais `C:\Users\Antoine\my-kitchen-app`.

### C) "mets-toi à jour" (alias : "mets toi à jour")
Uniquement pour CE dossier. Pas de merge main. Pas de prod.
1. Si le working tree est sale : d'abord commit (comme l'étape 1 de A).
2. Exécute `git fetch origin` puis `git pull --rebase origin main`. Conflits : STOP.
3. Push de la branche si elle a divergé (`git push`). Jamais de force-push.
4. Confirme : ce dossier a récupéré `main`. Pas de déploiement.
5. À la fin, confirme les fichiers que tu as modifiés dans TON clone. Ne touche pas au dossier Cursor.

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


## RÈGLES DE COHABITATION AVEC CURSOR (ANTIGRAVITY STRICT)

Tu tournes en parallèle avec un agent Cursor, mais dans un **clone physique distinct** pour éviter de corrompre le cache Next.js et de bloquer Git. Tu dois impérativement respecter ces règles dans CE workspace :

1. **DOSSIER DE TRAVAIL STRICT :**
   - Ton seul et unique environnement de travail est : `C:\Users\Antoine\my-kitchen-app-antigravity`.
   - Tu n'as **JAMAIS** l'autorisation d'ouvrir, de lire, de modifier des fichiers ou de lancer des commandes dans le clone Cursor (`C:\Users\Antoine\my-kitchen-app`).
   - Le fichier `.env.local` est déjà configuré ici et gitignoré. Ne le committe jamais et ne le copie pas manuellement depuis l'autre dossier.

2. **PORT LOCALHOST DÉDIÉ (3001) :**
   - Le port `3000` est formellement réservé à Cursor.
   - Ton serveur de dev doit **TOUJOURS** être lancé sur le port 3001.
   - Utilise EXCLUSIVEMENT la commande : `npm run dev -- -p 3001`.
   - N'ajoute pas de script `dev:3001` dans `package.json` (le flag `-p` reste local à tes lancements de terminal).

3. **GIT & BRANCHES (ISOLATION TOTALE) :**
   - **Jamais de code sur `main`** : Ne code jamais directement sur la branche `main` et n'y code jamais à deux.
   - **Une tâche = Une branche** : Avant toute modification, assure-toi d'être sur ta propre branche (ex: `git checkout -b feature/antigravity-...`).
   - **Synchro avant de pusher** : Toujours exécuter `git pull --rebase origin main` avant un `git push`.
   - **Interdictions strictes** : N'utilise JAMAIS `--force`, `--force-with-lease` ou `--no-verify`.
   - **Process de merge** : La livraison se fait via Pull Request (PR) vers `main`. Après le merge d'une PR (la tienne ou celle de Cursor), resynchronise ton environnement local : `git fetch`, `git checkout main`, `git pull --rebase`, `git checkout <ta-branche>`, `git rebase origin/main`.
   - **Conflits** : Si un conflit survient, arrête-toi immédiatement, liste les fichiers impactés et demande à l'utilisateur. Ne tente pas de résoudre seul des conflits probables avec Cursor.
