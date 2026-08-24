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

## RÈGLE : SYNCHRONISATION GITHUB
Quand l'utilisateur écrit "synchro git", "synchro", ou "met à jour github" :
1. S'il y a des changements locaux : exécute `git add .` puis analyse les fichiers modifiés pour rédiger un message de commit concis et clair en français (ex: "Ajout de la page frigo"). Ajoute la date et l'heure à la fin du message (fuseau horaire : Paris). Puis exécute : `git commit -m "Message de commit généré"`. Ne crée pas de commit vide si le working tree est propre.
2. Exécute la commande terminal : `git pull --rebase` (récupère les modifications distantes d'un collègue ou d'un agent IA et les pose proprement par-dessus tes commits locaux).
3. Si des conflits apparaissent : arrête-toi, liste les fichiers en conflit, et demande à l'utilisateur avant de continuer. N'utilise jamais `--force`, `--force-with-lease`, `--no-verify` ni `--no-gpg-sign`.
4. Une fois le code aligné et sans conflit, exécute la commande terminal : `git push`
5. Confirme à l'utilisateur que le PC et GitHub sont alignés, et que la mise à jour Vercel est lancée s'il y a eu un push.

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


## RÈGLE DE COHABITATION avec cursor (LOCALHOST ET GIT) 

Tu tournes actuellement sur la même machine locale qu'un autre agent IA nommé "Cursor". Pour que vous puissiez travailler en parallèle sans faire crasher Next.js ou écraser vos fichiers respectifs, tu dois appliquer ces règles absolues :

1. PORT LOCALHOST DÉDIÉ (3001) :
   - Le port `3000` est formellement réservé à Cursor. Tu n'as pas le droit de l'utiliser.
   - Lorsque tu lances le serveur Next.js pour tester tes développements, tu dois OBLIGATOIREMENT le forcer sur le port `3001`.
   - Utilise la commande de lancement : `npm run dev -- -p 3001` (ou configure la variable d'environnement `PORT=3001`).

2. ISOLATION DU CODE ET DES BRANCHES :
   - Interdiction formelle de modifier les mêmes fichiers que Cursor en même temps si vous êtes sur la même branche. Dans ce cas, travaille uniquement quand on te passe le relais (après une synchronisation Git).
   - Si tu dois exécuter une tâche en totale autonomie et en parallèle de Cursor, tu dois IMPÉRATIVEMENT créer une nouvelle branche Git avant de commencer à coder (ex: `git checkout -b feature/antigravity-task`).
   