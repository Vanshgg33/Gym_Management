'use client'

import { formatDate } from "@/lib/formatters"

const STATS = [
  { label: "Active Members", value: "—", sub: "of 25 limit" },
  { label: "Revenue (Month)", value: "₹0", sub: "no data yet" },
  { label: "Check-ins Today", value: "0", sub: "no data yet" },
  { label: "Dues Pending", value: "12", sub: "members overdue" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Greeting card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back! 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(new Date())}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
