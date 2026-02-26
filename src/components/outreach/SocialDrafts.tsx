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

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setPlatform('linkedin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'linkedin'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Linkedin className="h-5 w-5" />
          LinkedIn
        </button>
        <button
          onClick={() => setPlatform('reddit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'reddit'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          Reddit
        </button>
        <button
          onClick={() => setPlatform('facebook')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            platform === 'facebook'
              ? 'bg-blue-700 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Facebook className="h-5 w-5" />
          Facebook
        </button>
      </div>

      <div className="space-y-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Write your ${platform} message...`}
          rows={8}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />

        <div className="flex gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            AI Draft
          </button>
          <button
            onClick={handleCopy}
            disabled={!draft}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Copy className="h-5 w-5" />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  )
}
