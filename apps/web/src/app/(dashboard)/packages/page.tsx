'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type PackageType = 'membership' | 'pt' | 'sunny_hour'

interface Package {
  id: string
  name: string
  priceInPaise: number
  durationDays: number
  type: PackageType
  sessions?: number
  description?: string
  features?: string[]
  isOnline?: boolean
  archived?: boolean
}

interface Discount {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  startDate: string
  activeTill: string
  description?: string
}

type Tab = 'Packages' | 'Discounts'

const TYPE_FILTER_LABELS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'membership', label: 'Membership' },
  { value: 'pt', label: 'PT / Trainer' },
  { value: 'sunny_hour', label: 'Sunny Hour' },
]

const TYPE_BADGE: Record<PackageType, { label: string; className: string }> = {
  membership: { label: 'Membership', className: 'bg-blue-100 text-blue-700' },
  pt: { label: 'PT / Trainer', className: 'bg-purple-100 text-purple-700' },
  sunny_hour: { label: 'Sunny Hour', className: 'bg-yellow-100 text-yellow-700' },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-24 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
    </div>
  )
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  onEdit,
  onArchive,
  onToggleOnline,
}: {
  pkg: Package
  onEdit: (p: Package) => void
  onArchive: (id: string) => void
  onToggleOnline: (id: string, val: boolean) => void
}) {
  const badge = TYPE_BADGE[pkg.type]
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 text-sm">{pkg.name}</p>
        <span className={cn('shrink-0 text-xs font-medium px-2 py-0.5 rounded-full', badge.className)}>
          {badge.label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{formatRupees(pkg.priceInPaise)}</span>
        <span className="text-xs text-gray-400">{pkg.durationDays} days</span>
      </div>
      {pkg.type === 'pt' && pkg.sessions && (
        <span className="inline-flex w-fit text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
          {pkg.sessions} sessions
        </span>
      )}
      {pkg.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{pkg.description}</p>
      )}
      {Array.isArray(pkg.features) && pkg.features.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pkg.features.map(f => (
            <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-1 mt-auto">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <div
            role="switch"
            aria-checked={!!pkg.isOnline}
            onClick={() => onToggleOnline(pkg.id, !pkg.isOnline)}
            className={cn(
              'relative w-9 h-5 rounded-full transition-colors cursor-pointer',
              pkg.isOnline ? 'bg-orange-500' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                pkg.isOnline ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </div>
          <span className="text-xs text-gray-500">Online</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(pkg)}
            className="text-xs text-gray-500 hover:text-orange-600 font-medium border border-gray-200 rounded px-2 py-1 hover:border-orange-400 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onArchive(pkg.id)}
            className="text-xs text-gray-400 hover:text-red-500 font-medium border border-gray-200 rounded px-2 py-1 hover:border-red-300 transition-colors"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Package Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  priceRupees: '',
  durationDays: '',
  type: 'membership' as PackageType,
  sessions: '',
  description: '',
  featuresRaw: '',
  isOnline: false,
}

function PackageModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Package | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          priceRupees: String(initial.priceInPaise / 100),
          durationDays: String(initial.durationDays),
          type: initial.type,
          sessions: initial.sessions ? String(initial.sessions) : '',
          description: initial.description ?? '',
          featuresRaw: (initial.features ?? []).join(', '),
          isOnline: initial.isOnline ?? false,
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof typeof form, val: unknown) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.priceRupees || !form.durationDays) {
      setError('Name, price and duration are required.')
      return
    }
    setSaving(true)
    setError('')
    const body = {
      name: form.name,
      priceInPaise: Math.round(parseFloat(form.priceRupees) * 100),
      durationDays: parseInt(form.durationDays),
      type: form.type,
      ...(form.type === 'pt' && form.sessions ? { sessions: parseInt(form.sessions) } : {}),
      ...(form.description ? { description: form.description } : {}),
      features: form.featuresRaw
        ? form.featuresRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      isOnline: form.isOnline,
    }
    try {
      if (initial) {
        await api.patch(`/api/packages/${initial.id}`, body)
      } else {
        await api.post('/api/packages', body)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{initial ? 'Edit Package' : 'Create Package'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{error}</p>}

          <Field label="Package Name *">
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Monthly Membership"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹) *">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceRupees}
                onChange={e => set('priceRupees', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="999"
              />
            </Field>
            <Field label="Duration (days) *">
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={e => set('durationDays', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="30"
              />
            </Field>
          </div>

          <Field label="Type">
            <div className="flex gap-2">
              {(['membership', 'pt', 'sunny_hour'] as PackageType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded border transition-colors',
                    form.type === t
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  )}
                >
                  {t === 'membership' ? 'Membership' : t === 'pt' ? 'PT / Trainer' : 'Sunny Hour'}
                </button>
              ))}
            </div>
          </Field>

          {form.type === 'pt' && (
            <Field label="Number of Sessions">
              <input
                type="number"
                min="1"
                value={form.sessions}
                onChange={e => set('sessions', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="12"
              />
            </Field>
          )}

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              rows={2}
              placeholder="Optional description…"
            />
          </Field>

          <Field label="Features (comma-separated)">
            <input
              value={form.featuresRaw}
              onChange={e => set('featuresRaw', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Locker, Towel, Protein shake"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isOnline}
              onChange={e => set('isOnline', e.target.checked)}
              className="accent-orange-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show to members online</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium py-2 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold py-2 transition-colors"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Discount Modal ───────────────────────────────────────────────────────────

const EMPTY_DISCOUNT = {
  name: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  startDate: '',
  activeTill: '',
  description: '',
}

function DiscountModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Discount | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          type: initial.type,
          value: String(initial.value),
          startDate: initial.startDate?.slice(0, 10) ?? '',
          activeTill: initial.activeTill?.slice(0, 10) ?? '',
          description: initial.description ?? '',
        }
      : { ...EMPTY_DISCOUNT }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof typeof form, val: unknown) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.value || !form.startDate || !form.activeTill) {
      setError('Name, value, and dates are required.')
      return
    }
    setSaving(true)
    setError('')
    const body = {
      name: form.name,
      type: form.type,
      value: parseFloat(form.value),
      startDate: form.startDate,
      activeTill: form.activeTill,
      ...(form.description ? { description: form.description } : {}),
    }
    try {
      if (initial) {
        await api.patch(`/api/packages/discounts/${initial.id}`, body)
      } else {
        await api.post('/api/packages/discounts', body)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{initial ? 'Edit Discount' : 'Create Discount'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{error}</p>}

          <Field label="Discount Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="e.g. Diwali Offer" />
          </Field>

          <Field label="Type">
            <div className="flex gap-2">
              {(['percentage', 'fixed'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded border transition-colors',
                    form.type === t
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  )}
                >
                  {t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Value (${form.type === 'percentage' ? '%' : '₹'}) *`}>
            <input
              type="number"
              min="0"
              step={form.type === 'percentage' ? '1' : '0.01'}
              value={form.value}
              onChange={e => set('value', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder={form.type === 'percentage' ? '10' : '500'}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date *">
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </Field>
            <Field label="Valid Till *">
              <input type="date" value={form.activeTill} onChange={e => set('activeTill', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              rows={2}
              placeholder="Optional…"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium py-2 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold py-2 transition-colors">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  const [tab, setTab] = useState<Tab>('Packages')
  const [typeFilter, setTypeFilter] = useState('all')
  const [pkgModal, setPkgModal] = useState<Package | null | 'new'>(null)
  const [discountModal, setDiscountModal] = useState<Discount | null | 'new'>(null)

  const qc = useQueryClient()

  const { data: packages, isLoading: loadingPkgs } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => api.get('/api/packages'),
  })

  const { data: discounts, isLoading: loadingDiscounts } = useQuery<Discount[]>({
    queryKey: ['discounts'],
    queryFn: () => api.get('/api/packages/discounts'),
  })

  function invalidatePkgs() { qc.invalidateQueries({ queryKey: ['packages'] }) }
  function invalidateDiscounts() { qc.invalidateQueries({ queryKey: ['discounts'] }) }

  async function archivePkg(id: string) {
    if (!confirm('Archive this package?')) return
    await api.patch(`/api/packages/${id}/archive`, {})
    invalidatePkgs()
  }

  async function toggleOnline(id: string, val: boolean) {
    await api.patch(`/api/packages/${id}`, { isOnline: val })
    invalidatePkgs()
  }

  const visiblePkgs = (packages ?? []).filter(
    p => !p.archived && (typeFilter === 'all' || p.type === typeFilter)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Packages &amp; Discounts</h1>
        {tab === 'Packages' ? (
          <button
            onClick={() => setPkgModal('new')}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + Create Package
          </button>
        ) : (
          <button
            onClick={() => setDiscountModal('new')}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + Create Discount
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['Packages', 'Discounts'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Packages Tab */}
      {tab === 'Packages' && (
        <>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTER_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  typeFilter === value
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loadingPkgs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : visiblePkgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 text-lg font-medium">No packages yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first package to get started</p>
              <button
                onClick={() => setPkgModal('new')}
                className="mt-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 transition-colors"
              >
                Create Your First Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePkgs.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={p => setPkgModal(p)}
                  onArchive={archivePkg}
                  onToggleOnline={toggleOnline}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Discounts Tab */}
      {tab === 'Discounts' && (
        <>
          {loadingDiscounts ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !discounts || discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 text-lg font-medium">No discounts yet</p>
              <button
                onClick={() => setDiscountModal('new')}
                className="mt-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 transition-colors"
              >
                Create First Discount
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Value</th>
                    <th className="px-5 py-3">Valid From</th>
                    <th className="px-5 py-3">Valid Till</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-5 py-3 text-gray-500 capitalize">{d.type}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {d.type === 'percentage' ? `${d.value}%` : formatRupees(d.value * 100)}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{d.startDate?.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-gray-500">{d.activeTill?.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setDiscountModal(d)}
                          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {pkgModal !== null && (
        <PackageModal
          initial={pkgModal === 'new' ? null : pkgModal}
          onClose={() => setPkgModal(null)}
          onSaved={() => { setPkgModal(null); invalidatePkgs() }}
        />
      )}
      {discountModal !== null && (
        <DiscountModal
          initial={discountModal === 'new' ? null : discountModal}
          onClose={() => setDiscountModal(null)}
          onSaved={() => { setDiscountModal(null); invalidateDiscounts() }}
        />
      )}
    </div>
  )
}
