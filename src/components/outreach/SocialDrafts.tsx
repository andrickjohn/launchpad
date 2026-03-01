'use client'

import { useState } from 'react'
import { Linkedin, MessageCircle, Facebook, Sparkles, Copy } from 'lucide-react'

interface SocialDraftsProps {
  prospects: Array<{ id: string; name: string | null; email: string }>
}

export default function SocialDrafts({ prospects }: SocialDraftsProps) {
  const [platform, setPlatform] = useState<'linkedin' | 'reddit' | 'facebook'>('linkedin')
  const [draft, setDraft] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    alert('Copied to clipboard!')
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Social Drafts
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        AI drafts social messages. Copy and paste manually - no automation that violates TOS.
      </p>

      <div role="group" aria-label="Select platform" className="flex gap-4 mb-6">
        <button
          onClick={() => setPlatform('linkedin')}
          aria-pressed={platform === 'linkedin'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'linkedin'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Linkedin className="h-5 w-5" aria-hidden="true" />
          LinkedIn
        </button>
        <button
          onClick={() => setPlatform('reddit')}
          aria-pressed={platform === 'reddit'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'reddit'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Reddit
        </button>
        <button
          onClick={() => setPlatform('facebook')}
          aria-pressed={platform === 'facebook'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'facebook'
              ? 'bg-blue-700 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Facebook className="h-5 w-5" aria-hidden="true" />
          Facebook
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="social-draft-message"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Message
          </label>
          <textarea
            id="social-draft-message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Write your ${platform} message...`}
            rows={8}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3">
          {/* AI Draft is not yet implemented — disabled until the feature is built */}
          <button
            disabled
            aria-disabled="true"
            title="AI Draft coming soon"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg opacity-50 cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            AI Draft
          </button>
          <button
            onClick={handleCopy}
            disabled={!draft}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Copy className="h-5 w-5" aria-hidden="true" />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  )
}
