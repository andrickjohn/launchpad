import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Placeholder content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Active Campaigns
          </h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Total Prospects
          </h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Emails Sent
          </h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          No activity yet. Start by creating a campaign and adding prospects.
        </p>
      </div>
    </div>
  )
}
