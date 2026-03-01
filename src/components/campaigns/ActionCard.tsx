'use client'

import { useState } from 'react'
import {
  Check,
  X,
  Pencil,
  ChevronDown,
  ChevronUp,
  Mail,
  Linkedin,
  MessageCircle,
  Globe,
  Search,
  ClipboardList,
  Copy,
  Save,
  RotateCcw,
} from 'lucide-react'
import type { CampaignAction, ActionChannel, ActionStatus } from '@/lib/types/database'

interface ActionCardProps {
  action: CampaignAction
  onStatusChange: (id: string, status: ActionStatus) => void
  onContentUpdate: (id: string, content: CampaignAction['content'], title?: string) => void
  mode: 'review' | 'execute'
}

const CHANNEL_CONFIG: Record<ActionChannel, { icon: typeof Mail; color: string; label: string }> = {
  email: { icon: Mail, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', label: 'Email' },
  linkedin: { icon: Linkedin, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'LinkedIn' },
  reddit: { icon: MessageCircle, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', label: 'Reddit' },
  facebook: { icon: Globe, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400', label: 'Facebook' },
  scrape: { icon: Search, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: 'Scrape' },
  task: { icon: ClipboardList, color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300', label: 'Task' },
}

const STATUS_STYLES: Record<ActionStatus, string> = {
  pending: 'border-slate-200 dark:border-slate-700',
  approved: 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10',
  rejected: 'border-red-300 dark:border-red-800 opacity-60',
  completed: 'border-green-300 dark:border-green-800 bg-green-50/30 dark:bg-green-900/5',
  skipped: 'border-slate-200 dark:border-slate-700 opacity-50',
}

export default function ActionCard({ action, onStatusChange, onContentUpdate, mode }: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(action.content)
  const [editTitle, setEditTitle] = useState(action.title)
  const [copied, setCopied] = useState(false)

  const channel = CHANNEL_CONFIG[action.channel] || CHANNEL_CONFIG.task
  const Icon = channel.icon

  const handleSaveEdit = () => {
    onContentUpdate(action.id, editContent, editTitle)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(action.content)
    setEditTitle(action.title)
    setIsEditing(false)
  }

  const getTextFromContent = (content: Record<string, unknown>): string => {
    // Flexibly extract displayable text from any content shape
    if (typeof content === 'string') return content
    const c = content as Record<string, unknown>
    // Email
    if (c.subject || c.body) return `Subject: ${c.subject || ''}\n\n${c.body || ''}`
    // Social
    if (c.message) return String(c.message)
    if (c.body && typeof c.body === 'string') return c.body
    // Task
    if (c.description) return String(c.description)
    if (Array.isArray(c.steps)) return c.steps.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : (s as Record<string, unknown>).description || JSON.stringify(s)}`).join('\n')
    // Scrape
    if (c.actor_id) return `${c.description || c.actor_id}\nQueries: ${Array.isArray(c.queries) ? c.queries.join(', ') : ''}`
    // Fallback
    return JSON.stringify(content, null, 2)
  }

  const handleCopy = () => {
    const text = getTextFromContent(action.content as Record<string, unknown>)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    if (action.action_type === 'email_draft') {
      const c = (isEditing ? editContent : action.content) as Record<string, unknown>
      const subject = String(c.subject || '')
      const body = String(c.body || '')
      if (isEditing) {
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setEditContent({ ...c, subject: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Body</label>
              <textarea
                value={body}
                onChange={(e) => setEditContent({ ...c, body: e.target.value })}
                rows={6}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>
          </div>
        )
      }
      return (
        <div className="space-y-2">
          {subject && (
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject: </span>
              <span className="text-sm text-slate-900 dark:text-white">{subject}</span>
            </div>
          )}
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-900 rounded p-3">
            {body}
          </div>
        </div>
      )
    }

    if (action.action_type === 'social_post') {
      const c = (isEditing ? editContent : action.content) as Record<string, unknown>
      const msg = String(c.message || c.body || '')
      const context = c.context ? String(c.context) : null
      if (isEditing) {
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Message</label>
              <textarea
                value={msg}
                onChange={(e) => setEditContent({ ...c, message: e.target.value, body: e.target.value })}
                rows={4}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )
      }
      return (
        <div className="space-y-2">
          {context && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">{context}</p>
          )}
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 rounded p-3">
            {msg}
          </div>
        </div>
      )
    }

    if (action.action_type === 'scrape_config') {
      const c = action.content as Record<string, unknown>
      const desc = String(c.description || '')
      const actorId = String(c.actor_id || 'unknown')
      const queries = Array.isArray(c.queries) ? c.queries.map(String) : []
      return (
        <div className="space-y-2">
          {desc && <div className="text-sm text-slate-700 dark:text-slate-300">{desc}</div>}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Actor: <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">{actorId}</code>
          </div>
          {queries.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {queries.map((q, i) => (
                <span key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded break-all">
                  {q.length > 60 ? q.slice(0, 60) + '...' : q}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (action.action_type === 'manual_task') {
      const c = (isEditing ? editContent : action.content) as Record<string, unknown>
      const desc = c.description ? String(c.description) : null
      const steps = Array.isArray(c.steps) ? c.steps : null
      const estTime = c.estimated_time ? String(c.estimated_time) : null
      if (isEditing) {
        const editVal = desc || (steps ? steps.map((s: unknown) => typeof s === 'string' ? s : (s as Record<string, unknown>).description || JSON.stringify(s)).join('\n') : '')
        return (
          <textarea
            value={editVal}
            onChange={(e) => setEditContent({ ...c, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      }
      return (
        <div className="space-y-1">
          {desc && <div className="text-sm text-slate-700 dark:text-slate-300">{desc}</div>}
          {steps && (
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {steps.map((step: unknown, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span>{typeof step === 'string' ? step : String((step as Record<string, unknown>).description || JSON.stringify(step))}</span>
                </li>
              ))}
            </ul>
          )}
          {!desc && !steps && (
            <div className="text-sm text-slate-700 dark:text-slate-300">{action.title}</div>
          )}
          {estTime && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Est. time: {estTime}
            </div>
          )}
        </div>
      )
    }

    // Fallback: render whatever content we have
    return (
      <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 rounded p-3">
        {getTextFromContent(action.content as Record<string, unknown>)}
      </div>
    )
  }

  const previewText = () => {
    const c = action.content as Record<string, unknown>
    let text = ''
    if (action.action_type === 'email_draft') {
      text = String(c.subject || '')
    } else if (action.action_type === 'social_post') {
      text = String(c.message || c.body || '')
    } else if (action.action_type === 'manual_task') {
      if (c.description) text = String(c.description)
      else if (Array.isArray(c.steps)) text = c.steps.map((s: unknown) => typeof s === 'string' ? s : (s as Record<string, unknown>).description || '').join('; ')
      else text = action.title
    } else if (action.action_type === 'scrape_config') {
      text = String(c.description || c.actor_id || '')
    }
    return text.length > 80 ? text.slice(0, 80) + '...' : text
  }

  return (
    <div className={`rounded-lg border bg-white dark:bg-slate-800 transition-all hover:shadow-md ${STATUS_STYLES[action.status]}`}>
      {/* Header — always visible */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isEditing && setIsExpanded(!isExpanded) } }}
      >
        {/* Channel badge */}
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${channel.color}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {channel.label}
        </span>

        {/* Title + preview */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${action.status === 'skipped' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {action.title}
          </span>
          {!isExpanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {previewText()}
            </p>
          )}
        </div>

        {/* Status badge */}
        {action.status === 'approved' && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Approved</span>
        )}
        {action.status === 'completed' && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Done</span>
        )}
        {action.status === 'skipped' && (
          <span className="text-xs font-medium text-slate-400">Skipped</span>
        )}

        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 animate-slide-down">
          {/* Edit title in edit mode */}
          {isEditing && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {renderContent()}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            {mode === 'review' && !isEditing && (
              <>
                {action.status !== 'approved' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'approved') }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                </button>
                {action.status !== 'skipped' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'skipped') }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" /> Skip
                  </button>
                )}
                {(action.status === 'approved' || action.status === 'skipped') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'pending') }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
                  </button>
                )}
              </>
            )}

            {mode === 'execute' && action.status !== 'completed' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy() }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'completed') }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Mark Complete
                </button>
              </>
            )}

            {mode === 'execute' && action.status === 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'approved') }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Undo Complete
              </button>
            )}

            {isEditing && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSaveEdit() }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancelEdit() }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </div>
  )
}
