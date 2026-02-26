import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Users, Lock, Bell, Palette } from 'lucide-react'

export const metadata = {
  title: 'Settings | LaunchPad',
  description: 'Manage your account and preferences',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Account Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <SettingsIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Account
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your account information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* VA System - Coming Soon */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              Coming Soon
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Virtual Assistant (VA) System
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Invite team members with limited permissions
              </p>
            </div>
          </div>

          <div className="space-y-4 opacity-60 pointer-events-none">
            <p className="text-slate-700 dark:text-slate-300">
              Give your VA access to execute approved actions without the ability to:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Approve or modify outreach
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Change templates or sequences
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Access billing or settings
              </li>
            </ul>

            <button
              disabled
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 rounded-lg cursor-not-allowed"
            >
              <Users className="h-5 w-5" />
              Invite VA
            </button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-900 dark:text-purple-200">
              <strong>Why we're building this:</strong> VA mode lets you delegate execution while maintaining
              control. Full activity logging ensures transparency. We're polishing the core experience first,
              then adding team features.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage how you receive updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email notifications for new responses
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Daily activity summary
              </span>
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Theme
              </label>
              <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
