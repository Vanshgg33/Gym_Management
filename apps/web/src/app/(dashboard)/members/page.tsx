'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { AddMemberWizard } from './components/AddMemberWizard'

interface Member {
  _id: string
  code: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  status: 'pending' | 'active' | 'inactive' | 'archived' | 'blocked'
  isArchived: boolean
  createdAt: string
  photoUrl?: string
}

const STATUS_COLORS: Record<Member['status'], string> = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blocked:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const FILTER_CHIPS = [
  { label: 'All',      status: '' },
  { label: 'Live',     status: 'active' },
  { label: 'Non-Live', status: 'inactive' },
  { label: 'Visitors', status: 'visitor' },
] as const

function Skeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 animate-pulse">
          {[48, 160, 120, 80, 100, 80].map((w, j) => (
            <td key={j} className="px-4 py-3">
              <div className={cn('h-4 rounded bg-gray-200 dark:bg-gray-700')} style={{ width: w }} />
            </td>
          ))}
          <td className="px-4 py-3">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
        </tr>
      ))}
    </>
  )
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
  }
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-400">
      {initials}
    </div>
  )
}

function formatPhone(phone: string) {
  // +919876543210 → +91 98765 43210
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`
  }
  return phone
}

export default function MembersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('')
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(t)
  }, [rawSearch])

  const effectiveStatus = activeChip || status

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['members', search, effectiveStatus, gender, showArchived],
    queryFn: () =>
      api.get(
        `/api/members?search=${encodeURIComponent(search)}&status=${effectiveStatus}&gender=${gender}&isArchived=${showArchived}`
      ),
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Members &amp; Visitors</h1>
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={rawSearch}
          onChange={e => setRawSearch(e.target.value)}
          placeholder="Search by name, phone, or code…"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => setActiveChip(chip.status)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors border',
              activeChip === chip.status
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600'
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Second filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setActiveChip('') }}
            className="appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
            className="accent-orange-500 h-4 w-4 rounded"
          />
          Show Archived
        </label>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {['Photo', 'Name & Code', 'Phone', 'Status', 'Joined', 'Actions'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton />
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {search || effectiveStatus || gender
                    ? 'No members match your filters.'
                    : 'No members yet. Add your first member to get started.'}
                </td>
              </tr>
            ) : (
              members.map(m => (
                <tr
                  key={m._id}
                  onClick={() => router.push(`/members/${m._id}`)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <Avatar name={m.name} photoUrl={m.photoUrl} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{m.code}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatPhone(m.phone)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[m.status])}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/members/${m._id}`)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          api.patch(`/api/members/${m._id}/archive`, {}).then(() =>
                            queryClient.invalidateQueries({ queryKey: ['members'] })
                          )
                        }
                        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        {m.isArchived ? 'Restore' : 'Archive'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {wizardOpen && (
        <AddMemberWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSuccess={() => {
            setWizardOpen(false)
            queryClient.invalidateQueries({ queryKey: ['members'] })
          }}
        />
      )}
    </div>
  )
}
