import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Campaign | LaunchPad',
  description: 'Create a new campaign with AI-powered launch brief',
}

const CampaignWizard = dynamic(() => import('@/components/campaigns/CampaignWizard'), {
  loading: () => (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="flex gap-4 justify-center">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
        ))}
      </div>
      <div className="space-y-4 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  ),
})

export default function NewCampaignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CampaignWizard />
    </div>
  )
}
