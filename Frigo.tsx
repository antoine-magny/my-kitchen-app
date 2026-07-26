import { useState, useRef, useEffect } from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function BookIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function FridgeIcon({ active }: { active?: boolean }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="10" y1="7" x2="10" y2="10"/><line x1="10" y1="14" x2="10" y2="18"/></svg>
}
function CartIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}
function TipIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function PlusIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function MinusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}

// ─── Types & Data ─────────────────────────────────────────────────────────────

type TabId = 'fridge' | 'freezer' | 'pantry'

interface Ingredient {
  id: number
  emoji: string
  name: string
  quantity: number
  unit: string
  dlc: string | null  // ISO date string or null (no DLC)
  category: TabId
}

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const daysFrom = (n: number) => {
  const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d)
}

let nextId = 100

const INITIAL: Ingredient[] = [
  // Fridge
  { id: 1,  emoji: '🥚', name: 'Œufs',              quantity: 6,   unit: 'unités', dlc: daysFrom(7),  category: 'fridge' },
  { id: 2,  emoji: '🥛', name: 'Lait demi-écrémé',  quantity: 1,   unit: 'L',      dlc: daysFrom(2),  category: 'fridge' },
  { id: 3,  emoji: '🧀', name: 'Comté',              quantity: 150, unit: 'g',      dlc: daysFrom(14), category: 'fridge' },
  { id: 4,  emoji: '🥩', name: 'Poulet fermier',     quantity: 500, unit: 'g',      dlc: daysFrom(0),  category: 'fridge' },
  { id: 5,  emoji: '🍅', name: 'Tomates cerises',    quantity: 250, unit: 'g',      dlc: daysFrom(1),  category: 'fridge' },
  { id: 6,  emoji: '🥕', name: 'Carottes',           quantity: 4,   unit: 'unités', dlc: daysFrom(6),  category: 'fridge' },
  { id: 7,  emoji: '🧈', name: 'Beurre AOP',         quantity: 250, unit: 'g',      dlc: daysFrom(21), category: 'fridge' },
  { id: 8,  emoji: '🥗', name: 'Mesclun bio',        quantity: 100, unit: 'g',      dlc: daysFrom(2),  category: 'fridge' },
  { id: 9,  emoji: '🍋', name: 'Citrons',            quantity: 3,   unit: 'unités', dlc: daysFrom(8),  category: 'fridge' },
  // Freezer
  { id: 10, emoji: '🐟', name: 'Filets de saumon',   quantity: 2,   unit: 'pièces', dlc: daysFrom(60), category: 'freezer' },
  { id: 11, emoji: '🥦', name: 'Brocolis surgelés',  quantity: 400, unit: 'g',      dlc: daysFrom(90), category: 'freezer' },
  { id: 12, emoji: '🍦', name: 'Sorbet citron',      quantity: 500, unit: 'g',      dlc: daysFrom(45), category: 'freezer' },
  { id: 13, emoji: '🍖', name: 'Bœuf haché 5%',      quantity: 300, unit: 'g',      dlc: daysFrom(-2), category: 'freezer' },
  { id: 14, emoji: '🫛', name: 'Petits pois',        quantity: 800, unit: 'g',      dlc: daysFrom(120),category: 'freezer' },
  // Pantry
  { id: 15, emoji: '🍝', name: 'Pâtes linguine',     quantity: 500, unit: 'g',      dlc: null,         category: 'pantry' },
  { id: 16, emoji: '🍚', name: 'Riz basmati',        quantity: 800, unit: 'g',      dlc: null,         category: 'pantry' },
  { id: 17, emoji: '🫒', name: "Huile d'olive",      quantity: 750, unit: 'mL',     dlc: daysFrom(180),category: 'pantry' },
  { id: 18, emoji: '🧂', name: 'Fleur de sel',       quantity: 200, unit: 'g',      dlc: null,         category: 'pantry' },
  { id: 19, emoji: '🌶️', name: 'Paprika fumé',       quantity: 50,  unit: 'g',      dlc: daysFrom(300),category: 'pantry' },
  { id: 20, emoji: '🍫', name: 'Chocolat noir 70%',  quantity: 200, unit: 'g',      dlc: daysFrom(60), category: 'pantry' },
  { id: 21, emoji: '🧁', name: 'Farine T55',         quantity: 1,   unit: 'kg',     dlc: daysFrom(180),category: 'pantry' },
  { id: 22, emoji: '☕', name: 'Café en grains',     quantity: 250, unit: 'g',      dlc: daysFrom(90), category: 'pantry' },
]

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'fridge',  label: 'Réfrigérateur', emoji: '🧊' },
  { id: 'freezer', label: 'Congélateur',   emoji: '❄️' },
  { id: 'pantry',  label: 'Placards',      emoji: '🏺' },
]

