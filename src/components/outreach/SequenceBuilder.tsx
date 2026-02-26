'use client'

import { Plus } from 'lucide-react'
import type { Template } from '@/lib/types/database'

interface SequenceBuilderProps {
  prospects: Array<{ id: string; name: string | null; email: string }>
  templates: Template[]
}

export default function SequenceBuilder({ prospects, templates }: SequenceBuilderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
      <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        Email Sequences (Coming Soon)
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Create 3-step automated email drip sequences with scheduling
      </p>
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Create Sequence
      </button>
    </div>
  )
}
