import { useState } from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
function BookIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function FridgeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="5" y1="10" x2="19" y2="10" /><line x1="10" y1="7" x2="10" y2="10" /><line x1="10" y1="14" x2="10" y2="18" />
    </svg>
  )
}
function CartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
function TipIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="4" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}
function MuscleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5c3.5-3.5 9-3.5 12 0s3 8.5 0 12-8.5 3-12 0" /><path d="M6.5 17.5c-3 3-2 7 2 6" /><path d="m10 20 4-4" />
    </svg>
  )
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#E85D75' : 'none'} stroke={filled ? '#E85D75' : 'white'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type Filter = 'Tout' | 'Express' | 'Végétarien' | 'Riche en protéines' | 'Desserts'

const FILTERS: Filter[] = ['Tout', 'Express', 'Végétarien', 'Riche en protéines', 'Desserts']

const NAV_ITEMS = [
  { label: 'Accueil',  icon: HomeIcon },
  { label: 'Recettes', icon: BookIcon },
  { label: 'Frigo',    icon: FridgeIcon },
  { label: 'Courses',  icon: CartIcon },
  { label: 'Astuces',  icon: TipIcon },
]

interface Recipe {
  id: number
  title: string
  photo: string
  time: string
  calories: number
  proteins: number
  tag: Filter | null
  tagLabel?: string
  featured?: boolean
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    title: 'Filet de bœuf, jus de truffe & légumes racines',
    photo: 'https://images.unsplash.com/photo-1663530761401-15eefb544889?w=900&h=560&fit=crop&auto=format',
    time: '45 min',
    calories: 680,
    proteins: 52,
    tag: 'Riche en protéines',
    tagLabel: 'Signature',
    featured: true,
  },
  {
    id: 2,
    title: 'Dos de cabillaud, vierge d\'herbes & fenouil braisé',
    photo: 'https://images.unsplash.com/photo-1676471926534-d5c9771909fa?w=600&h=400&fit=crop&auto=format',
    time: '30 min',
    calories: 380,
    proteins: 34,
    tag: 'Riche en protéines',
    tagLabel: 'Léger',
  },
  {
    id: 3,
    title: 'Salade de burrata, tomates rôties & basilic',
    photo: 'https://images.unsplash.com/photo-1771759441598-0105381b2e70?w=600&h=400&fit=crop&auto=format',
    time: '15 min',
    calories: 280,
    proteins: 12,
    tag: 'Végétarien',
    tagLabel: 'Express',
  },
  {
    id: 4,
    title: 'Buddha bowl quinoa, avocat & pois chiches croustillants',
    photo: 'https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=600&h=400&fit=crop&auto=format',
    time: '20 min',
    calories: 420,
    proteins: 18,
    tag: 'Végétarien',
    tagLabel: 'Végétarien',
  },
  {
    id: 5,
    title: 'Saumon fumé mi-cuit, crème citronnée & câpres',
    photo: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop&auto=format',
    time: '25 min',
    calories: 450,
    proteins: 42,
    tag: 'Riche en protéines',
    tagLabel: 'Protéines',
  },
  {
    id: 6,
    title: 'Poulet rôti, jus corsé & pommes de terre grenaille',
    photo: 'https://images.unsplash.com/photo-1539735257177-0d3949225f96?w=600&h=400&fit=crop&auto=format',
    time: '18 min',
    calories: 510,
    proteins: 38,
    tag: 'Express',
    tagLabel: 'Express',
  },
  {
    id: 7,
    title: 'Moelleux au chocolat noir, cœur coulant praliné',
    photo: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&auto=format',
    time: '35 min',
    calories: 520,
    proteins: 8,
    tag: 'Desserts',
    tagLabel: 'Dessert',
  },
  {
    id: 8,
    title: 'Grande salade fraîche, vinaigrette miel & moutarde',
    photo: 'https://images.unsplash.com/photo-1778690103044-88ad0e274e32?w=600&h=400&fit=crop&auto=format',
    time: '12 min',
    calories: 240,
    proteins: 10,
    tag: 'Express',
    tagLabel: 'Express',
  },
  {
    id: 9,
    title: 'Sauce poisson maison, légumes poêlés',
    photo: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf9?w=600&h=400&fit=crop&auto=format',
    time: '40 min',
    calories: 390,
    proteins: 29,
    tag: 'Végétarien',
    tagLabel: 'Gastronomique',
  },
]

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Signature':     { bg: 'rgba(28,43,30,0.72)', text: '#E8F5EC' },
  'Express':       { bg: 'rgba(249,115,22,0.88)', text: '#FFF' },
  'Léger':         { bg: 'rgba(74,124,89,0.82)', text: '#FFF' },
  'Végétarien':    { bg: 'rgba(74,124,89,0.82)', text: '#FFF' },
  'Protéines':     { bg: 'rgba(59,130,246,0.80)', text: '#FFF' },
  'Dessert':       { bg: 'rgba(219,85,108,0.85)', text: '#FFF' },
  'Gastronomique': { bg: 'rgba(161,124,61,0.85)', text: '#FFF' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecipeCard({ recipe, onToggleFav, isFav }: {
  recipe: Recipe
  onToggleFav: (id: number) => void
  isFav: boolean
}) {
  const tagCfg = recipe.tagLabel ? TAG_COLORS[recipe.tagLabel] ?? TAG_COLORS['Signature'] : null

  return (
    <div
      className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 2px 16px rgba(28,43,30,0.07)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200, background: '#D4EDD9' }}>
        <img
          src={recipe.photo}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(28,43,30,0.48) 0%, transparent 55%)' }}
        />
        {/* Tag */}
        {tagCfg && recipe.tagLabel && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-700"
            style={{ background: tagCfg.bg, color: tagCfg.text, backdropFilter: 'blur(4px)' }}
          >
            {recipe.tagLabel}
          </div>
        )}
        {/* Heart */}
        <button
          onClick={() => onToggleFav(recipe.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: isFav ? 'rgba(255,255,255,0.95)' : 'rgba(28,43,30,0.35)',
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Ajouter aux favoris"
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-4">
        <h3
          className="text-sm font-700 leading-snug mb-3 line-clamp-2"
          style={{ fontFamily: "'Lora', serif", color: '#1C2B1E', minHeight: 40 }}
        >
          {recipe.title}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5" style={{ color: '#4A7C59' }}>
            <ClockIcon />
            <span className="text-xs font-600" style={{ color: '#4A7C59' }}>{recipe.time}</span>
          </div>
          <div
            className="w-px h-3 rounded-full"
            style={{ background: '#E2EBE3' }}
          />
          <div className="flex items-center gap-1.5" style={{ color: '#F97316' }}>
            <FlameIcon />
            <span className="text-xs font-600" style={{ color: '#7A8F7D' }}>{recipe.calories} kcal</span>
          </div>
          <div
            className="w-px h-3 rounded-full"
            style={{ background: '#E2EBE3' }}
          />
          <div className="flex items-center gap-1.5" style={{ color: '#3B82F6' }}>
            <MuscleIcon />
            <span className="text-xs font-600" style={{ color: '#7A8F7D' }}>{recipe.proteins}g</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-700 border transition-all duration-200 hover:bg-[#4A7C59] hover:text-white hover:border-[#4A7C59] group/btn"
          style={{
            color: '#4A7C59',
            borderColor: '#C8E0CF',
            background: '#F4F9F5',
          }}
        >
          <PlusIcon />
          Ajouter au planning
        </button>
      </div>
    </div>
  )
}

function FeaturedCard({ recipe, onToggleFav, isFav }: {
  recipe: Recipe
  onToggleFav: (id: number) => void
  isFav: boolean
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden relative mb-8 group cursor-pointer"
      style={{
        height: 340,
        background: '#1C2B1E',
        boxShadow: '0 12px 48px rgba(28,43,30,0.20)',
      }}
    >
      <img
        src={recipe.photo}
        alt={recipe.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(10,20,12,0.85) 0%, rgba(10,20,12,0.30) 50%, transparent 100%)',
        }}
      />

      {/* Top badges */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-800 tracking-wider"
          style={{ background: '#4A7C59', color: '#FFFFFF', letterSpacing: '0.08em' }}
        >
          RECETTE DU JOUR
        </div>
      </div>

      {/* Heart */}
      <button
        onClick={() => onToggleFav(recipe.id)}
        className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: isFav ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(6px)',
        }}
        aria-label="Ajouter aux favoris"
      >
        <HeartIcon filled={isFav} />
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-5">
        <h2
          className="text-2xl font-700 text-white leading-tight mb-3"
          style={{ fontFamily: "'Lora', serif", textShadow: '0 1px 12px rgba(0,0,0,0.4)' }}
        >
          {recipe.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/75">
            <ClockIcon />
            <span className="text-xs font-600">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <FlameIcon />
            <span className="text-xs font-600">{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/75">
            <MuscleIcon />
            <span className="text-xs font-600">{recipe.proteins}g protéines</span>
          </div>
          <button
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-700 transition-all hover:scale-105"
            style={{ background: '#4A7C59', color: '#FFF' }}
          >
            <PlusIcon /> Ajouter au planning
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState('Recettes')
  const [activeFilter, setActiveFilter] = useState<Filter>('Tout')
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 5]))
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleFav = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const featured = RECIPES.find(r => r.featured)!
  const rest = RECIPES.filter(r => !r.featured)

  const filtered = rest.filter(r => {
    const matchFilter = activeFilter === 'Tout' || r.tag === activeFilter
    const matchQuery = query === '' || r.title.toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  })

  const filterCounts: Record<string, number> = {
    Tout: rest.length,
    Express: rest.filter(r => r.tag === 'Express').length,
    Végétarien: rest.filter(r => r.tag === 'Végétarien').length,
    'Riche en protéines': rest.filter(r => r.tag === 'Riche en protéines').length,
    Desserts: rest.filter(r => r.tag === 'Desserts').length,
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F6F8F3', fontFamily: "'Nunito', sans-serif" }}
    >
      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300"
        style={{
          width: 228,
          background: '#141F16',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div className="px-7 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: '#4A7C59' }}
            >
              🍃
            </div>
            <div>
              <p className="text-white font-800 text-base" style={{ fontFamily: "'Lora', serif", lineHeight: 1.2 }}>Cucina</p>
              <p className="text-xs font-500" style={{ color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>Ma cuisine</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon }) => {
            const isActive = activeNav === label
            return (
              <button
                key={label}
                onClick={() => { setActiveNav(label); setSidebarOpen(false) }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 text-left transition-all duration-200"
                style={{
                  background: isActive ? '#4A7C59' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.50)',
                }}
              >
                <Icon active={isActive} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Profile card */}
        <div className="px-5 pb-7">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-800 text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A7C59, #6FAE82)' }}
            >
              A
            </div>
            <div className="min-w-0">
              <p className="text-white font-700 text-sm truncate">Antoine</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>Pro · 42 recettes</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Sidebar desktop (always visible) ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: 228,
          background: '#141F16',
          minHeight: '100vh',
        }}
      >
        <div className="px-7 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: '#4A7C59' }}
            >
              🍃
            </div>
            <div>
              <p className="text-white font-800 text-base leading-tight" style={{ fontFamily: "'Lora', serif" }}>Cucina</p>
              <p className="text-xs font-500 mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Ma cuisine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon }) => {
            const isActive = activeNav === label
            return (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 text-left transition-all duration-200"
                style={{
                  background: isActive ? '#4A7C59' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.50)',
                }}
              >
                <Icon active={isActive} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="px-5 pb-7">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-800 text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A7C59, #6FAE82)' }}
            >
              A
            </div>
            <div className="min-w-0">
              <p className="text-white font-700 text-sm truncate">Antoine</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>Pro · 42 recettes</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-5 lg:px-10 py-8 lg:py-10 overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: '#FFFFFF', color: '#1C2B1E', boxShadow: '0 2px 10px rgba(28,43,30,0.08)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div>
              <p className="text-xs font-600 tracking-widest uppercase mb-0.5" style={{ color: '#7A8F7D', letterSpacing: '0.1em' }}>Collection</p>
              <h1
                className="text-2xl lg:text-3xl font-700 leading-none"
                style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
              >
                Mes Recettes
              </h1>
            </div>
          </div>

          {/* Search */}
          <div
            className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2EBE3',
              boxShadow: '0 2px 12px rgba(28,43,30,0.06)',
              width: 260,
            }}
          >
            <span style={{ color: '#7A8F7D', flexShrink: 0 }}><SearchIcon /></span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher une recette…"
              className="flex-1 bg-transparent outline-none text-sm font-500"
              style={{ color: '#1C2B1E' }}
            />
          </div>
        </div>

        {/* Featured */}
        <FeaturedCard
          recipe={featured}
          onToggleFav={toggleFav}
          isFav={favorites.has(featured.id)}
        />

        {/* Filter pills + count */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => {
              const isActive = activeFilter === f
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-4 py-2 rounded-full text-sm font-700 transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: isActive ? '#1C2B1E' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#4A7C59',
                    border: isActive ? '1.5px solid #1C2B1E' : '1.5px solid #C8E0CF',
                    boxShadow: isActive ? '0 4px 12px rgba(28,43,30,0.18)' : '0 1px 4px rgba(28,43,30,0.05)',
                  }}
                >
                  {f}
                  <span
                    className="ml-2 text-xs"
                    style={{ opacity: isActive ? 0.6 : 0.55 }}
                  >
                    {filterCounts[f]}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-sm font-500" style={{ color: '#7A8F7D' }}>
            <span className="font-700" style={{ color: '#1C2B1E' }}>{filtered.length}</span> recettes
          </p>
        </div>

        {/* Recipe Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onToggleFav={toggleFav}
                isFav={favorites.has(r.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-700" style={{ color: '#1C2B1E', fontFamily: "'Lora', serif" }}>Aucune recette trouvée</p>
            <p className="text-sm font-500 mt-1" style={{ color: '#7A8F7D' }}>Essayez un autre filtre ou mot-clé</p>
          </div>
        )}
      </main>
    </div>
  )
}
