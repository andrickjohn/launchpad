'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

/**
 * Client component shell that wraps the authenticated app layout.
 * Manages mobile sidebar open/close state and renders the hamburger
 * toggle button in the mobile header bar.
 *
 * On desktop (lg+) the sidebar is always visible as a static column.
 * On mobile (<lg) the sidebar slides in as a fixed overlay.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar — static on lg+, overlay on smaller screens */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right-hand content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header bar — hidden on lg+ */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            LaunchPad
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
