import { createClient } from '@/lib/supabase/server'
import { Send } from 'lucide-react'

export default async function OutreachPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Send className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Outreach
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Compose and manage your outreach campaigns
        </p>
      </div>

      {/* Placeholder content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Email Composer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Compose and send emails to your prospects
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Compose Email
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Draft Queue
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No drafts awaiting approval
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Email Sequences
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create automated email drip sequences
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Create Sequence
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Templates
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Manage your outreach templates
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Create Template
          </button>
        </div>
      </div>
    </div>
  )
}
