'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import type { CampaignAction } from '@/lib/types/database'

interface DayTimelineProps {
  days: number[]
  actionsByDay: Record<number, CampaignAction[]>
  currentDay: number
  onSelectDay: (day: number) => void
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DayTimeline({ days, actionsByDay, currentDay, onSelectDay }: DayTimelineProps) {
  return (
    <nav className="space-y-1" aria-label="Day timeline">
      {days.map((day) => {
        const dayActions = actionsByDay[day] || []
        const completed = dayActions.filter((a) => a.status === 'completed').length
        const total = dayActions.length
        const allDone = total > 0 && completed === total
        const isActive = day === currentDay
        const dayName = DAY_NAMES[(day - 1) % 7] || ''

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
            aria-current={isActive ? 'step' : undefined}
          >
            {/* Icon */}
            {allDone ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 animate-pulse'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  isActive ? 'text-primary-900 dark:text-primary-100' :
                  allDone ? 'text-green-700 dark:text-green-400' :
                  'text-slate-700 dark:text-slate-300'
                }`}>
                  Day {day}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {dayName}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {completed}/{total} done
              </div>
            </div>

            {/* Mini progress */}
            <div className="w-10 bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden flex-shrink-0">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  allDone ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </button>
        )
      })}
    </nav>
  )
}
