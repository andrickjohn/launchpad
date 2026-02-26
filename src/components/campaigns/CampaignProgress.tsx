'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ArrowRight, HelpCircle, Target, Users, Mail, TrendingUp } from 'lucide-react'

interface CampaignProgressProps {
  campaignId?: string
  prospectCount: number
  scoredCount: number
  contactedCount: number
  respondedCount: number
}

const steps = [
  {
    id: 'setup',
    title: 'Campaign Setup',
    description: 'Create campaign with AI-generated launch brief',
    icon: Target,
    color: 'blue',
    explanation: 'Start by describing your product and target buyer. AI analyzes and generates a full GTM strategy with ranked channels, estimated volumes, and a first-week action plan.',
  },
  {
    id: 'prospects',
    title: 'Add Prospects',
    description: 'Import CSV or add manually',
    icon: Users,
    color: 'purple',
    explanation: 'Import prospects from Apify scrapes, CSV files, or add manually. Supports any format - dentists, GovCon contacts, YouTubers, anyone.',
  },
  {
    id: 'score',
    title: 'Score Prospects',
    description: 'AI analyzes and ranks prospects 0-100',
    icon: TrendingUp,
    color: 'green',
    explanation: 'AI scores each prospect based on data completeness, email quality, job title relevance, and engagement potential. Focus on high-value leads first.',
  },
  {
    id: 'outreach',
    title: 'Send Outreach',
    description: 'AI drafts, you approve, Resend sends',
    icon: Mail,
    color: 'orange',
    explanation: 'AI writes personalized cold emails per prospect. Review and approve drafts, then send via Resend (100 free/day). Track opens, replies, and conversions in real-time.',
  },
]

export default function CampaignProgress({
  campaignId,
  prospectCount,
  scoredCount,
  contactedCount,
  respondedCount,
}: CampaignProgressProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  // Determine completion status
  const hasSetup = !!campaignId
  const hasProspects = prospectCount > 0
  const hasScored = scoredCount > 0
  const hasSentOutreach = contactedCount > 0

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'setup':
        return hasSetup ? 'complete' : 'current'
      case 'prospects':
        return hasProspects ? 'complete' : hasSetup ? 'current' : 'upcoming'
      case 'score':
        return hasScored ? 'complete' : hasProspects ? 'current' : 'upcoming'
      case 'outreach':
        return hasSentOutreach ? 'complete' : hasScored ? 'current' : 'upcoming'
      default:
        return 'upcoming'
    }
  }

  const getColorClasses = (color: string, status: string) => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        complete: 'bg-blue-600 text-white',
        current: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-600',
        upcoming: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
      },
      purple: {
        complete: 'bg-purple-600 text-white',
        current: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 ring-2 ring-purple-600',
        upcoming: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
      },
      green: {
        complete: 'bg-green-600 text-white',
        current: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 ring-2 ring-green-600',
        upcoming: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
      },
      orange: {
        complete: 'bg-orange-600 text-white',
        current: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 ring-2 ring-orange-600',
        upcoming: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
      },
    }
    return colors[color]?.[status] || colors.blue[status]
  }

  const completedSteps = steps.filter(s => getStepStatus(s.id) === 'complete').length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header with Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Campaign Progress
          </h3>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completedSteps} of {steps.length} steps
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const Icon = step.icon
          const isExpanded = expandedStep === step.id
          const colorClasses = getColorClasses(step.color, status)

          return (
            <div key={step.id}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${colorClasses}`}>
                  {status === 'complete' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-semibold ${
                        status === 'complete' ? 'text-slate-900 dark:text-white' :
                        status === 'current' ? 'text-slate-900 dark:text-white' :
                        'text-slate-500 dark:text-slate-500'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        status === 'upcoming' ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Help Button */}
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                      className={`flex-shrink-0 p-1 rounded-lg transition-all ${
                        isExpanded
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Expanded Explanation */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 animate-slide-down">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  {status === 'complete' && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </div>
                  )}
                  {status === 'current' && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                      <Circle className="h-3 w-3 animate-pulse" />
                      In Progress
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-start ml-6 my-2">
                  <ArrowRight className={`h-5 w-5 ${
                    getStepStatus(steps[index + 1].id) !== 'upcoming'
                      ? 'text-slate-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      {prospectCount > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {prospectCount}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Prospects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {scoredCount}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Scored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {contactedCount}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Contacted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {respondedCount}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Responded</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
