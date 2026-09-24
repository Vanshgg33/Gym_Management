'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = ['Open Tickets', 'Resolved', 'FAQs', 'Contact Us'] as const
type Tab = typeof TABS[number]

export default function SupportPage() {
  const [tab, setTab] = useState<Tab>('Open Tickets')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Support</h1>
        <button className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          + New Ticket
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
          <span className="text-orange-500 text-xl">🎧</span>
        </div>
        <p className="font-semibold text-gray-700">Coming soon</p>
        <p className="text-sm text-gray-400 mt-1">{tab} will be available in a future update.</p>
      </div>
    </div>
  )
}
