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
  Rocket,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Square,
  CheckSquare,
  Sparkles,
  Send,
} from 'lucide-react'
import type { CampaignAction, ActionChannel, ActionStatus } from '@/lib/types/database'

interface ActionCardProps {
  action: CampaignAction
  campaignId?: string
  onStatusChange: (id: string, status: ActionStatus) => void
  onContentUpdate: (id: string, content: CampaignAction['content'], title?: string) => void
  onExecute?: (id: string) => Promise<void>
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

// Whether this action type can be auto-executed by the system
function isAutoExecutable(actionType: string): boolean {
  return actionType === 'scrape_config' || actionType === 'email_draft'
}

// Whether this action is a manual/external task
function isManualTask(actionType: string): boolean {
  return actionType === 'manual_task' || actionType === 'social_post'
}

// Get the current pipeline step (0-3)
function getPipelineStep(status: ActionStatus): number {
  switch (status) {
    case 'pending': return 0     // Created
    case 'approved': return 2    // Approved (skips "Reviewed" since review is implicit)
    case 'completed': return 3   // Executed
    case 'skipped': return -1
    case 'rejected': return -1
    default: return 0
  }
}

export default function ActionCard({ action, campaignId, onStatusChange, onContentUpdate, onExecute, mode }: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(action.content)
  const [editTitle, setEditTitle] = useState(action.title)
  const [copied, setCopied] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [showAiRevise, setShowAiRevise] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiRevising, setAiRevising] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const channel = CHANNEL_CONFIG[action.channel] || CHANNEL_CONFIG.task
  const Icon = channel.icon
  const pipelineStep = getPipelineStep(action.status)

  const handleSaveEdit = () => {
    onContentUpdate(action.id, editContent, editTitle)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(action.content)
    setEditTitle(action.title)
    setIsEditing(false)
  }

  const handleExecute = async () => {
    if (!onExecute) return
    setExecuting(true)
    try {
      await onExecute(action.id)
    } finally {
      setExecuting(false)
    }
  }

