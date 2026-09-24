'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, X, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

interface FollowUp {
  _id: string
  contactId: string
  contactType: string
  subject: string
  type: 'payment' | 'renewal' | 'visitor' | 'inquiry' | 'attendance'
  priority: 'normal' | 'critical'
  assignedToId: string
  amountInPaise: number
  dueDate: string
  status: 'open' | 'completed'
  history: { note: string; changedAt: string }[]
}

interface Member {
  _id: string
  name: string
  code: string
  phone: string
}

const TYPE_BADGE: Record<string, string> = {
  payment:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  renewal:    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  visitor:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inquiry:    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  attendance: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
}

const TYPE_CHIPS = [
  { label: 'All',        value: '' },
  { label: 'Payments',   value: 'payment' },
  { label: 'Renewals',   value: 'renewal' },
  { label: 'Visitors',   value: 'visitor' },
  { label: 'Inquiries',  value: 'inquiry' },
  { label: 'Attendance', value: 'attendance' },
]

const SUMMARY_CARDS = [
  { label: 'Payments (₹ at risk)', key: 'payment' },
  { label: 'Visitors',             key: 'visitor' },
  { label: 'Renewals (7 days)',    key: 'renewal' },
  { label: 'Overdue',              key: 'overdue' },
  { label: 'Today',                key: 'today' },
  { label: 'Completed',            key: 'completed' },
]

function sevenDaysFromNow() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

