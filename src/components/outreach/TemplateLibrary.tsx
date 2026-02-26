'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Template } from '@/lib/types/database'

interface TemplateLibraryProps {
  templates: Template[]
  setTemplates: (templates: Template[]) => void
}

export default function TemplateLibrary({ templates, setTemplates }: TemplateLibraryProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<'email' | 'linkedin' | 'reddit' | 'facebook'>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleCreate = async () => {
    if (!name || !body) {
      alert('Please fill in required fields')
      return
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, channel, subject, body }),
      })

      if (!response.ok) throw new Error('Failed to create template')

      const data = await response.json()
      setTemplates([...templates, data.template])
      setIsCreating(false)
      setName('')
      setSubject('')
      setBody('')
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setTemplates(templates.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Template Library
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Template
        </button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create Template
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cold Outreach V1"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="reddit">Reddit</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            {channel === 'email' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Use {{name}}, {{company}} for variables"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Body *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Use {{name}}, {{company}}, {{email}} for variables"
                rows={8}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Template
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {template.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {template.channel.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Used {template.usage_count || 0} times
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(template.id)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {template.subject && (
              <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-2">
                Subject: {template.subject}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 rounded p-3">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                {template.body}
              </pre>
            </div>
          </div>
        ))}

        {templates.length === 0 && !isCreating && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No templates yet. Click "New Template" to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