const NAV = [
  { label: 'Accueil',  Icon: HomeIcon },
  { label: 'Recettes', Icon: BookIcon },
  { label: 'Frigo',    Icon: FridgeIcon, active: true },
  { label: 'Courses',  Icon: CartIcon },
  { label: 'Astuces',  Icon: TipIcon },
]

const EMOJI_SUGGESTIONS = ['🥚','🥛','🧀','🥩','🍅','🥕','🧈','🥗','🍋','🫐','🍎','🍊','🥦','🥬','🧅','🥔','🫑','🍞','🐟','🍖','🥑','🍇','🫚','🧄']

// ─── DLC helpers ─────────────────────────────────────────────────────────────

function dlcStatus(dlc: string | null): 'urgent' | 'soon' | 'ok' | 'none' {
  if (!dlc) return 'none'
  const diff = Math.floor((new Date(dlc).getTime() - today.setHours(0,0,0,0)) / 86400000)
  if (diff <= 0) return 'urgent'
  if (diff <= 3) return 'soon'
  return 'ok'
}

function dlcLabel(dlc: string | null): string {
  if (!dlc) return ''
  const diff = Math.floor((new Date(dlc).getTime() - new Date(fmt(today)).getTime()) / 86400000)
  if (diff < 0) return `Périmé (${Math.abs(diff)}j)`
  if (diff === 0) return "Expire aujourd'hui"
  if (diff === 1) return 'Expire demain'
  return `DLC ${new Date(dlc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
}

const STATUS_STYLE = {
  urgent: { color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
  soon:   { color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' },
  ok:     { color: '#6B7280', bg: 'transparent', dot: '#9CA3AF' },
  none:   { color: '#9CA3AF', bg: 'transparent', dot: '#D1D5DB' },
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({ activeTab, onAdd, onClose }: {
  activeTab: TabId
  onAdd: (item: Omit<Ingredient, 'id'>) => void
  onClose: () => void
}) {
  const [emoji, setEmoji] = useState('🥚')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('unités')
  const [dlc, setDlc] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ emoji, name: name.trim(), quantity: Number(qty) || 1, unit: unit.trim() || 'unités', dlc: dlc || null, category: activeTab })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(20,31,22,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:w-auto sm:min-w-[440px] rounded-t-3xl sm:rounded-3xl p-7 scale-in"
        style={{ background: '#FFFFFF', boxShadow: '0 24px 64px rgba(20,31,22,0.22)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-700" style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}>
            Nouvel ingrédient
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F0F4EF]"
            style={{ color: '#7A8F7D' }}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Emoji + Name row */}
          <div className="flex items-start gap-3">
            {/* Emoji picker trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPicker(p => !p)}
                className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all hover:border-[#4A7C59]"
                style={{ borderColor: '#E2EBE3', background: '#F6F8F3' }}
              >
                {emoji}
              </button>
              {showPicker && (
                <div
                  className="absolute top-16 left-0 z-10 p-3 rounded-2xl grid gap-1 slide-down"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 8px 32px rgba(20,31,22,0.14)',
                    border: '1px solid #E2EBE3',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    width: 216,
                  }}
                >
                  {EMOJI_SUGGESTIONS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setEmoji(e); setShowPicker(false) }}
                      className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:bg-[#EBF2EC]"
                      style={{ background: emoji === e ? '#EBF2EC' : 'transparent' }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-700 mb-1.5" style={{ color: '#7A8F7D', letterSpacing: '0.04em' }}>
                NOM DE L&apos;INGRÉDIENT
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex : Tomates cerises"
                required
                className="w-full px-4 py-3 rounded-xl text-sm font-600 outline-none transition-all"
                style={{
                  border: '1.5px solid #E2EBE3',
                  color: '#1C2B1E',
                  background: '#FAFBF9',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4A7C59')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2EBE3')}
              />
            </div>
          </div>

          {/* Qty + Unit */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-700 mb-1.5" style={{ color: '#7A8F7D', letterSpacing: '0.04em' }}>QUANTITÉ</label>
              <input
                type="number"
                min="0"
                step="any"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-600 outline-none transition-all"
                style={{ border: '1.5px solid #E2EBE3', color: '#1C2B1E', background: '#FAFBF9' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4A7C59')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2EBE3')}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-700 mb-1.5" style={{ color: '#7A8F7D', letterSpacing: '0.04em' }}>UNITÉ</label>
              <input
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="g, mL, unités…"
                className="w-full px-4 py-3 rounded-xl text-sm font-600 outline-none transition-all"
                style={{ border: '1.5px solid #E2EBE3', color: '#1C2B1E', background: '#FAFBF9' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4A7C59')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2EBE3')}
              />
            </div>
          </div>

          {/* DLC */}
          <div>
            <label className="block text-xs font-700 mb-1.5" style={{ color: '#7A8F7D', letterSpacing: '0.04em' }}>
              DATE LIMITE DE CONSOMMATION <span className="font-500 normal-case" style={{ opacity: 0.6 }}>(optionnelle)</span>
            </label>
            <input
              type="date"
              value={dlc}
              onChange={e => setDlc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-600 outline-none transition-all"
              style={{ border: '1.5px solid #E2EBE3', color: '#1C2B1E', background: '#FAFBF9' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#4A7C59')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2EBE3')}
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-700 text-sm mt-1 transition-all active:scale-98 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #4A7C59, #5E9E72)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(74,124,89,0.28)',
            }}
          >
            Ajouter l&apos;ingrédient
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Ingredient Row ───────────────────────────────────────────────────────────

function IngredientRow({
  item,
  onAdjust,
  onDelete,
  isNew,
}: {
  item: Ingredient
  onAdjust: (id: number, delta: number) => void
  onDelete: (id: number) => void
  isNew: boolean
}) {
  const status = dlcStatus(item.dlc)
  const style = STATUS_STYLE[status]
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleting(true)
    setTimeout(() => onDelete(item.id), 260)
  }

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 group transition-all duration-200 hover:bg-[#FAFBF9]"
      style={{
        opacity: deleting ? 0 : 1,
        transform: deleting ? 'translateX(20px)' : 'none',
        transition: 'opacity 0.26s ease, transform 0.26s ease, background 0.15s',
        animation: isNew ? 'slideDown 0.22s ease both' : 'none',
      }}
    >
      {/* Emoji */}
      <span className="text-xl w-8 text-center flex-shrink-0 select-none">{item.emoji}</span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-700 truncate" style={{ color: '#1C2B1E' }}>{item.name}</p>
        {item.dlc && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
            <span className="text-xs font-500" style={{ color: style.color }}>
              {dlcLabel(item.dlc)}
            </span>
          </div>
        )}
      </div>

      {/* Qty controls */}
      <div
        className="flex items-center gap-0 rounded-xl overflow-hidden flex-shrink-0"
        style={{ border: '1.5px solid #E2EBE3' }}
      >
        <button
          onClick={() => onAdjust(item.id, -1)}
          disabled={item.quantity <= 0}
          className="w-8 h-8 flex items-center justify-center transition-all hover:bg-[#EBF2EC] disabled:opacity-30"
          style={{ color: '#4A7C59' }}
          aria-label="Diminuer"
        >
          <MinusIcon />
        </button>
        <span
          className="w-12 text-center text-sm font-800 border-x"
          style={{ color: '#1C2B1E', borderColor: '#E2EBE3', lineHeight: '2rem' }}
        >
          {item.quantity}
        </span>
        <button
          onClick={() => onAdjust(item.id, 1)}
          className="w-8 h-8 flex items-center justify-center transition-all hover:bg-[#EBF2EC]"
          style={{ color: '#4A7C59' }}
          aria-label="Augmenter"
        >
          <PlusIcon size={13} />
        </button>
      </div>

      {/* Unit */}
      <span className="text-xs font-600 w-12 text-right flex-shrink-0 hidden sm:block" style={{ color: '#9CA3AF' }}>
        {item.unit}
      </span>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 hover:bg-[#FEF2F2]"
        style={{ color: '#9CA3AF' }}
        aria-label="Supprimer"
        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeNav, onNavChange, onClose, isMobile }: {
  activeNav: string
  onNavChange: (label: string) => void
  onClose?: () => void
  isMobile?: boolean
}) {
  return (
    <aside
      className={`flex flex-col ${isMobile ? 'fixed top-0 left-0 h-full z-40' : 'hidden lg:flex'}`}
      style={{ width: 220, background: '#141F16', minHeight: isMobile ? '100vh' : undefined }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#4A7C59' }}>🍃</div>
          <div>
            <p className="text-white font-800 text-base leading-tight" style={{ fontFamily: "'Lora', serif" }}>Cucina</p>
            <p className="text-xs font-500 mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Ma cuisine</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {NAV.map(({ label, Icon }) => {
          const isActive = activeNav === label
          return (
            <button
              key={label}
              onClick={() => { onNavChange(label); onClose?.() }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 text-left transition-all duration-200"
              style={{ background: isActive ? '#4A7C59' : 'transparent', color: isActive ? '#FFF' : 'rgba(255,255,255,0.50)' }}
            >
              <Icon active={isActive} />
              {label}
            </button>
          )
        })}
      </nav>
      {/* Profile */}
      <div className="px-5 pb-7">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-800 text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4A7C59, #6FAE82)' }}>A</div>
          <div className="min-w-0">
            <p className="text-white font-700 text-sm truncate">Antoine</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>Pro · 42 recettes</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState('Frigo')
  const [activeTab, setActiveTab] = useState<TabId>('fridge')
  const [items, setItems] = useState<Ingredient[]>(INITIAL)
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [newIds, setNewIds] = useState<Set<number>>(new Set())

  const tabItems = items.filter(i => i.category === activeTab)
  const filtered = tabItems.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))

  // Sort: urgent first, then soon, then ok/none
  const priorityOrder = { urgent: 0, soon: 1, ok: 2, none: 3 }
  const sorted = [...filtered].sort((a, b) => priorityOrder[dlcStatus(a.dlc)] - priorityOrder[dlcStatus(b.dlc)])

  const urgentCount = (tab: TabId) => items.filter(i => i.category === tab && dlcStatus(i.dlc) === 'urgent').length
  const soonCount = (tab: TabId) => items.filter(i => i.category === tab && (dlcStatus(i.dlc) === 'urgent' || dlcStatus(i.dlc) === 'soon')).length

  const handleAdjust = (id: number, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
  }

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleAdd = (item: Omit<Ingredient, 'id'>) => {
    const id = ++nextId
    setItems(prev => [...prev, { ...item, id }])
    setNewIds(prev => { const s = new Set(prev); s.add(id); setTimeout(() => setNewIds(p => { const n = new Set(p); n.delete(id); return n }), 600); return s })
    setActiveTab(item.category)
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F6F8F3', fontFamily: "'Nunito', sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} onClose={() => setSidebarOpen(false)} isMobile />
      )}

      {/* Sidebar desktop */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 lg:px-10 py-5 lg:py-7 flex-shrink-0"
          style={{ borderBottom: '1px solid #E8EDE9' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[#EBF2EC]"
              style={{ background: '#FFFFFF', color: '#1C2B1E', boxShadow: '0 2px 10px rgba(28,43,30,0.08)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div>
              <p className="text-xs font-600 uppercase tracking-widest mb-0.5" style={{ color: '#7A8F7D', letterSpacing: '0.1em' }}>Inventaire</p>
              <h1 className="text-2xl lg:text-3xl font-700 leading-none" style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}>
                Mon Frigo &amp; Placards
              </h1>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-700 text-sm transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4A7C59, #5E9E72)',
              color: '#FFFFFF',
              boxShadow: '0 4px 18px rgba(74,124,89,0.30)',
            }}
          >
            <PlusIcon size={14} />
            <span className="hidden sm:inline">Ajouter un ingrédient</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-end gap-0 px-5 lg:px-10 flex-shrink-0"
          style={{ borderBottom: '1px solid #E8EDE9' }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const urgent = urgentCount(tab.id)
            const tabTotal = items.filter(i => i.category === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setQuery('') }}
                className="relative flex items-center gap-2 px-5 py-4 text-sm font-700 transition-all duration-200"
                style={{
                  color: isActive ? '#1C2B1E' : '#7A8F7D',
                  borderBottom: isActive ? '2px solid #1C2B1E' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className="text-xs font-600 px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? '#EBF2EC' : '#F0F4EF',
                    color: isActive ? '#4A7C59' : '#9CA3AF',
                  }}
                >
                  {tabTotal}
                </span>
                {urgent > 0 && (
                  <span
                    className="absolute top-2 right-1 w-2 h-2 rounded-full"
                    style={{ background: '#EF4444' }}
                    title={`${urgent} expiré(s)`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl px-5 lg:px-10 py-6">

            {/* Search + summary bar */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl flex-1"
                style={{ background: '#FFFFFF', border: '1.5px solid #E2EBE3' }}
              >
                <span style={{ color: '#9CA3AF', flexShrink: 0 }}><SearchIcon /></span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={`Rechercher dans les ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}…`}
                  className="flex-1 bg-transparent outline-none text-sm font-500"
                  style={{ color: '#1C2B1E' }}
                />
              </div>

              {/* Expiry summary pills */}
              {soonCount(activeTab) > 0 && (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0"
                  style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
                >
                  <CalendarIcon />
                  <span className="text-xs font-700" style={{ color: '#C2410C' }}>
                    {urgentCount(activeTab) > 0
                      ? `${urgentCount(activeTab)} expiré${urgentCount(activeTab) > 1 ? 's' : ''}`
                      : `${soonCount(activeTab)} bientôt`}
                  </span>
                </div>
              )}
            </div>

            {/* List */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 1px 12px rgba(28,43,30,0.06)',
                border: '1px solid #E8EDE9',
              }}
            >
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="text-5xl mb-4">
                    {activeTab === 'fridge' ? '🧊' : activeTab === 'freezer' ? '❄️' : '🏺'}
                  </div>
                  <p className="text-base font-700 mb-1" style={{ fontFamily: "'Lora', serif", color: '#1C2B1E' }}>
                    {query ? 'Aucun résultat' : 'C\'est vide ici !'}
                  </p>
                  <p className="text-sm font-500" style={{ color: '#7A8F7D' }}>
                    {query ? 'Essayez un autre mot-clé' : 'Ajoutez votre premier ingrédient'}
                  </p>
                  {!query && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-700 transition-all hover:opacity-90"
                      style={{ background: '#EBF2EC', color: '#4A7C59' }}
                    >
                      <PlusIcon size={13} /> Ajouter un ingrédient
                    </button>
                  )}
                </div>
              ) : (
                sorted.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <div style={{ height: 1, background: '#F0F4EF', marginLeft: 56 }} />}
                    <IngredientRow
                      item={item}
                      onAdjust={handleAdjust}
                      onDelete={handleDelete}
                      isNew={newIds.has(item.id)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Legend */}
            {sorted.length > 0 && (
              <div className="flex items-center gap-5 mt-4 px-1">
                {[
                  { dot: '#EF4444', label: 'Urgent / Périmé' },
                  { dot: '#F97316', label: 'Dans les 3 jours' },
                  { dot: '#9CA3AF', label: 'OK' },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                    <span className="text-xs font-500" style={{ color: '#9CA3AF' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <AddModal
          activeTab={activeTab}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
