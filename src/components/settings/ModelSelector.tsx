'use client'

import { useState, useEffect } from 'react'
import { Cpu } from 'lucide-react'
import {
  CLAUDE_MODELS,
  MODEL_ASSIGNMENTS,
  FEATURE_LABELS,
  estimateFeatureCost,
  type ModelTier,
  type FeatureKey,
} from '@/lib/ai/models'

const STORAGE_KEY = 'launchpad_model_overrides'

export default function ModelSelector() {
  const [overrides, setOverrides] = useState<Partial<Record<FeatureKey, ModelTier>>>({})

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      setOverrides(stored)
    } catch {
      // ignore
    }
  }, [])

  const handleChange = (feature: FeatureKey, tier: ModelTier | 'default') => {
    const next = { ...overrides }
    if (tier === 'default') {
      delete next[feature]
    } else {
      next[feature] = tier
    }
    setOverrides(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const features = Object.keys(MODEL_ASSIGNMENTS) as FeatureKey[]
  const tiers: ModelTier[] = ['haiku', 'sonnet', 'opus']

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
          <Cpu className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            AI Models
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose which model powers each AI feature
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature) => {
          const defaultTier = MODEL_ASSIGNMENTS[feature]
          const currentTier = overrides[feature] || defaultTier
          const cost = estimateFeatureCost(feature, currentTier)

          return (
            <div key={feature} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`model-${feature}`}
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {FEATURE_LABELS[feature]}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Default: {CLAUDE_MODELS[defaultTier].name} &middot; Est. {cost}/call
                </p>
              </div>
              <select
                id={`model-${feature}`}
                value={overrides[feature] || 'default'}
                onChange={(e) => handleChange(feature, e.target.value as ModelTier | 'default')}
                className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="default">
                  Default ({CLAUDE_MODELS[defaultTier].name})
                </option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {CLAUDE_MODELS[tier].name} — {estimateFeatureCost(feature, tier)}/call
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-900 dark:text-green-200">
          <strong>Cost tip:</strong> Haiku is 12x cheaper than Sonnet for simple tasks. Use Sonnet or Opus
          for complex content generation (launch briefs, campaign activation) where quality matters.
        </p>
      </div>
    </div>
  )
}