  const handleAiRevise = async () => {
    if (!aiPrompt.trim() || !campaignId) return
    setAiRevising(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/actions/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.id, prompt: aiPrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error || 'Failed to revise')
        return
      }
      // Update the card content via parent callback
      onContentUpdate(action.id, data.revised_content)
      setEditContent(data.revised_content)
      setAiPrompt('')
      setShowAiRevise(false)
    } catch {
      setAiError('Failed to connect to AI')
    } finally {
      setAiRevising(false)
    }
  }

  const handleManualComplete = () => {
    if (action.status === 'completed') {
      onStatusChange(action.id, 'approved')
    } else {
      onStatusChange(action.id, 'completed')
    }
  }

  const getTextFromContent = (content: Record<string, unknown>): string => {
    if (typeof content === 'string') return content
    const c = content as Record<string, unknown>
    if (c.subject || c.body) return `Subject: ${c.subject || ''}\n\n${c.body || ''}`
    if (c.message) return String(c.message)
    if (c.body && typeof c.body === 'string') return c.body
    if (c.description) return String(c.description)
    if (Array.isArray(c.steps)) return c.steps.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : (s as Record<string, unknown>).description || JSON.stringify(s)}`).join('\n')
    if (c.actor_id) return `${c.description || c.actor_id}\nQueries: ${Array.isArray(c.queries) ? c.queries.join(', ') : ''}`
    return JSON.stringify(content, null, 2)
  }

  // ---------- Pipeline Progress Indicator ----------
  const renderPipeline = () => {
    const steps = ['Created', 'Reviewed', 'Approved', 'Executed']
    if (action.status === 'skipped') return null

    return (
      <div className="flex items-center gap-1 mr-3">
        {steps.map((step, i) => {
          const isComplete = pipelineStep >= i
          // "Reviewed" (step 1) is always complete when approved or completed
          const isReviewed = i === 1 && pipelineStep >= 2
          const active = isComplete || isReviewed
          return (
            <div key={step} className="flex items-center gap-1">
              <div
                title={step}
                className={`w-2 h-2 rounded-full transition-all ${active
                  ? i === 3
                    ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
                    : 'bg-primary-500 shadow-[0_0_4px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-300 dark:bg-slate-600'
                  }`}
              />
              {i < steps.length - 1 && (
                <div className={`w-3 h-px ${active ? 'bg-primary-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ---------- Content Renderers ----------
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
      const guidance = c.guidance ? String(c.guidance) : null
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
        <div className="space-y-2">
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
          {guidance && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">External Action Required</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">{guidance}</p>
            </div>
          )}
          {estTime && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Est. time: {estTime}
            </div>
          )}
        </div>
      )
    }

    // Fallback
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

  // ---------- Execution Result Banner ----------
  const renderExecutionResult = () => {
    const result = (action as unknown as Record<string, unknown>).execution_result as Record<string, unknown> | undefined
    if (!result || action.status !== 'completed') return null

    return (
      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {String(result.message || 'Executed successfully')}
          </span>
        </div>
      </div>
    )
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
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isEditing) setIsExpanded(!isExpanded) } }}
      >
        {/* Manual completion checkbox for manual/social tasks in execute mode */}
        {mode === 'execute' && isManualTask(action.action_type) && (
          <button
            onClick={(e) => { e.stopPropagation(); handleManualComplete(); }}
            className="flex-shrink-0 focus:outline-none"
            title={action.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
          >
            {action.status === 'completed' ? (
              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Square className="h-5 w-5 text-slate-400 hover:text-green-500 transition-colors" />
            )}
          </button>
        )}

        {/* Channel badge */}
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${channel.color}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {channel.label}
        </span>

        {/* Pipeline progress dots */}
        {renderPipeline()}

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
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Approved</span>
        )}
        {action.status === 'completed' && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" /> Done
          </span>
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
          {renderExecutionResult()}

          {/* AI Advise & Revise Panel */}
          {showAiRevise && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg animate-slide-down" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Advise & Revise</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                Tell the AI how to improve this content. e.g. &quot;Make it less salesy&quot; or &quot;Add urgency&quot;
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !aiRevising) handleAiRevise() }}
                  placeholder="e.g. Tone it down, make it more conversational..."
                  className="flex-1 px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-400"
                  disabled={aiRevising}
                  autoFocus
                />
                <button
                  onClick={handleAiRevise}
                  disabled={aiRevising || !aiPrompt.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiRevising ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Revising...</>
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Revise</>
                  )}
                </button>
                <button
                  onClick={() => { setShowAiRevise(false); setAiPrompt(''); setAiError(null) }}
                  className="px-2 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {aiError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{aiError}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {/* ===== REVIEW MODE BUTTONS ===== */}
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
                {campaignId && (action.action_type === 'email_draft' || action.action_type === 'social_post' || action.action_type === 'scrape_config') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAiRevise(!showAiRevise) }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showAiRevise ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700' : 'border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI Revise
                  </button>
                )}

                {/* Auto-executable actions get an Execute button even in review mode if approved */}
                {isAutoExecutable(action.action_type) && action.status === 'approved' && onExecute && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExecute() }}
                    disabled={executing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {executing ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Executing...</>
                    ) : (
                      <><Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Execute</>
                    )}
                  </button>
                )}
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

            {/* ===== EXECUTE MODE BUTTONS ===== */}
            {mode === 'execute' && action.status !== 'completed' && (
              <>
                {/* Auto-executable actions get an Execute button */}
                {isAutoExecutable(action.action_type) && action.status === 'approved' && onExecute && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExecute() }}
                    disabled={executing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Executing...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Execute
                      </>
                    )}
                  </button>
                )}

                {/* Copy button for all types */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const text = getTextFromContent(action.content as Record<string, unknown>)
                    navigator.clipboard.writeText(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                {/* AI Revise in execute mode */}
                {campaignId && (action.action_type === 'email_draft' || action.action_type === 'social_post' || action.action_type === 'scrape_config') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAiRevise(!showAiRevise) }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showAiRevise ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700' : 'border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI Revise
                  </button>
                )}

                {/* Manual complete for non-auto-exec tasks */}
                {!isManualTask(action.action_type) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'completed') }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Mark Complete
                  </button>
                )}
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

            {/* ===== EDIT MODE BUTTONS ===== */}
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
