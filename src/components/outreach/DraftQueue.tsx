'use client'

import { Check, X, Clock } from 'lucide-react'
import type { Outreach } from '@/lib/types/database'

interface DraftQueueProps {
  drafts: Outreach[]
  setDrafts: (drafts: Outreach[]) => void
}

export default function DraftQueue({ drafts, setDrafts }: DraftQueueProps) {
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/outreach/${id}/approve`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to approve')

      alert('Draft approved and sent!')
      setDrafts(drafts.filter((d) => d.id !== id))
    } catch (error) {
      console.error('Error approving draft:', error)
      alert('Failed to approve draft')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const response = await fetch(`/api/outreach/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setDrafts(drafts.filter((d) => d.id !== id))
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  return (
    <div className="space-y-4">
      {drafts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Drafts Awaiting Approval
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            AI-generated drafts will appear here for your review
          </p>
        </div>
      ) : (
        drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {draft.channel.toUpperCase()} · Created{' '}
                  {new Date(draft.created_at).toLocaleDateString()}
                </div>
                {draft.subject && (
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {draft.subject}
                  </h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(draft.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve & Send
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
                {draft.body}
              </pre>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
