'use client'

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, Search, Sun, Moon, Bell, ChevronDown, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/packages":     "Packages & Discounts",
  "/members":      "Members & Visitors",
  "/followups":    "Follow-ups & Renewals",
  "/staff":        "Staff & Operations",
  "/finance":      "Finance & Analytics",
  "/expenses":     "Expenses",
  "/inventory":    "Inventory",
  "/attendance":   "Attendance",
  "/workout-plans":"Workout Plans",
  "/diet-plans":   "Diet Plans",
  "/support":      "Support",
  "/settings":     "Settings",
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Ctrl+K search focus
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        document.getElementById("topbar-search")?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ?? "GymDesk"

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-10 flex h-16 items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Menu size={22} />
      </button>

      {/* Page title (mobile) / Gym name */}
      <span className="font-semibold text-gray-900 dark:text-white text-sm md:hidden">{pageTitle}</span>
      <span className="hidden md:block font-semibold text-gray-900 dark:text-white text-sm">{pageTitle}</span>

      {/* Search */}
      <div className="flex-1 mx-4 max-w-xl hidden md:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search members, packages, staff..."
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-16 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setAvatarOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <ChevronDown size={14} className="text-gray-500 hidden md:block" />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" })
                  window.location.href = "/login"
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400",
                  "hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                )}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
