'use client'

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { DuesDrawer } from "./DuesDrawer"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(v => !v)} />

      {/* Main content */}
      <main className="md:ml-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      <DuesDrawer />
    </div>
  )
}
