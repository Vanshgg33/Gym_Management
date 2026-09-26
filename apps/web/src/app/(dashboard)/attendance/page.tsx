'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Search, X } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AttendanceRecord {
  _id: string
  memberId: string | { _id: string; name: string; code: string }
  checkIn: string
  checkOut: string | null
  source: 'manual' | 'self' | 'biometric'
  isStaff: boolean
}

interface Member {
  _id: string
  name: string
  code: string
  phone: string
}

function toIST(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function toISTDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function duration(checkIn: string, checkOut: string | null) {
  if (!checkOut) return null
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const SOURCE_BADGE: Record<string, string> = {
  manual:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  self:      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  biometric: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function localDatetimeNow() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// ── Check-in Modal ──────────────────────────────────────────────────────────
function CheckInModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [checkIn, setCheckIn] = useState(localDatetimeNow())
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const { data: results = [] } = useQuery<Member[]>({
    queryKey: ['member-search', debouncedQ],
    queryFn: () => api.get(`/members?search=${encodeURIComponent(debouncedQ)}`),
    enabled: debouncedQ.length >= 2,
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/attendance/checkin', {
        memberId: selected!._id,
        checkIn: new Date(checkIn).toISOString(),
        ...(checkOut ? { checkOut: new Date(checkOut).toISOString() } : {}),
        source: 'manual',
        ...(notes ? { notes } : {}),
      }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Check In Member</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Member search */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Member *</label>
          {selected ? (
            <div className="flex items-center justify-between rounded-lg border border-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.code} · {selected.phone}</p>
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
                    <button
                      key={m._id}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm"
                      onClick={() => { setSelected(m); setDropOpen(false); setQ('') }}
                    >
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
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Check-in Time *</label>
          <input
            type="datetime-local"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Check-out Time (optional)</label>
          <input
            type="datetime-local"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Notes (optional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any notes…"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button
            disabled={!selected || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 text-sm font-semibold text-white transition-colors"
          >
            {mutation.isPending ? 'Checking in…' : 'Check In'}
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
const TABS = ['Records', 'Web Logins', 'Short Attendance'] as const
type Tab = typeof TABS[number]

export default function AttendancePage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('Records')
  const [modalOpen, setModalOpen] = useState(false)
  const [from, setFrom] = useState(todayISO())
  const [to, setTo] = useState(todayISO())
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(t)
  }, [rawSearch])

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', from, to, isStaff],
    queryFn: () => api.get(`/attendance?from=${from}&to=${to}&isStaff=${isStaff}`),
  })

  // Filtered by search client-side (name/code)
  const filtered = search
    ? records.filter(r => {
        const m = typeof r.memberId === 'object' ? r.memberId : null
        if (!m) return false
        return m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
      })
    : records

  const today = todayISO()
  const todayRecords = records.filter(r => r.checkIn.slice(0, 10) === today)
  const currentlyIn = todayRecords.filter(r => !r.checkOut).length
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = records.filter(r => new Date(r.checkIn) >= weekAgo).length

  const stats = [
    { label: "Today's Check-ins", value: todayRecords.length },
    { label: 'Currently In', value: currentlyIn },
    { label: 'This Week', value: thisWeek },
    { label: 'Biometric', value: '0 (0%)' },
  ]

  const handleCheckInSuccess = useCallback(() => {
    setModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
  }, [queryClient])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          <CalendarCheck size={16} />
          + Check-in
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Web Logins' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center text-sm text-gray-400 dark:text-gray-500">
          Web login tracking coming soon
        </div>
      )}

      {tab === 'Short Attendance' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center text-sm text-gray-400 dark:text-gray-500">
          Coming soon — shows members who haven&apos;t visited in 7+ days
        </div>
      )}

      {tab === 'Records' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={rawSearch}
                onChange={e => setRawSearch(e.target.value)}
                placeholder="Search name or code…"
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
              <button
                onClick={() => setIsStaff(false)}
                className={cn('px-3 py-1.5 font-medium transition-colors', !isStaff ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-orange-50')}
              >
                Members
              </button>
              <button
                onClick={() => setIsStaff(true)}
                className={cn('px-3 py-1.5 font-medium transition-colors', isStaff ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-orange-50')}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Member Name', 'Code', 'Check-in (IST)', 'Check-out', 'Duration', 'Source', 'Actions'].map(col => (
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
                        {[140, 80, 100, 100, 70, 80, 60].map((w, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" style={{ width: w }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                      No attendance records for this period.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => {
                    const m = typeof r.memberId === 'object' ? r.memberId : null
                    const stillIn = !r.checkOut
                    return (
                      <tr key={r._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m?.code ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          <span className="block">{toISTDate(r.checkIn)}</span>
                          <span className="text-xs text-gray-400">{toIST(r.checkIn)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {stillIn ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                              </span>
                              Still In
                            </span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              <span className="block">{toISTDate(r.checkOut!)}</span>
                              <span className="text-xs text-gray-400">{toIST(r.checkOut!)}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {duration(r.checkIn, r.checkOut) ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', SOURCE_BADGE[r.source])}>
                            {r.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors">
                            Edit
                          </button>
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

      {modalOpen && (
        <CheckInModal onClose={() => setModalOpen(false)} onSuccess={handleCheckInSuccess} />
      )}
    </div>
  )
}
