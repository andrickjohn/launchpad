'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Trash2, AlertCircle, Eye, CheckCircle2, Activity } from 'lucide-react'
import type { Campaign, CampaignActionStats } from '@/lib/types/database'
import { useToast } from '@/components/ui/Toast'

interface ActiveCampaignCardProps {
    campaign: Campaign
    initialStats?: CampaignActionStats
}

export default function ActiveCampaignCard({ campaign, initialStats }: ActiveCampaignCardProps) {
    const router = useRouter()
    const { success, error } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // We accept initialStats from server, but also allow client state 
    // (if we wanted to poll or refresh them later)
    const stats = initialStats || { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, skipped: 0 }

    // Calculate completion percentage
    const total = stats.total || 0
    const actionable = stats.approved + stats.completed + stats.rejected + stats.skipped
    const percentComplete = total > 0 ? Math.round((stats.completed / total) * 100) : 0
    const percentActionable = total > 0 ? Math.round((actionable / total) * 100) : 0

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true)
            setTimeout(() => setShowConfirm(false), 3000)
            return
        }

        try {
            setIsDeleting(true)
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete campaign')

            success('Active campaign deleted')
            router.refresh()
        } catch (err) {
            console.error(err)
            error('Failed to delete campaign')
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <li className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800">

            {/* Top Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">

                {/* Title and Badge */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {campaign.name}
                        </h3>
                        {campaign.launch_brief && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-full">
                                <Sparkles className="h-3 w-3" aria-hidden="true" />
                                AI Generated
                            </span>
                        )}
                    </div>

                    {campaign.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                            {campaign.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-700 dark:text-emerald-400">Campaign Activated</span>
                        </span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                        <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 ${showConfirm
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-inner'
                            : 'text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                            }`}
                        aria-label={showConfirm ? "Confirm delete campaign" : "Delete campaign"}
                    >
                        {showConfirm ? (
                            <>
                                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                Confirm Delete?
                            </>
                        ) : (
                            <Trash2 className="h-4 w-4 border-none" aria-hidden="true" />
                        )}
                    </button>

                    <Link
                        href={`/campaigns/${campaign.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View Brief
                    </Link>

                    <Link
                        href={`/campaigns/${campaign.id}/review`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Review Actions
                    </Link>

                    <Link
                        href={`/campaigns/${campaign.id}/mission-control`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Activity className="h-4 w-4" aria-hidden="true" />
                        Mission Control
                    </Link>
                </div>
            </div>

            {/* Status Bar Bottom Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 px-5">

                {/* Stats Text */}
                <div className="flex items-center justify-between mb-2 text-sm">
                    <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{total} Actions Total</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-purple-600 dark:text-purple-400">{stats.approved} Approved</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-emerald-600 dark:text-emerald-500">{stats.completed} Completed</span>
                    </div>

                </div>

                {/* Visual Progress Bar Component */}
                <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    {/* Approved Segment (Purple) */}
                    <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${percentActionable - percentComplete}%` }}
                    />
                    {/* Completed Segment (Emerald) */}
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percentComplete}%` }}
                    />
                </div>
            </div>
        </li>
    )
}
