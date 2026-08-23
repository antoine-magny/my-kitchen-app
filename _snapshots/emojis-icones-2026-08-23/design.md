# Design — emojis & icônes (23 août 2026)

## Palette utilisée par les visuels

| Rôle | Hex |
|---|---|
| Vert marque | `#4A7C59` |
| Vert hover / sélection | `#EBF2EC` |
| Vert clair (fond bouton lg, spinner) | `#F6F8F3` / `#C8E0CF` |
| Bordure douce | `#E2EBE3` |
| Texte secondaire | `#7A8F7D` |
| Ombre popover | `rgba(20,31,22,0.22)` |
| Cœur favori | `#E85D75` |
| Avatar nav | `#1C2B1E` |

## Icônes SVG (`components/icons.tsx`)

Convention unique :

- `viewBox="0 0 24 24"`
- `fill="none"` + `stroke="currentColor"`
- `strokeLinecap="round"` / `strokeLinejoin="round"`
- Props : `size`, `strokeWidth`, `className`

| Composant | size défaut | strokeWidth | Note |
|---|---|---|---|
| SearchIcon | 16 | 2.2 | |
| ClockIcon | 13 | 2.5 | |
| FlameIcon | 13 | 2.2 | |
| ProteinIcon | 13 | 2.2 | |
| MuscleIcon | 12 | 2.2 | |
| ChevronLeftIcon | 18 | 2.5 | |
| ChevronRightIcon | 16 | 2.5 | |
| ChevronDownIcon | 14 | 2.5 | |
| CheckIcon | 14 | 2.8 | |
| XIcon | 18 | 2.2 | |
| PlusIcon / MinusIcon | 14 | 2.5 | |
| TrashIcon | 14 | 2 | |
| EditIcon | 15 | 2.2 | |
| UsersIcon | 14 | 2.2 | |
| CalendarIcon | 14 | 2 | |
| SettingsIcon | 18 | 2 | |
| ChartIcon | 18 | 2.4 | |
| MoveIcon | 14 | 2.2 | |
| ImageIcon / CameraIcon / LinkIcon | 22 | 1.8 | |
| StarIcon | 12 | — | fill `currentColor` |
| MoreIcon | 16 | — | 3 points verticaux |
| HeartIcon | 16 | 2.2 | rose figé, `filled` / `light` |
| BookmarkIcon | 15 | 2.2 | |
| SpinnerIcon | 16 | 3 | monochrome, `animate-spin` |
| SpinnerBrandIcon | 28 | 3 | `#C8E0CF` + `#4A7C59` |

Règle projet : **jamais** de SVG local dans une page. Toute nouvelle icône
va dans `icons.tsx`.

## Sélecteur d’emojis (`EmojiPickerPopover`)

Déclencheur (3 tailles) :

| size | bouton | texte | rayon |
|---|---|---|---|
| `sm` | 28×28 (`h-7 w-7`) | `text-lg` | `rounded-lg` |
| `md` (défaut) | 36×36 (`h-9 w-9`) | `text-xl` | `rounded-xl` |
| `lg` | 56×56 (`h-14 w-14`) | `text-2xl` | `rounded-2xl` + bordure `#E2EBE3`, fond `#F6F8F3` |

Popover :

- Portal dans `document.body`, `position: fixed`, `z-index: 9999`
- Largeur 256 px, hauteur max 256 px (réduite selon l’espace)
- Grille **6 colonnes**, gap 6 px, padding 10 px
- Cases 36×36, `text-xl`, `rounded-xl`
- Hover / sélection : fond `#EBF2EC`
- Clic : `active:scale-90`
- Première case = `🍽️` (neutre)
- Ensuite `UNIQUE_EMOJI_INGREDIENTS` (pas de doublon visuel)
- Scroll interne autorisé ; scroll extérieur / resize / clic dehors = fermeture
- Marge bas 80 px (barre de navigation)

## Navigation (`bottom-nav.tsx`)

```
🏠 Accueil    📖 Recettes    📅 Planning    🧊 Frigo    🛒 Courses
```

- Emoji : `text-xl leading-none`
- Label : `text-xs font-semibold`, `#7A8F7D` / actif `#4A7C59`
- Point actif : 4×4 px, `#4A7C59`
- Avatar « A » : cercle 36 px, fond `#1C2B1E`

## Onglets frigo (`FRIDGE_TABS`)

| id | label | emoji |
|---|---|---|
| fridge | Réfrigérateur | 🧊 |
| freezer | Congélateur | ❄️ |
| pantry | Placards | 🏺 |

## Profil (`lib/profile.ts`)

Préférences : 💖 favoris · 🚫 à éviter · ⚠️ allergies
Objectifs : 🥗 perte · ⚖️ équilibre · 💪 prise de masse
Équipements : 🔥 🍳 ♨️ 🌀 🥤 🍟 🎛️ ⚖️ 🍲 🍖
Réglages : 👤 🔔 ❓
Thème (dans `settings-menu.tsx`) : ☀️ Clair · 🌙 Sombre
