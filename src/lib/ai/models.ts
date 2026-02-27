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
    id: 'claude-sonnet-4-6-20260201',
    name: 'Claude Sonnet 4.6',
    tier: 'sonnet',
    version: '4.6 (Feb 2026)',
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
  prospectScoring: 'haiku' as ModelTier, // Simple scoring
  prospectSimilarity: 'haiku' as ModelTier, // Pattern matching
  emailDrafting: 'haiku' as ModelTier, // Simple drafting
  socialDrafting: 'haiku' as ModelTier, // Simple drafting
} as const

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
