'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react'
import ActionCard from './ActionCard'
import type { CampaignAction, ActionStatus } from '@/lib/types/database'

interface DayGroupProps {
  day: number
  actions: CampaignAction[]
  campaignId?: string
  onStatusChange: (id: string, status: ActionStatus) => void
  onContentUpdate: (id: string, content: CampaignAction['content'], title?: string) => void
  onApproveAll: (ids: string[]) => void
  onExecute?: (id: string) => Promise<void>
  mode: 'review' | 'execute'
  defaultExpanded?: boolean
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DayGroup({
  day,
  actions,
  campaignId,
  onStatusChange,
  onContentUpdate,
  onApproveAll,
  onExecute,
  mode,
  defaultExpanded = false,
}: DayGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const approvedOrCompleted = actions.filter(
    (a) => a.status === 'approved' || a.status === 'completed'
  ).length
  const pendingIds = actions.filter((a) => a.status === 'pending').map((a) => a.id)
  const allDone = approvedOrCompleted === actions.length
  const dayName = DAY_NAMES[(day - 1) % 7] || `Day ${day}`

  // Summary of channels
  const channelCounts: Record<string, number> = {}
  for (const a of actions) {
    channelCounts[a.channel] = (channelCounts[a.channel] || 0) + 1
  }
  const summary = Object.entries(channelCounts)
    .map(([ch, count]) => `${count} ${ch}`)
    .join(', ')

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Day header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Day {day} — {dayName}
            </h3>
            {allDone && (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            )}
          </div>
          {!isExpanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {summary}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium ${allDone ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {approvedOrCompleted} of {actions.length}
          </span>
          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${actions.length > 0 ? (approvedOrCompleted / actions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </button>

      {/* Actions list */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Approve all button for review mode */}
          {mode === 'review' && pendingIds.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => onApproveAll(pendingIds)}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Approve all {pendingIds.length} pending
              </button>
            </div>
          )}

          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              campaignId={campaignId}
              onStatusChange={onStatusChange}
              onContentUpdate={onContentUpdate}
              onExecute={onExecute}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
