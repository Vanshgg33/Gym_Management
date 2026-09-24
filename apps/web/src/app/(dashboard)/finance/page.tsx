'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, DollarSign, CreditCard } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRupees, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const TABS = ['Revenue Data', 'Sales Data', 'Revenue Charts'] as const
type Tab = typeof TABS[number]

const PERIODS = ['Today', 'This Week', 'This Month'] as const

function getPeriodDates(period: string): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  if (period === 'Today') {
    const from = new Date(now); from.setHours(0,0,0,0)
    return { from: from.toISOString(), to }
  }
  if (period === 'This Week') {
    const from = new Date(now); from.setDate(now.getDate() - 7)
    return { from: from.toISOString(), to }
  }
  const from = new Date(now); from.setMonth(now.getMonth() - 1)
  return { from: from.toISOString(), to }
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('Revenue Data')
  const [period, setPeriod] = useState('This Month')

  const { from, to } = getPeriodDates(period)

  const { data: cards } = useQuery({
    queryKey: ['finance-cards', from, to],
    queryFn: () => api.get(`/finance/cards?from=${from}&to=${to}`),
  })

  const { data: revenue = [], isLoading } = useQuery({
    queryKey: ['finance-revenue', from, to],
    queryFn: () => api.get(`/finance/revenue?from=${from}&to=${to}`),
    enabled: tab === 'Revenue Data',
  })

  const { data: sales = [] } = useQuery({
    queryKey: ['finance-sales', from, to],
    queryFn: () => api.get(`/finance/sales?from=${from}&to=${to}`),
    enabled: tab === 'Sales Data',
  })

  const statCards = [
    { label: 'Revenue Collected', value: formatRupees(cards?.revenueCollected ?? 0), icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Sales', value: formatRupees(cards?.totalSales ?? 0), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Total Due', value: formatRupees(cards?.totalDue ?? 0), icon: CreditCard, color: 'text-orange-600' },
    { label: 'Total Payments', value: String(cards?.totalPayments ?? 0), icon: BarChart2, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Finance & Analytics</h1>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2">
          + Collect Payment
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              period === p
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                tab === t
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'Revenue Data' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Date', 'Member', 'Package', 'Amount Paid', 'Method', 'Received By'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : revenue.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No revenue data for this period</td></tr>
              ) : revenue.map((row: Record<string, unknown>) => (
                <tr key={String(row._id)} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(String(row.date ?? row.createdAt))}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{String(row.memberName ?? '—')}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{String(row.packageName ?? '—')}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatRupees(Number(row.totalInPaise ?? 0))}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{String(Array.isArray(row.entries) && row.entries[0] ? (row.entries as {method: string}[])[0].method : '—').replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Sales Data' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Start Date', 'Member', 'Package', 'Sale Price', 'Status'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No sales data for this period</td></tr>
              ) : sales.map((row: Record<string, unknown>) => (
                <tr key={String(row._id)} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(String(row.startDate))}</td>
                  <td className="px-4 py-3 font-medium">—</td>
                  <td className="px-4 py-3 text-gray-600">{String((row.packageSnapshot as {name?: string})?.name ?? '—')}</td>
                  <td className="px-4 py-3 font-semibold">{formatRupees(Number(row.salePriceInPaise ?? 0))}</td>
                  <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs bg-green-100 text-green-700 capitalize">{String(row.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Revenue Charts' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <BarChart2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue charts coming soon</p>
          <p className="text-gray-400 text-xs mt-1">Complete through yesterday — payments today not reflected</p>
        </div>
      )}
    </div>
  )
}
