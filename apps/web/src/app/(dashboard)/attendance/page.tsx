'use client'

import { CalendarCheck } from "lucide-react"

export default function AttendancePage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          <CalendarCheck size={16} />
          + Check-in
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <CalendarCheck size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-400 dark:text-gray-500">No check-ins recorded yet.</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Use "Check-in" to record member attendance.</p>
      </div>
    </div>
  )
}
