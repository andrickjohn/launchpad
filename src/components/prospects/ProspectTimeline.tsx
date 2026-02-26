'use client'

import { Prospect, Outreach } from '@/lib/types/database'
import { Mail, Linkedin, MessageSquare, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

interface ProspectTimelineProps {
  prospect: Prospect
  outreach: Outreach[]
}

export default function ProspectTimeline({ prospect, outreach }: ProspectTimelineProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-5 h-5" />
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />
      case 'reddit':
      case 'facebook':
        return <MessageSquare className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'opened':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'replied':
        return <CheckCircle className="w-5 h-5 text-purple-500" />
      case 'bounced':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'draft':
        return <Calendar className="w-5 h-5 text-slate-400" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'opened':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'replied':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'bounced':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'scheduled':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'draft':
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Combine outreach with prospect creation as timeline events
  type TimelineEvent = {
    type: 'prospect_created' | 'outreach'
    date: string
    title: string
    description: string
    body?: string
    status?: string
    channel?: string
    outreachData?: Outreach
  }

  const timelineEvents: TimelineEvent[] = [
    {
      type: 'prospect_created' as const,
      date: prospect.created_at,
      title: 'Prospect Added',
      description: 'Added to prospects list',
    },
    ...outreach.map((item): TimelineEvent => ({
      type: 'outreach',
      date: item.sent_at || item.scheduled_at || item.created_at,
      title: `${item.channel.charAt(0).toUpperCase() + item.channel.slice(1)} ${item.status}`,
      description: item.subject || 'No subject',
      body: item.body,
      status: item.status,
      channel: item.channel,
      outreachData: item,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No activity yet</p>
        <p className="text-sm mt-2">Send your first outreach message to start building a relationship.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {timelineEvents.map((event, index) => (
        <div key={index} className="relative">
          {/* Timeline line */}
          {index < timelineEvents.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Event card */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              event.type === 'prospect_created'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : event.status
                ? getStatusColor(event.status)
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {event.type === 'prospect_created' ? (
                <CheckCircle className="w-6 h-6" />
              ) : event.channel ? (
                getChannelIcon(event.channel)
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 border rounded-lg p-4 ${
              event.type === 'prospect_created'
                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                : event.status
                ? getStatusColor(event.status)
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {event.title}
                  </h3>
                  {event.status && (
                    <div className="flex items-center gap-1">
                      {getStatusIcon(event.status)}
                    </div>
                  )}
                </div>
                <time className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(event.date)}
                </time>
              </div>

              {event.description && (
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  {event.description}
                </p>
              )}

              {event.body && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                    {event.body}
                  </p>
                </div>
              )}

              {event.outreachData && (
                <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {event.outreachData.opened_at && (
                    <span>Opened: {formatDate(event.outreachData.opened_at)}</span>
                  )}
                  {event.outreachData.replied_at && (
                    <span>Replied: {formatDate(event.outreachData.replied_at)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
