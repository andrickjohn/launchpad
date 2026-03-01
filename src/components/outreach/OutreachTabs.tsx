'use client'

import { useState } from 'react'
import { Mail, FileText, Calendar, MessageSquare, LayoutTemplate } from 'lucide-react'
import EmailComposer from './EmailComposer'
import DraftQueue from './DraftQueue'
import SequenceBuilder from './SequenceBuilder'
import SocialDrafts from './SocialDrafts'
import TemplateLibrary from './TemplateLibrary'
import type { Outreach, Template } from '@/lib/types/database'

type Tab = 'composer' | 'drafts' | 'sequences' | 'social' | 'templates'

interface OutreachTabsProps {
  initialDrafts: Outreach[]
  initialScheduled: Outreach[]
  initialTemplates: Template[]
  prospects: Array<{ id: string; name: string | null; email: string; company: string | null }>
}

export default function OutreachTabs({
  initialDrafts,
  initialScheduled,
  initialTemplates,
  prospects,
}: OutreachTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('composer')
  const [drafts, setDrafts] = useState(initialDrafts)
  const [templates, setTemplates] = useState(initialTemplates)

  const tabs = [
    { id: 'composer' as Tab, label: 'Email Composer', icon: Mail },
    { id: 'drafts' as Tab, label: 'Draft Queue', icon: FileText, badge: drafts.length },
    { id: 'sequences' as Tab, label: 'Sequences', icon: Calendar },
    { id: 'social' as Tab, label: 'Social Drafts', icon: MessageSquare },
    { id: 'templates' as Tab, label: 'Templates', icon: LayoutTemplate, badge: templates.length },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div role="tablist" aria-label="Outreach sections" className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full"
                    aria-label={`${tab.badge} ${tab.id === 'drafts' ? 'drafts pending' : 'templates'}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <div
          role="tabpanel"
          id="panel-composer"
          aria-labelledby="tab-composer"
          hidden={activeTab !== 'composer'}
        >
          <EmailComposer prospects={prospects} templates={templates} />
        </div>
        <div
          role="tabpanel"
          id="panel-drafts"
          aria-labelledby="tab-drafts"
          hidden={activeTab !== 'drafts'}
        >
          <DraftQueue drafts={drafts} setDrafts={setDrafts} />
        </div>
        <div
          role="tabpanel"
          id="panel-sequences"
          aria-labelledby="tab-sequences"
          hidden={activeTab !== 'sequences'}
        >
          <SequenceBuilder prospects={prospects} templates={templates} />
        </div>
        <div
          role="tabpanel"
          id="panel-social"
          aria-labelledby="tab-social"
          hidden={activeTab !== 'social'}
        >
          <SocialDrafts prospects={prospects} />
        </div>
        <div
          role="tabpanel"
          id="panel-templates"
          aria-labelledby="tab-templates"
          hidden={activeTab !== 'templates'}
        >
          <TemplateLibrary templates={templates} setTemplates={setTemplates} />
        </div>
      </div>
    </div>
  )
}
