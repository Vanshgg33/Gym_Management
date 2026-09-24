'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Package, Users, Bell, UserCog, BarChart2,
  Receipt, ShoppingBag, CalendarCheck, Dumbbell, Apple,
  HelpCircle, Settings, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Dashboard",            href: "/dashboard",     icon: LayoutDashboard },
  { label: "Packages & Discounts", href: "/packages",      icon: Package },
  { label: "Members & Visitors",   href: "/members",       icon: Users },
  { label: "Follow-ups & Renewals",href: "/followups",     icon: Bell },
  { label: "Staff & Operations",   href: "/staff",         icon: UserCog },
  { label: "Finance & Analytics",  href: "/finance",       icon: BarChart2 },
  { label: "Expenses",             href: "/expenses",      icon: Receipt },
  { label: "Inventory",            href: "/inventory",     icon: ShoppingBag },
  { label: "Attendance",           href: "/attendance",    icon: CalendarCheck },
  { label: "Workout Plans",        href: "/workout-plans", icon: Dumbbell },
  { label: "Diet Plans",           href: "/diet-plans",    icon: Apple },
  { label: "Support",              href: "/support",       icon: HelpCircle },
  { label: "Settings",             href: "/settings",      icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
            GD
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-lg">GymDesk</span>
          <button
            onClick={onClose}
            className="ml-auto md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 mb-0.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Plan card */}
        <div className="mx-3 mb-4 rounded-xl bg-orange-50 dark:bg-gray-800 p-3 border border-orange-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">Freemium Plan</p>
          <div className="mb-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Members</span><span>0 / 25</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-1.5 w-0 rounded-full bg-orange-500" />
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Staff</span><span>0 / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-1.5 w-0 rounded-full bg-orange-500" />
            </div>
          </div>
          <button className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-1.5 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </aside>
    </>
  )
}
