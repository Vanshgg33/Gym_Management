'use client'

import { useState } from 'react'
import { X, MessageCircle, PhoneCall } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const TABS = ['Due Today', 'Up to 14 Days', '15+ Days'] as const
type Tab = typeof TABS[number]

interface DueRow {
  membership: { _id: string; packageSnapshot?: { name: string } }
  member: { _id: string; name: string; phone: string; code: string } | string
  dueInPaise: number
  daysOverdue: number
}

function MemberName(member: DueRow['member']) {
  if (typeof member === 'string') return member
  return member.name ?? '—'
}

function DueRow({ row }: { row: DueRow }) {
  const member = typeof row.member === 'string' ? null : row.member
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold shrink-0">
        {member?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {member?.name ?? '—'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {member?.code ?? ''} · {row.membership?.packageSnapshot?.name ?? 'Package'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-red-600">{formatRupees(row.dueInPaise)}</p>
        <p className="text-xs text-gray-400">{row.daysOverdue === 0 ? 'Due today' : `${row.daysOverdue}d overdue`}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {member?.phone && (
          <a href={`tel:${member.phone}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <PhoneCall size={13} />
          </a>
        )}
        {member?.phone && (
          <a href={`https://wa.me/${member.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600">
            <MessageCircle size={13} />
          </a>
        )}
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  )
}

export function DuesDrawer() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('Due Today')

  const { data, isLoading } = useQuery({
    queryKey: ['dues'],
    queryFn: () => api.get('/memberships/dues'),
    enabled: open,
    staleTime: 60_000,
  })

  const rows: DueRow[] = tab === 'Due Today'
    ? (data?.dueToday ?? [])
    : tab === 'Up to 14 Days'
    ? (data?.dueTo14Days ?? [])
    : (data?.due15Plus ?? [])

  const totalCount = data?.totalCount ?? 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-3 shadow-lg transition-colors"
      >
        💰 Dues {totalCount > 0 ? `(${totalCount})` : ''}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      )}

      <aside className={cn(
        'fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 flex flex-col',
        open ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">Overdue Payments</h2>
            {totalCount > 0 && <p className="text-xs text-gray-400 mt-0.5">{totalCount} member{totalCount !== 1 ? 's' : ''} with dues</p>}
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800 px-3 pt-2">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 pb-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === t
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              )}
            >
              {t}
              {t === 'Due Today' && data?.dueToday?.length > 0 && (
                <span className="ml-1 rounded-full bg-orange-100 text-orange-600 px-1.5 text-xs">{data.dueToday.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {isLoading ? (
            <>
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No dues in this bucket</p>
              <p className="text-xs text-gray-400 mt-1">All payments are up to date</p>
            </div>
          ) : (
            rows.map((row, i) => <DueRow key={i} row={row} />)
          )}
        </div>
      </aside>
    </>
  )
}
