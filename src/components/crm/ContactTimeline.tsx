'use client'

import { format } from 'date-fns'
import { ContactTimelineEvent } from '@/lib/db/crm'
import { CheckCircle2, Mail, MessageSquare, Briefcase, Activity } from 'lucide-react'

interface TimelineProps {
    events: ContactTimelineEvent[]
}

export default function ContactTimeline({ events }: TimelineProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">No activity recorded for this contact yet.</p>
            </div>
        )
    }

    const getEventIcon = (type: string, title: string) => {
        const t = title.toLowerCase()
        if (type === 'outreach' || t.includes('email')) return <Mail className="h-4 w-4 text-blue-500" />
        if (t.includes('respond') || t.includes('reply')) return <MessageSquare className="h-4 w-4 text-purple-500" />
        if (t.includes('create') || t.includes('add')) return <Briefcase className="h-4 w-4 text-emerald-500" />
        return <CheckCircle2 className="h-4 w-4 text-slate-400" />
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {events.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                                        {getEventIcon(event.type, event.title)}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {event.title}
                                        </p>
                                        <p className="mt-1 flex text-xs text-slate-500 dark:text-slate-400">
                                            {event.description}
                                        </p>
                                        {/* Expandable metadata for full email bodies or notes could go here */}
                                        {event.type === 'outreach' && event.metadata && (
                                            <div className="mt-2 text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-r-md text-slate-600 dark:text-slate-300">
                                                {Boolean(event.metadata.status) && (
                                                    <span className="font-semibold block mb-1 uppercase text-[10px] tracking-wider text-slate-400">
                                                        Status: {String(event.metadata.status)}
                                                    </span>
                                                )}
                                                {Boolean(event.metadata.body) && (
                                                    <div className="whitespace-pre-wrap line-clamp-3" dangerouslySetInnerHTML={{ __html: String(event.metadata.body) }} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap text-right text-xs text-slate-500 dark:text-slate-400">
                                        <time dateTime={event.date}>{format(new Date(event.date), 'MMM d, h:mm a')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
