'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Rocket, CheckCircle2, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import DayTimeline from './DayTimeline'
import ActionCard from './ActionCard'
import { useToast } from '@/components/ui/Toast'
import Toast from '@/components/ui/Toast'
import type { CampaignAction, Campaign, ActionStatus } from '@/lib/types/database'

interface MissionControlProps {
  campaign: Campaign
  initialActions: CampaignAction[]
}

export default function MissionControl({ campaign, initialActions }: MissionControlProps) {
  const { toasts, removeToast, success, error } = useToast()
  const [actions, setActions] = useState(initialActions)
  const [currentDay, setCurrentDay] = useState(() => {
    // Start on the first day that has incomplete actions
    const days = [...new Set(initialActions.map((a) => a.day))].sort((a, b) => a - b)
    for (const day of days) {
      const dayActions = initialActions.filter((a) => a.day === day)
      if (dayActions.some((a) => a.status !== 'completed')) return day
    }
    return days[0] || 1
  })

  // Group by day (only approved/completed actions for execution)
  const executableActions = useMemo(() => actions.filter(
    (a) => a.status === 'approved' || a.status === 'completed'
  ), [actions])

  const actionsByDay = useMemo(() => {
    const map: Record<number, CampaignAction[]> = {}
    for (const action of executableActions) {
      if (!map[action.day]) map[action.day] = []
      map[action.day].push(action)
    }
    return map
  }, [executableActions])

  const days = useMemo(
    () => Object.keys(actionsByDay).map(Number).sort((a, b) => a - b),
    [actionsByDay]
  )

  const currentDayActions = actionsByDay[currentDay] || []

  // Stats
  const totalExecutable = executableActions.length
  const completed = executableActions.filter((a) => a.status === 'completed').length
  const remaining = totalExecutable - completed

  const handleStatusChange = async (id: string, status: ActionStatus) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: id, status }),
      })

      if (!res.ok) throw new Error('Failed to update')

      if (status === 'completed') {
        success('Action completed!')
      }
    } catch {
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: initialActions.find((ia) => ia.id === id)?.status || 'approved' } : a))
      )
      error('Failed to update action')
    }
  }

  const handleContentUpdate = async (id: string, content: CampaignAction['content'], title?: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, content, title: title || a.title } : a))
    )

    try {
      const body: Record<string, unknown> = { action_id: id, content }
      if (title) body.title = title

      const res = await fetch(`/api/campaigns/${campaign.id}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to save')
    } catch {
      error('Failed to save changes')
    }
  }

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <Rocket className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Mission Control
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {campaign.name} — Day-by-day execution
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Target className="h-5 w-5 text-primary-600 dark:text-primary-400 mx-auto mb-1" aria-hidden="true" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalExecutable}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Total Actions</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" aria-hidden="true" />
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completed}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" aria-hidden="true" />
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{remaining}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Remaining</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalExecutable > 0 ? Math.round((completed / totalExecutable) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Progress</div>
        </div>
      </div>

      {/* Main layout: Timeline + Actions */}
      {days.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Timeline sidebar */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 h-fit md:sticky md:top-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Timeline
            </h2>
            <DayTimeline
              days={days}
              actionsByDay={actionsByDay}
              currentDay={currentDay}
              onSelectDay={setCurrentDay}
            />
          </div>

          {/* Current day actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Day {currentDay} — {DAY_NAMES[(currentDay - 1) % 7]}
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {currentDayActions.filter((a) => a.status === 'completed').length} of {currentDayActions.length} complete
              </span>
            </div>

            <div className="space-y-3">
              {currentDayActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onStatusChange={handleStatusChange}
                  onContentUpdate={handleContentUpdate}
                  mode="execute"
                />
              ))}
            </div>

            {currentDayActions.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No approved actions for this day.
                </p>
                <Link
                  href={`/campaigns/${campaign.id}/review`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block"
                >
                  Review and approve actions
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Rocket className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Approved Actions Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
            Review and approve actions first, then come back here to execute them day by day.
          </p>
          <Link
            href={`/campaigns/${campaign.id}/review`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Review Actions
          </Link>
        </div>
      )}
    </div>
  )
}
