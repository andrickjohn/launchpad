'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import AIProcessingIndicator from '@/components/ui/AIProcessingIndicator'
import { useToast } from '@/components/ui/Toast'
import Toast from '@/components/ui/Toast'
import { CLAUDE_MODELS, estimateFeatureCost, getModelForFeature } from '@/lib/ai/models'

interface ActivateCampaignButtonProps {
  campaignId: string
}

export default function ActivateCampaignButton({ campaignId }: ActivateCampaignButtonProps) {
  const router = useRouter()
  const { toasts, removeToast, error } = useToast()
  const [isActivating, setIsActivating] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)
  const [isMigrationError, setIsMigrationError] = useState(false)

  const modelTier = getModelForFeature('campaignActivation')
  const model = CLAUDE_MODELS[modelTier]
  const cost = estimateFeatureCost('campaignActivation', modelTier)

  const handleActivate = async () => {
    setIsActivating(true)
    setActivationError(null)
    setIsMigrationError(false)

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_tier: modelTier }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.migration_needed) {
          setIsMigrationError(true)
          setActivationError(data.error)
          setIsActivating(false)
          return
        }
        throw new Error(data.error || 'Failed to activate campaign')
      }

      router.push(`/campaigns/${campaignId}/review`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate campaign'
      setActivationError(message)
      error(message)
      setIsActivating(false)
    }
  }

  if (isActivating) {
    return (
      <AIProcessingIndicator
        modelName={model.name}
        progressText="Generating your campaign plan — emails, social posts, tasks..."
        estimatedSeconds={30}
        className="mt-6"
      />
    )
  }

  return (
    <div className="mt-6">
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Migration Error Banner */}
      {isMigrationError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Database Migration Required
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            The campaign_actions table needs to be created. Run the migration SQL in the{' '}
            <a
              href={`https://supabase.com/dashboard/project/xlskskaecxooczbpebui/sql/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Supabase SQL Editor
            </a>
            , then try again.
          </p>
        </div>
      )}

      {/* Generic Error Banner */}
      {activationError && !isMigrationError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{activationError}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Ready to Activate
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Turn your launch brief into executable action items — cold emails, social posts,
          scrape configs, and daily tasks for the first 7 days.
        </p>

        <button
          onClick={handleActivate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
        >
          <Zap className="h-5 w-5" aria-hidden="true" />
          Activate Campaign
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Powered by {model.name} &middot; Estimated cost: {cost}
        </p>
      </div>
    </div>
  )
}