// ── Add Modal ────────────────────────────────────────────────────────────────
function AddModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('payment')
  const [priority, setPriority] = useState<'normal' | 'critical'>('normal')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(sevenDaysFromNow())
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const { data: results = [] } = useQuery<Member[]>({
    queryKey: ['member-search', debouncedQ],
    queryFn: () => api.get(`/api/members?search=${encodeURIComponent(debouncedQ)}`),
    enabled: debouncedQ.length >= 2,
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/api/followups', {
        contactId: selected!._id,
        contactType: 'member',
        subject,
        type,
        priority,
        assignedToId: user?.id ?? '',
        ...(amount ? { amountInPaise: Math.round(parseFloat(amount) * 100) } : {}),
        dueDate,
        ...(notes ? { notes } : {}),
      }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Follow-up</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Member search */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Member / Visitor *</label>
          {selected ? (
            <div className="flex items-center justify-between rounded-lg border border-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.code}</p>
              </div>
              <button onClick={() => { setSelected(null); setQ('') }}>
                <X size={14} className="text-gray-400 hover:text-orange-600" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={q}
                  onChange={e => { setQ(e.target.value); setDropOpen(true) }}
                  onFocus={() => setDropOpen(true)}
                  placeholder="Type name or phone…"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {dropOpen && results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
                  {results.map(m => (
                    <button key={m._id} className="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm"
                      onClick={() => { setSelected(m); setDropOpen(false); setQ('') }}>
                      <p className="font-medium text-gray-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.code} · {m.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Subject *</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Pending payment for June"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Type *</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="payment">Payment</option>
              <option value="renewal">Renewal</option>
              <option value="visitor">Visitor</option>
              <option value="inquiry">Inquiry</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Priority</label>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm h-[38px]">
              {(['normal', 'critical'] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className={cn('flex-1 font-medium capitalize transition-colors', priority === p ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Amount (₹, optional)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Due Date *</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any notes…"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button disabled={!selected || !subject || mutation.isPending} onClick={() => mutation.mutate()}
            className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 text-sm font-semibold text-white transition-colors">
            {mutation.isPending ? 'Saving…' : 'Add Follow-up'}
          </button>
        </div>
        {mutation.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  )
}

// ── Complete Modal ───────────────────────────────────────────────────────────
function CompleteModal({ followup, onClose, onSuccess }: { followup: FollowUp; onClose: () => void; onSuccess: () => void }) {
  const [note, setNote] = useState('')
  const mutation = useMutation({
    mutationFn: () => api.post(`/api/followups/${followup._id}/complete`, { closingNote: note }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Mark Complete</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
          <p className="font-medium text-gray-900 dark:text-white">{followup.subject}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">{followup.type} · Due {formatDate(followup.dueDate)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Closing Note *</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="What was resolved?"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button disabled={!note.trim() || mutation.isPending} onClick={() => mutation.mutate()}
            className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 text-sm font-semibold text-white transition-colors">
            {mutation.isPending ? 'Saving…' : 'Mark Complete'}
          </button>
        </div>
        {mutation.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
const TABS = ['Follow-ups', 'Completed', 'Membership Renewals', 'Expired Memberships', 'Activity Log'] as const
type Tab = typeof TABS[number]

export default function FollowupsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('Follow-ups')
  const [addOpen, setAddOpen] = useState(false)
  const [completing, setCompleting] = useState<FollowUp | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [summaryFilter, setSummaryFilter] = useState('')
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(t)
  }, [rawSearch])

  const qs = new URLSearchParams({ status: 'open' })
  if (typeFilter) qs.set('type', typeFilter)
  if (from) qs.set('from', from)
  if (to) qs.set('to', to)

  const { data: followups = [], isLoading } = useQuery<FollowUp[]>({
    queryKey: ['followups', typeFilter, from, to],
    queryFn: () => api.get(`/api/followups?${qs.toString()}`),
  })

  const today = new Date().toISOString().slice(0, 10)
  const summaryCounts = {
    payment:   followups.filter(f => f.type === 'payment').length,
    visitor:   followups.filter(f => f.type === 'visitor').length,
    renewal:   followups.filter(f => f.type === 'renewal').length,
    overdue:   followups.filter(f => f.dueDate < today).length,
    today:     followups.filter(f => f.dueDate.slice(0, 10) === today).length,
    completed: 0,
  }

  const filtered = followups.filter(f => {
    if (summaryFilter === 'overdue') return f.dueDate < today
    if (summaryFilter === 'today') return f.dueDate.slice(0, 10) === today
    if (summaryFilter && summaryFilter !== 'completed') return f.type === summaryFilter
    if (search) return f.subject.toLowerCase().includes(search.toLowerCase())
    return true
  })

  const handleSuccess = useCallback(() => {
    setAddOpen(false)
    setCompleting(null)
    queryClient.invalidateQueries({ queryKey: ['followups'] })
  }, [queryClient])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Follow-ups &amp; Renewals</h1>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          <Plus size={16} />
          Add Follow-up
        </button>
      </div>

      {/* Summary filter cards */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUMMARY_CARDS.map(c => (
          <button key={c.key} onClick={() => setSummaryFilter(summaryFilter === c.key ? '' : c.key)}
            className={cn(
              'flex-shrink-0 rounded-xl border px-4 py-3 text-left min-w-[120px] transition-colors',
              summaryFilter === c.key
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-orange-300'
            )}>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{c.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {summaryCounts[c.key as keyof typeof summaryCounts] ?? 0}
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === t
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}>
            {t}
          </button>
        ))}
      </div>

      {tab !== 'Follow-ups' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center text-sm text-gray-400 dark:text-gray-500">
          {tab === 'Completed' && 'No completed follow-ups'}
          {tab === 'Membership Renewals' && 'No renewals due this month'}
          {tab === 'Expired Memberships' && 'No expired memberships'}
          {tab === 'Activity Log' && 'Activity log coming soon'}
        </div>
      )}

      {tab === 'Follow-ups' && (
        <>
          {/* Type chips + search + date range */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {TYPE_CHIPS.map(c => (
                <button key={c.value} onClick={() => setTypeFilter(c.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border transition-colors',
                    typeFilter === c.value
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600'
                  )}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input value={rawSearch} onChange={e => setRawSearch(e.target.value)} placeholder="Search subject…"
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Subject', 'Type', 'Priority', 'Amount', 'Due Date', 'Actions'].map(col => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    {[1, 2, 3].map(i => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 animate-pulse">
                        {[180, 90, 80, 80, 90, 120].map((w, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" style={{ width: w }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                      No follow-ups yet
                    </td>
                  </tr>
                ) : (
                  filtered.map(f => {
                    const overdue = f.dueDate < today
                    return (
                      <tr key={f._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{f.subject}</td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', TYPE_BADGE[f.type])}>
                            {f.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                            f.priority === 'critical'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                            {f.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {f.amountInPaise ? formatRupees(f.amountInPaise) : '—'}
                        </td>
                        <td className={cn('px-4 py-3 whitespace-nowrap',
                          overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300')}>
                          {formatDate(f.dueDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCompleting(f)}
                              className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 hover:border-green-400 transition-colors">
                              Complete
                            </button>
                            <button className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {addOpen && <AddModal onClose={() => setAddOpen(false)} onSuccess={handleSuccess} />}
      {completing && <CompleteModal followup={completing} onClose={() => setCompleting(null)} onSuccess={handleSuccess} />}
    </div>
  )
}
