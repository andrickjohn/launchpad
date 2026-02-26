'use client'

import { Target, Users, Mail, TrendingUp, CheckCircle2, MessageSquare } from 'lucide-react'

interface DashboardOverviewProps {
  stats: {
    activeCampaigns: number
    totalProspects: number
    newProspects: number
    contactedProspects: number
    respondedProspects: number
    convertedProspects: number
    emailsSent: number
    emailsOpened: number
    emailsReplied: number
    responseRate: string
    openRate: string
    conversionRate: string
  }
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Prospects',
      value: stats.totalProspects,
      subtitle: `${stats.newProspects} new`,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Emails Sent',
      value: stats.emailsSent,
      subtitle: `${stats.emailsOpened} opened`,
      icon: Mail,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      subtitle: `${stats.emailsReplied} replies`,
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Open Rate',
      value: `${stats.openRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      title: 'Conversions',
      value: stats.convertedProspects,
      subtitle: `${stats.conversionRate}% rate`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</p>
            {card.subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.subtitle}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
