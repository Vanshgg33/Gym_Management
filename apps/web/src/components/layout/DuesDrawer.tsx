'use client'

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = ["Due Today", "Up to 14 Days", "15+ Days"] as const

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
  const [tab, setTab] = useState<typeof TABS[number]>("Due Today")

  return (
    <>
      {/* Floating pill button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-3 shadow-lg transition-colors"
      >
        💰 Dues (12)
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">Overdue Payments</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-3 pt-2">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 pb-2 text-xs font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </aside>
    </>
  )
}
