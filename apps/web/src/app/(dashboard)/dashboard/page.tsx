'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

type Period = 'today' | 'week' | 'month'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function weekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}

function monthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function periodStart(p: Period) {
  if (p === 'today') return todayISO()
  if (p === 'week') return weekStart()
  return monthStart()
}

function formatFullDate(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
}

function StatCard({
  title,
  value,
  sub,
  loading,
}: {
  title: string
  value: string | number
  sub?: string
  loading?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
      {loading ? (
        <>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  )
}

function ActionTile({
  title,
  description,
  count,
}: {
  title: string
  description: string
  count: string | number
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <span className="shrink-0 min-w-[2rem] text-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1">
        {count}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('today')

  const { data: activeMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: () => api.get('/members?status=active'),
  })

  const { data: allMembers, isLoading: loadingAll } = useQuery({
    queryKey: ['members', 'all'],
    queryFn: () => api.get('/members'),
  })

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => api.get(`/attendance?date=${todayISO()}`),
  })

  const pStart = periodStart(period)

  const newJoinings = Array.isArray(allMembers)
    ? allMembers.filter((m: { createdAt?: string }) => m.createdAt && m.createdAt.slice(0, 10) >= pStart).length
    : 0

  const activeMemberCount = Array.isArray(activeMembers) ? activeMembers.length : 0
  const attendanceCount = Array.isArray(attendance) ? attendance.length : 0
  const loadingCards = loadingMembers || loadingAll || loadingAttendance

  return (
    <div className="space-y-6">
      {/* Greeting + period */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatFullDate(new Date())}</p>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                period === p
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Headline stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Live Members"
          value={activeMemberCount}
          sub="active memberships"
          loading={loadingCards}
        />
        <StatCard
          title="Revenue"
          value="₹0"
          sub={`this ${period}`}
          loading={false}
        />
        <StatCard
          title="New Joinings"
          value={newJoinings}
          sub={`joined this ${period}`}
          loading={loadingCards}
        />
        <StatCard
          title="Action Needed"
          value="—"
          sub="placeholder"
          loading={false}
        />
        <StatCard
          title="Total Sales"
          value="—"
          sub="placeholder"
          loading={false}
        />
        <StatCard
          title="Attendance Today"
          value={attendanceCount}
          sub="check-ins today"
          loading={loadingAttendance}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/members"
          className="flex items-center gap-1.5 rounded-lg border-2 border-orange-500 text-orange-600 text-sm font-semibold px-4 py-2 hover:bg-orange-50 transition-colors"
        >
          + Add Member
        </Link>
        <button className="flex items-center gap-1.5 rounded-lg border-2 border-orange-500 text-orange-600 text-sm font-semibold px-4 py-2 hover:bg-orange-50 transition-colors">
          Collect Payment
        </button>
        <Link
          href="/attendance"
          className="flex items-center gap-1.5 rounded-lg border-2 border-orange-500 text-orange-600 text-sm font-semibold px-4 py-2 hover:bg-orange-50 transition-colors"
        >
          Check-in Member
        </Link>
        <Link
          href="/finance"
          className="flex items-center gap-1.5 rounded-lg border-2 border-orange-500 text-orange-600 text-sm font-semibold px-4 py-2 hover:bg-orange-50 transition-colors"
        >
          View Analytics
        </Link>
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActionTile title="Pending Renewals" description="members expiring today" count="—" />
        <ActionTile title="Pending Payments" description="dues today" count="—" />
        <ActionTile title="Short Attendance" description="not visited in 7+ days" count="—" />
        <ActionTile title="Birthdays Today" description="members with birthday today" count="—" />
        <ActionTile title="Renewed Today" description="renewals processed today" count="—" />
        <ActionTile title="Members with PT" description="active personal training" count="—" />
      </div>

      {/* Follow-ups table */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Follow-ups Due Today</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No follow-ups due today
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <Link href="/followups" className="text-sm text-orange-500 font-medium hover:text-orange-600">
            View All Follow-ups →
          </Link>
        </div>
      </div>
    </div>
  )
}
