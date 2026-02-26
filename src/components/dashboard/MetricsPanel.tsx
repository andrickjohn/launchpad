'use client'

import { Award, TrendingUp } from 'lucide-react'
import type { Template } from '@/lib/types/database'

interface MetricsPanelProps {
  stats: {
    responseRate: string
    openRate: string
    conversionRate: string
  }
  templates: Template[]
}

export default function MetricsPanel({ stats, templates }: MetricsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Key Metrics</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Response Rate
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {stats.responseRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(stats.responseRate), 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Open Rate
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {stats.openRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(stats.openRate), 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Conversion Rate
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {stats.conversionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(stats.conversionRate), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Templates */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Top Performing Templates
          </h3>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No templates yet. Create one in the Outreach tab!
          </p>
        ) : (
          <div className="space-y-4">
            {templates.map((template, i) => (
              <div key={template.id} className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {template.channel.toUpperCase()} · Used {template.usage_count || 0} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
