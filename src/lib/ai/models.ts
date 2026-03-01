/**
 * AI Model Configuration
 * Automatically maps model tiers (Haiku, Sonnet, Opus) to latest versions
 */

export type ModelTier = 'haiku' | 'sonnet' | 'opus'

export interface ModelInfo {
  id: string
  name: string
  tier: ModelTier
  version: string
  costPer1MTokens: {
    input: number
    output: number
  }
  description: string
  bestFor: string[]
}

/**
 * Latest Claude models as of February 2026
 * Update these when new models are released
 */
export const CLAUDE_MODELS: Record<ModelTier, ModelInfo> = {
  haiku: {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    tier: 'haiku',
    version: '3.5 (Oct 2024)',
    costPer1MTokens: {
      input: 0.25,
      output: 1.25,
    },
    description: 'Fast and efficient for simple tasks',
    bestFor: ['Prospect scoring', 'Email drafting', 'Quick assists'],
  },
  sonnet: {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    tier: 'sonnet',
    version: '4.6 (Latest)',
    costPer1MTokens: {
      input: 3.0,
      output: 15.0,
    },
    description: 'Balanced intelligence and speed',
    bestFor: ['Launch strategies', 'Market analysis', 'Complex reasoning'],
  },
  opus: {
    id: 'claude-opus-4-20260115',
    name: 'Claude Opus 4',
    tier: 'opus',
    version: '4.0 (Jan 2026)',
    costPer1MTokens: {
      input: 15.0,
      output: 75.0,
    },
    description: 'Most intelligent for critical tasks',
    bestFor: ['Strategic planning', 'Deep analysis', 'Critical decisions'],
  },
}

/**
 * Default model assignments for each feature
 */
export const MODEL_ASSIGNMENTS = {
  launchBrief: 'sonnet' as ModelTier, // Complex GTM strategy
  campaignActivation: 'sonnet' as ModelTier, // Complex content generation
  prospectScoring: 'haiku' as ModelTier, // Simple scoring
  prospectSimilarity: 'haiku' as ModelTier, // Pattern matching
  emailDrafting: 'haiku' as ModelTier, // Simple drafting
  socialDrafting: 'haiku' as ModelTier, // Simple drafting
} as const

export type FeatureKey = keyof typeof MODEL_ASSIGNMENTS

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  launchBrief: 'Launch Brief Generation',
  campaignActivation: 'Campaign Activation',
  prospectScoring: 'Prospect Scoring',
  prospectSimilarity: 'Prospect Similarity',
  emailDrafting: 'Email Drafting',
  socialDrafting: 'Social Drafting',
}

export const FEATURE_COST_ESTIMATES: Record<FeatureKey, string> = {
  launchBrief: '~2K input + ~4K output',
  campaignActivation: '~3K input + ~6K output',
  prospectScoring: '~500 input + ~200 output per prospect',
  prospectSimilarity: '~500 input + ~300 output',
  emailDrafting: '~300 input + ~200 output per email',
  socialDrafting: '~300 input + ~200 output per post',
}

/**
 * Get the model ID for a specific tier
 */
export function getModelId(tier: ModelTier): string {
  return CLAUDE_MODELS[tier].id
}

/**
 * Get full model info for a tier
 */
export function getModelInfo(tier: ModelTier): ModelInfo {
  return CLAUDE_MODELS[tier]
}

/**
 * Get all available models
 */
export function getAllModels(): ModelInfo[] {
  return Object.values(CLAUDE_MODELS)
}

/**
 * Get model tier from ID (for display purposes)
 */
export function getModelTierFromId(modelId: string): ModelTier | null {
  const entry = Object.entries(CLAUDE_MODELS).find(([_, info]) => info.id === modelId)
  return entry ? (entry[0] as ModelTier) : null
}

/**
 * Get model tier for a feature, checking user override first.
 * Server-side: always returns default (overrides are client-side only).
 * Client-side: checks localStorage for user preference.
 */
export function getModelForFeature(feature: FeatureKey): ModelTier {
  if (typeof window !== 'undefined') {
    try {
      const overrides = JSON.parse(localStorage.getItem('launchpad_model_overrides') || '{}')
      if (overrides[feature] && CLAUDE_MODELS[overrides[feature] as ModelTier]) {
        return overrides[feature] as ModelTier
      }
    } catch {
      // Invalid localStorage data — fall through to default
    }
  }
  return MODEL_ASSIGNMENTS[feature]
}

/**
 * Estimate cost for a feature call based on model tier and typical token usage
 */
export function estimateFeatureCost(feature: FeatureKey, tier?: ModelTier): string {
  const modelTier = tier || MODEL_ASSIGNMENTS[feature]
  const model = CLAUDE_MODELS[modelTier]
  // Rough estimates based on typical usage patterns
  const estimates: Record<FeatureKey, { input: number; output: number }> = {
    launchBrief: { input: 2000, output: 4000 },
    campaignActivation: { input: 3000, output: 6000 },
    prospectScoring: { input: 500, output: 200 },
    prospectSimilarity: { input: 500, output: 300 },
    emailDrafting: { input: 300, output: 200 },
    socialDrafting: { input: 300, output: 200 },
  }
  const usage = estimates[feature]
  const cost = (usage.input / 1_000_000) * model.costPer1MTokens.input +
    (usage.output / 1_000_000) * model.costPer1MTokens.output
  if (cost < 0.01) return '<$0.01'
  return `~$${cost.toFixed(2)}`
}
