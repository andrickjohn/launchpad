'use client'

import { useState } from 'react'
import { Send, Sparkles, Loader2, Save, Calendar } from 'lucide-react'
import type { Template } from '@/lib/types/database'

interface EmailComposerProps {
  prospects: Array<{ id: string; name: string | null; email: string; company: string | null }>
  templates: Template[]
}

export default function EmailComposer({ prospects, templates }: EmailComposerProps) {
  const [prospectId, setProspectId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isDrafting, setIsDrafting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const selectedProspect = prospects.find((p) => p.id === prospectId)

  const handleAIDraft = async () => {
    if (!prospectId) {
      alert('Please select a prospect first')
      return
    }

    setIsDrafting(true)
    try {
      const response = await fetch('/api/outreach/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_id: prospectId }),
      })

      if (!response.ok) throw new Error('Failed to draft email')

      const data = await response.json()
      setSubject(data.subject)
      setBody(data.body)
    } catch (error) {
      console.error('Error drafting email:', error)
      alert('Failed to draft email. Please try again.')
    } finally {
      setIsDrafting(false)
    }
  }

  const handleSend = async () => {
    if (!prospectId || !subject || !body) {
      alert('Please fill in all required fields')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: prospectId,
          subject,
          body,
          scheduled_at: scheduledAt || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to send email')

      alert(scheduledAt ? 'Email scheduled successfully!' : 'Email sent successfully!')
      setProspectId('')
      setSubject('')
      setBody('')
      setScheduledAt('')
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!prospectId || !body) {
      alert('Please select a prospect and write a message')
      return
    }

    setIsSavingDraft(true)
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: prospectId,
          channel: 'email',
          status: 'draft',
          subject,
          body,
        }),
      })

      if (!response.ok) throw new Error('Failed to save draft')

      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleLoadTemplate = (template: Template) => {
    let templateSubject = template.subject || ''
    let templateBody = template.body

    if (selectedProspect) {
      templateSubject = templateSubject
        .replace(/\{\{name\}\}/g, selectedProspect.name || selectedProspect.email)
        .replace(/\{\{email\}\}/g, selectedProspect.email)
        .replace(/\{\{company\}\}/g, selectedProspect.company || '')

      templateBody = templateBody
        .replace(/\{\{name\}\}/g, selectedProspect.name || selectedProspect.email)
        .replace(/\{\{email\}\}/g, selectedProspect.email)
        .replace(/\{\{company\}\}/g, selectedProspect.company || '')
    }

    setSubject(templateSubject)
    setBody(templateBody)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Composer */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Compose Email
          </h2>

          <div className="space-y-4">
            {/* Prospect Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                To *
              </label>
              <select
                value={prospectId}
                onChange={(e) => setProspectId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select prospect...</option>
                {prospects.map((prospect) => (
                  <option key={prospect.id} value={prospect.id}>
                    {prospect.name || prospect.email} {prospect.company ? `(${prospect.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message *
                </label>
                <button
                  onClick={handleAIDraft}
                  disabled={!prospectId || isDrafting}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isDrafting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Draft
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message..."
                rows={12}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>

            {/* Schedule (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Schedule For (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSend}
                disabled={!prospectId || !subject || !body || isSending}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {scheduledAt ? 'Scheduling...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    {scheduledAt ? <Calendar className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    {scheduledAt ? 'Schedule Email' : 'Send Now'}
                  </>
                )}
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!prospectId || !body || isSavingDraft}
                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Sidebar */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Templates
          </h3>
          <div className="space-y-2">
            {templates.slice(0, 5).map((template) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="font-medium text-sm text-slate-900 dark:text-white">
                  {template.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used {template.usage_count || 0} times
                </div>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No templates yet. Create one in the Templates tab!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
