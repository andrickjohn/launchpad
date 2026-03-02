'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Server, CheckCircle2, AlertCircle, Loader2, DollarSign } from 'lucide-react'
import type { ScrapeJob } from '@/lib/types/database'

interface ScrapeJobQueueProps {
    initialJobs: ScrapeJob[]
}

export default function ScrapeJobQueue({ initialJobs }: ScrapeJobQueueProps) {
    const [jobs, setJobs] = useState<ScrapeJob[]>(initialJobs)
    const supabase = createClient()

    // Subscribe to real-time updates on active jobs
    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'scrape_jobs',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setJobs((current) => [payload.new as ScrapeJob, ...current])
                    } else if (payload.eventType === 'UPDATE') {
                        setJobs((current) =>
                            current.map((job) =>
                                job.id === payload.new.id ? (payload.new as ScrapeJob) : job
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setJobs((current) => current.filter((job) => job.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    if (jobs.length === 0) return null

    // Calculate live running costs
    const totalCost = jobs.reduce((sum, job) => sum + Number(job.cost_usd || 0), 0)

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Active Scrape Jobs</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">
                        {jobs.length}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <DollarSign className="h-4 w-4" />
                    Total Est. Cost: ${totalCost.toFixed(2)}
                </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {jobs.map((job) => (
                    <div key={job.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {job.actor_id.split('/')[1] || job.actor_id}
                                </span>
                                {job.status === 'running' && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Running
                                    </span>
                                )}
                                {job.status === 'completed' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Completed
                                    </span>
                                )}
                                {job.status === 'failed' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                                        <AlertCircle className="h-3 w-3" />
                                        Failed
                                    </span>
                                )}
                                {job.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                        <Server className="h-3 w-3" />
                                        Pending
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span>Targeting {job.target_count || 'unknown'} leads</span>
                                <span>Job ID: {job.id.slice(0, 8)}...</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="block text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                                ${Number(job.cost_usd || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
