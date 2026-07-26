import { useState } from 'react'

const MAIN_MEAL = {
  title: 'Poulet rôti aux herbes & légumes du soleil',
  photo:
    'https://images.unsplash.com/photo-1539735257177-0d3949225f96?w=800&h=480&fit=crop&auto=format',
  time: '45 min',
  calories: 520,
  proteins: 38,
  servings: 2,
}

const FRIDGE_RECIPES = [
  {
    id: 1,
    title: 'Omelette provençale',
    photo:
      'https://images.unsplash.com/photo-1610328466269-1f36faad83c1?w=400&h=280&fit=crop&auto=format',
    time: '10 min',
    difficulty: 'Facile',
  },
  {
    id: 2,
    title: 'Pâtes à la tomate & basilic',
    photo:
      'https://images.unsplash.com/photo-1447279506476-3faec8071eee?w=400&h=280&fit=crop&auto=format',
    time: '20 min',
    difficulty: 'Facile',
  },
  {
    id: 3,
    title: 'Soupe de carottes épicée',
    photo:
      'https://images.unsplash.com/photo-1620791144170-8a443bf37a33?w=400&h=280&fit=crop&auto=format',
    time: '30 min',
    difficulty: 'Moyen',
  },
]

type Urgency = 'red' | 'orange' | 'green'

const EXPIRING = [
  { id: 1, name: 'Tomates cerises', detail: 'Expire demain', urgency: 'red' as Urgency },
  { id: 2, name: 'Yaourts nature', detail: 'Expire dans 2 jours', urgency: 'orange' as Urgency },
  { id: 3, name: 'Épinards frais', detail: 'Expire dans 2 jours', urgency: 'orange' as Urgency },
  { id: 4, name: 'Poitrine de poulet', detail: 'Expire dans 4 jours', urgency: 'green' as Urgency },
  { id: 5, name: 'Camembert', detail: 'Expire dans 5 jours', urgency: 'green' as Urgency },
]

const urgencyConfig: Record<Urgency, { dot: string; bg: string; text: string; label: string }> = {
  red:    { dot: '#EF4444', bg: '#FEF2F2', text: '#B91C1C', label: 'Urgent' },
  orange: { dot: '#F97316', bg: '#FFF7ED', text: '#C2410C', label: 'Bientôt' },
  green:  { dot: '#4A7C59', bg: '#F0F7F2', text: '#2E5C3A', label: 'OK' },
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  )
}

function ProteinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12M12 12C12 12 8 10 8 6a4 4 0 0 1 8 0c0 4-4 6-4 6z"/><path d="M8 22h8"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F6F8F3', fontFamily: "'Nunito', sans-serif" }}
    >
      <div className="max-w-md mx-auto px-4 pb-10">

        {/* ── Header ── */}
        <div className="pt-10 pb-5 fade-up">
          {/* Avatar + greeting */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-600 tracking-wide" style={{ color: '#7A8F7D', letterSpacing: '0.04em' }}>
                Vendredi 25 juillet
              </p>
              <h1
                className="text-2xl font-700 mt-0.5 leading-tight"
                style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
              >
                Bonjour Antoine !<br />
                <span style={{ color: '#4A7C59' }}>Prêt à cuisiner ?</span>
              </h1>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-800 text-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #4A7C59, #6FAE82)', flexShrink: 0 }}
            >
              A
            </div>
          </div>

          {/* Search bar */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 2px 14px rgba(74,124,89,0.10)',
              border: '1.5px solid #E2EBE3',
            }}
          >
            <span style={{ color: '#7A8F7D' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher une recette, un ingrédient…"
              className="flex-1 bg-transparent outline-none text-sm font-500"
              style={{ color: '#1C2B1E' }}
            />
          </div>
        </div>

        {/* ── Section 1 : Au menu aujourd'hui ── */}
        <section className="mb-7 fade-up" style={{ animationDelay: '0.08s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-700"
              style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
            >
              Au menu aujourd&apos;hui
            </h2>
            <button
              className="flex items-center gap-1 text-sm font-600 transition-opacity hover:opacity-70"
              style={{ color: '#4A7C59' }}
            >
              Modifier <ChevronRight />
            </button>
          </div>

          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 6px 32px rgba(74,124,89,0.13)',
            }}
          >
            {/* Photo */}
            <div className="relative h-52" style={{ background: '#D4EDD9' }}>
              <img
                src={MAIN_MEAL.photo}
                alt={MAIN_MEAL.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(28,43,30,0.55) 0%, transparent 55%)',
                }}
              />
              {/* Bookmark */}
              <button
                onClick={() => setSaved(!saved)}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
                style={{
                  background: saved ? '#4A7C59' : 'rgba(255,255,255,0.82)',
                  color: saved ? '#fff' : '#4A7C59',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
                aria-label="Sauvegarder la recette"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>

              {/* Time badge on photo */}
              <div
                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(6px)' }}
              >
                <span style={{ color: '#4A7C59' }}><ClockIcon /></span>
                <span className="text-xs font-700" style={{ color: '#1C2B1E' }}>{MAIN_MEAL.time}</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ color: '#F59E0B' }}><StarIcon /></span>
                <span style={{ color: '#F59E0B' }}><StarIcon /></span>
                <span style={{ color: '#F59E0B' }}><StarIcon /></span>
                <span style={{ color: '#F59E0B' }}><StarIcon /></span>
                <span style={{ color: '#D1D5DB' }}><StarIcon /></span>
                <span className="text-xs font-500 ml-1" style={{ color: '#7A8F7D' }}>4.2 • {MAIN_MEAL.servings} pers.</span>
              </div>

              <h3
                className="text-base font-700 leading-snug mb-4"
                style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
              >
                {MAIN_MEAL.title}
              </h3>

              {/* Badges */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: '#FFF7ED' }}
                >
                  <span style={{ color: '#F97316' }}><FlameIcon /></span>
                  <span className="text-xs font-700" style={{ color: '#C2410C' }}>{MAIN_MEAL.calories} kcal</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: '#EBF2EC' }}
                >
                  <span style={{ color: '#4A7C59' }}><ProteinIcon /></span>
                  <span className="text-xs font-700" style={{ color: '#2E5C3A' }}>{MAIN_MEAL.proteins}g protéines</span>
                </div>
              </div>

              {/* CTA */}
              <button
                className="w-full mt-4 py-3.5 rounded-2xl font-700 text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #4A7C59, #5E9E72)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(74,124,89,0.30)',
                }}
              >
                Voir la recette complète
              </button>
            </div>
          </div>
        </section>

        {/* ── Section 2 : Que faire avec votre frigo ? ── */}
        <section className="mb-7 fade-up" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-700"
              style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
            >
              Que faire avec votre frigo&nbsp;?
            </h2>
            <button
              className="flex items-center gap-1 text-sm font-600 transition-opacity hover:opacity-70"
              style={{ color: '#4A7C59' }}
            >
              Tout voir <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {FRIDGE_RECIPES.map(recipe => (
              <button
                key={recipe.id}
                className="rounded-2xl overflow-hidden text-left transition-transform active:scale-95 hover:shadow-lg"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 3px 16px rgba(74,124,89,0.09)',
                }}
              >
                {/* Photo */}
                <div className="relative h-24" style={{ background: '#D4EDD9' }}>
                  <img
                    src={recipe.photo}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(28,43,30,0.35) 0%, transparent 60%)' }}
                  />
                </div>
                {/* Info */}
                <div className="px-2.5 py-2.5">
                  <p className="text-xs font-700 leading-tight mb-1.5" style={{ color: '#1C2B1E' }}>
                    {recipe.title}
                  </p>
                  <div className="flex items-center gap-1" style={{ color: '#7A8F7D' }}>
                    <ClockIcon />
                    <span className="text-xs font-500">{recipe.time}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Section 3 : Ingrédients bientôt périmés ── */}
        <section className="fade-up" style={{ animationDelay: '0.24s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-700"
              style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}
            >
              Ingrédients bientôt périmés
            </h2>
            <button
              className="flex items-center gap-1 text-sm font-600 transition-opacity hover:opacity-70"
              style={{ color: '#4A7C59' }}
            >
              Gérer <ChevronRight />
            </button>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(74,124,89,0.09)',
            }}
          >
            {EXPIRING.map((item, idx) => {
              const cfg = urgencyConfig[item.urgency]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{
                    borderBottom: idx < EXPIRING.length - 1 ? '1px solid #F0F4EF' : 'none',
                  }}
                >
                  {/* Dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.bg}` }}
                  />

                  {/* Name & detail */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-700 truncate" style={{ color: '#1C2B1E' }}>
                      {item.name}
                    </p>
                    <p className="text-xs font-500 mt-0.5" style={{ color: '#7A8F7D' }}>
                      {item.detail}
                    </p>
                  </div>

                  {/* Badge */}
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-700 flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Quick tip */}
          <div
            className="mt-4 flex items-start gap-3 px-4 py-4 rounded-2xl"
            style={{ background: '#EBF2EC', border: '1px solid #C8E0CF' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: '#4A7C59' }}
            >
              <span style={{ fontSize: 16 }}>💡</span>
            </div>
            <div>
              <p className="text-sm font-700" style={{ color: '#2E5C3A' }}>Conseil du jour</p>
              <p className="text-xs font-500 mt-0.5 leading-relaxed" style={{ color: '#4A7C59' }}>
                Utilisez vos tomates cerises dans une salade caprese ou une bruschetta avant demain !
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom nav ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-3"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid #E2EBE3',
            boxShadow: '0 -4px 24px rgba(74,124,89,0.08)',
          }}
        >
          {[
            { icon: '🏠', label: 'Accueil', active: true },
            { icon: '🔍', label: 'Recettes', active: false },
            { icon: '🛒', label: 'Courses', active: false },
            { icon: '👤', label: 'Profil', active: false },
          ].map(item => (
            <button
              key={item.label}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all"
              style={{ minWidth: 60 }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span
                className="text-xs font-600"
                style={{ color: item.active ? '#4A7C59' : '#7A8F7D' }}
              >
                {item.label}
              </span>
              {item.active && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: '#4A7C59' }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Spacer for nav */}
        <div className="h-20" />
      </div>
    </div>
  )
}
