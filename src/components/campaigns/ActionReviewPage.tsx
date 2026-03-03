'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Rocket } from 'lucide-react'
import Link from 'next/link'
import DayGroup from './DayGroup'
import { useToast } from '@/components/ui/Toast'
import Toast from '@/components/ui/Toast'
import type { CampaignAction, Campaign, ActionStatus } from '@/lib/types/database'

interface ActionReviewPageProps {
  campaign: Campaign
  initialActions: CampaignAction[]
}

export default function ActionReviewPage({ campaign, initialActions }: ActionReviewPageProps) {
  // router not needed yet
  const { toasts, removeToast, success, error } = useToast()
  const [actions, setActions] = useState(initialActions)
  const [loading, setLoading] = useState(false)

  const fetchActions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/actions`)
      if (!res.ok) throw new Error('Failed to fetch actions')
      const data = await res.json()
      setActions(data.actions)
    } catch (err) {
      error('Failed to refresh actions')
    } finally {
      setLoading(false)
    }
  }, [campaign.id, error])

  // Group by day
  const grouped = useMemo(() => {
    const map: Record<number, CampaignAction[]> = {}
    for (const action of actions) {
      if (!map[action.day]) map[action.day] = []
      map[action.day].push(action)
    }
    return map
  }, [actions])

  const days = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  // Stats
  const total = actions.length
  const approved = actions.filter((a) => a.status === 'approved' || a.status === 'completed').length
  const pending = actions.filter((a) => a.status === 'pending').length

  const handleStatusChange = async (id: string, status: ActionStatus) => {
    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: id, status }),
      })

      if (!res.ok) {
        throw new Error('Failed to update')
      }
    } catch {
      // Revert on error
      fetchActions()
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

      if (!res.ok) throw new Error('Failed to update')
    } catch {
      // Revert
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: initialActions.find((ia) => ia.id === id)?.status || 'pending' } : a))
      )
      error('Failed to update action content')
    }
  }

  const handleExecute = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/actions/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to execute')
      }

      const data = await res.json()

      // Optimistic update
      setActions(prev => prev.map(a =>
        a.id === id
          ? { ...a, status: 'completed' as ActionStatus, execution_result: data.result, executed_at: new Date().toISOString() } as CampaignAction
          : a
      ))

      success(data.result?.message || 'Action executed successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to execute action'
      error(message)
    }
  }

  const handleApproveAll = async (ids: string[]) => {
    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, status: 'approved' as ActionStatus } : a))
    )

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/actions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_ids: ids, status: 'approved' }),
      })

      if (!res.ok) throw new Error('Failed to approve')
      success(`${ids.length} actions approved`)
    } catch {
      // Revert
      setActions(initialActions)
      error('Failed to approve actions')
    }
  }

  const handleApproveAllRemaining = () => {
    const pendingIds = actions.filter((a) => a.status === 'pending').map((a) => a.id)
    if (pendingIds.length > 0) {
      handleApproveAll(pendingIds)
    }
  }

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

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Review Campaign Actions
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {total} actions generated across {days.length} days for <strong>{campaign.name}</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {approved} of {total} approved
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {pending} pending
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={total > 0 ? Math.round((approved / total) * 100) : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Action approval progress"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4">
          {pending > 0 && (
            <button
              onClick={handleApproveAllRemaining}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Approve All Remaining ({pending})
            </button>
          )}
          {approved > 0 && (
            <Link
              href={`/campaigns/${campaign.id}/mission-control`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Rocket className="h-4 w-4" aria-hidden="true" />
              Mission Control
            </Link>
          )}
        </div>
      </div>

      {/* Day groups */}
      <div className="space-y-4">
        {days.map((day) => (
          <DayGroup
            key={day}
            day={day}
            actions={grouped[day]}
            campaignId={campaign.id}
            onStatusChange={handleStatusChange}
            onContentUpdate={handleContentUpdate}
            onApproveAll={handleApproveAll}
            onExecute={handleExecute}
            mode="review"
            defaultExpanded={day === days[0]}
          />
        ))}
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Rocket className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Actions Generated
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Something went wrong during activation. Go back and try activating the campaign again.
          </p>
        </div>
      )}
    </div>
  )
}
