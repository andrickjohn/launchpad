'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface AIProcessingIndicatorProps {
  modelName: string
  progressText?: string
  className?: string
  estimatedSeconds?: number
}

export default function AIProcessingIndicator({
  modelName,
  progressText,
  className = '',
  estimatedSeconds = 25,
}: AIProcessingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Progress curve: fast at first, slows near end, never reaches 100%
  const rawProgress = 1 - Math.exp(-elapsed / (estimatedSeconds * 0.6))
  const progress = Math.min(rawProgress * 95, 97) // Cap at 97%

  const remaining = Math.max(0, estimatedSeconds - elapsed)
  const etaText = elapsed < estimatedSeconds
    ? `~${remaining}s remaining`
    : 'Almost done...'

  return (
    <div
      className={`rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-5 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-pulse" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
            {progressText || 'Processing...'}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400">
            Powered by {modelName}
          </p>
        </div>
        <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
          {etaText}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-primary-100 dark:bg-primary-900/40 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="AI processing progress"
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-primary-500 dark:text-primary-400">{Math.round(progress)}%</span>
        <span className="text-[10px] text-primary-500 dark:text-primary-400">{elapsed}s elapsed</span>
      </div>
    </div>
  )
}
